<template>
    <div class="ef-loadmore">
        <ef-scrollar @onScroll="handlerScroll" ref="srcoller">
            <div v-if="onTopLoad" class="ef-loadmore-top" v-show="isTopLoading && !isTopComplete">
                <div class="ef-loadmore-top-loading">
                    <ef-loading :is-show="isTopLoading && !isTopComplete" size="small"
                                :tip="topLoadingText"></ef-loading>
                </div>
            </div>

            <slot></slot>

            <div v-if="onBottomLoad" class="ef-loadmore-bottom">
                <slot name="bottom-error" v-if="isBottomLoadingError"></slot>
                <span v-if="isNoMoreData">{{noDataText}}</span>

                <div class="ef-loadmore-bottom-loading" v-show="isBottomLoading && !isBottomComplete">
                    <ef-loading :is-show="isBottomLoading && !isBottomComplete" size="small"
                                :tip="bottomLoadingText"></ef-loading>
                    <!--<span>{{ bottomLoadingText }}</span>-->
                </div>
            </div>
        </ef-scrollar>

        <div class="returnTop" @click="returnTop" v-if="isReturnTop && isReturnBtnShow"></div>
    </div>
</template>

<script type="text/babel">
    import efScrollar from '../scrollar/ef-scrollar.vue';
    import efLoading from '../loading/ef-loading.vue';

    export default {
        props: {
            // 是否支持上拉刷新
            onTopLoad: Function,
            // 是否支持下拉加载
            onBottomLoad: Function,
            // 偏移量
            distance: {
                type: Number,
                default: 100
            },
            noDataText: {
                type: String,
                default: '没有更多了'
            },
            topLoadingText: {
                type: String,
                default: '加载中……'
            },
            bottomLoadingText: {
                type: String,
                default: '加载中……'
            },
            isReturnBtnShow: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                isTopLoading: false,
                isTopComplete: false,
                isBottomLoading: false,
                isBottomComplete: false,
                isNoMoreData: false,
                isBottomLoadingError: false,
                isReturnTop: false
            };
        },
        components: {
            efScrollar,
            efLoading
        },
        watch: {},
        computed: {},
        methods: {
            /**
             * 监听滚动
             * @param e
             */
            handlerScroll (e) {
                let el = e.target;
                const scrollTop = isNaN(el.scrollTop) ? el.pageYOffset || 0 : el.scrollTop;
                let scrollHeight = el.scrollHeight;
                let clientHeight = el.clientHeight;
                if (!clientHeight) {
                    return;
                }

                this.toBottomistance = scrollHeight - (scrollTop + clientHeight);
                this.scrollTop = scrollTop;

                if (this._isPrcessingToTop) {
                    return;
                }

                // this.isNoMoreData = false;
                // this.isBottomLoading = false;
                let isToBottom = scrollHeight - (scrollTop + clientHeight) <= this.distance;
                let isToTop = el.scrollTop === 0;

                if (scrollTop > clientHeight) {
                    this.isReturnTop = true;
                } else {
                    this.isReturnTop = false;
                }
                if (this.onBottomLoad && isToBottom &&
                    !this.isBottomLoading && !this.isNoMoreData && !this.isBottomLoadingError) {
                    this.isNoMoreData = false;
                    this.isBottomLoading = true;
                    this.isBottomComplete = false;
                    this.onBottomLoad();
                }

                if (this.onTopLoad && isToTop && !this.isTopLoading) {
                    this.isNoMoreData = false;
                    this.isTopLoading = true;
                    this.isTopComplete = false;
                    this.onTopLoad();
                }
                this.$emit('on-scroll', el);
            },

            /**
             * 上拉加载完成
             */
            topComplete () {
                this.isTopLoading = false;
                this.isTopComplete = true;
                this.updateScroll();
            },

            /**
             * 下拉加载完成
             */
            bottomComplete (size, isError) {
                if (size === 0) {
                    this.isNoMoreData = true;
                }

                if (isError) {
                    this.isBottomLoadingError = true;
                }

                this.isBottomLoading = false;
                this.isBottomComplete = true;
                this.updateScroll();
            },

            /**
             * 加载失败重试
             */
            bottomRetry () {
                this.isBottomLoadingError = false;
                this.isBottomLoading = true;
                this.isBottomComplete = false;
                this.onBottomLoad();
            },

            /**
             * 回到顶部
             */
            returnTop: function () {
                let self = this;
                self._isPrcessingToTop = true;
                self.$refs.srcoller.scroll(null, function () {
                    self.isReturnTop = false;
                    self._isPrcessingToTop = false;
                    if (self.$refs.srcoller) {
                        self.$refs.srcoller.$el.scrollTop = 0;
                    }
                });
                this.$emit('after-return-top');
            },

            /**
             * 获取滚动条距离底部距离
             */
            getToBottomDistance () {
                return this.toBottomistance;
            },

            /**
             * 更新滚动条
             */
            updateScroll () {
                this.$nextTick(() => {
                    this.$refs.srcoller.updated();
                });
            },

            /**
             * 移动到底部
             */
            toBottom (distance) {
                this.$refs.srcoller.toBottom(distance);
            },

            /**
             * 重置状态
             */
            reset () {
                this.returnTop();
                this.updateScroll();
                this.isTopLoading = false;
                this.isTopComplete = false;
                this.isBottomLoading = false;
                this.isBottomComplete = false;
                this.isNoMoreData = false;
                this.isBottomLoadingError = false;
                this.isReturnTop = false;
            }
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    .ef-loadmore {
        height: 100%;
    }

    .ef-loadmore-bottom, .ef-loadmore-top {
        font-size: 12px;
        text-align: center;
        height: 40px;
        line-height: 40px;
        >span {color: hsla(0,0%,100%,.7)}
    }

    .ef-loadmore-bottom-loading, .ef-loadmore-top-loading {
        position: relative;
        width: 100%;
        height: 100%;
    }

    .returnTop {
        position: absolute;
        bottom: 20px;
        right: 10px;

        display: block;
        width: 24px;
        height: 24px;
        /*background: url('../../../asset/image/scrollTop.png');*/
        background-size: 24px 24px;
        opacity: 0.5;
        cursor: pointer;
    }

    .returnTop:hover {
        opacity: 1;
    }
</style>
