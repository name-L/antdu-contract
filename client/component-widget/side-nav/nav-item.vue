<script>
    export default {
        props: {
            item: {
                type: Object,
                default: {
                    // this 为当前实例
                    callbacks: {
                        init () {},
                        active () {},
                        inactive () {}
                    },
                    // tip 信息
                    tip: {
                        active: '',
                        inactive: ''
                    },
                    // 额外的 class 名称
                    classes: '',
                    // item 内容，两种格式如下：
                    // 1. string:（注意：XSS的攻击，所以这里的内容不可以是用户提交的）
                    // 2. object: 子组件 {props:{}, component:object} | object
                    // 3. array: 子组件数组 [ {props:{}, component:object} | object, ... ]
                    content: ''
                },
                validator (data) {
                    if (!data) { return false; }
                    // data.callbacks = data.callbacks || {};
                    // data.tip = data.tip || '';
                    // if (typeof data.tip === 'string') {
                    //     data.tip = {
                    //         active: data.tip,
                    //         inactive: data.tip
                    //     };
                    // } else {
                    //     data.tip.active = data.tip.active || '';
                    //     data.tip.inactive = data.tip.inactive || '';
                    // }
                    // data.classes = (data.classes || '');
                    // data.content = data.content || '';
                    if (!data.content) { return false; }
                    return true;
                }
            },
            index: Number,
            checkedIndex: [Number, String],
            routeIndex: [Number, String]
        },
        data () {
            return {
                isVisible: false,
                isActive: false,
                isDisable: false,
                isTempPreventDefaultItemClick: false
            };
        },
        computed: {
            title () {
                return this.$t(this.isActive ? this.item.tip.active : this.item.tip.inactive);
            },
            activeTip () {
                return typeof this.item.tip === 'string' ? this.item.tip : this.item.tip.active || '';
            },
            inactiveTip () {
                return typeof this.item.tip === 'string' ? this.item.tip : this.item.tip.active || '';
            }

        },
        render (createElement) {
            let child = [];
            let content = this.item.content;
            let itemOpt = {
                'class': [
                    this.item.classes, {
                        show: this.isVisible,
                        active: this.isActive,
                        disable: this.isDisable
                    }
                ],
                'domProps': {
                    'title': this.title
                },
                'on': {
                    click: this.itemClick,
                    mouseenter: this.itemMouseEnter
                }
            };
            let getChildOpt = function (props) {
                return {
                    'on': {
                        // 监听子组件的临时禁用 item 的点击事件
                        'temp-prevent-default-item-click': this.tempPreventDefaultItemClick
                    },
                    'props': Object.assign({}, props, {
                        // 相关状态传递到子组件当中
                        status: {
                            isActive: this.isActive,
                            isDisable: this.isDisable,
                            isVisible: this.isVisible
                        }
                    })
                };
            };
            let prepareChild = function (obj) {
                if (!obj || typeof obj !== 'object') { return; }
                if (obj.component && typeof obj.component === 'object') {
                    child.push(createElement(obj.component, getChildOpt.call(this, obj.props)));
                } else {
                    child.push(createElement(obj, getChildOpt.call(this, {})));
                }
            };
            // child component 的初始化处理
            if (typeof content === 'string') {
                itemOpt['domProps']['innerHTML'] = content;
            } else if (Array.isArray(content)) {
                content.forEach((obj) => { prepareChild.call(this, obj); });
            } else {
                prepareChild.call(this, content);
            }
            // 创建 item 元素
            return createElement('div', itemOpt, child);
        },
        watch: {
            checkedIndex () {
                if (this.checkedIndex === this.index) {
                    this.$emit('item-inactive', this, this.index);
                    this.triggerInactive();
                    this.isActive = true;
                } else {
                    this.$emit('item-inactive', this, this.index);
                    this.triggerInactive();
                    this.isActive = false;
                }
            },
            routeIndex () {
                if (this.routeIndex !== '' && this.index === this.routeIndex) {
                    this.$emit('item-active', this, this.index);
                    this.triggerActive();
                    this.$emit('changRouteIndex', '');
                }
            }
        },
        methods: {
            /**
             * 触发 item 激活
             */
            triggerActive () {
                if (this.isDisable) { return; }
                if (this.isActive) { return; }
                this.isActive = true;
                if (this.item.callbacks && typeof this.item.callbacks.active === 'function') {
                    this.item.callbacks.active.call(this);
                }
            },
            /**
             * 触发 item 关闭
             */
            triggerInactive () {
                if (this.isDisable) { return; }
                if (!this.isActive) { return; }
                this.isActive = false;
                if (this.item.callbacks && typeof this.item.callbacks.inactive === 'function') {
                    this.item.callbacks.inactive.call(this);
                }
            },
            /**
             * 临时禁用 item 的点击动作（注意：这个会在 itemClick 自动还原的）
             */
            tempPreventDefaultItemClick () {
                this.isTempPreventDefaultItemClick = true;
            },
            /**
             * item 的点击回调
             */
            itemClick () {
                if (this.isDisable) { return; }
                if (this.isTempPreventDefaultItemClick) {
                    // 临时禁用的自动恢复
                    return (this.isTempPreventDefaultItemClick = false);
                }
                //  调用激活
                this.$emit('item-active', this, this.index);
                this.triggerActive();
                this.isActive = true;
                // }
            },
            /**
             * item 的 mouseenter 事件回调
             */
            itemMouseEnter () {
                if (this.isDisable) { return; }
                this.$emit('item-mouseenter', this);
            }
        },
        mounted () {
            // 初始化按钮
            if (typeof this.item.callbacks.init === 'function') {
                this.item.callbacks.init.call(this);
            }
            let timer = setTimeout(() => {
                if (this.index === 0) {
                    this.$emit('item-active', this, this.index);
                    this.triggerActive();
                }
                clearTimeout(timer);
                timer = null;
            }, 500);
            // 下一个时间才显示（方便按钮的动画）
            this.$nextTick(() => {
                this.isVisible = true;
            });
        }
    };
</script>