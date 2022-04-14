/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * webpack打包配置（部署阶段）
 * 注意：这里不能使用  import 的形式引用模块，因为 prod build 时不支持
 * Created by wuyaoqian on 2016/11/17.
 */

/* eslint-disable indent */

const fs = require('fs');
require('date-utils');
(require('graceful-fs')).gracefulify(fs);

const CopyWebpackPlugin = require('copy-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const path = require('path');
const webpack = require('webpack');
const base = require('./webpack.config.base.js');

const mode = process.env.MODE || 'production';
const target = process.env.TARGET || 'www';
const isBundleAnalysis = !!process.env.ANALYSIS;
const buildTime = (new Date()).toFormat('MMDDHH24MI');

const config = base.getConfig(mode);
const options = base.options;
const plugins = base.plugins;

// 控制日志输出
config.stats = {
    assets: false,
    chunkModules: false
    // colors: true,
    // version: true,
    // hash: true,
    // timings: true,
    // chunks: true
};

// JS文件输出
config.output.filename = `js/[name].[chunkhash:${options.hashLength}].js`;
config.output.chunkFilename = `js/[name].[chunkhash:${options.hashLength}].js`;

// 优化选项
config.optimization = Object.assign({}, config.optimization, {
    minimizer: mode === 'production' ? [
        new UglifyJsPlugin({
            parallel: true,
            sourceMap: false,
            uglifyOptions: {
                compress: true,
                output: {
                    comments: false,
                    beautify: false
                }
            }
        }),
        new OptimizeCSSAssetsPlugin({})
    ] : []
});

// 使用插件
config.plugins = (config.plugins || []).concat([

    // 清理目录
    new CleanWebpackPlugin(['dist/**'], { root: path.resolve(__dirname, '../') }),

    // 创建 dist/logs 目录
    new function () {
        this.apply = function (compiler) {
            compiler.hooks.done.tap('done', function () {
                if (!fs.existsSync(path.resolve(__dirname, '../dist'))) {
                    fs.mkdirSync(path.resolve(__dirname, '../dist'));
                }
                fs.mkdirSync(path.resolve(__dirname, '../dist/logs'));
            });
        };
    }(),

    // 定义变量（打包时直接使用）
    new webpack.DefinePlugin({}),

    // 打包时模块id的取名规则
    new webpack.HashedModuleIdsPlugin(),

    // htmlWebpackPlugin
    ...plugins.htmlWebpack({
        minify: {
            removeComments: true,
            collapseWhitespace: true
        }
    }),

    // 是否是打包的分析模式
    ...(isBundleAnalysis ? [new (require('webpack-bundle-analyzer').BundleAnalyzerPlugin)()] : [])

]);

// 文件复制
config.plugins.push(
    new CopyWebpackPlugin([
        // assets 在 app.js 中引用的需要单独的复制 (favicon)
        {
            from: path.resolve(__dirname, '../client/asset/image/favicon.ico'),
            to: path.resolve(__dirname, '../dist/static/img/favicon.ico')
        },
        // node_modules 目录
        {
            from: path.resolve(__dirname, '../node_modules/**'),
            to: path.resolve(__dirname, '../dist/')
        },
        // package.json 文件
        {
            from: path.resolve(__dirname, '../package.json'),
            to: path.resolve(__dirname, '../dist/'),
            transform (content) {
                return content.toString()
                    .replace(/ *(["'])scripts\1:\s+{[^}]+},\r?\n/ig, '')
                    .replace(/ *(["'])devDependencies\1:\s+{[^}]+},\r?\n/ig, '');
            }
        },
        // config (local-lang) 目录
        {
            from: path.resolve(__dirname, '../config/local-lang/**'),
            to: path.resolve(__dirname, '../dist/')
        },
        // config (codes)) 目录
        {
            from: path.resolve(__dirname, '../config/codes/**'),
            to: path.resolve(__dirname, '../dist/')
        },
        // config/config-bak/default-vars-*.js
        {
            from: path.resolve(__dirname, `../config/config-bak/default-vars-${target}.js`),
            to: path.resolve(__dirname, '../dist/config/default-vars.js')
        },
        // config/config-bak/logging-*.json
        {
            from: path.resolve(__dirname, `../config/config-bak/logging-${target}.js`),
            to: path.resolve(__dirname, '../dist/config/logging.js')
        },
        // config/default.js
        {
            from: path.resolve(__dirname, '../config/default.js'),
            to: path.resolve(__dirname, '../dist/config/'),
            transform (content) {
                return content.toString()
                    .replace(/{{build-time}}/, buildTime)
                    .replace(/(["']){{entry-resources}}\1/, JSON.stringify(global.PackStore['entries']))
                    .replace(/(["']){{theme-resources}}\1/, JSON.stringify(global.PackStore['themes']))
                    .replace(/(["']){{i18n-resources}}\1/, JSON.stringify(global.PackStore['i18ns']))
                    .replace(/(["']){{server-assets-hash}}\1/, JSON.stringify({}));
            }
        },
        // config/default-*.js
        {
            from: path.resolve(__dirname, '../config/default-*.js'),
            to: path.resolve(__dirname, '../dist/'),
            ignore: ['default-vars.js']
        }

        // -------  目前 server 目录 及 app.js 文件，由命令行 babel 进行转译到目标目录 2016-11-21
    ])
);

module.exports = config;
