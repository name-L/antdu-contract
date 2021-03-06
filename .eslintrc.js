/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * eslint.config.js.js
 * @see: http://eslint.cn/docs/rules
 * @see: https://eslint.org/docs/rules
 * Created by wuyaoqian on 2018/5/14.
 */

module.exports = {
    'parser': 'babel-eslint',
    'extends': 'standard',
    'plugins': [
        'html', 'vue'
    ],
    'env': {
        'browser': true,
        'node': true,
        'es6': true
    },
    'globals': {},
    'rules': {
        'semi': ['error', 'always'],
        'indent': ['warn', 4],
        'max-len': ['warn', 120],
        'object-curly-spacing': ['warn', 'always']
    }
};
