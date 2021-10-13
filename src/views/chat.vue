<template>
<div>
  <h1>this is a chat page</h1>
  <input type="text" placeholder="输入你的名字 并登陆" v-model="myName">
  <button v-on:click="TIMLoginWithoutID">登陆</button><p/>
  <input type="text" v-model="message" placeholder="message">to <input type="text" placeholder="对方的名字" v-model="targetName">
  <button v-on:click="sendMessage">发送</button><p/>
  <button v-on:click="TIMLogoutWithoutID">登出</button>
</div>
</template>

<script>
import TIM from 'tim-js-sdk'
import TIMUploadPlugin from 'tim-upload-plugin'
let options = {
  SDKAppID: 1400561810
}
// 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
let tim = TIM.create(options) // SDK 实例通常用 tim 表示
export default {
  name: 'chat',
  mounted () {
    console.log('正在执行初始化钩子函数')
    // 设置 SDK 日志输出级别，详细分级请参见 <a href="https://web.sdk.qcloud.com/im/doc/zh-cn//SDK.html#setLogLevel">setLogLevel 接口的说明</a>
    tim.setLogLevel(0) // 普通级别，日志量较多，接入时建议使用
    // tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用

    // 注册腾讯云即时通信 IM 上传插件
    tim.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin })
    // 监听事件，例如：
    tim.on(TIM.EVENT.SDK_READY, function (event) {
      // 收到离线消息和会话列表同步完毕通知，接入侧可以调用 sendMessage 等需要鉴权的接口
      // event.name - TIM.EVENT.SDK_READY
    })
    tim.on(TIM.EVENT.MESSAGE_RECEIVED, function (event) {
      // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
      // event.name - TIM.EVENT.MESSAGE_RECEIVED
      // event.data - 存储 Message 对象的数组 - [Message]
      for (var i = 0; i < event.data.length; i++) {
        console.log(event.data[i])
      }
    })
    tim.on(TIM.EVENT.MESSAGE_REVOKED, function (event) {
      // 收到消息被撤回的通知
      // event.name - TIM.EVENT.MESSAGE_REVOKED
      // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
    })
    tim.on(TIM.EVENT.MESSAGE_READ_BY_PEER, function (event) {
      // SDK 收到对端已读消息的通知，即已读回执。使用前需要将 SDK 版本升级至 v2.7.0 或以上。仅支持单聊会话。
      // event.name - TIM.EVENT.MESSAGE_READ_BY_PEER
      // event.data - event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isPeerRead 属性值为 true
    })
    tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function (event) {
      // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
      // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
      // event.data - 存储 Conversation 对象的数组 - [Conversation]
    })
    tim.on(TIM.EVENT.GROUP_LIST_UPDATED, function (event) {
      // 收到群组列表更新通知，可通过遍历 event.data 获取群组列表数据并渲染到页面
      // event.name - TIM.EVENT.GROUP_LIST_UPDATED
      // event.data - 存储 Group 对象的数组 - [Group]
    })
    tim.on(TIM.EVENT.PROFILE_UPDATED, function (event) {
      // 收到自己或好友的资料变更通知
      // event.name - TIM.EVENT.PROFILE_UPDATED
      // event.data - 存储 Profile 对象的数组 - [Profile]
    })
    tim.on(TIM.EVENT.BLACKLIST_UPDATED, function (event) {
      // 收到黑名单列表更新通知
      // event.name - TIM.EVENT.BLACKLIST_UPDATED
      // event.data - 存储 userID 的数组 - [userID]
    })
    tim.on(TIM.EVENT.ERROR, function (event) {
      // 收到 SDK 发生错误通知，可以获取错误码和错误信息
      // event.name - TIM.EVENT.ERROR
      // event.data.code - 错误码
      // event.data.message - 错误信息
    })
    tim.on(TIM.EVENT.SDK_NOT_READY, function (event) {
      // 收到 SDK 进入 not ready 状态通知，此时 SDK 无法正常工作
      // event.name - TIM.EVENT.SDK_NOT_READY
    })
    tim.on(TIM.EVENT.KICKED_OUT, function (event) {
      // 收到被踢下线通知
      // event.name - TIM.EVENT.KICKED_OUT
      // event.data.type - 被踢下线的原因，例如:
      //    - TIM.TYPES.KICKED_OUT_MULT_ACCOUNT 多实例登录被踢
      //    - TIM.TYPES.KICKED_OUT_MULT_DEVICE 多终端登录被踢
      //    - TIM.TYPES.KICKED_OUT_USERSIG_EXPIRED 签名过期被踢 （v2.4.0起支持）。
    })
    tim.on(TIM.EVENT.NET_STATE_CHANGE, function (event) {
      //  网络状态发生改变（v2.5.0 起支持）。
      // event.name - TIM.EVENT.NET_STATE_CHANGE
      // event.data.state 当前网络状态，枚举值及说明如下：
      //     \- TIM.TYPES.NET_STATE_CONNECTED - 已接入网络
      //     \- TIM.TYPES.NET_STATE_CONNECTING - 连接中。很可能遇到网络抖动，SDK 在重试。接入侧可根据此状态提示“当前网络不稳定”或“连接中”
      //    \- TIM.TYPES.NET_STATE_DISCONNECTED - 未接入网络。接入侧可根据此状态提示“当前网络不可用”。SDK 仍会继续重试，若用户网络恢复，SDK 会自动同步消息
    })
    console.log('tim初始化成功，可以开始登陆')
  },
  data: function () {
    return {
      message: '',
      myName: '',
      targetName: ''
    }
  },
  methods: {
    TIMLoginWithoutID: function () {
      this.timLogin(this.myName)
    },
    timLogin: function (userID) {
      let usersig
      let xml = new XMLHttpRequest()
      xml.withCredentials = true
      xml.onreadystatechange = function () {
        if (xml.readyState === 4 && xml.status === 200) {
          console.log('成功获得usersig')
          console.log(userID)
          usersig = xml.responseText
          tim.login({ userID: userID, userSig: usersig })
        }
      }
      let params = 'userID=' + userID
      xml.open('GET', 'http://127.0.0.1:3000/login/usersig?' + params, true)
      xml.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      console.log('开始请求usersig')
      xml.send()
    },
    TIMLogoutWithoutID: function () {
      this.timLogout()
    },
    timLogout: function () {
      tim.logout()
    },
    sendMessage: function () {
      console.log(this.message)
      console.log(this.targetName)
      let message = tim.createTextMessage({
        to: this.targetName,
        conversationType: TIM.TYPES.CONV_C2C,
        // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
        // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
        // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
        payload: {
          text: this.message
        }
      })
      // 2. 发送消息
      let promise = tim.sendMessage(message)
      promise.then(function (imResponse) {
        // 发送成功
        console.log(imResponse)
        console.log('消息发送成功！')
      }).catch(function (imError) {
        // 发送失败
        console.warn('sendMessage error:', imError)
      })
    }
  }
}
</script>

<style scoped>

</style>
