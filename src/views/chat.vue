<template>
<div>
  <h1>this is a chat page</h1>
  <div id="msgbox" class="msgbox">
    <div id="userMsg" v-for="(i, index) in  GroupmsgList " :key="index">
      <div :class="i.from == myName?'user-head-myself':'user-head-others'">
        <img src="../assets/headpng.png" alt="图片加载失败" class="user-head">
      </div>
      <div class="user-msg">
        {{i.sendTime}}
        {{i.payload.text}}
      </div>
    </div>
  </div>
  <input type="text" placeholder="输入你的名字 并登陆" v-model="myName">
  <button v-on:click="TIMLoginWithoutID">登陆</button><p/>
  <button v-on:click="Netping">网络测试</button><p/>
  <button v-on:click="NetpingLocation">本地网络测试</button><p/>
  <input type="text" v-model="message" placeholder="message">
<!--  <input type="text" v-model="message" placeholder="message">to <input type="text" placeholder="对方的名字" v-model="targetName">-->
  <button v-on:click="sendMessage">发送</button><p/>
  <button v-on:click="TIMLogoutWithoutID">登出</button><p/>
  <input type="text" v-model="createdGroupID" placeholder="自定义群id"><p/>
  <button v-on:click="TIMCreateGroup">创建群聊</button><p/>
  <button v-on:click="TIMDismissGroup">删除群聊</button><P/>
  <input type="text" v-model="groupIDBeJoin" placeholder="群组id"> add <input type="text" placeholder="对方的名字" v-model="joinedMemberID">
  <button v-on:click="TIMAddMember2Group()">添加群成员</button><p/>
  <input type="text" v-model="groupIDBeDelete" placeholder="群组id"> delete <input type="text" placeholder="对方的名字" v-model="deletedMemberID">
  <button v-on:click="TIMDeleteMember2Group()">删除群成员</button><p/>
  <GroupChatContent
    v-if="GroupmsgList.length != 0"
    :group-message-list="GroupmsgList"
    :owner-i-d="myName"></GroupChatContent>
</div>
</template>

