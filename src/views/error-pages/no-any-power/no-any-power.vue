<template>
  <el-empty :image="picUrl" :description="discriptionText">
    <el-button type="primary" @click="fnQuit">切换账号</el-button>
  </el-empty>
</template>
<script>
import { userLogout } from '@/api/users'
import { removeToken } from '@/utils/auth'
export default {
  name: 'NoPower',
  data() {
    return {
      picUrl: require('@/assets/no-any-power.jpg'),
      discriptionText: '您无权访问系统的任何页面，请联系系统管理员'
    }
  },
  methods: {
    fnQuit() {
      // 调用服务器方法退出登陆
      userLogout().then(() => {
        // 移除token
        removeToken()
        // 移除vuex中的用户信息
        this.$store.dispatch('removeUserInfo')
        // 跳转到登录页面
        this.$router.push('/login')
      })
    }
  }
}
</script>
