<template>
    <date-picker
            class="task-date-picker"
            popper-class="ef-date-popper"
            size="small"
            :align="align"
            v-model="dataPickerOptions.timeArray"
            type="daterange"
            prefix-icon="iconfont icon-rili"
            :editable="dataPickerOptions.editable"
            :clearable="dataPickerOptions.clearable"
            :format="dataPickerOptions.format"
            @change="handleCustomTimeChange"
            :range-separator="rangeSeparator">
    </date-picker>
</template>
<script type="text/babel">
    import { DatePicker } from 'element-ui';

    export default {
        data () {
            return {
                dataPickerOptions: {
                    editable: false,
                    clearable: false,
                    customTime: new Date(),
                    format: 'yyyy-MM-dd',
                    timeArray: [0, 0]
                }
            };
        },
        props: {
            initChange: {
                type: Boolean,
                default: true
            },
            rangeSeparator: {
                type: String,
                default: '-'
            },
            align: {
                type: String,
                default: 'left'
            }
        },
        created: function () {
            this.dataPickerOptions.timeArray = this.getLastMonthRange();
        },
        watch: {},
        components: {
            DatePicker
        },
        mounted: function () {
            if (this.initChange) {
                this.$emit('change', this.dataPickerOptions.timeArray);
            }
        },
        computed: {},
        methods: {
            /**
             * 处理自定义的时间
             */
            handleCustomTimeChange: function (value) {
                let startTime = this.dataPickerOptions.timeArray[0].getTime();
                let endTime = this.dataPickerOptions.timeArray[1].getTime() + (24 * 60 * 60 * 1000 - 1);
                this.$emit('change', [startTime, endTime]);
            },
            /**
             * 获取时间范围（近一月）
             * @private
             */
            getLastMonthRange: function () {
                let oneDayTime = 24 * 1000 * 60 * 60;
                let nowDate = new Date();
                let year = nowDate.getFullYear();
                let month = nowDate.getMonth() + 1;
                let day = nowDate.getDate();
                let minDate = '';
                let maxDate = '';
                let minMonth = '';
                let minYear = '';
                let smallMonth = [4, 6, 9, 11];
                // （1）上lastTime月是小月（2）是闰年且日期为大于29（3）平年且日期大于28  这三种情况的上一月默认是30天之前
                if ((smallMonth.indexOf(month - 1) >= 0 && day === 31) ||
                        ((month - 1) === 2 && (new Date(year, 1, 29).getDate() === 29 && day >= 29)) ||
                        ((month - 1) === 2 && (new Date(year, 1, 29).getDate() !== 29 && day >= 28))) {
                    minDate = new Date(new Date(year + '/' + month + '/' + day).getTime() - 29 * oneDayTime).getTime();
                } else if (month - 1 <= 0) {
                    minYear = year - 1;
                    minMonth = 12 - (1 - month);
                    minDate = new Date(minYear + '/' + minMonth + '/' + day).getTime();
                } else {
                    minYear = year;
                    minMonth = month - 1;
                    minDate = new Date(minYear + '/' + minMonth + '/' + day).getTime();
                }
                maxDate = new Date(new Date(new Date().toLocaleDateString()).getTime() + oneDayTime - 1).getTime();
                return [minDate, maxDate];
            }
        }
    };
</script>
<style lang="less" rel="stylesheet/less" scoped></style>
