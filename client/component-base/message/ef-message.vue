<template>
  <transition name="ef-message-fade">
    <div class="ef-message">
      <div class="ef-message-content" :class="type">
        <i class="iconfont" :class="'icon-ef--' + type"></i>
        <span v-html="content" class="content"></span>
        <a class="ef-message-close" @click="close(id)" v-if="closeable">
          <i class="icon iconfont icon-ef--shanchu"></i>
        </a>
      </div>
      </div>
  </transition>

</template>

<script type="text/babel">
  export default {
      props: {
          id: String,
          content: {
              type: String,
              default: ''
          },
          duration: {
              type: Number,
              default: 4
          },
          type: {
              type: String,
              default: 'success'
          },
          closeable: {
              type: Boolean,
              default: false
          },
          onClose: {
              type: Function,
              default: function () {}
          }
      },
      mounted () {
          if (this.duration !== 0) {
              let self = this;
              (function (id) {
                  setTimeout(() => {
                      self.close(id);
                  }, self.duration * 1000);
              })(this.id);
          }
      },
      methods: {
          close (id) {
              this.$parent.close(id);
              if (typeof (this.onClose) === 'function') {
                  this.onClose();
              }
          }
      }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import './less/ef-message.less';
</style>


