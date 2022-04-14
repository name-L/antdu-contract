import eventBus from '../utils/event-bus';

/**
 * 事件总线mixins
 */
export default {
    created: function () {
        this.$options.bindEvents = {};
        for (let eventId in this.$options.events) {
            this.$options.bindEvents[eventId] = this.$options.events[eventId].bind(this);
            eventBus.$on(eventId, this.$options.bindEvents[eventId]);
        }
    },
    beforeDestroy: function () {
        for (let eventId in this.$options.bindEvents) {
            eventBus.$off(eventId, this.$options.bindEvents[eventId]);
            this.$options.bindEvents[eventId] = null;
        }
    }
};
