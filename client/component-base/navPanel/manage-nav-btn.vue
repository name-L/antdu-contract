<template>
    <a class="navBtn"
       :class="manageNavActiveName === item.name ? 'active' : ''"
       :title="$t(item.title)"
       @click="handleClick">
        <i class="iconfont" :class="item.btnName"></i>
        <div class="title" v-if="openNavigation">
            <span class="title-word">{{ $t(item.title) }}</span>
            <span class="title-detail">{{ item.content}}</span>
        </div>
        <i class="iconfont icon-youjiantou"></i>
    </a>
</template>
<script type="text/babel">
    export default {
        props: {
            item: Object,
            manageNavActiveName: String,
            openNavigation: {
                type: Boolean,
                default: false
            }
        },
        components: {},
        data () {
            return {
            };
        },
        watch: {},
        methods: {
            handleClick () {
                this.$emit('nav-btn-click', this.item.name);
            }
        }
    };
</script>

<style lang="less" rel="stylesheet/less">

</style>
