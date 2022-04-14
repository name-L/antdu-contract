import Vue from 'vue';

let eventBus = new Vue();

eventBus.MessageConstants = {
    classifyManage: {
        CLOSE_FLOAT_PANEL: 'CLOSE_FLOAT_PANEL'
    }
};

export default eventBus;
