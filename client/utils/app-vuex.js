/*!
 * Copyright (c) 2018-2020 Autdu Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁为软件有限公司。保留所有权利。
 */

import { appVuexFactory } from '@component-util/vuex-manage';
import store from '../store';

const {
    mapState,
    mapGetters,
    mapActions,
    mapMutations,
    createNamespacedHelpers,
    appMapState,
    appMapGetters,
    appMapActions,
    appMapMutations,
    appCreateNamespacedHelpers,
    getState,
    getGetter,
    getAction,
    getMutation,
    getAppState,
    getAppGetter,
    getAppAction,
    getAppMutation,
    getTopAppState,
    getTopAppGetter,
    getTopAppAction,
    getTopAppMutation,
    topAppCreateNamespacedHelpers
} = appVuexFactory.create({
    store
});

export default {
    mapState,
    mapGetters,
    mapActions,
    mapMutations,
    createNamespacedHelpers,
    appMapState,
    appMapGetters,
    appMapActions,
    appMapMutations,
    appCreateNamespacedHelpers,
    getState,
    getGetter,
    getAction,
    getMutation,
    getAppState,
    getAppGetter,
    getAppAction,
    getAppMutation,
    getTopAppState,
    getTopAppGetter,
    getTopAppAction,
    getTopAppMutation,
    topAppCreateNamespacedHelpers
};

export {
    mapState,
    mapGetters,
    mapActions,
    mapMutations,
    createNamespacedHelpers,
    appMapState,
    appMapGetters,
    appMapActions,
    appMapMutations,
    appCreateNamespacedHelpers,
    getState,
    getGetter,
    getAction,
    getMutation,
    getAppState,
    getAppGetter,
    getAppAction,
    getAppMutation,
    getTopAppState,
    getTopAppGetter,
    getTopAppAction,
    getTopAppMutation,
    topAppCreateNamespacedHelpers
};
