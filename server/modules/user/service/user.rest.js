/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

/**
 * 用户相关基本服务
 * Created by wuyaoqian on 14/7/30.
 */
'use strict';

import path from 'path';
import log4js from 'log4js-config';
import DataSdkRest from 'data-sdk-rest';
import IpUtil from 'data-sdk-util/lib/ip-util';
import RestUtil from 'data-sdk-util/lib/rest-util';
import {
    user as userConfig,
    // system as sysConfig,
    oauth as authConfig
} from 'config';

const UserDTO = require(`${global.module_root_path}/common/dto/user.dto.js`);
const logger = log4js.get(global.log_prefix_name + path.basename(__filename));
const RestHelp = RestUtil.getInstance(logger);

/**
 * 获取用户的应用配置信息
 * @param loginEventEmitter
 * @param req
 * @param res
 * @param authInfo {object}
 * @param authToken {object}
 * @param loginUserName {string}
 * @private
 */
const _fetchUserAppConfig = function (loginEventEmitter, req, res, authInfo, authToken, loginUserName) {
    const user = UserDTO.translate(authInfo, {});
    DataSdkRest.userDataManage.session.userToken.set(req.session, authToken, user.username);
    DataSdkRest.userDataManage.session.userInfo.set(req.session, user.userid, user.username);
    const token = DataSdkRest.userDataManage.session.userToken.get(req.session);
    logger.info(
        'token info (A: %s, R: %s, E: %s) saved into session \nuser: %s, sid: %s',
        token.access_token, token.refresh_token, token.expires_in, user.username, req.session.id
    );
    loginEventEmitter.emit('success', user);

    // RestHelp.baseRest.get(userConfig.userAppConfigUrl, {
    //     req: req,
    //     res: res,
    //     headers: {
    //         "Authorization": "oauth2 " + authToken.access_token
    //     },
    //     loginUserName: loginUserName
    // }, null, {
    //     error: function (eventEmitter, errorCodeDesc) {
    //         loginEventEmitter.emit("error", errorCodeDesc);
    //     },
    //     success: function (eventEmitter, appConfig) {
    //         const user = UserDTO.translate(authInfo, appConfig);
    //         DataSdkRest.userDataManage.session.userToken.set(req.session, authToken, user.username);
    //         DataSdkRest.userDataManage.session.userInfo.set(req.session, user.userid, user.username);
    //         logger.info(
    //             "success fetched user appConfig ( %s ) detail(login) from ip( %s ).",
    //             user.username, IpUtil.getClientIp(req)
    //         );
    //
    //         // // 通知 common-header-custom-part.ejs 自动处理登录ticket的重置问题;
    //         // req.session._resetAutoLogin = true;
    //         // res.cookie("tid", 'reset');
    //
    //         loginEventEmitter.emit("success", user);
    //     }
    // });
};

/**
 * 通过 ticket 登录
 * @param req
 * @param res
 * @param t {string}
 */
const loginByTicket = function (req, res, t) {
    let ticket = (t || '').substr(0, 100);
    let loginUserName = 'ticket: ' + ticket;
    return RestHelp.appRest.post(userConfig.loginByTicketUrl).opt({
        'req': req,
        'res': res,
        'loginUserName': loginUserName
    }).data({
        'ticket': ticket
    }).error(function (eventEmitter, errorCodeDesc) {
        eventEmitter.emit('error', errorCodeDesc);
    }).success(function (eventEmitter, data) {
        logger.info(
            'success fetched user (name: %s, sid: %s) auth detail(login) from ip( %s ).',
            loginUserName, req.session.id, IpUtil.getClientIp(req)
        );
        _fetchUserAppConfig(eventEmitter, req, res, data.user, data.token, loginUserName);
    }).send();
};

/**
 * 主动安全退出系统
 * @param req
 * @param res
 * @returns {EventEmitter}
 */
const logout = function (req, res) {
    let authToken = DataSdkRest.userDataManage.session.userToken.get(req.session);
    let user = DataSdkRest.userDataManage.session.userInfo.get(req.session);
    return RestHelp.baseRest.get(userConfig.logoutUrl).opt({
        'req': req,
        'res': res
    }).header({
        'Authorization': 'oauth2 ' + authToken.access_token
    }).error(function (eventEmitter, errorCodeDesc) {
        eventEmitter.emit('error', errorCodeDesc);
    }).success(function (eventEmitter) {
        logger.info(
            'user (%s) request logout from ip (%s) was successful.',
            user.username,
            IpUtil.getClientIp(req) || 'unknown-ip'
        );
        eventEmitter.emit('success');
    }).send();
};
/**
 * 获取登录验证码
 * @param req
 * @param res
 * @param username
 * @param width
 * @param height
 * @returns {*}
 */
const fetchLoginCaptcha = function (req, res, username, width, height) {
    let size = _captchaSize({
        width: width,
        height: height
    });
    return RestHelp.appRest.get(userConfig.loginRefreshCaptcha).opt({
        req: req,
        res: res,
        headers: { 'session_id': req.session.id }
    }).data({
        'user_name': username || undefined,
        'width': size.width,
        'height': size.height
    }).send();
};
/**
 * 规范 captcha 大小
 * @param opt
 * @return {{width: number, height: number}}
 * @private
 */
const _captchaSize = function (opt) {
    let width = 180;
    let height = 64;
    if (opt) {
        width = Math.min(Math.abs(parseInt(opt.width)) || width, 300);
        height = Math.min(Math.abs(parseInt(opt.height)) || height, 80);
    }
    return {
        width: width,
        height: height
    };
};
/**
 * 通过用户名与密码登录
 * @param req
 * @param res
 * @param username {string}
 * @param password {string}
 * @param opt {object} {
 *      captcha, width, height
 * }
 * @return {*}
 */
const login = function (req, res, username, password, opt) {
    let size = _captchaSize(opt);
    return RestHelp.appRest.post(userConfig.loginUrl, {
        req: req,
        res: res,
        headers: {
            'session_id': req.session.id
        },
        loginUserName: username
    }, {
        'client_id': authConfig.appKey,
        'client_secret': authConfig.appSecret,
        'user_name': username.substr(0, 50),
        'password': password.substr(0, 50),
        'captcha': opt ? opt.captcha.substr(0, 6) : null,
        'width': size.width,
        'height': size.height
    }, {
        error: function (eventEmitter, errorCodeDesc) {
            eventEmitter.emit('error', errorCodeDesc);
        },
        success: function (eventEmitter, data) {
            logger.info(
                'success fetched user auth ( %s ) detail(login) from ip( %s ).',
                username, IpUtil.getClientIp(req)
            );
            _fetchUserAppConfig(eventEmitter, req, res, data.user, data.token, username);
        }
    });
};

/**
 * 刷新验证码
 * @param req
 * @param res
 */
const refreshCaptcha = function (req, res) {
    let params = req.query;

    return RestHelp.appRest.get(userConfig.loginRefreshCaptcha, {
        req: req,
        res: res,
        headers: {
            session_id: req.sessionID,
            remote_addr: IpUtil.getClientIp(req),
            user_ip: IpUtil.getClientIp(req)
        }
    }, {
        width: params.width || 200,
        height: params.height || 80
    });
};

export default {
    login,
    logout,
    loginByTicket,
    fetchLoginCaptcha,
    refreshCaptcha
};
