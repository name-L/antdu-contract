/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

const help = require('./webpack.help');
const path = require('path');
const loader = require.resolve('webpack-tool/lib/html-webpack-plugin.loader.js');
const dynamicIncludeAssetTemplate = (baseDir, templateFileName, data) => {
    Object.keys(data).forEach((key) => {
        data[key] = path.relative(baseDir, `${__dirname}/${data[key]}`);
    });
    return `${loader}?${JSON.stringify({ 'dynamic-include-asset': data })}!${baseDir}/${templateFileName}`;
};

/**
 * webpack.config.assemble.js
 * Created by wuyaoqian on 2018/5/18.
 */

// const commons = ['vendor', 'common', 'manifest'];
const runtime = function () { return `manifest`; };
const splitChunks = {
    // 生成多个子 trunk 时，是否隐藏路径信息（一般是配合 maxSize 的使用）
    hidePathInfo: true,
    // 名称的默认分隔符
    automaticNameDelimiter: '~',
    // 具体的公共模块分组配置
    cacheGroups: {
        'default': false,
        'vendors': false,
        'common': {
            name: 'common',
            priority: 5,
            chunks: 'all',
            minChunks: 1,
            // 这里是为了单独将某些资源提取到 common 中之用（同时也可减轻 vendor 的负担）
            test: new RegExp(`(${[
                // 这里引入是因为 theme 中有使用到（某个文件）
                require.resolve('css-loader/lib/css-base'),
                require.resolve('style-loader/lib/addStyles'),
                // 这里也可以自定义引入其它文件（某些目录）
                'node_modules[/\\\\]@component-util[/\\\\]',
                // 'node_modules[/\\\\]vue-i18n[/\\\\]',
                // 这里引入是因为JS的异步下载是一个常用功能（某个文件）
                require.resolve('scriptjs')
            ].join(')|(')})`)
        },
        'vendor': {
            name: 'vendor',
            chunks: 'all',
            priority: 3,
            // 超过 maxSize，会自动生成子 chunk
            // 注意：具体设置成多少，需要自行体会，单位未知，应该是与 statSize 比较（但 statSize 比 parsedSize 还低，原因未知 ）
            maxSize: 300 * 1024,
            minChunks: 2
        },
        'node_modules': {
            // 取名与 vendor 一样的目的是将 node_modules（minChunks：1）也打包入 vendor 当中
            // 注意：priority 必须比 vendor 低
            name: 'vendor',
            chunks: 'all',
            priority: 2,
            minChunks: 1,
            test: /[\\/]node_modules[\\/]/
        }
    }
};

const entries = (function (obj1, obj2, obj3) {
    let ret = {};
    obj1.forEach((entry) => {
        ret[entry.name] = entry.path;
    });
    obj2.forEach((entry) => {
        ret[entry.name] = entry.path;
    });
    obj3.forEach((entry) => {
        ret[entry.name] = entry.path;
    });
    return ret;
})(help.getEntries(), help.getThemes(), help.getI18ns());

const pages = [
    // spa 入口页
    ...help.getEntries().map((entry) => {
        let templateSelect = function () { return entry.name === 'login' ? '-check' : '-loading'; };
        return {
            filename: `${global.ctx_tpl_path}/${entry.name}.tpl`,
            template: `${loader}!server/modules/entry/tpl/spa-assemble${templateSelect()}.tpl`,
            // 因为 vendor 可能会有多个，所以没法使用 chunks 来过滤，只能使用 excludeChunks 来排除
            // chunks: [entry.name, ...commons],
            excludeChunks: Object.keys(entries).filter(name => name !== entry.name)
        };
    }),
    // 404, 500 页面
    ...[404, 500].map((status) => {
        return {
            filename: `${global.ctx_tpl_path}/${status}.tpl`,
            template: dynamicIncludeAssetTemplate(
                `${path.dirname(require.resolve('express-errorhandler/package.json'))}/tpl`,
                'error.tpl', {
                    'content-img': `../client/asset/image/${status}-x1.png`,
                    'content-img-2x': `../client/asset/image/${status}-x2.png`
                }
            ),
            chunks: []
        };
    })
];

// noinspection WebpackConfigHighlighting
module.exports = {
    runtime,
    splitChunks,
    entries,
    pages
};
