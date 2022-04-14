/*!
 * Copyright (c) 2010-2020 EEFUNG Software Co.Ltd. All rights reserved.
 * 版权所有 (c) 2010-2020 湖南蚁坊软件股份有限公司。保留所有权利。
 */

'use strict';

/**
 * user.js
 * Created by wuyaoqian on 2018/7/20.
 */

const users = require('../mock-data/user.json');

module.exports = {
    'GET /asimov/v1/user': users[0],
    'GET /asimov/v1/user/list': users,
    'POST /asimov/v1/user/login/account': (req, res) => {
        const { password, username } = req.body;
        if (password === '888888' && username === 'admin') {
            return res.json({
                status: 'ok',
                code: 0,
                token: 'xxx-xxx-xxx',
                data: users[1]
            });
        } else {
            return res.status(403).json({
                status: 'error',
                code: 403
            });
        }
    },
    'DELETE /asimov/v1/user/:id': (req, res) => {
        console.log('---->', req.body);
        console.log('---->', req.params.id);
        res.send({
            status: 'ok',
            message: '删除成功！'
        });
    }
};
