/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import path from 'path';
import log4js from 'log4js-config';
import md5 from '@component-util/md5';
import MWUtil from '../util/mw.util.js';
import DataSdkSocket from 'data-sdk-socket';
import DataSdkRest from 'data-sdk-rest';
import LocalUtil from 'data-sdk-util/lib/local-util';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));

/**
 * controller-mw.socket.js
 * Created by wuyaoqian on 2018/12/20.
 */

const Parser = {
    HandleObj: {
        wsParser: {
            maxPayLoad: 10E7,
            maskPayLoad (source, mask, output, offset, length) {
                for (let i = 0; i < length; i++) {
                    output[offset + i] = source[i] ^ mask[i & 3];
                }
                return output;
            },
            getPerMessageDeflate (onlyName) {
                let PerMessageDeflate = require('ws/lib/permessage-deflate.js');
                return onlyName ? PerMessageDeflate.extensionName : PerMessageDeflate;
            },
            getExtensions (request, isServer) {
                let ret = {};
                let extensions = request && request.headers && request.headers['sec-websocket-extensions'];
                if (!extensions) { return ret; }
                let Extensions = require('ws/lib/extension.js');
                let PerMessageDeflate = Parser.HandleObj.wsParser.getPerMessageDeflate();
                try {
                    let offers = Extensions.parse(extensions);
                    let perMessageDeflate = new PerMessageDeflate({}, isServer, Parser.HandleObj.wsParser.maxPayload);
                    if (offers[PerMessageDeflate.extensionName]) {
                        perMessageDeflate.accept(offers[PerMessageDeflate.extensionName]);
                        ret[PerMessageDeflate.extensionName] = perMessageDeflate;
                    }
                } catch (error) {
                    logger.warn(
                        'sec-websocket-extensions resolve error: ', (error && error.stack) ? error.stack : error
                    );
                }
                return ret;
            },
            getReceiver (extensions) {
                // 注意：ws.Receiver 会对 add 后的 Buffer 进行修改，
                // 所以需要在 socket-pipe 中保留原始数据（ 调用 latestNextCallback(null) 的时候）
                return new (require('ws')).Receiver(false, extensions, Parser.HandleObj.wsParser.maxPayload);
                // 注意：ws-parser.Receiver 不会对 add 后的 Buffer 进行修改，
                // 也无需对 extensions 额外处理（只是不知名，所以暂时不推荐使用）
                // return (require('ws-parser')).getReceiver(request, isServer);
            }
        },
        wsParseEncode (data, mask) {
            // 数据帧详细说明：https://blog.csdn.net/u014520745/article/details/52639452
            let { fin, rsv1, opcode, payload } = Object.assign({
                fin: 1,
                rsv1: 0,
                opcode: 1
            }, (typeof data === 'string' || Buffer.isBuffer(data)) ? { payload: data } : data);
            let head = [];
            let body = Buffer.isBuffer(payload) ? payload : Buffer.from(payload || '');
            let len = body.length;
            let maskFlag = mask ? (1 << 7) : 0;
            // 第1个字节（fin + rsv1 + opcode）
            head.push((fin << 7) + (rsv1 << 6) + opcode);
            // 第2个字节（mask + payload-length)
            if (len <= 0x7D) {
                // 字符长度小于或等于 125 时，只使第2个字节就可表示数据的长度
                // 0x7D = 125 = (0111 1101)
                head.push(maskFlag + len);
            } else if (len <= 0xFFFF) {
                // 字符长度小于或等于 65535 时，将第2个字节设置为 0x7E, 然后使用第 3、4 两个字节（16位）来表示数据的长度
                // 0xFFFF = 65535 = (11111111 11111111)
                // 0x7E = 126 = (0111 1110)
                head.push(maskFlag + 0x7E, (len & 0xFF00) >> 8, len & 0xFF);
            } else {
                // 字符长度大于 65535 时，将第2个字节设置为 0x7F, 然后使用第 3、4、5、6、7、8、9、10 八个字节（64位）来表示数据的长度
                // 0xFFFFFFFFFFFFFFFF = 18446744073709552000 = (
                //     11111111 11111111 11111111 11111111 11111111 11111111 11111111 11111111
                // )
                // 0x7F = 126 = (0111 1111)
                head.push(
                    maskFlag + 0x7F,
                    // 一般不会有这么大的数据，所以直接在高位设置为 0 处理（0xFFFFFFFFFF * 1Byte / 1024 / 1024 / 1024 = 1024GB）
                    0, 0, 0, 0,
                    (len & 0xFF000000) >> 24,
                    (len & 0xFF0000) >> 16,
                    (len & 0xFF00) >> 8,
                    (len & 0xFF) >> 0
                );
            }
            // 掩码处理
            if (mask) {
                body = Parser.HandleObj.wsParser.maskPayLoad(body, mask, body, 0, body.length);
                body = Buffer.concat([mask, body]);
            }
            // 返回组合后的数据
            return Buffer.concat([Buffer.from(head), body]);
        },
        eioParser: require('engine.io-parser'),
        sioParser: require('socket.io-parser'),
        sioParseEncode: new (require('socket.io-parser')).Encoder().encode
    },
    SIOBaseDecoder: class {
        /**
         * 接收 socket-io 数据的构造方法
         * @param {Function} decodeCallback - 解码后的回调
         */
        constructor (decodeCallback) {
            this.sioDecoder = new Parser.HandleObj.sioParser.Decoder();
            this.sioDecoder.on('decoded', decodeCallback);
        }

        add (data) { this.sioDecoder.add(data); }
    },
    WebSocketBaseDecoder: class {
        /**
         * callback 回调方法
         * @callback ReceiveCallback
         * @param {Boolean} isData - 是否接收到的是数据（非 ping, pong, error, close 等）
         * @param {String} data - 具体数据
         */
        /**
         * 接收 WebSocket 数据的构造方法
         * @param {ReceiveCallback} decodeCallback - 数据解析后的回调方法
         * @param {Object|undefined} extensions
         */
        constructor (decodeCallback, extensions) {
            this.receiver = Parser.HandleObj.wsParser.getReceiver(extensions);
            this.receiver.on('message', function (data) {
                decodeCallback('message', Buffer.isBuffer(data) ? data.toString() : data);
            });
            // ping, pong: 原样代理出去
            let other = function () { decodeCallback('other'); };
            // conclude: 关闭连接（操作码为关闭）
            let close = function (reason) {
                decodeCallback('close', (reason && reason.stack) ? reason.stack : reason);
            };
            this.receiver.on('conclude', close).on('ping', other).on('pong', other);
        }

        add (data) { this.receiver.write(data); }
    },
    PipeBaseDecoder: class {
        constructor (wsDecoderOpt) {
            this.sioBaseDecoder = null;
            this.latestNextCallback = function () {};
            this.extensions = Parser.HandleObj.wsParser.getExtensions(wsDecoderOpt.target, wsDecoderOpt.isServer);
            this.wsBaseDecoder = new Parser.WebSocketBaseDecoder((type, data) => {
                logger.isDebugEnabled() && logger.debug(
                    `receive ${wsDecoderOpt.logSnippet} websocket data: `,
                    (
                        (data && (typeof data === 'string'))
                            ? `${data.substr(0, 100)} ... [data-len:${data.length}]`
                            : data
                    ),
                    `[type:${type}]`
                );
                if (type === 'message') {
                    // engine-io decode
                    let packet = Parser.HandleObj.eioParser.decodePacket(data);
                    logger.isDebugEnabled() && logger.debug(
                        `receive ${wsDecoderOpt.logSnippet} engine-io data: `,
                        `${JSON.stringify(packet).substr(0, 100)} ... [data-len:${JSON.stringify(packet).length}]`
                    );
                    // 当 packet 不存在时, 直接将 websocket 数据转发到目标位置
                    if (!packet) { return this.send(data, 'raw'); }
                    // 当 eio-type 不是 message 时，直接将 packet 数据发送到目标位置
                    if (packet.type !== 'message') { return this.send(packet, 'eio'); }
                    // 剩下的交由 socket-io decode 处理
                    return this.sioBaseDecoder && this.sioBaseDecoder.add(packet.data);
                }
                if (type === 'close') {
                    logger.info(`pipe websocket close from ${wsDecoderOpt.logSnippet}, reason: `, data);
                    return this.send({ opcode: 8 }, 'raw');
                }
                //  其它情况，直接将当前的原始 Buffer 转发到目标位置
                return this.latestNextCallback();
            }, this.extensions);
        }

        // compress data
        compress (data, finish) {
            let buffer = Buffer.isBuffer(data) ? data : Buffer.from(data);
            let PerMessageDeflateName = Parser.HandleObj.wsParser.getPerMessageDeflate(true);
            let perMessageDeflate = this.extensions[PerMessageDeflateName];
            if (!perMessageDeflate || data.length <= 100) { return finish(buffer); }
            perMessageDeflate.compress(buffer, true, (error, compressed) => {
                if (error) { logger.warn('PerMessageDeflate compress error: ', error.stack ? error.stack : error); }
                finish({
                    rsv1: 1,
                    payload: compressed
                });
            });
        }

        // send websocket message
        send (data, type) {
            let self = this;
            let mask = self.wsBaseDecoder.receiver._mask;
            if (type === 'sio') {
                let cb = function (data, isNeedCompress) {
                    if (isNeedCompress) {
                        self.compress(data, function (compressed) {
                            self.latestNextCallback(Parser.HandleObj.wsParseEncode(compressed, mask));
                        });
                    } else {
                        self.latestNextCallback(Parser.HandleObj.wsParseEncode(data, mask));
                    }
                };
                Parser.HandleObj.sioParseEncode(data, function (list) {
                    for (let i = 0; i < list.length; i++) {
                        Parser.HandleObj.eioParser.encodePacket({
                            type: 'message',
                            data: list[i]
                        }, null, function (data) {
                            cb(data, list.length === 1);
                        });
                    }
                });
            } else if (type === 'eio') {
                Parser.HandleObj.eioParser.encodePacket(data, function (data) {
                    self.latestNextCallback(Parser.HandleObj.wsParseEncode(data, mask));
                });
            } else if (type === 'raw') {
                self.latestNextCallback(Parser.HandleObj.wsParseEncode(data, mask));
            }
        }

        // receive websocket message
        receive (data, next) {
            this.latestNextCallback = (typeof next === 'function') ? next : function () {};
            this.wsBaseDecoder && this.wsBaseDecoder.add(data);
        }
    }
};

