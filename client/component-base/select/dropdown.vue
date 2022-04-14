<template>
  <div class="drop-down" :style="{width: width}">
    <slot></slot>
  </div>
</template>

<script type="text/babel">
  import Popper from 'popper.js';

  export default {
      props: {
          placement: {
              type: String,
              default: 'bottom-start'
          }
      },
      data () {
          return {
              popper: null,
              width: ''
          };
      },
      computed: {},
      components: {},
      mounted () {
  
      },
      watch: {},
      methods: {
          update () {
              if (this.popper) {
                  this.$nextTick(() => {
                      this.popper.update();
                  });
              } else {
                  this.$nextTick(() => {
                      this.popper = new Popper(this.$parent.$refs.reference, this.$el, {
                          placement: this.placement
                      });
                  });
              }
              let width = this.$parent.$el.style['width'];
              this.width = this.$parent.type === 'dropdown-location' ? 'auto' : (parseInt(width) + 'px');
          },
          destroy () {
              if (this.popper) {
                  setTimeout(() => {
                      this.popper.destroy();
                      this.popper = null;
                  }, 0);
              }
          }
      }
  };
</script>

<style lang="less" rel="stylesheet/less">
  .drop-down {
    z-index: 100;
  }
</style>


