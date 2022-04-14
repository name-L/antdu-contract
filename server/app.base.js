/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/*
 * WEB应用入口 (base)
 */

// init date util
import 'date-utils';
// init global name setting
import './global.name.js';

// 其它的 import
import path from 'path';
import http from 'http';
import fs from 'fs';
import log4js from 'log4js-custom-config';
import express from 'express';
import expSession from 'express-session';
import expErrorHandler from 'express-errorhandler';
import ejs from 'ejs';
import { system as config } from 'config';
import controllerMicroWebAppSocket from './handler/controller-mw.socket.js';
import controllerHttp from './handler/controller.http.js';
import controllerSocket from './handler/controller.socket';
import sessionChecker from './handler/controller-session-checker.http.js';
import LocalUtil from 'data-sdk-util/lib/local-util';
import IpUtil from 'data-sdk-util/lib/ip-util';
import CustomFilter from './global.filter.js';

// init sdk-global-handler
import './handler/sdk-global-handler';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));
const sessionKey = global.session_key;
const sessionSecret = global.session_secret;
const app = express();
const server = http.createServer(app);

// all environments
process.env.port = process.env.port || config.port;
app.set('port', process.env.port || config.port);
app.set('env', config.env);

// view (注意：目前只在部署阶段有作用，因为开发阶段的 html 被 dev-temp-server 拦截了)
app.set('views', path.join(__dirname, '../static'));
app.engine('.html', ejs.__express);
app.engine('.tpl', ejs.__express);
app.set('view engine', 'ejs');

// 请求解析器
class Parser {
    /**
     * 获取解析 extract 或 consume 的句柄
     * @param {string} type - extract or consume
     * @param {array} methods
     * @param {string|object} methods[0]
     * string:
     * @param {string} methods[0] - method
     * object:
     * @param {string} methods[0].key - method
     * @param {*} methods[0].opt - opt
     * @return {array}
     */
    static getHandlerList (type, methods) {
        return methods.map((method) => {
            if (method && typeof method === 'string') {
                return Parser.SupportListOpt[type][method]();
            } else if (method && method.key && (typeof method.key === 'string')) {
                return Parser.SupportListOpt[type][method.key](method.opt);
            } else {
                throw new Error(`parser param opt error: ${JSON.stringify(methods)}`);
            }
        });
    };

    /**
     * get extract parser list
     * @param {array|undefined} methods
     * @return {array}
     */
    static getExtractHandlerList (methods) {
        return Parser.getHandlerList('extract', Array.isArray(methods) ? methods : ['cookie']);
    };

    /**
     * get consume parser list
     * @param {array|undefined} methods
     * @return {array}
     */
    static getConsumeHandlerList (methods) {
        return Parser.getHandlerList('consume', Array.isArray(methods) ? methods : ['json', 'urlencoded']);
    };

    // prepare parser
    static init () {
        // express body parser
        this.ExpBodyParser = require('body-parser');
        // body size limit
        this.BodySizeLimit = '5mb';
        // support list cache
        this.SupportListCache = {};
        // support list opt
        this.SupportListOpt = {
            extract: {
                'query': function () { return express.query(); },
                // 暂时禁用，不需要使用方法覆盖
                // 'method': function () { return (require('method-override'))(); },
                'cookie': function () { return (require('cookie-parser'))(sessionSecret); },
                'finger-print': function (key) {
                    // 前提：extract.cookie 先执行
                    // 提取 req.cookies.fpr 指纹信息，并追加到 req.headers['user-agent'] 之后
                    return function (req, res, next) {
                        let val;
                        if (req.headers['fpr']) {
                            // 这里返回是避免 user-agent 的重复追加 fpr 信息
                            return next();
                        }
                        if (!req.cookies || !(val = req.cookies[key || 'fpr'] || req.cookies[key || 'fp'] || '')) {
                            // 只从 req.cookies 中提取信息，然后存储到 header 中
                            return next();
                        }
                        req.headers['fpr'] = val;
                        if (req.headers['user-agent']) {
                            req.headers['user-agent'] += ` AntBrowser/1.0 (${val})`;
                        }
                        next();
                    };
                },
                'terminal-device': function () {
                    // 完善请求头中的 terminal_device 信息
                    return function (req, res, next) {
                        req.headers['td'] =
                            req.headers['terminal_device'] =
                                config.terminalDevice.getCurrentTerminalDeviceByRequest(req);
                        next();
                    };
                }
            },
            consume: {
                'json': function (opt) {
                    return Parser.ExpBodyParser.json(Object.assign({
                        limit: Parser.BodySizeLimit,
                        type: 'application/json'
                    }, opt));
                },
                'urlencoded': function (opt) {
                    return Parser.ExpBodyParser.urlencoded(Object.assign({
                        limit: Parser.BodySizeLimit,
                        type: 'application/x-www-form-urlencoded',
                        extended: true
                    }, opt));
                },
                'raw': function (opt) {
                    return Parser.ExpBodyParser.raw(Object.assign({
                        limit: Parser.BodySizeLimit,
                        type: 'application/octet-stream'
                    }, opt));
                },
                'text': function (opt) {
                    return Parser.ExpBodyParser.text(Object.assign({
                        limit: Parser.BodySizeLimit,
                        type: 'text/plain'
                    }, opt));
                }
            }
        };
        // 根据不同的 opt 来缓存 handler, 这样方便在不同的 route 中使用同一个 handler
        Object.keys(Parser.SupportListOpt).forEach((type) => {
            Parser.SupportListCache[type] = {};
            Object.keys(Parser.SupportListOpt[type]).forEach((method) => {
                let handlerWrapper = Parser.SupportListOpt[type][method];
                let handlerCache = Parser.SupportListCache[type][method] = {};
                Parser.SupportListOpt[type][method] = function (opt) {
                    let key = JSON.stringify(opt);
                    return handlerCache[key] || (handlerCache[key] = handlerWrapper(opt));
                };
            });
        });
    }
}

