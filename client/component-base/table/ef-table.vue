<template>
  <div class="ef-table-wrapper" :class="tableClass">
    <div class="ef-table-content">
      <div class="ef-table-body">
        <table>
          <thead class="ef-table-thead">
            <tr>
              <th
                v-for="(column, index) in columns"
                :key="index"
                :width="column.width + 'px'"
              >
                <span>{{ column.title }}</span>
              </th>
            </tr>
          </thead>
          <tbody class="ef-table-tbody" v-if="!(isNoData || isError)">
            <tr
              v-for="(row, index) in dataSource"
              :key="index"
              :class="{
                active: allowActive && row.isActive,
                'error-tip': row.errorTip,
              }"
              @click="handleClick(row, $event,index)"
              @mouseenter="handleHover(row, $event)"
              ref="gg"
            >
              <td v-for="(column, index) in columns" :key="index" >
                <span :class="column.key === 'index' ? 'index' : ''" >
                  {{ row[column.key] || column.default }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="no-data-tip" v-if="isNoData || isError">
          {{ messageTip }}
        </div>
      </div>
    </div>
    <div class="ef-table-pagination" v-if="pagination">
      <ef-pagination
        :total="pagination.total"
        :page-size="pagination.pageSize"
        :page-number="pagination.pageNumber"
        @on-change="handlePageChange"
      >
      </ef-pagination>
    </div>
    <ef-loading :is-show="loading"></ef-loading>
  </div>
</template>

<script type="text/babel">
import efPagination from './ef-pagination.vue';
import efLoading from '../../common/loading/ef-loading.vue';
import efScrollar from '../../common/scrollar/ef-scrollar.vue';

export default {
    name: 'ef-table',
    props: {
        showView: {
            type: Boolean,
            default: false
        },
        allowActive: {
            type: Boolean,
            default: false
        },
        // title key
        columns: {
            type: Array,
            default: []
        },
        // title key
        dataSource: {
            type: Array,
            default: []
        },
        // 分页 total pageNumber pageSize
        pagination: {
            type: Object
        },
        loading: {
            type: Boolean,
            default: false
        },
        errorMsg: {
            type: String,
            default: ''
        },
        // 是否采用斑马线风格
        stripe: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            viewOffsetWidth: ''
        };
    },
    computed: {
        isNoData () {
            return !this.loading && this.dataSource.length === 0;
        },
        isError () {
            return this.errorMsg !== '';
        },
        messageTip () {
            return this.isError ? this.errorMsg : '暂无数据';
        },
        tableClass () {
            return [
                {
                    'ef-table-stripe': this.stripe
                }
            ];
        },
        thWidth (index) {
            return index === 0 ? '150px' : null;
        }
    },
    components: {
        efPagination,
        efLoading,
        efScrollar
    },
    mounted () {},
    watch: {},
    methods: {
        handleClick (data, event, index) {
            this.$emit('on-row-click', data, index);
        },
        handlePageChange (page) {
            this.$emit('on-change', page);
        },
        handleHover (data, event) {
            this.$emit('on-row-hover', data);
        },
        handleWidth (data) {
            this.viewOffsetWidth = data;
        }
    }
};
</script>

<style lang="less" rel="stylesheet/less">
@import "./less/ef-table.less";
</style>
