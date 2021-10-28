<template>
<div>
<!--  <input type="text" placeholder="输入你的名字 并登陆" v-model="myName">-->
  <input type="text" placeholder="输入你的名字 并登陆" v-model="id">
  <button v-on:click="login">登陆</button><p/>
  <button v-on:click="getList">获得当前聊天信息列表</button><p/>
<!--  <input type="text" v-model="message" placeholder="message">-->
  <button v-on:click="sendMessage('hello i am jack')">发送</button><p/>
  <button v-on:click="logout">登出</button><p/>
</div>
</template>

<script>
import { CPSTim } from '../dependence'
export default {
  name: 'chatAbs',
  data: function () {
    return {
      tim,
      id
    }
  },
  mounted () {
  },
  methods: {
    login: function () {
      this.tim = new CPSTim(this.id)
    },
    sendMessage: function (message) {
      this.tim.sendMessage(message)
    },
    getList: function () {
      console.log(this.tim.groupmsgList)
    },
    logout: function () {
      this.tim.logout()
    }
  }
}
</script>

<style scoped>

</style>
