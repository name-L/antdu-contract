// import * as types from './mutation-types';

const mutations = {
    // 控制折叠
    setFold (state, data) {
        state.isShow = data;
    },
    // 导出信息
    setExportInformation (state, data) {
        state.exportInformation = data;
    }
};

export default mutations;
