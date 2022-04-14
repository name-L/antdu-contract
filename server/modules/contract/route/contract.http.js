import actionModule from '../action/contract.controller';

export default {
    module: actionModule,
    routes: [
        {
            // 用户数据列表
            'method': 'get',
            'path': `${global.ctx_path}/contract/list`,
            'extract': true,
            // 'consume': true,
            'session': true,
            'handler': 'getDataList'
        },
        {
            // 用户数据列表
            'method': 'get',
            'path': `${global.ctx_path}/contract/search`,
            'extract': true,
            // 'consume': true,
            'session': true,
            'handler': 'getSearch'
        },
        {
            // 用户数据列表
            'method': 'get',
            'path': `${global.ctx_path}/contract/search-list`,
            'extract': true,
            // 'consume': true,
            'session': true,
            'handler': 'getSearchList'
        },
        {
            // 导出筛选内容
            'method': 'get',
            'path': `${global.ctx_path}/contract/export-screening-content`,
            'extract': true,
            'consume': true,
            'session': true,
            'handler': 'getExportScreeningContent'
        },
        {
            // 导入合同内容
            'method': 'post',
            'path': `${global.ctx_path}/contract/import-contract-content`,
            'extract': true,
            'consume': true,
            'session': true,
            'handler': 'importContractContent'
        },
        {
            // 按部门统计
            'method': 'get',
            'path': `${global.ctx_path}/contract/department-statistics`,
            'extract': true,
            'session': true,
            'handler': 'getDepartmentStatistics'
        },
        {
            // 某个部门甲方统计
            'method': 'get',
            'path': `${global.ctx_path}/contract/department-data`,
            'extract': true,
            'session': true,
            'handler': 'getDepartmentalData'
        },
        {
            // 按地域统计
            'method': 'get',
            'path': `${global.ctx_path}/contract/area-statistics`,
            'extract': true,
            'session': true,
            'handler': 'getGeographicalStatistics'
        },
        {
            // 按某一个州的甲方乙方统计
            'method': 'get',
            'path': `${global.ctx_path}/contract/area-data`,
            'extract': true,
            'session': true,
            'handler': 'getAreaData'
        },
        {
            // 导出统计内容
            'method': 'get',
            'path': `${global.ctx_path}/contract/export-statistics-data`,
            'extract': true,
            'session': true,
            'handler': 'getExportStatisticsData'
        }
    ]
};
