<template>
    <label class="ef-checkbox" :class="{'is-checked': model}">
    <span class="ef-checkbox-input">
      <span class="ef-checkbox-inner"></span>
      <input type="checkbox"
             tabindex="-1"
             :disabled="disabled"
             class="ef-checkbox-original"
             v-model="model">
    </span>
        <span class="ef-checkbox-label">
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
    </label>
</template>

<script type="text/babel">
    export default {
        props: {
            disabled: Boolean,
            value: Boolean,
            label: String
        },
        data () {
            return {};
        },
        computed: {
            model: {
                get () {
                    return this.value;
                },
                set (val) {
                    this.$emit('input', val);
                }
            }
        },
        components: {},
        mounted () {
        },
        watch: {},
        methods: {}
    };
</script>

<style lang="less" rel="stylesheet/less">
    @import "less/ef-checkbox.less";
</style>
