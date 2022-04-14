/*!
 * Copyright (c) 2018-2020 Autdu Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁为软件有限公司。保留所有权利。
 */

import storeUtils from '../utils/store-utils';
import { storeFactory } from '@component-util/vuex-manage';

const storeAppPaths = ['TOP_APP_ID'];

const mainModule = {
    namespaced: true,
    modules: storeUtils.getModules(require.context('../vuex', true, /\.\/.*\/store\/(.*\/)?index\.js/i))
};
const storeAppModule = Object.assign(mainModule);
const globalModules = {}; // 慎用，可能存在覆盖问题

const { store } = storeFactory.create({
    storeAppPaths,
    storeAppModule,
    globalModules
});

export default store;
