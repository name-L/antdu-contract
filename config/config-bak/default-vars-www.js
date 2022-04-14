/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 应用的配置文件 -- 可变部分（www）
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
        'appKey': '34igegdqkn32k1s1eto3HZjPL3ZZ4s1caG1e5IKw2PL',
        'appSecret': '2qoMFGgCd4FZaXD0fyDrwK8H'
    },
    microWebapp: {
        store: {},
        apollo: {
            serverUrl: ['http://proconfig.antducloud.com'],
            appId: 'myss-main-app'
        }
    },
    system: {
        // 'zpkin': {
        //     maxTracerCount: 50,
        //     zipkinUrl: 'http://auditlogcollector.antfact.com'
        // },
        'elapseLogMinTime': 2000,
        'sdkRestTimeout': 1000 * 60 * 2,
        'env': 'production',
        'port': '9091',
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
                'ROLE_WEB_SHOW_REPORT': false
            }
        },
        'global': {
            'cdn': '',
            'ctx_path': '',
            'cfg_name': 'www',
            'log_setting_es_index_name': 'vue-demo'
        },
        'local': {},
        'session': {},
        'ssoUrl': 'https://www.eagok.com/auth'
    }
};
