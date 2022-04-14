/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * main-content.js
 * Created by wuyaoqian on 2018/9/14.
 */

import './service/default-page.js';
import PubSubService from '@component-util/micro-pubsub-service/index';
import LabelPage from './label-page/label-page.vue';

// 注册一个默认主页
// TODO: 需要为默认主页定义一下其内部的框架（还有可能需要发布相关的服务出去）
const pageName = 'default';
PubSubService.RegistService.regist('core-page-service', {
    key: pageName,
    classes: 'default',
    content: {
        props: { content: 'main.home.welcome' },
        component: LabelPage
    }
});

export default {
    pageName: pageName
};
