/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import { system as config } from 'config';
import path from 'path';
import fs from 'fs';

/**
 * theme-util.js
 * Created by wuyaoqian on 2018/11/28.
 */

const ThemeRenderUtil = {
    _cache: {},
    _baseInfo () {
        const infoStore = (global.PackStore && global.PackStore.themes)
            ? global.PackStore.themes
            : config['pack-store'].themes;
        return (infoStore && typeof infoStore !== 'string') ? infoStore : {};
    },
    _getFileContentInStatic (req, filename) {
        const filesystem = req.app.devOpt ? req.app.devOpt.fileSystem : fs;
        const publicPath = req.app.devOpt ? req.app.devOpt.publicPath : path.join(__dirname, '../../../../static/');
        // return filesystem.readFileSync(path.join(publicPath, `${filename}`), 'utf-8');
        return ThemeRenderUtil._cache[filename] || (ThemeRenderUtil._cache[filename] = filesystem
            .readFileSync(path.join(publicPath, `${filename}`), 'utf-8')
            .replace(/(sourceMappingURL=)/g, (match, $1) => {
                return `${$1}${global.ctx_static_path_cdn}/${filename.substring(0, filename.lastIndexOf('/'))}/`;
            }));
    },
    /**
     * 获取指定入口及皮肤名称的详细内容
     * @param {string} entry
     * @param {string} theme
     * @param {IncomingMessage} req
     * @return {string}
     */
    getEntryJsContent (entry, theme, req) {
        return ThemeRenderUtil._getFileContentInStatic(req, ThemeRenderUtil._baseInfo()[`${entry}.${theme}`][0]);
    },
    /**
     * 获取指定入口及皮肤名称的Url地址
     * @param {string} entry
     * @param {string} theme
     * @return {string}
     */
    getScriptUrl (entry, theme) {
        const filename = ThemeRenderUtil._baseInfo()[`${entry}.${theme}`][0];
        return filename ? `${global.ctx_static_path_cdn}/${filename}` : '';
    },
    /**
     * 获取指定入口的所有皮肤列表
     * @param {string} entry
     * @return {Array}
     */
    getEntryList (entry) {
        const infoStore = ThemeRenderUtil._baseInfo();
        // [1]: entryName, [2]: themeName, [3]: hashValue
        const themeRegExp = /([^.\\/]+)\.([^.]+)\.([^.]+)\.js$/;
        const entryList = [];
        Object.keys(infoStore).forEach((key) => {
            let fileName = infoStore[key][0];
            let entryModuleKey = infoStore[key][1];
            let match = fileName.match(themeRegExp);
            if (match && match[1] === entry) {
                entryList.push([match[2], `${global.ctx_static_path_cdn}/${fileName}`, entryModuleKey]);
            }
        });
        return entryList;
    }
};

module.exports = ThemeRenderUtil;
