/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

import baseX from 'base-x';
import secret from '../../../config/codes/basex-data.js';

/**
 * init-data.util.js
 * Created by dingcan on 2020/08/27.
 */

let data;
try {
    data = JSON.parse(baseX(secret).decode(
        document.getElementById('__data__').getAttribute('val') || ''
    ).toString()) || {};
} catch (e) {
    data = {};
}
module.exports = data;
