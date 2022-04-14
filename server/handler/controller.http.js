/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * Created by wuyaoqian on 16/11/17
 * 所有请求路由资源控制器 (http)
 */

import { system as appConfig } from 'config';
import routes from '../route.http.js';
import rolesChecker from './controller-roles.http.js';
import passportChecker from './controller-passport.http.js';

/**
 * 初始化 资源控制器
 * @param {object} app
 *
 * @param {object} parser
 * @param {function} parser.extract
 * @param {function} parser.consume
 *
 * @param {object} session
 * @param {object} session.store
 * @param {function} session.handler
 * @param {function|null} session.checker
 *
 * @param {object} opt
 * @param {object} opt.statics
 * @param {string|null} opt.statics.path
 * @param {string|function} opt.statics.favicon
 * @param {object} opt.session
 * @param {boolean} opt.session.check
 */
const initController = function (app, parser, session, opt) {
    routes.forEach((routeConfig) => {
        routeConfig = routeConfig.__esModule ? routeConfig.default : routeConfig;
        if (!Array.isArray(routeConfig.routes) || !routeConfig.routes.length) { return; }
        routeConfig.routes.forEach((route) => {
            // 0. reset-config
            if (opt && route.config && typeof route.config === 'function') {
                route = route.config(route, parser, session, opt);
            }
            if (!route.handler) { return; }
            if (route.method !== 'use' && !route.path) {
                throw new Error(`route.path must be exist when route.method !== use: ${JSON.stringify(route)}`);
            }

            // 1. route-config
            let routeHandlerArray = (route.path ? [route.path] : []).concat(
                [function routeConfigRecordHandler (req, res, next) {
                    if (req['ROUTE_CONFIG']) {
                        if (!req['PRE_ROUTE_CONFIG_CHAIN']) {
                            Object.defineProperty(req, 'PRE_ROUTE_CONFIG_CHAIN', { value: [] });
                        }
                        req['PRE_ROUTE_CONFIG_CHAIN'].push(req['ROUTE_CONFIG']);
                    }
                    Object.defineProperty(req, 'ROUTE_CONFIG', {
                        value: route,
                        configurable: true
                    });
                    next();
                }]
            );

            // 2. route-extract（ each handler: one request, execute one time ）
            route.extract = !route.extract ? [] : (
                route.extract === true ? [] : route.extract
            );
            (Array.isArray(route.extract) ? route.extract : [route.extract]).forEach((key) => {
                if (typeof key === 'function') {
                    routeHandlerArray.push(executeFunctionOneTimeByRequest(key));
                } else if (typeof key === 'string' || (key && typeof key.key === 'string')) {
                    routeHandlerArray.push(executeFunctionOneTimeByRequest(parser.extract([key])[0]));
                } else {
                    throw new Error(`route.extract error: ${JSON.stringify(route)}`);
                }
            });

            // 3. route-session（ each handler: one request, execute one time ）
            if (route.session && session.handler) {
                if (typeof session.handler === 'function') {
                    routeHandlerArray.push(executeFunctionOneTimeByRequest(session.handler));
                } else if (Array.isArray(session.handler) && typeof session.handler.custom === 'function') {
                    session.handler.custom(route.session, route).forEach((fn) => {
                        routeHandlerArray.push(executeFunctionOneTimeByRequest(fn));
                    });
                }
                session.checker && routeHandlerArray.push(executeFunctionOneTimeByRequest(session.checker));
            }

            // 4. route-consume（ each handler: one request, execute one time ）
            route.consume = !route.consume ? [] : (
                route.consume === true ? ['json', 'urlencoded'] : route.consume
            );
            (Array.isArray(route.consume) ? route.consume : [route.consume]).forEach((key) => {
                if (typeof key === 'function') {
                    routeHandlerArray.push(executeFunctionOneTimeByRequest(key));
                } else if (typeof key === 'string' || (key && typeof key.key === 'string')) {
                    routeHandlerArray.push(executeFunctionOneTimeByRequest(parser.consume([key])[0]));
                } else {
                    throw new Error(`route.consume error: ${JSON.stringify(route)}`);
                }
            });

            // 5. route-filter
            if (route.filter) {
                if (typeof route.filter === 'function') {
                    routeHandlerArray.push(route.filter);
                } else if (typeof route.filter === 'string' && routeConfig.module) {
                    routeHandlerArray.push(function customStringRouteFilter () {
                        routeConfig.module[route.filter].call(this, ...arguments);
                    });
                }
            }

            // 6. route-passport
            route.passport = (route.passport === true ? {
                'needLogin': true,
                'showWarningTip': true
            } : (route.passport === false ? {
                'needLogin': false
            } : route.passport));
            if (route.passport && (typeof route.passport === 'function' || route.passport.needLogin === true)) {
                routeHandlerArray.push(passportChecker(route.passport));
            }

            // 7. route-role
            if (route.roles && (
                typeof route.roles === 'function' ||
                (Array.isArray(route.roles) && route.roles.length)
            )) {
                routeHandlerArray.push(rolesChecker(route.roles));
            }

            // 8. route-handler
            (Array.isArray(route.handler) ? route.handler : [route.handler]).forEach((obj) => {
                if (typeof obj === 'function') {
                    routeHandlerArray.push(obj);
                } else if (typeof obj === 'string') {
                    routeHandlerArray.push(changeWrapFunctionName(function customStringRouteHandler () {
                        (routeConfig.module)[obj].call(this, ...arguments);
                    }, (routeConfig.module)[obj]));
                }
            });
            app[route.method].apply(app, routeHandlerArray);
        });
    });
    // 处理所有前面未拦截的请求处理
    // 1. 业务请求:
    //      1. 未登录：重定向到登录页
    //      2. 已登录：重定向到首页
    // 2. 静态请求:
    //      1. 不存在: 返回404
    app.use(function (req, res, next) {
    // static 目录下的请求，已在 app.base.js 有拦截了，理论上这个判断已经不需要了（这里只是做一个保障）
        if (/(\/(static|js|img|font|css)\/.*)|([^.]+\.[^.]+(\?|$))/i.test(req.originalUrl)) {
            next();
        } else {
        // if(req.session.user){
        //     return res.redirect(`${global.ctx_path || "/"}`);
        // } else {
        //     return res.redirect(`${global.ctx_path}/login`);
        // }
            return res.redirect(`${global.ctx_path || '/'}`);
        }
    });
};

