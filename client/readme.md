# 目录结构说明：

1. asset
   * font
     > 字体
   * img
     > 图片
   * theme
     > 皮肤（<code>js</code>、<code>css</code>）
   * lang
     > 样式的国际化内容（<code>less</code>）<br>
       注意：内容文字的国际化文件（<code>js</code> | <code>json</code>）还是放在统一的目录（config/local-lang/）, 方便统一管理（或者以后会抽取到一个第三方的项目中）
   * less
     > 样式
   * util
     > 其它工具类js

1. component-base
   > 基础组件，如：Button、Label 等可在多处大量使用的

1. component-widget
   > 工具组件：一般是由多个基础组件组合而成并有可能是有一定的业务逻辑，或只在部分地方使用的
   
1. component-module
   > 模块组件：一般是入口页等大型模块
   + service（内部一般定义一些本模块对外暴露的内容）
     - window.mw.js（暴露在 window.mw 变量上的资源 -- 给微应用使用的）
   
1. entry-i18n (国际化入口管理)
   * i18n-base.js
     > 国际化的基础模板（具体用途在文件内有注解）
     
1. entry-theme (皮肤入口管理)
   * theme-*.*.js
     > 不同的适配器及皮肤，将有不同的入口
     
1. entry-page
   > 页面入口
   > **注意：** 请在 server/modules/entry/route/index.route.http.js 中进行相应的配置（filename）
   ```
   index.js => /
   login.js => /login
   xxxxx.js => /xxxxx
   ```
   