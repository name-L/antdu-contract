/**
 * Created by zhousiyao on 2017/2/4.
 */

import $ from 'jquery';
import _ from 'lodash';
/* eslint-disable */
/**
 * 获取服务器当前时间
 */
let getServerCurrentTime = (function () {
    let handler = function () {
        // if (_.isUndefined(handler._cacheDifValue)) {
        //   //首次同步请求
        //   requestServerCurrentTime(true);
        // }
        return new Date().getTime() + (handler._cacheDifValue || 0);
    };

    // let requestServerCurrentTime = function (sync) {
    //   $.ajax({
    //     url: '/common/currentTime',
    //     type: 'get',
    //     cache: false,
    //     async: !sync,
    //     timeout: 20 * 1000,
    //     success: function (serverCurrentTime) {
    //       handler._cacheDifValue = parseInt(serverCurrentTime) - new Date().getTime();
    //     },
    //     complete: sync ? undefined : function () {
    //       //每隔5分钟刷新一次时间
    //       _.delay(requestServerCurrentTime, 5 * 60 * 1000);
    //     }
    //   });
    // };
    // _.delay(requestServerCurrentTime, 10 * 1000);
    return handler;
})();

/**
 * 时间对象的格式化; format(date,'YYYY年MM月dd日hh小时mm分ss秒');
 * @param dateObj
 * @param format
 * @returns {*}
 */
let formatDate = function (dateObj, format) {
    let o = {
        'M+': dateObj.getMonth() + 1, // month
        'd+': dateObj.getDate(), // day
        'h+': dateObj.getHours(), // hour
        'm+': dateObj.getMinutes(), // minute
        's+': dateObj.getSeconds(), // second
        'q+': Math.floor((dateObj.getMonth() + 3) / 3), // quarter
        'S': dateObj.getMilliseconds() // millisecond
    };
    if (/(y+)/.test(format)) {
        format = format.replace(RegExp.$1, (dateObj.getFullYear() + '').substr(4 - RegExp.$1.length));
    }
    for (let k in o) {
        if (new RegExp('(' + k + ')').test(format)) {
            format = format.replace(RegExp.$1, RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length));
        }
    }
    return format;
};

/**
 * 日期转换
 * @param date 日期
 * @param format 格式
 * @param isConvertToday 是否转换今天 true：转换昨天；false、null、undefined：不转换今天昨天值
 * @returns {*}
 * @private
 */
let formatDate2TodayStr = function (date, format, isConvertToday) {
    let returnDate;
    if (!isConvertToday) {
        returnDate = formatDate(new Date(date), format);
    } else {
        let formatDateStr = formatDate(new Date(date), 'yyyy-MM-dd hh:mm'); // 格式化
        let dateArray = formatDateStr.split(' ');
        let now = new Date(getServerCurrentTime());
        let todayStr = formatDate(new Date(now), 'yyyy-MM-dd'); // 今天的具体时间
        let yesterdayStr = formatDate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1), 'yyyy-MM-dd'); // 昨天的具体时间
        if (todayStr === dateArray[0]) { // 今天
            returnDate = dateArray[1]; // i18n.common.today
        } else if (yesterdayStr === dateArray[0]) { // 昨天
            returnDate = '昨天' + ' ' + dateArray[1]; // i18n.common.yesterday
        } else {
            returnDate = formatDate(new Date(date), format); // 原格式返回
        }
    }
    return returnDate;
};

/**
 * 将时间段转化为多少小时，多少分钟，多少秒
 * @param time
 * @returns {*}
 */
