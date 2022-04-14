/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 暴露给微应用使用的相关服务
 * window.mw.js
 * Created by wuyaoqian on 2018/9/6.
 */

const mw = {};
const cm = obj => obj.__esModule ? obj.default : obj;

// 基础
Object.assign(mw, {
    service: {
        // {RegistService, MessageService}
        'PubSub': cm(require('@component-util/micro-pubsub-service'))
    },
    component: {
        core: {
            'vue': cm(require('vue')),
            'axios': cm(require('axios')),
            'vuex': cm(require('vuex')),
            'elementUi': cm(require('element-ui')),
            'vueResource': cm(require('vue-resource')),
            'moment': cm(require('moment')),
            'SocketPush': cm(require('@component-util/socket-push')),
            'I18nManage': cm(require('@component-util/i18n-manage')),
            'ThemeManage': cm(require('@component-util/theme-manage')),
            'EventEmitter': cm(require('events')),
            'jquery': cm(require('jquery')),
            'vuexManage': cm(require('@component-util/vuex-manage/index.js')),
            'VueI18nManage': cm(require('@component-util/i18n-manage-vue-i18n'))
        },
        base: {
            'CommonLoading': cm(require('../../../component-base/loading/loading-circle.vue')),
            'CommonEfLoading': cm(require('../../../component-base/loading/loading.vue')),
            'CommonScrollbar': cm(require('../../../component-base/scrollar/ef-scrollar.vue')),
            'CommonInput': cm(require('../../../component-base/input/ef-input.vue')),
            'CommonButton': cm(require('../../../component-base/button/ef-button.vue')),
            'CommonSelect': cm(require('../../../component-base/select/ef-select.vue')),
            'CommonOption': cm(require('../../../component-base/select/ef-option.vue')),
            'CommonDateRange': cm(require('../../../component-base/date/date-range.vue')),
            'CommonLoadMore': cm(require('../../../component-base/loadmore/ef-loadmore.vue')),
            'CommonUtils': cm(require('../../../utils/commons'))
        },
        build: {
            'CssBase': cm(require('css-loader/lib/css-base.js')),
            'AddStyles': cm(require('style-loader/lib/addStyles.js')),
            'ComponentNormalizer': cm(require('vue-loader/lib/runtime/componentNormalizer.js'))
        }
    },
    user: {}
});

// 业务
Object.assign(mw, {
    adapter: {}
});

// 暴露给其它微应用使用
export default window['mw'] = mw;
