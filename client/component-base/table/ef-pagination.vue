<template>
  <ul class="ef-pagination">
    <li class="ef-pagination-prev" @click="handlePrevClick">
      <i class="iconfont"><</i>
    </li>
    <template v-if="isSimple">
      <li class="ef-pagination-item"
          :class="{
            'ef-pagination-item-active': currentPage === page
          }"
          v-for="page in totalPage"
          @click="handleChangePage(page)">
        {{ page }}
      </li>
    </template>
    <template v-else>
      <li class="ef-pagination-item" :class="{ 'ef-pagination-item-active': currentPage === 1 }" @click="handleChangePage(1)">1</li>

      <template v-if="currentPage <= 4">
        <li class="ef-pagination-item"
            :class="{ 'ef-pagination-item-active': currentPage === page }"
            v-for="page in startPageList" @click="handleChangePage(page)">
          {{ page }}
        </li>
        <li class="ef-pagination-item" :class="{ 'ef-pagination-item-active': currentPage === 6 }" v-if="currentPage === 4" @click="handleChangePage(6)">6</li>
        <li class="ef-pagination-item ef-pagination-jump-next" @click="handleJumpNext">...</li>
      </template>

      <template v-else-if="currentPage >= totalPage - 3">
        <li class="ef-pagination-item ef-pagination-jump-prev" @click="handleJumpPrev">...</li>
        <li class="ef-pagination-item" :class="{ 'ef-pagination-item-active': currentPage === totalPage - 5 }" v-if="currentPage === totalPage - 3" @click="handleChangePage(totalPage - 5)">
          {{ totalPage - 5 }}
        </li>
        <li class="ef-pagination-item" v-for="page in endPageList"
            :class="{ 'ef-pagination-item-active': currentPage === totalPage - page }"
            @click="handleChangePage(totalPage - page )">{{ totalPage - page }}
        </li>
      </template>

      <template v-else>
        <li class="ef-pagination-item ef-pagination-jump-prev" @click="handleJumpPrev">...</li>
        <li class="ef-pagination-item" @click="handleChangePage(currentPage - 2)">{{ currentPage - 2 }}</li>
        <li class="ef-pagination-item" @click="handleChangePage(currentPage - 1)">{{ currentPage - 1 }}</li>
        <li class="ef-pagination-item ef-pagination-item-active" @click="handleChangePage(currentPage)">{{ currentPage }}</li>
        <li class="ef-pagination-item" @click="handleChangePage(currentPage + 1)">{{ currentPage + 1 }}</li>
        <li class="ef-pagination-item" @click="handleChangePage(currentPage + 2)">{{ currentPage + 2 }}</li>
        <li class="ef-pagination-item ef-pagination-jump-next" @click="handleJumpNext">...</li>
      </template>

      <li class="ef-pagination-item" :class="{ 'ef-pagination-item-active': currentPage === totalPage }" @click="handleChangePage(totalPage)">{{ totalPage }}</li>

    </template>

    <li class="ef-pagination-next" @click="handleNextClick">
      <i class="iconfont">></i>
    </li>
  </ul>
</template>

<script type="text/babel">
  export default {
      name: 'ef-pagination',
      props: {
      // 总数
          total: {
              type: Number,
              default: 1
          },
          // 当前页数
          pageNumber: {
              type: Number,
              default: 1
          },
          // 每页大小
          pageSize: {
              type: Number,
              default: 10
          },
          // 是否可以更改页数
          canChange: {
              type: Boolean,
              default: true
          }
      },
      data () {
          return {
              // 当前页
              currentPage: this.pageNumber,
              // 当前页小于等于4时，显示分页按钮数组
              startPageList: [2, 3, 4, 5],
              // 当前页大于等于totalPage-3时，显示分页按钮数组
              endPageList: [4, 3, 2, 1]
          };
      },
      computed: {
      // 总页数
          totalPage () {
              const num = Math.ceil(this.total / this.pageSize);
              return (num === 0) ? 1 : num;
          },
          // 是否为简单分页
          isSimple () {
              return this.totalPage < 10;
          }
      },
      components: {},
      mounted () {},
      watch: {
          pageNumber (newVal) {
              this.currentPage = newVal;
          }
      },
      methods: {
          handleChangePage (page) {
              if (!this.canChange) return;
              if (this.currentPage !== page) {
                  this.currentPage = page;
                  this.emitPageChange();
              }
          },
          handlePrevClick () {
              if (!this.canChange) return;
              if (this.currentPage > 1) {
                  this.currentPage -= 1;
                  this.emitPageChange();
              }
          },
          handleNextClick () {
              if (!this.canChange) return;
              if (this.currentPage < this.totalPage) {
                  this.currentPage += 1;
                  this.emitPageChange();
              }
          },
          handleJumpPrev () {
              if (!this.canChange) return;
              this.currentPage -= 5;
              if (this.currentPage < 1) {
                  this.currentPage = 1;
              }
              this.emitPageChange();
          },
          handleJumpNext () {
              if (!this.canChange) return;
              this.currentPage += 5;
              if (this.currentPage > this.totalPage) {
                  this.currentPage = this.totalPage;
              }
              this.emitPageChange();
          },
          emitPageChange () {
              this.$emit('on-change', this.currentPage);
          }
      }
  };
</script>

<style lang="less" rel="stylesheet/less">
  @import './less/ef-pagination.less';
</style>


