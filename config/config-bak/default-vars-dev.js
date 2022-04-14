/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 应用的配置文件 -- 可变部分（dev）
 * Created by wuyaoqian on 16/11/17.
 */

module.exports = {
    url: {
        // 本项目基础地址前缀
        // ( 注意1：如果 micro 中未定义自身的 mock, 则会自动使用 url.base.mock 代替 )
        // ( 注意2：mode 有三个值，'real', 'mock', 'auto' )
        base: {
            'real': 'https://test.antfact.com/eageye/v4',
            'mock': 'http://localhost:10086/asimov/v1',
            'mode': 'auto'
        },
        // 本项目使用到的其它微服务的地址前缀
        // ( 注意1：如果 mock 缺省，则会自动使用 url.base.mock 值 ）
        // ( 注意2：格式可以是 string, object, array 其中之一 )
        // ( 注意3：微服务这里的 mode 只有当 url.base.mode === 'auto' 时才会生效，否则由 url.base.mode 统一进行控制 )
        micro: {
            'authToken': 'https://antfact.com/auth2_test/authz',
            'authCertify': ['https://antfact.com/auth2_test/authc', 'http://127.0.0.1:10086/auth-c-mock', 'auto'],
            'authResource': {
                'real': 'https://antfact.com/auth2_test/rs',
                'mock': 'http://127.0.0.1:10086/auth-rs-mock',
                'mode': 'auto'
            },
            'contract': 'http://10.20.2.123:8088',

            'contractNew': 'http://10.20.2.123:7088',
        }
    },
    oauth: {
        'appKey': '36v8tudu9Z32qntijdn3kvmHM2UY4DwaUp0EBa1sCPx',
        'appSecret': '026VZb2Bq4Vbc5r0nsHgV9Te'
    },
    microWebapp: {
        store: {},
        apollo: {
            // # 配置管理（本地 hosts 需映射）
            // 10.20.1.45 proconfig.antducloud.com
            // 10.20.1.45 devconfig.antducloud.com
            // 10.20.1.45 uatconfig.antducloud.com
            // 10.20.1.45 config.antducloud.com
            serverUrl: ['http://devconfig.antducloud.com'],
            appId: 'demo-mw-cfg'
        }
    },
    system: {
        'zpkin': {
            maxTracerCount: 1,
            zipkinUrl: 'http://auditlogcollector.antfact.com'
        },
        'elapseLogMinTime': 0,
        'sdkRestTimeout': 1000 * 60 * 2,
        'show-build-time': true,
        'env': 'production',
        'caster': {
            groupConfig: {
                'name': 'caster-auth2',
                'password': 'caster-auth2'
            },
            networkConfig: {
                'addresses': [{
                    host: 'p-caster-test1',
                    port: 5732
                }]
            }
        },
        'role': {
            ROLE_REDEFINE: {
                'ROLE_QUERYJWDOCUMENT': false,
                'ROLE_ONLINE_PROXY': false
            }
        },
        'global': {
            'cdn': '',
            'ctx_path': '',
            'cfg_name': 'dev'
        },
        'local': {},
        'session': {},
        'ssoUrl': 'https://dev.eagok.com/auth',
        'ssoOrigin': 'https://dev.eagok.com/auth'
    }
};