<script>
import TIM from 'tim-js-sdk'
import TIMUploadPlugin from 'tim-upload-plugin'
import GroupChatContent from '@/components/GroupChatContent'
import axios from 'axios'
let options = {
  SDKAppID: 1400561810
}
// 创建 SDK 实例，`TIM.create()`方法对于同一个 `SDKAppID` 只会返回同一份实例
let tim = TIM.create(options) // SDK 实例通常用 tim 表示
export default {
  name: 'chat',
  mounted () {
    this.initTIM()
    // this.initTargetGroup()
  },
  data: function () {
    return {
      message: '',
      myName: '',
      targetName: '',
      C2CmsgList: [],
      GroupmsgList: [],
      SYSmsgList: [],
      groupIDBeJoin: '',
      joinedMemberID: '',
      groupIDBeDelete: '',
      deletedMemberID: '',
      createdGroupID: ''
    }
  },
  components: {
    GroupChatContent
  },

  methods: {
    initTIM: function () {
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
        // 自己发送的信息，不会触发新消息提示
        console.log(event)
        this.getNewMessageByMR(event)
      }.bind(this))
      tim.on(TIM.EVENT.MESSAGE_REVOKED, function (event) {
        // 收到消息被撤回的通知
        // event.name - TIM.EVENT.MESSAGE_REVOKED
        // event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isRevoked 属性值为 true
        console.log('收到消息回调' + event.name)
      })
      tim.on(TIM.EVENT.MESSAGE_READ_BY_PEER, function (event) {
        // SDK 收到对端已读消息的通知，即已读回执。使用前需要将 SDK 版本升级至 v2.7.0 或以上。仅支持单聊会话。
        // event.name - TIM.EVENT.MESSAGE_READ_BY_PEER
        // event.data - event.data - 存储 Message 对象的数组 - [Message] - 每个 Message 对象的 isPeerRead 属性值为 true
        console.log('收到消息回调' + event.name)
      })
      tim.on(TIM.EVENT.CONVERSATION_LIST_UPDATED, function (event) {
        // 收到会话列表更新通知，可通过遍历 event.data 获取会话列表数据并渲染到页面
        // event.name - TIM.EVENT.CONVERSATION_LIST_UPDATED
        // event.data - 存储 Conversation 对象的数组 - [Conversation]
        // 每次发送消息，会产生4个不同类型的event.data
        // 登陆后这个更新通知会被调用四次
        //   console.log(event)
        //   this.getNewMessage(event)
        // }.bind(this))
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
    // 在登陆后请求服务器传回自己所在的分组
    // 修改data中的targetName
    initTargetGroup: function () {
      console.log('in function inittargetgroup')
      console.log(this)
      let url = 'http://127.0.0.1:3001/tim/groupTarget?name=' + this.myName
      axios.get(url)
        .then((res) => {
          console.log(res.data)
          this.targetName = res.data
        })
    },
    TIMLoginWithoutID: function () {
      let Name = this.myName
      this.timLogin(Name)
    },
    // 依据userID登陆，关闭网页后会登出，刷新网页不会登出
    // 登陆时需要从服务器请求usersig
    // 登陆后同时获取群组信息
    timLogin: function (userID) {
      let usersig
      let params = 'userID=' + userID
      console.log('开始请求usersig')
      axios.get('http://127.0.0.1:3001/tim/usersig?' + params)
        .then((res) => {
          console.log('成功获得usersig')
          console.log(userID)
          usersig = res.data
          tim.login({ userID: userID, userSig: usersig })
          console.log('in function timlogin')
          console.log(this)
          this.initTargetGroup()
        })
      // let xml = new XMLHttpRequest()
      // xml.withCredentials = true
      // xml.onreadystatechange = function () {
      //   if (xml.readyState === 4 && xml.status === 200) {
      //     console.log('成功获得usersig')
      //     console.log(userID)
      //     usersig = xml.responseText
      //     tim.login({ userID: userID, userSig: usersig })
      //     this.initTargetGroup()
      //   }
      // }
      // let params = 'userID=' + userID
      // xml.open('GET', 'http://127.0.0.1:3000/login/usersig?' + params, true)
      // xml.setRequestHeader('Content-type', 'application/x-www-form-urlencoded')
      // console.log('开始请求usersig')
      // xml.send()
    },
    TIMLogoutWithoutID: function () {
      this.timLogout()
    },
    timLogout: function () {
      tim.logout()
    },

    // 发送群消息
    sendMessage: function () {
      console.log(this.message)
      console.log(this.targetName)
      let message = tim.createTextMessage({
        to: this.targetName,
        conversationType: TIM.TYPES.CONV_GROUP,
        // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
        // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
        // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
        payload: {
          text: this.message
        }
      })
      console.log(message)
      // 2. 发送消息
      let promise = tim.sendMessage(message)
      promise.then(function (imResponse) {
        // 发送成功
        this.getNewMessageByMyself(imResponse)
        console.log('消息发送成功！')
      }.bind(this)).catch(function (imError) {
        // 发送失败
        console.warn('sendMessage error:', imError)
      })
    },

    // 将ConversationListUpdateEvent回调函数传递的event解析成分别的单个消息，存入msgList
    getNewMessageByCLUE: function (event) {
      for (let i = 0; i < event.data.length; i++) {
        let msg = {
          from: '',
          payload: ''
        }
        msg.sendTime = event.data[i].lastMessage.lastTime
        msg.from = event.data[i].lastMessage.fromAccount
        msg.payload = event.data[i].lastMessage.payload
        console.log('这是第' + i + '个eventdata，它的id是' + event.data[i].conversationID)

        if (event.data[i].conversationID.substring(0, 5) === 'GROUP') {
          this.GroupmsgList.push(msg)
          console.log(msg)
        } else if (event.data[i].conversationID.substring(0, 3) === 'C2C') {
          this.C2CmsgList.push(msg)
        } else {
          this.SYSmsgList.push(msg)
        }
      }
    },
    // 将MessageReceived回调函数传来的event解析，并存入msglist
    getNewMessageByMR: function (event) {
      console.log(event)
      console.log('--------------')
      for (let i = 0; i < event.data.length; i++) {
        let msg = {
          from: '',
          payload: '',
          sendTime: ''
        }
        let Mydate = new Date()
        msg.sendTime = Mydate.getTime()
        msg.from = event.data[i].from
        msg.payload = event.data[i].payload
        console.log('这是第' + i + '个eventdata，它的id是' + event.data[i].ID)

        if (event.data[i].conversationType === 'GROUP') {
          this.GroupmsgList.push(msg)
          console.log(msg)
        } else if (event.data[i].conversationType === 'C2C') {
          this.C2CmsgList.push(msg)
        } else {
          this.SYSmsgList.push(msg)
        }
      }
    },

    // 将自己发送信息产生的回调event解析，并存入msglist队列
    getNewMessageByMyself: function (event) {
      console.log(event)
      console.log('--------------')
      let msg = {
        from: '',
        payload: '',
        sendTime: ''
      }
      let Mydate = new Date()
      msg.sendTime = Mydate.getTime()
      msg.from = event.data.message.from
      msg.payload = event.data.message.payload
      this.GroupmsgList.push(msg)
    },

    // 创建群组，并传入自定义群id
    TIMCreateGroup: function () {
      let options = {
        type: TIM.TYPES.GRP_WORK,
        name: '相亲相爱一家人',
        groupID: this.createdGroupID
      }
      let promise = tim.createGroup(options)
      promise.then(function (imResponse) { // 创建成功
        console.log(imResponse.data.group) // 创建的群的资料
      }).catch(function (imError) {
        console.warn('createGroup error:', imError) // 创建群组失败的相关信息
      })
    },
    TIMDismissGroup: function () {
      tim.dismissGroup('oneid')
    },
    TIMAddMember2Group: function () {
      let userIDList = []
      userIDList.push(this.joinedMemberID)
      let promise = tim.addGroupMember({ groupID: this.groupIDBeJoin, userIDList: userIDList })
      promise.then(function (imResponse) {
        console.log(imResponse.data.successUserIDList) // 添加成功的群成员 userIDList
        console.log(imResponse.data.failureUserIDList) // 添加失败的群成员 userIDList
        console.log(imResponse.data.existedUserIDList) // 已在群中的群成员 userIDList
        // 一个用户 userX 最多允许加入 N 个群，如果已经加入了 N 个群，此时再尝试添加 userX 为群成员，则 userX 不能正常加群
        // SDK 将 userX 的信息放入 overLimitUserIDList，供接入侧处理
        console.log(imResponse.data.overLimitUserIDList) // 超过了“单个用户可加入群组数”限制的用户列表，v2.10.2起支持
        console.log(imResponse.data.group) // 添加后的群组信息
      }).catch(function (imError) {
        console.warn('addGroupMember error:', imError) // 错误信息
      })
    },
    TIMDeleteMember2Group: function () {
      let userIDList = []
      userIDList.push(this.deletedMemberID)
      let promise = tim.deleteGroupMember({ groupID: this.groupIDBeDelete, userIDList: userIDList, reason: '你违规了，我要踢你！' })
      promise.then(function (imResponse) {
        console.log(imResponse.data.group) // 删除后的群组信息
        console.log(imResponse.data.userIDList) // 被删除的群成员的 userID 列表
      }).catch(function (imError) {
        console.warn('deleteGroupMember error:', imError) // 错误信息
      })
    },
    Netping: function () {
      axios.post('http://121.40.243.16:3001/class/login', {
        name: 'jack',
        id: '200002'
      })
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error)
        })
    },
    NetpingLocation: function () {
      axios.post('http://127.0.0.1:3001/class/login', {
        name: 'jack',
        id: '200002'
      })
        .then(function (response) {
          console.log(response)
        })
        .catch(function (error) {
          console.log(error)
        })
    }
  }
}
</script>

<style scoped>

</style>
