/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 开发阶段服务器的部署情况配置
 * Created by wuyaoqian on 2016/11/17.
 */

import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './webpack.config.dev.js';
import entryRoutes from '../server/route.http.js';

export default function (app) {
    const compiler = webpack(config);
    const publicPath = `${global.ctx_static_path}/`;
    compiler.hooks.compile.tap('compilation', () => {
        console.info('starting webpack compile...');
    });

    const devMiddleware = webpackDevMiddleware(compiler, {
        publicPath: publicPath,
        stats: {
            colors: true,
            chunks: false
        }
    });

    const hotMiddleware = webpackHotMiddleware(compiler, {
        path: `${global.ctx_path}/__webpack_hmr`
    });

    const readFileSync = function (filename) {
        return devMiddleware.fileSystem.readFileSync(
            path.join(devMiddleware.getFilenameFromUrl(publicPath), `${global.ctx_tpl_path}`, filename), 'utf8'
        );
    };

    // 各 entry 页的拦截处理 (前置处理)
    entryRoutes.forEach((entry) => {
        entry = entry.__esModule ? entry.default : entry;
        entry.routes.forEach((route) => {
            if (!route.filename) { return; }
            app[route.method](route.path, function devExistRenderContentHandler (req, res, next) {
                // 加载文件内容
                if (Array.isArray(route.filename)) {
                    res._existRenderContent_ = {};
                    route.filename.forEach((filename) => {
                        res._existRenderContent_[filename] = readFileSync(filename);
                    });
                } else if (typeof route.filename === 'string') {
                    res._existRenderContent_ = readFileSync(route.filename);
                } else {
                    res._existRenderContent_ = {};
                    Object.values(route.filename).forEach((filename) => {
                        res._existRenderContent_[filename] = readFileSync(filename);
                    });
                }
                // 设置 req.method 成 temp， 使得 devMiddleware 不再拦截
                req._preMethod_ = req.method;
                req.method = 'temp';
                next();
            });
        });
    });

    // js 静态文件的特殊处理（处理开发阶段的 sourceMap 的相关路径问题）
    app.use(function devStaticFileFilterHandler (req, res, next) {
        if (req.method !== 'GET') { return next(); }
        let ret = /\.(js)(\.(map))(\?|$)/.exec(req.url);
        if (!ret) { return next(); }
        let filename = devMiddleware.getFilenameFromUrl(req.url);
        if (filename && devMiddleware.fileSystem.statSync(filename).isFile()) {
            let content = devMiddleware.fileSystem.readFileSync(filename, 'utf8');
            content = content.replace(/("sources"):(\[.+]),/g, (match, $1, $2) => {
                return `${$1}:${$2.replace(/((webpack:\/+)(\.\/)?)/g, `$2${global.webapp_name} : root/`)},`;
            });
            res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
            res.setHeader('Content-Length', content.length);
            res.status(200);
            res.send(content);
        } else {
            next();
        }
    });

    // 注册中间件
    app.use(devMiddleware);
    app.use(hotMiddleware);

    // 各 entry 页的拦截处理 (后置处理)
    app.use(function devTempMethodReverseHandler (req, res, next) {
        if (req.method === 'temp') {
            // 还原 req.method
            req.method = req._preMethod_;
            delete req._preMethod_;
        }
        next();
    });

    // 将 devMiddleware 的相关属性放在 app.devOpt 上（方便开发过程中的使用）
    app.devOpt = {
        fileSystem: devMiddleware.fileSystem,
        publicPath: devMiddleware.getFilenameFromUrl(publicPath)
    };

    return new Promise((resolve) => {
        process.nextTick(() => {
            compiler.hooks.done.tap('compile-done', resolve);
        });
    });
};
