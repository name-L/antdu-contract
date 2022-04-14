import MessageManager from './ef-message-manager.vue';
import Vue from 'vue';

let messageInstance;
MessageManager.newInstance = (props = {}) => {
    const div = document.createElement('div');
    document.body.appendChild(div);

    let managerManagerWrap = new Vue({
        el: div,
        render: (createElement) => createElement(MessageManager, {props: {}})
    });

    const messageManager = managerManagerWrap.$children[0];

    return {
        message (messageProps) {
            messageManager.open(messageProps);
        }
    };
};

function message (content, duration, onClose, closeable = false, type) {
    messageInstance = messageInstance || MessageManager.newInstance();
    messageInstance.message({
        content: `<span>${content}</span>`,
        type: type,
        duration: typeof duration === 'number' ? duration : 2,
        onClose: onClose,
        closeable: closeable
    });
}

// Vue.mixin({
//     methods: {
//         /**
//          *  一般信息提示
//          * @param content
//          * @param duration
//          * @param closeable
//          * @param onClose
//          * @returns {*}
//          */
//         info (content, duration, closeable, onClose) {
//             return message(content, duration, onClose, closeable, 'info');
//         },
//         /**
//          * 成功提示
//          * @param content
//          * @param duration
//          * @param closeable
//          * @param onClose
//          * @returns {*}
//          */
//         success (content, duration, closeable, onClose) {
//             return message(content, duration, onClose, closeable, 'success');
//         },
//         /**
//          * 错误提示
//          * @param content
//          * @param duration
//          * @param closeable
//          * @param onClose
//          * @returns {*}
//          */
//         error (content, duration, closeable, onClose) {
//             return message(content, duration, onClose, closeable, 'error');
//         },
//         /**
//          * 警告提示
//          * @param content
//          * @param duration
//          * @param closeable
//          * @param onClose
//          * @returns {*}
//          */
//         warn (content, duration, closeable, onClose) {
//             return message(content, duration, onClose, closeable, 'warn');
//         }
//     }
// });

const messageMixin = {
    methods: {
        /**
         *  一般信息提示
         * @param content
         * @param duration
         * @param closeable
         * @param onClose
         * @returns {*}
         */
        messageInfo (content, duration, closeable, onClose) {
            return message(content, duration, onClose, closeable, 'info');
        },
        /**
         * 成功提示
         * @param content
         * @param duration
         * @param closeable
         * @param onClose
         * @returns {*}
         */
        messageSuccess (content, duration, closeable, onClose) {
            return message(content, duration, onClose, closeable, 'success');
        },
        /**
         * 错误提示
         * @param content
         * @param duration
         * @param closeable
         * @param onClose
         * @returns {*}
         */
        messageError (content, duration, closeable, onClose) {
            return message(content, duration, onClose, closeable, 'error');
        },
        /**
         * 警告提示
         * @param content
         * @param duration
         * @param closeable
         * @param onClose
         * @returns {*}
         */
        messageWarn (content, duration, closeable, onClose) {
            return message(content, duration, onClose, closeable, 'warn');
        }
    }
};
export default messageMixin;
