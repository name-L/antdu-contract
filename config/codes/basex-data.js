/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * baxex-data.js
 * @see https://www.npmjs.com/package/base-x
 * Created by wuyaoqian on 2020/08/27.
 */

// 2:    01;
// module.exports = '01';

// 8:    01234567
// module.exports = '01234567';

// 11:   0123456789a
// module.exports = '0123456789a';

// 16:   0123456789abcdef
// module.exports = '0123456789abcdef';

// 32:   0123456789ABCDEFGHJKMNPQRSTVWXYZ
// module.exports = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

// 32:   ybndrfg8ejkmcpqxot1uwisza345h769 (z-base-32)
// module.exports = 'ybndrfg8ejkmcpqxot1uwisza345h769';

// 36:   0123456789abcdefghijklmnopqrstuvwxyz
// module.exports = '0123456789abcdefghijklmnopqrstuvwxyz';

// 58:   0123456789abcdefghijklmnopqrstuvwxyz
// module.exports = '0123456789abcdefghijklmnopqrstuvwxyz';

// 62:   0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ
// module.exports = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

// 64:   ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/
// module.exports = 'ABCDEFGHIJKLMNOPQ_RSTUVWXYZabcdefghijklmn-opqrstuvwxyz0123456789';

// 66:   ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~
// module.exports = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.!~';

// len: 88
// removed char codes: [32:  ,34: ', 36: $, 39: ", 60: <, 62: >, 92: \]
// conflict-char-ejs: <>
// conflict-regex-replace: $
module.exports = '!#%&()*+,-./9123456780:;=?@ZBCDEFGHIJKLMNOPQRSTUVWXYA[]^_`abcdefghijklmnopqrstuvwxyz{|}~';
