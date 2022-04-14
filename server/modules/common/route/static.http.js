/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import expressFavicon from 'serve-favicon';
import expressStatic from 'serve-static';
import { system as config } from 'config';

/**
 * static.http.js
 * Created by wuyaoqian on 2019/11/4.
 */

/**
 * favicon route pre-config
 * @param routeConfig
 * @param parser
 * @param session
 * @param opt
 * @return {*}
 */
const favConfig = function (routeConfig, parser, session, opt) {
    // init handler
    if (!routeConfig.handler && opt && opt.statics && opt.statics.favicon) {
        if (typeof opt.statics.favicon === 'function') {
            routeConfig.handler = function customFaviconHandler (req, res, next) {
                // rewrite url & next static will handle
                req.url = opt.statics.favicon.call(this, req);
                return next();
            };
        } else if (typeof opt.statics.favicon === 'string') {
            // normal express favicon handle
            routeConfig.handler = expressFavicon(opt.statics.favicon);
        }
    }
    // remove config handler
    delete routeConfig.config;
    return routeConfig;
};

/**
 * static resource route pre-config
 * @param routeConfig
 * @param parser
 * @param session
 * @param opt
 * @return {*}
 */
const staticConfig = function (routeConfig, parser, session, opt) {
    // init handler
    if (!routeConfig.handler && opt && opt.statics && opt.statics.path) {
        routeConfig.handler = expressStatic(opt.statics.path, {
            // 单位：毫秒（ expressStatic 框架会将值转换成：'Cache-Control', `public, max-age= ${config.staticMaxAge / 1000}`）
            maxAge: config.staticMaxAge,
            redirect: false,
            setHeaders: function (res) {
                res.set('Access-Control-Allow-Origin', '*');
            }
        });
    }
    // remove config handler
    delete routeConfig.config;
    return routeConfig;
};

export default {
    module: null,
    // 将此路由放在第1个位置（其它没有顺序要求的路由可以不用设置）
    position: 1,
    routes: [
        // 1. favicon
        {
            'filename': null,
            'method': 'get',
            'path': ['/favicon.ico'].concat(global.ctx_path ? [`${global.ctx_path}/favicon.ico`] : []),
            'extract': [],
            'session': false,
            'consume': [],
            'filter': null,
            'passport': false,
            'roles': false,
            'handler': null,
            'config': favConfig
        },
        // 2. static
        {
            'filename': null,
            'method': 'use',
            'path': [`${global.ctx_static_path}`],
            'extract': [],
            'session': false,
            'consume': [],
            'filter': null,
            'passport': false,
            'roles': false,
            'handler': null,
            'config': staticConfig
        },
        // 3. static 404
        {
            'filename': null,
            'method': 'use',
            'path': [`${global.ctx_static_path}`],
            'extract': [],
            'session': false,
            'consume': [],
            'filter': null,
            'passport': false,
            'roles': false,
            'handler': [function static404Handler (req, res, next) {
                res.status(404);
                return next(new Error('static page not found!'));
            }],
            'config': null
        }
    ]
};
