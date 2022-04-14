<template>
    <div class="ef-loading" v-if="isShow">
    <span class="ef-loading-icon" :class="size">
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
      <i></i>
    </span>
        <span class="ef-loading-tip" v-if="isShowTip">{{ tip }}</span>
    </div>
</template>

<script type="text/babel">
    export default {
        name: 'ef-loading',
        props: {
            tip: {
                type: String,
                default: ''
            },
            size: {
                type: String,
                default: ''
            },
            isShow: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {};
        },
        computed: {
            isShowTip () {
                return this.tip !== '';
            }
        },
        methods: {
            isNestedPattern () {
                return !!this.$children.length;
            }
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    @import "./less/ef-loading.less";
</style>


