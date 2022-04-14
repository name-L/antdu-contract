<template>
    <div class="ef-scrollar-wrapper ef-scroll"
         :class="{'ef-scroll-horizontal': horizontal }">
        <div v-if="horizontal" class="ef-scrollar-horizontal-inner">
            <slot></slot>
        </div>
        <div v-else class="ef-scrollar-vertical-inner">
            <slot></slot>
        </div>
    </div>
</template>

<script type="text/babel">
    import $ from 'jquery';
    import Ps from 'perfect-scrollbar';

    export default {
        name: 'efScrollar',
        props: {
            noListener: {
                type: Boolean,
                default: false
            },
            classes: {
                type: String,
                default: ''
            },
            horizontal: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                maxHeight: 0
            };
        },
        created () {
            window.addEventListener('resize', this.handleResize);
        },
        mounted () {
            let scrollSetting = {};
            this.$nextTick(() => {
                if (this.horizontal) {
                    this.maxHeight = this.$el.clientHeight;
                    scrollSetting.suppressScrollY = true;
                    scrollSetting.wheelSpeed = 2;
                    scrollSetting.wheelPropagation = false;
                } else {
                    scrollSetting.minScrollbarLength = 20;
                    scrollSetting.maxScrollbarLength = 200;
                    scrollSetting.suppressScrollX = true;
                }
                Ps.initialize(this.$el, scrollSetting);
                this.$el.addEventListener('scroll', this.handleScroll);
            });
        },

        components: {},
        methods: {
            handleResize () {
                if (this.$el.clientHeight > 50) {
                    this.maxHeight = this.$el.clientHeight;
                }
                this.updated();
            },
            handleScroll (e) {
                this.$emit('onScroll', e);
            },
            scroll (scrollDistance, callback) {
                let scrollNum = parseInt(scrollDistance);
                if (!this.$el || scrollNum <= 0) {
                    return;
                }
                $(this.$el).animate({ scrollTop: scrollNum + 'px' }, 'linear', callback);
            },
            updated () {
                Ps.update(this.$el);
            },
            toBottom (distance = 0) {
                this.$el.scrollTop = this.$el.scrollHeight - distance;
            },
            /**
             * 滚动到某个具体的位置
             */
            toDistance (distance) {
                let self = this;
                this.scroll(distance, function () {
                    self.$el.scrollTop = distance;
                });
            }
        },
        beforeDestroy () {
            window.removeEventListener('resize', this.handleResize);
            this.$el.removeEventListener('scroll', this.handleScroll);
            Ps.destroy(this.$el);
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    @import "./less/ef-scrollar.less";
</style>