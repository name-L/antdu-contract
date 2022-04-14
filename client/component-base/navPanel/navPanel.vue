<template>
    <div class="navPanel" :class="{'open-nav' : openNavigation}" ref="navPanel">
        <div class="open-navigation" @click="handleClick">
            <div class="arrow">
                <div class="double-arrow"></div>
            </div>
        </div>
        <div class="sys-logo">
            <div class="system-title" v-if="openNavigation">{{$t('home.eagboy')}}</div>
            <img class="eagok-logo-img" v-if="showCustomerClientLogo" :src="customerLogoUrl"/>
            <div class="default-logo-img" v-else></div>
        </div>
        <div class="menuNavList" v-if="showSystemNavList">
            <navBtn v-for="(menu,index) in menus"
                    :key="index"
                    :openNavigation="openNavigation"
                    :item="menu">
            </navBtn>
        </div>
        <div class="menuNavList" v-else>
            <manage-nav-btn v-for="(menu,index) in menus"
                            :key="index"
                            :openNavigation="openNavigation"
                            :item="menu"
                            :manageNavActiveName="manageNavActiveName"
                            @nav-btn-click="handleNavBtnClick">
            </manage-nav-btn>
        </div>
        <div class="systemNavList" v-if="showSystemNavList">
            <!--<div class="notice"-->
                 <!--:class="systemOpenType === 'notice'  && isShow  ? 'hover' : ''"-->
                 <!--:title="$t('chat.systemNotice')"-->
                 <!--@click="openLeftPanelClick('notice')">-->
                <!--<i class="iconfont icon-wenjian"></i>-->
                <!--<span class="i-word">{{$t('user.systemAnnouncement')}}</span>-->
                <!--<div v-show="isShowTips" class="system-notice-tips"></div>-->
            <!--</div>-->
            <div class="customer-online"
                 :class="systemOpenType === 'customer' && isShow ? 'hover' : ''"
                 :title="$t('common.customer')"
                 @click="openLeftPanelClick('customer')">
                <i class="iconfont icon-kefu"></i>
                <span class="i-word">{{$t('common.customer')}}</span>
            </div>
            <!--<ef-popover ref="systemCode" target="click" placement="right">-->
                <!--<div class="QR-code-container">-->
                    <!--<img src="../../../asset/image/QR-code.png">-->
                <!--</div>-->
            <!--</ef-popover>-->
            <!--<div class="systemCode" v-popover:systemCode>-->
                <!--<i class="iconfont icon-erweima"></i>-->
                <!--<span class="i-word">{{$t('user.scanQRCode')}}</span>-->
            <!--</div>-->
            <a class="eagok-link" :href="eagokUrl" :title="eagokLinkTip" target="eagok">
                <i class="iconfont icon-yingjiyun"></i>
                <span class="i-word">{{$t('common.eagok')}}</span>
            </a>

            <ef-popover ref="userList" target="click" placement="right">
                <userMenuList :type="userType"
                              :userInfo="getUser">
                </userMenuList>
            </ef-popover>
            <div class="systemUser" v-popover:userList>
                <img v-if="getUser.extendInfo.profileImageId" class="ico head" :src="imgSrc"/>
                <div v-else class="ico default"></div>
                <span class="i-word">{{getUser.nickName}}</span>
            </div>
        </div>
    </div>
</template>

<script type="text/babel">
    // import efPopover from '../popover/ef-popover.vue';
    // import userMenuList from '../user/userMenuList.vue';
    import navBtn from './navBtn.vue';
    import manageNavBtn from './manage-nav-btn.vue';
    import namespace from '../../../utils/namespace-utils';
    import { mapGetters } from 'vuex';
    // import securityUtils from '../../../utils/security-utils';
    import SsoUtils from '@component-util/sso-login/lib/sso-utils-es6';
    // import events from '../../../mixins/events';
    // import eventBus from '../../../utils/event-bus';

    export default {
        props: {
            menus: Array,
            systemOpenType: String,
            isShow: Boolean,
            isShowTips: Boolean,
            showSystemNavList: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                selfImgBase64: '',
                system: [
                    {
                        name: 'systemSign',
                        type: 'sign',
                        isSign: false
                    },
                    {
                        className: 'systemSetting',
                        type: 'setting',
                        isSign: false
                    },
                    {
                        className: 'androidScanCodeWrap',
                        type: 'androidCode',
                        isSign: false
                    },
                    {
                        className: 'systemUser',
                        type: 'user',
                        isSign: false
                    }
                ],
                notifyPopup: 0,
                userType: 'user',
                systemType: 'system',
                customerLogoUrl: '',
                showCustomerClientLogo: window.data.showCustomerClientLogo,
                eagokUrl: SsoUtils.getSsoHomeUrl(window.data.cfg),
                openNavigation: false,
                manageNavActiveName: 'accountDevelopment'
            };
        },
        components: {
            // efPopover,
            // userMenuList,
            navBtn,
            manageNavBtn
        },
        computed: {
            ...mapGetters(namespace.user, [
                'getUser'
            ]),
            imgSrc () {
                if (this.getUser.extendInfo.profileImageId.length) {
                    return `${window.Util.ctxPath}/image?image_id=${this.getUser.extendInfo.profileImageId}`;
                }
            },
            eagokLinkTip () {
                // let user = securityUtils.getCurrentUser();
                // return user.display_name.length ? user.display_name : this.$t('common.eagok');
            }
        },
        watch: {
            'openNavigation' () {
                this.$emit('open-navigation', this.openNavigation);
            }
        },
        mounted () {
            this.initGetLogoUrl();
            document.addEventListener('click', (e) => {
                if (this.$refs.navPanel) {
                    if (e.clientX > this.$refs.navPanel.getBoundingClientRect().right) {
                        this.openNavigation = false;
                    }
                }
            });
        },
        methods: {
            initGetLogoUrl () {
                // let userInfo = securityUtils.getCurrentUser();
                // let logoUpdateTime = userInfo.logo_update_time;
                // let userId = userInfo.userId;
                // this.customerLogoUrl = `${window.Util.ctxPath}/user/get-customer-client-logo?_=${logoUpdateTime}&userId=${userId}`;
            },
            openLeftPanelClick (type) {
                this.$emit('open-left-panel', type);
            },
            handleClick () {
                this.openNavigation = !this.openNavigation;
            },
            handleNavBtnClick (name) {
                this.manageNavActiveName = name;
                this.$emit('change-manage-nav', name);
            }
        }
        // mixins: [events],
        // events: {
        //     [eventBus.MessageConstants.trainer.OPEN_ACCOUNT_MANAGE]: function (data) {
        //         this.manageNavActiveName = data;
        //     }
        // }
    };
</script>

<style lang="less" rel="stylesheet/less" src="./less/navPanel.less"></style>
