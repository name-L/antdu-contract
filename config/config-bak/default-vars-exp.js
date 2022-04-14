/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 应用的配置文件 -- 可变部分（exp）
 * Created by wuyaoqian on 16/11/17.
 */

module.exports = {
    url: {
        base: {
            'real': 'https://test.antfact.com/eageye/v4',
            'mock': 'http://localhost:10086/asimov/v1',
            'mode': 'real'
        },
        micro: {
            'authToken': 'https://antfact.com/auth2/authz',
            'authCertify': 'https://antfact.com/auth2/authc',
            'authResource': 'https://antfact.com/auth2/rs',
            'contract': 'http://10.20.2.123:8088',

            'contractNew': 'http://10.20.2.123:7088',
        }
    },
    oauth: {
        'appKey': '3E6570bKX4okbBT10TANVohs',
        'appSecret': '349lUwapX54MbjA0wM5q0ZiS'
    },
    microWebapp: {
        store: {},
        apollo: {
            serverUrl: ['http://uatconfig.antducloud.com'],
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
                'name': 'caster-eefung-session',
                'password': 'caster-eefung-session'
            },
            networkConfig: {
                'addresses': [{
                    host: 'p-caster01',
                    port: 5762
                }, {
                    host: 'p-caster02',
                    port: 5762
                }, {
                    host: 'p-caster03',
                    port: 5762
                }, {
                    host: 'p-caster04',
                    port: 5762
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
            'cfg_name': 'exp'
        },
        'local': {},
        'session': {},
        'ssoUrl': 'https://exp.eagok.com/auth',
        'ssoOrigin': 'https://exp.eagok.com/auth'
    }
};
