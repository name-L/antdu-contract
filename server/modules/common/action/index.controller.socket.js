/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 全局根目录 WebSocket 服务
 * Created by wuyaoqian on 16/5/19.
 */

import path from 'path';
import log4js from 'log4js-config';
import DataSdkRest from 'data-sdk-rest';
import { system as appConfig } from 'config';
import MWUtil from '../../../util/mw.util.js';

const RestInfoManage = DataSdkRest.userDataManage.socketRequest.restInfo;
const logger = log4js.get(global.log_prefix_name + path.basename(__filename));

const clientConnection = function (socket) {
    const restInfo = RestInfoManage.get(socket.request) || {};
    const store = restInfo['session-store'];
    const username = restInfo.username;
    const delayTime = Math.max(
        30, Math.min(appConfig.session.timeToLive * 60 - 30, appConfig.session.timeToLive * 60 / 2)
    ) * 1000;
    const sid = socket.request['INFO:SID'];
    const ip = socket.request['INFO:IP'];

    // 在已登录的情况下, 才有必要自动延长 session 的过期时间
    if (!username || !store) {
        logger.info(
            'connected socket (csid: %s, ip: %s) in session (sid: %s, user: %s).',
            socket.id, ip, sid, username || '-'
        );

        socket.on('disconnect', function () {
            logger.info(
                'disconnected socket (csid: %s, ip: %s) in session (sid: %s, user: %s).',
                socket.id, ip, sid, username || '-'
            );
        });
        return;
    }

    // 注意：为是计算时间的正确，需要在 controller.socket.js 中的 tryRecordUserData 立即保存一次 session 数据
    logger.info(
        '推送连接建立成功，稍后将自动延长 session (ttl: %ss) 的过期时间\nsid: %s, user: %s, csid: %s, ip: %s',
        appConfig.session.timeToLive * 60, sid, username || '-', socket.id, ip
    );
    socket.request.autoDelaySessionTimeId = setTimeout(function autoResetSessionExpireTime () {
        store.get(sid, function (err, sess, time) {
            if (!err && sess && sess.user) {
                if (time && time > delayTime) {
                    logger.info(
                        '暂不自动延长 session (ttl: %ss) 的过期时间，因为 (expire: %ss > delay: %ss)，' +
                        '稍后继续 (next: %ss), \nsid:%s, user: %s, csid: %s, ip: %s',
                        appConfig.session.timeToLive * 60, time / 1000, delayTime / 1000, time / 2 / 1000,
                        sid, username || '-', socket.id, ip
                    );
                    socket.request.autoDelaySessionTimeId = setTimeout(autoResetSessionExpireTime, time / 2);
                    return;
                }
                return store.set(sid, sess, function (err) {
                    if (!err) {
                        logger.info(
                            '自动延长了 session (ttl: %ss) 的过期时间，稍后继续 (next: %ss), \n' +
                            'session-id: %s, user: %s, csid: %s, ip: %s',
                            appConfig.session.timeToLive * 60, delayTime / 1000, sid, username || '-', socket.id, ip
                        );
                        socket.request.autoDelaySessionTimeId = setTimeout(autoResetSessionExpireTime, delayTime);
                        MWUtil.keepAlive('session-keep', sid, sess);
                        return;
                    }
                    logger.warn(
                        '自动延长 session (sid: %s, user: %s) in socket (csid: %s, ip: %s) 的过期时间, 失败了(数据回写)',
                        sid, username || '-', socket.id, ip
                    );
                });
            }
            logger.warn(
                '自动延长 session(sid: %s, user: %s) in socket (csid: %s, ip: %s) 的过期时间, 失败了(数据获取)',
                sid, username || '-', socket.id, ip
            );
        });
    }, 0);

    socket.on('disconnect', function () {
        clearTimeout(socket.request.autoDelaySessionTimeId);
        logger.isInfoEnabled() && logger.info(
            '检测到连接已断开，程序将自动停止 session 的周期延长过期时间的操作。\nsid:%s, user: %s, csid: %s, ip: %s',
            sid, username || '-', socket.id, ip
        );
    });
};

export default {
    clientConnection: clientConnection
};
