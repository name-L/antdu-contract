<template>
    <div class="am-scrollar">
      <el-scrollbar>
         <slot></slot>
      </el-scrollbar>
    </div>
</template>

<script type="text/babel">
    export default {
        props: {},
        data() {
            return {};
        },
        created: function () {

        },
        computed: {},
        components: {},
        beforeMount() {

        },
        mounted() {

        },
        watch: {},
        methods: {}
    };
</script>

<style lang="less" rel="stylesheet/less">
  .am-scrollar{
    height: 100%;
    overflow-y: hidden;
    .el-scrollbar{
      height: 100%;
      .el-scrollbar__wrap{
        overflow:auto;
      }
    }
  }
</style>
