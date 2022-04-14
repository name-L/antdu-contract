<template>
    <nav :class="opt.classes" :active-type="opt.activeType" @mouseleave="navMainMouseLeave">
        <nav-item v-for="(item, index) in data.top"
                  @item-active="navItemActive"
                  @item-inactive="navItemInactive"
                  @item-mouseenter="navItemMouseEnter"
                  @changRouteIndex="changRouteIndex"
                  :key="item.key"
                  :item="item"
                  :checkedIndex="checkedIndex"
                  :routeIndex="routeIndex"
                  :index="index"/>
        <div class="placeholder split-line-1" />
        <nav-item v-for="(item, index) in data.middle"
                  @item-active="navItemActive"
                  @item-inactive="navItemInactive"
                  @item-mouseenter="navItemMouseEnter"
                  :key="item.key"
                  :item="item"
                  :index="index"/>
        <div class="placeholder split-line-2" />
        <nav-item v-for="(item, index) in data.bottom"
                  @item-active="navItemActive"
                  @item-inactive="navItemInactive"
                  @item-mouseenter="navItemMouseEnter"
                  :key="item.key"
                  :item="item"
                  :index="index"/>
        <div ref="nav-line" v-if="isNavLine"
            :class="['active-line', {'no-animate': navLine.noAnimate, 'only-fade-animate': navLine.onlyFadeAnimate}]"
            :style="navLine.style" />
    </nav>
</template>

<script>
    import '@component-util/prototype-dom-dimension';
    import '@component-util/prototype-delay-execute';
    import NavItem from './nav-item.vue';
    import GlobalNavService from '../../component-module/index/service/core-page';
    export default {
        props: {
            opt: {
                type: Object,
                default: {
                    // 激活风格，支持以下两种风格：
                    // 1. line-left: 激活风格为显示指示条（导航项左边）
                    // 2. line-right: 激活风格为显示指示条（导航项右边）
                    // 3. bg-all: 激活风格为背影高亮（导航项全背景）
                    activeType: 'line-left'
                },
                validator (data) {
                    return (
                        data.activeType === 'line-left' ||
                        data.activeType === 'line-right' ||
                        data.activeType === 'bg-all' ||
                        data.activeType === 'checked'
                    );
                }
            },
            data: {
                type: Object,
                default: {
                    // 用于配置主题按钮
                    button: [],
                    // 顶部导航项集合
                    top: [],
                    // 中间导航项集合
                    middle: [],
                    // 底部导航项集合
                    bottom: []
                },
                validator (data) {
                    return !(
                        (data.button && !Array.isArray(data.button)) ||
                        (data.top && !Array.isArray(data.top)) ||
                        (data.middle && !Array.isArray(data.middle)) ||
                        (data.bottom && !Array.isArray(data.bottom))
                    );
                }
            }
        },
        data () {
            return {
                // 当前激活的导航项
                currActivedNavItemComponent: null,
                // 导航条相关信息
                navLine: {
                    style: {
                        height: '0px',
                        top: '0px',
                        opacity: 0
                    },
                    onlyFadeAnimate: true,
                    noAnimate: false,
                    isHide: true,
                    isMouseEnter: false
                },
                // resize 事件句柄（在 mounted 中动态创建）
                resizeHandler: null,
                checkedIndex: 0, // 选中的下标
                routeIndex: ''
            };
        },
        computed: {
            // 是否是导航条模式
            isNavLine () {
                return /^line-.+$/.test(this.opt.activeType);
            },
            // 导航条元素（isNavLine为true的情况下有效）
            navLineElement () {
                return this.isNavLine && this.$refs['nav-line'];
            }
        },
        methods: {
            changRouteIndex (data) {
                this.routeIndex = data;
            },
            /**
             * 计算导航条的位置
             * @param activeNavItemComponent {NavItem|undefined} 导航项组件
             */
            computeNavLinePosition (activeNavItemComponent) {
                if (!this.navLineElement) { return; }
                if (activeNavItemComponent) {
                    this.navLine.style.opacity = 1;
                    this.navLine.style.height = (activeNavItemComponent.$el.getHeight('margin') - 4) + 'px';
                    this.navLine.style.top = (activeNavItemComponent.$el.getPosition().top + 2) + 'px';
                    if (this.navLine.isHide) {
                        this.navLine.isHide = false;
                        this.$nextTick(() => {
                            this.navLine.onlyFadeAnimate = false;
                        });
                    }
                } else if (!this.navLine.isMouseEnter) {
                    this.navLine.onlyFadeAnimate = true;
                    this.navLine.style.opacity = 0;
                    this.navLine.isHide = true;
                }
            },
            /**
             * 导航项激活回调句柄
             * @param itemComponent {NavItem} 导航项
             */
            navItemActive (itemComponent, index) {
                this.checkedIndex = index;
                this.computeNavLinePosition(itemComponent);
                this.$children.forEach((c) => {
                    if (c !== itemComponent) { c.triggerInactive(); }
                });
                this.currActivedNavItemComponent = itemComponent;
            },
            /**
             * 导航项关闭回调句柄
             * @param itemComponent {NavItem} 导航项
             */
            navItemInactive (itemComponent, index) {
                this.computeNavLinePosition();
                this.currActivedNavItemComponent = null;
                this.$emit('inactive-all');
            },
            /**
             * 鼠标进入导航项回调
             * @param itemComponent {NavItem} 导航项
             */
            navItemMouseEnter (itemComponent) {
                this.navLine.isMouseEnter = true;
                this.computeNavLinePosition(itemComponent);
            },
            /**
             * 鼠标离开导航主容器回调
             */
            navMainMouseLeave () {
                this.navLine.isMouseEnter = false;
                this.computeNavLinePosition(this.currActivedNavItemComponent);
            }
        },
        components: {
            NavItem
        },
        mounted () {
            let resizeHandler = (() => {
                !this.navLine.isHide && this.computeNavLinePosition(this.currActivedNavItemComponent);
            }).delayExecute(200);
            window.addEventListener('resize', resizeHandler);
            this.$once('hook:beforeDestroy', () => {
                window.removeEventListener('resize', resizeHandler);
            });
            // 跳转问题
            GlobalNavService.jump.instance.on((target, type, data) => {
                let timer = setTimeout(() => {
                    this.bus.$emit('jump', type, data);
                    clearTimeout(timer);
                    timer = null;
                }, 800);
                this.routeIndex = this.data.top.findIndex((item) => {
                    return target === item.classes;
                }
                );
            });
        },
        beforeDestroy () {}
    };
</script>

<style lang="less" rel="stylesheet/less" src="./nav.less"></style>