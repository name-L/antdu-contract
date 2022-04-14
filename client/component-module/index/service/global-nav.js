/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * global-nav.js
 * Created by wuyaoqian on 2018/9/13.
 */

import PubSubService from '@component-util/micro-pubsub-service';

// 定义 NavItem 的默认值
const globalNavItemDefaultOpt = function (opt) {
    let position = this;
    return Object.assign({
        key: `nav-${position}-${Math.random()}`,
        tip: '',
        /*
         * type: string
         * type: object: {
         *      props: {content: 'Welcome to the Micro WebApp ^_^'},
         *      component: LabelPage
         * }
         */
        content: '',
        classes: '',
        callbacks: {
            // init () { console.log('init:', this); },
            // active () { console.log('active:', this); },
            // inactive () { console.log('inactive:', this); }
        }
    }, opt);
};
const globalNavItemServiceName = (position) => `global-nav-item-service:${position}`;

// 定义四个服务名称
const globalNavTopItemServiceName = globalNavItemServiceName('top');
const globalNavMiddleItemServiceName = globalNavItemServiceName('middle');
const globalNavBottomItemServiceName = globalNavItemServiceName('bottom');

// 发布四个服务（其它微应用中使用）
// 此服务用于顶部按钮
const globalNavTopItemServiceInstance = PubSubService.RegistService.publish(
    globalNavTopItemServiceName, globalNavItemDefaultOpt.bind('top')
);
const globalNavMiddleItemServiceInstance = PubSubService.RegistService.publish(
    globalNavMiddleItemServiceName, globalNavItemDefaultOpt.bind('middle')
);
const globalNavBottomItemServiceInstance = PubSubService.RegistService.publish(
    globalNavBottomItemServiceName, globalNavItemDefaultOpt.bind('bottom')
);

// 在 exports.js 中的 mw.adapter.nav 下简化并暴露服务（其它微应用中使用）
// mw.adapter.nav = {
//     insert (option, position, index) {
//         return PubSubService.RegistService.regist(globalNavItemServiceName(
//             position && typeof position === 'string' ? position : 'top'
//         ), option, index);
//     }
// };

// 暴露出去（ 主要是 index.vue 中使用 ）
export default {
    [globalNavTopItemServiceName]: globalNavTopItemServiceInstance,
    [globalNavMiddleItemServiceName]: globalNavMiddleItemServiceInstance,
    [globalNavBottomItemServiceName]: globalNavBottomItemServiceInstance
};
