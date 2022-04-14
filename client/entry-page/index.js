/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 界面入口（首页）
 * Created by wuyaoqian on 2016/11/17.
 */

import '../asset/util/init-async.util.js';
import '../asset/util/init-theme.util.js';
import '../asset/util/init-i18n.util.js';
import '../asset/less/base-style.less';
import '../component-module/index/service/window.mw.js';
import Vue from 'vue';
import VueResource from 'vue-resource';
import Index from '../component-module/index/index.vue';
import router from '../router/index';
import store from '../store/index';
import Element from 'element-ui';
import VueRouter from 'vue-router';
import VueClipboard from 'vue-clipboard2';
import $ from 'jquery';
import 'element-ui/lib/theme-chalk/index.css';
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push (location, onResolve, onReject) {
    if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
    return originalPush.call(this, location).catch(err => err);
};

// 资源规范
window.data = window.data || {};
window.$ = window.jQuery = $;
window.name = ' ';

Vue.use(VueResource);
// Vue.use(VueRouter);
Vue.use(Element);
Vue.use(VueClipboard);
// 配置路由
// const router = new VueRouter({
//     mode: 'history',
//     linkActiveClass: 'active',
//     routes
// });
Vue.prototype.bus = new Vue();
/* eslint no-new: "off" */
new Vue({
    el: 'app-entry',
    router,
    store,
    render: (createElement) => createElement(Index, { props: {
        opt: require('../asset/util/init-data.util.js')
    } }),
    i18n: (require('@component-util/i18n-manage-vue-i18n')).getInstance(),
    mounted () {
        // 要调用此方法，需要在相应 entry tpl 中启用 引入 loading.tpl;
        window.Util.hideEntryLoading(true, 1000);
    }
});