// 初始化静态 Parse
Parser.init();

// 全局过滤器
const filters = ((filters, orders) => {
    let orderedArray = [];
    let opt = {
        app,
        server,
        extract: Parser.getExtractHandlerList,
        consume: Parser.getConsumeHandlerList
    };
    orders.forEach((key) => {
        filters[key] && orderedArray.push(filters[key].bind(global, opt));
        delete filters[key];
    });
    Object.keys(filters).forEach((key) => {
        orderedArray.push(filters[key].bind(global, opt));
    });
    return orderedArray;
})(
    Object.assign({
        // 上下文过滤
        ctx: ({ app }) => {
            // 0. global.ctx_path check
            if (!global.ctx_path) { return; }

            // 1. ctx-redirect (exclude /favicon.ico )
            let ctxRegExp = new RegExp(`^${global.ctx_path.replace('/', '\\/')}($|\\/)`);
            let favRegExp = /^\/favicon\.ico($|[?])/;
            app.use(function ctxFilterHandler (req, res, next) {
                if (!ctxRegExp.test(req.url) && !favRegExp.test(req.url)) {
                    return res.redirect(`${global.ctx_path}${req.url}`);
                }
                return next();
            });
        },
        // 在请求头中附加指纹信息
        fpr: ({ app, extract }) => {
            // 1. 解析所有 cookies
            app.use(extract(['cookie'])[0]);
            // 2. 提取 req.cookies.fpr 指纹信息，并追加到 req.headers['user-agent'] 之后
            app.use(extract(['finger-print'])[0]);
        },
        // 在请求头中完善 terminal_device 信息
        td: ({ app, extract }) => {
            app.use(extract(['terminal-device'])[0]);
        }
    }, CustomFilter.filters),
    CustomFilter.orders
);

let sessionStore;
/**
 * 初始化 session-store
 * @param {object} store
 * @param {string} store.type - 类型：caster, empty
 * @param {*} store.opt - 不同类型，可能会有不同的值
 * opt.type: caster
 * @param {object} store.opt.storeCustomInfo
 * @param {string} store.opt.storeCustomInfo.key
 * @param {function} store.opt.storeCustomInfo.data
 * @return {Promise<*>}
 */
const initSessionStore = function (store) {
    return new Promise((resolve, reject) => {
        if (sessionStore) {
            return resolve(sessionStore);
        }
        if (!store || !store.type) {
            return reject(new Error('need session-store: store.type params!'));
        }

        // caster
        if (store.type === 'caster') {
            store.opt = store.opt || {};
            let storeCustomInfo = store.opt.storeCustomInfo ? Object.assign({
                key: 'client',
                data: function (req) {
                    return {
                        'user-agent': req.headers['user-agent'] || '',
                        'fpr': req.headers['fpr'] || '',
                        'ip': IpUtil.getClientIp(req)
                    };
                }
            }, store.opt.storeCustomInfo) : false;
            sessionStore = new ((require('caster-client-sdk')).expressStore(expSession))({
                resaveTime: 1000 * 60 * config.session.timeToLive / 3,
                // 存储一些额外信息到 session 当中
                storeCustomInfo: storeCustomInfo,
                // caster 连接成功后的回调
                connectedCallback: function () {
                    resolve(sessionStore);
                }
            }, config.session.casterMapName, 1000 * 60 * config.session.timeToLive);
            sessionStore.type = store.type;
            return;
        }

        // empty
        if (store.type === 'empty') {
            sessionStore = new ((require('./handler/session-store-empty.js'))(expSession))();
            sessionStore.type = store.type;
            process.nextTick(() => {
                resolve(sessionStore);
            });
        }
    });
};

