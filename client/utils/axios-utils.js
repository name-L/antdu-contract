/*!
 * Copyright (c) 2018-2020 Autdu Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁为软件有限公司。保留所有权利。
 */

'use strict';

/**
 * 响应拦截
 * Created by LuMin on 2020/03/17.
 */

// 响应拦截（配置请求回来的信息）
import axios from 'axios';
import _ from 'lodash';
import PubSubService from '@component-util/micro-pubsub-service';

// 添加axios全局拦截器
{
    const orgAxiosCreate = axios.create;
    axios.create = function (conf) {
        const handler = orgAxiosCreate.call(this, conf);
        handler.interceptors.response.use(function (response) {
            return response;
        }, function (axiosError) {
            // 发布错误消息
            PubSubService.MessageService.emit('request-error', axiosError);
            return Promise.reject(axiosError);
        });
        return handler;
    };
}

const axiosHandler = axios.create({});

axiosHandler.interceptors.request.use(function (conf) {
    // 禁用缓存
    conf.params = { _: new Date().getTime(), ...conf.params };
    return conf;
}, function (error) {
    // 对请求错误做些什么
    return Promise.reject(error);
});

axiosHandler.interceptors.response.use(function (response) {
    // 处理响应数据
    return response.data;
}, function (axiosError) {
    // 处理响应失败
    let resData = _.get(axiosError, 'response.data');
    resData = _.isObject(resData) ? resData : {};
    let msg = _.get(axiosError, 'response.data') || _.get(axiosError, 'response.statusText') ||
        _.get(axiosError, 'response.stack');
    let errorCodeResult = {
        msg,
        response: _.get(axiosError, 'response'),
        ...resData
    };
    return Promise.reject(errorCodeResult);
});

export default axiosHandler;
