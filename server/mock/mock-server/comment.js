/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * comment.js
 * Created by wuyaoqian on 2018/7/20.
 */

const comments = require('../mock-data/comment.json');

module.exports = {
    'GET /asimov/v1/comment/list': comments
};
