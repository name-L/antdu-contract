<%#
    browserCheck: {
        // 检测通过后，是否调用 window.resize 方法
        resize: boolean,
        // 初始的皮肤设置（目前只支持 white 或 其它任意值【就是黑色】）
        theme: 'white' || other,
        i18n: {
            check-sorry: '',
            check-firefox: '',
            check-ie: '',
            check-chrome: '',
            check-recommend: ''
        }
    }
#%>
<style type="text/css" id="browserCheckerHideStyle1"> html {overflow: hidden} div { display: none; } </style>
<style type="text/css">
    .alter_info_box {
        padding: 0; margin: 0;
        position: absolute; top: 50%; left: 50%; z-index: 99999;
        color: white; font-size: 14px;
    }
    .alter_info_box p {
        padding: 5px 15px; margin: 0 0 9px; font-size: 16px; line-height: 18px; overflow: hidden;
    }
    .alter_info_box, .alter_info_box .box {
        width: 600px; height: 170px; padding: 20px 10px 10px 10px;
    }
    .alter_info_box .box {
        -webkit-box-sizing: content-box; -moz-box-sizing: content-box; box-sizing: content-box;
        position: relative; text-align: center; margin: -110px -310px; border: 2px solid #666;
    }
    .alter_info_box a {
        padding: 0 15px; text-decoration: none; outline: 0; cursor: pointer; color: #53a0e7;
    }
    .alter_info_box a:hover {
        text-decoration: underline; color: white;
    }
    .alter_info_box .sorry {
        font-size: 30px; height: 80px; line-height: 40px; text-align: left;
    }
    .alter_info_box .recommendLabel, .alter_info_box a {
        margin-top: 40px; float: right;
    }
    .alter_info_box.white {
        color: black;
    }
    .alter_info_box.white .box {
        border-color: #ddd;
    }
    .alter_info_box.white a:hover {
        color: black;
    }
