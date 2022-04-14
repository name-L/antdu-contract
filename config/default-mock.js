/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * default-mock.js
 * Created by wuyaoqian on 2020/6/17.
 */

class MockRealUrl {
    /**
     * @param {MockRealUrl} [parent]
     * @param {string} real - real url
     * @param {string} [mock] - mock url
     * @param {string} [mode] - eg: real, mock, auto
     */
    constructor (parent, real, mock, mode) {
        this._real = real;
        this._mock = mock || '';
        this._mode = ['real', 'mock', 'auto'].includes(mode) ? mode : 'auto';
        this._parent = parent;
    }

    /**
     * 获取当前综合计算后 mode 值 ( 注意：内部调用 )
     * @private
     * @returns {string}
     */
    get __mode__ () {
        return (!this._parent || this._parent._mode === 'auto') ? this._mode : this._parent._mode;
    }

    /**
     * 获取当前综合计算后 mock 值 ( 注意：内部调用 )
     * @private
     * @returns {string}
     */
    get __mock__ () {
        return this._mock || (this._parent && this._parent._mock) || '';
    }

    // ----------------------- 分界线 ---------------------------

    /**
     * 获取 real 值（ 与当前 mode 值有关 ）
     */
    get real () {
        return this.__mode__ === 'mock' ? this.__mock__ : this._real;
    }

    /**
     * 获取 mock 值（ 与当前 mode 值有关 ）
     */
    get mock () {
        return this.__mode__ === 'real' ? this._real : this.__mock__;
    }

    /**
     * 强行 mock 做为默认输出 ( toString 方法的输出，注意：当 parent.mode === 'auto' 时才会影响输出 )
     */
    forceMock () {
        this._mode = 'mock';
    }

    /**
     * 强行 real 做为默认输出 ( toString 方法的输出，注意：当 parent.mode === 'auto' 时才会影响输出 )
     */
    forceReal () {
        this._mode = 'real';
    }

    /**
     * 回归自动模式 ( toString 会调用 this.real 输出，注意：当 parent.mode === 'auto' 时才会影响输出 )
     */
    forceAuto () {
        this._mode = 'auto';
    }

    /**
     * 输出当前值
     * @returns {string}
     */
    toString () {
        return this.real;
    }

    /**
     * 以 object 形式存放数据的 mock 数据
     * @typedef {object} MockData
     * @property {string} real - real url
     * @property {string} mock - mock url
     * @property {string} mode - one of ['real', 'mock', 'auto]
     */

    /**
     * 获取一个由 MockRealUrl 对象
     * @param {string|string[]|MockData} opt
     * @param {MockRealUrl} [parent]
     * @returns {MockRealUrl}
     */
    static get (opt, parent) {
        if (typeof opt === 'string' && opt) {
            return new this(parent, opt, null, null);
        }
        if (Array.isArray(opt) && opt[0] && typeof opt[0] === 'string') {
            return new this(parent, opt[0], opt[1], opt[2]);
        }
        if (typeof opt === 'object' && opt.real && typeof opt.real === 'string') {
            return new this(parent, opt.real, opt.mock, opt.mode);
        }
        throw new Error(`error params: ${opt}`);
    }
}

/**
 * MockRealUrl 实例
 * 属性：
 * 1. real             // 在 mode === mock 时，输出 mock 值，否则 real 值（ 注意：只在 parent.mode === auto 时才会影响输出 ）
 * 2. mock             // 在 mode === real 时，输出 real 值，否则 mock 值（ 注意：只在 parent.mode === auto 时才会影响输出 ）
 *
 * 方法：
 * 1. toString         // 相当于访问 instance.real 属性
 * 2. forceMock        // 改变 mode 参数为 mock ( 注意：只在 parent.mode === auto 时才会影响输出 )
 * 3. forceReal        // 改变 mode 参数为 real ( 注意：只在 parent.mode === auto 时才会影响输出 )
 * 4. forceAuto        // 改变 mode 参数为 auto ( 注意：只在 parent.mode === auto 时才会影响输出 )
 *
 * MockRealUrl 类
 * 1. get              // function(opt, parent) {}
 *
 * @type {MockRealUrl}
 */
module.exports = MockRealUrl;
