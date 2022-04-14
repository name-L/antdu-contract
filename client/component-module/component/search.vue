<template>
    <div class="block" :class="{'collapse':isShow}">
        <div class="content-retrieve">
            <span class="title">{{$t('main.home.contentSearch')}} </span>
            <input-search
                :width="content.width"
                :model="content.model"
                @handleInputChange="handleInputChange"
                ref="inputSearch"
                :icon="content.icon">
            </input-search>
            <span class="fold" @click="setFold(!isShow)">
                <!-- <i :class="isShow?'el-icon-arrow-up':'el-icon-arrow-down'"></i> -->
                <i class="el-icon-arrow-up" :class="{'is-active':!isShow}"></i>
                高级选项
            </span>
            <span class="export" @click="exportClick">结果导出</span>
        </div>
        <div class="content-retrieve">
            <span class="title">{{$t('main.home.classificationSearch')}} </span>
            <input-search
                v-for="data in contentRetrieveList"
                :key="data.title"
                ref="inputSearch"
                :model="dataObj[data.key]"
                @handleInputChange="handleInputChange"
                :title="data.title">
            </input-search>
        </div>
        <div class="content-retrieve">
            <span class="title">{{$t('main.home.timeSearch')}} </span>
            <input-search
                v-for="data in timeRetrieve"
                :key="data.title"
                :model="dataObj[data.key]"
                ref="inputSearch"
                @handleInputChange="handleInputChange"
                :time="true"
                :icon="data.icon"
                :title="data.title">
            </input-search>
        </div>
        <div class="content-retrieve">
            <span class="title">{{$t('main.home.companySearch')}} </span>
            <input-search
                v-for="data in companyRetrieve"
                :key="data.title"
                :model="dataObj[data.key]"
                ref="inputSearch"
                @handleInputChange="handleInputChange"
                :title="data.title">
            </input-search>
        </div>
        <div class="filter-and-reset">
            <button class="filter" @click="filterClick">{{$t('main.home.filter')}}</button>
            <button class="reset" @click="resetValue">{{$t('main.home.reset')}}</button>
        </div>
    </div>
