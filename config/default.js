/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 应用的配置文件 -- 基础部分
 * Created by wuyaoqian on 16/11/17.
 */

const path = require('path');
const extend = require('deep-extend');
const pkg = require('../package.json');
const defaultVars = extend({}, require('./default-vars'));
const preBaseUrl = defaultVars.url.base;
const preMicroUrl = defaultVars.url.micro;
const role = require('./default-roles') || {};

const MockRealUrl = require('./default-mock.js');
const DEFAULT_GLOBAL = (require('./default-global'))(defaultVars.system.global || {});
const I18N_BASEDIR = path.dirname(require.resolve('i18n-resource-base/package.json'));

// 基础前缀
const NORMAL_BASE_REST_URL = MockRealUrl.get(preBaseUrl);
const AUTH_TOKEN_REST_URL = MockRealUrl.get(preMicroUrl.authToken, NORMAL_BASE_REST_URL);
const AUTH_CERTIFY_REST_URL = MockRealUrl.get(preMicroUrl.authCertify, NORMAL_BASE_REST_URL);
const CONTRACT_URL = MockRealUrl.get(preMicroUrl.contract);
const CONTRACT_NEW_URL = MockRealUrl.get(preMicroUrl.contractNew);
// const AUTH_RESOURCE_REST_URL = MockRealUrl.get(preMicroUrl.authResource, NORMAL_BASE_REST_URL);

// 删除无用
delete defaultVars.url;
delete defaultVars.system.global;

