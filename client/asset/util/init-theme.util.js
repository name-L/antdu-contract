/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import Vue from 'vue';
import ThemeVuePlugin from '@component-util/theme-manage-vue-plugin';

/**
 * init-theme.util.js
 * Created by wuyaoqian on 2017/4/9.
 */

const initTheme = function () {
    // 注册皮肤入口列表
    // 注意：这个需要运行时动态注入（ 在 entry-page 页中 ）
    if (Array.isArray(window.Util.ThemeEntryUrlList)) {
        window.Util.ThemeEntryUrlList.forEach((obj) => {
            // @params: ThemeManage.regist(theme, url, key)
            ThemeVuePlugin.ThemeManage.regist(obj[0], obj[1], obj[2]);
        });
        delete window.Util.ThemeEntryUrlList;
    }
    // 注册皮肤插件
    Vue.use(ThemeVuePlugin, window.Util.theme || 'white');
};

initTheme();
