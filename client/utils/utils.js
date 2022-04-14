import format from './time-format';
const MOMENT_DATE_FORMAT = 'YYYY-MM-DD';
var moment = require('moment');

// const momentMap = {
//     'w': 'weeks',
//     'm': 'months'
// };
// 获取日期字符串
exports.getDateStr = function (dateStr) {
    dateStr += '';
    if (dateStr === '0') {
        return dateStr;
    }
    if (/^\d+$/.test(dateStr)) {
        dateStr = moment(new Date(+dateStr)).format(MOMENT_DATE_FORMAT);
    } else if (/^-/.test(dateStr)) {
        dateStr = '0';
    }
    return dateStr;
};
// 获取时间戳 开始时间00:00:00 结束时间00:00:00
exports.getMilliseconds = function (dateStr, endTimeEndOfDay) {
    if (dateStr === '0') {
        return dateStr;
    }
    if (!dateStr) {
        return '';
    }
    let momentObj = moment(dateStr, MOMENT_DATE_FORMAT);
    if (endTimeEndOfDay) {
        momentObj.endOf('day');
    } else {
        momentObj.startOf('day');
    }
    return momentObj.toDate().getTime();
};

// 获取今天的开始、结束时间
exports.getTodayTime = function () {
    var startTime = moment().format(MOMENT_DATE_FORMAT);
    var endTime = moment().format(MOMENT_DATE_FORMAT);
    return { startTime, endTime };
};

// 获取昨天的开始、结束时间
exports.getYesterdayTime = function () {
    var startTime = moment().subtract(1, 'days').format(MOMENT_DATE_FORMAT);
    var endTime = moment().subtract(1, 'days').format(MOMENT_DATE_FORMAT);
    return { startTime, endTime };
};

// 获取本周的开始、结束时间
exports.getThisWeekTime = function (endOfToday) {
    var startTime = moment().weekday(0).format(MOMENT_DATE_FORMAT);
    var endTime = '';
    if (endOfToday) {
        // 截止到今天
        endTime = moment().format(MOMENT_DATE_FORMAT);
    } else {
        // 截止到周日
        endTime = moment().weekday(6).format(MOMENT_DATE_FORMAT);
    }
    return { startTime, endTime };
};

// 获取上周的开始、结束时间
exports.getLastWeekTime = function () {
    var startTime = moment().weekday(0).subtract(7, 'days').format(MOMENT_DATE_FORMAT);
    var endTime = moment().weekday(6).subtract(7, 'days').format(MOMENT_DATE_FORMAT);
    return { startTime, endTime };
};

// 获取本月的开始、结束时间
exports.getThisMonthTime = function () {
    var startTime = moment().date(1).format(MOMENT_DATE_FORMAT);
    var endTime = moment().add(1, 'month').date(1).subtract(1, 'day').format(MOMENT_DATE_FORMAT);
    return { startTime, endTime };
};

// 获取上月的开始、结束时间
exports.getLastMonthTime = function () {
    var startTime = moment().date(1).subtract('1', 'months').format(MOMENT_DATE_FORMAT);
    var endTime = moment().date(1).subtract(1, 'day').format(MOMENT_DATE_FORMAT);
    return { startTime, endTime };
};

// 获取一周时间
exports.getOneWeekTime = function () {
    return {
        startTime: moment().format(MOMENT_DATE_FORMAT),
        endTime: moment().add(7, 'days')
    };
};
// 获取半个月时间
exports.getHalfAMonthTime = function () {
    return {
        startTime: moment().format(MOMENT_DATE_FORMAT),
        endTime: moment().add(15, 'days').format(MOMENT_DATE_FORMAT)
    };
};
// 获取月份时间
exports.getMonthTime = function (num) {
    return {
        startTime: moment().format(MOMENT_DATE_FORMAT),
        endTime: moment().add(num, 'month').format(MOMENT_DATE_FORMAT)
    };
};
// 获取永久时间
exports.getForeverTime = function () {
    return {
        startTime: moment().format(MOMENT_DATE_FORMAT),
        endTime: '0'
    };
};
// 获取全部时间
exports.getAllTime = function () {
    return {
        startTime: '',
        endTime: ''
    };
};
// t-模式时间 开始时间
exports.getDateTime = function (data, hour, Minutes) {
    let date = moment().add(-1 * data, 'days').date();
    let month = moment().add(-1 * data, 'days').month() + 1;
    let time = moment().set({ mouth: month, date: date, hour: hour, Minutes: Minutes, second: 0 });
    // time = time.format(format.DATE_TIME_FORMAT);
    time = moment(time, format.DATE_TIME_FORMAT);
    time = time.toDate().getTime();
    return {
        startTime: time
    };
};
// 结束时间
exports.getSecondTime = function (hour, Minutes) {
    let time = moment().set({ hour: hour, Minutes: Minutes, second: 0 });
    // time = time.format(format.DATE_TIME_FORMAT);
    time = moment(time, format.DATE_TIME_FORMAT);
    time = time.toDate().getTime();
    return {
        startTime: time
    };
};

