<template>
  <el-empty :image="picUrl" :description="discriptionText">
    <el-button type="primary" @click="fnReturnToFirst">返回首页</el-button>
  </el-empty>
</template>
<script>
export default {
  name: 'NoPower',
  data() {
    return {
      picUrl: require('@/assets/no-power.png'),
      discriptionText: '您无权限访问当前页面，请联系系统管理员'
    }
  },
  methods: {
    fnReturnToFirst() {
      this.$router.push({ name: this.$store.state.userMenus[0] })
    }
  }
}
</script>
