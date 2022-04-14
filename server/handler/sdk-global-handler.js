/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 此 handler 主要是处理:
 * 1. 所有 rest 请求中的一些公共数据返回
 * 2. 添加自定义请求头
 *
 * Created by wuyaoqian on 14/7/30.
 */

import path from 'path';
import ErrorCodeUtil from 'data-sdk-util/lib/error-code-util';
import IpUtil from 'data-sdk-util/lib/ip-util';
import DataSdkRest from 'data-sdk-rest';
import DataSdkSocket from 'data-sdk-socket';
import Accepts from 'accepts';
import log4js from 'log4js-config';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));
const findRootSocket = function (socket) {
    const socketid = (socket.id || '').replace(/\/[^/#]+#/i, '');
    const connected = socket.server.of('/').connected;
    const rootSocket = connected[socketid] || connected['/#' + socketid];
    if (!rootSocket) {
        logger.warn('从 Socket(%s) 中查找不到 Root-Socket(%s) 连接！', socket.id, socketid);
    }
    return rootSocket;
};
const httpForceOutFn = function (req, res, { key, type, status }) {
    if (!req || !res || !req.session || !res.clearCookie || !req.session.destroy) {
        return logger.error(
            'detected req res obj was malformed then ignored (status: %s), \ntype: %s, url: %s',
            status, type, req ? req.url : null
        );
    }
    if (res.headersSent) {
        return logger.error(
            'detected response was send then ignored session destroy, \ntype: %s, url: %s', type, req.url
        );
    }
    res.clearCookie('sid');
    req.session.destroy(function () {
        if (Accepts(req).types('html') === 'html') {
            return res.redirect(req.url);
        }
        res.status(status);
        res.send(ErrorCodeUtil.getErrorCodeDesc(key, req).msg);
    });
};
const socketForceOutFn = function (socket, { key, type, status }) {
    // 发送到 namespace为 “/” 的socket 上（因为全局的）
    const restInfo = DataSdkRest.userDataManage.socketRequest.restInfo.get(socket.request) || {};
    const rootSocket = findRootSocket(socket);
    if (!rootSocket) { return; }
    if (!restInfo || !restInfo['session-store'] || !restInfo.sid) {
        return logger.warn('找不到 Socket(%s) 连接中所记录的相关信息, 用来发送 %s 指令', rootSocket.id, type);
    }
    restInfo['session-store'].destroy(restInfo.sid, function () {
        // rootSocket.emit(status, ErrorCodeUtil.getErrorCodeDesc(key, restInfo.lang).msg);
        rootSocket.emit(type, ErrorCodeUtil.getErrorCodeDesc(key, restInfo.lang).msg);
    });
};
const baseForceOut = function (context, errorKey, errorType, httpStatusCode) {
    let param = {
        key: errorKey,
        type: errorType,
        status: httpStatusCode
    };
    if (context.req) {
        httpForceOutFn(context.req, context.res, param);
    } else if (context.socket) {
        socketForceOutFn(context.socket, param);
    }
};

/**
 * 1. baseRestler 的自定义请求头添加
 */
DataSdkRest.baseRestler.addCustomGlobalHeader(function (options) {
    let browserRequest = options.req;
    if (browserRequest && browserRequest.headers) {
        return (require('distributed-trace-for-nodejs')).toRequestHeader(browserRequest);
    }
}).addCustomGlobalHeader('User-Agent', function (options) {
    let browserRequest = options.req || (options.socket ? options.socket.request : null);
    if (browserRequest && browserRequest.headers) {
        return browserRequest.headers['user-agent'] || '';
    }
    if (browserRequest && browserRequest.session && browserRequest.session['client']) {
        return browserRequest.session['client']['user-agent'] || '';
    }
}).addCustomGlobalHeader('user_ip', function (options) {
    let browserRequest = options.req || (options.socket ? options.socket.request : null);
    if (browserRequest && browserRequest.headers) {
        return IpUtil.getClientIp(browserRequest);
    }
    if (browserRequest && browserRequest.session && browserRequest.session['client']) {
        return browserRequest.session['client']['ip'] || '';
    }
}).addCustomGlobalHeader(function (options) {
    let browserRequest = options.req || (options.socket ? options.socket.request : null);
    let header;
    if (browserRequest && browserRequest.headers) {
        header = {};
        header['td'] = header['terminal_device'] = browserRequest.headers['td'] || '';
        header['fpr'] = browserRequest.headers['fpr'] || '';
    }
    if (!header && browserRequest && browserRequest.session && browserRequest.session['client']) {
        header = {};
        header['td'] = header['terminal_device'] = browserRequest.session['client']['td'] || '';
        header['fpr'] = browserRequest.session['client']['fpr'] || '';
    }
    return header;
});

/**
 * 2. userToken 全局事件拦截
 */
DataSdkRest.userTokenEvent.on('token-refresh-expired', function (context) {
    baseForceOut(context, 'too-long-in-unactivated-state', 'token-refresh-expired', 451);
}).on('token-not-exist', function (context) {
    baseForceOut(context, 'force-logout', 'token-not-exist', 452);
}).on('token-was-kicked', function (context) {
    baseForceOut(context, 'login-in-other-place', 'token-was-kicked', 453);
}).on('token-was-kicked-by-sso', function (context) {
    baseForceOut(context, 'sso-logout', 'token-was-kicked-by-sso', 454);
}).on('token-was-kicked-by-manager', function (context) {
    // 暂时使用 token-not-exist 的处理方式（因为原来也是没有区分这个逻辑）2018-04-08
    baseForceOut(context, 'force-logout', 'token-not-exist', 452);
}).on('token-force-out', function (context, errorCodeNumber) {
    baseForceOut(context, errorCodeNumber + '', 'token-force-out', 455);
});

/**
 * 3. socket-push 的自定义请求参数
 */
// DataSdkSocket.pushServer.addCustomGlobalHeader('ext', function (clientSocket) {
//     let browserRequest = clientSocket.request;
//     if (browserRequest && browserRequest.headers) {
//         return {
//             'user_ip': IpUtil.getClientIp(browserRequest),
//             'User-Agent': browserRequest.headers['user-agent'] || ''
//         };
//     }
// });

/**
 * 4. socket-push 全局事件拦截
 */
DataSdkSocket.pushServer.events.on('session-expired', function (instance, clientSocket) {
    baseForceOut({ socket: clientSocket }, 'session-expired', 'session-expired', 401);
});
