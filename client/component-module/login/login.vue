<template>
    <div :class="['wrapper', { v: show }]">
        <!-- <div class="log">
            <div class="img"></div>
            <span class="label">{{$t('main.login.antUpTree')}}</span>
        </div> -->
        <div class="image">
            <img src="../../asset/image/login/left.png" alt="">
        </div>
        <div class="box">
            <div class="title">
                <div class="img"></div>
                <span class="label">{{$t('main.login.antUpTree')}}</span>
            </div>
            <div class="form-content">
                <span class="input-item">{{$t('main.login.userName')}}</span>
                <input id="username" ref="username" name="username" maxlength="100" v-model.trim="form.username" />
                <span class="input-item">{{$t('main.login.password')}}</span>
                <input
                    placeholder="密码"
                    id="password_v"
                    ref="password_v"
                    type="password"
                    maxlength="20"
                    v-model.trim="form.password_v"
                    class="password"
                    @keyup="handleEventCode"
                />
                <input id="password" name="password" type="hidden" :value="form.password" />
                <div class="yzm" v-show="captcha.src">验证码</div>
                <div class="captcha" v-show="captcha.src">
                    <input
                        placeholder="验证码"
                        id="captcha"
                        ref="captcha"
                        maxlength="4"
                        name="captcha"
                        v-model.trim="form.captcha"
                    />
                    <a
                        href="javascript:void('refresh')"
                        @click="refreshCaptcha()"
                        :class="{ processing: captcha.processing, erring: captcha.has_error }"
                    >
                        <loading-circle loaderClass="loading" v-if="captchaIsLoading"></loading-circle>
                        <div class="error-tip">{{ captcha.error_msg }}</div>
                        <img
                            @load="captchaLoadedSuccess"
                            @error="captchaLoadedError"
                            :src="captcha.src"
                            @click="handleCaptchaClick"
                            v-if="!captchaIsLoading"
                        />
                    </a>
                </div>
                <div :class="['error', error && type ? type : '']" v-show="error">{{ error }}</div>
                <button :class="['login', { processing: form.processing,'no-top':captcha.src }]" @click="submit" type="submit">
                    {{ form.processing ?$t('main.login.loggingIn'):$t('main.login.login')}}
                </button>
            </div>
        </div>
        <!-- <div class="foot">
            <span class="content">Copyright © 蚁坊软件</span>
        </div> -->
    </div>
</template>
<style lang="less" rel="stylesheet/less" src="./login.less"></style>
<script type="text/babel">
import md5 from '@component-util/md5';
import LoadingCircle from '../../component-base/loading/loading-circle.vue';

