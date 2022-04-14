<template>
    <div class="aside">
        <div class="title">
            <span class="logo"></span>
            <span class="title-content">{{ $t('main.home.title') }}</span>
        </div>
        <div class="aside-content">
            <side-nav ref="nav" class="nav-content" :opt="nav.opt" :data="nav.data" />
        </div>
        <div class="foot-content">
            <div class="user">
                <div class="user-content" @click.stop="logOut">
                    <i></i>
                    <span>{{ $t('main.home.user') }}</span>
                </div>
            </div>
            <div class="tool" @click.stop="toolDownload">
                <div class="tool-content">
                    <span>{{ $t('main.home.dataDownloadTool') }}</span>
                    <i></i>
                </div>
            </div>
            <div class="quit" v-if="quitBuff">
                <span class="quit-button" @click="handleQuit">
                    <img class="quit-img" src="../../asset/image/theme-quit.png" alt="" /> 退出登录</span
                >
            </div>
            <div class="downloadTool" v-if="downloadBuff">
                <div class="button-group">
                    <div class="windows-button" @click="downTool('windows')">
                        <i></i>
                        <span>{{ $t('main.home.windows') }}</span>
                    </div>
                    <div class="mac-button" @click="downTool('mac')">
                        <i></i>
                        <span>{{ $t('main.home.mac') }}</span>
                    </div>
                    <div class="linux-button" @click="downTool('linux')">
                        <i></i>
                        <span>{{ $t('main.home.linux') }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">
import SideNav from '../../component-widget/side-nav/nav-main.vue';
export default {
    props: {
        menus: {
            type: Array,
            default () {
                return [];
            }
        },
        nav: {
            type: Object,
            default () {
                return {};
            }
        },
        button: {
            type: Object,
            default () {
                return {};
            }
        }
    },
    data () {
        return {
            quitBuff: false, // 控制退出
            downloadBuff: false // 控制下载工具
        };
    },
    created () {},
    watch: {},
    components: {
        SideNav
    },
    mounted () {
        this.clickFN = e => {
            if (!this.$el.contains(e.target)) {
                this.quitBuff = false;
                this.downloadBuff = false;
            } else {
                if (this.quitBuff) {
                    this.quitBuff = false;
                }
                if (this.downloadBuff) {
                    this.downloadBuff = false;
                }
            }
        };
        document.addEventListener('click', this.clickFN);
    },
    computed: {},
    methods: {
        inactiveAll () {
            this.$emit('inactiveAll');
        },
        // 添加新的主题
        addNewTheme () {
            this.addNewThemeStatus(true);
        },
        toolDownload () {
            // window.location.href = 'https://yss.antdu.com/app/pc/latest';
            // 暂时注释
            if (this.downloadBuff) {
                this.downloadBuff = false;
            } else {
                this.downloadBuff = true;
            }
            this.quitBuff = false;
        },
        // 退出
        logOut () {
            if (this.quitBuff) {
                this.quitBuff = false;
            } else {
                this.quitBuff = true;
            }
            this.downloadBuff = false;
        },
        // 下载对应设备的工具
        downTool (type) {
            switch (type) {
            case 'windows':
                window.location.href = 'https://yss.antdu.com/app/pc/latest';
                break;
            case 'mac':
                break;
            case 'linux':
                break;
            default:
                break;
            }
        },
        handleQuit () {
            window.location.href = '/logout';
            this.quitBuff = false;
        }
    },
    beforeDestroy () {},
    destroyed () {
        document.removeEventListener('click', this.clickFN);
    }
};
</script>

<style lang="less" rel="stylesheet/less" src="./less/aside.less">
</style>