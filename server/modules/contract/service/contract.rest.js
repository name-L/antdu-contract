/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

/**
 * 互动相关基本服务
 * Created by pengle on 21/8/4.
 */
'use strict';

import path from 'path';
import log4js from 'log4js-config';
import RestUtil from 'data-sdk-util/lib/rest-util';
import {
    contract as contractConfig
} from 'config';

const logger = log4js.get(global.log_prefix_name + path.basename(__filename));
const RestHelp = RestUtil.getInstance(logger);

/**
 * 用户数据列表
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const getDataList = function (req, res, params) {
    return RestHelp.userRest.get(contractConfig.getDataListUrl, {
        req: req,
        res: res
    }, params);
};
/**
 * 搜索
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const getSearch = function (req, res, params) {
    return RestHelp.userRest.get(contractConfig.getSearchUrl, {
        req: req,
        res: res
    }, params);
};
/**
 * 搜索列表接口 ,新
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const getSearchList = function (req, res, params) {
    return RestHelp.userRest.get(contractConfig.getSearchListUrl, {
        req: req,
        res: res
    }, params);
};
/**
 * 导出筛选内容
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const getExportScreeningContent = function (req, res, params) {
    return RestHelp.userRest.download(contractConfig.getExportScreeningContentUrl, {
        req: req,
        res: res
    }, params);
};
/**
 * 导入合同内容
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const importContractContent = function (req, res, params) {
    return RestHelp.userRest.upload(contractConfig.importContractContentUrl, {
        req: req,
        res: res
    }, params);
};
/* 图表接口 */
/**
 * 按部门统计
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const getDepartmentStatistics = function (req, res, params) {
    return RestHelp.userRest.get(contractConfig.getDepartmentStatisticsUrl, {
        req: req,
        res: res
    }, params);
};
/**
 * 某个部门甲方统计
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const getDepartmentalData = function (req, res, department, item, pageSize) {
    // let url = contractConfig.getDepartmentalDataUrl.replace('{item}', item);
    // return RestHelp.userRest.get(url, {
    //     req: req,
    //     res: res
    // }, department)
    return RestHelp.userRest.get(contractConfig.getDepartmentalDataUrl).opt({
        req: req,
        res: res
    }).data({
        '{item}': item,
        department,
        pageSize
    }).success(function (eventEmitter, data) {
        eventEmitter.emit('success', data);
    }).error(function (eventEmitter, errorCodeDesc) {
        eventEmitter.emit('error', errorCodeDesc);
    }).send();
};
/**
 * 按地域统计
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const getGeographicalStatistics = function (req, res, params) {
    return RestHelp.userRest.get(contractConfig.getGeographicalStatisticsUrl, {
        req: req,
        res: res
    }, params);
};
/**
 * 按某一个州的甲方乙方统计
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const getAreaData = function (req, res, params) {
    let url = contractConfig.getAreaDataUrl.replace('{item}', params.item);
    return RestHelp.userRest.get(url, {
        req: req,
        res: res
    }, params);
};
/**
 * 导出统计内容
 * @param req
 * @param res
 * @param count
 * @returns {*}
 */
const getExportStatisticsData = function (req, res, params) {
    return RestHelp.userRest.download(contractConfig.getExportStatisticsDataUrl, {
        req: req,
        res: res
    }, params);
};

export default {
    getDataList,
    getSearch,
    getSearchList,
    getExportScreeningContent,
    importContractContent,
    getDepartmentStatistics,
    getDepartmentalData,
    getGeographicalStatistics,
    getAreaData,
    getExportStatisticsData
};
