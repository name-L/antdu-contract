<template>
    <div class="data-report-box">
        <div class="select">
            <span>统计类型</span>
            <el-select v-model="value"
                @change="handleChange"
                placeholder="请选择">
                    <el-option
                        v-for="item in options"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value">
                    </el-option>
            </el-select>
        </div>
        <router-view></router-view>
        <!-- <department-data-picture>
        </department-data-picture> -->
    </div>
</template>

<script>
import departmentDataPicture from './department-data-picture/department-data-picture.vue';
export default {
    data () {
        return {
            options: [{
                value: '/datareport/department',
                label: '按部门分类统计'
            }, {
                value: '/datareport/region',
                label: '按地域分类统计'
            }],
            value: '按部门分类统计'
        };
    },
    components: {
        departmentDataPicture
    },
    methods: {
        handleChange (val) {
            this.$router.push(val);
            console.log(val);
        }
    }
};
</script>

<style lang="less" scoped src="./data-report.less">
    
</style>