/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import actionModule from '../action/user.controller.js';

/**
 * 请求路径 - user
 * Created by wuyaoqian on 14/9/24.
 */

export default {
    module: actionModule,
    routes: [
        {
            'method': 'get',
            'path': ['/logout'].concat(global.ctx_path ? [`${global.ctx_path}/logout`] : []),
            'extract': true,
            'session': true,
            'handler': 'logout'
        },
        {
            'method': 'post',
            'path': `${global.ctx_path}/user-check`,
            'extract': true,
            'consume': true,
            'session': true,
            'handler': 'loginValidate'
        },
        {
            'method': 'post',
            'path': `${global.ctx_path}/user-login`,
            'handler': 'user_login',
            'passport': false,
            'extract': true,
            'session': true,
            'consume': true
        },
        {
            'method': 'get',
            'path': `${global.ctx_path}/login-captcha`,
            'extract': true,
            'session': true,
            'handler': 'refreshCaptcha'
        }
    ]
};
