/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 全局变量设置
 * Created by wuyaoqian on 2017/2/22.
 */

const config = require('config');
const obj = config.system.global;

Object.keys(obj).forEach((name) => {
    Object.defineProperty(global, name, {
        value: obj[name],
        configurable: true
    });
});
