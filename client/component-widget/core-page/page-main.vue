<template>
    <main :class="opt.classes">
        <transition name="page" mode="out-in">
            <keep-alive :exclude="['page']">
                <page v-for="(page, index) in pages"
                      v-if="currActivedPageKey === page.key"
                      :key="page.key"
                      :page="page"
                      :index="index"/>
            </keep-alive>
        </transition>
    </main>
</template>

<script>
    import Page from './page-item.vue';

    export default {
        props: {
            opt: {
                type: Object
            },
            pages: {
                type: Array
            }
        },
        data () {
            return {
                currActivedPageKey: null
            };
        },
        methods: {
            switchPage (key) {
                this.bus.$emit('name', key);
                this.currActivedPageKey = key;
            }
        },
        components: {
            Page
        },
        beforeMount () {
            this.currActivedPageKey = this.pages.length ? this.pages[0].key : null;
        }
    };
</script>

<style lang="less" rel="stylesheet/less" src="./page.less"></style>