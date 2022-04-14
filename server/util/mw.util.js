/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * mw.util.js
 * Created by wuyaoqian on 2018/9/25.
 */

import path from 'path';
import log4js from 'log4js-config';
import {
    oauth as authConfig,
    system as sysConfig
} from 'config';
import extend from 'deep-extend';
import { mwConfig, mwData } from './mw-config.util.js';
import MicroWebappEntryUtil from './mw-entry.util.js';
import DataSdkRest from 'data-sdk-rest';
import AES from '@component-util/crypto-aes/lib/crypto-aes';
import { parse as UrlParse } from 'url';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));

// 微应用转发URL正则
// req.url = /mw/(micro-ctx1|micro-ctx2|...)/(micro-path?query)
// result[1]: micro-ctx
// result[2]: micro-path
const forwardPathFromBrowser = new RegExp(`${mwConfig.ctx}/([a-z-0-9]+)/(.+)$`);

/**
 * 路径比较
 * @param path1
 * @param path2
 * @return {boolean}
 * @private
 */
const _pathMatch = function (path1, path2) {
    let format1 = UrlParse(path1).pathname.replace(/((\/+)|(^\/?)|(\/?$))/g, '/');
    let format2 = UrlParse(path2).pathname.replace(/((\/+)|(^\/?)|(\/?$))/g, '/');
    return format1 === format2;
};

const ResponseHeaderResolve = {
    /**
     * 将微应用返回的加密好的 session-id 存放在 req.session.mwInfo[cfg.appKey]['signed-sid'] 之中
     * 同时将处理好的 header 内容做为基础值返回（pipe到浏览器之用）
     * @param microWebappResponseHeaders
     * @param microWebappConfig
     * @param req
     * @return {object}
     */
    cookie (microWebappResponseHeaders, microWebappConfig, req) {
        // 不再需要记录 signed-sid，因为微应用那边只需根据 header['sid'] 处理就可以了 （2018-12-24）
        // let reg = new RegExp(`^${microWebappConfig.sessionKey}=([^;]+)(?:;|$)`, 'i');
        // (microWebappResponseHeaders['set-cookie'] || []).some((val) => {
        //     let ret = val.match(reg);
        //     if (ret && ret[1]) {
        //         req.session && req.session.mwInfo && (
        //             req.session.mwInfo[microWebappConfig.appKey]['signed-sid'] = ret[1]
        //         );
        //         return true;
        //     }
        // });
        // 禁止微应用设置 cookies
        delete microWebappResponseHeaders['set-cookie'];
        return microWebappResponseHeaders;
    },
    /**
     * 解析放在 response header 中的 user 数据, 并更新 req.session.user 数据
     * @param microWebappResponseHeaders
     * @param microWebappConfig
     * @param req
     * @return {object}
     */
    userInfo (microWebappResponseHeaders, microWebappConfig, req) {
        let pipeUserData = microWebappResponseHeaders['user'];
        if (pipeUserData && req.session && req.session.user) {
            let newUser;
            delete microWebappResponseHeaders['user'];

            // 1. 解密需要更新的用户信息
            try {
                newUser = JSON.parse(AES.decrypt(pipeUserData, microWebappConfig.appSecret));
            } catch (e) {
                logger.error(
                    'decrypt or parse micro-webapp (pipe in response header) user-info has error! \n' +
                    'micro (cid: %s, td: %s)',
                    microWebappConfig.appKey, req.headers['td'] || '-'
                );
                return microWebappResponseHeaders;
            }

            // 2. 更新用户信息，并保存
            req.session.user = extend(req.session.user, newUser);

            // 3. 将更新后的用户信息通知到其它微应用
            process.nextTick(() => {
                keepAlive('user-update', req.session.id, req.session, {
                    cid: microWebappConfig.appKey,
                    td: req.headers['td']
                });
            });
        }
        return microWebappResponseHeaders;
    },
    /**
     * 解析 microWebappConfig.entryContent 转发请求中响应头的 hash 值
     * @param microWebappResponseHeaders
     * @param req
     * @param microWebappConfig
     * @param currRequestMicroWebappPath
     * @return {*}
     */
    entryHash (microWebappResponseHeaders, microWebappConfig, req, currRequestMicroWebappPath) {
        // 1. base, {lang}, {theme} 合并在一起的特殊模式（主要是兼旧的非 http2 的请求方式）
        if (typeof microWebappConfig.entryContent === 'string') {
            // 只针对 microWebappConfig.entryContent 的转发中提取 hash 值
            if (!_pathMatch(microWebappConfig.entryContent, currRequestMicroWebappPath)) {
                return microWebappResponseHeaders;
            }
            // 根据解析 req.query 中的 v 参数，来决定当前的返回内容是否需要缓存
            let isNeedCache = ((query) => {
                let lang = query.l;
                let theme = query.t;
                let hash = (query.v || '').split('-');
                // hash[base, lang, theme]
                return !!(hash[0] && (lang ? hash[1] : true) && (theme ? hash[2] : true));
            })(req.query || {});
            if (!isNeedCache) {
                microWebappResponseHeaders['cache-control'] = 'public, max-age=0';
            }
        } else {
            // base, {lang}, {theme} 分开请求的模式
            // 只针对 microWebappConfig.entryContent.base 的转发中提取 hash 值
            if (!_pathMatch(microWebappConfig.entryContent.base, currRequestMicroWebappPath)) {
                return microWebappResponseHeaders;
            }
        }

        // 2. 解析 microWebappResponseHeaders['hash'] 内容，并与 oldHash 比较，看是否需要 update
        let newHash;
        try {
            newHash = JSON.parse(microWebappResponseHeaders['hash']);
            delete microWebappResponseHeaders['hash'];
        } catch (error) {
            logger.warn(
                'resolve entry content (ctx: %s) need hash header',
                microWebappConfig.webContext, (error && error.stack ? error.stack : error)
            );
        }
        mwData.updateEntryHash(
            microWebappConfig['appKey'], { [microWebappConfig.terminalDevice]: newHash }
        );

        // 返回修改后的 header
        return microWebappResponseHeaders;
    }
};

