<template>
    <div class="ef-search"
         :style="{width: width ? width : '100%', display: this.$slots.append ? 'inline-table': ''}"
         :class="[
                size ? 'ef-search-' + size : ''
                ]">
        <input class="ef-search-input"
               type="text"
               :autofocus="autofocus"
               :placeholder="placeholder"
               :value="inputValue"
               :disabled="disabled"
               @blur="handleBlur"
               @input="handleInput"
               @focus="handleFocus"
               @keyup="handleKeyUp"
               @keyup.enter="handleEnter"
               ref="input">
        <div class="ef-clear-search"
             :class="disabled ? 'hide' : ''"
             v-show="showClear"
             @click="handelClear">
        </div>
    </div>
</template>

<script type="text/babel">
    export default {
        props: {
            placeholder: String,
            value: String,
            autofocus: Boolean,
            width: String,
            disabled: {
                type: Boolean,
                default: false
            },
            size: {
                type: String,
                default: 'small' // mini small large
            }
        },
        computed: {},
        data () {
            return {
                inputValue: this.value,
                showClear: false
            };
        },
        watch: {
            'value' (val, oldValue) {
                this.inputValue = val;
                if (val.length) {
                    this.showClear = true;
                } else {
                    this.showClear = false;
                }
            }
        },
        methods: {
            handleInput (event) {
                this.inputValue = event.target.value;
                if (this.inputValue.length) {
                    this.showClear = true;
                } else {
                    this.showClear = false;
                }
                this.$emit('input', this.inputValue);
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
            focus () {
                this.$refs.input.focus();
            },
            handelClear () {
                this.inputValue = '';
                this.showClear = false;
                this.$emit('clear-value');
            },
            handleEnter: function (e) {
                this.$emit('enter', e);
            }
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    @import "./less/ef-search.less";
</style>


