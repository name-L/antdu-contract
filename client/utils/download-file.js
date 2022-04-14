'use strict';

import $ from 'jquery';
import _ from 'lodash';
// import CommonUtil from '../asset/util/common.util.js';
// 下载文件
let downloadFile = function (id, url) {
    let downloadIFrameId = '_DOWNLOAD_IFRAME_' + id;
    let downloadIFrame = $("iframe[id='" + downloadIFrameId + "']:first");
    let lastDownloadTime = downloadIFrame.data('lastDownloadTime');
    let downloadUrl = window.Util.ctxPath + url;
    if (!downloadIFrame.length) {
        downloadIFrame = $("<iframe style='display:none' />").attr('id', downloadIFrameId).appendTo($('body'));
    }

    if (!_.isNumber(lastDownloadTime) || lastDownloadTime + 1000 < $.now()) {
        downloadIFrame.data('lastDownloadTime', $.now()).get(0).contentWindow.location.replace(downloadUrl);
        // eslint-disable-next-line max-len
        console.log(downloadIFrame.data('lastDownloadTime', $.now()).get(0).contentWindow.location.replace(downloadUrl));
        return true;
    } else {
        return false;
    }
};
module.exports = {
    downloadFile
};