let formatTimeToStr = function (time) {
    let returnStr = '';
    let last = 0;
    let oneMinute = 1000 * 60;
    let oneHourTime = oneMinute * 60;
    let oneDayTime = oneHourTime * 24;

    if (time > oneDayTime) {
        returnStr = Math.floor(time / oneDayTime) + '天';
        last = time % oneDayTime;
        if (last > oneHourTime) {
            returnStr = returnStr + Math.floor(last / oneHourTime) + '小时';
            last = last % oneHourTime;
            if (last > oneMinute) {
                returnStr = returnStr + Math.floor(last / oneMinute) + '分';
                last = last % oneMinute;
                returnStr = returnStr + Math.floor(last / 1000) + '秒';
                return returnStr;
            }
        }
    }
    if (time > oneHourTime) {
        returnStr = returnStr + Math.floor(time / oneHourTime) + '小时';
        last = time % oneHourTime;
        if (last > oneMinute) {
            returnStr = returnStr + Math.floor(last / oneMinute) + '分';
            last = last % oneMinute;
            returnStr = returnStr + Math.floor(last / 1000) + '秒';
            return returnStr;
        }
    }
    if (time > oneMinute) {
        returnStr = returnStr + Math.floor(time / oneMinute) + '分';
        last = time % oneMinute;
        returnStr = returnStr + Math.floor(last / 1000) + '秒';
        return returnStr;
    }
    if (time > 1000) {
        returnStr = returnStr + Math.floor(time / 1000) + '秒';
        return returnStr;
    } else {
        returnStr = returnStr + (time / 1000) + '秒';
        return returnStr;
    }
};
let htmlUtil = {
    /**
     * 将 html标签符号 转化为 html转义符号
     * @param content
     * @param useDefaultValue
     * @returns {*}
     */
    escape: function (content, useDefaultValue) {
        return _.isString(content) ? content.replace(/</g, '&lt;').replace(/>/g, '&gt;') : (useDefaultValue ? '' : undefined);
    },
    /**
     * 将 html转义符号 转化为 html标签符号
     * @param content
     * @param useDefaultValue
     * @returns {*}
     */
    unescape: function (content, useDefaultValue) {
        return _.isString(content) ? content.replace(/&lt;/g, '<').replace(/&gt;/g, '>') : (useDefaultValue ? '' : undefined);
    }

};

/**
 * 数值转换易读数值(Html)
 *
 * @param numberClass
 *            数值样式，可为空
 * @param numberUnitClass
 *            数值的单位样式，可为空
 * @param num
 *            转换的数值
 *
 */
let convertNumberWithHtml = function (numberClass, numberUnitClass, num) {
    numberClass = $.trim(numberClass);
    numberUnitClass = $.trim(numberUnitClass);

    let total = num;

    if (!total) {
        return '<span class="' + numberClass + '">0</span>';
    }

    total = parseInt(total);

    if (isNaN(total) || total <= 0) {
        return '<span class="' + numberClass + '">0</span>';
    }

    let yTotalStr = parseInt(total) + '&nbsp;';
    let w = 10000;
    let y = w * w;
    let langCode = 'zh_cn'; // 当前语言的判断，暂时写死

    if (langCode === 'zh_cn') {
        // 大于等于10亿时，单位为亿，保留1位小数
        if (total > 10 * y) {
            yTotalStr = Math.round(total / (y / 10)) / 10 + '亿'; // i18n.common.E
        } else if (total >= y) { // 大于等于1亿时，单位为亿，保留2位小数
            yTotalStr = Math.round(total / (y / 100)) / 100 + '亿';
        } else if (total >= (y - 5000)) { // 大于等于9999万5千，显示约“1亿”
            yTotalStr = '1' + '亿';
        } else if (total >= 1000 * w) { // 大于等于1000万时，单位为万，不保留小数点
            yTotalStr = Math.round(total / (w / 100)) / 100 + '万'; // i18n.common.W
        } else if (total >= 10 * w) { // 大于等于10万时，单位为万，保留1位小数
            yTotalStr = Math.round(total / (w / 100)) / 100 + '万';
        } else if (total >= w) { // 大于等于1万时，单位为万，保留2位小数
            yTotalStr = Math.round(total / (w / 100)) / 100 + '万';
        } else if (total >= (w - 5)) { // 大于等于9995时，单位为万，显示约“1万”
            yTotalStr = '1' + '万';
        }
        if (yTotalStr.indexOf('万') > 0 || yTotalStr.indexOf('亿') > 0) {
            yTotalStr =
              '<span class="' + numberClass + '">' + yTotalStr.substring(0, yTotalStr.length - 1) + '</span>&nbsp;<span class="' + numberUnitClass + '">' +
              yTotalStr.substring(yTotalStr.length - 1) + '</span>';
        } else {
            yTotalStr = '<span class="' + numberClass + '">' + yTotalStr + '</span>';
        }
    }
    return yTotalStr;
};

