/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * demo-webapp.js
 * Created by wuyaoqian on 2018/9/6.
 */

import PubSubService from '@component-util/micro-pubsub-service';
import LabelIcon from '../label-icon/icon.vue';
import ResourceSetting from '../resource-setting/resource-setting.vue';

// 注册一个 page-3 主页
const pageName = 'page-1';
PubSubService.RegistService.regist('core-page-service', {
    key: pageName,
    classes: 'page-demo-resource-setting',
    content: ResourceSetting
});

// 注册一个导航页
PubSubService.RegistService.regist('global-nav-item-service:top', {
    tip: {
        active: 'main.home.micro-mock-icon-tip-active',
        inactive: 'main.home.micro-mock-icon-tip-inactive'
    },
    content: {
        props: { name: '^_^' },
        component: LabelIcon
    },
    classes: 'efg',
    callbacks: {
        init () { console.log('init:', this); },
        active () {
            console.log('active:', this);
            PubSubService.ListenService.send('core-page-switch-service', pageName);
        },
        inactive () { console.log('inactive:', this); }
    }
}, 1);
