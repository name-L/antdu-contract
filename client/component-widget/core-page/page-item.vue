<script>
    export default {
        props: {
            page: {
                type: Object
            },
            index: Number
        },
        render (createElement) {
            let child = [];
            let content = this.page.content;
            let itemOpt = {
                'class': ['page', this.page.classes],
                'domProps': {}
            };
            let getChildOpt = function (props) {
                return {
                    'props': Object.assign({}, props, {})
                };
            };
            let prepareChild = function (obj) {
                if (!obj || typeof obj !== 'object') { return; }
                if (obj.component && typeof obj.component === 'object') {
                    child.push(createElement(obj.component, getChildOpt.call(this, obj.props)));
                } else {
                    child.push(createElement(obj, getChildOpt.call(this, {})));
                }
            };
            // child component 的初始化处理
            if (typeof content === 'string') {
                itemOpt['domProps']['innerHTML'] = content;
            } else if (Array.isArray(content)) {
                content.forEach((obj) => { prepareChild.call(this, obj); });
            } else {
                prepareChild.call(this, content);
            }
            // 创建 page 元素
            return createElement('section', itemOpt, child);
        }
    };
</script>
