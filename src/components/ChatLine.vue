<template>
<div id="Line" :class = "message.from === ownerID ? 'isOwnerSend' : 'notOwnerSend'">
  <h3>{{message.from +' : '+ message.payload.text}}</h3>
<!--<h1>{{message.payload.text}}</h1>-->
</div>
</template>

<script>
export default {
  name: 'ChatLine',
  props: {
    ownerID: String,
    message: Object
  }
}
</script>

<style scoped>
#Line{
  flex: 1;
}
h3{
  font-size: 14px;
}

.notOwnerSend {
  position: absolute;
  left: 20%;
}
.isOwnerSend {
  position: absolute;
  left: 70%;
}
</style>
