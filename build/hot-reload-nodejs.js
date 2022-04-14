/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * hot-reload-nodejs.js
 * Created by wuyaoqian on 2018/10/23.
 */

const _ = require('lodash');
const Module = require('module');
const shimmer = require('shimmer');
const glob = require('glob');
const chokidar = require('chokidar');
const path = require('path');

const generateProxyObj = (fromObj, fromNames, filename) => {
    return new Proxy(fromObj, {
        get: function (target, key, receiver) {
            try {
                let cache = require.cache[filename];
                if (cache) {
                    fromNames.forEach((name) => { cache = cache[name]; });
                    return cache[key];
                } else {
                    return Reflect.get(target, key, receiver);
                }
            } catch (e) {
                console.error('hot-reload get %s from %s error:\n', key, filename, e);
                throw e;
            }
        }
    });
};

// shimmer Module.prototype._compile, set exports with Proxy
const compileWrap = function (files) {
    shimmer.wrap(Module.prototype, '_compile', function (__compile) {
        return function (content, filename) {
            const result = __compile.call(this, content, filename);
            this._exports_ = this.exports;
            if (!this._exports_ || typeof this._exports_ !== 'object') { return result; }
            if (!files.includes(filename)) { return result; }
            try {
                if (this._exports_.__esModule && this._exports_.default) {
                    this._exports_._default_ = this._exports_.default;
                    this._exports_.default = generateProxyObj(
                        this._exports_.default, ['_exports_', '_default_'], filename
                    );
                }
                this.exports = generateProxyObj(this._exports_, ['_exports_'], filename);
            } catch (e) {
                console.error('hot-reload proxy wrap error (%s) :\n', filename, e);
                throw e;
            }
            return result;
        };
    });
};

const hotReloadWatch = function (opt) {
    let files = [];
    (opt.includes || []).forEach((p) => {
        files = _.uniq(files.concat(glob.sync(p, opt.glob)));
    });
    (opt.excludes || []).forEach((p) => {
        files = _.difference(files, glob.sync(p, opt.glob));
    });
    if (files && files.length && !files[0].startsWith(path.join(__dirname, '../'))) {
        files = files.map((f) => path.join(__dirname, '../', f));
    }
    let watcher = chokidar.watch(files, { usePolling: true });
    watcher.on('ready', function () {
        watcher.on('change', function (filename) {
            let _filename_ = filename;
            let _module_ = require.cache[_filename_];
            let _exports_ = _module_ && _module_.exports;
            if (!_module_ || !_exports_ || typeof _exports_ !== 'object') { return; }
            while (_module_ && _filename_ && files.includes(_filename_) && !opt.stop.test(_filename_)) {
                require.cache[_filename_] && delete require.cache[_filename_];
                console.info('reload module: ', _filename_);
                _module_ = _module_.parent;
                if (_module_) {
                    _module_.require(_filename_);
                    _filename_ = _module_.filename;
                }
            }
        });
    });
    compileWrap(files);
};

// 注意：目前还是一个实验性质热加载，如遇到一些莫名其妙的问题，需另行分析
// 注意：只能使用于开发阶段
// 注意：(module.exports = ...) 这种形式的会生效 (export default '...') 这种形式的生效情况还需要具体测试
// 以下几种行为的更改，已测试有效（2018-10-24）：
// 1. 修改 app-logging.js 可让日志按新的修改格式进行输出
// 2. 修改 config/lang/{module}/*.js 重新请求国际化内容，可按修改后的结果输出
// 3. 修改 server/modules/{module}/action/*.js 中的方法内容，部分可实时生效
hotReloadWatch({
    glob: {
        nodir: true,
        absolute: true,
        cwd: path.join(__dirname, '../')
    },
    stop: /app\.dev\.js$/,
    includes: [
        '@(config|server)/**/*.js',
        'node_modules/@(data-sdk-*|config|log4js*)/**/*.js'
    ],
    excludes: [
        'server/mock/**',
        'app.dev.js'
    ]
});
