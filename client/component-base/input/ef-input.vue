<template>
    <div class="ef-input"
         :style="{width: width ? width + 'px' : '100%', display: this.$slots.append ? 'inline-table': ''}">
        <i class="ef-input-icon iconfont" :class="iconClass" v-if="icon" v-show="isShowIcon"
           @click.stop="handleIconClick"></i>
        <input class="ef-input-inner"
               :type="type"
               :maxlength="maxLength"
               :disabled="disabled"
               :autofocus="autofocus"
               :readonly="readonly"
               :placeholder="placeholder"
               :value="inputValue"
               @blur="handleBlur"
               @input="handleInput"
               @focus="handleFocus"
               @keyup="handleKeyUp"
               @paste="handlePaste"
               :class="[
            size ? 'ef-input-'+size : ''
           ]"
               ref="input">
        <div class="ef-input-append" v-if="$slots.append">
            <slot name="append"></slot>
        </div>
    </div>
</template>

<script type="text/babel">
    export default {
        name: 'ef-input',
        props: {
            maxLength: Number,
            placeholder: String,
            value: {
                default: ''
            },
            disabled: Boolean,
            autofocus: Boolean,
            type: {
                type: String,
                default: 'text'
            },
            size: {
                type: String,
                default: '' // mini small large
            },
            readonly: {
                type: Boolean,
                default: false
            },
            width: String,
            icon: String
        },
        computed: {
            iconClass () {
                return 'icon-ef--' + this.icon;
            }
        },
        data () {
            return {
                inputValue: this.value,
                isShowIcon: false
            };
        },
        watch: {
            'value' (val, oldValue) {
                this.inputValue = val;
                if (val.length) {
                    this.isShowIcon = true;
                } else {
                    this.isShowIcon = false;
                }
            }
        },
        mounted () {
            if (this.autofocus) {
                this.$refs.input.focus();
            }
        },
        methods: {
            handleInput (event) {
                this.inputValue = event.target.value;
                this.$emit('input', this.inputValue, event);
            },
            handleBlur (e) {
                this.$emit('blur', e);
            },
            handleFocus () {
                this.$emit('focus');
            },
            handleIconClick () {
                this.$emit('click');
            },
            handleKeyUp (e) {
                this.$emit('keyup', e);
            },
            handlePaste (event) {
                this.$emit('paste', event);
            },
            focus () {
                this.$refs.input.focus();
            },
            setCurrentValue (value) {
                if (value === this.inputValue) {
                    return;
                }
                this.inputValue = value;
            }
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    @import "./less/ef-input.less";
</style>


