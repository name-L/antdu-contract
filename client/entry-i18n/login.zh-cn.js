/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */
/**
 * login.zh-cn.js
 *
 * 因为 i18n 是服务端动态生成的，引用不了界面端的 I18nManage, 所以这里临时生成一个基础文件
 * 内容："I18N-Message-Array" 是动态的，在需要 i18n 输出的时候，动态的读取当前这个基础文件加 i18n 的实际内容进行组合
 *
 * Created by wuyaoqian on 2018/11/26.
 */

const entryName = 'index';
const langName = 'zh-cn';

// 注意：entryModuleKey 需要与 webpack.help.js 中 getI18ns 返回的 key 一至
const entryModuleKey = `main:${entryName}`;

try {
    // @params：I18nManage.add(lang, resource, key)
    (require('@component-util/i18n-manage')).add(
        langName, '{{I18N-Message-Array}}', entryModuleKey
    );
} catch (e) {
    console.error(e);
}
