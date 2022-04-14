<template>
    <div :class="['loader-circle', classes]"></div>
</template>

<style lang="less" rel="stylesheet/less" src="./less/loading-circle.less"></style>

<script type="text/babel">
    export default {
        props: {
            classes: String
        }
    };
</script>
