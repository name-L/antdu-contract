/**
 * 权限配置
 * Created by wuyaoqian on 14/9/23.
 */

'use strict';

/**
 * 所有可用到的权限列表
 */
const ROLE_CONSTANT = {
    /* ---------------------------- Auth2级别权限 ------------------------------- */

    // 用户是否具有查询境外数据的权限
    'ROLE_QUERYJWDOCUMENT': 'ROLE_QUERYJWDOCUMENT',
    // 在线代理的权限（有改权限后，则我们的境外数据能直接点击翻墙显示，否则显示原始链接）
    'ROLE_ONLINE_PROXY': 'ROLE_ONLINE_PROXY',

    /* ---------------------------- 应用级别权限 ------------------------------- */

    // 应用级别-展示报告订阅模块
    'ROLE_WEB_SHOW_REPORT': 'ROLE_WEB_SHOW_REPORT',
    // 应用级别-主题类别-微信公众号数据权限
    'ROLE_WEB_DATA_WEIXIN': 'ROLE_WEB_DATA_WEIXIN'
};

/**
 * 在本应用内强制开启或禁用的权限列表（一般要 default-var.js 中来动态的配置）
 * true:  强制开启（覆盖用户中的原本权限配置）
 * false: 强制禁用（覆盖用户中的原本权限配置）
 * undefined: 使用用户中的原本权限配置
 */
const ROLE_REDEFINE = {
    // 'ROLE_QUERYJWDOCUMENT': false,
    // 'ROLE_ONLINE_PROXY': false,
    // 'ROLE_WEB_SHOW_REPORT': true,
    // 'ROLE_WEB_DATA_WEIXIN': undefined
};

module.exports = {
    // 所有定义的权限
    ROLE_CONSTANT: ROLE_CONSTANT,
    // 在本应用内强制开启或禁用的权限列表
    ROLE_REDEFINE: ROLE_REDEFINE
};
