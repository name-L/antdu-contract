/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/*
 * WEB应用入口 (dev)
 */

import './build/hot-reload-nodejs.js';
import path from 'path';
import {
    app,
    filters,
    initSessionStore,
    handleController,
    handleError,
    handleSystem,
    startServer
} from './server/app.base.js';
import devTempServer from './build/dev-temp-server';

initSessionStore({
    type: 'caster',
    opt: { storeCustomInfo: false }
}).then(() => {
    return devTempServer(app);
}).then(() => {
    // global-filter
    filters.forEach(filter => filter());

    // system
    handleSystem({ uncaughtException: false });

    // controller
    handleController({
        statics: {
            // 这个注释是强制在开发阶段使用 client 目录下的静态资源
            // path: path.join(__dirname, 'static'),
            favicon: path.join(__dirname, 'client/asset/image/favicon.ico')
        },
        session: {
            check: false
            // check: {list: ['fp', 'user-agent', ['ip', (req, preIp) => preIp === '127.0.0.1']]}
        }
    });

    // error
    handleError();

    // start
    startServer();
});
