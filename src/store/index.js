import Vue from 'vue'
import Vuex from 'vuex'
import {
  getLoginUserInfo
} from '../api/users'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    // 定义存储当前登陆用户信息的变量
    userInfo: null,
    // 用户可访问的系统路径
    powerPaths: null
  },
  mutations: {
    // 设置用户信息的方法
    SET_USER_INFO(state, data) {
      state.userInfo = data
    },
    // 设置用户可访问业务路径的方法
    SET_PATHS_ALLOW(state, data) {
      state.powerPaths = data
    }
  },
  actions: {
    // 调用后端服务接口，获取当前用户信息并存入vuex
    refleshUserInfo({
      commit
    }) {
      return getLoginUserInfo().then(res => {
        console.log('获取登录用户信息成功', res)
        commit('SET_USER_INFO', res)
        return res.menus
      }).catch(rej => {
        console.log('与服务器通信出现异常，response对象记录', rej)
      })
    },

    // 用户退出登陆时候，移除用户信息方法
    removeUserInfo({
      commit
    }) {
      commit('SET_USER_INFO', null)
    },

    // 动态获取权限后，设置用户可访问的业务页面路径
    setUserAllowPaths({ commit }, pathsArr) {
      commit('SET_PATHS_ALLOW', pathsArr)
    }
  }
})
