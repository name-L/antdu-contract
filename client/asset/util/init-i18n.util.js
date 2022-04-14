/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import VueI18nManage from '@component-util/i18n-manage-vue-i18n';

/**
 * init-i18n.util.js
 * Created by wuyaoqian on 2018/11/5.
 */

const initI18n = function () {
    // 注册国际化入口列表
    // 注意：这个需要运行时动态注入（ 在 entry-page 页中 ）
    if (Array.isArray(window.Util.I18nEntryUrlList)) {
        window.Util.I18nEntryUrlList.forEach((obj) => {
            // @params: I18nManage.regist(lang, url, key)
            VueI18nManage.I18nManage.regist(obj[0], obj[1], obj[2]);
        });
        delete window.Util.I18nEntryUrlList;
    }
    // 初始国际化
    VueI18nManage.init(window.Util.lang);
};

initI18n();