/**
 * 修改 outer 的函数名
 * @param {function} outer
 * @param {function} inner
 * @return outer
 */
const changeWrapFunctionName = function (outer, inner) {
    Object.defineProperty(outer, 'name', {
        value: `wrap-${inner.name}`,
        configurable: true
    });
    return outer;
};

/**
 * 包装一个函数，使得每一次请求，同一函数只执行一次
 * @param {function} fn
 * @return {Function}
 */
const executeFunctionOneTimeByRequest = function (fn) {
    let retFN = function wrapFunction (req, res, next) {
        if (!req['EXECUTED_FN_BY_REQUEST']) {
            Object.defineProperty(req, 'EXECUTED_FN_BY_REQUEST', { value: new Set() });
        }
        if (req['EXECUTED_FN_BY_REQUEST'].has(fn)) { return next(); }
        req['EXECUTED_FN_BY_REQUEST'].add(fn);
        fn.call(this, req, res, next);
    };
    return changeWrapFunctionName(retFN, fn);
};

export default function (app, parser, session, opt) {
    // 分布式日志记录
    if (appConfig.zpkin) {
        const trace = require('distributed-trace-for-nodejs');
        trace.init(appConfig.zpkin);
        app.use(trace.trace);
    }

    // 初始化 controller
    initController(app, parser, session, opt);
    return app;
};
