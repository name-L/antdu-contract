<template>
    <div class="selected" v-if="!isShow && inputList.length">
        <div class="selected-content">
            <span>{{$t('main.home.selectedCondition')}}</span>
            <div>
                <el-input
                    v-for="(val, index) in inputList"
                    :key="index"
                    placeholder="请输入内容"
                    v-model="val.value"
                    @change="handleInputChang(index)"
                    clearable>
                </el-input>
            </div>
        </div>
        <!-- <button class="result" @click="exportClick">{{$t('main.home.resultExport')}}</button> -->
    </div>
</template>

<script>
import { appMapState } from '@APP_VUEX';
import moment from 'moment';
// import axios from 'axios';
export default {
    props: {
        selectedObj: {
            type: Object
        }
    },
    data () {
        return {
            input: '',
            inputList: []
        };
    },
    computed: {
        ...appMapState('home', ['isShow'])
    },
    watch: {
        // 监听高级筛选检索输入框变化
        selectedObj: {
            deep: true,
            handler () {
                let selectList = [];
                for (const key in this.selectedObj) {
                    if (Object.hasOwnProperty.call(this.selectedObj, key) && this.selectedObj[key] !== '') {
                        if (key !== 'signEndTime' && key !== 'signStartTime' && key !== 'content') {
                            selectList.push({ value: this.handleSearchData(key, this.selectedObj[key]), key });
                        }
                    }
                }
                let time1 = this.selectedObj.signStartTime !== ''
                    ? moment(this.selectedObj.signStartTime).format('YYYY-MM-DD') : '--';
                let time2 = this.selectedObj.signEndTime !== ''
                    ? moment(this.selectedObj.signEndTime).format('YYYY-MM-DD') : '--';
                if (this.selectedObj.signEndTime !== '' || this.selectedObj.signStartTime !== '') {
                    let value = `时间:${time1} 至 ${time2}`;
                    selectList.push({ value: value, key: 'time' });
                }
                this.inputList = selectList;
            }
        }
    },
    mounted () {
        // this.input = this.selectedObj;
    },
    methods: {
        // 数据导出
        // exportClick () {
        //     this.$emit('exportClick');
        //     axios({
        //         method: 'GET',
        //         url: `/contract/export-screening-content`,
        //         responseType: 'blob',
        //         params: {
        //             content: this.selectedObj.content,
        //             department: this.selectedObj.department,
        //             partyA: this.selectedObj.partyA,
        //             partyAState: this.selectedObj.partyAState,
        //             partyB: this.selectedObj.partyB,
        //             partyBState: this.selectedObj.partyBState,
        //             signEndTime: this.selectedObj.signEndTime,
        //             signStartTime: this.selectedObj.signStartTime,
        //             subcontractor: this.selectedObj.subcontractor,
        //             type: 'excel'
        //         }
        //     }).then(res => {
        //         if (res.data.size > 60) {
        //             this.$message({
        //                 message: this.$t('main.home.exportSuccess'),
        //                 type: 'success'
        //             });
        //             let blob = new Blob([res.data], { type: 'application/vnd.ms-excel' });
        //             const fileName = moment().format('YYYY-MM-DD') + '-' + moment().format('YYYY-MM-DD');
        //             if ('download' in document.createElement('a')) {
        //                 // 非IE下载
        //                 const linkNode = document.createElement('a');
        //                 linkNode.download = fileName; // a标签的download属性规定下载文件的名称
        //                 linkNode.style.display = 'none';
        //                 linkNode.href = URL.createObjectURL(blob); // 生成一个Blob URL
        //                 document.body.appendChild(linkNode);
        //                 linkNode.click(); // 模拟在按钮上的一次鼠标单击
        //                 URL.revokeObjectURL(linkNode.href); // 释放URL 对象
        //                 document.body.removeChild(linkNode);
        //             } else {
        //                 // IE10+下载
        //                 navigator.msSaveBlob(blob, fileName);
        //             }
        //         } else {
        //             this.$message.error(res.data.msg || this.$t('main.home.serverException'));
        //         }
        //     });
        // },
        handleSearchData (key, data) {
            let value = '';
            switch (key) {
            case 'department':
                value = this.$t('main.home.department') + ':' + data;
                break;
            case 'partyA':
                value = this.$t('main.home.partyA') + ':' + data;
                break;
            case 'partyAState':
                value = this.$t('main.home.partyAArea') + ':' + data;
                break;
            case 'partyB':
                value = this.$t('main.home.partyB') + ':' + data;
                break;
            case 'partyBState':
                value = this.$t('main.home.partyBArea') + ':' + data;
                break;
            case 'subcontractor':
                value = '二级承包商:' + data;
                break;
            default:
                break;
            }
            return value;
        },
        handleInputChang (index) {
            this.$emit('deleteTag', this.inputList[index].key);
            this.inputList.splice(index, 1);
        }
    }
};
</script>

<style lang="less" scoped>
.selected {
    width: 100%;
    min-height: 58px;
    background: #eef0f8;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 40px;
    .selected-content{
        display: flex;
        align-items: center;
        // flex-wrap: wrap;
        align-content: center;
        span{
            margin-right: 27px;
            color: #818496;
            min-width: 60px;
        }
        .el-input{
            width: 237px;
        }
    }
    .result{
        width: 95px;
        height: 38px;
        background: #5b83d7;
        border: none;
        border-radius: 5px;
        color: #fff;
        cursor: pointer;
    }
}
</style>