/**
 * 导入
 import { CPSTim } from './dependence.js'
 * 初始化
 let tim = new CPSTim('jack')
 * 发送信息
 tim.sendMessage('message')
 * 获取信息数组--对象属性
 let message = tim.groupmsgList
 */
import TIM from 'tim-js-sdk'
import TIMUploadPlugin from 'tim-upload-plugin'
import axios from 'axios'
export class CPSTim {
  // 构造函数，执行TIM初始化及个人信息并进行登陆
  constructor (id) {
    // 个人id
    this.id = id
    // 存储消息的数组
    this.groupmsgList = []
    this.options = {
      SDKAppID: 1400561810
    }
    // 发送信息时的群组目标
    let targetGroup
    let usersig
    this.tim = TIM.create(this.options)
    this.init()
  }
  // 初始化IM
  init () {
    // 设置 SDK 日志输出级别，详细分级请参见 <a href="https://web.sdk.qcloud.com/im/doc/zh-cn//SDK.html#setLogLevel">setLogLevel 接口的说明</a>
    this.tim.setLogLevel(0) // 普通级别，日志量较多，接入时建议使用
    // tim.setLogLevel(1); // release 级别，SDK 输出关键信息，生产环境时建议使用
    // 注册腾讯云即时通信 IM 上传插件
    this.tim.registerPlugin({ 'tim-upload-plugin': TIMUploadPlugin })
    // 监听事件，例如：
    this.tim.on(TIM.EVENT.MESSAGE_RECEIVED, function (event) {
      // 收到推送的单聊、群聊、群提示、群系统通知的新消息，可通过遍历 event.data 获取消息列表数据并渲染到页面
      // event.name - TIM.EVENT.MESSAGE_RECEIVED
      // event.data - 存储 Message 对象的数组 - [Message]
      // 自己发送的信息，不会触发新消息提示
      console.log(event)
      this.getNewMessageByMR(event)
    }.bind(this))
    this.login()
  }
  // 登录IM
  // 如果usersig为空需要根据userID从服务器获得 usersig
  login () {
    let params = 'userID=' + this.id
    /**
     * 请求usersig，usersig有效期一天
     * 保存在前端中，若usersig过期需重新申请
     */
    if (!this.usersig) {
      console.log('开始请求usersig')
      axios.get('http://127.0.0.1:3001/tim/usersig?' + params)
        .then((res) => {
          console.log('成功获得usersig' + res.data)
          this.usersig = res.data
          console.log('全局usersig更新为' + this.usersig)
          console.log('in function timlogin')
          console.log(this)
          this.tim.login({ userID: this.id, userSig: this.usersig })
        })
    } else {
      console.log(' usersig 已存在/未过期？ ')
      this.tim.login({ userID: this.id, userSig: this.usersig })
    }
    /**
     * 寻找群聊目标，更新为targetGroup
     * 每次课程开始时以老师为群主创建群聊，寻找数据库，返回群聊的id
     * 课程结束后解散群组
     */
    console.log('正在寻找群组目标')
    // 这里获得群组目标是异步函数，需要等待它完成再更新全局群组目标
    let url = 'http://127.0.0.1:3001/tim/groupTarget?name=' + this.id
    axios.get(url)
      .then((res) => {
        console.log('初始获得群组id 群组id为' + res.data)
        this.targetGroup = res.data
        console.log('全局群组目标更新为' + this.targetGroup)
      })
      .catch((err) => {
        console.log('发生错误，未获得群组id')
        console.log(err)
      })
  }
  logout () {
    this.tim.logout()
  }
  // 发送信息接口 接收信息内容
  sendMessage (messageContent) {
    console.log('待发送的信息为' + messageContent)
    console.log('目标群组id为' + this.targetGroup)
    if (!this.targetGroup) { console.log('目标群组错误!停止发送'); return }
    let message = this.tim.createTextMessage({
      to: this.targetGroup,
      conversationType: TIM.TYPES.CONV_GROUP,
      // 消息优先级，用于群聊（v2.4.2起支持）。如果某个群的消息超过了频率限制，后台会优先下发高优先级的消息，详细请参考：https://cloud.tencent.com/document/product/269/3663#.E6.B6.88.E6.81.AF.E4.BC.98.E5.85.88.E7.BA.A7.E4.B8.8E.E9.A2.91.E7.8E.87.E6.8E.A7.E5.88.B6)
      // 支持的枚举值：TIM.TYPES.MSG_PRIORITY_HIGH, TIM.TYPES.MSG_PRIORITY_NORMAL（默认）, TIM.TYPES.MSG_PRIORITY_LOW, TIM.TYPES.MSG_PRIORITY_LOWEST
      // priority: TIM.TYPES.MSG_PRIORITY_NORMAL,
      payload: {
        text: messageContent
      }
    })
    console.log(message)
    // 2. 发送消息
    let promise = this.tim.sendMessage(message)
    promise.then(function (imResponse) {
      // 发送成功
      this.getNewMessageByMyself(imResponse)
      console.log('消息发送成功！')
    }.bind(this)).catch(function (imError) {
      // 发送失败
      console.warn('sendMessage error:', imError)
    })
  }
  // 获取信息接口，返回群组内的聊天信息
  getMessagesList () {
    return this.groupmsgList
  }
  initTatgetGroup () {
    let targetGroup = ''
    console.log('in function inittargetgroup')
    console.log(this)
    let url = 'http://127.0.0.1:3001/tim/groupTarget?name=' + this.id
    axios.get(url)
      .then((res) => {
        console.log('初始获得群组id 群组id为' + res.data)
        targetGroup = res.data
        return targetGroup
      })
      .catch((err) => {
        console.log('发生错误，未获得群组id')
        console.log(err)
        return null
      })
  }
  // 将MessageReceived回调函数传来的event解析，并存入msglist
  getNewMessageByMR (event) {
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
        this.groupmsgList.push(msg)
        console.log(msg)
      }
      // 对单聊及系统消息的反馈
      // else if (event.data[i].conversationType === 'C2C') {
      //   this.C2CmsgList.push(msg)
      // } else {
      //   this.SYSmsgList.push(msg)
      // }
    }
  }
  // 将自己发送信息产生的回调event解析，并存入msglist队列
  getNewMessageByMyself (event) {
    console.log(event)
    console.log('--------------get message send-by myself-------------')
    let msg = {
      from: '',
      payload: '',
      sendTime: ''
    }
    let Mydate = new Date()
    msg.sendTime = Mydate.getTime()
    msg.from = event.data.message.from
    msg.payload = event.data.message.payload
    this.groupmsgList.push(msg)
  }
}
