<template>
    <div class="box" :style="{borderColor:borderColor}">
        <ul :class="['theme', {processing: theme.changing}]">
            <li class="label"><span>{{$t('main.home.label-theme')}}：</span></li>
            <li :class="['skin', 'white', {selected:theme.value==='white'}]"
                @click="changeTheme('white',null)"><span>{{$t('main.home.white')}}</span>
            </li>
            <li :class="['skin', 'black', {selected:theme.value==='black'}]"
                @click="changeTheme('black',null)"><span>{{$t('main.home.black')}}</span>
            </li>
        </ul>
        <ul :class="['i18n', {processing: local.changing}]">
            <li class="label"><span>{{$t('main.home.label-lang')}}：</span></li>
            <li :class="['lang', 'zh-cn', {selected:local.value==='zh-cn'}]">
                <a @click="changeLocal('zh-cn',null)" href="javascript:void(0)">中文</a>
            </li>
            <li :class="['lang', 'en', {selected:local.value==='en'}]">
                <a @click="changeLocal('en',null)" href="javascript:void(0)">English</a>
            </li>
        </ul>
    </div>
</template>

<style lang="less" rel="stylesheet/less" scoped>

    .box {
        transition: border-color 320ms linear;
        border: 1px solid transparent;
        border-radius: 5px;
        width: 560px;
        height: 320px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    ul {
        top: 50%;
        position: absolute;
        width: 100%;
        transform: translateY(-50%);
        list-style-type: none;
        margin: 0;
        padding: 0;
        &.theme {
            margin-top: -40px;
            li.skin {
                cursor: pointer;
            }
            &.processing li.skin {
                background-color: gray;
                color: #ccc;
                border-color: transparent;
                box-shadow: none;
                cursor: default;
            }
        }
        &.i18n {
            margin-top: 40px;
            li.lang a {
                text-decoration: none;
            }
            &.processing li.lang a {
                color: grey;
            }
        }
        &.processing li {
            font-weight: normal;
            transform: scale(1);
            span, a {
                display: inline-block;
                transform: scale(1);
            }
        }
    }

    li {
        width: 100px;
        height: 50px;
        line-height: 50px;
        border-radius: 5px;
        display: inline-block;
        text-align: center;
        cursor: default;
        border: 1px solid transparent;
        font-weight: normal;
        transition: all 320ms linear;
        span, a {
            transition: all 320ms linear;
        }
        &:last-child {
            margin-left: 10px;
        }
        &.label {
            text-align: right;
            margin-right: 40px;
            width: 140px;
        }
        &.selected {
            border-color: red;
            box-shadow: 0 0 10px 3px red;

            &.lang {
                border-color: transparent;
                box-shadow: none;
                a {
                    color: yellow;
                }
            }

            font-weight: bold;
            transform: scale(1.2);
            span, a {
                display: inline-block;
                transform: scale(1.4);
            }
        }
        &.white {
            background-color: white;
            color: black;
        }
        &.black {
            background-color: black;
            color: white;
        }
        &.lang {
            background-color: transparent;
            a {
                color: lightyellow;
            }
        }
    }
</style>

<script type="text/babel">
    export default {
        data () {
            return {
                borderColor: ''
            };
        },
        theme: {
            jsDataKey: '{{AUTO-DATA-KEY-FOR-SAME-COMPONENT}}',
            jsDataHandler (data, theme) {
                this.borderColor = data.borderColor;
            },
            beforeChangeHandler (theme) { return new Promise((resolve) => { setTimeout(resolve, 1000); }); },
            afterChangeHandler (theme, error) {}
        },
        local: {
            beforeChangeHandler (lang) { return new Promise((resolve) => { setTimeout(resolve, 1500); }); },
            afterChangeHandler (lang, error) {}
        },
        methods: {
            // 以下是另一种回调的实现方式
            // changeLanguage (lang) {
            //     this.changeLocal(lang, {
            //         before (lang) { return new Promise((resolve) => { setTimeout(resolve, 1000); }); },
            //         after (lang, error) {}
            //     });
            // },
            // changeSkin (theme) {
            //     this.changeTheme(theme, {
            //         before (lang) { return new Promise((resolve) => { setTimeout(resolve, 1000); }); },
            //         after (lang, error) {}
            //     });
            // }
        },
        mounted: function () { }
    };
</script>