// 近一天的时间
exports.getNearlyDayTime = function () {
    return {
        startTime: moment().add(-1, 'days').format(MOMENT_DATE_FORMAT),
        endTime: moment().format(MOMENT_DATE_FORMAT)
    };
};
// 近一周的时间
exports.getNearlyWeekTime = function () {
    return {
        startTime: moment().add(-7, 'days'),
        endTime: moment().format(MOMENT_DATE_FORMAT)
    };
};

// 近一月的时间
exports.getNearlyMonthTime = function () {
    return {
        startTime: moment().subtract(1, 'months').format(MOMENT_DATE_FORMAT),
        endTime: moment().format(MOMENT_DATE_FORMAT)
    };
};

// 近一季度的时间
exports.getNearlyQuarterTime = function () {
    return {
        startTime: moment().subtract(1, 'quarter').format(MOMENT_DATE_FORMAT),
        endTime: moment().format(MOMENT_DATE_FORMAT)
    };
};

// 近一年的时间
exports.getNearlyYearTime = function () {
    return {
        startTime: moment().subtract(1, 'year').format(MOMENT_DATE_FORMAT),
        endTime: moment().format(MOMENT_DATE_FORMAT)
    };
};
// // 获取最近时间
// exports.getLastTime = function (word) {
//     var result = /-(\d+)([mw])/.exec(word);
//     if (!result) {
//         throw 'date-selector/utils getLastTime Error , please check arguments';
//     }
//     var unit = momentMap[result[2]];
//     var startTime = moment().subtract(result[1], unit).format(MOMENT_DATE_FORMAT);
//     var endTime = moment().format(MOMENT_DATE_FORMAT);
//     return {
//         startTime: startTime,
//         endTime: endTime
//     };
// };

// 获取自然时间单位
exports.getNatureUnit = function (startTime, endTime) {
    // if (!startTime && !endTime) {
    //     return 'month';
    // }
    var result = {
        startTime: startTime,
        endTime: endTime
    };
    var startMoment = moment(new Date(+result.startTime));
    var endMoment = moment(new Date(+result.endTime));
    var daysMinus = endMoment.diff(startMoment, 'days');
    if (daysMinus <= 1) {
        return 'day';
    } else if (daysMinus <= 7) {
        return 'week';
    } else {
        return 'month';
    }
};

// 对时间戳进行处理
exports.handleDateRange = function (startTime, endTime, hour) {
    let timestamp = (endTime - startTime) / 1000;
    let time = Math.floor(timestamp / (24 * 3600));
    return time;
};

// // 返回按照 自然日、自然周、自然月 的横轴时间
// exports.getNaturalDate = function (list, unit) {
//     var yearMap = {};
//     var result = list.map(function (obj, idx) {
//         var concat = '';
//         var startMoment = moment(obj.starttime);
//         var endMoment = moment(obj.endtime);
//         if (!startMoment.isValid() || !endMoment.isValid()) {
//             return '';
//         }
//         if (unit === 'day') {
//             concat = startMoment.format(date.DATE_MONTH_DAY_FORMAT);
//         } else if (unit === 'week') {
//             var startDate = startMoment.format(date.DATE_MONTH_DAY_FORMAT);
//             var endDate = endMoment.format(date.DATE_MONTH_DAY_FORMAT);
//             concat = startDate + '~' + endDate;
//         } else {
//             var startDate = startMoment.format(date.DATE_MONTH_DAY_FORMAT);
//             var endDate = endMoment.format(date.DATE_MONTH_DAY_FORMAT);
//             var days = moment(obj.starttime).daysInMonth();
//             var diff = endMoment.diff(startMoment, 'days');
//             if ((diff + 1) != days) {
//                 concat = startDate + '~' + endDate;
//             } else {
//                 concat = startMoment.format('MM');
//             }
//         }
//         var year = startMoment.format('YYYY');
//         if (!yearMap[year]) {
//             yearMap[year] = true;
//             concat += '\n' + year;
//         }
//         return concat;
//     });
//     return result;
// };
