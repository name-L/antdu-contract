/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * socket.io 的全局拦截控制
 * Created by wuyaoqian on 17/11/17.
 */

import path from 'path';
import url from 'url';
import socketIO from 'socket.io';
import log4js from 'log4js-config';
import DataSdkRest from 'data-sdk-rest';
import LocalUtil from 'data-sdk-util/lib/local-util';
import IpUtil from 'data-sdk-util/lib/ip-util';
import routes from '../route.socket.js';
import socketPassportChecker from './controller-passport.socket.js';
import { system as appConfig } from 'config';

const logger = log4js.get(global.log_prefix_name + 'socket.io.' + path.basename(__filename));
const socketIoConfig = appConfig['socket.io'];

const RestInfo = DataSdkRest.userDataManage.socketRequest.restInfo;

/**
 * 初始化 websocket.io
 */
const initSocket = function (httpServer, sessionStore, getSessionId, getExtractParser) {
    // 1. 初始化
    let sio = socketIO(httpServer, socketIoConfig);

    /**
     * 2. 提取一些基础信息到 socket.request 当中
     * @param socket
     * @param next
     */
    const extractSocketRequestInfo = function (socket, next) {
        // 解析并生成 socket.request.query = {...} 对象
        if (!socket.request.query) {
            getExtractParser(['query'])[0](socket.request, null, () => {});
        }
        // 解析并生成 socket.request.cookies = {...} 对象
        if (!socket.request.cookies) {
            getExtractParser(['cookie'])[0](socket.request, null, () => {});
        }
        // 解析 cookies 中的 finger-print 信息，并存储在 header 中
        if (!socket.request.headers['fpr']) {
            getExtractParser(['finger-print'])[0](socket.request, null, () => {});
        }
        // 完善 headers 中的 terminal-device 信息
        if (!socket.request.headers['td']) {
            getExtractParser(['terminal-device'])[0](socket.request, null, () => {});
        }
        // 将 ip 信息 记录在 socket.request 当中
        if (!socket.request['INFO:IP']) {
            socket.request['INFO:IP'] = IpUtil.getClientIp(socket.request) || '-';
        }
        // 将 session-id 信息记录在 socket.request 中
        if (!socket.request['INFO:SID']) {
            socket.request['INFO:SID'] = getSessionId(socket.request) || '-';
        }
        next();
    };

    /**
     * 3. 尝试将获取用户信息
     * @param socket {object} 当前 socket
     * @param next {function} 下一个处理链
     */
    const extractUserDataFromSession = function (socket, next) {
        const restInfo = RestInfo.get(socket.request) || {};
        logger.isDebugEnabled() && logger.debug(
            'trigger socket (csid: %s, ip: %s) authorization (fetch) in session (sid: %s, user: %s)',
            socket.id, socket.request['INFO:IP'], socket.request['INFO:SID'], restInfo.username || '-'
        );
        // 无 session-id，或者已登录，则直接进入下个处理链
        if (!socket.request['INFO:SID'] || socket.request['INFO:SID'] === '-' || restInfo.username) {
            return next();
        }
        // 加载 session 信息（原样加载，无 cookies 处理）
        sessionStore.get(socket.request['INFO:SID'], function (error, sess) {
            if (error) {
                logger.error(
                    'socket (csid: %s, ip: %s) authorization (fetch) in session (sid: %s) has error: ',
                    socket.id, socket.request['INFO:IP'], socket.request['INFO:SID'],
                    (error.stack ? error.stack : error)
                );
                return next(error);
            }
            if (sess && sess.user) {
                RestInfo.set(socket.request, {
                    'sid': socket.request['INFO:SID'],
                    'session-store': sessionStore,
                    'userid': sess.user.userid,
                    'username': sess.user.username,
                    'lang': LocalUtil.getLangStr(socket.request)
                });
                logger.isDebugEnabled() && logger.debug(
                    'socket (csid: %s, ip: %s) authorization (record) in session (sid: %s, user: %s) is successful.',
                    socket.id, socket.request['INFO:IP'], socket.request['INFO:SID'], sess.user.username
                );
            }
            next();
        });
    };

    // 4. 初始化 各 namespace (包含 root namespace)
    routes.forEach((routeConfig) => {
        routeConfig = routeConfig.__esModule ? routeConfig.default : routeConfig;
        if (!Array.isArray(routeConfig.routes) || !routeConfig.routes.length) { return; }
        routeConfig.routes.forEach((route) => {
            let nsp = sio.of(url.resolve('/', route['namespace']));
            let handlers = (Array.isArray(route.handler) ? route.handler : [route.handler]);
            let events = (Array.isArray(route.event) ? route.event : [route.event]);
            let connection = handlers.pop();
            let process = function (handler) {
                if (typeof handler === 'function') {
                    return handler;
                } else if (typeof handler === 'string' && routeConfig.module) {
                    return routeConfig.module[handler];
                }
            };
            // 0. socket info
            nsp.use(extractSocketRequestInfo);
            // 1. session
            route.session && nsp.use(extractUserDataFromSession);
            // 2. filter: before passport
            route.filter && nsp.use(process(route.filter));
            // 3. passport
            route.passport && nsp.use(socketPassportChecker(route.passport));
            // 4.1 connection (filter)
            handlers.length && handlers.forEach((handler) => { nsp.use(process(handler)); });
            // 4.2 connection (event)
            if (connection && events.length) {
                // check event config
                events = events.map((event) => {
                    if (!event) { return null; }
                    if (typeof event === 'string' || typeof event === 'function') {
                        return {
                            test: function (arr) {
                                if (!Array.isArray(arr) || !arr[0] || typeof arr[0] !== 'string') { return false; }
                            },
                            handler: process(event)
                        };
                    } else if ((typeof event.key === 'string' || event.key instanceof RegExp) && event.handler) {
                        return {
                            test: function (arr) {
                                if (!Array.isArray(arr) || !arr[0] || typeof arr[0] !== 'string') { return false; }
                                if (typeof event.key === 'string' && event.key === arr[0]) { return true; }
                                return !!(event.key instanceof RegExp && event.key.test(arr[0]));
                            },
                            handler: process(event.handler)
                        };
                    }
                }).filter(event => !!(event && event.handler));
                // process event handler
                events.length && nsp.on('connection', function (socket) {
                    events.forEach(event => socket.use(function (arr, next) {
                        if (!event.test(arr)) { return next(); }
                        event.handler.call(socket, arr, next);
                    }));
                });
            }
            // 4.3 connection (handler)
            connection && nsp.on('connection', process(connection));
        });
    });
};

/**
 * 初始化 socket.io 服务
 *
 * @param server
 * @param store
 * @param sid
 * @param extract
 */
export default function (server, store, sid, extract) {
    initSocket(server, store, sid, extract);
};
