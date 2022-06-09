<template>
  <div class="outer">
    <el-card class="box-card">
      <div slot="header" class="clearfix">
        <!-- <h2>CodingMore后台管理登陆</h2> -->
        <img :src="logoUrl" width="360" />
      </div>
      <el-form ref="form" :model="form" label-width="60px">
        <el-form-item label="用户名">
          <el-input v-model="form.userLogin" maxlength="30" @keydown.native.enter="btnLoginClick"></el-input>
        </el-form-item>
        <el-form-item label="密码">
          <el-input type="password" v-model="form.userPass" show-password maxlength="50" @keydown.native.enter="btnLoginClick"></el-input>
        </el-form-item>
        <div class="text-right">
          <el-button type="primary" @click="btnLoginClick">登陆</el-button>
          <el-button @click="btnTasteClick">获取体验账号</el-button>
        </div>
      </el-form>
    </el-card>
    <el-dialog title="公众号二维码" :visible="qrDialogVisible" :show-close="false" :center="true">
      <div class="text-center">
        <div class="font-title-large">
          扫描下方二维码关注
          <span class="color-blue">沉默王二</span>
          公众号回复
          <span class="color-blue">体验</span>
          获取体验账号
        </div>
        <el-image class="img-qrcode" :src="itwangerQrcodeUrl"></el-image>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="qrDialogVisible = false">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { UserLogin } from '../../api/login'
import qs from 'qs'
import { setToken } from '../../utils/auth'
export default {
  name: 'login',
  data() {
    return {
      form: {
        userLogin: 'admin',
        userPass: ''
      },
      // 添加标签对话框可见性
      qrDialogVisible: false,

      // 公众号二维码 URL
      itwangerQrcodeUrl: require('@/assets/wanger-qrcode.jpg'),

      // logo图片url
      logoUrl: require('@/assets/logo-main.jpg')
    }
  },
  methods: {
    // 登陆按钮方法
    btnLoginClick() {
      const reqData = qs.stringify(this.form)
      UserLogin(reqData).then((res) => {
        console.log('登陆接口返回数据：', res)
        // 先保存token到cookie
        setToken(`${res.tokenHead}${res.token}`)
        // 之后跳转页面到首页
        this.$router.push('/')
      })
    },

    // 获取体验账号方法
    btnTasteClick() {
      this.qrDialogVisible = true
    }
  }
}
</script>
<style scoped>
.box-card {
  width: 400px;
}
.box-card h2 {
  margin: 0;
  padding: 0;
}
.outer {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  /* background: url(./../../img/login-bg.jpeg) no-repeat center center; */
  background: url(https://cdn.tobebetterjavaer.com/codingmore-admin-web/login-bg.jpeg) no-repeat center center;
  background-size: 100% 100%;
}
.color-blue {
  color: #409eff;
}

/* 二维码上方文字样式 */
.font-title-large {
  font-size: 18px;
  color: #303133;
  margin-bottom: 40px;
}
/* 二维码样式 */
.img-qrcode {
  width: 160px;
  height: 160px;
}
</style>
