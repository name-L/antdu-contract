/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 用户相关 controller
 * Created by wuyaoqian on 14-1-7.
 */

import path from 'path';
import SessionUtil from 'data-sdk-util/lib/session-util';
import EntryUtil from '../../common/util/tpl-render-util';
import UserService from '../service/user.rest.js';
import log4js from 'log4js-config';

import {
    system as sysConfig
} from 'config';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));

/**
 * 主动注销用户
 * @param req
 * @param res
 */
const logout = function logoutHandler (req, res) {
    res.clearCookie('sid');
    if (!req.session.user) {
        logger.isDebugEnabled() && logger.debug('访问/logout时，发现用户已注销，自动跳转到首页');
        res.redirect('/');
    } else {
        // 因为是单点退出，所以需要等待返回结果，才销毁 session
        UserService.logout(req, res).on('error', function () {
            req.session.destroy(function () {
                res.redirect('/');
            });
        }).on('success', function () {
            req.session.destroy(function () {
                res.redirect('/');
            });
        });
    }
};

// 被动注销用户（监听 Caster Session 的 过期，一般是关闭浏览器的退出，即被动注销用户）
process.nextTick(function () {
    SessionUtil.startWatchSessionExpire(sysConfig.session.casterMapName, true);
});

/**
 * 正常登录验证
 * @param req
 * @param res
 */
const loginValidate = function loginValidateHandler (req, res) {
    console.log(req.body, 'loginValidate');
    UserService.login(req, res, req.body.username || '', req.body.password || '', {
        captcha: req.body.captcha || ''
    }).on('success', (user) => {
        req.session.user = user;
        res.redirect('/');
    }).on('error', (errorCodeDesc) => {
        EntryUtil.setRenderData(req, { error: errorCodeDesc.msg });
        res.redirect('/login-normal');
    });
};
/**
 * 刷新验证码
 * @param req
 * @param res
 */
const refreshCaptcha = function (req, res) {
    UserService.refreshCaptcha(req, res)
        .on('success', function (imageData) {
            res.json({
                success: true,
                imageData
            });
        })
        .on('error', function (errorCodeDesc) {
            res.json({
                success: false,
                error: errorCodeDesc
            });
        });
};

/**
 * 用户登录
 * @param req
 * @param res
 */
const userLogin = function (req, res) {
    let username = req.body.username;
    let password = req.body.password;
    let opt = {
        captcha: req.body.captchaVal,
        width: req.body.captchaWidth,
        height: req.body.captchaHeight
    };
    // 开始登录
    UserService.login(req, res, username, password, opt, req.body['t'])
        .on('success', function (data) {
            loginSuccessAndJson(req, res, data);
        })
        .on('error', function (errorCodeDesc) {
            loginError(res, errorCodeDesc);
        });
};
function loginSuccess (req, res, data) {
    req.session.user = data;
    logger.info('login success:', req.session.user.username);
}

function loginSuccessAndJson (req, res, data) {
    loginSuccess(req, res, data);
    res.json({
        success: true,
        data: data
    });
}
function loginError (res, errorCodeDesc) {
    logger.info('errorCodeDesc:' + errorCodeDesc);
    // 11047 登录失败需要验证码
    // 11048 用户名密码不正确，且需要继续输入验证码
    // 11107 验证码输入错误
    if (errorCodeDesc.code === 11048 || errorCodeDesc.code === 11047 || errorCodeDesc.code === 11107) {
        res.json({
            success: false,
            imageData: errorCodeDesc.data,
            error: {
                errorCode: errorCodeDesc.code,
                errorDescription: errorCodeDesc.msg
            }
        });
    } else {
        res.json({
            success: false,
            error: {
                errorCode: errorCodeDesc.code,
                errorDescription: errorCodeDesc.msg
            }
        });
    }
}
export default {
    logout: logout,
    user_login: userLogin,
    loginValidate: loginValidate,
    refreshCaptcha: refreshCaptcha
};
