/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * core-page.js
 * Created by wuyaoqian on 2018/9/13.
 */

import PubSubService from '@component-util/micro-pubsub-service';

const corePageSwitchMessageServiceName = 'core-page-switch-service';
const corePageJumpMessageServiceName = 'core-page-jump-service';
const corePageRegistServiceName = 'core-page-service';
const corePageRegistServiceDefaultOpt = {
    key: '',
    classes: '',
    /*
     * type: string
     * type: object: {
     *      props: {content: 'Welcome to the Micro WebApp ^_^'},
     *      component: LabelPage
     * }
     */
    content: ''
};

// 发布主页内容服务（其它微应用中使用）
const corePageRegistServiceInstance = PubSubService.RegistService.publish(
    corePageRegistServiceName, corePageRegistServiceDefaultOpt
);

// 定义主页内容切换服务（其它微应用中使用）
const corePageMessageServiceInstance = PubSubService.ListenService.publish(corePageSwitchMessageServiceName);

const jumpMessageServiceInstance = PubSubService.ListenService.publish(corePageJumpMessageServiceName);

// 暴露出去（ 主要是 index.vue 中使用 ）
export default {
    regist: {
        [corePageRegistServiceName]: corePageRegistServiceInstance
    },
    switch: {
        name: corePageSwitchMessageServiceName,
        instance: corePageMessageServiceInstance
    },
    jump: {
        name: corePageJumpMessageServiceName,
        instance: jumpMessageServiceInstance
    }
};
