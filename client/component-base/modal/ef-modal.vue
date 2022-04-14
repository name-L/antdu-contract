<template>
  <div v-transfer-dom>
    <transition name="ef-modal-fade">
      <div class="ef-modal-mask" @click="handleMaskClick" v-show="isShow"></div>
    </transition>
    <transition name="ef-modal-ease">
      <div class="ef-modal-wrap" @click="handleMaskClick" v-show="isShow">
        <div class="ef-modal" :style="{width: width+'px'}" @click.stop>
          <div v-if="title" class="ef-modal-header">
            <slot name="header">{{ title }}</slot>
            <slot name="close">
              <a v-if="isCloseable" class="ef-modal-delete" @click.stop="handleCloseClick">
                <i class="icon iconfont icon-ef--shanchu"></i>
              </a>
            </slot>

          </div>
          <div class="ef-modal-body">
            <slot></slot>
          </div>
          <div class="ef-modal-footer">
            <slot name="footer">
              <!-- <ef-button type="confirm" size="small" @click.native="handleSubmit">{{ $t('common.saveBtnText') }}
              </ef-button>
              <ef-button v-if="isCloseable" type="cancel" @click.native="handleCloseClick" size="small">{{
                $t('common.cancelBtnText') }}
              </ef-button> -->
            </slot>
          </div>
        </div>
      </div>
    </transition>
  </div>

</template>

<script type="text/babel">
  import TransferDom from './transfer-dom';
//   import efButton from '../../common/button/ef-button.vue';

  export default {
      directives: { TransferDom },
      props: {
      /**
       * 是否显示，支持双向绑定
       */
          value: {
              type: Boolean,
              default: false
          },
          /**
       * 头部标题
       */
          title: String,
          /**
       * 是否显示关闭按钮
       */
          isCloseable: {
              type: Boolean,
              default: true
          },
          /**
       * 点击mask区域 是否关闭
       */
          isMaskCloseable: {
              type: Boolean,
              default: true
          },
          /**
       * 宽度
       */
          width: {
              type: [Number, String],
              default: 400
          }
      },
      data () {
          return {
              isShow: this.value
          };
      },
      computed: {},
      components: {
          //   efButton
      },
      mounted () {
          document.addEventListener('keydown', this.handleKeydown);
      },
      watch: {
          value (val) {
              this.isShow = val;
          }
      },
      methods: {
          close () {
              this.isShow = false;
              this.$emit('on-close');
              this.$emit('input', this.isShow);
          },
          handleCloseClick () {
              this.close();
          },
          handleMaskClick () {
              if (this.isCloseable && this.isMaskCloseable) {
                  this.close();
              }
          },
          handleSubmit () {
              this.$emit('on-submit');
          },
          handleKeydown (e) {
              if (this.isShow && this.isCloseable && e.keyCode === 27) {
                  this.close();
              }
          }
      },
      beforeDestroy () {
          document.removeEventListener('keydown', this.handleKeydown);
      }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import './less/ef-modal.less';
</style>


