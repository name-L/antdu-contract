/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * entry.js.js
 * Created by wuyaoqian on 2018/7/20.
 */

const fs = require('fs');
const path = require('path');

const dir = `${__dirname}/mock-server`;
const route = {};

fs.readdirSync(dir).forEach(function (fileName) {
    Object.assign(route, require(path.join(dir, fileName)));
});

module.exports = route;
