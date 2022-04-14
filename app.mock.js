/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * app.mock.js
 * Created by wuyaoqian on 2018/7/20.
 */

const path = require('path');
const express = require('express');
const config = require('config');
const apiMocker = require('webpack-api-mocker');
const app = express();

app.set('port', process.env.port || config.system.mockPort || '10086');

apiMocker(app, path.resolve('./server/mock/server-entry.js'));
app.listen(app.get('port'), function () {
    console.log(`${` ------ Mock server started at: ${app.get('port')} ------ `.green_b.black}\n`);
});
