<template>
    <div class="title" :class="{'is-active':isShow, 'showSelectedConditions':selectedList }">
        <div class="error-msg" v-if="errorMsg">{{errorMsg}}</div>
        <efLoading v-else-if="loading"></efLoading>
        <el-table
            ref="table"
            v-else
            :data="dataList"
            height="100%"
            stripe
            size="medium"
            style="width: 100%">
            <el-table-column
            prop="signingDate"
            :label="$t('main.home.signingTime')"
            sortable
            :show-overflow-tooltip="true"
            min-width="9%">
            <template slot-scope="scope">
                <span>{{getTime(scope.row.signingDate)}}</span>
            </template>
            </el-table-column>
            <el-table-column
            prop="department"
            :label="$t('main.home.department')"
            :show-overflow-tooltip="true"
            min-width="6%">
            </el-table-column>
            <el-table-column
            prop="partyA"
            :label="$t('main.home.partyA')"
            :show-overflow-tooltip="true"
            min-width="10%">
            </el-table-column>
            <el-table-column
            prop="partyAArea"
            :label="$t('main.home.partyAArea')"
            :show-overflow-tooltip="true"
            min-width="10%">
            </el-table-column>
            <el-table-column
            prop="partyB"
            :label="$t('main.home.partyB')"
            :show-overflow-tooltip="true"
            min-width="10%">
            </el-table-column>
            <el-table-column
            prop="partyBArea"
            :label="$t('main.home.partyBArea')"
            :show-overflow-tooltip="true"
            min-width="10%">
            </el-table-column>
            <el-table-column
            prop="contractNum"
            :label="$t('main.home.contractNum')"
            :show-overflow-tooltip="true"
            min-width="10%">
            </el-table-column>
            <el-table-column
            prop="amount"
            :label="$t('main.home.amount')"
            :show-overflow-tooltip="true"
            min-width="7%">
            <template slot-scope="scope">
                <div class="amount">
                    <span>{{setAmount(scope.row.amount)}}</span>
                </div>
            </template>
            </el-table-column>
            <el-table-column type="expand" width="20">
                <template slot-scope="props">
                    <el-form label-position="left" inline class="demo-table-expand">
                        <!-- <el-form-item label="商品名称"> -->
                        <el-form-item>
                            <span>{{ props.row.content }}</span>
                        </el-form-item>
                        <el-form-item v-if="props.$index === index">
                            <span>{{ props.row.zhTranslation }}</span>
                        </el-form-item>
                        <!-- <button class="translate">翻译</button> -->
                        <el-button type="primary" @click="getTranslate(props.$index)" v-else>{{$t('main.home.translate')}}</el-button>
                    </el-form>
                </template>
            </el-table-column>
            <el-table-column
            :label="$t('main.home.operate')"
            min-width="12%">
             <template slot-scope="scope">
                 <!-- <i class="el-icon-arrow-down"></i> -->
                <span
                    @click="handleEdit(scope.$index, scope.row)">
                    {{$t('main.home.viewContractContent')}}
                </span>
                <a :href="scope.row.url" target="_blank">{{$t('main.home.original')}}</a>
            </template>
            </el-table-column>
        </el-table>
        <div class="end load" v-if="regularLoading">{{this.$t('main.home.loading')}}</div>
        <div class="end" v-if="isBottomComplete">{{this.$t('main.home.comingSoon')}}</div>
    </div>
</template>

<script>
import moment from 'moment';
import efLoading from '../../component-base/loading/ef-loading.vue';
import { appMapState } from '@APP_VUEX';
export default {
    props: {
        dataList: {
            type: Array,
            default: () => []
        },
        regularLoading: {
            type: Boolean
        },
        isBottomComplete: {
            type: Boolean
        },
        errorMsg: {
            type: String
        },
        loading: {
            type: Boolean
        },
        selectedObj: {
            type: Object
        }
    },
    data () {
        return {
            index: ''
        };
    },
    computed: {
        // 用于对已选条件存在的body高度进行处理
        selectedList () {
            let list = [];
            Object.values(this.selectedObj).forEach(val => {
                if (val !== '') {
                    list.push(val);
                }
            });
            if (list.length === 1 && this.selectedObj.content) {
                list = [];
            }
            return list.length > 0;
        },
        ...appMapState('home', ['isShow'])
    },
    components: {
        efLoading
    },
    watch: {
        dataList: {
            handler (newName, oldName) {
                let timer = new Date().getTime();
                for (var i = 0; i < this.dataList.length; i++) {
                    if (this.dataList[i].signingDate > timer) {
                        this.dataList.splice(i, 1);
                    }
                    return this.dataList;
                }
            },
            deep: true,
            immediate: true
        }
    },
    mounted () {
        console.log(this.dataList);
    },
    methods: {
        getTime (time) {
            return moment(time).format('YYYY-MM-DD');
        },
        // 自定义点击展开折叠
        handleEdit (index, row) {
            let $table = this.$refs.table;
            this.dataList.forEach(item => {
                if (row.id !== item.id) {
                    item.show = false;
                    $table.toggleRowExpansion(item, false);
                } else if (row.id === item.id) {
                    item.show = !item.show;
                }
            });
            $table.toggleRowExpansion(row);
        },
        getTranslate (index) {
            this.index = index;
        },
        // 金额转换
        setAmount (amount) {
            return String(amount).replace(/\d{1,3}(?=(\d{3})+$)/g, function (s) {
                return s + ',';
            });
        }
    }

};
</script>

<style lang="scss" scoped src="./table.less">
</style>
