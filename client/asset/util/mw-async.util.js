/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

const asyncLoad = require('@component-util/async-load-js');

/**
 * mw-async.util.js
 * 微应用入口页加载管理
 *
 * Created by wuyaoqian on 2019/6/14.
 */

/**
 * 异步加载微应用的入口页
 * @param path
 * @param hash
 * @param lang
 * @param theme
 */
module.exports = function (path, hash, lang, theme) {
    if (path && typeof path === 'object' && path.base) {
        // 注意：args 的综合规则需要与 node 端一至（因为 node 需要解析相关值来决定是否需要缓存）
        // 注意：这个适合 http2 协议的版
        Object.keys(path).forEach(function (key) {
            if (key === '{lang}') {
                lang && asyncLoad(`${path[key]}?${hash[lang] || ''}`.replace('{lang}', lang));
            } else if (key === '{theme}') {
                theme && asyncLoad(`${path[key]}?${hash[theme] || ''}`.replace('{theme}', theme));
            } else {
                asyncLoad(`${path[key]}?${hash[key] || ''}`);
            }
        });
    } else {
        // 注意：args 的综合规则需要与 node 端一至（因为 node 需要解析相关值来决定是否需要缓存）
        // 注意：这个适合 http1 协议的版
        let args = '';
        if (lang) {
            args += `l=${lang}`;
        }
        if (theme) {
            args += `t=${theme}`;
        }
        args += `v=${hash.base || ''}-${hash[lang] || ''}-${hash[theme] || ''}`;
        asyncLoad([path, args]);
    }
};
