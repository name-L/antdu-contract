/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/*
 * WEB应用入口 (prod)
 */

import path from 'path';
import {
    filters,
    initSessionStore,
    handleController,
    handleError,
    handleSystem,
    startServer
} from './server/app.base.js';

initSessionStore({
    type: 'caster',
    opt: { storeCustomInfo: false }
}).then(() => {
    // global-filter
    filters.forEach(filter => filter());

    // system
    handleSystem({ uncaughtException: true });

    // controller
    handleController({
        statics: {
            path: path.join(__dirname, 'static'),
            favicon: path.join(__dirname, 'static/img/favicon.ico')
        },
        session: {
            check: false
        }
    });

    // error
    handleError();

    // start
    startServer();
});
