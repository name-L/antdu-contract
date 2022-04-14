/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * socket.io 请求分组路径 处理微应用状态信息
 * Created by wuyaoqian on 16/5/19.
 */

import path from 'path';
import log4js from 'log4js-config';
import EventEmitter from 'events';
import MWUtil from '../../../util/mw.util.js';
import DataSdkRest from 'data-sdk-rest';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));
const RestInfoManage = DataSdkRest.userDataManage.socketRequest.restInfo;

const MicroWebappStatus = {
    _ee: null,
    _init: function () {
        if (MicroWebappStatus._ee) { return; }
        MicroWebappStatus._ee = new EventEmitter();
        MicroWebappStatus._ee.setMaxListeners(1000);
        MWUtil.mwData.on('mw-offline', (cfg) => {
            process.nextTick(() => {
                MicroWebappStatus._ee.emit('mw-offline', cfg.moduleKey);
            });
        }).on('mw-online', (cfg, hash) => {
            process.nextTick(() => {
                MicroWebappStatus._ee.emit(
                    'mw-online', cfg.moduleKey, MWUtil.mwEntry.getMicroWebappEntryPath(cfg), hash
                );
            });
        }).on('mw-update', (cfg, newHash, oldHash) => {
            process.nextTick(() => {
                MicroWebappStatus._ee.emit(
                    'mw-update', cfg.moduleKey, MWUtil.mwEntry.getMicroWebappEntryPath(cfg), newHash, oldHash
                );
            });
        });
    },
    watch: function (type, cb) {
        MicroWebappStatus._init();
        MicroWebappStatus._ee.on(type, cb);
        return function () {
            MicroWebappStatus._ee.removeListener(type, cb);
        };
    }
};

const handler = function (socket) {
    const restInfo = RestInfoManage.get(socket.request) || {};
    logger.info(
        'connected socket (csid: %s, ip: %s) in session (sid: %s, user: %s).',
        socket.id, socket.request['INFO:IP'], socket.request['INFO:SID'], restInfo.username || '-'
    );

    // 监听微应用的状态变化
    let callback = function (type, ...data) { socket.emit(type, ...data); };
    let destroy1 = MicroWebappStatus.watch('mw-offline', callback.bind(this, 'mw-offline'));
    let destroy2 = MicroWebappStatus.watch('mw-online', callback.bind(this, 'mw-online'));
    let destroy3 = MicroWebappStatus.watch('mw-update', callback.bind(this, 'mw-update'));

    // 断开连接时，取消微应用的状态监听
    socket.on('disconnect', function () {
        logger.info(
            'disconnected socket (csid: %s, ip: %s) in session (sid: %s, user: %s).',
            socket.id, socket.request['INFO:IP'], socket.request['INFO:SID'], restInfo.username || '-'
        );
        destroy1();
        destroy2();
        destroy3();
    });

    // 手动获取当前在线微应用的状态信息
    socket.on('fetch-online', function (ack) {
        if (!ack && typeof ack !== 'function') { return; }
        let ret = {};
        MWUtil.mwData.getAll().then((list) => {
            list.forEach((cfg) => {
                ret[cfg.moduleKey] = {
                    path: MWUtil.mwEntry.getMicroWebappEntryPath(cfg),
                    hash: cfg.data.hash
                };
            });
            ack(ret);
        });
    });
};

export default {
    routes: [{
        'namespace': '/main',
        'session': true,
        'passport': true,
        'handler': handler
    }]
};
