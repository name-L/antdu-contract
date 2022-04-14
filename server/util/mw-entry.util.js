/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import path from 'path';
import log4js from 'log4js-config';

import { URLSearchParams } from 'url';
import { mwConfig, mwData } from './mw-config.util.js';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));

/**
 * mw-entry.util.js
 * Created by wuyaoqian on 2018/11/3.
 */

const MicroWebappEntryUtil = {
    /**
     * 获取指定微应用的转发路径
     * @param {object} microWebappConfig
     * @return {string}
     */
    getMicroWebappForwardPath (microWebappConfig) {
        return `${mwConfig.ctx}/${microWebappConfig.webContext}`.replace(/\/+/g, '/');
    },
    /**
     * 获取指定微应用的入口地址
     * @param {object} microWebappConfig
     * @return {string|object}
     */
    getMicroWebappEntryPath (microWebappConfig) {
        let base = `${microWebappConfig.cdn}${MicroWebappEntryUtil.getMicroWebappForwardPath(microWebappConfig)}`;
        if (typeof microWebappConfig.entryContent === 'string') {
            return `${base}${microWebappConfig.entryContent}`.replace(/\/?$/, '');
        }
        let urls = {};
        Object.keys(microWebappConfig.entryContent).forEach((key) => {
            urls[key] = `${base}${microWebappConfig.entryContent[key]}`.replace(/\/?$/, '');
        });
        return urls;
    },
    /**
     * 获取指定微应用的入口地址（带上参数）
     * @param {object} microWebappConfig
     * @param {string} [lang]
     * @param {string} [theme]
     * @return {string[]}
     */
    getMicroWebappEntryPathWithParam (microWebappConfig, lang, theme) {
        let ret = [];
        let param = new URLSearchParams();
        let hash = microWebappConfig.data['hash'] || {};
        let urls = MicroWebappEntryUtil.getMicroWebappEntryPath(microWebappConfig);
        if (typeof urls === 'string') {
            if (lang) {
                param.append('l', lang);
            }
            if (theme) {
                param.append('t', theme);
            }
            param.append('v', `${hash.base || ''}-${hash[lang] || ''}-${hash[theme] || ''}`);
            ret.push(`${urls}?${param.toString()}`);
        } else {
            Object.keys(urls).forEach((key) => {
                if (key === '{lang}') {
                    lang && ret.push(`${urls[key]}?${hash[lang] || ''}`.replace('{lang}', lang));
                } else if (key === '{theme}') {
                    theme && ret.push(`${urls[key]}?${hash[theme] || ''}`.replace('{theme}', theme));
                } else {
                    ret.push(`${urls[key]}?${hash[key] || ''}`);
                }
            });
        }
        return ret;
    },
    /**
     * 微应用入口参数
     * @typedef MicroEntryParam
     * @property { string } [lang]
     * @property { string } [theme]
     */
    /**
     * 异步获取各微应用的 entryContent 地址数组
     * @param { MicroEntryParam } [param]
     * @param { string[] } [roles]
     * @param { MicroFilterCallback|MicroIncludeCondition|TerminalDevice } [filter]
     * @param { TerminalDevice } [td]
     * @returns { Promise<string[]> }
     */
    getEntryListAsync (param, roles, filter, td) {
        let lang = param ? param.lang : '';
        let theme = param ? param.theme : '';
        return mwData.getAll(filter, td).then((list) => {
            let urls = [];
            list.filter((cfg) => {
                let mwRoles = cfg.roles;
                if (!roles || !mwRoles || !Array.isArray(mwRoles) || !mwRoles.length) { return true; }
                return mwRoles.find(role => roles.includes(role));
            }).map((cfg) => {
                MicroWebappEntryUtil.getMicroWebappEntryPathWithParam(cfg, lang, theme).forEach((url) => {
                    urls.push(url);
                });
            });
            return Promise.resolve(urls);
        }).catch((error) => {
            logger.warn(
                'load entry list has error, return []. \ndetail: ',
                (error && error.stack ? error.stack : error)
            );
            return Promise.resolve([]);
        });
    },

    /**
     * 异步获取各微应用的 entryContent 地址数组（ async script ）
     * @param { MicroEntryParam } [param]
     * @param { string[] } [roles]
     * @param { MicroFilterCallback|MicroIncludeCondition|TerminalDevice } [filter]
     * @param { TerminalDevice } [td]
     * @return { Promise<string[]> }
     */
    getEntryScriptListAsync (param, roles, filter, td) {
        return MicroWebappEntryUtil.getEntryListAsync(param, roles, filter, td).then((list) => {
            return Promise.resolve(list.map((url) => {
                return `<script type="text/javascript" src="${url}" defer async></script>`;
            }));
        });
    }
};

module.exports = MicroWebappEntryUtil;
