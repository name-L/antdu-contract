<template>
    <label class="ef-radio">
    <span class="ef-radio-input" :class="{'is-checked': model === label}">
      <span class="ef-radio-inner"></span>
      <input class="ef-radio-original"
             :value="label"
             type="radio"
             v-model="model">
    </span>
        <span class="ef-radio-label">
      <slot></slot>
      <template v-if="!$slots.default">{{label}}</template>
    </span>
    </label>
</template>

<script type="text/babel">
    export default {
        props: {
            value: {},
            label: {},
            disabled: Boolean,
            name: String
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
    @import "less/ef-radio.less";
</style>