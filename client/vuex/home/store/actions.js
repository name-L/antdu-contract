
// import * as types from './mutation-types';
import axios from 'axios';

export const getExportStatisticsData = function (store, params) {
    axios({
        method: 'GET',
        url: `/contract/export-statistics-data`,
        responseType: 'blob',
        params: {
            type: params.type,
            item: params.item,
            typeParam: params.typeParam
        }
    }).then(res => {
        if (res.data.size > 60) {
            params._this.$message({
                message: '导出成功',
                type: 'success'
            });
            let blob = new Blob([res.data], { type: 'application/vnd.ms-excel' });
            const fileName = params.name;
            if ('download' in document.createElement('a')) {
                // 非IE下载
                const linkNode = document.createElement('a');
                linkNode.download = fileName; // a标签的download属性规定下载文件的名称
                linkNode.style.display = 'none';
                linkNode.href = URL.createObjectURL(blob); // 生成一个Blob URL
                document.body.appendChild(linkNode);
                linkNode.click(); // 模拟在按钮上的一次鼠标单击
                URL.revokeObjectURL(linkNode.href); // 释放URL 对象
                document.body.removeChild(linkNode);
            } else {
                // IE10+下载
                navigator.msSaveBlob(blob, fileName);
            }
        } else {
            params._this.$message.error(res.data.msg || '服务器异常');
        }
    });
};
