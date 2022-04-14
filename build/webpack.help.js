/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 辅助打包工具类
 * Created by wuyaoqian on 2016/11/30.
 */

const fs = require('fs');
const path = require('path');

// noinspection WebpackConfigHighlighting
module.exports = {
    /**
     * 获取入口文件
     * @returns {object[]} - [{name:'', path:''}, ...]
     */
    getEntries () {
        const dir = path.join(__dirname, '../client/entry-page');
        // [1]: entryName
        const regex = /^(.+)\.js$/;
        const entries = [];
        fs.readdirSync(dir).forEach(function (filename) {
            let match = regex.exec(filename);
            if (!match) { return; }
            entries.push({
                name: match[1],
                path: path.join(dir, filename)
            });
        });
        return entries;
    },
    /**
     * 获取皮肤入口文件
     * @return {object[]} - [{name:'', key:'', path:''}, ...]
     */
    getThemes () {
        const dir = path.join(__dirname, '../client/entry-theme');
        // [1]: entryName.themeName, [2]: entryName, [3]: themeName
        const themeRegExp = /^(([^.]+)\.([^.]+))\.js$/;
        let entries = [];
        fs.readdirSync(dir).forEach(function (filename) {
            let match = themeRegExp.exec(filename);
            if (!match) { return; }
            entries.push({
                // 注意：这个 key 需与 entry-theme/*.*.js 中的 entryModuleKey 一至
                key: `main:${match[2]}`,
                name: match[1],
                path: path.join(dir, filename)
            });
        });
        return entries;
    },
    /**
     * 获取国际化入口文件
     * @return {object[]} - [{name:'', path:''}, ...]
     */
    getI18ns () {
        const dir = path.join(__dirname, '../client/entry-i18n');
        // [1]: entryName.langName, [2]: entryName, [3]: langName
        const langRegExp = /^(([^.]+)\.([^.]+))\.js$/;
        let entries = [];
        fs.readdirSync(dir).forEach(function (filename) {
            let match = langRegExp.exec(filename);
            if (!match) { return; }
            entries.push({
                // 注意：这个 key 需与 entry-i18n/*.*.js 中的 entryModuleKey 一至
                key: `main:${match[2]}`,
                name: match[1],
                path: path.join(dir, filename)
            });
        });
        return entries;
    }
};
