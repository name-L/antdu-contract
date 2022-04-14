<template>
  <li class="ef-option"
      @mouseenter="handleHover"
      :class="[
        {
          'is-selected': isSelected,
          'is-hover': isHover,
          'is-disabled': disabled

        },
        size ? 'ef-option-'+size : ''
      ]"
      @click.stop="handleClick">
    <slot>
      {{ label }}
    </slot>
  </li>
</template>

<script type="text/babel">
export default {
    name: 'efOption',
    props: {
        label: {
            type: [String, Number]
        },
        value: {
            type: [String, Number],
            required: true
        },
        display: {
            type: [String, Number]
        },
        disabled: {
            type: Boolean,
            default: false
        },
        topicId: {
            type: String
        }
    },
    data () {
        return {
            isSelected: false,
            isHover: false,
            size: ''
        };
    },
    computed: {
        parent () {
            let parent = this.$parent;
            while (parent.$options.name !== 'efSelect') {
                parent = parent.$parent;
            }
            return parent;
        }
    },
    components: {},
    created () {
        this.parent.options.push(this);
        this.size = this.parent.size;
    },
    mounted () {

    },
    watch: {},
    methods: {
        handleClick () {
            this.bus.$emit('isBorder', this.topicId);
            if (this.disabled) {
                return false;
            }
            this.parent.optionSelected(this.value);
            this.isSelected = true;
        },
        handleHover () {
            if (!this.disabled) {
                this.parent.hoverIndex = this.parent.options.indexOf(this);
                this.parent.setOptionHover();
            }
        }
    }
};
</script>

<style lang="less" rel="stylesheet/less">
  @import "./less/ef-option.less";
</style>


