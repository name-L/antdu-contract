<template>
    <div class="load-status-manager">
        <ef-loading :is-show="isLoading"></ef-loading>
        <div class="status-no-loading" v-if="!isLoading">
            <div v-if="errorMsg" :class="errorClassName">
                <slot name="error-msg">
                    {{errorMsg}}
                </slot>
            </div>
            <div class="slot-content" v-else>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">
    import efLoading from '../../component-base/loading/ef-loading.vue';

    export default {
        props: {
            isLoading: {
                type: Boolean
            },
            errorMsg: {
                type: String
            },
            errorClassName: {
                type: String,
                default: 'abnormal-message'
            }
        },
        computed: {},
        components: {
            efLoading
        }
    };
</script>

<style lang="less" rel="stylesheet/less">
    .load-status-manager {
        width: 100%;
        height: 100%;
        .status-no-loading {
            width: 100%;
            height: 100%;
            position: relative;
            .slot-content {
                width: 100%;
                height: 100%;
                position: relative;
            }
            .abnormal-message {
                position: absolute;
                font-size: 14px;
                width: 100%;
                line-height: 20px;
                height: 20px;
                top: 0;
                bottom: 0;
                margin: auto;
                text-align: center;
            }
            .top-error-message {
                padding-top: 100px;
                text-align: center;
            }
        }
    }
</style>