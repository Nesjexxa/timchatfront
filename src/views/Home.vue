<template>
  <div class="home">
    <img alt="Vue logo" src="../assets/logo.png">
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App"/>
    <showChatRecord></showChatRecord>
    <input type="button" value="点击获取" @click="get()"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import HelloWorld from '@/components/HelloWorld.vue' // @ is an alias to /src
import showChatRecord from '@/components/showChatRecord.vue'

@Component({
  components: {
    HelloWorld,
    showChatRecord
  }
})
export default class Home extends Vue {}
</script>