/**
 * 获取微应用在主应用 session 当中存放的信息
 * ( 注意：因为目前主应用的 session 生成与终端设备无关，所以 mwInfo 也应与终端设备无关, 即：使用 appKey 获取 mwInfo ）
 * @param { string } [mainSessId]
 * @param { object } [mainSess]
 * @param { string } key - mainSess.mwInfo[key]
 * @returns {*|{}}
 */
const getMicroInfoInMainSess = function (mainSessId, mainSess, key) {
    if (mainSessId && mainSess) {
        mainSess.mwInfo = mainSess.mwInfo || {};
        return (mainSess.mwInfo[key] = mainSess.mwInfo[key] || {});
    }
};

/**
 * 构造访问微应用的基础请求头信息
 * @param {string} mainSessId
 * @param {object|undefined} mainSess
 * @param {object} microWebappConfig
 * @return {cookie, cid, sid, key, fp}
 */
const buildMicroWebappForwardHeader = function (mainSessId, mainSess, microWebappConfig) {
    let mwInfo = getMicroInfoInMainSess(mainSessId, mainSess, microWebappConfig.appKey);
    if (mainSessId && mwInfo && !mwInfo['raw-sid']) {
        mwInfo['raw-sid'] = AES.encrypt(
            mwConfig.rule.generateMicroSessionId(mainSessId), authConfig.appSecret
        );
    }
    let ret = {
        // 不再需要传递 signed-sid，因为微应用那边只需根据 header['sid'] 处理就可以了 （2018-12-24）
        // 'cookie': (mainSessionId && mwInfo) ? `${microWebappConfig.sessionKey}=${mwInfo['signed-sid']}` : '',
        'sid': (mainSessId && mwInfo) ? mwInfo['raw-sid'] : '',
        'cid': authConfig.appKey,
        'key': microWebappConfig.moduleKey,
        'mfp': MicroWebappEntryUtil.getMicroWebappForwardPath(microWebappConfig),
        'cdn': microWebappConfig.cdn
    };
    // 附加基本用户信息 {uid:userid, name:username}
    if (mwConfig.rule.pipeBaseUserInfoInHeader && mainSessId && mainSess && mainSess.user) {
        ret['bu'] = mwInfo['base-user'] || (mwInfo['base-user'] = AES.encrypt(JSON.stringify({
            userid: mainSess.user.userid || '',
            username: mainSess.user.username || ''
        }), microWebappConfig.appSecret));
    }
    // 附加整个 user 对象（ debug 阶段 ）
    if (mwConfig.debug && mwConfig.debug.pipeAllUserInfoInHeader && mainSessId && mainSess && mainSess.user) {
        logger.isDebugEnabled() && logger.debug('pipe user (%s) info to forward header.', mainSess.user.username);
        ret['au'] = AES.encrypt(JSON.stringify(mainSess.user), microWebappConfig.appSecret);
    }
    return ret;
};

/**
 * 根据 micro-session-id 兑换成 main-session-id 并获取 session 中的 user 对象
 * @param req
 * @param store
 * @return {Promise<any>}
 */
