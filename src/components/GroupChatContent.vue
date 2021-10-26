<template>
<div class="msgBox">
<!--  渲染每行聊天消息-->
  <div class="chatline"  v-for="(item,index) in groupMessageList" :key="index">
<ChatLine
  :owner-i-d = ownerID
  :message = item>
</ChatLine>
    </div>
  <div class="t"></div>
</div>
</template>

<script>
import ChatLine from '@/components/ChatLine'
export default {
  name: 'GroupChatContent',
  props: {
    groupMessageList: [],
    ownerID: String
  },
  components: {
    ChatLine
  }
}
</script>

<style scoped>
.msgBox {
  display: flex;
  flex-direction: column;
  border: solid dimgray;
  /*// height: 200px;*/
  overflow: hidden;
}
.chatline{
  height:50px;
  background-color: #ffffff;
}
.t{
  height: 50px;
  background-color: #2c3e50;
}
</style>