const PipeDecoder = {
    /**
     * 浏览器 -> 微应用的拦截处理
     */
    Request: class extends Parser.PipeBaseDecoder {
        constructor (sourceRequest, sourceSocket, targetResponse, targetSocket, opt) {
            super({
                isServer: true,
                target: sourceRequest,
                logSnippet: `browser -> micro-webapp (cid: ${opt.cfg.appKey})`
            });
            let self = this;

            // socket-io decode
            self.sioBaseDecoder = new Parser.SIOBaseDecoder(function (packet) {
                logger.isDebugEnabled() && logger.debug(
                    'receive browser -> micro-webapp (cid: %s) socket-io data: ',
                    opt.cfg.appKey,
                    `${JSON.stringify(packet).substr(0, 100)} ... [data-len: ${JSON.stringify(packet).length}]`
                );
                if (
                    opt.fetch &&
                    packet.type === Parser.HandleObj.sioParser.EVENT &&
                    Array.isArray(packet.data) &&
                    packet.data[0]
                ) {
                    return opt.fetch(opt.store, opt.sid).then(({ sess }) => {
                        let token = DataSdkRest.userDataManage.session.userToken.get(sess) || {};
                        // 未获取到 access_token，直接将 packet 转发到微应用
                        if (!token.access_token) { return self.send(packet, 'sio'); }
                        // 在 event-key 中附加 token 信息，然后转发到微应用
                        packet.data[0] = `${packet.data[0]}:${JSON.stringify({ token: token.access_token })}`;
                        self.send(packet, 'sio');
                    }).catch(() => {
                        // session 获取失败，直接将 packet 转发到微应用
                        self.send(packet, 'sio');
                    });
                }
                // 其它情况，直接将 packet 转发到微应用
                self.send(packet, 'sio');
            });
        }
    },
    /**
     * 微应用 -> 浏览器的拦截处理
     */
    Response: class extends Parser.PipeBaseDecoder {
        constructor (sourceRequest, sourceSocket, targetResponse, targetSocket, opt) {
            super({
                isServer: false,
                target: targetResponse,
                logSnippet: `micro-webapp (cid: ${opt.cfg.appKey}) -> browser`
            });
            let self = this;

            // send packet to browser
            let prepareAndSend = function (packet, key, msg) {
                // 在 key 之后附加 msg 信息
                packet.data = `${key}:${msg}`;
                // 重新编码数据，然后 pipe 到浏览器当中
                return self.send(packet, 'sio');
            };

            // process event（ 处理 sio-type 为 EVENT，且 packet.data[0] 存在 ）
            let processEvent = function (packet) {
                // 处理 packet.data[0] 是 keys 内的某一个值的数据 ( 如果 token 相同，则进行 session 销毁操作后再返回 )
                if (opt.keys.includes(packet.data[0])) {
                    logger.warn(
                        'receive micro-webapp (cid: %s) -> browser socket-io data(%s): \n',
                        opt.cfg.appKey, packet.data[0], JSON.stringify(packet.data[2] || {})
                    );
                    if (!opt.fetch) {
                        logger.warn(
                            'micro-webapp need process error info(%s) in socket, ' +
                            'but opt.fetch was null, [ignored], \napp-key: %s, sid: %s',
                            packet.data[0], opt.cfg.appKey, opt.sid || '-'
                        );
                        return;
                    }
                    return opt.fetch(opt.store, opt.sid).then(({ sess }) => {
                        let data = packet.data[2] || {};
                        let token = DataSdkRest.userDataManage.session.userToken.get(sess) || {};
                        let user = DataSdkRest.userDataManage.session.userInfo.get(sess) || {};
                        if (token.access_token && data.errorAccessToken === token.access_token) {
                            packet.data.splice(2, 1);
                            opt.store.destroy(opt.sid, function () { self.send(packet, 'sio'); });
                        } else {
                            logger.info(
                                'ignored push-event(type: %s) from micro-webapp(cid: %s), \n' +
                                'user: %s, error-token: %s, cur-token: %s',
                                packet.data[0], opt.cfg.appKey, user.username || '-',
                                data.errorAccessToken, token.access_token || '-'
                            );
                        }
                    }).catch(() => {});
                }
                // 处理 packet.data[0] === 'token-expired' ( 进行 token 的自动刷新处理, 且不会将数据代理到界面中 )
                if (packet.data[0] === 'token-expired') {
                    logger.warn(
                        'receive micro-webapp (cid: %s) -> browser socket-io data(token-expired): \n',
                        opt.cfg.appKey, JSON.stringify(packet.data[1] || {})
                    );
                    return self.processTokenRefresh(opt, packet.data[1] || {});
                }
            };

            // process error（ 处理 sio-type 为 ERROR，且匹配 httpStatusCode 规则 ）
            let processError = function (packet) {
                let key = packet.data;
                logger.error(
                    'receive micro-webapp (cid: %s) -> browser socket-io data(error): ',
                    opt.cfg.appKey, key || '-'
                );
                if (key === '401') {
                    if (!opt.fetch) {
                        logger.warn(
                            'micro-webapp need process error info(401) in socket, ' +
                            'but opt.fetch was null, [ignored], \napp-key: %s, sid: %s',
                            opt.cfg.appKey, opt.sid || '-'
                        );
                        return;
                    }
                    return opt.fetch(opt.store, opt.sid).then(({ sess }) => {
                        if (sess.user) {
                            key = '500';
                            logger.warn(
                                `micro-webapp ( %s ) websocket pipe return 401, but user-info check was ok!`,
                                opt.cfg.appKey
                            );
                        }
                        prepareAndSend(packet, key, LocalUtil.getLangObj(sourceRequest, '_server_')[key] || '(O_o)');
                    }).catch(() => {
                        prepareAndSend(
                            packet, '500', LocalUtil.getLangObj(sourceRequest, '_server_')['500'] || '(O_o)'
                        );
                    });
                }
                return prepareAndSend(packet, key, LocalUtil.getLangObj(sourceRequest, '_server_')[key] || '(O_o)');
            };

            // socket-io decode
            self.sioBaseDecoder = new Parser.SIOBaseDecoder(function (packet) {
                logger.isDebugEnabled() && logger.debug(
                    'receive micro-webapp (cid: %s) -> browser socket-io data: ',
                    opt.cfg.appKey,
                    `${JSON.stringify(packet).substr(0, 100)} ... [data-len: ${JSON.stringify(packet).length}]`
                );
                if (packet.nsp !== '/') {
                    // 当 namespace !== '/' 时，直接将 packet 转发到浏览器
                    return self.send(packet, 'sio');
                }
                if (packet.type === Parser.HandleObj.sioParser.EVENT && Array.isArray(packet.data) && packet.data[0]) {
                    // 处理 sio-type 为 EVENT，且 packet.data[0] 存在
                    processEvent(packet);
                } else if (packet.type === Parser.HandleObj.sioParser.ERROR && /^(\d{3})$/.test(packet.data || '')) {
                    // 处理 sio-type 为 ERROR，且匹配 httpStatusCode 规则
                    processError(packet);
                }
                // 其它情况，直接将 packet 转发到浏览器
                return self.send(packet, 'sio');
            });
        }

        // process user-token refresh
        processTokenRefresh (opt, { errorCodeNumber, errorAccessToken }) {
            if (!errorAccessToken || !errorCodeNumber) { return; }
            if (!opt.fetch) {
                logger.warn(
                    'micro-webapp need refresh token in socket, but opt.fetch was null, \napp-key: %s, sid: %s',
                    opt.cfg.appKey, opt.sid || '-'
                );
                return;
            }
            opt.fetch(opt.store, opt.sid).then(({ sess }) => {
                let token = DataSdkRest.userDataManage.session.userToken.get(sess) || {};
                let user = DataSdkRest.userDataManage.session.userInfo.get(sess) || {};
                if (!token.access_token || !user.username) {
                    logger.warn(
                        'no token or user info found when process token expired event ' +
                        'from micro-webapp websocket pipe return, \napp-key: %s, sid: %s',
                        opt.cfg.appKey, opt.sid || '-'
                    );
                    return null;
                }
                if (token.access_token !== errorAccessToken) {
                    logger.info(
                        'ignored push-event(type:token-expired) from micro-webapp(cid: %s), \n' +
                        'user: %s, error-token: %s, cur-token: %s',
                        opt.cfg.appKey, user.username || '-', errorAccessToken, token.access_token
                    );
                    return null;
                }
                return Promise.resolve({
                    user: user,
                    token: token,
                    sess: sess,
                    errorCodeNumber: errorCodeNumber
                });
            }).then((data) => {
                if (!data) { return null; }
                const { user, token, sess, errorCodeNumber } = data;
                // 注意: processUserTokenError 参数 context 由 false 改为 {}，否则会报错，
                // 这是因为在 pipe 这里不好构建一个 socket.io 中的 BrowserClientSocket；
                // 改过之后还可能出现的问题就是当刷新 user-token 时出现 refresh-token 不存在（ 概率应该是非常低的 ），并
                // 尝试进行 checkTokenInRemoteSession 时会报错（ 因无 BrowserClientSocket，而无法获取 store 进行 fetch 验证 ）
                DataSdkRest.tokenProvider.processUserTokenError(errorCodeNumber, {
                    user: user,
                    token: token
                }, {}).on('token-refresh-successful', function (newToken) {
                    DataSdkRest.userDataManage.session.userToken.set(sess, newToken);
                    opt.store.set(opt.sid, sess, function () {});
                });
            }).catch(() => {});
        };
    }
};

