<template>
<div>
<!--  <input type="text" placeholder="输入你的名字 并登陆" v-model="myName">-->
  <input type="text" placeholder="输入你的名字 并登陆">
  <button v-on:click="login">登陆</button><p/>
  <input type="text" v-model="message" placeholder="message">
  <button v-on:click="sendMessage('hello i am jack')">发送</button><p/>
</div>
</template>

<script>
import { CPSTim } from '../dependence'
export default {
  name: 'chatAbs',
  data: function () {
    return {
      tim
    }
  },
  mounted () {
    let that = this
    console.log(this)
    console.log('in mounted')
    that.tim = new CPSTim('jack')
    console.log(this.tim)
  },
  methods: {
    login: function () {
      this.tim.login()
    },
    sendMessage: function (message) {
      this.tim.sendMessage(message)
    }
  }
}
</script>

<style scoped>

</style>
