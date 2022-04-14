/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

const path = require('path');
const pkg = require('../package.json');

/**
 * 全局变量设置
 * default-global.js
 * Created by wuyaoqian on 2019/4/12.
 */

const DEFAULT_CTX_PATH = '';
const WEBAPP_BASE_NAME = pkg.name.replace(/ +/, '-').toLocaleLowerCase();

/* eslint-disable camelcase */
module.exports = (data) => {
    let cdn = (data.cdn || '').replace(/\/*$/, '');
    let ctx_path = `${data.ctx_path || DEFAULT_CTX_PATH}`;
    let ctx_path_cdn = `${cdn}${ctx_path}`;
    return {
        // 全局只读变量: CDN Origin
        'cdn': cdn,
        // 全局只读变量: 目前使用的是哪一个配置文件
        'cfg_name': data.cfg_name || '-',
        // 全局只读变量: Web访问的上下文路径
        'ctx_path': ctx_path,
        // 全局只读变量: Web访问的上下文路径(CDN)
        'ctx_path_cdn': ctx_path_cdn,
        // 全局只读变量: Web访问的上下文路径 + 静态资源的上下文路径
        'ctx_static_path': data.ctx_static_path || `${ctx_path}/static`,
        // 全局只读变量: Web访问的上下文路径(CDN) + 静态资源的上下文路径
        'ctx_static_path_cdn': data.ctx_static_path_cdn || `${ctx_path_cdn}/static`,
        // 全局只读变量: 相对于静态资源的上下文路径的打包的入口页面存放目录（tpl文件）
        'ctx_tpl_path': data.ctx_tpl_path || `../server/page`,
        // 全局只读变量: 项目根目录
        'app_root_path': data.app_root_path || path.join(__dirname, '../'),
        // 全局只读变量: 模块根目录
        'module_root_path': data.module_root_path || path.join(__dirname, '../server/modules'),
        // 全局只读变量: SessionKey
        'session_key': data.session_key || 'sid',
        // 全局只读变量: SessionSecret
        'session_secret': data.session_secret || `${WEBAPP_BASE_NAME}-secret`,
        // 全局只读变量: log4js日志配置参数：kibana-url
        'log_setting_es_url': data.log_setting_es_url || 'http://log-collector.antducloud.com',
        // 全局只读变量: log4js日志配置参数：kibana-indexName
        'log_setting_es_index_name': data.log_setting_es_index_name || 'vue-demo',
        // 全局只读变量: log4js日志配置参数：kibana-layout-tags
        'log_setting_es_layout_tags': data.log_setting_es_layout_tags || [`${WEBAPP_BASE_NAME}`],
        // 全局只读变量: log4js日志中的 appender 的前缀名
        'log_prefix_name': data.log_prefix_name || `${WEBAPP_BASE_NAME}.`,
        // 全局只读变量: 当前项目名称
        'webapp_name': data.webapp_name || WEBAPP_BASE_NAME
    };
};
