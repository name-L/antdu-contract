/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 对 client/entry.tpl 基础模块的一些扩展
 * Created by wuyaoqian on 2017/2/23.
 */

import fs from 'fs';
import path from 'path';
import ejs from 'ejs';
import pkg from '../../../../package.json';
import LocalUtil from 'data-sdk-util/lib/local-util';
import ThemeRenderUtil from './theme-render-util.js';
import I18NRenderUtil from './i18n-render-util.js';
import patternReplace from '@component-util/pattern-replace';
import baseX from 'base-x';
import { system as sysConfig } from 'config';

const dataEncode = baseX(sysConfig.codes['basex-data']).encode;

// 配置 ejs 的属性
const ejsOption = {
    rmWhitespace: false
};

const prepareData = function (req, opt) {
    opt = opt || {};

    // 页面本身的一些描述属性
    opt.keywords = opt.keywords || '';
    opt.description = opt.description || '';
    opt.title = opt.title || pkg.title;

    // 在浏览器检测中加上 browser 国际化资源
    opt.browserCheck = opt.browserCheck || { resize: 0 };
    opt.browserCheck.i18n = LocalUtil.getLangObj(req, 'browser');

    // 记录版本号
    opt.version = pkg.version;

    // 记录全局上下文
    opt.ctxPath = global.ctx_path;

    // 预加载皮肤资源
    opt.theme = opt.theme || '';
    if (opt.theme) {
        if (opt.useThemeScriptUrl === true) {
            // 使用 script-src 形式将皮肤资源下载
            opt.themeScriptUrl = ThemeRenderUtil.getScriptUrl(opt.name || '', opt.theme);
            opt.themeScript = `<script type="application/javascript" src="${opt.themeScriptUrl}"></script>`;
            delete opt.useThemeScriptUrl;
        } else {
            // 将皮肤内容直接随 html 中返回，原因（1：皮肤资源不大，2：加快首屏速度）
            opt.themeScript = `<script type="application/javascript">${
                ThemeRenderUtil.getEntryJsContent(opt.name || '', opt.theme, req)
            }</script>`;
        }
        opt.themeScript += `<script type="application/javascript">window.Util.ThemeEntryUrlList=${
            JSON.stringify(ThemeRenderUtil.getEntryList(opt.name || ''))
        }</script>`;
    }
    opt.themeScript = opt.themeScript || '';

    // 预加载国际化资源
    opt.lang = opt.lang || '';
    if (opt.lang) {
        if (opt.useI18nScriptUrl === true) {
            // 使用 script-src 形式将国际化资源下载
            opt.i18nScriptUrl = I18NRenderUtil.getScriptUrl(opt.name || '', opt.lang);
            opt.i18nScript = `<script type="application/javascript" src="${opt.i18nScriptUrl}"></script>`;
            delete opt.useI18nScriptUrl;
        } else {
            // 将国际化内容直接随 html 中返回，原因（1：国际化资源不大，2：加快首屏速度）
            opt.i18nScript = `<script type="application/javascript">${
                I18NRenderUtil.getEntryJsContent(opt.name || '', opt.lang, req, 'main')
            }</script>`;
        }
        opt.i18nScript += `<script type="application/javascript">
            window.Util.I18nEntryUrlList=${JSON.stringify(I18NRenderUtil.getEntryList(opt.name || ''))}
        </script>`;
    }
    opt.i18nScript = opt.i18nScript || '';

    // 异步加载JS资源
    opt.asyncScript = '';
    if (Array.isArray(opt.asyncScriptList) && opt.asyncScriptList.length) {
        opt.asyncScript = `<script type="application/javascript">window.Util.AsyncScriptList=${
            JSON.stringify(opt.asyncScriptList)
        }</script>`;
    }

    // 页面需要传递的数据 的相关属性
    if (opt.data) {
        opt.data = Object.assign({}, EntryUtil.getRenderData(req), opt.data);
    } else {
        opt.data = EntryUtil.getRenderData(req);
    }
    opt['data-script'] = '';
    if (opt.data && typeof opt.data === 'object') {
        opt['data-script'] = `<script id="__data__" val="${
            dataEncode(Buffer.from(JSON.stringify(opt.data)))
        }" type="text/data"></script>`;
    }

    return opt;
};

const prepareContent = function (content, req, opt) {
    // 0. 规整 data
    opt = prepareData(req, opt);
    // 1. 替换内容
    content = patternReplace(content, opt);
    // 2. 通过 ejs 渲染后返回
    return ejs.render(content, opt, ejsOption);
};

