<template>
    <div class="load-status-manager">
        <div class="loading-circle-panel" v-if="isLoading">
            <ef-loading :size="loadingSize"></ef-loading>
        </div>
        <div class="status-no-loading" v-if="!isLoading">
            <div v-if="errorMsg" :class="errorClassName">
                <slot name="error-msg">
                    <span class="default-error">{{errorMsg}}</span>
                </slot>
            </div>
            <div class="slot-content" v-else>
                <slot></slot>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">
    import efLoading from './ef-loading.vue';

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
                default: 'load-error-container'
            },
            loadingSize: {
                type: String,
                default: 'large'
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
        .loading-circle-panel {
            position: relative;
            width: 100%;
            height: 100%;
        }
        .status-no-loading {
            width: 100%;
            height: 100%;
            position: relative;
            .slot-content {
                width: 100%;
                height: 100%;
                position: relative;
            }
            .load-error-container {
                position: absolute;
                width: 100%;
                line-height: 20px;
                height: 20px;
                top: 0;
                bottom: 0;
                margin: auto;
                text-align: center;
                .default-error {
                    font-size: 14px;
                }
            }
            .top-error-message {
                padding-top: 100px;
                text-align: center;
            }
        }
    }
</style>