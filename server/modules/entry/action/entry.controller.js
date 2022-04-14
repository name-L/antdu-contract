/**
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 入口页控制器
 * Created by {wuyaoqian} on 2016/12/01.
 */

import LocalUtil from 'data-sdk-util/lib/local-util';
import EntryUtil from '../../common/util/tpl-render-util';
import UserService from '../../user/service/user.rest.js';
import MWUtil from '../../../util/mw.util.js';
import {
    system as sysConfig,
    oauth as authConfig
} from 'config';

const getDefaultThemeName = function (req) {
    return 'white';
};

export default {
    // 默认首页
    index: function indexHandler (req, res, next) {
        let lang = LocalUtil.getLangStr(req);
        let roles = req.session.user ? req.session.user.roles : null;
        let theme = getDefaultThemeName(req);
        MWUtil.mwEntry.getEntryListAsync({
            lang,
            theme
        }, roles).then((scriptList) => {
            EntryUtil.render(req, res, req.ROUTE_CONFIG.filename, {
                title: LocalUtil.getLangObj(lang, '_server_')['title-home'],
                name: 'index',
                theme: theme,
                lang: lang,
                data: {
                    title: 'Home'
                },
                cacheControlMaxAge: 0,
                asyncScriptList: scriptList
            });
        });
    },
    // 登录页（正常）
    loginWithNormal: function normalLoginHandler (req, res) {
        if (req.session.user) {
            return res.redirect(`${global.ctx_path || '/'}`);
        }

        let _render = function () {
            let lang = LocalUtil.getLangStr(req);
            EntryUtil.render(req, res, req.ROUTE_CONFIG.filename, {
                keywords: 'vuejs,nodejs,frontend',
                description: 'this is demo project',
                title: '合同监测',
                name: 'login',
                browserCheck: {
                    theme: 'white',
                    resize: true
                },
                lang: lang,
                data: {
                    sso: {
                        origin: sysConfig.ssoOrigin,
                        cid: authConfig.appKey
                    }
                }
            });
        };
        _render();
        // UserService.fetchLoginCaptcha(req, res, null).on('success', function (data) {
        //     if (data && data.data && typeof data.data === 'string') {
        //         EntryUtil.setRenderData(req, {
        //             captcha: 'data:image/jpg;base64,' + data.data
        //         });
        //     }
        //     _render();
        // }).on('error', function (errorCodeDesc) {
        //     _render();
        // });
    },
    // 登录页 (隐藏 SSO)
    loginWithHideSSO: function hideSSOLoginHandler (req, res, next) {
        // 已登录
        if (req.session.user) {
            return res.redirect(`${global.ctx_path || '/'}`);
        }
        // 尝试 ticket 登录
        let ticket = req.query['t'];
        if (typeof ticket === 'string' && ticket.length) {
            return UserService.loginByTicket(req, res, ticket).on('success', function (user) {
                req.session.user = user;
                res.redirect(`${global.ctx_path || '/'}`);
            }).on('error', function (errorCodeDesc) {
                next(new Error(JSON.stringify(errorCodeDesc.desc)));
                // res.redirect(req.path);
            });
        }
        let lang = LocalUtil.getLangStr(req);
        // 未登录，返回 sso 登录页面
        EntryUtil.render(req, res, req.ROUTE_CONFIG.filename, {
            keywords: 'vuejs,nodejs,frontend',
            description: 'this is demo project',
            title: '登录页(HideSSO)',
            name: 'login',
            browserCheck: {
                theme: 'white',
                resize: true
            },
            lang: lang,
            data: {
                sso: {
                    origin: sysConfig.ssoOrigin,
                    cid: authConfig.appKey
                }
            }
        });
    },
    // 登录页（显示 SSO）
    loginWithVisibleSSO: function visibleSSOLoginHandler (req, res, next) {
        // 已登录
        if (req.session.user) {
            return res.redirect(`${global.ctx_path || '/'}` + (req._parsedUrl.search || ''));
        }
        // 尝试 ticket 登录
        let ticket = req.query['t'];
        if (typeof ticket === 'string' && ticket.length) {
            return UserService.loginByTicket(req, res, ticket).on('success', function (user) {
                req.session.user = user;
                res.redirect(
                    `${global.ctx_path || '/'}` + (req._parsedUrl.search || '')
                        .replace(/(t|cfg)=[^&]+(&|$)/g, '')
                        .replace(/[?$]$/, '')
                );
            }).on('error', function (errorCodeDesc) {
                next(new Error(JSON.stringify(errorCodeDesc.desc)));
                // res.redirect(req.path);
            });
        }
        // 未登录，重定向到 sso 登录页面
        let url = (
            (req.get('x-real-proto') || req.get('x-forwarded-proto') || req.protocol) + '://' +
            req.get('host') + req.path + (req._parsedUrl.search || '')
        );
        res.redirect(
            sysConfig.ssoUrl +
            '?url=' + encodeURIComponent(url) +
            '&cid=' + authConfig.appKey +
            '&lang=' + LocalUtil.getLangStr(req)
        );
    }

};
