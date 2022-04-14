# 主应用开发指南

## Structure

+ build（打包配置目录）
  + dev-temp-server.js（开发阶段处理入口页的临时服务拦截）
  + hot-reload-nodejs.js（开发阶段处理node端的热加载）
  + postcss.config.js（postcss配置文件）
  + webpack.config.assemble.js（打包时相关输出的配置组合）- **【业务相关的一般只需修改这里就可以了】**
  + webpack.config.base.js（打包时的基础配置）
  + webpack.config.dev.js（开发阶段的打包配置）
  + webpack.config.prod.js（部署阶段的打包配置）
  + webpack.help.js（打包时的帮助类）
  
+ client（前端静态目录，详细参考 client/readme.md ）

+ config（业务配置目录）
  + config-bak（针对具体部署环境的一些特殊配置，如：exp,www 等）
  + local-lang（存放国际化资源文件 -- 注意：ErrorCode 也配置在这里）
  + app-logging.js（日志配置）
  + default.js（应用配置-基础部分）
  + default-vars.js（应用配置-可变部分）
  + default-roles.js（应用配置-权限相关，这个文件会被 default.js 引入）

+ server（后台服务目录）
  + handler（全局拦截的相关代码）
    + controller.js
    + controller.socket.js
    + controller-mw.http.filter.js
    + controller-mw.socket.filter.js
    + controller-passport.js
    + controller-passport.socket.js
    + controller-roles.js
    + controller-session-checker.js
    + sdk-global-handler.js

  + mock（Mock服务器相关配置）
    + mock-data
    + mock-server

  + modules（业务模块）
    + (任意模块名称)
      + action
      + dto
      + route
      + service
      + tpl
      + util

  + util（全局工具类）
  + app.base.js（服务端启动入口：基础部分）
  + global.name.js（服务端的一些全局常量定义）
  + route.http.js（http路由定义）
  + route.socket.js（websocket路由定义）
  
+ app.dev.js（服务端启动入口：开发阶段）
+ app.mock.js（服务端启动入口：开发阶段的Mock服务）
+ app.prod.js（服务端启动入口：部署阶段）

+ dist（打包的目标目录）

## Build Setup

**注意：因 win 下编译 c++ 代码，有点麻烦，所以这里对 tpc-check 的依赖做了一个可选的方案，在 package.json 中删掉 tcp-check 后，程序也可正常执行。**

> Requires Node.js 7+

``` bash
# install dependencies
npm install

# serve in dev mode, with hot reload at localhost:8080
npm run start-dev

# build for production
npm run build-exp
npm run build-www

# serve in production mode
npm run start-prod

# analysis-json
1. npm run analysis-json
2. 将生成的 webpack-stats.json 导入到如下地址，可分析结果
   http://webpack.github.io/analyse
   https://alexkuz.github.io/webpack-chart
   http://chrisbateman.github.io/webpack-visualizer

# analysis-bundle
npm run analysis-bundle
```