const Util = {
    // 响应错误信息到浏览器，并关闭连接
    responseErrorInfo: function (socket, httpStatusCode, msg) {
        socket.writable && socket.write(
            'HTTP/1.1 ' + httpStatusCode + ' Bad Request\r\n' +
            'Connection: close\r\n' +
            'Content-type: text/html\r\n' +
            'Content-Length: ' + Buffer.byteLength(msg) + '\r\n' +
            '\r\n' + msg
        );
        socket.destroy();
    },
    // 需要做 session-destroy 处理的错误码
    tokenForceOutKeys: [
        'token-was-kicked-by-manager',
        'token-refresh-expired', 'token-not-exist', 'token-was-kicked', 'token-was-kicked-by-sso', 'token-force-out',
        '451', '452', '453', '454', '455'
    ],
    // 获取 session 数据
    fetchSession (store, sid) {
        return new Promise(function (resolve, reject) {
            if (!sid) {
                return resolve({
                    sid: '',
                    sess: null
                });
            }
            store.get(sid, (error, sess) => {
                error ? reject(error) : resolve({
                    sid: sid,
                    sess: sess
                });
            });
        });
    },
    // 处理微应用的 websocket 转发
    processMicroWebAppWebSocketPipe: function (req, socket, head, opt) {
        let requestPipeDecoder = null;
        let responsePipeDecoder = null;
        let url = `${opt.cfg.baseUrl}/${opt.path}`;
        let token = DataSdkRest.userDataManage.session.userToken.get(opt.sess || {});
        let sessHash = opt.sess ? md5(JSON.stringify(opt.sess)) : false;
        let baseOpt = {
            cfg: opt.cfg,
            sid: opt.sid,
            store: opt.sessionStore,
            fetch: opt.sess ? Util.fetchSession : false
        };
        // socket pipe
        DataSdkSocket.socketPipe(req, socket, head, {
            url: url,
            header: Object.assign({
                'authorization': (token && token.access_token) ? `oauth2 ${token.access_token}` : ''
            }, MWUtil.buildMicroWebappForwardHeader(
                opt.sid, opt.sess || {}, opt.cfg
            ))
        }).on('data-request', (chunk, next) => {
            logger.isDebugEnabled() && logger.debug(
                'websocket (%s) data-request (len: %s)：\n', opt.cfg.appKey, chunk.length, chunk
            );
            requestPipeDecoder ? requestPipeDecoder.receive(chunk, next) : next();
        }).on('data-response', (chunk, next) => {
            logger.isDebugEnabled() && logger.debug(
                'websocket (%s) data-response (len: %s)：\n', opt.cfg.appKey, chunk.length, chunk
            );
            responsePipeDecoder ? responsePipeDecoder.receive(chunk, next) : next();
        }).on('open', (targetResponse, targetSocket) => {
            logger.info('websocket pipe opened (%s).', url);
            requestPipeDecoder = new PipeDecoder.Request(req, socket, targetResponse, targetSocket, baseOpt);
            responsePipeDecoder = new PipeDecoder.Response(req, socket, targetResponse, targetSocket, Object.assign({
                keys: Util.tokenForceOutKeys
            }, baseOpt));
        }).on('error', (error) => {
            requestPipeDecoder = null;
            responsePipeDecoder = null;
            logger.error('websocket pipe error (%s), detail: ', url, (error && error.stack) ? error.stack : error);
        }).on('close', () => {
            requestPipeDecoder = null;
            responsePipeDecoder = null;
            logger.info('websocket pipe closed (%s).', url);
        });
        // save updated sess
        if (opt.sess && opt.sess.cookie && sessHash && sessHash !== md5(JSON.stringify(opt.sess))) {
            opt.sessionStore.set(opt.sid, opt.sess, function () {});
        }
    }
};

