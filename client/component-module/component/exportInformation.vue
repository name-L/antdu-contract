<template>
    <div class="export-information" v-if="exportInformation">
        <span>是否导出全部合同数据?</span>
        <button @click="setExportInformation(false)">取消</button>
        <button @click="exportAllData">导出</button>
    </div>
</template>

<script>
import { appMapState, appMapMutations } from '@APP_VUEX';
// import axios from 'axios';
export default {
    data () {
        return {

        };
    },
    computed: {
        ...appMapState('home', ['exportInformation'])
    },
    methods: {
        ...appMapMutations('home', ['setExportInformation']),
        exportAllData () {
            this.$message({
                message: '暂不支持导出全部数据',
                type: 'warning'
            });
            // axios({
            //     method: 'GET',
            //     url: `/contract/export-screening-content`,
            //     responseType: 'blob'

            // }).then(res => {
            //     if (res.data.size > 60) {
            //         this.$message({
            //             message: '导出成功',
            //             type: 'success'
            //         });
            //         let blob = new Blob([res.data], { type: 'application/vnd.ms-excel' });
            //         const fileName = '全部合同数据';
            //         if ('download' in document.createElement('a')) {
            //             // 非IE下载
            //             const linkNode = document.createElement('a');
            //             linkNode.download = fileName; // a标签的download属性规定下载文件的名称
            //             linkNode.style.display = 'none';
            //             linkNode.href = URL.createObjectURL(blob); // 生成一个Blob URL
            //             document.body.appendChild(linkNode);
            //             linkNode.click(); // 模拟在按钮上的一次鼠标单击
            //             URL.revokeObjectURL(linkNode.href); // 释放URL 对象
            //             document.body.removeChild(linkNode);
            //         } else {
            //             // IE10+下载
            //             navigator.msSaveBlob(blob, fileName);
            //         }
            //     } else {
            //         this.$message.error(res.data.msg || '服务器异常');
            //     }
            // });
        }
    }
};
</script>

<style lang="less" scoped>
    .export-information{
        width: 100%;
        height: 60px;
        color: #fff;
        z-index: 999;
        position: absolute;
        left: 0;
        right: 0;
        background: #5b83d7;
        opacity: .9;
        display: flex;
        font-size: 16px;
        align-items: center;
        padding-left: 162px;
        span{
            margin-right: 32px;
        }
        button{
            width: 80px;
            height: 32px;
            color: #5b83d7;
            background: #e7edf8;
            border: none;
            margin-right: 10px;
            border-radius: 4px;
            cursor: pointer;
        }
    }
</style>