</style>
<script type="text/javascript">
    <%# -- 设置背景颜色 -- #%>
    if ('{{browserCheck.theme}}' === 'white') {
        document.write('<style type="text/css" id="browserCheckerHideStyle2"> body { margin:0; background:white } </style>');
    } else {
        document.write('<style type="text/css" id="browserCheckerHideStyle2"> body { margin:0; background:#222; } </style>');
    }
    <%# -- 执行判断逻辑 -- #%>
    (function () {
        var jsType = '', browserType = '', browserVersion = '', osName = '';
        var ua = navigator.userAgent.toLowerCase();
        var check = function (r) { return r.test(ua); };
        var DOC = document;
        var isStrict = DOC.compatMode === "CSS1Compat";
        var isOpera = check(/opera/);
        var isChrome = check(/chrome/);
        var isWebKit = check(/webkit/);
        var isSafari = !isChrome && check(/safari/);
        var isSafari2 = isSafari && check(/applewebkit\/4/);
        var isSafari3 = isSafari && check(/version\/3/);
        var isSafari4 = isSafari && check(/version\/4/);
        var isIE = !isOpera && (check(/msie/) || check(/trident/));
        var isIE7 = isIE && check(/msie 7/);
        var isIE8 = isIE && check(/msie 8/);
        var isIE6 = isIE && !isIE7 && !isIE8;
        var isGecko = !isWebKit && check(/gecko/);
        var isGecko2 = isGecko && check(/rv:1\.8/);
        var isGecko3 = isGecko && check(/rv:1\.9/);
        var isBorderBox = isIE && !isStrict;
        var isWindows = check(/windows|win32/);
        var isMac = check(/macintosh|mac os x/);
        var isAir = check(/adobeair/);
        var isLinux = check(/linux/);
        var isSecure = /^https/i.test(window.location.protocol);
        var isIE7InIE8 = isIE7 && DOC.documentMode === 7;
        var isEdge = check(/edge/);
        var versionStart, versionEnd;

        if (isWindows) {
            osName = 'Windows';
            if (check(/windows nt/)) {
                var start = ua.indexOf('windows nt');
                var end = ua.indexOf(';', start);
                osName = ua.substring(start, end);
            }
        } else {
            osName = isMac ? 'Mac' : isLinux ? 'Linux' : 'Other';
        }
        if (isIE) {
            browserType = 'IE';
            jsType = 'IE';
            versionStart = ua.indexOf('msie') + 5;
            if (versionStart === 4) {
                versionStart = ua.indexOf('rv:') + 3;
                versionEnd = ua.indexOf(')', versionStart);
                if (versionEnd === -1) {
                    versionEnd = ua.indexOf(';', versionStart);
                }
            } else {
                versionEnd = ua.indexOf(';', versionStart);
            }
            browserVersion = ua.substring(versionStart, versionEnd);
            jsType = isIE6 ? 'IE6' : isIE7 ? 'IE7' : isIE8 ? 'IE8' : 'IE';
        } else if (isGecko) {
            var isFF = check(/firefox/);
            browserType = isFF ? 'Firefox' : 'Others';
            jsType = isGecko2 ? 'Gecko2' : isGecko3 ? 'Gecko3' : 'Gecko';
            if (isFF) {
                versionStart = ua.indexOf('firefox') + 8;
                versionEnd = ua.indexOf(' ', versionStart);
                if (versionEnd === -1) {
                    versionEnd = ua.length;
                }
                browserVersion = ua.substring(versionStart, versionEnd);
            }
        } else if (isEdge) {
            browserType = 'Edge';
            jsType = isWebKit ? 'Web Kit' : 'Other';
            versionStart = ua.indexOf('edge') + 5;
            browserVersion = ua.substring(versionStart);
        } else if (isChrome) {
            browserType = 'Chrome';
            jsType = isWebKit ? 'Web Kit' : 'Other';
            versionStart = ua.indexOf('chrome') + 7;
            versionEnd = ua.indexOf(' ', versionStart);
            browserVersion = ua.substring(versionStart, versionEnd);
        } else {
            browserType = isOpera ? 'Opera' : isSafari ? 'Safari' : '';
        }

        <%// --------------- 分隔线 -------- %>

        var whenReady = (function () {
            var funcs = [], ready = false, handler = function (e) {
                if (ready) return;
                if (e.type === 'onreadystatechange' && document.readyState !== 'complete') { return; }
                for (var i = 0; i < funcs.length; i++) {
                    funcs[i].call(document);
                }
                ready = true;
                funcs = null;
            }
            if (document.addEventListener) {
                document.addEventListener('DOMContentLoaded', handler, false);
                document.addEventListener('readystatechange', handler, false);
                window.addEventListener('load', handler, false);
            } else if (document.attachEvent) {
                document.attachEvent('onreadystatechange', handler);
                window.attachEvent('onload', handler);
            }
            return function (fn) {
                if (ready) { fn.call(document); } else { funcs.push(fn); }
            }
        })();

        whenReady(function () {
            document.getElementById("browserCheckerHideStyle1").disabled = true;
            if ((browserType === "IE" && parseFloat(browserVersion) >= 10) || isChrome || isFF || isWebKit || isEdge) {
                document.getElementById("browserCheckerHideStyle2").disabled = true;
                if({{browserCheck.resize}}){ window.onresize && window.onresize(); }
            } else {
                document.getElementsByTagName("body")[0].innerHTML = //
                    "<div class='alter_info_box {{browserCheck.theme}}'>" + //
                    "  <div class='box'>" + //
                    "    <p class='sorry'>{{browserCheck['i18n']['check-sorry']}} (<span class='_browser'>" + browserType + "&nbsp;" + parseInt(browserVersion) + "</span>) 。</p>" + //
                    "    <p>" + //
                    "      <a href='http://firefox.com.cn/download'>{{browserCheck['i18n']['check-firefox']}}</a>" + //
                    "      <a href='http://windows.microsoft.com/zh-cn/internet-explorer/download-ie'>{{browserCheck['i18n']['check-ie']}}</a>" + //
                    "      <a href='http://www.google.com.hk/chrome/eula.html?hl=zh-CN'>{{browserCheck['i18n']['check-chrome']}}</a>" + //
                    "      <span class='recommendLabel'>{{browserCheck['i18n']['check-recommend']}}: </span>" + //
                    "    </p>" + //
                    "  </div>" + //
                    "</div>";
            }
        });

    })();
</script>