/**
 * 初始化微应用在 websocket 下的转发逻辑
 * @param server
 * @param sessionStore
 * @param getSessionId
 * @param getExtractParser
 */
export default function (server, sessionStore, getSessionId, getExtractParser) {
    process.nextTick(function () {
        let listeners = server.listeners('upgrade').slice(0);
        server.removeAllListeners('upgrade');
        // 监听 upgrade 请求
        server.on('upgrade', function (req, socket, head) {
            let matchResult = MWUtil.forwardPathFromBrowser.exec(req.url);
            if (!matchResult) {
                for (let i = 0, l = listeners.length; i < l; i++) {
                    listeners[i].call(server, req, socket, head);
                }
                return;
            }
            let microCtx = matchResult[1];
            let microPath = matchResult[2];
            MWUtil.mwData.getByWebContext(microCtx).then((cfg) => {
                if (!cfg) {
                    return Util.responseErrorInfo(socket, 404, `Micro Webapp (ctx: ${microCtx}) not found!`);
                }
                // 解析并生成 socket.request.query = {...} 对象【 填充 op.sid 之用 】
                getExtractParser(['query'])[0](req, null, () => {});
                // 解析并生成 socket.request.cookies = {...} 对象【 填充 op.sid 之用 】
                getExtractParser(['cookie'])[0](req, null, () => {});
                // 解析 cookies 中的 finger-print 信息，并存储在 header 中【 通过 headers.fpr 传递到微应用，微应用可以不用再次解析 】
                getExtractParser(['finger-print'])[0](req, null, () => {});
                // 完善 headers 中的 terminal-device 信息【 通过 headers.td 传递到微应用，微应用可以不用再次完善 】
                req.headers['td'] = req.headers['terminal_device'] = cfg.terminalDevice;
                // 处理 websocket 转发
                let opt = {
                    cfg: cfg,
                    ctx: microCtx,
                    path: microPath,
                    sessionStore: sessionStore,
                    sid: getSessionId(req),
                    sess: false
                };
                if (
                    cfg.statics && Array.isArray(cfg.statics) &&
                    cfg.statics.find((path) => `/${microPath}`.startsWith(path))
                ) {
                    return Util.processMicroWebAppWebSocketPipe(req, socket, head, opt);
                }
                return Util.fetchSession(sessionStore, opt.sid).then(({ sess }) => {
                    opt.sess = sess;
                    Util.processMicroWebAppWebSocketPipe(req, socket, head, opt);
                }).catch((error) => {
                    Util.responseErrorInfo(socket, 400, (error && error.message) ? error.message : error);
                });
            });
        });
    });
};
