/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * Created by wuyaoqian on 16-8-17.
 * 登录验证 (socket)
 */

import path from 'path';
import DataSdkRest from 'data-sdk-rest';
import LocalUtil from 'data-sdk-util/lib/local-util';
import log4js from 'log4js-config';

const logger = log4js.get(global.log_prefix_name + 'socket.io.' + path.basename(__filename));
const restInfoManage = DataSdkRest.userDataManage.socketRequest.restInfo;

export default function (passport) {
    return function (socket, next) {
        let restInfo = restInfoManage.get(socket.request) || {};
        if (typeof passport === 'function') {
            passport = !!passport(socket);
        }
        if (!passport || restInfo.userid) {
            next();
        } else {
            logger.error(
                'Socket (sid: %s, csid: %s, ip: %s) need login for connect', socket['_SID_'], socket.id, socket['_IP_']
            );
            next(new Error(`401:${LocalUtil.getLangObj(socket.request, '_server_')['401']}`));
        }
    };
};
