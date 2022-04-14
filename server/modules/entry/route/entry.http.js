/**
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import actionModule from '../action/entry.controller.js';

/**
 * 各首页的路径请求配置
 * Created by {wuyaoqian} on 2016/12/01.
 */
export default {
    module: actionModule,
    routes: [
        {
            'filename': 'index.tpl',
            'method': 'get',
            'path': [`${global.ctx_path}/`],
            'extract': true,
            'session': true,
            // 'filter': (req, res, next) => {
            //     console.info(
            //         'user: %s, ip: %s, \nua: %s',
            //         req.session.user ? req.session.user.username : req.session.id,
            //         (require('data-sdk-util/lib/ip-util')).getClientIp(req),
            //         req.header('user-agent')
            //     );
            //     next();
            // },
            'passport': true,
            'handler': ['index']
        },
        {
            'method': 'get',
            'path': [`${global.ctx_path}/login-sso`],
            'extract': true,
            'session': true,
            'handler': 'loginWithVisibleSSO'
        },
        {
            'filename': 'login.tpl',
            'method': 'get',
            'path': [`${global.ctx_path}/login`, `${global.ctx_path}/login-normal`],
            'extract': true,
            'session': true,
            'handler': 'loginWithNormal'
        }
    ]
};
