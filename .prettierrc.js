/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * .prettierrc.js - 因格式化后的代码不是很好看【可控制的规则也少】，所以暂时不用 
 * Created by wuyaoqian on 2020/07/22.
 */

 module.exports = {
    // 字符串使用单引号
    singleQuote: true,
    // 每行末尾自动添加分号
    semi: true,
    // tab缩进大小,默认为2
    tabWidth: 4,
    // 使用tab缩进，默认false
    useTabs: false,
    // 对象中打印空格 默认true
    // true: { foo: bar }
    // false: {foo: bar}
    bracketSpacing: true,
    // 箭头函数参数括号 默认 avoid 可选 avoid | always
    // avoid 能省略括号的时候就省略 例如 x => x
    // always 总是有括号
    arrowParens: 'avoid',
    // 换行长度，默认80
    printWidth: 120
 }