// let buildRefreshCaptchaUrl;
export default {
    props: {
        opt: Object
    },
    data () {
        return {
            ctxPath: window.Util.ctxPath,
            show: true,
            captcha: {
                src: this.opt.captcha || '',
                processing: false,
                has_error: false,
                error_msg: '点击刷新'
            },
            captchaIsLoading: false,
            captchaWidth: 144,
            captchaHeight: 42,
            form: {
                processing: false,
                login_label: this.$t('main.login.login'),
                login_normal_label: this.$t('main.login.login'),
                login_processing_label: this.$t('main.login.loggingIn'),
                url: this.opt.url || '', // encodeUrl
                username: window.localStorage.getItem('username') || '',
                action: `${window.Util.ctxPath}/user-login`,
                captcha: '',
                password: '',
                password_v: ''
            },
            error: this.opt.error || '',
            type: this.opt.type || 'username',
            languages: [
                {
                    title: '简体中文',
                    value: 'zh_cn',
                    isActive: false
                },
                {
                    title: 'English',
                    value: 'en',
                    isActive: false
                }
            ]
        };
    },
    components: {
        LoadingCircle
    },
    computed: {
        isShowI18n () {
            return window.data.config ? window.data.config.showI18n : true;
        }
    },
    methods: {
        // /**
        //      * 设置界面语言
        //      */
        // setLanguage () {
        //     this.languages.forEach((item) => {
        //         item.isActive = item.value === this.$i18n.locale;
        //     });
        captchaLoadedSuccess () {
            if (this.form.password) {
                document.getElementById('captcha').focus();
            } else {
                document.getElementById('password_v').focus();
            }
            this.captcha.processing = false;
        },
        captchaLoadedError () {
            this.captcha.processing = false;
            this.captcha.has_error = true;
        },
        refreshCaptcha () {
            if (this.captcha.processing) {
                return;
            }
            this.captcha.has_error = false;
            this.captcha.processing = true;
            // this.captcha.src = buildRefreshCaptchaUrl();
        },
        handleCaptchaClick (e) {
            if (this.captchaIsLoading) {
                return;
            }
            this.captchaIsLoading = true;
            this.$http
                .get(`${window.Util.ctxPath}/login-captcha?width=${this.captchaWidth}&height=${this.captchaHeight}`)
                .then(ret => {
                    if (ret.body.success) {
                        this.imageData = ret.body.imageData ? 'data:image/png;base64,' + ret.body.imageData.data : '';
                        this.isShowCaptcha = this.isShowCaptcha || !!this.imageData;
                    } else {
                        if (ret.body.error) {
                            this.captchaError = ret.body.error.msg;
                            this.errorType = 'captcha';
                        }
                    }
                    this.captchaIsLoading = false;
                });
        },
        submit (e) {
            if (this.form.processing) {
                return e.preventDefault();
            }
            if (!this.form.username) {
                document.getElementById('username').focus();
                return e.preventDefault();
            } else {
                window.localStorage.setItem('username', this.form.username);
            }
            if (!this.form.password_v) {
                document.getElementById('password_v').focus();
                return e.preventDefault();
            }
            if (this.captcha.src && !this.form.captcha) {
                document.getElementById('captcha').focus();
                return e.preventDefault();
            }
            this.form.processing = true;
            this.form.login_label = this.form.login_processing_label;
            // this.$refs.captcha.setAttribute('disabled', 'disabled');
            this.$http
                .post(`${window.Util.ctxPath}/user-login`, {
                    username: this.form.username.trim(),
                    password: this.form.password,
                    captchaVal: this.form.captcha.trim()
                })
                .then(ret => {
                    this.handleLoginSuccess(ret);
                })
                .catch(() => {
                    this.handleLoginError();
                });
        },
        /**
         * 登录成功处理
         * @param ret
         */
        handleLoginSuccess (ret) {
            if (ret.body.success) {
                let location = window.location;
                window.location.href = location.origin + `${window.Util.ctxPath}` + '/';
                let authorityId = ret.body.data.roles.includes('PERMISSION_APIS');
                window.localStorage.setItem('PERMISSION_APIS', window.btoa(window.encodeURIComponent(!!authorityId)));
                // this.bus.$emit('handleAuthority', authorityId);
            } else {
                this.error = ret.body.error ? ret.body.error.errorDescription : null;
                this.captcha.src = ret.body.imageData ? 'data:image/png;base64,' + ret.body.imageData : '';
                this.form.processing = false;
                this.form.login_label = this.form.login_normal_label;
                this.captcha.processing = false;
                this.captcha.error_msg = '';
                this.captcha.has_error = false;
            }
        },
        /**
         * 登录失败处理
         */
        handleLoginError () {
            this.error = this.$t('login.systemWrong');
            this.form.processing = false;
        },
        // 对键值进行设置
        handleEventCode (e) {
            let evt = e || window.event;
            if (evt.code === 'Enter') {
                this.submit();
            }
        }
    },
    watch: {
        'form.password_v' (value) {
            this.form.password = value ? md5(value) : '';
        }
    },
    mounted () {},
    beforeCreate () {},
    created () {
        console.log('init-data: ', this.opt);
        // if (this.isShowI18n) {
        //     this.setLanguage();
        // }
    }
};
</script>