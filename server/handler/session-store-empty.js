/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * empty-session-store.js
 * 无任何实体存储的空仓库
 * Created by wuyaoqian on 2018/1/8.
 */

const util = require('util');
// const path = require("path");
// const logger = require("log4js-config").get("eefung.webapp.caster-store.session." + path.basename(__filename));

/**
 * @param session {object} express session
 * @return {Function}
 */

module.exports = function (session) {
    function CustomSessionStore () {}

    /**
     * Inherit from `Store`.
     */
    util.inherits(CustomSessionStore, session.Store);

    /**
     * Attempt to fetch session by the given `sid`.
     *
     * @param sid {String} session id
     * @param fn {Function} callback function
     * @param resave {boolean} resave data
     */
    CustomSessionStore.prototype.get = function (sid, fn, resave) {
        return fn(null, { cookie: {} });
    };

    /**
     * Commit the given `sess` object associated with the given `sid`.
     *
     * @param sid {String} session id
     * @param sess {object} sesssion object
     * @param fn {Function} callback function
     */
    CustomSessionStore.prototype.set = function (sid, sess, fn) {
        return fn(null);
    };

    /**
     * Destroy the session associated with the given `sid`.
     *
     * @param sid {String} session id
     * @param fn {Function} callback function
     */
    CustomSessionStore.prototype.destroy = function (sid, fn) {
        return fn(null);
    };

    return CustomSessionStore;
};
