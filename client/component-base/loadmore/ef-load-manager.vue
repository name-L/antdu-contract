<template>
    <ef-loadmore :on-bottom-load="extendOnBottomLoad"
                 :on-top-load="extendOnTopLoad"
                 :distance="distance"
                 :no-data-text="noDataText"
                 :top-loading-text="topLoadingText"
                 :bottom-loading-text="bottomLoadingText"
                 :is-return-btn-show="isReturnBtnShow"
                 @after-return-top="afterReturnTop"
                 ref="loadMore">
        <div class="blog-border"
             v-for="(item, index) in sliceList"
             :key="item.id">
            <slot :item="item" :index="index"></slot>
        </div>

        <template v-if="$slots['bottom-error']" slot="bottom-error">
            <slot name="bottom-error"></slot>
        </template>
    </ef-loadmore>
</template>

<script type="text/babel">
    import efLoadmore from './ef-loadmore.vue';

    export default {
        props: {
            maxSize: { // 最大显示数据的量
                type: Number,
                default: 40
            },
            loadList: Array,
            distance: Number,
            noDataText: String,
            topLoadingText: String,
            bottomLoadingText: String,
            isReturnBtnShow: Boolean,
            // 是否支持上拉刷新
            onTopLoad: Function,
            // 是否支持下拉加载
            onBottomLoad: Function
        },
        data () {
            return {
                startPointer: 0, // 起始点
                endPointer: this.maxSize, // 终止点
                direction: 'loadTop', // 视窗位移方向
                offset: 0, // 偏移量
                defaultOffset: 20, // 加载缓存数据的偏移量
                sliceList: [], // 显示数据集合
                cacheBeforeScrollTopHeight: 0, // ScrollTop时列表的offsetHeight数值
                topCacheSize: 0 // 获取最新数据时需要，缓存获取最新数据之前的缓存数据大小
            };
        },
        computed: {
            /**
             * endPointer 距离缓存数组尾部的距离
             **/
            endLength () {
                return this.loadList ? this.loadList.length - this.endPointer : 0;
            }
        },
        components: {
            efLoadmore
        },
        created () {
            this.setSliceList();
        },
        watch: {},
        methods: {
            /**
             * 根据偏移量（offset）取缓存数据添加到sliceList中，实现在头部、尾部添加数据的行为。
             **/
            setListOffset () {
                let isLoadTop = this.direction === 'loadTop';
                if (!isLoadTop) {
                    this.sliceList = [...this.sliceList, ...this.loadList.slice(this.endPointer, this.endPointer + this.offset)];
                } else {
                    this.sliceList = [...this.loadList.slice(Math.max(this.startPointer - this.offset, 0), this.startPointer), ...this.sliceList];
                }
            },
            /**
             * 根据 direction 、 startPointer 和 endPointer设置sliceList
             **/
            setSliceList () {
                if (!this.loadList || this.loadList.length === 0) {
                    return;
                }
                let startPointer = 0;
                let endPointer = 0;
                let isLoadTop = this.direction === 'loadTop';
                // direction = loadTop 由startPointer反推endPointer
                if (isLoadTop) {
                    startPointer = this.startPointer;
                    endPointer = Math.min(startPointer + this.maxSize, this.loadList.length);
                } else {
                    // direction = loadBottom 由endPointer反推startPointer
                    endPointer = this.endPointer;
                    startPointer = Math.max(endPointer - this.maxSize, 0);
                }
                this.sliceList = this.loadList.slice(startPointer, endPointer);
            },
            /**
             * 扩展onTopLoad 封装取缓存数据还是请求新数据
             **/
            extendOnTopLoad () {
                this.handleBeforeTopLoad();
                if (this.startPointer > 0) {
                    setTimeout(() => {
                        // 向上滚动有缓存数据
                        this.topComplete(Math.min(this.startPointer, this.defaultOffset));
                    }, 800);
                } else if (this.onTopLoad) {
                    // 尝试上拉刷新
                    this.onTopLoad();
                } else {
                    // 缺省，结束加载
                    this.topComplete(0);
                }
            },
            /**
             * 取数据前的处理，更新direction，重置offset为0，更新sliceList
             * 在更新完sliceList后，更新cacheBeforeScrollTopHeight
             **/
            handleBeforeTopLoad () {
                if (this.direction !== 'loadTop') {
                    // 变换方向时根据 endPointer 设置 startPointer
                    this.startPointer = Math.max(this.endPointer - this.offset - this.maxSize, 0);
                }
                this.offset = 0;
                this.direction = 'loadTop';
                this.setSliceList();
                this.updateScroll();

                if (this.loadList) this.topCacheSize = this.loadList.length;
                this.$nextTick(() => {
                    this.cacheBeforeScrollTopHeight = this.$refs.loadMore.$el.firstChild.firstChild.offsetHeight;
                });
            },
            /**
             * 扩展onBottomLoad 封装取缓存数据还是请求新数据
             **/
            extendOnBottomLoad () {
                this.handleBeforeBottomLoad();
                if (this.endLength > 0) {
                    setTimeout(() => {
                        // 向下滚动有缓存数据
                        this.bottomComplete(Math.min(this.endLength, this.defaultOffset), false);
                    }, 800);
                } else if (this.onBottomLoad) {
                    // 尝试下拉加载
                    this.onBottomLoad();
                } else {
                    // 缺省，结束加载
                    this.bottomComplete(0, false);
                }
            },
            /**
             * 取数据前的处理，更新direction，重置offset为0，更新sliceList
             **/
            handleBeforeBottomLoad () {
                if (this.direction !== 'loadBottom') {
                    this.endPointer = Math.min(this.startPointer + this.offset + this.maxSize, this.loadList.length);
                }
                this.offset = 0;
                this.direction = 'loadBottom';
                this.setSliceList();
                this.updateScroll();
            },
            /**
             * 获取最新数据完毕，新增参数offset，外部调用可传可不传.
             **/
            topComplete (offset) {
                this.$nextTick(() => {
                    this.handleBeforeTopComplete(offset);
                });
                if (this.$refs.loadMore) this.$refs.loadMore.topComplete();
            },
            /**
             * 获取最新数据完毕前的处理，需要更新偏移量并更新视窗，根据偏移量更新pointer。
             * offset 为新的偏移量，在offset不传时则根据loadList变化量决定offset。
             * 在更新视窗后根据内容列表变化更新滚动条位置，方便连续滚动。
             **/
            handleBeforeTopComplete (offset) {
                if (typeof offset !== 'number') {
                    offset = this.loadList ? this.loadList.length - this.topCacheSize : 0;
                }
                this.offset = Math.max(offset, 0);
                this.setListOffset();
                this.updatePointer();
                this.updateScroll();
                this.topCacheSize = 0;
                this.$nextTick(() => {
                    let afterScrollTopHeight = this.$refs.loadMore.$el.firstChild.firstChild.offsetHeight;
                    if (this.cacheBeforeScrollTopHeight && afterScrollTopHeight - this.cacheBeforeScrollTopHeight) {
                        this.toBottom(this.cacheBeforeScrollTopHeight);
                        this.cacheBeforeScrollTopHeight = 0;
                    }
                });
            },
            /**
             * 获取历史数据完毕
             **/
            bottomComplete (size, isError) {
                this.$nextTick(() => {
                    this.handleBeforeBottomComplete(size);
                });
                if (this.$refs.loadMore) this.$refs.loadMore.bottomComplete(size, isError);
            },
            /**
             * 获取历史数据完毕前的处理,需要更新偏移量并更新视窗，根据偏移量更新pointer，
             **/
            handleBeforeBottomComplete (offset) {
                this.offset = Math.max(offset, 0);
                this.setListOffset();
                this.updatePointer();
                this.updateScroll();
            },
            /**
             * 根据传入的direction和offset，更新startPointer或endPointer
             * direction代表视窗移动的方向，offset代表移动距离
             **/
            updatePointer () {
                let isLoadTop = this.direction === 'loadTop';
                if (isLoadTop) {
                    this.startPointer = Math.max(this.startPointer - this.offset, 0);
                } else {
                    this.endPointer = Math.min(this.endPointer + this.offset, this.loadList.length);
                }
            },
            /**
             * 在滚动条回到顶部后，需要将startPointer重置为0，重置direction为top，更新显示数据
             */
            afterReturnTop () {
                this.startPointer = 0;
                this.direction = 'loadTop';
                this.handleBeforeTopLoad();
            },
            updateScroll () {
                if (this.$refs.loadMore) this.$refs.loadMore.updateScroll();
            },
            toBottom (distance) {
                if (this.$refs.loadMore) this.$refs.loadMore.toBottom(distance);
            },
            bottomRetry () {
                if (this.$refs.loadMore) this.$refs.loadMore.bottomRetry();
            },
            returnTop () {
                if (this.$refs.loadMore) this.$refs.returnTop.bottomRetry();
            },
            reset () {
                if (this.$refs.loadMore) this.$refs.reset.bottomRetry();
            }
        }
    };
</script>

<style lang="less" rel="stylesheet/less">

</style>