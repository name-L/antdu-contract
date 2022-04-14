/*!
 * Copyright (c) 2018-2020 Autdu Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2018-2020 湖南蚁为软件有限公司。保留所有权利。
 */

'use strict';

/**
 * mw-forward.http.js
 * 为确保高效及正确处理微应用相关方面的拦截处理，需要将此路由放在其它路由之前（可放在主应用的 static 之后，其它之前）
 * 详细参照 server/route.http.js 中的处理
 * Created by wuyaoqian on 2019/11/4.
 */

import accepts from 'accepts';
import path from 'path';
import log4js from 'log4js-config';

import RestUtil from 'data-sdk-util/lib/rest-util';
import DataSdkRest from 'data-sdk-rest';
import MWUtil from '../../../util/mw.util.js';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));
const globalErrorStatus = MWUtil.mwConfig.rule.globalErrorPageStatus || [];
const DataManage = DataSdkRest.userDataManage;
const RestHelp = RestUtil.getInstance(logger);

/**
 * 开始处理浏览器到微应用的转发请求
 * @param req
 * @param res
 * @param next
 * @return {*}
 */
const processPipeToMicroFromBrowser = function (req, res, next) {
    let microPath = req.MW_DATA.path;
    let cfg = req.MW_DATA.cfg;
    let session = req.session || {};
    let rest = session.user ? 'userRest' : 'baseRest';

    // 开始转发请求
    RestHelp[rest].auto(`${cfg.baseUrl}${microPath}`).opt({
        'req': req,
        'res': res,
        'followRedirects': false,
        'processErrorResponsePipe': true,
        'pipe-request': true,
        'pipe-response': function (microHeaders, microResponse) {
            let pipeError = MWUtil.mwConfig.rule.pipeErrorResponse;
            let code = microResponse && parseInt(microResponse.statusCode);
            let pipe = () => MWUtil.resolveMicroWebappResponseHeader(microHeaders, cfg, req, microPath);
            // 0. statusCode < 400 ( direct pipe )
            if (code < 400) { return pipe(); }
            // 1. 用户 token 强制退出，如果 token 相同，则先销毁 session 再 pipe，否则进入 error 环节
            if ([451, 452, 453, 454, 455].includes(code)) {
                let data = {};
                let token = DataManage.session.userToken.get(req.session) || {};

                if (microHeaders && microHeaders['data']) {
                    try {
                        data = JSON.parse(microHeaders['data']);
                    } catch (error) {
                        logger.error(
                            `micro-webapp ( ${cfg.appKey} ) rest pipe error, \nheaders: %s, \ndetail: \n`,
                            microHeaders, (error && error.stack ? error.stack : error)
                        );
                    }
                }
                if (token.access_token && data.errorAccessToken === token.access_token) {
                    delete microHeaders['data'];
                    res.clearCookie(global.session_key);
                    return new Promise((resolve) => {
                        req.session && req.session.destroy(() => resolve(pipe()));
                    });
                }
                res._existRenderErrorContent_ = {
                    status: code,
                    msg: `micro-webapp ( ${cfg.appKey} ) rest pipe return ${code}, but user-token-info was changed!`
                };
                return false;
            }
            // 2. 微应用返回 401，但主应用又是已登录状态，说明微应用获取主应用的 user 信息可能失败了 ( process error )
            if (code === 401 && req.session && req.session.user) {
                res._existRenderErrorContent_ = {
                    status: 500,
                    msg: `micro-webapp ( ${cfg.appKey} ) rest pipe return 401, but user-info check was ok!`
                };
                return false;
            }
            // 3. pipeError(...) === true ( direct pipe )
            if (typeof pipeError === 'function' && pipeError(code, microHeaders, req.headers, microResponse)) { return pipe(); }
            // 4. 除指定的几个状态码之外的错误码直接 pipe 给浏览器 ( direct pipe )
            if (!globalErrorStatus.includes(code)) { return pipe(); }
            // 5. 符合 globalErrorStatus 的将统一使用主应用的界面提示 ( process error )
            return false;
        }
    }).header(Object.assign({}, MWUtil.buildMicroWebappForwardHeader(
        session.id || '', session, cfg
    ))).error((emitter, errorCodeDesc, microResponse) => {
        // 不知什么情况下会有 res.headersSent，win 中的主应用有出现过 2019-01-25
        if (res.headersSent) {
            return logger.warn('detected response was send then ignored current response, \nurl: %s', req.url);
        }
        let code = microResponse && parseInt(microResponse.statusCode);
        // 0. 出错时，将强制不缓存页面
        res.set('cache-control', 'public, max-age=0');
        // 1. 直接返回错误结果（ 在 pipe-response 阶段中判断 ）
        if (res._existRenderErrorContent_) {
            res.status(res._existRenderErrorContent_.status);
            return next(new Error(res._existRenderErrorContent_.msg));
        }
        // 2. 符合 globalErrorStatus 的将统一使用主应用的界面提示
        if (globalErrorStatus.includes(code)) {
            res.status(code);
            return next(new Error(`raw-msg: ${microResponse.raw}`));
        }
        // 3. 其它情况，直接将 errorCodeDesc 返回浏览器（ 无需进入 globalErrorPage 中处理 ）
        // 这个 errorCodeDesc 一般只有是 'rest-error' ( 请求 Error 时的网络异常 ) 或者是 'default-error' ( 一切未知错误， )
        // 两种情况, 而 default-error 是因为主应用无法处理微应用自身转义后的具有业务意义的 errorCode 的
        if (accepts(req).types('text', 'js', 'javascript', 'json') !== 'json') {
            return res.send(`// msg: ${errorCodeDesc.msg}`);
        }
        return res.json({
            'success': false,
            'msg': errorCodeDesc.msg
        });
    }).send();
};

