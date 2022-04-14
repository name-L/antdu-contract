/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 存放自定义的全局过滤（ 具体写法参照 app.base.js ）
 * global.filter.js.js
 * Created by wuyaoqian on 2020/6/19.
 */

const filters = {};

// 全局过滤器的过滤顺序，默认为定义的顺序，eg：['ctx', 'fpr', 'td', ...]
const orders = [];

module.exports = {
    filters,
    orders
};
