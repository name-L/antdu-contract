/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * Created by wuyaoqian on 16/11/17.
 * 登录验证 (http)
 */

const checkLogin = function (passport) {
    return function passportChecker (req, res, next) {
        if (!req.session) {
            return next();
        }
        if (typeof passport === 'function') {
            let ret = passport(req, res);
            if (typeof ret === 'object') {
                passport.needLogin = ret.needLogin;
                passport.showWarningTip = ret.showWarningTip;
            } else {
                passport.needLogin = !!ret;
            }
        }
        if (!passport.needLogin || req.session.user) {
            next();
        } else {
            res.status(401);
            next(new Error('您所访问的资源可是需要登录的哦'));
        }
    };
};

export default checkLogin;
