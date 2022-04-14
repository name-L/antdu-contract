/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * 模块路由汇总 (socket)
 * Created by wuyaoqian on 2016/12/1.
 */

const dir = path.join(__dirname, './modules/');
const routes = [];

fs.readdirSync(dir).forEach(function (moduleName) {
    let routeDir = path.join(dir, moduleName, 'route');
    if (!fs.existsSync(routeDir) || !fs.lstatSync(routeDir).isDirectory()) { return; }
    fs.readdirSync(routeDir).forEach(function (routeFile) {
        // 排除无效的文件
        if (!/\.socket\.js$/.test(routeFile)) { return; }
        // 找到合适的位置插入到路由处理链中
        let route = require(path.join(routeDir, routeFile));
        route = route.__esModule ? route.default : route;
        if (typeof route.position === 'number') {
            let pos = 0;
            for (let i = 0; i < routes.length; i++) {
                if (route.position < routes[i].position) {
                    pos = i;
                    break;
                }
                pos = i + 1;
            }
            // 找到了合适的位置加入
            routes.splice(pos, 0, route);
        } else {
            // 正常加入路由处理链（顺序不重要）
            route.position = Infinity;
            routes.push(route);
        }
    });
});
module.exports = routes;
