<template>
  <button class="ef-button ef-text-overflow" :disabled="disabled"
          :class="[
            type ? 'ef-button-'+type : '',
            size ? 'ef-button-'+size : '',
            {
              'is-disabled': disabled,
              'is-loading': loading
            }
          ]"
          @mouseenter="handleEnter"
          @mouseleave="handleLeave"
  >
    <i class="iconfont icon-loading" v-if="loading"></i>
    <i class="iconfont"
       :class="[icon ? ' icon-'+ icon: '']"
       v-if="icon && !loading"></i>
    <span v-if="$slots.default"><slot></slot></span>
  </button>
</template>

<script type="text/babel">
  export default {
      props: {
          type: {
              type: String,
              default: 'default'
          },
          disabled: Boolean,
          size: String,
          loading: Boolean,
          icon: String
      },
      data () {
          return {};
      },
      methods: {
          handleEnter () {
              this.$emit('mouseenter');
          },
          handleLeave () {
              this.$emit('mouseleave');
          }
      }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import './less/ef-button.less';
</style>


