/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * terminal device string, eg: website, pc
 * @typedef {string} TerminalDevice
 */

/**
 * adapter key, eg: appKey@terminalDevice
 * @typedef {string} MicroAdapter
 */

/**
 * micro webapp entry hash group, eg: {
 *     base, [lang1], [lang2], [langN], [theme1], [theme2], [themeN]
 * }
 * @typedef {object<string, string>} MicroHash
 */

/**
 * micro webapp status，hash，alive keeper
 * @typedef {object} MicroKeeper
 * @property {string} appKey - micro webapp appKey
 * @property {string[]} tdList - terminal device list
 * @property {object} hash - { timeout:int, etag:string, url:string }
 * @property {object} [keepAlive] - { session-keep:string, user-update:string }
 */

/**
 * 特殊自定义过滤器
 * @typedef {object<string, object>} MicroIncludeCondition
 * @property {string} key - microConfig key
 * @property {object[]} val - one of microConfig[key] value
 */

/**
 * 自定义过滤器回调函数
 * @callback MicroFilterCallback
 * @param {object} cfg - 微应用的配置信息
 * @return {boolean} - 过滤结果（true: 保留结果，false：不需要保留）
 */

import path from 'path';
import extend from 'deep-extend';
import log4js from 'log4js-config';
import md5 from '@component-util/md5';
import casterClientSDK from 'caster-client-sdk';
import ApolloClient from 'apollo-client-sdk';
import DataSdkRest from 'data-sdk-rest';
import EventEmitter from 'events';
import {
    microWebapp as mwConfig,
    oauth as authConfig,
    system as sysConfig
} from 'config';

// @tdKeyMatchResult: [ source, terminalDevice ]
const isTDKey = /^td:\s*([^\s:]+)\s*$/;
const currSupportedTD = sysConfig.terminalDevice.supported;
const defaultTerminalDevice = currSupportedTD[0];
const logger = log4js.get(global.log_prefix_name + path.basename(__filename));

/**
 * apollo 中的配置与本地的结合或覆盖（主要用于本地开发阶段）
 */
class LocalDebugData extends EventEmitter {
    constructor () {
        super();
        this._local_data = (mwConfig.debug && Array.isArray(mwConfig.debug.data)) ? mwConfig.debug.data : '';
        this._remote_data = false;
        this._isInited = false;
        this._init();
        this._isInited = true;
    }
    _init () {
        let self = this;
        let debug = mwConfig.debug;
        if (self._isInited) { return; }
        if (!debug || !debug.watchDataChanges || typeof debug.watchDataChanges !== 'string') { return; };
        require('chokidar').watch(mwConfig.debug.watchDataChanges).on('change', (filename) => {
            process.nextTick(() => {
                let _cfg = (require(filename) || {}).microWebapp;
                let _data = (_cfg && _cfg.debug && Array.isArray(_cfg.debug.data)) ? _cfg.debug.data : '';
                if (_data && self._remote_data && JSON.stringify(_data) !== JSON.stringify(self._local_data)) {
                    self._local_data = _data;
                    self.emit('update', self.merge(self._remote_data));
                }
            });
        });
    }
    merge (data) {
        let self = this;
        let debug = mwConfig.debug;
        self._remote_data = (Array.isArray(data) && data.length) ? data : [];
        if (!debug || !self._local_data || !self._local_data.length) { return self._remote_data; }
        if (debug.type === 'override') { return self._local_data; }
        let ret = [];
        let _copyRemoteData = self._remote_data.map((cfg) => cfg);
        self._local_data.forEach((localConfig) => {
            let serverConfig = _copyRemoteData.find((serverConfig, index) => {
                if (localConfig.appKey === serverConfig.appKey) {
                    _copyRemoteData.splice(index, 1);
                    return true;
                }
            });
            if (serverConfig) {
                ret.push(extend({}, serverConfig, localConfig));
            } else {
                ret.push(localConfig);
            }
        });
        return ret.concat(_copyRemoteData);
    }
}

/**
 * mw-config.util.js
 *
 * 实例事件
 * 1. mw-online     // function(cfg, hash){}
 * 2. mw-offline    // function(cfg){}
 * 3. mw-update     // function(cfg, new-hash, old-hash){}
 *
 * Created by wuyaoqian on 2018/11/3.
 */

