<div id="entry-loading" class="theme-{{theme}}">
    <style type="text/css">
        #entry-loading {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            z-index: 1000;
            opacity: 1;
            background: transparent url("../../../../client/asset/image/loading/animated-loader.gif") no-repeat center center;
            background-color: white;
        }

        #entry-loading.animate {
            -webkit-transition: all 320ms linear;
            -o-transition: all 320ms linear;
            transition: all 320ms linear;
        }

        #entry-loading.hide {
            opacity: 0;
        }

        #entry-loading.theme-dark {
            background-color: #222;
        }
    </style>
    <script type="text/javascript">
        <%# /**
         * 隐藏首次加载动画
         * @param withAnimate {boolean} 是否以动画形式隐藏
         * @param delayTime {int} 延迟隐藏的时间（单位：ms）
         */ #%>
        window.Util.hideEntryLoading = function (withAnimate, delayTime) {
            var loading = document.getElementById('entry-loading');
            var time = Number.isFinite(delayTime) ? delayTime : 0;
            setTimeout(function () {
                if (!withAnimate) {
                    loading.parentNode.removeChild(loading);
                } else {
                    loading.setAttribute('class', loading.getAttribute('class') + ' animate hide');
                    <%# 注意: 这个 400ms 需要根据 entry-loading.tpl 中 aimate 样式的动画时间来定 #%>
                    setTimeout(function () { loading.parentNode.removeChild(loading); }, 400);
                }
            }, time || 0);
            <%# 隐藏之后，删除无用的引用 #%>
            delete window.Util.hideEntryLoading;
        }
    </script>
    <%# -------- #%>
</div>