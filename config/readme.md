# A. 配置目录使用说明：

  // 部署到 exp、www 或其它位置中用来替换开发阶段中的 app-logging.js, default-vars.js 文件的配置
+ config-bak

  // 存放 errorCode 的国际化转译配置
+ error-code

  // 存放 应用前后端 的国际化语言配置
+ local-lang

  // 开发阶段使用的 日志配置文件
- app-logging.js

  // 开发及部署阶段共用的 配置文件 -- 基础部分
- default.js

  // 开发阶段使用的 配置文件 -- 可变部分
- default-vars.js

  // readme.md
- readme.md

# B. 其它事项
从 vue-demo 中复制并新建项目时，有以下几个地方需要手动的改一下的：

1. package.json 中的 name, title 字段
2. server/global.name.js 中的 log_prefix_name 属性