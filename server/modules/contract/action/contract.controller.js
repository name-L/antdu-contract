/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 管理相关 controller
 * Created by pengle on 21/8/4.
 */

import InteractiveService from '../service/contract.rest';

// 用户数据列表
const getDataList = function (req, res) {
    let params = {
        startTime: req.query['startTime'],
        endTime: req.query['endTime'],
        keywords: req.query['keywords'],
        page: req.query['page'],
        pageSize: req.query['pageSize'] || 20
    };
    InteractiveService.getDataList(req, res, params);
};
// 搜索数据列表
const getSearch = function (req, res) {
    let params = {
        startTime: req.query['startTime'],
        endTime: req.query['endTime'],
        partyA: req.query['partyA'],
        partyB: req.query['partyB'],
        keywords: req.query['keywords'],
        page: req.query['page']
    };
    InteractiveService.getSearch(req, res, params);
};
// 搜索数据列表
const getSearchList = function (req, res) {
    let params = {
        content: req.query['content'],
        department: req.query['department'],
        partyA: req.query['partyA'],
        partyAState: req.query['partyAState'],
        partyB: req.query['partyB'],
        partyBState: req.query['partyBState'],
        pageSize: req.query['pageSize'] || 20,
        signEndTime: req.query['signEndTime'],
        signStartTime: req.query['signStartTime'],
        subcontractor: req.query['subcontractor'],
        page: req.query['page']
    };
    InteractiveService.getSearchList(req, res, params);
};
// 导出筛选内容
const getExportScreeningContent = function (req, res) {
    let params = {
        content: req.query.content,
        department: req.query.department,
        partyA: req.query.partyA,
        partyAState: req.query.partyAState,
        partyB: req.query.partyB,
        partyBState: req.query.partyBState,
        signEndTime: req.query.signEndTime,
        signStartTime: req.query.signStartTime,
        subcontractor: req.query.subcontractor,
        type: req.query.type || 'excel'
    };
    InteractiveService.getExportScreeningContent(req, res, params);
};
// 导入合同内容
const importContractContent = function (req, res) {
    let params = {
        file: req.body.file
    };
    InteractiveService.importContractContent(req, res, params);
};
// 按部门统计
const getDepartmentStatistics = function (req, res) {
    let params = {
        page: req.query.page,
        pageSize: req.query.pageSize || 20
    };
    InteractiveService.getDepartmentStatistics(req, res, params);
};
// 某一个部门甲乙方统计
const getDepartmentalData = function (req, res) {
    let department = req.query.department;
    let item = req.query.item;
    let pageSize = req.query.pageSize || 10;
    InteractiveService.getDepartmentalData(req, res, department, item, pageSize);
};
// 按地域统计
const getGeographicalStatistics = function (req, res) {
    let params = {
        page: req.query.page,
        pageSize: req.query.pageSize || 20
    };
    InteractiveService.getGeographicalStatistics(req, res, params);
};
// `按某一个州的甲方乙方统计
const getAreaData = function (req, res) {
    let params = {
        state: req.query.state,
        item: req.query.item,
        pageSize: req.query.pageSize || 10
    };
    InteractiveService.getAreaData(req, res, params);
};
// 导出统计内容
const getExportStatisticsData = function (req, res) {
    let params = {
        item: req.query.item,
        type: req.query.type,
        typeParam: req.query.typeParam
    };
    InteractiveService.getExportStatisticsData(req, res, params);
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