const baseConfig = {
    'oauth': {
        // 刷新 token 时，会去检测当前用户或应用的有效性，所以可能会抛出如下强制用户退出的 ErrorCode
        'forceUserOutErrorCodes': ['11021', '11022', '11023', '11024', '11042', '11043', '11045', '11046'],
        'tokenServerUrl': `${AUTH_TOKEN_REST_URL}/token`
    },
    'user': {
        'loginUrl': `${AUTH_CERTIFY_REST_URL}/login`,
        'logoutUrl': `${AUTH_CERTIFY_REST_URL}/sso/logout`,
        'loginByTicketUrl': `${AUTH_CERTIFY_REST_URL}/third_login/login`,
        'loginRefreshCaptcha': `${AUTH_CERTIFY_REST_URL}/captcha/refresh`,
        'userAppConfigUrl': `${NORMAL_BASE_REST_URL}/user/system_conf`
    },
    'contract': {
        'getDataListUrl': `${CONTRACT_URL}/contracts/list`,
        'getSearchUrl': `${CONTRACT_URL}/contracts/search`,
        // 获取列表接口 搜索 新
        'getSearchListUrl': `${CONTRACT_NEW_URL}/contracts/search_new`,
        // 导出筛选类容
        'getExportScreeningContentUrl': `${CONTRACT_NEW_URL}/contracts/export`,
        // 导入合同内容
        'importContractContentUrl': `${CONTRACT_NEW_URL}/contracts/import`,
        /* 
        图表接口
         */
        // 按部门统计
        'getDepartmentStatisticsUrl': `${CONTRACT_NEW_URL}/contracts/statistic/department`,
        // 某个部门甲方统计
        'getDepartmentalDataUrl': `${CONTRACT_NEW_URL}/contracts/statistic/department/{item}`,
        // 按地域统计
        'getGeographicalStatisticsUrl': `${CONTRACT_NEW_URL}/contracts/statistic/region`,
        // 按某一个州的甲方乙方统计
        'getAreaDataUrl': `${CONTRACT_NEW_URL}/contracts/statistic/region/{item}`,
        // 导出图表统计内容
        'getExportStatisticsDataUrl': `${CONTRACT_NEW_URL}/contracts/export/statistics`
    },
    'microWebapp': {
        // 在主应用中拦截的上下文
        ctx: `${DEFAULT_GLOBAL.ctx_path}/mw`,
        rule: {
            // 根据微应用 session-id 提取主应用 session-id
            fetchMainSessionId: microSessionId => microSessionId.substr(0, microSessionId.lastIndexOf('-')),
            // 根据主应用 session-id 生成微应用 session-id
            generateMicroSessionId: mainSessionId => `${mainSessionId}-${Math.floor(Math.random() * 1e8)}`,
            // 微应用的默认配置（ 可以减少 apollo 中的配置内容 ）
            defaultMWConfig: {
                // 微应用专门为终端设备为 pc 的主应用独立部署（ 注意：这个会自动继承外层配置 ）
                // [`td:${'pc'}`]: {
                //     'baseUrl': 'http://127.0.0.1:9091'
                // },
                'appKey': '',
                'appSecret': '',
                'baseUrl': '',
                'cdn': DEFAULT_GLOBAL.cdn,
                'statics': {
                    'hmr': '/__webpack_hmr',
                    // 注意：如果整个微应用的所有长连接都不需要用户信息，才需要将 /socket.io 加入到 statics 当中
                    // 'socket': '/socket.io',
                    'static': '/static',
                    'entry-hash': '/micro-service/entry-hash.json',
                    'entry-base': '/micro-service/entry-content.js',
                    'entry-i18n': '/micro-service/i18n',
                    'entry-theme': '/micro-service/theme'
                },
                'passport': {
                    'preExclude': {},
                    'preInclude': {},
                    'default': true
                },
                'roles': [],
                // 微应用在主应用当中的请求上下文（ 注意：没有特别指定的情况下，会自动基于 appKey 计算 ）
                'webContext': '',
                // 微应用在主应用当中界面的模块ID（ 注意：没有特别指定的情况下，会自动基于 webContext 计算 ）
                'moduleKey': '',
                // 微应用的 session 在 cookies 中的 key 值（ 注意：目前不需要，因为微应用的 sid 是主应用生成的 2020-06-11 ）
                'sessionKey': 'sid',
                // 注意：默认情况下，微应用是未引用 caster-session 的，所以这里默认注释（也可以在 apollo 中指定）
                'keepAlive': {
                    // 同步延长 session 的过期时间
                    // 'session-keep': '/micro-service/keep-alive/session-keep',
                    // 同步用户的详细数据
                    // 'user-update': '/micro-service/keep-alive/user-update'
                },
                // 获取微应用的入口 hash 的请求地址（ 注意：同时也是周期检测微应用是否在线的请求地址 ）
                'entryHash': '/micro-service/entry-hash.json',
                // 微应用的入口地址列表(注意：这里必须是静态资源，原因：http2-server-push，cdn 的配置)
                'entryContent': {
                    '{lang}': '/micro-service/i18n/{lang}.js',
                    '{theme}': '/micro-service/theme/{theme}.js',
                    'base': '/micro-service/entry-content.js'
                }
            },
            // 是否在请求头中附加基本用户信息 {uid:userid, name:username} ,
            // 附加之后的大多数情况下，微应用就都可以不用到主应用获取用户的详细信息；
            pipeBaseUserInfoInHeader: true,
            // 是否直接 pipe 错误信息到浏览器
            // @type: function(responseHttpStatusCode, responseHttpHeaders, requestHttpHeaders) : boolean
            pipeErrorResponse: false,
            // 以下 HttpStatusCode 将使用主应用提供的统一错误界面（注意：优先级在 pipeErrorResponse 判断之后 ）
            globalErrorPageStatus: [401, 403, 404, 500]
        },
        // 其它动态配置存储在 caster 中（entryHash，status）
        store: {
            casterMapName: `${DEFAULT_GLOBAL.webapp_name}-mw-dynamic-config-${DEFAULT_GLOBAL.cfg_name}`,
            ttl: 1000 * 60 * 60 * 24 * 30
        },
        check: {
            // 微应用 on-offline 的检测的检测周期（min，max中的一个随机值）
            interval: [1000 * 40, 1000 * 60]
        },
        // 基础动态配置放在 apollo 中
        apollo: {
            serverUrl: null,
            appId: null,
            cluster: 'default',
            namespace: 'application.json',
            token: false,
            backOff: {
                check: {
                    min: 1000 * 10,
                    max: 1000 * 60 * 2,
                    factor: 1.5,
                    jitter: 0
                },
                fetch: {
                    min: 1000 * 5,
                    max: 1000 * 60,
                    factor: 1.5,
                    jitter: 0
                }
            }
        }
    },
    'system': {
        'port': 8080,
        // 注意如果是在命令行中, 只有 uncaughtExceptionExit=1 才为true
        'uncaughtExceptionExit': false,
        'elapseLogMinTime': 0,
        'sdkRestTimeout': 1000 * 30,
        'env': 'development',
        'env-prod': 'production',
        'env-dev': 'development',

        'version': `${pkg.version}`,
        'time': '{{build-time}}',
        'title': `${pkg.title}`,

        // 打包后的相关文件的 hash 记录，方便动态获取
        'pack-store': {
            'entries': '{{entry-resources}}',
            'themes': '{{theme-resources}}',
            'i18ns': '{{i18n-resources}}',
            'server-assets-hash': '{{server-assets-hash}}'
        },

        // 静态文件的默认生成时间 (1个月)
        'staticMaxAge': 1000 * 60 * 60 * 24 * 30,

        'caster': {
            properties: {
                'hazelcast.client.heartbeat.interval': 1000 * 7,
                'hazelcast.client.heartbeat.timeout': 1000 * 35
            },
            networkConfig: {
                'connectionAttemptLimit': 1,
                'connectionAttemptPeriod': 1000 * 3,
                'connectionTimeout': 1000 * 9,
                'redoOperation': true,
                'smartRouting': true,
                'socketOptions': {}
            }
        },

        'zpkin': {
            serviceName: `${DEFAULT_GLOBAL.webapp_name}-${DEFAULT_GLOBAL.cfg_name}`
        },

        'socket.io': {
            'path': `${DEFAULT_GLOBAL.ctx_path}/socket.io`,
            'pingTimeout': 60 * 1000,
            'pingInterval': 25 * 1000,
            'destroyUpgrade': false
        },

        'session': {
            'timeToLive': 20,
            'casterMapName': `${DEFAULT_GLOBAL.webapp_name}-${DEFAULT_GLOBAL.cfg_name}-session`
        },

        'global': DEFAULT_GLOBAL,

        'role': role,

        'local': {
            // 模块组合别名定义
            'alias': {
                'index': ['common', 'home', 'user', 'error', 'task', 'theme'],
                'login': ['login']
            },
            // 注意：这只是输出的格式，输入的格式理论上是任意格式都将会被支持
            'format': {
                languageUpperCase: false,
                separator: '-',
                extLanguageSeparator: '.',
                countryUpperCase: false
            },
            'basedir': [`${I18N_BASEDIR}/common/local-lang`, `${__dirname}/local-lang`],
            'supported': ['zh-cn', 'en'],
            'customImplGetLocalLangStrByRequest': (request) => {
                let lang;
                // 1. 优先使用 用户个人设置中的语言选择
                lang = (request.session && request.session.user && request.session.user.appConfig)
                    ? request.session.user.appConfig.lang
                    : null;
                // 2. 使用 cookies 中的语言选择
                if (!lang && request.cookies) {
                    lang = request.cookies['lang'];
                }
                // 3. 使用 req.query 中的语言选择
                if (!lang && request.query) {
                    lang = request.query['l'];
                }
                return lang;
            }
        },

        'terminalDevice': {
            // 当前应用支持的终端设备：索引 0 为默认终端
            'supported': ((defaultSupported) => {
                let cfg = defaultVars.system.terminalDevice || {};
                let ret = (Array.isArray(cfg.supported) && cfg.supported.length) ? cfg.supported : defaultSupported;
                delete defaultVars.system.terminalDevice;
                return ret;
            })(
                ['website']
            ),
            // 获取当前请求的终端设备标识
            // ( 注意1：目前是在 global filter 中拦截，所以 request 对象中没有 session, 但有 cookies )
            // ( 注意2：微应用的转发时获取的终端设备不从这里获取，因为根据 micro-ctx 获取的 micro-cfg 中已包含的终端设备值 )
            'getCurrentTerminalDeviceByRequest': (request, throwErrorWhenNotSupported) => {
                let req = request || {};
                let td = req.headers ? req.headers['terminal_device'] : '';
                let cfg = baseConfig.system.terminalDevice;
                let isSupported = cfg.supported.includes(td);
                if (!isSupported && throwErrorWhenNotSupported && typeof throwErrorWhenNotSupported === 'boolean') {
                    throw new Error(`terminal device: ${td}, not supported!`);
                }
                return isSupported ? td : cfg.supported[0];
            }
        },

        'codes': {
            'basex-data': require('./codes/basex-data.js')
        },

        'captcha': `${NORMAL_BASE_REST_URL.mock}/captcha`
    }
};

/**
 * 应用配置文件 ＝ 基础部分 + 可变部分
 */
module.exports = extend(baseConfig, defaultVars);