class DynamicMicroWebappConfig extends EventEmitter {
    /**
     * 微应用配置构造函数
     */
    constructor () {
        super();
        this._caster = null;
        this._apollo = null;
        this._init_caster_promise = null;
        this._load_dynamic_data_promise = null;
        this._update_hash_data = {
            temp_data_before_load: {},
            caster: {
                delay: 1000 * 3,
                timeout: null,
                trigger: []
            }
        };

        this._data = {
            // @type: [ cfg, ... ]
            arr: [],
            // @type: { appKey@td: arr-index, ... }
            key: {},
            // @type: { ctx: arr-index, ... }
            ctx: {},
            // @type: { micro-base-url: {
            //     appKey, tdList: [ td, ... ], hash: { timeout, etag, url }, keepAlive }, ...
            // }
            url: {}
        };

        this._initApollo();
        this._initCaster().then(this._loadDynamicData.bind(this)).catch(() => {});
        this._local_debug = (new LocalDebugData()).on('update', (data) => {
            this._prepareBaseData(data);
        });
    }

    /**
     * 初始化实例（caster）
     * @return {*}
     * @private
     */
    _initApollo () {
        this._apollo = new ApolloClient(mwConfig.apollo, (data) => {
            logger.isDebugEnabled() && logger.debug('apollo data notified: \n', data);
            this._prepareBaseData(this._local_debug.merge(data));
        });
    }

    /**
     * 初始化实例（apollo）
     * @return {*}
     * @private
     */
    _initCaster () {
        let self = this;
        if (this._init_caster_promise) {
            return this._init_caster_promise;
        }
        return (this._init_caster_promise = new Promise((resolve, reject) => {
            casterClientSDK.mapManage.getInstance(
                mwConfig.store.casterMapName, mwConfig.store.ttl
            ).then((obj) => {
                (self._caster = obj).addEntryListener({
                    // 监听首次添加或某种原因（如：过期、删除、清理、重启等）之后的添加
                    'added' (key, oldValue, newValue) {
                        self._prepareEntryHashData(newValue.hash, true);
                    },
                    // 监听修改
                    'updated' (key, oldValue, newValue) {
                        self._prepareEntryHashData(newValue.hash, true);
                    }
                }, undefined, true).then(() => {
                    resolve(self._caster);
                }).catch((error) => {
                    delete self._init_caster_promise;
                    reject(error);
                });
            });
        }));
    }

    /**
     * 加载微应用的 entryHash 数据
     * @return {Promise<any>}
     * @private
     */
    _loadDynamicData () {
        let self = this;
        if (self._load_dynamic_data_promise) {
            return self._load_dynamic_data_promise;
        }
        return (self._load_dynamic_data_promise = new Promise((resolve, reject) => {
            this._initCaster().then((caster) => {
                caster.get('dynamic-mw-config', (error, data) => {
                    if (error) {
                        logger.error(
                            'load dynamic-mw-config (entryHash) has error: ',
                            (error && error.stack ? error.stack : error)
                        );
                        delete self._load_dynamic_data_promise;
                        reject(error);
                    } else {
                        logger.info(
                            'load dynamic-mw-config (entryHash) success.\nkeys: %s',
                            (data && data.hash) ? Object.keys(data.hash) : 'empty'
                        );
                        data && data.hash && self._prepareEntryHashData(data.hash, true);
                        resolve();
                    }
                });
            }).catch((error) => {
                delete self._load_dynamic_data_promise;
                reject(error);
            });
        }));
    }

    /**
     * 确保数据都加载了的情况下返回数据（只用于 getAll, getByAppKey, getByWebContext 三个方法的内部调用）
     * @return {Promise<void>}
     * @private
     */
    _load () {
        let self = this;
        return Promise.all([
            this._apollo.fetch(),
            this._loadDynamicData()
        ]).then(([data]) => {
            if (data && data.length && !self._data.arr.length) {
                self._prepareBaseData(self._local_debug.merge(data));
            }
            return Promise.resolve();
        });
    }

    /**
     * @callback HashCheckCallBack
     * @param {boolean} online
     * @param {object<TerminalDevice, MicroHash>} [hashTDGroup]
     */