let sessionHandler;
const getSessionHandler = function () {
    if (sessionHandler) { return sessionHandler; }
    sessionHandler = expSession({
        resave: false,
        saveUninitialized: true,
        secret: sessionSecret,
        key: sessionKey,
        // 是否每次都回写到浏览器
        rolling: false,
        // 是否在 Nginx 下（与 cookie.secure: ‘auto’ 值有关）
        // proxy: true,
        cookie: {
            // 会根据 nginx 的 x-forwarded-proto === https 来判断
            // secure: 'auto'
            // 游览器存放的时间（如果注释，则是浏览器退出时自动清理）
            // maxAge: 1000 * 60 * config.session.timeToLive
            path: `${global.ctx_path || '/'}`
        },
        store: sessionStore
    });
    // 动态配置 cookie.path
    // let generate = sessionStore.generate;
    // sessionStore.generate = function (req) {
    //     generate.call(this, req);
    //     if (req.CTX_INFO) {
    //         req.session.cookie.path = `/${req.CTX_INFO.org}/${req.CTX_INFO.app}/`;
    //     }
    // };
    return sessionHandler;
};

// 一般要 socket 中才需要这样手动的 get-session-id
const getSessionId = function (req) {
    // 手动提取 cookies (注意：需要提前运行 Parser.SupportListOpt.extract.cookie )
    return (req.secureCookies && req.secureCookies[sessionKey]) ||
        (req.signedCookies && req.signedCookies[sessionKey]) ||
        (req.cookies && req.cookies[sessionKey]) || '';
};

const handleController = (opt) => {
    // init controller http
    controllerHttp(app, {
        extract: Parser.getExtractHandlerList,
        consume: Parser.getConsumeHandlerList
    }, {
        store: sessionStore,
        handler: getSessionHandler(),
        checker: opt && opt.session && opt.session.check ? sessionChecker(Object.assign({
            key: 'client',
            list: ['fpr'],
            redirect: '/'
        }, opt.session.check)) : false
    }, opt);

    // init controller socket
    controllerSocket(server, sessionStore, getSessionId, Parser.getExtractHandlerList);

    // init mw-controller.socket
    controllerMicroWebAppSocket(server, sessionStore, getSessionId, Parser.getExtractHandlerList);
};

const handleError = (opt) => {
    let filesystem = app.devOpt ? app.devOpt.fileSystem : fs;
    let publicPath = app.devOpt ? app.devOpt.publicPath : path.join(__dirname, '../static/');

    let notFoundContent = filesystem.readFileSync(path.join(publicPath, `${global.ctx_tpl_path}/404.tpl`), 'utf-8');
    let errorContent = filesystem.readFileSync(path.join(publicPath, `${global.ctx_tpl_path}/500.tpl`), 'utf-8');
    // 拦截错误页面（404，500等）
    app.use(expErrorHandler(app, Object.assign({
        'content': {
            '404': notFoundContent,
            'default': errorContent
        },
        'data': {
            'theme': 'dark',
            'step-1': (req) => { return LocalUtil.getLangObj(req, '_server_')['step-1']; },
            'step-2': (req) => { return LocalUtil.getLangObj(req, '_server_')['step-2']; },
            'error-msg': (req, status) => {
                let server = LocalUtil.getLangObj(req, '_server_');
                return server[`${status}`] || server['500'] || '';
            }
        },
        'redirect': (req, status, error, type) => {
            if (type === 'html' && status === 401) {
                return `${global.ctx_path}/login${req._parsedUrl.search || ''}`;
            }
        }
    }, opt)));
};

const handleSystem = (opt) => {
    // 退出程序：这里退出, 是为了程序的重启 (因为 forever或pm2 会自动的检测 node 的关闭情况, 然后重启)
    let terminate = function () {
        process.nextTick(function () {
            if (
                (process.env.uncaughtExceptionExit === undefined && config.uncaughtExceptionExit) ||
                process.env.uncaughtExceptionExit === '1') {
                process.exit(0);
            }
        });
    };

    // 记录未被拦截的 rejection 异常
    process.on('unhandledRejection', function (err) {
        logger.error('Unhandled Rejection: \n', err && err.stack ? err.stack : err);
        if (!log4js.log4js || !log4js.log4js.appenders['log4js-restlet']) {
            return;
        }
        require('log4js-restlet').flushAll(true);
    });

    // 目的是在程序出现未捕获的异常时，记录日志的同时保证程序不退出
    // 这是一种不推荐的做法，有时间去看看 Domain 的做法(没看懂，或不知道如何应用在 socket.io 中)
    // http://nodejs.org/api/domain.html
    if (opt && opt.uncaughtException) {
        process.on('uncaughtException', function (err) {
            logger.error('UnCaughted Exception: \n', err && err.stack ? err.stack : err);
            if (err.config) {
                logger.error('UnCaughted Exception Config: \n', err.config);
            }
            if (!log4js.log4js || !log4js.log4js.appenders['log4js-restlet']) {
                return;
            }
            // 退出前，发送日志
            require('log4js-restlet').flushAll(true, terminate);
        });
    }
};

const startServer = () => {
    // start server
    server.listen(app.get('port'), function () {
        logger.info(
            `Express server listening on port %s , and start in ----"%s"---- model`,
            app.get('port'), app.get('env')
        );
    });
};

export {
    app,
    filters,
    initSessionStore,
    handleController,
    handleError,
    handleSystem,
    startServer
};
