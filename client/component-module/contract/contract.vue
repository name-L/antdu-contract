<template>
    <div class="contract-index">
        <exportInformation></exportInformation>
        <search
            :deleteSearchType="deleteSearchType"
            :selectedObj="obj"
            @filterClick="filterClick">
        </search>
        <selected
            :selectedObj="obj"
            @deleteTag="deleteTag"
            >
        </selected>
        <Table
            :dataList="dataList"
            :regularLoading="regularLoading"
            :isBottomComplete="isBottomComplete"
            :loading="loading"
            :selectedObj="obj"
            :errorMsg="errorMsg">
        </Table>
    </div>
</template>

<script>
import Table from '../component/table.vue';
import search from '../component/search.vue';
import selected from '../component/selected.vue';
import exportInformation from '../component/exportInformation.vue';
import axios from 'axios';
export default {
    data () {
        return {
            dataList: [],
            // 加载中
            regularLoading: false,
            isBottomComplete: false, // 是否到底
            // 用于已知到底 再滚动到底不会加载 不会出现加载中
            preventLoading: false,
            // error
            errorMsg: '',
            // 页码
            current: 1,
            loading: false,
            obj: {},
            deleteSearchType: ''
        };
    },
    components: {
        Table,
        search,
        selected,
        exportInformation
    },
    mounted () {
        this.getSearchList({});
        window.addEventListener('scroll', this.onscroll, true);
    },
    methods: {
        // 搜索数据列表
        getSearchList (obj, page = 1, loading = true) {
            this.loading = loading;
            if (page === 1) {
                this.current = 1;
                this.dataList = [];
            }
            // 重新选择时间 让加载跟到底隐藏
            this.regularLoading = false;
            this.isBottomComplete = false;
            // // 初始进入 让阻止加载 为false 不然之前到底了 换日期不会执行下拉
            this.preventLoading = false;
            axios.get('/contract/search-list', {
                params: {
                    content: obj.content,
                    department: obj.department,
                    page: page,
                    partyA: obj.partyA,
                    partyAState: obj.partyAState,
                    partyB: obj.partyB,
                    partyBState: obj.partyBState,
                    signEndTime: obj.signEndTime,
                    signStartTime: obj.signStartTime,
                    subcontractor: obj.subcontractor
                }
            }).then(res => {
                this.loading = false;
                if (res.data.success) {
                    res.data.data.records.forEach(item => {
                        item.partyAArea = item.partyACity + ',' + item.partyAState;
                        item.partyBArea = item.partyBCity + ',' + item.partyBState;
                    });
                    this.dataList = [...this.dataList, ...res.data.data.records];
                    // 数据接收完 滚动加载隐藏
                    this.regularLoading = false;
                    this.onBottomLoad(res.data.data.records.length);
                } else {
                    this.errorMsg = res.data.msg;
                }
            });
        },
        // 已选条件删除
        deleteTag (key) {
            this.deleteSearchType = key;
            for (const key1 in this.obj) {
                if (Object.hasOwnProperty.call(this.obj, key1)) {
                    if (key === 'time') {
                        this.obj.signEndTime = '';
                        this.obj.signStartTime = '';
                    } else if (key === key1) {
                        this.obj[key] = '';
                    }
                }
            }
            this.getSearchList(this.obj);
        },
        // 多种筛选,
        filterClick (dataObj) {
            this.obj = dataObj;
            this.getSearchList(dataObj);
        },
        // 滚动加载
        onscroll () {
            let inner = document.querySelector('.el-table__body-wrapper');
            // 当滚动到底 并且阻止加载为false 执行下拉加载函数 到底了... 不显示
            if (Math.floor(inner.scrollHeight - inner.scrollTop) <= inner.clientHeight && !this.preventLoading) {
                if (inner.scrollTop === 0) {
                    return 0;
                }
                this.getSearchList(this.obj, ++this.current, false);
                this.regularLoading = true;
                // 当到滚动到底 并且阻止加载为true 显示 到底了...
            } else if (Math.floor(inner.scrollHeight - inner.scrollTop) <= inner.clientHeight && this.preventLoading) {
                this.isBottomComplete = true;
            } else {
                // 当滚动条上拉 到底了...隐藏
                this.isBottomComplete = false;
            }
        },
        onBottomLoad (length) {
            if (!length && this.current !== 1) {
                // 后端返回数据为空的时候 显示到底了 同时阻止加载为true  让滚动上去再滚动到底 不再执行下拉加载
                this.isBottomComplete = true;
                this.preventLoading = true;
                // window.removeEventListener('scroll', this.onscroll, true);
            }
        }
    },
    beforeDestroy () {
        window.removeEventListener('scroll', this.onscroll, false);
    }
};
</script>

<style lang="less" src="./contract.less" scoped>
    
</style>