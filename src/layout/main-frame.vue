<template>
  <el-container>
    <!-- 左侧菜单区域 -->
    <!-- <el-aside :width="menuCollapsed ? 'auto': '201px'"> -->
    <el-aside width="auto">
      <!-- <div class="logo text-center">
        <img src="../assets/logo-main.jpg" />
      </div> -->
      <el-menu :collapse="menuCollapsed" :default-active="$route.path" class="custom-nav" router>
        <el-submenu v-for="item in pageRouters" :key="item.path" :index="item.path">
          <template slot="title">
            <!-- <i :class="item.icon"></i> -->
            <!-- <bookmark theme="outline" size="24" /> -->
            <more-icon :iconClass="item.icon"></more-icon>
            <span>{{item.meta.title}}</span>
          </template>
          <el-menu-item v-for="subitem in item.children" :key="subitem.path" :index="item.path + '/' + subitem.path">
            <!-- <i :class="subitem.icon"></i> -->
            <!-- <book-mark theme="outline" size="25" fill="#000"/> -->
            <more-icon :iconClass="subitem.icon"></more-icon>
            <span>{{subitem.meta.title}}</span>
          </el-menu-item>
        </el-submenu>
      </el-menu>
    </el-aside>
    <!-- 右侧布局 -->
    <el-container>
      <!-- 右侧顶部 -->
      <el-header class="flex-row-ver-center">
        <div class="bread-icon">
          <i :class="menuCollapsedIcon" @click="menuCollapsedClick"></i>
        </div>
        <!-- 面包屑 -->
        <div class="bread-container">
          <el-breadcrumb separator="/">
            <el-breadcrumb-item v-for="item in currentMatchedRoutes" :key="item.path" :to="{ path: item.path }">{{item.meta.title}}</el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <!-- 用户头像 -->
        <div class="user-area">
          <el-dropdown trigger="click" @command="handleCommand">
            <span>
              <el-image :src="currentUserInfo && currentUserInfo.userDetail.userUrl ? currentUserInfo.userDetail.userUrl: defaultUserImage" class="user-image" slot="reference">
              </el-image>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item>修改密码</el-dropdown-item>
              <el-dropdown-item divided command="q">退出登陆</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <!-- 右侧主页面部分 -->
      <el-main>
        <router-view :key="$route.path + ($route.query.aid || '')" />
      </el-main>
    </el-container>
    <el-dialog title="修改密码" :visible="modifyPasswordVisible">
      <el-form v-model="modifyPasswordForm"></el-form>
    </el-dialog>
  </el-container>
</template>

<script>
import { pageRouters } from '../router'
import { userLogout } from '../api/users'
import { removeToken } from '../utils/auth'
import MoreIcon from '../components/more-icon'

export default {
  name: 'mainFrame',
  components: { MoreIcon },
  computed: {
    // 当前面包屑使用数据
    currentMatchedRoutes() {
      return this.$route.matched
    },
    currentUserInfo() {
      return this.$store.state.userInfo
    }
  },
  data() {
    return {
      menuCollapsedIcon: 'el-icon-s-fold',

      // 菜单是否处于最小化状态
      menuCollapsed: false,

      // 在router中定义的，要显示在左侧导航的路由数组
      pageRouters,

      // 默认头像路径
      defaultUserImage: require('@/assets/default_user_image.jpg'),

      // 用户修改密码对话框可见性
      modifyPasswordVisible: false,

      // 修改密码表单
      modifyPasswordForm: {
        newPassword: '',
        oldPassword: ''
      }
    }
  },
  watch: {
    menuCollapsed(val) {
      if (val) {
        this.menuCollapsedIcon = 'el-icon-s-unfold'
      } else {
        this.menuCollapsedIcon = 'el-icon-s-fold'
      }
    }
  },
  methods: {
    menuCollapsedClick() {
      this.menuCollapsed = !this.menuCollapsed
    },

    // 处理点击头像弹出的下拉命令
    handleCommand(command) {
      if (command == 'q') {
        this.logoutSystemClick()
      }
    },

    logoutSystemClick() {
      // 调用服务器方法退出登陆
      userLogout().then(() => {
        // 移除token
        removeToken()
        // 移除vuex中的用户信息
        this.$store.dispatch('removeUserInfo')
        // 跳转到登录页面
        this.$router.push('/login')
      })
    },

    writeArticleClick() {
      this.$router.push('/content/article-editing')
    }
  },
  mounted() {
    // 调用vuex的actions的refleshUserInfo方法，获取当前登陆用户信息
    // this.$store.dispatch('refleshUserInfo')
  }
}
</script>

<style>
/* 用户头像样式 */
.user-image {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 5px;
}

.custom-nav:not(.el-menu--collapse) {
  width: 200px;
}

.custom-nav .el-submenu__title i {
  color: #fff;
}

/* 面包屑前面图标容器样式 */
.bread-icon {
  margin-right: 10px;
  font-size: 18px;
  flex-shrink: 0;
}

.bread-icon > i {
  cursor: pointer;
}

/* 面包屑容器样式 */
.bread-container {
  flex-grow: 1;
}

/* 面包屑导航字体颜色 */
.el-header.flex-row-ver-center .el-breadcrumb__inner a,
.el-header.flex-row-ver-center .el-breadcrumb__inner.is-link,
.el-header.flex-row-ver-center .el-breadcrumb__inner,
.el-header.flex-row-ver-center .el-breadcrumb__inner:hover {
  color: #333;
}

/* 设置菜单背景色 */
.custom-nav.el-menu,
.custom-nav .el-menu {
  background-color: #304156;
  border-right-color: #304156;
}

/* 让菜单文字左对齐样式 */
.custom-nav .el-menu .el-menu-item {
  /* padding-left: 52px !important; */
  background-color: #304156;
  color: #bfcbd9;
}
/* .custom-nav .el-submenu__title:hover{
  background-color: #304156;
} */
/* 菜单hover效果样式 */
.custom-nav .el-submenu__title:hover,
.custom-nav .el-menu .el-menu-item:hover {
  background-color: #1f2d3d;
}
/* 菜单激活样式 */
.custom-nav .el-menu .el-menu-item.is-active {
  background-color: #1f2d3d !important;
  color: #409eff;
}
/* 菜单非叶子节点的样式 */
.custom-nav .el-submenu__title {
  color: #bfcbd9;
}

/* logo样式 */
.logo {
  height: 87px;
  /*line-height: 60px;
  font-size: 30px; */
  box-sizing: border-box;
  font-style: italic;
  background-color: #d3dce6;
}

.logo > img {
  width: 201px;
  /* height: 60px; */
}

/* 这里是官网例子的样式，为了查看效果可以先拿过来使用 */
.el-header,
.el-footer {
  background-color: #fff;
  color: #333;
  border-bottom: 1px solid #cccccc;
}

.el-aside {
  background-color: #304156;
  color: #304156;
}

.el-main {
  background-color: #fff;
  color: #333;
}
</style>