/**
 * 数值转换易读数值(Text)
 * @param num
 */
let convertNumberWithText = function (num) {
    return $('<div />').html(convertNumberWithHtml('', '', num)).text().replace(/\s+/g, '');
};

let provincesAndcities;
let getCityList = function (num) {
    if (provincesAndcities) {
        return provincesAndcities;
    }

    let cityListStr = '';
    let cityListSplit = cityListStr.split(/\s*\r?\n/);

    provincesAndcities = {};
    for (let i in cityListSplit) {
        let split = cityListSplit[i].split('|');
        let province = provincesAndcities[split[0]];

        if (!province) {
            province = provincesAndcities[split[0]] = {
                name: split[0],
                pinyin: split[1]
            };
        }

        province[split[2]] = {
            name: split[2],
            pinyin: split[3]
        };
    }

    // 排序
    function getSortKeys (map) {
        return _.sortBy(_.reject(_.keys(map), function (name) {
            return name === 'name' || name === 'pinyin';
        }), function (name) {
            return map[name]['pinyin'].toLowerCase();
        });
    }

    let sortProvincesAndcities = {};
    let sortKeys = getSortKeys(provincesAndcities);
    let name, province, sortChildren, sortProvince, childName;
    for (let i in sortKeys) {
        name = sortKeys[i];
        province = provincesAndcities[name];
        sortChildren = getSortKeys(province);
        sortProvince = {};
        sortProvince.name = province.name;
        sortProvince.pinyin = province.pinyin;
        for (let j in sortChildren) {
            childName = sortChildren[j];
            sortProvince[childName] = province[childName];
        }

        sortProvincesAndcities[name] = sortProvince;
    }

    return sortProvincesAndcities;
};

/**
 * 数字格式化
 */
function _formateNumberWithZero (num, len) {
    num = '0000' + num;
    return num.substring(num.length - len);
}

let formateDateToStr = function (date) {
    return date.getFullYear() + '-' + _formateNumberWithZero(date.getMonth() + 1, 2) + '-' + _formateNumberWithZero(date.getDate(), 2);
};
/**
 * 月(M)、日(d)、12小时(h)、24小时(H)、分(m)、秒(s)、周(E)、季度(q) 可以用 1-2 个占位符<br />
 * 年(y)可以用 1-4 个占位符，毫秒(S)只能用 1 个占位符(是 1-3 位的数字) <br />
 * eg: <br />
 * ( xxx.formateDate(date,'yyyy-MM-dd hh:mm:ss.S') ==> 2006-07-02 08:09:04.423
 * <br />
 * ( xxx.formateDate(date,'yyyy-MM-dd E HH:mm:ss') ==> 2009-03-10 二 20:09:04
 * <br />
 * (xxx.formateDate(date,'yyyy-MM-dd EE hh:mm:ss') ==> 2009-03-10 周二 08:09:04
 * <br />
 * (xxx.formateDate(date,'yyyy-MM-dd EEE hh:mm:ss') ==> 2009-03-10 星期二 08:09:04
 * <br />
 * (xxx.formateDate(date,'yyyy-M-d h:m:s.S') ==> 2006-7-2 8:9:4.18 <br />
 *
 * @param date
 * @param pattern
 */

let formateDate = function (date, pattern) {
    return formatDate(new Date(date), pattern);
};
/**
 * 将其转换为字符串格式（类似于函数formateDate），但是当年份是本年，不显示年份
 * @param date
 * @param pattern
 * @returns {*}
 */
let formateDateToStr1 = function (date, pattern) {
    if (new Date(date).getFullYear() === new Date().getFullYear()) {
        let replaceStr = pattern.match(/yyyy[^m]+/gi);
        if (replaceStr) {
            pattern = pattern.replace(replaceStr[0], '');
        }
    }
    return formatDate(new Date(date), pattern);
};

