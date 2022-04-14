/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * 错误码解释 -- 中文
 *
 * 编写规则：
 * 1. 错误描述中包含 {data.maxCount} 这种类型的, 程序将自动的替换成相应的值
 * 2. 错误码数组的长度为2，则表示他是一个范围值，如：[100, 199] 表示的是 从 100到199的范围
 * 3. 错误码数组的长度为1，则表示他是一个单值，如：[20803] 表示的是 单个错误吗 20803
 *
 * 支持格式：
 * 1. '001110 || custom-string': 'translated message.'
 * 2. '001110 || custom-string': (code, data, opt) => { return ''; }
 * 3. 'error-id-key': {text: 'translated message', code: [1110, [3100], [100, 200], 'time-out', ['default-error']]}
 * 4. 'error-id-key': {text: (code, data, opt) => { return ''; }, code: [...]}
 * 5. 'translated message': [1110, [3100], [100, 200], 'time-out', ['default-error']]
 *
 * 注意：这里写一些额外的 errorCode 国际化（因为大部分已在 i18n-resource-base 中定义了）
 *
 * Created by wuyaoqian on 14-1-22.
 */
module.exports = {
    '服务器异常': [[180000]],
    '指令无效或过期': [[210000]],
    '该指令没有相对应的Job任务': [[210001]],
    '没有找到与之对应的topicInfo信息': [[210002]],
    '已超出用户创建主题最大个数': [[210003]]
};
