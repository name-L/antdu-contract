<template>
    <div class="ef-input-number"
         :class="[
      inputNumberSize ? 'el-input-number--' + inputNumberSize : '',
      { 'is-disabled': disabled }
    ]"
    >
        <ef-input :value="currentValue"
                  @keydown.up.native.prevent="increase"
                  @keydown.down.native.prevent="decrease"
                  @blur="handleBlur"
                  @focus="handleFocus"
                  @input="handleInput"
                  :disabled="disabled"
                  :size="inputNumberSize"
                  :max="max"
                  :min="min"
                  :name="name"
                  ref="input">
        </ef-input>
        <div class="ef-input-number__increase"
             :class="{'is-disabled': maxDisabled}"
             @click="increase"
             @keydown.enter="increase"
             role="button">
        </div>
        <div class="e-input-number__decrease"
              :class="{'is-disabled': minDisabled}"
              @click="decrease"
              @keydown.enter="decrease"
              role="button">
        </div>
    </div>
</template>
<script>
    import efInput from './ef-input.vue';

    export default {
        name: 'ef-input--number',
        components: {
            efInput
        },
        props: {
            step: {
                type: Number,
                default: 1
            },
            max: {
                type: Number,
                default: Infinity
            },
            min: {
                type: Number,
                default: -Infinity
            },
            value: {
                default: 0
            },
            disabled: Boolean,
            size: String,
            controls: {
                type: Boolean,
                default: true
            },
            name: String,
            label: String
        },
        data () {
            return {
                currentValue: 0
            };
        },
        watch: {
            value: {
                immediate: true,
                handler (value) {
                    let newVal = Number(value);
                    if (isNaN(newVal)) {
                        return;
                    }
                    if (newVal >= this.max) {
                        newVal = this.max;
                    }
                    if (newVal <= this.min) {
                        newVal = this.min;
                    }
                    this.currentValue = newVal;
                    this.$emit('input', newVal);
                }
            }
        },
        computed: {
            minDisabled () {
                return this._decrease(this.value, this.step) < this.min;
            },
            maxDisabled () {
                return this._increase(this.value, this.step) > this.max;
            },
            precision () {
                const {value, step, getPrecision} = this;
                return Math.max(getPrecision(value), getPrecision(step));
            },
            _elFormItemSize () {
                return (this.elFormItem || {}).elFormItemSize;
            },
            inputNumberSize () {
                return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
            }
        },
        methods: {
            toPrecision (num, precision) {
                if (precision === undefined) {
                    precision = this.precision;
                }
                return parseFloat(parseFloat(Number(num).toFixed(precision)));
            },
            getPrecision (value) {
                const valueString = value.toString();
                const dotPosition = valueString.indexOf('.');
                let precision = 0;
                if (dotPosition !== -1) {
                    precision = valueString.length - dotPosition - 1;
                }
                return precision;
            },
            _increase (val, step) {
                if (typeof val !== 'number') {
                    return this.currentValue;
                }

                const precisionFactor = Math.pow(10, this.precision);

                return this.toPrecision((precisionFactor * val + precisionFactor * step) / precisionFactor);
            },
            _decrease (val, step) {
                if (typeof val !== 'number') {
                    return this.currentValue;
                }

                const precisionFactor = Math.pow(10, this.precision);

                return this.toPrecision((precisionFactor * val - precisionFactor * step) / precisionFactor);
            },
            increase () {
                if (this.disabled || this.maxDisabled) {
                    return;
                }
                const value = this.value || 0;
                const newVal = this._increase(value, this.step);
                if (newVal > this.max) {
                    return;
                }
                this.setCurrentValue(newVal);
            },
            decrease () {
                if (this.disabled || this.minDisabled) {
                    return;
                }
                const value = this.value || 0;
                const newVal = this._decrease(value, this.step);
                if (newVal < this.min) {
                    return;
                }
                this.setCurrentValue(newVal);
            },
            handleBlur (event) {
                this.$emit('blur', event);
                this.$refs.input.setCurrentValue(this.currentValue);
            },
            handleFocus (event) {
                this.$emit('focus', event);
            },
            setCurrentValue (newVal) {
                const oldVal = this.currentValue;
                if (newVal >= this.max) {
                    newVal = this.max;
                }
                if (newVal <= this.min) {
                    newVal = this.min;
                }
                if (oldVal === newVal) {
                    this.$refs.input.setCurrentValue(this.currentValue);
                    return;
                }
                this.$emit('change', newVal, oldVal);
                this.$emit('input', newVal);
                this.currentValue = newVal;
            },
            handleInput (value) {
                if (value === '') {
                    return;
                }

                value = Number(value.replace(/\D/g, '').substring(0, 6));

                //                if (value.indexOf('.') === (value.length - 1)) {
                //                    return;
                //                }
                //
                //                if (value.indexOf('-') === (value.length - 1)) {
                //                    return;
                //                }

                const newVal = value;
                if (!isNaN(newVal)) {
                    this.setCurrentValue(newVal);
                } else {
                    this.$refs.input.setCurrentValue(this.currentValue);
                }
            }
        },
        mounted () {
            let innerInput = this.$refs.input.$refs.input;
            innerInput.setAttribute('role', 'spinbutton');
            innerInput.setAttribute('aria-valuemax', this.max);
            innerInput.setAttribute('aria-valuemin', this.min);
            innerInput.setAttribute('aria-valuenow', this.currentValue);
            innerInput.setAttribute('aria-disabled', this.disabled);
        },
        updated () {
            let innerInput = this.$refs.input.$refs.input;
            innerInput.setAttribute('aria-valuenow', this.currentValue);
        }
    };
</script>


<style lang="less" rel="stylesheet/less">
    @import "./less/ef-input-number.less";
</style>
