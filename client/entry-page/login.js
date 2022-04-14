/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 界面入口（登录页）
 * Created by wuyaoqian on 2016/11/17.
 */

import '../asset/less/base-style.less';
import '../asset/util/init-async.util.js';
import '../asset/util/init-i18n.util.js';
import Vue from 'vue';
import VueResource from 'vue-resource';
import Element from 'element-ui';
import Login from './../component-module/login/login.vue';
import 'element-ui/lib/theme-chalk/index.css';

// import EventEmitter from 'events';
// 资源规范
window.data = window.data || {};
Vue.use(VueResource);
Vue.use(Element);

/* eslint no-new: "off" */
new Vue({
    el: 'app-entry',
    render: (createElement) => createElement(Login, { props: {
        opt: require('../asset/util/init-data.util.js')
    } }),
    i18n: (require('@component-util/i18n-manage-vue-i18n')).getInstance(),
    mounted () {}
});
