/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 请求路径 - 118n
 * Created by wuyaoqian on 14/9/24.
 */

import LocalUtil from 'data-sdk-util/lib/local-util';
import I18NRenderUtil from '../util/i18n-render-util';
import { system as config } from 'config';

/**
 * 加载国际化资源
 * @param req
 * @param res
 */
const loadLocalLanguagePackage = function i18nHandler (req, res) {
    let lang = req.params[0] ? req.params[1] : '';
    let modules = [req.params[2]];
    let result;
    let regexp = /(,([\w-]+))/g;
    let others = req.params[3];
    let type = req.params[5];
    if (others) {
        while ((result = regexp.exec(others))) {
            modules.push(result[2]);
        }
    }
    // 因为指定了具体的语言或返回类型为js，所以这里可以设置成硬缓存来加速用户体验
    if (lang || type === 'js') {
        res.set('Cache-Control', 'public, max-age=' + (config.staticMaxAge / 1000));
        res.set('Access-Control-Allow-Origin', '*');
    }
    if (type === 'json') {
        res.json(LocalUtil.getLangObj(lang || req, modules, false, true));
    } else if (type === 'js') {
        res.set('Content-Type', 'application/javascript');
        res.send(I18NRenderUtil.getEntryJsContent(modules[0], lang, req, 'main'));
    }
};

export default {
    module: null,
    routes: [{
        'filename': null,
        'method': 'get',
        // 请求路径格式："/i18n/{lang}/{module-name},{module-name}.json"
        // url-path-name: /i18n/zh-CN/a,b,c.json
        // req.params[0]: /zh-CN
        // req.params[1]: zh-CN
        // req.params[2]: a
        // req.params[3]: ,b,c
        // req.params[4]: ...
        // req.params[5]: json
        'path': new RegExp(`^${global.ctx_path}/i18n(/([\\w-]+))?/([\\w-@]+)((,[\\w-]+)*)\\.(json|js)$`),
        'extract': null,
        'session': false,
        'consume': null,
        'filter': null,
        'passport': false,
        'roles': null,
        'handler': loadLocalLanguagePackage,
        'config': null
    }]
};
