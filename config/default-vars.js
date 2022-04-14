/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 应用的配置文件 -- 可变部分（目前的配置为本地开发阶段）
 * Created by wuyaoqian on 14-4-29.
 */

// ----- 自动 mock -----
// let type = 'auto-dev';
// let type = 'auto-exp';
let type = 'auto-www';

// ----- 没有 mock -----
// let type = 'real-dev';
// let type = 'real-exp';
// let type = 'real-www';

// ----- 强制 mock -----
// let type = 'mock-dev';
// let type = 'mock-exp';
// let type = 'mock-www';

// 优先从环境变量中获取 type 值
type = process.env.type || type;

let typeResult = type.split('-');
let mockType = typeResult[0];
let extend = require('deep-extend');
let config = null;

// 如果是直接执行的打包命令，则直接返回目标配置（打包阶段使用的配置）
if (process.env.TARGET) {
    config = require(`./config-bak/default-vars-${process.env.TARGET}`);
}

// 在 dev、exp、www 的基础上进行扩展
config = config || extend({}, (() => {
    let after = {};
    let extVars = extend({}, require(`./config-bak/default-vars-${typeResult[1]}`));
    let before = extVars.url.micro;
    // 将 extVars.url.micro 中值为 string, array 转换成 object, 方便在本文件中进行局部覆盖
    Object.keys(before).forEach((key) => {
        if (typeof before[key] === 'string') { return (after[key] = { real: before[key] }); }
        if (Array.isArray(before[key])) {
            return (after[key] = {
                real: before[key][0],
                mock: before[key][1],
                mode: before[key][2]
            });
        }
        after[key] = before[key];
    });
    extVars.url.micro = after;
    return extVars;
})(), {
    'url': {
        'base': {
            'mock': 'http://localhost:10086/asimov/v1',
            'mode': mockType
        },
        'micro': {}
    },
    'microWebapp': {
        // 本地调试配置开关
        debug: {
            // 针对 data 数据与 apollo 中数据的合并策略（合并条件为 appKey）
            type: 'merge', // 'merge', 'override'
            // 微应用数据
            data: [
                {
                    'name': '数据标注',
                    'appKey': '34igegdqkn3291hgp8c2hCyUTe4x56WbtK0qcjv0nNk',
                    'appSecret': '0ok7jy7D84o0aAH16LjpuE19',
                    'baseUrl-alt': 'http://127.0.0.1:9092',
                    'baseUrl': 'http://127.0.0.1:9092'
                },
                {
                    'name': '主题',
                    'appKey': '34igegdqkn32haj1qoc3V0tUa3jC5jpcJJ0p2QBEwLr',
                    'appSecret': '2iYzxvgbi573a2g12PXg8KS5',
                    'baseUrl-alt': 'http://127.0.0.1:9212',
                    'baseUrl': 'http://127.0.0.1:9212'
                },
                {
                    'name': '任务',
                    'appKey': '34igegdqkn32ha8pn3s05nygN1e14LyarA0j0HSYWl9',
                    'appSecret': '4ygzmNatC4qb8C704rMbtyad',
                    'baseUrl-alt': 'http://127.0.0.1:9091',
                    'baseUrl': 'http://127.0.0.1:9091'
                },
                {
                    'name': '管理',
                    'appKey': '34igegdqkn326okfbkg43wisefmg4Gw8Yf0xOSZbQ3w',
                    'appSecret': '3v2ZH18Hw5aL9H20zlUjeLX8',
                    'baseUrl-alt': 'http://127.0.0.1:9093',
                    'baseUrl': 'http://127.0.0.1:9093'
                }
            ],
            // 是否使用 baseUrl-alt 作为微应用的 baseUrl ( 一般用于本地启动主应用，然后连接 openshift 中的微应用 )
            useAlternateBaseUrl: true,
            // 是否在请求头中传递用户的详细信息（ 一般用于本地启动主应用，然后连接 openshift 中的微应用 ）
            pipeAllUserInfoInHeader: true,
            // 监听 debug.data 数据的变更 ( 注意：这里是通过直接监听本文件的改变来实现的, 也需要 hot-reload-nodejs.js 配合 )
            watchDataChanges: __filename
        },
        check: {}
    },
    'system': {
        'port': 8080,
        'mockPort': '10086',
        'global': {
            'cdn': '',
            'ctx_path': '',
            'cfg_name': `local-${process.env.USER}`
        },
        'zpkin': {
            'maxTracerCount': 1,
            'zipkinUrl': 'http://172.19.104.103:9002'
        },
        'env': 'development',
        'elapseLogMinTime': 0,
        'sdkRestTimeout': 1000 * 60,
        'staticMaxAge': 0,
        'session': {
            'timeToLive': 5
        }
    }
});

module.exports = config;
