/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import LocalUtil from 'data-sdk-util/lib/local-util';
import patternReplace from '@component-util/pattern-replace';
import { system as config } from 'config';
import path from 'path';
import fs from 'fs';

/**
 * i18n-util.js
 * Created by wuyaoqian on 2018/11/28.
 */

const I18NRenderUtil = {
    _cache: {},
    _baseInfo () {
        const infoStore = (global.PackStore && global.PackStore.i18ns)
            ? global.PackStore.i18ns
            : config['pack-store'].i18ns;
        return (infoStore && typeof infoStore !== 'string') ? infoStore : {};
    },
    _getFileContentInStatic (req, filename) {
        const filesystem = req.app.devOpt ? req.app.devOpt.fileSystem : fs;
        const publicPath = req.app.devOpt ? req.app.devOpt.publicPath : path.join(__dirname, '../../../../static/');
        // return filesystem.readFileSync(path.join(publicPath, `${filename}`), 'utf-8');
        return I18NRenderUtil._cache[filename] || (I18NRenderUtil._cache[filename] = filesystem
            .readFileSync(path.join(publicPath, `${filename}`), 'utf-8')
            .replace(/(sourceMappingURL=)/g, (match, $1) => {
                return `${$1}${global.ctx_static_path_cdn}/${filename.substring(0, filename.lastIndexOf('/'))}/`;
            }));
    },
    _getScriptHash (entry, lang) {
        return LocalUtil.getLangHash(lang, entry, false, 12);
    },
    /**
     * 获取指定入口及国际化名称的详细内容
     * @param {string} entry
     * @param {string} langName
     * @param {IncomingMessage} req
     * @param {string} wrapperName
     * @return {string}
     */
    getEntryJsContent (entry, langName, req, wrapperName) {
        const lang = LocalUtil.getLangStr(langName || req);
        const i18ns = I18NRenderUtil._baseInfo()[`${entry}.${lang}`];
        if (!i18ns) {
            return `// Need Provide ${lang} I18N-Content !!!`;
        }
        const filename = i18ns[0];
        const baseContent = I18NRenderUtil._getFileContentInStatic(req, filename);
        const langContent = LocalUtil.getLangObj(lang, entry, false, true);
        return `${patternReplace(
            baseContent.replace(/(['"])({{I18N-Message-Array}})\1/g, '$2'), {
                'I18N-Message-Array': JSON.stringify([wrapperName ? { [wrapperName]: langContent } : langContent])
            }
        )}`;
    },
    /**
     * 获取指定入口及国际化名称的Url地址
     * @param {string} entry
     * @param {string} lang
     * @return {string}
     */
    getScriptUrl (entry, lang) {
        return `${global.ctx_path_cdn}/i18n/${lang}/${entry}.js?${I18NRenderUtil._getScriptHash(entry, lang)}`;
    },
    /**
     * 获取指定入口的所有国际化列表
     * @param {string} entry
     * @return {Array}
     */
    getEntryList (entry) {
        const supportedList = LocalUtil.getSupportedList();
        const infoStore = I18NRenderUtil._baseInfo();
        // [1]: entryName, [2]: langName, [3]: hashValue
        const i18nRegExp = /([^.\\/]+)\.([^.]+)\.([^.]+)\.js$/;
        const entryList = [];
        Object.keys(infoStore).forEach((key) => {
            let fileName = infoStore[key][0];
            let entryModuleKey = infoStore[key][1];
            let match = fileName.match(i18nRegExp);
            if (match && match[1] === entry && supportedList.includes(match[2])) {
                entryList.push([match[2], I18NRenderUtil.getScriptUrl(entry, match[2]), entryModuleKey]);
            }
        });
        return entryList;
    }
};

module.exports = I18NRenderUtil;
