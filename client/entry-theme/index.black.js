/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * index.black.js
 * Created by wuyaoqian on 2017/4/9.
 */

const entryName = 'index';
const themeName = 'black';

// 注意：entryModuleKey 需要与 webpack.help.js 中 getThemes 返回的 key 一至
const entryModuleKey = `main:${entryName}`;

// 注意1：require.ensure, require.context 的相关参数不能使用变量值
// 注意2：require.context 返回的是一个类似 map：{filename: resource, ...} 的函数
// @params：ThemeManage.add(theme, resource, key)
(require('@component-util/theme-manage')).add(themeName, ((data) => {
    return data.keys().map((key) => data(key));
})(require.context('../../client', true,
    /\/theme\/black\.(js|less)$/
)), entryModuleKey);
