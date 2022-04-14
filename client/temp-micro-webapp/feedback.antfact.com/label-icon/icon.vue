<template>
    <span>{{name}}</span>
</template>

<script>
    export default {
        props: {
            name: {
                type: String,
                default: 'x'
            },
            // {isActive, isDisable, isVisible}
            status: Object
        },
        methods: {}
    };
</script>

<style lang="less" rel="stylesheet/less" src="./icon.less"></style>