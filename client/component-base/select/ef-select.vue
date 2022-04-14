<template>
  <div class="ef-select"
       v-clickoutside="handleClose"
       :style="{width:width+'px'}"
       :class="[
         type ? 'ef-select-'+type : '',
         isVisible ? 'dropdown-is-visible' : 'dropdown-is-hide'
       ]">
    <div class="ef-select-inner" ref="reference" @mousedown="handleMouseDown" @click.stop="handleBorder" :class="isBorder ? 'isBorder' : '' ">
      <ef-input :placeholder="placeholder"
                :size="size"
                :disabled="disabled"
                v-model="selectedLabel"
                readonly>
      </ef-input>
      <div :class="{'arrow-ico': true, 'down': isVisible}">
      </div>
    </div>

    <dropdown ref="dropdown" v-show="isVisible">
        <ul class="ef-select-options" :class="isBorder ? 'isBorder' : '' ">
            <ef-scrollar>
              <slot></slot>
            </ef-scrollar>
        </ul>
    </dropdown>
  </div>
</template>

<script type="text/babel">
  import efInput from '../input/ef-input.vue';
  import dropdown from './dropdown.vue';
  import efScrollar from '../scrollar/ef-scrollar.vue';
  import clickoutside from './clickoutside';
  import $ from 'jquery';

  export default {
      name: 'efSelect',
      directives: { clickoutside },
      props: {
          type: {
              type: String,
              default: 'default'
          },
          placeholder: {
              type: String,
              default: ''
          },
          size: {
              type: String,
              default: ''
          },
          width: {
              type: [String, Number],
              default: '180'
          },
          disabled: {
              type: Boolean,
              default: false
          },
          value: {
              type: [String, Number],
              default: ''
          },
          validate: Function,
          selectValue: {
              type: [String, Number],
              default: ''
          }
      },
      data () {
          return {
              options: [],
              isVisible: false,
              selectedValue: this.value,
              selectedLabel: '',
              hoverIndex: -1,
              isBorder: false
          };
      },
      computed: {},
      components: {
          efInput,
          dropdown,
          efScrollar
      },
      beforeMount () {

      },
      mounted () {
          this.$icon = $(this.$el).find('.ef-input-icon');
          this.setOption(this.value);
          document.addEventListener('keydown', this.handleKeydown);
      },
      watch: {
          isVisible (val) {
              if (val) {
                  this.$refs.dropdown.update();
                  if (this.$icon.length) {
                      this.$icon.addClass('is-reverse');
                  }
              } else {
                  this.resetOptionHoverIndex();
                  this.$refs.dropdown.destroy();
                  if (this.$icon.length) {
                      this.$icon.removeClass('is-reverse');
                  }
              }
          },
          value (val) {
              this.setOption(val);
          }
      },
      methods: {
          handleKeydown (e) {
              if (this.isVisible) {
                  // esc
                  if (e.keyCode === 27) {
                      e.preventDefault();
                      this.hideMenu();
                  }
                  // next
                  if (e.keyCode === 40) {
                      e.preventDefault();
                      this.navigateOptions('next');
                  }
                  // prev
                  if (e.keyCode === 38) {
                      e.preventDefault();
                      this.navigateOptions('prev');
                  }
                  // enter
                  if (e.keyCode === 13) {
                      e.preventDefault();
                      this.optionSelected(this.options[this.hoverIndex].value);
                  }
              }
          },
          handleClose () {
              this.hideMenu();
          },
          handleMouseDown (e) {
              this.toggleMenu();
          },
          hideMenu () {
              this.isVisible = false;
          },
          toggleMenu () {
              if (!this.disabled) {
                  this.isVisible = !this.isVisible;
              }
          },
          optionSelected (value) {
              if (this.validate && $.isFunction(this.validate) && !this.validate(value)) {
                  this.hideMenu();
                  return;
              }

              if (this.selectedValue !== value) {
                  this.setOption(value);
                  this.selectedValue = value;
                  this.$emit('input', this.selectedValue);
              }
              this.hideMenu();
          },
          getOption (value) {
              let selectedOption = {};
              this.options.forEach((option) => {
                  if (option.value === value) {
                      option.isSelected = true;
                      selectedOption = option;
                  } else {
                      option.isSelected = false;
                  }
              });
              return selectedOption;
          },
          navigateOptions (direction) {
              if (direction === 'next') {
                  this.hoverIndex++;
                  if (this.hoverIndex === this.options.length) {
                      this.hoverIndex = 0;
                  }

                  if (this.options[this.hoverIndex].disabled === true) {
                      this.navigateOptions('next');
                  }

                  this.setOptionHover();
              }

              if (direction === 'prev') {
                  this.hoverIndex--;
                  if (this.hoverIndex < 0) {
                      this.hoverIndex = this.options.length - 1;
                  }

                  if (this.options[this.hoverIndex].disabled === true) {
                      this.navigateOptions('prev');
                  }

                  this.setOptionHover();
              }
          },
          setOption (value) {
              let option = this.getOption(value);
              let label = option.display || option.label || '';
              this.selectedLabel = this.selectValue + label;
              this.selectedValue = option.value;
          },
          setOptionHover () {
              this.options.forEach((option, index) => {
                  if (index === this.hoverIndex) {
                      option.isHover = true;
                  } else {
                      option.isHover = false;
                  }
              });
          },
          resetOptionHoverIndex () {
              this.hoverIndex = -1;
              this.options.forEach((option) => {
                  option.isHover = false;
              });
          },
          handleBorder () {
              this.isBorder = true;
              window.addEventListener('click', (e) => {
                  if (e.target.className !== 'isBorder') {
                      this.isBorder = false;
                  }
              });
          }
      },
      beforeDestroy () {
          document.removeEventListener('keydown', this.handleKeydown);
      },
      created () {
          this.bus.$on('isBorder', () => {
              this.isBorder = false;
          });
      }
  };
</script>

<style lang="less" rel="stylesheet/less">
.ef-select .isBorder{
    border: 1px solid #526ef4 !important;
}
.ef-select{
    float: left
}
  @import './less/ef-select.less';
</style>


