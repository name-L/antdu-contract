/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * socket.io 请求分组路径 全局根目录
 * Created by wuyaoqian on 16/5/19.
 */

import path from 'path';
import log4js from 'log4js-config';
import moduleAction from '../action/index.controller.socket.js';
import DataSdkRest from 'data-sdk-rest';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));
const RestInfoManage = DataSdkRest.userDataManage.socketRequest.restInfo;

export default {
    module: moduleAction,
    routes: [
        {
            'namespace': '/',
            'session': true,
            'passport': true,
            'handler': 'clientConnection'
        },
        {
            'namespace': '/page',
            'session': true,
            'passport': true,
            'handler': function (socket) {
                const restInfo = RestInfoManage.get(socket.request) || {};
                logger.info(
                    'connected socket (csid: %s, ip: %s) in session (sid: %s, user: %s).',
                    socket.id, socket.request['INFO:IP'], socket.request['INFO:SID'], restInfo.username || '-'
                );
            }
        }
    ]
};
