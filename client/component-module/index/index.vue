<template>
    <div class="system-container">
        <div class="body-area">
            <!-- <div v-show="page==='index'" class="body-content">
                <search
                    @handleChange="handleChange">
                </search>
                <Table
                    :dataList="dataList"
                    :regularLoading="regularLoading"
                    :isBottomComplete="isBottomComplete"
                    @handleEdit="showPage"
                    :errorMsg="errorMsg">
                </Table>
            </div>
            <detail :detailContent="detailContent" v-show="page === 'detail'" @handleBack="handleBack"></detail> -->
            <nav-menu></nav-menu>
        </div>
    </div>
</template>

<script type="text/babel">
    import Vue from 'vue';
    import SocketManage from '@component-util/socket-push';
    import asideNav from '../aside/aside.vue';
    import GlobalNavService from './service/global-nav.js';
    import CorePageService from './service/core-page.js';
    import CorePage from '../../component-widget/core-page/page-main.vue';
    import search from '../component/search.vue';
    import Table from '../component/table.vue';
    
import axios from 'axios';
import detail from '../component/detail.vue';
import navMenu from '../nav-menu/index.vue';
    const Frame = {
        main: null,
        goto (pageName) {
            if (!Frame.main || typeof pageName !== 'string') { return; }
            Frame.main.switchPage(pageName);
        }
    };
    // index vue data
    const data = {
        nav: {
            opt: {
                classes: 'left-nav',
                activeType: 'checked'
            },
            data: {
                top: [],
                middle: [],
                bottom: []
            }
        },
        button: {
            opt: {
                classes: 'left-nav',
                activeType: 'checked'
            },
            data: {
                button: []
            }
        },
        main: {
            opt: {
                classes: 'main-content'
            },
            pages: []
        }
    };
    // init nav item
    Object.keys(GlobalNavService).forEach((serviceName) => {
        let dataName = serviceName.split(':')[1];
        data.nav.data[dataName] = GlobalNavService[serviceName].getResult().map((d) => Object.freeze(d));
        GlobalNavService[serviceName].onRegist((opt, result) => {
            data.nav.data[dataName] = result.map((d) => Object.freeze(d));
        });
    });
    // init main content
    Object.keys(CorePageService.regist).forEach((serviceName) => {
        data.main.pages = CorePageService.regist[serviceName].getResult().map((d) => Object.freeze(d));
        CorePageService.regist[serviceName].onRegist((opt, result) => {
            data.main.pages = result.map((d) => Object.freeze(d));
        });
    });

    // 监听主页切换动作
    CorePageService.switch.instance.on(function (target) {
        Frame.goto(target);
    });

    export default {
        props: {
            opt: Object
        },
        data () {
            return {
                isNeedLogout: false, // 前端是否已登出标识
                loginUrl: `${window.Util.ctxPath}/login`,
                showNotices: false,
                content: '',
                hrefLogout: true,
                isSsoLogout: false,
                showChat: false,
                fullImageData: {},
                isShowTips: false,
                isShowLeftPanel: false,
                leftPanelType: '',
                openNavigationIs: false,
                initAntme: false,
                tipsNumber: 0,
                data,
                dataList: [],
                // 页码 总数
                paginationObj: {
                },
                isBottomComplete: false, // 是否到底
                // 加载中
                regularLoading: false,
                // 页码
                current: 1,
                // 用于已知到底 再滚动到底不会加载 不会出现加载中
                preventLoading: false,
                // error
                errorMsg: '',
                obj: {},
                page: 'index',
                detailContent: {} // 合同详情
            };
        },
        created () {
            // 前端全局错误消息拦截（包括401、452等错误识别和错误提示）
            this.initErrorHandler();
        },
        watch: {},
        components: {
            asideNav,
            CorePage,
            search,
            Table,
            detail,
            navMenu
        },
        mounted () {
            console.log(window, 'tttt');
            Frame.main = this.$refs.main;
            setTimeout(() => {
                this.socket_root = SocketManage.getPushServer('/', `${window.Util.ctxPath}/socket.io`);
            }, 1000);
            // this.getSearchList({});
            window.addEventListener('scroll', this.onscroll, true);
        },
        computed: {},
        methods: {
            // 获取数据列表
            // getDataList (page = 1) {
            //     if (page === 1) {
            //         this.current = 1;
            //     }
            //     // 重新选择时间 让加载跟到底隐藏
            //     this.regularLoading = false;
            //     this.isBottomComplete = false;
            //     // // 初始进入 让阻止加载 为false 不然之前到底了 换日期不会执行下拉
            //     this.preventLoading = false;
            //     axios.get('/contract/list', {
            //         params: {
            //             page: page
            //         }
            //     }).then(res => {
            //         if (res.data.success) {
            //             this.dataList = [...this.dataList, ...res.data.data.records];
            //             // 翻页参数  现在不用翻页了
            //             // this.paginationObj = {
            //             //     pages: res.data.data.pages,
            //             //     total: res.data.data.total,
            //             //     current: res.data.data.current
            //             // };
            //             // 数据接收完 滚动加载隐藏
            //             this.regularLoading = false;
            //             this.onBottomLoad(res.data.data.records.length);
            //         } else {
            //             this.errorMsg = res.data.msg;
            //         }
            //     });
            // },
            // 搜索数据列表
            getSearchList (obj, page = 1) {
                if (page === 1) {
                    this.current = 1;
                    this.dataList = [];
                }
                // 重新选择时间 让加载跟到底隐藏
                this.regularLoading = false;
                this.isBottomComplete = false;
                // // 初始进入 让阻止加载 为false 不然之前到底了 换日期不会执行下拉
                this.preventLoading = false;
                axios.get('/contract/search', {
                    params: {
                        startTime: obj.startTime || '',
                        endTime: obj.endTime || '',
                        partyA: obj.partyA,
                        partyB: obj.partyB,
                        keywords: obj.keywords,
                        page: page
                    }
                }).then(res => {
                    if (res.data.success) {
                        this.dataList = [...this.dataList, ...res.data.data.records];
                        // 数据接收完 滚动加载隐藏
                        this.regularLoading = false;
                        this.onBottomLoad(res.data.data.records.length);
                    } else {
                        this.errorMsg = res.data.msg;
                    }
                });
            },
            // 翻页
            // handelPage (page) {
            //     this.getDataList(page);
            // },
            // 多种搜索
            handleChange (data) {
                this.obj = data;
                this.getSearchList(data);
            },
            // 滚动加载
            onscroll () {
                let inner = document.querySelector('.el-table__body-wrapper');
                // 当滚动到底 并且阻止加载为false 执行下拉加载函数 到底了... 不显示
                if (Math.floor(inner.scrollHeight - inner.scrollTop) <= inner.clientHeight && !this.preventLoading) {
                    if (inner.scrollTop === 0) {
                        return 0;
                    }
                    this.getSearchList(this.obj, ++this.current);
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
            },
            // 更改展示页面

            showPage (index, row, type = 'detail') {
                this.page = type;
                this.detailContent = row;
            },

            handleBack (type) {
                this.page = type;
            },
            // navInactiveOfAll () {
            // // 跳转到的核心页列表中的第一个（一般是第一个注册的）
            //     Frame.goto(this.data.main.pages[0].key);
            // },
            tipsClose () {
                this.showNotices = !this.showNotices;
                this.isShowLeftPanel = true;
                this.isShowTips = false;
                this.leftPanelType = 'notice';
            },
            handleOpenLeftPanel (type) {
                if (this.leftPanelType === type) {
                    this.isShowLeftPanel = false;
                    this.leftPanelType = '';
                } else {
                    this.isShowLeftPanel = true;
                    this.leftPanelType = type;
                    if (type === 'notice') {
                        this.isShowTips = false;
                    }
                }
            },
            openNavigation (openNavigationIs) {
                this.openNavigationIs = openNavigationIs;
            },
            handleHideLeftPanel () {
                this.isShowLeftPanel = false;
                this.leftPanelType = '';
            },
            alertLoginError (msg) {
                alert(msg);
            },
            initErrorHandler () {
            // socket 增加处理401 session失效等异常
                SocketManage.setup({
                    afterClosePushServer: (key, tip, url) => {
                    // 已登出，不再做处理和提示
                        if (this.isNeedLogout) {
                            return;
                        }
                        if (tip && typeof tip === 'string') {
                            this.alertLoginError(tip);
                        }
                    },
                    redirectToUrlAfterClose: this.loginUrl
                });
                // 增加全局拦截(vue-resource) 处理401 session失效等异常
                Vue.http.interceptors.push((request, next) => {
                // 已登出，直接拦截请求并返回
                    if (!request.url.startsWith(window.Util.ctxPath)) {
                        request.url = `${window.Util.ctxPath}${request.url}`;
                    }
                    if (this.isNeedLogout) {
                        return request.respondWith('isNeedLogout', null);
                    }
                    next((response) => {
                        if (response.status === 401 || response.status === 454 || response.status === 451 ||
                        response.status === 452 || response.status === 453) {
                            let body = response.body;
                            if (body) {
                                if (body.error && body.error.msg) {
                                    body = body.error.msg;
                                } else if (body.errors) {
                                    body = body.errors;
                                }
                            }
                            if (!this.isNeedLogout) {
                                this.alertLoginError(body);
                                window.location.href = this.loginUrl;
                            }
                            this.isNeedLogout = true;
                        }
                        return response;
                    });
                });
            }
        },
        beforeDestroy () {
            window.removeEventListener('scroll', this.onscroll, false);
        },
        destroyed () {
        }
};
</script>

<style lang="less" rel="stylesheet/less">
    @import "./index.less";
</style>

