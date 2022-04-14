/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * webpack打包配置（基础部分）
 * 注意：这里不能使用  import 的形式引用模块，因为 prod build 时不支持
 * Created by wuyaoqian on 2016/11/17.
 */

// init global name setting
require('../server/global.name.js');

const path = require('path');
const assemble = require('./webpack.config.assemble');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');
const help = require('./webpack.help');

// 打包阶段的临时存储（1：开发阶段的动态资源的引入，2：部署阶段会将相应内容写入 config.system['pack-store'] 中永久使用）
global.PackStore = {};

const options = {
    hashLength: 8,
    babel: {
        presets: ['env'],
        plugins: ['transform-runtime', 'transform-new-target', 'transform-object-rest-spread', 'syntax-dynamic-import']
    },
    eslint: {
        // 设定为自动按规则修正
        fix: true,
        // 在控制台中输出的日志格式
        formatter: require('eslint-formatter-pretty')
    },
    vue: {
        // transformAssetUrls: {
        //     img: ['src', 'srcset'],
        //     image: 'xlink:href'
        // }
    },
    jsdatakey: {
        pid: `${Math.random()}`,
        // keyLabelInJsTheme: 'key',
        // altKeyLabelInJsTheme: 'alt',
        // jsDataKeyLabelForVue: 'jsDataKey',
        dataKeyValuePattern: '{{AUTO-DATA-KEY-FOR-SAME-COMPONENT}}',
        themeFilePattern: /[\\/]theme[\\/].+\.js$/i,
        themeFileDirRelativeTargetFile: ['./theme', '../theme']
    },
    postcss: {
        ident: 'postcss-ident',
        config: {
            path: path.join(__dirname, './postcss.config.js')
        }
    },
    less: {
        paths: [],
        plugins: [
            // 若需要，需要在 options 中添加 paths 属性，否则报错
            // 原因: less-loader/dist/getOptions.js, 这样的话 less-plugin-blob 就不会生效了
            // if ('paths' in options === false) {
            //   options.plugins.push(createWebpackLessPlugin(loaderContext));
            // }
            require('less-plugin-glob'),
            new (require('less-plugin-auto-theme'))({
                // 符合这个路径规则的，将视为皮肤样式（提取皮肤样式）
                'themeFileUrlPattern': /[\\/]theme[\\/].+\.less$/i,
                // 在非皮肤样式的文件中，按照如下目录规则查找皮肤样式文件（提取框架样式）
                'themeFileDirRelativeBaseFile': ['./theme', '../theme']
            })
        ]
    }
};

const loaders = {
    babel: {
        loader: 'babel-loader',
        options: options.babel
    },
    eslint: {
        loader: 'eslint-loader',
        options: options.eslint
    },
    vue: {
        loader: 'vue-loader',
        options: options.vue
    },
    jsdatakey: {
        loader: 'webpack-tool/lib/auto-theme-jsdatakey.loader.js',
        options: options.jsdatakey
    },
    postcss (opt) {
        // 注意：postcss-loader 不能被共用，所以这里使用函数来返回一个新的 object
        return {
            loader: 'postcss-loader',
            options: Object.assign({}, options.postcss, opt)
        };
    },
    less (opt) {
        // 注意：less-loader 可以被共用，只是为了与 postcss 使用统一的调用方式
        return {
            loader: 'less-loader',
            options: Object.assign({}, options.less, opt)
        };
    }
};

const plugins = {
    htmlWebpack (opt) {
        return assemble.pages.map((page) => {
            return new HtmlWebpackPlugin(Object.assign({
                inject: 'body',
                // eg: 'none'|'dependency'|'id'|function(chunks){}
                chunksSortMode: 'dependency',
                chunks: null,
                // 用来传递一些相关选项配置
                templateOpt: { reservePatternWhenDataEmpty: true },
                // 用来替换 {{title}} 这类格式的文本
                templateData: {}
            }, page, opt));
        });
    }
};