let downloadFile = function (id, url) {
    let downloadIFrameId = '_DOWNLOAD_IFRAME_' + id;
    let downloadIFrame = $('iframe[id="' + downloadIFrameId + '"]:first');
    let lastDownloadTime = downloadIFrame.data('lastDownloadTime');

    if (!downloadIFrame.length) {
        downloadIFrame = $('<iframe style="display:none" />').attr('id', downloadIFrameId).appendTo($('body'));
    }

    if (!_.isNumber(lastDownloadTime) || lastDownloadTime + 5000 < $.now()) {
        downloadIFrame.data('lastDownloadTime', $.now()).get(0).contentWindow.location.replace(url);
        return true;
    } else {
        return false;
    }
};
/**
 * HTML常用方法
 * @type {{encode: Function, decode: Function}}
 */
let html = {
    /**
     *转义
     * @param string
     * @return {*|jQuery}
     */
    encode: (function () {
        // List of HTML entities for escaping.
        let entityMap = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&apos;',
            ' ': '&nbsp;'
            // '/': '&#x2F;'
        };

        // Regexes containing the keys and values listed immediately above.
        let entityRegexes = new RegExp('[' + _.keys(entityMap).join('') + ']', 'g');

        let mathFun = function (match) {
            return entityMap[match];
        };

        // Functions for escaping and unescaping strings to/from HTML interpolation.
        return function (string) {
            return _.isString(string) ? string.replace(entityRegexes, mathFun) : '';
        };
    })(),

    /**
     * 解析
     * @param string
     * @return {*|jQuery}
     */
    decode: (function () {
        // List of HTML entities for escaping.
        let entityMap = {
            '<': '&lt;',
            '>': '&gt;'
        };

        // Regexes containing the keys and values listed immediately above.
        let entityRegexes = new RegExp('[' + _.keys(entityMap).join('') + ']', 'g');

        let mathFun = function (match) {
            return entityMap[match];
        };
        return function (string) {
            return _.isString(string) ? $('<div />').html(string.replace(entityRegexes, mathFun)).text() : '';
        };
    })()
};
/**
 * 随机字符串工具
 * @type {{}}
 */
let random = {
    _data: (function () {
        let letters = 'abcdefghiklmnopqrstuvwxyz';
        letters = (letters.toLowerCase() + letters.toUpperCase()).split('');
        let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];
        let all = letters.concat(numbers);

        return {
            letters: letters,
            numbers: numbers,
            all: all
        };
    })(),
    /**
     * 随机ID
     * @return 以字母开头的随机字符串
     */
    randomId: function () {
        return this.random(1, true, false) + this.random(3, true, true) + (new Date().getTime() % 10000000000);
    },
    random: function (count, letters, numbers) {
        if ((!letters && !numbers) || count <= 0) {
            return '';
        }
        let s = '';
        let data = (letters && numbers ? this._data.all : (letters ? this._data.letters : this._data.numbers));
        let min = 0;
        let max = data.length - 1;
        for (let i = 0; i < count; i++) {
            s += data[_.random(min, max)];
        }

        return s;
    }
};
module.exports = {
    formatDate2TodayStr,
    getServerCurrentTime,
    convertNumberWithHtml,
    convertNumberWithText,
    getCityList,
    formateDateToStr,
    formateDate,
    downloadFile,
    random,
    html,
    formatTimeToStr,
    formateDateToStr1,
    htmlUtil: htmlUtil,
    /**
     * 验证邮箱
     * @param email
     * @returns {boolean}
     */
    isEmail: function (email) {
        return /^[0-9a-zA-Z_.]+@(([0-9a-zA-Z]+)[.])+[a-z]{2,4}$/i.test(email); // 判断是否为邮箱
    },
    isDate: function (date) { // 判断是否为日期yyyy-mm-dd
        return /^(?:(?!0000)[0-9]{4}-(?:(?:0[1-9]|1[0-2])-(?:0[1-9]|1[0-9]|2[0-8])|(?:0[13-9]|1[0-2])-(?:29|30)|(?:0[13578]|1[02])-31)|(?:[0-9]{2}(?:0[48]|[2468][048]|[13579][26])|(?:0[48]|[2468][048]|[13579][26])00)-02-29)$/.test(date);
    }
};