const fetchUserDataByMicroWebappSessionId = function (req, store) {
    let { cid, sid } = req.MW_DATA;
    return new Promise((resolve, reject) => {
        let mainSessionId;
        let decryptData;
        try {
            decryptData = AES.decrypt(sid, authConfig.appSecret);
        } catch (error) {
            logger.error('decrypt micro-webapp session-id has error!\nmicro-cid: %s, micro-sid: %s', cid, sid);
            return reject(error);
        }
        mainSessionId = mwConfig.rule.fetchMainSessionId(decryptData);
        store.get(mainSessionId, (err, sess) => {
            if (err) { return reject(err); }
            resolve(sess ? {
                sess: sess,
                user: sess.user,
                msid: mainSessionId
            } : {
                msid: mainSessionId
            });
        });
    });
};

/**
 * 通知微应用延长 session 的过期时间
 * ( PS1：当 type==='user-update' 时这里才会附带最新的用户信息 )
 * ( PS2：session 与终端设备无关，所以需要按 mw-config.util.js => this._data.url 通知所有微应用 )
 * ( PS3：如果在当前主应用 session 当中找不到 mwInfo[appKey]['raw-sid']，则说明还未转发过 "非静态的请求" 到相对应的微应用当中  )
 * @param {string} type - 'user-update', 'session-keep'
 * @param {string} mainSessId
 * @param {object} mainSess
 * @param {object} [except]
 * @param {string} except.cid
 * @param {string} except.td
 */
const keepAlive = function (type, mainSessId, mainSess, except) {
    const expireTime = 1000 * 60 * sysConfig.session.timeToLive;
    const username = ((mainSess || {}).user || {}).username || '-';
    const keepAliveFN = function (url, header, encryptUserData, microKeeper) {
        return DataSdkRest.baseRestler.post(url, {
            headers: Object.assign({}, header),
            data: {
                'ttl': expireTime,
                'user': encryptUserData
            }
        }).on('error', function (error) {
            logger.error(
                'keep alive (type: %s, user: %s) to micro-webapp has error, micro ( cid: %s, sid: %s, td: %s )\n',
                type, username, microKeeper.appKey, (header['sid'] || '-'), microKeeper.tdList,
                (error && error.stack ? error.stack : error)
            );
        }).on('fail', function (error) {
            logger.error(
                'keep alive (type: %s, user: %s) to micro-webapp was failed, micro ( cid: %s, sid: %s, td: %s )\n',
                type, username, microKeeper.appKey, (header['sid'] || '-'), microKeeper.tdList,
                (error && error.stack ? error.stack : error)
            );
        }).on('success', function () {
            logger.info(
                'keep alive (type: %s, user: %s) to micro-webapp success, micro ( cid: %s, sid: %s, td: %s )',
                type, username, microKeeper.appKey, (header['sid'] || '-'), microKeeper.tdList
            );
        });
    };
    mwData.getAllMicroKeeper(undefined, except).then((obj) => {
        Object.keys(obj).forEach((base) => {
            // 排除无相应 keepAlive 配置的
            if (!obj[base].keepAlive[type]) { return; }
            let mwInfo = getMicroInfoInMainSess(mainSessId, mainSess, obj[base].appKey);
            // 排除未转发过微应用 "非静态请求" 的（ 即：无 mwInfo['raw-sid'] 信息 ）
            if (!mwInfo || !mwInfo['raw-sid']) { return; }
            let encryptUserData = (type === 'user-update' && mainSess.user)
                ? AES.encrypt(JSON.stringify(mainSess.user), obj[base].appSecret)
                : undefined;
            // 开始请求
            keepAliveFN(obj[base].keepAlive[type], {
                'sid': mwInfo['raw-sid'],
                'cid': authConfig.appKey,
                'td': obj[base].tdList.join(',')
            }, encryptUserData, obj[base]);
        });
    });
};

module.exports = {
    mwConfig,
    mwData,
    forwardPathFromBrowser,
    mwEntry: MicroWebappEntryUtil,
    resolveMicroWebappResponseHeader (microResponseHeaders, microConfig, req, currRequestMicroPath) {
        ResponseHeaderResolve.cookie(microResponseHeaders, microConfig, req, currRequestMicroPath);
        ResponseHeaderResolve.userInfo(microResponseHeaders, microConfig, req, currRequestMicroPath);
        ResponseHeaderResolve.entryHash(microResponseHeaders, microConfig, req, currRequestMicroPath);
        return microResponseHeaders;
    },
    fetchUserDataByMicroWebappSessionId,
    buildMicroWebappForwardHeader,
    keepAlive,
    updateEntryHash: mwData.updateEntryHash.bind(mwData)
};