export default {
    module: null,
    // 将此路由放在第2个位置（在主应用 static 路由之后）
    position: 2,
    routes: [
        // 0. filter
        {
            'method': 'use',
            'path': `${MWUtil.mwConfig.ctx}`,
            'handler': [function microFilterHandler (req, res, next) {
                // 微应用转发URL正则：/mw/(micro-ctx1|micro-ctx2|...)/(micro-path?query)
                // result[1]: micro-ctx
                // result[2]: micro-path
                let matchResult = MWUtil.forwardPathFromBrowser.exec(req.originalUrl);
                if (!matchResult) { return next(); }
                let microCtx = matchResult[1];
                // 根据 webContext 过滤转发路由（从浏览器转发到微应用）
                MWUtil.mwData.getByWebContext(microCtx).then((cfg) => {
                    if (cfg) {
                        // 设置 td 值
                        req.headers['td'] = req.headers['terminal_device'] = cfg.terminalDevice;
                        // 设置 MW_DATA 值
                        Object.defineProperty(req, 'MW_DATA', {
                            value: {
                                cfg: cfg,
                                path: `/${matchResult[2]}`,
                                isNeedLogin: undefined
                            }
                        });
                        return next();
                    }
                    res.status(404);
                    next(new Error(`micro webapp (ctx: ${microCtx}) not found!`));
                });
            }]
        },
        // 1. static
        {
            'method': 'use',
            'path': `${MWUtil.mwConfig.ctx}`,
            'handler': [function microStaticHandler (req, res, next) {
                if (!req.MW_DATA || req.method !== 'GET') { return next(); }
                let statics = req.MW_DATA.cfg.statics;
                let microPath = req.MW_DATA.path;
                if (statics && Array.isArray(statics)) {
                    if (statics.find((path) => microPath.startsWith(path))) {
                        return processPipeToMicroFromBrowser.call(this, req, res, next);
                    }
                }
                next();
            }]
        },
        // 2. other
        {
            'method': 'use',
            'path': `${MWUtil.mwConfig.ctx}`,
            'session': true,
            'passport': (req) => {
                if (!req.MW_DATA) { return false; }
                let cfg = req.MW_DATA.cfg;
                let microPath = req.MW_DATA.path;
                if (!cfg.passport || typeof cfg.passport === 'boolean') {
                    return (req.MW_DATA.isNeedLogin = !!cfg.passport);
                }
                if (typeof cfg.passport === 'object') {
                    let ret;
                    // 优先判断 preInclude
                    if (cfg.passport.preInclude && Array.isArray(cfg.passport.preInclude)) {
                        ret = cfg.passport.preInclude.find((path) => {
                            return microPath.startsWith(path);
                        });
                        if (ret) { return (req.MW_DATA.isNeedLogin = true); }
                    }
                    // 之后判断 preExclude
                    if (cfg.passport.preExclude && Array.isArray(cfg.passport.preExclude)) {
                        ret = cfg.passport.preExclude.find((path) => {
                            return microPath.startsWith(path);
                        });
                        if (ret) { return (req.MW_DATA.isNeedLogin = false); }
                    }
                    // 最后使用 default
                    return (req.MW_DATA.isNeedLogin = cfg.passport.default);
                }
                return (req.MW_DATA.isNeedLogin = undefined);
            },
            'roles': (req) => {
                if (req.MW_DATA && req.MW_DATA.isNeedLogin) {
                    return req.MW_DATA.cfg.roles;
                }
                return undefined;
            },
            'handler': [function microPipeHandler (req, res, next) {
                if (req.MW_DATA) {
                    return processPipeToMicroFromBrowser.call(this, req, res, next);
                }
                next();
            }]
        }
    ]
};
