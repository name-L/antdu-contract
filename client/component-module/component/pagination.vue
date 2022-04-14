<template>
    <div class="task-pagination-box">
        <!-- <div class="text">共有{{paginationObj.recordCount}}名用户，每页显示{{paginationObj.page_size}}条</div> -->
        <el-pagination
            background
            :page-size="8"
            :pager-count="5"
            :page-count="paginationObj.pages"
            :current-page="paginationObj.current"
            layout="prev, pager, next"
            :prev-text="$t('main.home.previousPage')"
            :next-text="$t('main.home.nextPage')"
            @current-change="handelPage"
            @prev-click="handelPage"
            @next-click="handelPage"
            ref="pagination"
            popperClass="aa"
        >
        </el-pagination>
    </div>
</template>
<script>
// import appMinXi from '@APP_MIXIN';
export default{
    props: {
        // 页码 总数 每页数量
        paginationObj: {
            type: Object
        }
    },
    data () {
        return {};
    },
    methods: {
        handelPage (evt) {
            this.$emit('handelPage', evt);
        }
    },
    mounted () {
    }
};
</script>
<style lang="less" scoped>
.task-pagination-box {
    display: flex;
    justify-content:flex-end;
    align-items: center;
    padding-top: 20px;
    height: 48px;
    text-align: right;
    position: absolute;
    bottom: 20px;
    right: 20px;
    // background: #F6F6FB;
    .text{
        font-size: 12px;
        font-weight: 400;
        color: #757575;
    }
}
</style>
<style lang="less">
.task-pagination-box {
    .btn-prev,
    .btn-next {
        width: 60px;
        background: #fff !important;
    }
    .el-pager li:not(.disabled):hover {
    background: #e8edff !important;
    color: #757575 !important;
}
.el-pager li:not(.disabled).active {
    background: #526ef4 !important;
    color: #fff !important;
}
   .el-pager {
        .number {
            width: 28px;
            height: 28px;
            background: #ffffff !important;
            border-radius: 2px;
            color: #757575;
            font-weight: 400;
        }
    }
}

// .btn-next, .btn-prev {
//     &:hover {
//         background: #e8edff !important;
//         color: #757575 ;
//     }
// }
</style>