</template>
<script>
import inputSearch from './input-search.vue';
import { appMapState, appMapMutations } from '@APP_VUEX';
import axios from 'axios';
import moment from 'moment';
// const delay = (function () {
//     let timer = 0;
//     return function (callback, ms) {
//         clearTimeout(timer);
//         timer = setTimeout(callback, ms);
//     };
// })();
export default {
    props: {
        deleteSearchType: {
            type: String
        },
        selectedObj: {
            type: Object
        }
    },
    data () {
        return {
            // 分类检索
            contentRetrieveList: [
                {
                    title: this.$t('main.home.department'),
                    key: 'department'
                },
                {
                    title: this.$t('main.home.partyAArea'),
                    key: 'partyAState'
                },
                {
                    title: this.$t('main.home.partyBArea'),
                    key: 'partyBState'
                }
            ],
            // 内容检索
            content: {
                model: '',
                icon: 'el-icon-search',
                width: 854
            },
            // 时间检索
            timeRetrieve: [
                {
                    title: this.$t('main.home.startingTime'),
                    icon: 'el-icon-date',
                    key: 'signStartTime'
                },
                {
                    title: this.$t('main.home.endTime'),
                    icon: 'el-icon-date',
                    key: 'signEndTime'
                }
            ],
            // 公司检索
            companyRetrieve: [
                {
                    title: this.$t('main.home.partyA'),
                    key: 'partyA'
                },
                {
                    title: this.$t('main.home.partyB'),
                    key: 'partyB'
                }
                // {
                //     title: '二级承包商',
                //     key: 'subcontractor'
                // }
            ],
            // 控制折叠
            // isShow: true,
            dataObj: {
                // 内容
                content: '',
                // 部门
                department: '',
                // 甲方地域
                partyAState: '',
                // 乙方地域
                partyBState: '',
                // 开始时间
                signStartTime: '',
                // 结束时间
                signEndTime: '',
                // 甲方
                partyA: '',
                // 乙方
                partyB: '',
                // 二级承包商
                subcontractor: ''
            },

            startTime: '',
            timeShow: false
        };
    },
    components: {
        inputSearch
    },
    computed: {
        ...appMapState('home', ['isShow'])
    },
    watch: {
        // 监听已选条件删除类型
        deleteSearchType () {
            if (this.deleteSearchType === 'time') {
                this.dataObj.signStartTime = '';
                this.dataObj.signEndTime = '';
            } else {
                this.dataObj[this.deleteSearchType] = '';
            }
        }
    },
    methods: {
        ...appMapMutations('home', ['setFold']),
        // 筛选
        filterClick (type) {
            // this.isShow = !this.isShow;
            // this.setFold(!this.isShow);
            // if (type !== 'fold') {
            this.$emit('filterClick', this.dataObj);
            // }
        },
        // 重置筛选条件
        resetValue () {
            this.$refs.inputSearch.forEach(element => {
                element.value = '';
            });
            for (const key in this.dataObj) {
                if (Object.hasOwnProperty.call(this.dataObj, key)) {
                    this.dataObj[key] = '';
                }
            }
            this.$emit('filterClick', this.dataObj);
        },
        // 失去焦点
        handleInputChange (obj) {
            switch (obj.type) {
            case '':
                this.dataObj.content = obj.val;
                this.$emit('filterClick', this.dataObj);
                break;
            case this.$t('main.home.department'):
                this.dataObj.department = obj.val;
                break;
            case this.$t('main.home.partyAArea'):
                this.dataObj.partyAState = obj.val;
                break;
            case this.$t('main.home.partyBArea'):
                this.dataObj.partyBState = obj.val;
                break;
            case this.$t('main.home.startingTime'):
                this.startTime = new Date(new Date(obj.val).toLocaleDateString()).getTime();
                if (isNaN(this.startTime)) {
                    this.startTime = '';
                }
                this.dataObj.signStartTime = this.startTime;
                break;
            case this.$t('main.home.endTime'):
                let endTime = new Date(obj.val).getTime();
                if (isNaN(endTime)) {
                    endTime = '';
                }
                if (this.startTime > endTime) {
                    this.$message.error(this.$t('main.home.startDateCannotBeGreaterThanTheEndDate'));
                } else {
                    this.dataObj.signEndTime = endTime;
                }
                break;
            case this.$t('main.home.partyA'):
                this.dataObj.partyA = obj.val;
                break;
            case this.$t('main.home.partyB'):
                this.dataObj.partyB = obj.val;
                break;
            case this.$t('main.home.subcontractor'):
                this.dataObj.subcontractor = obj.val;
                break;
            default:
                break;
            }
        },
        // 结果导出
        exportClick () {
            let obj = JSON.stringify(this.selectedObj) === '{}';
            if (obj) {
                this.$message('请输入搜索内容之后导出');
                return;
            }
            if (this.timeShow) {
                this.$message({
                    message: '请勿在上次结果导出之前重复点击!',
                    type: 'warning'
                });
            } else {
                // delay(() => {
                this.timeShow = true;
                axios({
                    method: 'GET',
                    url: `/contract/export-screening-content`,
                    responseType: 'blob',
                    params: {
                        content: this.selectedObj.content,
                        department: this.selectedObj.department,
                        partyA: this.selectedObj.partyA,
                        partyAState: this.selectedObj.partyAState,
                        partyB: this.selectedObj.partyB,
                        partyBState: this.selectedObj.partyBState,
                        signEndTime: this.selectedObj.signEndTime,
                        signStartTime: this.selectedObj.signStartTime,
                        subcontractor: this.selectedObj.subcontractor,
                        type: 'excel'
                    }
                }).then(res => {
                    this.timeShow = false;
                    if (res.data.size > 60) {
                        this.$message({
                            message: this.$t('main.home.exportSuccess'),
                            type: 'success'
                        });
                        let blob = new Blob([res.data], { type: 'application/vnd.ms-excel' });
                        const fileName = moment().format('YYYY-MM-DD') + '-' + moment().format('YYYY-MM-DD');
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
                        this.$message.error(res.data.msg || this.$t('main.home.serverException'));
                    }
                });
                // }, 1000);
            }
        }
    }
};
</script>
<style lang="scss" scoped src="./search.less">
    // @import './search.scss';
</style>
