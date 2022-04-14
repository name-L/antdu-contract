/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * Created by wuyaoqian on 16-8-30.
 * Session 验证
 */

import path from 'path';
import log4js from 'log4js-config';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));

export default function (opt) {
    opt = opt || {};
    opt.browserInfoKeyInSession = opt.key || 'client';
    opt.redirectUrlWhenFail = opt.redirect || '/';
    opt.checkList = (Array.isArray(opt.list) ? opt.list : [opt.list]).map((obj) => {
        if (!obj) { return null; }
        if (typeof obj === 'string') {
            return {
                key: obj,
                test: function (req, pre) { return req.header(obj) === pre; }
            };
        }
        if (Array.isArray(obj) && typeof obj[0] === 'string') {
            return {
                key: obj[0],
                test: (typeof obj[1] === 'function') ? obj[1] : function (req, pre) {
                    return req.header(obj[0]) === pre;
                }
            };
        }
        if (typeof obj.key === 'string') {
            return {
                key: obj.key,
                test: (typeof obj.test === 'function') ? obj.test : function (req, pre) {
                    return req.header(obj.key) === pre;
                }
            };
        }
    }).filter(obj => !!obj);

    return function sessionChecker (req, res, next) {
        if (!req.session) {
            return next();
        }
        logger.isDebugEnabled() && logger.debug('session checking...');
        let preClientInfo = req.session[opt.browserInfoKeyInSession];

        // 0. 未在 session 中存储任何信息，直接跳过
        if (!preClientInfo) { return next(); }

        // 1. 循环检测
        let match = opt.checkList.find((obj) => {
            // 跳过未存储的无效检测
            if (!preClientInfo[obj.key]) { return false; }
            // 检测到不匹配信息（终止循环），返回出错信息
            if (!obj.test(req, preClientInfo[obj.key])) {
                return true;
            }
        });

        // 2. 判断结果
        if (match) {
            logger.warn(
                '检测到当前 Session( name: %s, id: %s ) 的 %s 已发生改变, 故销毁当前 Session 并重定向到 "%s".\n%s: %s\n%s: %s',
                req.session.user ? req.session.user.username || 'none' : 'none',
                req.session.id, match.key, opt.redirectUrlWhenFail,
                `Pre-${match.key}`, preClientInfo[match.key], `New-${match.key}`, req.header(match.key)
            );
            res.clearCookie(global.session_key);
            req.session.destroy(function () {
                res.redirect(opt.redirectUrlWhenFail);
            });
        } else {
            next();
        }
    };
};
