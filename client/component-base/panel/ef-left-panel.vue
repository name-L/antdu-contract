<template>
    <div class="ef-left-panel" :class="{'open':isShow, 'open-navigation':openNavigationIs}" ref="efLeftPanel">
        <div class="ef-left-panel-content">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            isShow: Boolean,
            openNavigationIs: Boolean
        },
        data () {
            return {};
        },
        watch: {},
        created () {},
        mounted () {
            document.addEventListener('click', (e) => {
                if (this.$refs.efLeftPanel) {
                    if (e.clientX > this.$refs.efLeftPanel.getBoundingClientRect().right) {
                        this.$emit('hide');
                    }
                }
            });
        },
        methods: {}
    };
</script>

<style lang="less">
    @import "less/ef-left-panel.less";
</style>
