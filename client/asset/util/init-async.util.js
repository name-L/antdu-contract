/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * init-async.util.js
 * Created by wuyaoqian on 2019/6/13.
 */

const asyncLoad = require('@component-util/async-load-js');

const initAsync = function () {
    // "AsyncScriptList" 异步资源列表（需要在 entry 页中，运行时替换）
    if (Array.isArray(window.Util.AsyncScriptList)) {
        window.Util.AsyncScriptList.forEach((url) => asyncLoad(url));
        delete window.Util.AsyncScriptList;
    }
};

// 其它 js 都执行完后，才执行异步资源的下载任务
setTimeout(initAsync, 0);
