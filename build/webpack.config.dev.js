/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * webpack打包配置（开发阶段）
 * Created by wuyaoqian on 2016/11/17.
 */

import webpack from 'webpack';
import base from './webpack.config.base.js';

const config = base.getConfig('development');
const options = base.options;
const plugins = base.plugins;

config.devtool = '#source-map';
// 注意：开发阶段，不能使用 chunkhash(每个 trunk 本身的 hash), 只能使用 hash（一次编译的全局 hash）
// https://blog.csdn.net/Scarlett_Dream/article/details/78856240
// 注意：除了 manifest 文件使用 filename 输出，其它的都会使用 chunkFilename 输出（原因未知：2018-09-12）
// https://github.com/webpack/webpack/issues/6598
config.output.filename = `js/[name].[hash:${options.hashLength}].js`;
config.output.chunkFilename = `js/[name].[hash:${options.hashLength}].js`;

config.plugins = (config.plugins || []).concat([
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.NamedModulesPlugin(),
    ...plugins.htmlWebpack({})
]);

const devClient = `webpack-hot-middleware/client?reload=false&path=${global.ctx_path}/__webpack_hmr`;
Object.keys(config.entry).forEach(function (name) {
    config.entry[name] = [devClient].concat(config.entry[name]);
});

export default config;