const rules = {
    style (mode) {
        // 因为 MiniCssExtractPlugin 不能 hot-reload ： 2018-8-17
        // https://github.com/webpack-contrib/mini-css-extract-plugin/issues/34
        let mini = (mode === 'development') ? {
            loader: 'style-loader',
            options: {
                base: parseInt(Math.random() * 1e16),
                sourceMap: true
            }
        } : MiniCssExtractPlugin.loader;
        // 使用 sourceMap 后，样式会延时加载
        // https://github.com/webpack-contrib/css-loader/issues/613
        // https://github.com/NeekSandhu/css-visor
        // let css = `css-loader?${mode === 'development' ? 'sourceMap&' : ''}importLoaders=1`;
        let css = `css-loader?importLoaders=1`;
        let post = loaders.postcss({ sourceMap: mode === 'development' });
        let less = loaders.less({ sourceMap: mode === 'development' });
        return [{
            test: /\.css$/,
            use: [mini, css, post]
        }, {
            // 匹配 theme 目录下的 less文件
            test: /theme([/\\])[^/\\]+\.less$/,
            use: [{
                loader: 'style-loader/useable',
                options: { base: parseInt(Math.random() * 1e16) }
            }, css, post, less]
        }, {
            test: function (path) {
                // 匹配不在 theme 目录下的less文件
                let result = /(theme([/\\])[^/\\]+)?\.less$/.exec(path);
                return !!(result && !result[1]);
            },
            use: [mini, css, post, less]
        }];
    },
    url () {
        return [{
            // 匹配 font[s]? 目录下的 字体文件
            test: /font[s]?([/\\])([^/\\]+([/\\]))*([^/\\]+)?\.(eot|ttf|woff|woff2|svg)(\?|$)/,
            loader: 'url-loader',
            query: {
                limit: 1,
                name: `font/[name].[contenthash:${options.hashLength}].[ext]`
            }
        }, {
            test: function (path) {
                // 匹配任意目录下的png,jpg,gif文件
                if (/\.(png|jpg|gif)$/.test(path)) { return true; }
                // 匹配不在font目录下的svg文件
                let result = /(font[s]?([/\\])([^/\\]+([/\\]))*([^/\\]+)?)?\.svg(\?|$)/.exec(path);
                return !!(result && !result[1]);
            },
            loader: 'url-loader',
            query: {
                limit: 1000,
                name: `img/[name].[contenthash:${options.hashLength}].[ext]`
            }
        }];
    },
    jsExclude () {
        return /node_modules([/\\])(?!(@component-util|antme-sdk-js-[a-z]+))/i;
    }
};

const getWebpackBaseConfig = function (mode) {
    return {
        mode: mode,
        cache: true,
        // 入口文件配置
        entry: assemble.entries,
        // 优化选项
        optimization: {
            providedExports: true,
            usedExports: true,
            sideEffects: true,
            removeAvailableModules: true,
            removeEmptyChunks: true,
            mergeDuplicateChunks: true,
            concatenateModules: true,
            runtimeChunk: { name: assemble.runtime() },
            splitChunks: Object.assign({
                // all | async | initial | function(chunk){}
                chunks: 'all',
                minChunks: 2,
                automaticNameDelimiter: '_'
            }, assemble.splitChunks)
        },
        // 公共插件
        plugins: [
            // 提取css为单文件
            new MiniCssExtractPlugin({
                filename: `css/[name].[contenthash:${options.hashLength}].css`
            }),

            // vue-loader v15 必须使用的插件
            new VueLoaderPlugin(),

            // 提取打包后的相关 trunk 名称及相关属性
            new function () {
                this.apply = function (compiler) {
                    compiler.hooks.emit.tap('EntryResourcesTempRecord', function (compilation) {
                        const allChunks = compilation.getStats().toJson().chunks;
                        const exist = (arr, name) => arr.find((obj) => obj.name === name);
                        const entries = help.getEntries();
                        const themes = help.getThemes();
                        const i18ns = help.getI18ns();
                        global.PackStore['entries'] = {};
                        global.PackStore['themes'] = {};
                        global.PackStore['i18ns'] = {};
                        allChunks.some((chunk) => {
                            let ret;
                            let name = chunk.names[0];
                            if ((ret = exist(entries, name))) {
                                global.PackStore['entries'][name] = [chunk.files[0]];
                            } else if ((ret = exist(themes, name))) {
                                global.PackStore['themes'][name] = [chunk.files[0], ret.key];
                            } else if ((ret = exist(i18ns, name))) {
                                global.PackStore['i18ns'][name] = [chunk.files[0], ret.key];
                            }
                        });
                    });
                };
            }()
        ],
        // 输出文件配置
        output: {
            path: path.resolve(__dirname, '../dist/static'),
            publicPath: `${global.ctx_static_path_cdn}/`
        },
        resolve: {
            alias: {
                // vue: 'vue/dist/vue.js',
                '@APP_VUEX': path.resolve(__dirname, '../client/utils/app-vuex.js'),
                '@APP_AXIOS': path.resolve(__dirname, '../client/utils/axios-utils.js')
            }
        },
        module: {
            rules: [
                {
                    enforce: 'pre',
                    test: /\.(js|vue)$/,
                    use: [loaders.eslint, loaders.jsdatakey],
                    exclude: rules.jsExclude(mode)
                },
                {
                    test: /\.vue$/,
                    use: [loaders.vue]
                },
                {
                    test: /\.js$/,
                    use: [loaders.babel],
                    exclude: rules.jsExclude(mode)
                },
                ...rules.style(mode),
                ...rules.url(mode)
            ]
        }
    };
};

// noinspection WebpackConfigHighlighting
module.exports = {
    options,
    loaders,
    plugins,
    rules,
    getConfig: getWebpackBaseConfig
};