    /**
     * 检测微应用的在线情况（ fetch-entryHash ）
     * @param {MicroKeeper} microKeeper
     * @param {HashCheckCallBack} fn
     * @private
     */
    _entryHashCheckFromMicroWebApp (microKeeper, fn) {
        let self = this;
        let microKey = `${microKeeper.appKey}@${microKeeper.tdList}`;
        DataSdkRest.baseRestler.get(microKeeper.hash.url, {
            headers: Object.assign({
                'cid': authConfig.appKey,
                'td': microKeeper.tdList.join(',')
            }, microKeeper.hash.etag ? {
                'if-none-match': microKeeper.hash.etag
            } : {})
        }).on('error', function (error) {
            logger.warn(
                'micro webapp ( key: %s ) offline (error) when entry-hash check, detail: \n',
                microKey, (error && error.stack ? error.stack : error)
            );
            fn(false);
        }).on('fail', function (error) {
            logger.warn(
                'micro webapp ( key: %s ) offline (fail) when entry-hash check, detail: \n',
                microKey, (error && error.stack ? error.stack : error)
            );
            fn(false);
        }).on('success', function (hashArr, resp) {
            logger.isDebugEnabled() && logger.debug(
                'micro-webapp ( key: %s ) status check (entry-hash) success (online).', microKey
            );
            // 0. 无需更新 hash 内容
            if (resp.statusCode.toString() === '304') { return fn(true); }
            // 1. 解析 resp.headers['td'] 值
            let tdArr = self._extractTDArray(resp.headers || {});
            // 2. 解析并记录 resp.headers['etag'] 值，下次请求时将会附加在 req.headers['if-none-match']
            microKeeper.hash.etag = resp.headers['etag'];
            // 3. 通过 fn 返回 hash 值
            // fn: function( true, { td: hash, ... } )
            fn(true, (tdArr.length > 1 ? hashArr : [hashArr]).reduce((data, hash, index) => {
                data[tdArr[index]] = hash;
                return data;
            }, {}));
        });
    }

    // 虽 tcp-check 高效，但当微应用的 hash 主动更新到主应用失败时，主应用就无法及时更新 hash 数据，所以这里就注释了（2020-06-15）
    // /**
    //  * 检测微应用的在线情况（tcp-check）
    //  * @param key
    //  * @param cfg
    //  * @param fn
    //  * @private
    //  */
    // _tcpCheckFromMicroWebApp (key, cfg, fn) {
    //     let url;
    //     let tcpCheck;
    //     try { tcpCheck = require.resolve('tcp-check'); } catch (e) {}
    //     if (!tcpCheck || mwConfig.check.disableTcpCheck) {
    //         if (!cfg.entryHash) {
    //             return logger.warn(
    //                 'micro-webapp ( key: %s ) status check (tcp-check) disabled (EntryHash Url Not Exist).', key
    //             );
    //         }
    //         this._entryHashCheckFromMicroWebApp(key, cfg, fn);
    //     } else {
    //         url = Url.parse(cfg.baseUrl);
    //         url.port = url.port || 80;
    //         tcpCheck = require('tcp-check');
    //         tcpCheck(url.hostname, url.port, 1000 * 60).then(() => {
    //             logger.isDebugEnabled() && logger.debug(
    //                 'micro-webapp ( host: %s, port: %s, key: %s ) status check success (online).',
    //                 url.hostname, url.port, key
    //             );
    //             fn(true);
    //         }, (error) => {
    //             logger.warn(
    //                 'micro webapp ( host: %s, port: %s, key: %s ) offline when tcp check, detail: \n',
    //                 url.hostname, url.port, key, (error && error.stack ? error.stack : error)
    //             );
    //             fn(false);
    //         });
    //     }
    // }

    /**
     * 检测指定 cfg 所对应微应用的 on-offline 状态，并启动当前 cfg 的周期性检测任务
     * @param {string} baseUrl
     * @param {boolean} [now]
     * @private
     */
    _checkStatus (baseUrl, now) {
        let self = this;
        let microKeeper = this._data.url[baseUrl];

        // 如果 baseUrl 已不在 this._data.url 配置列表中了，则停止当前 baseUrl 的周期性检测
        if (!microKeeper) { return; }

        let min = mwConfig.check.interval[0];
        let max = mwConfig.check.interval[1];
        let delay = now
            // 随机 5 秒之内
            ? (Math.ceil(Math.floor(Math.random() * 10) / 2) * 1000)
            // 最低 min 秒，最高 max 秒之内的随机
            : (min + (Math.floor(Math.random() * 10) * ((max - min) / 10)));

        logger.isDebugEnabled() && logger.debug(
            'start check micro-webapp ( key: %s ) status in next %ss',
            `${microKeeper.appKey}@${microKeeper.tdList}`, (delay / 1000)
        );
        clearTimeout(microKeeper.hash.timeout);
        microKeeper.hash.timeout = setTimeout(() => {
            self._entryHashCheckFromMicroWebApp(microKeeper, (status, hashTDGroup) => {
                // 1. 更新微应用 status 值
                self._prepareStatusData(
                    microKeeper.appKey, status, (hashTDGroup || microKeeper.tdList.reduce((obj, td) => {
                        obj[td] = false;
                        return obj;
                    }, {}))
                );
                // 2. 更新微应用 hash 值
                self._prepareEntryHashData(
                    hashTDGroup ? self._transformHashData(microKeeper.appKey, hashTDGroup) : null
                );
                // 3. 周期检测：下次
                self._checkStatus(baseUrl, false);
            });
        }, delay);
    }

