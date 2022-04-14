/*!
 * Copyright (c) 2018-2020 Autdu Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁为软件有限公司。保留所有权利。
 */

'use strict';

import path from 'path';
import extend from 'deep-extend';
import log4js from 'log4js-config';

import MWUtil from '../../../util/mw.util.js';
import AES from '@component-util/crypto-aes/lib/crypto-aes';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));

/**
 * frame-service.http.js
 * Created by wuyaoqian on 2019/11/7.
 */

const Extract = {
    // 从微应用到主应用的请求中提取相关参数信息
    microParam: function extractMicroParamHandler (req, res, next) {
        Object.defineProperty(req, 'MW_DATA', {
            value: {
                cid: req.headers['cid'] || '-',
                sid: req.headers['sid'] || '-',
                td: req.headers['td'] || '',
                cfg: null
            }
        });
        return next();
    },
    // 从微应用到主应用的请求中根据 microWebAppKey 提取配置信息（注意：依赖 Extract.microInfo ）
    microConfig: function extractMicroConfigHandler (req, res, next) {
        MWUtil.mwData.getByAppKey(req.MW_DATA.cid, req.MW_DATA.td).then((cfg) => {
            if (cfg) {
                req.MW_DATA.cfg = cfg;
                return next();
            }
            res.status(404);
            next(new Error(`micro webapp (key: ${req.MW_DATA.cid}, td: ${req.MW_DATA.td}) not found!`));
        });
    }
};

const Handler = {
    /**
     * 1. 处理微应用的修改 entry 信息 hash 值的请求
     * @param req
     * @param res
     */
    processEntryHashUpdateFromMicroWebApp: function entryHashUpdateHandler (req, res) {
        let {cid, td} = req.MW_DATA;
        let hash;
        try {
            hash = JSON.parse(req.body.hash);
        } catch (e) {
            logger.warn(
                'update entry-content-hash (key: %s, td: %s) in "req.body.hash" parse error\n hash: ',
                cid, td || '-', req.body.hash
            );
            res.status(500);
            res.send(e.message ? e.message : e);
            return;
        }
        MWUtil.updateEntryHash(cid, {[td]: hash});
        res.end();
    },
    /**
     * 2. 处理微应用的获取用户信息的请求
     * @param routeConfig
     * @param parser
     * @param session
     * @return {*}
     */
    configProcessUserInfoFetchFromMicroWebApp: function (routeConfig, parser, session) {
        if (routeConfig.handler || !session || !session.store) { return routeConfig; }
        // init handler
        routeConfig.handler = function userFetchHandler (req, res) {
            let {cid, sid, td, cfg} = req.MW_DATA;
            MWUtil.fetchUserDataByMicroWebappSessionId(req, session.store).then(({user, msid}) => {
                if (user) {
                    res.send(AES.encrypt(JSON.stringify(user), cfg.appSecret));
                } else {
                    logger.warn(
                        'not found user info (from micro-webapp)!\nmain-sid: %s, micro (sid: %s, cid: %s, td: %s)',
                        msid, sid, cid, td
                    );
                    res.status(400);
                    res.send('not found user info!');
                }
            }).catch((error) => {
                logger.error(
                    'fetch user info from micro-webapp has error!\nmicro (sid: %s, cid: %s, td: %s)\ndetail: ',
                    sid, cid, td, (error && error.stack ? error.stack : error)
                );
                res.status(500);
                res.send(error.message ? error.message : error);
            });
        };
        // remove config handler
        delete routeConfig.config;
        return routeConfig;
    },
    /**
     * 3. 处理微应用的修改用户信息的请求
     * @param routeConfig
     * @param parser
     * @param session
     * @return {*}
     */
    configProcessUserInfoUpdateFromMicroWebApp: function (routeConfig, parser, session) {
        if (routeConfig.handler || !session || !session.store) { return routeConfig; }
        // init handler
        routeConfig.handler = function userUpdateHandler (req, res) {
            let {cid, sid, td, cfg} = req.MW_DATA;
            MWUtil.fetchUserDataByMicroWebappSessionId(req, session.store).then(({sess, user, msid}) => {
                let newUser;
                if (!user) {
                    logger.warn(
                        'not found user info (from micro-webapp)!\nmain-sid: %s, micro (sid: %s, cid: %s, td: %s)',
                        msid, sid, cid, td
                    );
                    res.status(400);
                    res.send('not found user info!');
                    return;
                }

                // 1. 解密需要更新的用户信息
                try {
                    newUser = JSON.parse(AES.decrypt(req.body.user, cfg.appSecret));
                } catch (e) {
                    logger.error(
                        'decrypt or parse micro-webapp user-info has error!\nmicro (sid: %s, cid: %s, td: %s)',
                        sid, cid, td
                    );
                    res.status(400);
                    res.send('decrypt user info error!');
                    return;
                }

                // 2. 更新用户信息，并保存
                newUser = extend(user, newUser);
                sess.user = newUser;
                session.store.set(msid, sess, (err) => {
                    if (err) {
                        res.status(400);
                        return res.send('update user info error!');
                    }

                    // 3. 将更新后的用户信息通知到其它微应用
                    process.nextTick(() => {
                        MWUtil.keepAlive('user-update', msid, sess, {
                            cid: cid,
                            td: td
                        });
                    });
                    res.end();
                });
            }).catch((error) => {
                logger.error(
                    'update user info from micro-webapp has error!\nmicro (sid: %s, cid: %s, td: %s)\ndetail: ',
                    sid, cid, td, (error && error.stack ? error.stack : error)
                );
                res.status(500);
                res.send(error.message ? error.message : error);
            });
        };
        // remove config handler
        delete routeConfig.config;
        return routeConfig;
    }
};

export default {
    module: null,
    routes: [
        // 1. 处理微应用的修改 entry 信息 hash 值的请求
        {
            'method': 'post',
            'path': [`${global.ctx_path}/frame-service/update-entry-hash`],
            'extract': [Extract.microParam],
            'consume': true,
            'handler': Handler.processEntryHashUpdateFromMicroWebApp,
            'config': null
        },
        // 2. 处理微应用的获取用户信息的请求
        {
            'method': 'get',
            'path': [`${global.ctx_path}/frame-service/fetch-user-data`],
            'extract': [Extract.microParam, Extract.microConfig],
            'handler': null,
            'config': Handler.configProcessUserInfoFetchFromMicroWebApp
        },
        // 3. 处理微应用的修改用户信息的请求
        {
            'method': 'post',
            'path': [`${global.ctx_path}/frame-service/update-user-data`],
            'extract': [Extract.microParam, Extract.microConfig],
            'consume': true,
            'handler': null,
            'config': Handler.configProcessUserInfoUpdateFromMicroWebApp
        }
    ]
};
