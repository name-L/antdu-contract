<template>
  <div class="ef-message-list">
    <ef-message v-for="(message,index) in messages"
                :key="index"
                :id=message.id
                :content=message.content
                :type=message.type
                :duration=message.duration
                :closeable=message.closeable
                :on-close=message.onClose>
    </ef-message>
  </div>
</template>

<script type="text/babel">
  import efMessage from './ef-message.vue';

  let number = 0;
  function getUuid () {
      return 'ef_message_' + Date.now() + '_' + (number++);
  }

  export default {
      props: {
          content: {
              type: String,
              default: ''
          }
      },
      data () {
          return {
              messages: []
          };
      },
      computed: {},
      components: {
          efMessage
      },
      mounted () {
  
      },
      methods: {
          open (messageProps) {
              let message = Object.assign({
                  id: messageProps.id ? messageProps.id : getUuid()
              }, messageProps);
              this.messages.push(message);
          },
          close (id) {
              this.messages = this.messages.filter((message) => message.id !== id);
          }
      }
  };
</script>

<style lang="less" rel="stylesheet/less">
  .ef-message-list {

  }
</style>


