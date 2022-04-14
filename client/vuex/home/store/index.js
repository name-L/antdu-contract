import * as actions from './actions';
import getters from './getters';
import mutations from './mutations';

const state = {
    // 控制折叠
    isShow: false,
    // 导出信息显示
    exportInformation: false
};

export default {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};