const preparePushPromise = function (content, req, res, opt) {
    let etag = req.app.get('etag fn');
    let fresh = require('fresh');
    if (!etag || typeof etag !== 'function') { return content; }

    // 1. 将 '_' 符号还原成 ',' 符号（ chrome 不支持 if-none-match 是多值的情况 ），方便后续的值判断
    req.headers['if-none-match'] = (req.headers['if-none-match'] || '').replace(/_/g, ',');

    // 2. 提取需要 push_promise 的 url list
    let pushPromiseMap = LinkExtract.extract(content, opt);

    // 3. 单独计算 content 的 ETag 值
    let contentETag = etag(content, 'utf8');

    // 4. 合并 ETagList, 及合并 promise-links
    let ETags = [contentETag];
    let links = [];
    pushPromiseMap.forEach((list) => {
        ETags.push(etag(JSON.stringify(list), 'utf8').replace('W/', ''));
        if (!fresh(req.headers, { 'etag': ETags[ETags.length - 1] })) {
            links = links.concat(list);
        }
    });

    // 5. add promise-links
    if (links.length) {
        // 限制一下数量，暂时是 80，与 nginx 中的如下对应：
        // # http2 push_promise
        // http2_push_preload on;
        // http2_max_concurrent_pushes 80;
        // # buffer size
        // proxy_buffers 16 16k;
        // proxy_buffer_size 32k;
        links.length = Math.min(links.length, 80);
        res.setHeader('Link', links);
    }

    // 6. 手动将 contentETag,extractPromiseETag 标识放在 ETag header 中（ 在 send 时将不再额外计算 ）
    // 目的：用来排除某些无关紧要的动态内容（不排除就可能会影响界面的缓存）
    // 注意：因 chrome 不支持 ETag 是多值的情况，所以这里将多值转换成单值（ 2019-11-21 ）
    res.setHeader('ETag', ETags.join('_'));

    // 7. 根据 contentEtag 计算是否需要 304 ( 用来代替在 send 时的 req.fresh 的判断 )
    let isContentFresh = fresh(req.headers, {
        'etag': contentETag,
        'last-modified': res.getHeader('Last-Modified')
    });
    if (isContentFresh) {
        res.status(304);
    }

    // 8. 返回原始内容
    return content;
};

const LinkExtract = {
    style: {
        as: 'style',
        pattern: /<link\s+([^>]*)href=(["'])(\/[^'"\s]+)\1([^>]*)>/g,
        exclude: /(^| )nopush( |$)/i
    },
    script: {
        as: 'script',
        pattern: /<script\s+([^>]*)src=(["'])(\/[^'"\s]+)\1([^>]*)>/g,
        exclude: /(^| )nopush( |$)/i
    },
    image: {
        as: 'image',
        pattern: /url(\()(['"])(\/[^'"\s]+)\1(\))/g
    },
    extract (content, opt) {
        let map = new Map();
        let coreList = new Set();
        let asyncList = new Set();
        // 将 content 中的 script, style, image 添加到 Link 中
        [LinkExtract.style, LinkExtract.script, LinkExtract.image].forEach((link) => {
            let result;
            while ((result = link.pattern.exec(content))) {
                if (!link.exclude || (!link.exclude.test(result[1]) && !link.exclude.test(result[4]))) {
                    coreList.add(`<${result[3]}>; as=${link.as}; rel=preload`);
                }
            }
        });
        // 将 i18nScriptUrl 添加到 Link 中
        if (opt.i18nScriptUrl) { coreList.add(`<${opt.i18nScriptUrl}>; as=script; rel=preload`); }
        // 将 themeScriptUrl 添加到 Link 中
        if (opt.themeScriptUrl) { coreList.add(`<${opt.themeScriptUrl}>; as=script; rel=preload`); }
        // 将 asyncScriptList 添加到 Link 中
        if (Array.isArray(opt.asyncScriptList) && opt.asyncScriptList.length) {
            opt.asyncScriptList.forEach((script) => {
                if (Array.isArray(script) && script.length === 2) {
                    asyncList.add(`<${script[0]}?${script[1]}>; as=script; rel=preload`);
                } else if (typeof script === 'string') {
                    asyncList.add(`<${script}>; as=script; rel=preload`);
                } else if (script.path) {
                    asyncList.add(`<${script.path}?${script.args || ''}>; as=script; rel=preload`);
                }
            });
        }
        map.set('core', Array.from(coreList));
        map.set('async', Array.from(asyncList));
        return map;
    }
};

const EntryUtil = {
    setRenderData (req, data) {
        req.session.tempEntryPageData = Object.assign(req.session.tempEntryPageData || {}, data);
    },
    getRenderData (req) {
        let data = req.session.tempEntryPageData;
        delete req.session.tempEntryPageData;
        return data;
    },
    hasRenderData (req, key) {
        let data = req.session.tempEntryPageData;
        return !!(data && data[key]);
    },
    render (req, res, filename, opt) {
        // 对入口页默认不缓存（如果需要缓存可在 opt 中设定 cacheControlMaxAge, 单位为秒）
        res.setHeader('Content-Type', 'text/html; charset=UTF-8');
        res.setHeader(
            'Cache-Control',
            `public, max-age=${typeof opt.cacheControlMaxAge === 'number' ? opt.cacheControlMaxAge : 0}`
        );
        if (res._existRenderContent_) {
            res.send(preparePushPromise(
                prepareContent(res._existRenderContent_[filename] || res._existRenderContent_, req, opt),
                req, res, opt
            ));
        } else {
            fs.readFile(
                path.join(req.app.get('views'), `${global.ctx_tpl_path}/${filename}`),
                (err, html) => {
                    if (err) { throw err; }
                    res.send(preparePushPromise(
                        prepareContent(html.toString('utf8'), req, opt),
                        req, res, opt
                    ));
                }
            );
        }
    },
    renderRelative (req, res, filename, opt) {
        fs.readFile(path.join(__dirname, '../../', filename), (err, html) => {
            if (err) { throw err; }
            res._existRenderContent_ = html.toString('utf8');
            EntryUtil.render(req, res, filename, opt);
        });
    }
};

export default {
    render: EntryUtil.render,
    renderRelative: EntryUtil.renderRelative,
    getRenderData: EntryUtil.getRenderData,
    setRenderData: EntryUtil.setRenderData,
    hasRenderData: EntryUtil.hasRenderData
};
