/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * Created by wuyaoqian on 14-1-20.
 * 权限验证
 */

const checkRoles = function (requiredRole) {
    return function rolesChecker (req, res, next) {
        if (!req.session) {
            return next();
        }
        if (typeof requiredRole === 'function') {
            requiredRole = requiredRole(req, res);
        }
        // 未配置权限的情况下，允许通过
        if (!requiredRole || (Array.isArray(requiredRole) && requiredRole.length === 0)) {
            next();
        } else {
            // 包含指定权限的情况下，允许通过
            if (req.session.user && req.session.user.roles && isContains(req.session.user.roles, requiredRole)) {
                next();
            } else {
                res.status(403);
                next(new Error('您好像没有足够权限访问所请求的资源哦'));
            }
        }
    };
};

/**
 * 检测数组内的元数是否包含另一个数组内的元数
 * @param arrayObjSrc {Array}
 * @param arrayObjDest {Array}
 * @returns {boolean}
 */
const isContains = function (arrayObjSrc, arrayObjDest) {
    let isExist = false;
    arrayObjSrc.some(function (aObj) {
        arrayObjDest.some(function (bObj) {
            if (aObj === bObj) {
                return (isExist = true);
            }
        });
        if (isExist) {
            return true;
        }
    });
    return isExist;
};

export default checkRoles;