    /**
     * 准备基础数据
     * @param {object[]} data 存放于 apollo 中的微应用配置信息
     * @private
     */
    _prepareBaseData (data) {
        if (!Array.isArray(data) || !data.length) {
            return this;
        }

        // 1. 清理任务
        Object.keys(this._data.url).forEach((key) => {
            clearTimeout(this._data.url[key].hash.timeout);
        });
        this._data.url = {};

        // 2. 定义相关临时变量
        let OldArr = this._data.arr;
        let OldKey = this._data.key;
        let DataUrl = this._data.url;
        let DataArr = this._data.arr = [];
        let DataKey = this._data.key = {};
        let DataCtx = this._data.ctx = {};

        // 3. 定义临时函数：规整化配置数据
        let normalizeConfig = function (cfg, adapterKey) {
            // 调试时使用
            if (mwConfig.debug && mwConfig.debug.useAlternateBaseUrl && cfg['baseUrl-alt']) {
                logger.isDebugEnabled() && logger.debug(
                    'micro-webapp( %s ) use baseUrl-alt( %s ) replace the normal baseUrl( %s ).',
                    adapterKey, cfg['baseUrl-alt'], cfg['baseUrl']
                );
                cfg['baseUrl'] = cfg['baseUrl-alt'] || cfg['baseUrl'];
            }
            cfg['data'] = {
                // 临时存放微应用的入口 hash 信息: { base, [lang], [theme], ... }
                'hash': null,
                // 临时存放微应用的在线状态: 'UP', 'DOWN'
                'status': null
            };
            // 微应用使用的 CDN
            cfg['cdn'] = (cfg['cdn'] || '').replace(/\/*$/, '');
            // 微应用在主应用当中的请求上下文
            cfg['webContext'] = cfg['webContext'] || md5(adapterKey);
            // 微应用在主应用当中界面的模块ID
            cfg['moduleKey'] = cfg['moduleKey'] || `_${cfg['webContext']
                .replace(/[-]/g, '')
                .toUpperCase()}_`;
            // 微应用的静态资源
            cfg['statics'] = Array.isArray(cfg['statics'])
                ? cfg['statics']
                : Object.values(cfg['statics'] || {});
            // 微应用的登录认证判断
            if (cfg['passport'] && typeof cfg['passport'] === 'object') {
                cfg['passport']['preInclude'] = Array.isArray(cfg['passport']['preInclude'])
                    ? cfg['passport']['preInclude']
                    : Object.values(cfg['passport']['preInclude'] || {});
                cfg['passport']['preExclude'] = Array.isArray(cfg['passport']['preExclude'])
                    ? cfg['passport']['preExclude']
                    : Object.values(cfg['passport']['preExclude'] || {});
            }
        };

        // 4. 定义临时函数：合并配置数据
        let mergeConfig = function (cfg, appKey) {
            let self = this;
            // 与微应用的默认配置进行合并
            cfg = extend({}, mwConfig.rule.defaultMWConfig, cfg);
            // 增加默认终端设备的配置（注意：`td: pc`: {} 与 `td:pc`: {} 会合并，只是不知道谁先谁后，所以不要这么写）
            cfg[`td:${defaultTerminalDevice}`] = cfg[`td:${defaultTerminalDevice}`] || {};
            // 按终端设备进行相应配置的提取，并合并外层配置
            Object.keys(cfg).forEach((key) => {
                let tdKeyMR = isTDKey.exec(key);
                if (!tdKeyMR || !cfg[key] || cfg[key].disabled || !currSupportedTD.includes(tdKeyMR[1])) {
                    return;
                }
                delete cfg[key]['appKey'];
                delete cfg[key]['appSecret'];
                // 记录到 DataKey[adapterKey] = index 当中
                let adapterKey = self.genAdapterKey(appKey, tdKeyMR[1]);
                let index = DataKey[adapterKey];
                if (Number.isFinite(index)) {
                    extend(DataArr[index], cfg[key]);
                } else {
                    DataArr.push(extend({}, cfg, cfg[key]));
                    index = DataArr.length - 1;
                    DataKey[adapterKey] = index;
                }
                // 完善 cfg 数据
                Object.assign(DataArr[index], {
                    'terminalDevice': tdKeyMR[1],
                    'adapterKey': adapterKey
                });
            });
        };

        // 5. 规整化数据：合并
        let tempAppKey = {};
        let tempAppCtx = {};
        data.filter((cfg) => cfg && !cfg.disabled).forEach((cfg) => {
            let appKey = cfg['appKey'];
            let appCtx = cfg['webContext'] || '';
            // 忽略不合理的配置
            if (tempAppKey[appKey] || (appCtx && tempAppCtx[appCtx])) {
                return logger.warn(
                    'the micro config (appKey: %s, webContext: %s) needs to be unique, so ignored: \n',
                    appKey, appCtx, cfg
                );
            }
            tempAppKey[appKey] = true;
            tempAppCtx[appCtx] = true;
            // 开始合并
            mergeConfig.call(this, cfg, appKey);
        });

        // 6. 规整化数据：详细
        Object.keys(DataKey).forEach((adapterKey) => {
            let index = DataKey[adapterKey];
            let oldIndex = OldKey[adapterKey];
            let cfg = DataArr[index];
            normalizeConfig.call(this, cfg, adapterKey);
            // 记录到 DataCtx[ctx] = index 当中
            DataCtx[cfg['webContext']] = index;
            if (Number.isFinite(oldIndex) && OldArr[oldIndex]) {
                // 将旧配置中的 data 存放到新配置中
                cfg['data'] = OldArr[oldIndex]['data'];
                // 去掉找到的旧配置（ 只留下新配置中没有的，这里置为 false，是因为下面循环 OldArr 中会使用到 ）
                OldArr[oldIndex] = false;
            }
            // 移除一些无用的属性（ 'td:...' ）
            Object.keys(cfg).forEach((keyInner) => {
                isTDKey.test(keyInner) && delete cfg[keyInner];
            });
            // 以 baseUrl 为 key，记录相关数据
            let keepUser = (cfg.keepAlive || {})['user-update'] || '';
            let keepSess = (cfg.keepAlive || {})['session-keep'] || '';
            DataUrl[cfg.baseUrl] = DataUrl[cfg.baseUrl] || {
                appKey: cfg.appKey,
                appSecret: cfg.appSecret,
                tdList: [],
                hash: {
                    'timeout': false,
                    'etag': '',
                    'url': `${cfg.baseUrl}/${cfg.entryHash.replace(/^\/+/, '')}`
                },
                keepAlive: {
                    'user-update': keepUser ? `${cfg.baseUrl}/${keepUser.replace(/^\/+/, '')}` : '',
                    'session-keep': keepSess ? `${cfg.baseUrl}/${keepSess.replace(/^\/+/, '')}` : ''
                }
            };
            DataUrl[cfg.baseUrl].tdList.push(cfg.terminalDevice);
        });

        // 7. 循环 OldArr，并抛出 mw-offline 事件（ 此时的 OldArr 为新配置中没有记录的 ）
        OldArr.forEach((cfg) => {
            if (cfg && cfg.data && cfg.data.status === 'UP') {
                this.emit('mw-offline', cfg);
            }
        });

        // 8. 开始检测
        Object.keys(DataUrl).forEach((baseUrl) => {
            this._checkStatus(baseUrl, true);
        });

        // 9. 结束
        return this;
    }

    /**
     * 准备 entryHash 数据
     * ( 注意：需要在 _prepareStatusData 之后调用，因为 _prepareStatusData 方法在抛出 mw-update 时，需要使用到 oldHash )
     * @param {Object<MicroAdapter, MicroHash>} hashAdapterGroup
     * @param {boolean} [updateFromCaster]
     * @private
     */
    _prepareEntryHashData (hashAdapterGroup, updateFromCaster) {
        if (!hashAdapterGroup) { return; }

        // 定义处理句柄
        let handler = function (adapterGroup, isFromCaster) {
            let self = this;
            let DataArr = self._data.arr;
            let DataKey = self._data.key;
            Object.keys(adapterGroup).forEach((adapterKey) => {
                if (!Number.isFinite(DataKey[adapterKey])) {
                    return;
                }
                let cfg = DataArr[DataKey[adapterKey]];
                let oldHash = cfg.data.hash;
                let newHash = adapterGroup[adapterKey];
                if (!isFromCaster && JSON.stringify(newHash) !== JSON.stringify(oldHash)) {
                    self._delayStoreHashData(cfg.adapterKey);
                }
                delete adapterGroup[adapterKey];
                cfg.data.hash = newHash;
            });
        };

        // 1. 如果来源为 caster，则直接处理
        if (updateFromCaster) {
            return handler.call(this, Object.assign({}, hashAdapterGroup), true);
        }

        // 2.1 将要处理的数据，临时存放在 temp_data_before_load 当中
        Object.keys(hashAdapterGroup).forEach((adapterKey) => {
            this._update_hash_data.temp_data_before_load[adapterKey] = hashAdapterGroup[adapterKey];
        });

        // 2.2 等 caster 数据加载成功后。再进行处理
        this._loadDynamicData().then(() => {
            handler.call(this, this._update_hash_data.temp_data_before_load);
        }).catch(() => {});
    }

    /**
     * 设置微应用的上下线情况（注意：需要在 _prepareEntryHashData 之前调用，因为在抛出 mw-update 时，需要使用到 oldHash）
     * @param {string} appKey
     * @param {boolean} isOnline - 是否在线
     * @param {Object<TerminalDevice, MicroHash>} hashTDGroup
     * @private
     */
    _prepareStatusData (appKey, isOnline, hashTDGroup) {
        let DataArr = this._data.arr;
        let DataKey = this._data.key;
        // 注意：这里只对 this._data.arr 中存在的微应用进行配置上下线情况，而不需要对未来加入的微应用进行提前配置
        Object.keys(hashTDGroup).forEach((td) => {
            let adapterKey = this.genAdapterKey(appKey, td);
            if (!Number.isFinite(DataKey[adapterKey])) {
                return;
            }
            let cfg = DataArr[DataKey[adapterKey]];
            let oldHash = cfg.data.hash;
            let newHash = hashTDGroup[td];
            if (cfg.data.status === 'UP' && !isOnline) {
                // 抛出 mw-offline 的条件：原来在线 && 现在不在线
                this.emit('mw-offline', cfg);
            } else if (cfg.data.status !== 'UP' && isOnline) {
                // 抛出 mw-online 的条件：原来不在线 && 现在在线
                this.emit('mw-online', cfg, newHash || oldHash || {});
            } else if (
                cfg.data.status === 'UP' && isOnline &&
                oldHash && newHash &&
                JSON.stringify(oldHash) !== JSON.stringify(newHash)
            ) {
                // 抛出 mw-update 的条件如下：
                // 1. 原来在线 && 现在也在线
                // 2. oldHash 存在，且 newHash 也存在
                // 3. oldHash !== newHash
                this.emit('mw-update', cfg, newHash, oldHash);
            }
            cfg.data.status = isOnline ? 'UP' : 'DOWN';
        });
    }

    /**
     * 将 hashTDGroup 转换成 hashAdapterGroup
     * @param {string} appKey
     * @param {Object<TerminalDevice, MicroHash>} hashTDGroup
     * @return {{}}
     * @private
     */
    _transformHashData (appKey, hashTDGroup) {
        return Object.keys(hashTDGroup || {}).reduce(
            (obj, td) => {
                obj[this.genAdapterKey(appKey, td)] = hashTDGroup[td];
                return obj;
            }, {}
        );
    }

    /**
     * 延时保存 _data.arr[].hash 数据
     * @param {string} adapterKey
     * @private
     */
    _delayStoreHashData (adapterKey) {
        let self = this;
        let opt = self._update_hash_data.caster;
        opt.trigger.push(adapterKey);
        clearTimeout(opt.timeout);

        // 保存 hash 到 caster 中
        let handler = function () {
            self._caster.put(
                // caster-put: key
                'dynamic-mw-config',
                // caster-put: data
                self._data.arr.reduce((obj, cfg) => {
                    if (cfg.data.hash) {
                        obj.hash[cfg.adapterKey] = cfg.data.hash;
                    }
                    // @type: {
                    //     hash: { appKey@terminalDevice: { base, [lang], [theme], ... }, ... } }
                    // }
                    return obj;
                }, { hash: {} }),
                // caster-put: callback
                (error) => {
                    if (error) {
                        logger.error(
                            'update dynamic-mw-config (entry-hash) has error! \ntrigger: %s \ndetail: ',
                            opt.trigger, (error && error.stack ? error.stack : error)
                        );
                    }
                    logger.info(
                        'update dynamic-mw-config (entry-hash) success. \ntrigger: %s', opt.trigger
                    );
                    opt.trigger = [];
                    opt.timeout = null;
                }
            );
        };

        // 延时保存
        opt.timeout = setTimeout(handler, opt.delay);
    }

    /**
     * 提取 terminalDevice 值
     * @param {object} headers
     * @return {[]}
     * @private
     */
    _extractTDArray (headers) {
        return ((arr) => {
            // []       => [defaultTerminalDevice]
            // ['any']  => ['any']
            return arr.length ? arr : [defaultTerminalDevice || '-'];
        })((headers['td'] || '').split(',').reduce((arr, str) => {
            // ''       => []
            // ','      => []
            // 'pc,'    => ['pc']
            // ',pc'    => ['pc']
            // 'pc'     => ['pc']
            // 'pc,web' => ['pc','web']
            if (str.trim()) {
                arr.push(str.trim());
            }
            return arr;
        }, []));
    }

    /**
     * ------------------------------------------ 分隔线 ----------------------------------------------
     */

    /**
     * 组合成 adapterKey
     * @param {string} appKey - micro webapp client id
     * @param {TerminalDevice} [td=defaultTerminalDevice] - terminal device
     * @return {string}
     */
    genAdapterKey (appKey, td) {
        return `${appKey}@${td || defaultTerminalDevice}`;
    }

    /**
     * 更新 entry 内容的 hash 值（ 全覆盖式的更新，注意：_data.arr 中存在相应的配置，才会更新 ）
     * @param {string} appKey
     * @param {Object<TerminalDevice, MicroHash>} hashTDGroup

     * @return {undefined}
     */
    updateEntryHash (appKey, hashTDGroup) {
        let self = this;
        // 1. 更新微应用状态
        self._prepareStatusData(appKey, true, hashTDGroup);
        // 2. 更新微应用 hash 数据
        self._prepareEntryHashData(self._transformHashData(appKey, hashTDGroup));
    }

    /**
     * 异步获取 object<string, MicroKeeper> 对象
     * @param { object } [include] - 包含（ 注意：内部是 or 关系 ）
     * @param { TerminalDevice } include.td
     * @param { object } [except] - 排除（ 注意：内部是 and 关系 ）
     * @param { string } except.cid - micro webapp client id
     * @param { TerminalDevice } except.td
     * @returns { Promise<object<string, MicroKeeper>> }
     */
    getAllMicroKeeper (include, except) {
        return this._load().then(() => {
            let DataUrl = this._data.url;
            let includeTD = include ? include.td : '';
            let exceptTD = except ? except.td : '';
            let exceptCID = except ? except.cid : '';
            let ret = {};
            Object.keys(DataUrl).forEach((base) => {
                let MK = DataUrl[base];
                // 1. include.td 存在，但又不在 tdList 当中 --【则排除】
                if (includeTD && !MK.tdList.includes(includeTD)) { return; }
                // 2. except.cid & except.td 都存在，且 appKey 及 tdList 都满足 --【则排除】
                if (exceptCID && exceptTD && MK.appKey === exceptCID && MK.tdList.includes(exceptTD)) { return; }
                // 剩下的就是符合条件的
                ret[base] = DataUrl[base];
            });
            return ret;
        });
    }

    /**
     * 异步获取所有微应用配置（在线的）
     * @param {MicroFilterCallback|MicroIncludeCondition|TerminalDevice} [filter=defaultTerminalDevice]
     * @param {TerminalDevice} [td=defaultTerminalDevice]
     * @prarm {boolean} [includeServerStatusDown] - 是否包含当前下线状态的配置
     * @return {Promise<object[]>}
     */
    getAll (filter, td, includeServerStatusDown) {
        let _filter = (filter && typeof filter === 'function') ? filter : false;
        let _contain = (filter && typeof filter === 'object' && filter.key && filter.val) ? filter : false;
        let _key = (_contain && typeof _contain.key === 'string') ? _contain.key : false;
        let _val = _key ? (Array.isArray(_contain.val) ? _contain.val : [_contain.val]) : false;
        let _td = ((args) => {
            // 第一个参数为字符串
            if (typeof filter === 'string') { return filter; }
            // 第一个参数不是字符串，且超过一个参数，且第二个参数为字符串
            if (args.length > 1 && typeof td === 'string') { return td; }
        })(arguments) || defaultTerminalDevice;
        return this._load().then(() => {
            return this._data.arr.filter((cfg) => {
                return (
                    // 1. 状态为 UP 或 includeServerStatusDown
                    (cfg.data.status === 'UP' || includeServerStatusDown) &&
                    // 2. 终端设备匹配
                    cfg.terminalDevice === _td &&
                    // 3. _filter 存在时，过滤结果 true
                    (_filter ? _filter(cfg) : true) &&
                    // 4. _contain 存在时，包含指定值
                    (_val ? !!_val.find(function (v) {
                        return Array.isArray(cfg[_key]) ? cfg[_key].includes(v) : cfg[_key] === v;
                    }) : true)
                );
            });
        });
    }

    /**
     * 根据 appKey 异步获取对应的微应用配置（在线的）
     * @param {string} appKey - micro webapp client id
     * @param {TerminalDevice} [td=defaultTerminalDevice] - terminal device
     * @prarm {boolean} [includeServerStatusDown] - 是否包含当前下线状态的配置
     * @return {Promise<object|null>}
     */
    getByAppKey (appKey, td, includeServerStatusDown) {
        return this._load().then(() => {
            let DataArr = this._data.arr;
            let index = this._data.key[this.genAdapterKey(appKey, td)];
            if (
                // 1. 配置存在
                Number.isFinite(index) && DataArr[index] &&
                // 2. 状态为 UP 或 includeServerStatusDown
                (DataArr[index].data.status === 'UP' || includeServerStatusDown)
            ) {
                return Promise.resolve(DataArr[index]);
            }
            return Promise.resolve(null);
        });
    }

    /**
     * 根据 webContext 异步获取对应的微应用配置（在线的）
     * @param {string} ctx
     * @prarm {boolean} [includeServerStatusDown] - 是否包含当前下线状态的配置
     * @return {Promise<object|null>}
     */
    getByWebContext (ctx, includeServerStatusDown) {
        return this._load().then(() => {
            let DataArr = this._data.arr;
            let index = this._data.ctx[ctx];
            if (
                // 1. 配置存在
                Number.isFinite(index) && DataArr[index] &&
                // 2. 状态为 UP 或 includeServerStatusDown
                (DataArr[index].data.status === 'UP' || includeServerStatusDown)
            ) {
                return Promise.resolve(DataArr[index]);
            }
            return Promise.resolve(null);
        });
    }
}

/**
 * mwData 实例方法：
 * 1. genAdapterKey         // function( appKey, terminalDevice ){ return string; }
 * 2. updateEntryHash       // function( appKey, hash ){ return undefined; }
 * 3. getAllMicroKeeper     // function( include, except ) { return Promise<any>; }
 * 4. getAll                // function( filter, td ){ return Promise<any>; }
 * 5. getByAppKey           // function( appKey ){ return Promise<any>; }
 * 6. getByWebContext       // function( ctx ){ return Promise<any>; }
 *
 * mwData 实例抛出事件
 * 1. mw-offline            // function( cfg ){}
 * 2. mw-online             // function( cfg, hash ){}
 * 3. mw-update             // function( cfg, newHash, oldHash ){}
 *
 * @type {{mwConfig, mwData: *}}
 */
module.exports = {
    mwConfig: mwConfig,
    mwData: (new DynamicMicroWebappConfig()).on('mw-offline', (cfg) => {
        logger.info('micro-webapp (key: %s) offline.', cfg.adapterKey);
    }).on('mw-online', (cfg, hash) => {
        logger.info('micro-webapp (key: %s) online, \nhash: %s', cfg.adapterKey, JSON.stringify(hash));
    }).on('mw-update', (cfg, newHash, oldHash) => {
        logger.info(
            'micro-webapp (key: %s) updated, \nnewHash: %s, \noldHash: %s',
            cfg.adapterKey, JSON.stringify(newHash), JSON.stringify(oldHash)
        );
    })
};
