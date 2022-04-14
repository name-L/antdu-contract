<template>
    <div class="input-search-box">
        <div class="title">{{title}}</div>
        <el-input
            v-if="!time"
            :style="'width:' + width + 'px'"
            :placeholder="placeholder"
            v-model="value"
            @change="handleInputChange"
            :suffix-icon="icon"
            clearable>
        </el-input>
        <el-date-picker
            v-else
            :style="'width:' + width + 'px'"
            v-model="value"
            @change="handleInputChange"
            type="date"
            :picker-options="pickerOptions"
            :placeholder="placeholder">
        </el-date-picker>
    </div>
</template>

<script>
export default {
    props: {
        // 顶部标题
        title: {
            type: String,
            default: ''
        },
        // 宽度
        width: {
            type: Number,
            default: 274
        },
        // icon图标
        icon: {
            type: String,
            default: ''
        },
        // v-model
        model: {
            type: Number | String
        },
        // 搜索提示
        placeholder: {
            type: String,
            default: ''
        },
        // 控制显示日期选择 ,不然默认显示输入框
        time: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            value: '',
            pickerOptions: {
                disabledDate (time) {
                    return time.getTime() > Date.now();
                }
            }
        };
    },
    mounted () {
    },
    watch: {
        model () {
            this.value = this.model;
        }
    },
    methods: {
        // 输入框change事件
        handleInputChange () {
            this.$emit('handleInputChange', {
                val: this.value,
                type: this.title
            });
        }
    }
};
</script>
<style lang="less">
    .input-search-box{
        // width: 274px;
        // margin-right: 16px;
        .title{
            font-size: 14px;
            color: #29313e;
        }
        .el-date-editor> .el-input__prefix{
            right: 5px;
            left: auto;
        }
        .el-date-editor> .el-input__suffix{
            right: 24px;
        }
        .el-date-editor>.el-input__inner{
            padding-left: 15px;
        }
    }
</style>