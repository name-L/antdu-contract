/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * postcss.config.js.js
 * Created by wuyaoqian on 2017/11/24.
 */

module.exports = {
    plugins: {
        'postcss-import': {},
        'autoprefixer': { jh8rs: 'last 2 versions' },
        'cssnano': {
            discardComments: { removeAll: true },
            // 不需要动态计算 z-index 值（特别是多应用之间）
            zindex: false,
            reduceIdents: {
                // 用于处理多应用之间的 keyframes 的重名问题
                encoder: function (value, index) {
                    return `${value.toLowerCase()}-${parseInt(Math.random() * 1e3)}`;
                }
            }
        }
    }
};
