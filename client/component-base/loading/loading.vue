<template>
    <div class="cssload-container" v-if="isShow">
        <div class="cssload-shaft1"></div>
        <div class="cssload-shaft2"></div>
        <div class="cssload-shaft3"></div>
        <div class="cssload-shaft4"></div>
        <div class="cssload-shaft5"></div>
        <div class="cssload-shaft6"></div>
        <div class="cssload-shaft7"></div>
        <div class="cssload-shaft8"></div>
        <div class="cssload-shaft9"></div>
        <div class="cssload-shaft10"></div>
    </div>
</template>
<script type="text/babel">
    export default {
        name: 'loading',
        props: {
            isShow: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {};
        },
        computed: {
        },
        methods: {
        }
    };
</script>
<style lang="" scoped src="./index.less">
    
</style>