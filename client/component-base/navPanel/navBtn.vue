<template>
    <router-link class="navBtn"
                 :to="item.path"
                 :panelType="item.type"
                 :name="item.name"
                 :title="$t(item.title)">
        <i class="iconfont" :class="item.btnName"></i>
        <div class="title" v-show="openNavigation">
            <span class="title-word">{{ $t(item.title) }}</span>
            <span class="title-detail">{{ item.content }}</span>
        </div>
        <i class="iconfont icon-youjiantou"></i>
    </router-link>
</template>
<script type="text/babel">
    export default {
        props: {
            item: Object,
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
        watch: {}
    };
</script>

<style lang="less" rel="stylesheet/less">

</style>
