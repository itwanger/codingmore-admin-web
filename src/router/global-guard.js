/* eslint-disable no-unused-vars */
import router from './index'
import store from '../store'
import pageRouters from './pages'
import {
  deepCopy
} from '../utils/common'
import {
  getToken
} from '../utils/auth'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // nprogress样式文件

router.beforeEach((to, from, next) => {
  console.log('router.beforeEach参数：', 'to=', to, 'from=', from)
  // 开启进度条
  NProgress.start()

  /* const tokenValue = getToken()
  if (tokenValue) {
    // 登陆或者刷新页面时候的情况，已经有token了，但是vuex中没有用户信息，需要异步请求，并加入有权限的菜单到router中
    if (!store.state.userInfo) {
      // 通过路由跳转动态请求并渲染可用菜单
      await store.dispatch('refleshUserInfo').then(menus => {
        console.log('menus=', menus)
        // 存储最终要添加到客户端的菜单变量
        let userMenus = []
        // 查找所有一级菜单
        let firstLevelMenus = menus.filter(item => item.level === 0)
        // 如果包含第一级菜单
        if (firstLevelMenus.length > 0) {
          firstLevelMenus.forEach(item => {
            // 获得服务器返回的当前循环的一级菜单的子菜单
            let currentMenuChildren = menus.filter(x => x.parentId === item.menuId)
            if (currentMenuChildren.length > 0) {
              let target = pageRouters.find(x => x.path === item.name || x.path === `/${item.name}`)
              if (target) {
                let targetCopy = deepCopy(target)
                targetCopy.children = targetCopy.children.filter(y => currentMenuChildren.find(z => z.name === y.path) !== undefined)
                userMenus.push(targetCopy)
              }
            }
          })
        }
        if (userMenus.length > 0) {
          // 获得所有用户可访问的业务页面的路径
          let allowPaths = []
          userMenus.forEach(item => {
            let basePath = item.path
            item.children.forEach(child => {
              let finalPath = `${basePath}/${child.path}`
              allowPaths.push(finalPath)
            })
          })
          // 将所有菜单加入路由
          router.addRoutes(userMenus)
          // 将所有可访问路径加入vuex
          store.dispatch('setUserPowers', allowPaths, userMenus)
          let allowTarget = store.state.powerPaths.find(x => x === to.path)
          console.log('next:::0 new')
          if (!allowTarget || to.path === '/login') {
            // 必然要跳转到有权限的第一个菜单
            next({ path: store.state.powerPaths[0], replace: true })
          } else {
            next()
          }
        } else {
          // 没有任何系统页面的权限
          console.log('next:::2')
          next({ path: '/error/no-any-power', replace: true })
        }
      })
    } else {
      // 有token有用户信息，继续进行
      // 当有token有用户信息，要跳转登录页的时候，返回原来页面
      if (to.path === '/login') {
        // 返回原来页面
        console.log('next:::3')
        // next({path: from.path, replace: true})
      } else {
        // 这个一定要加，没有next()页面不会跳转的。这部分还不清楚的去翻一下官网就明白了
        console.log('next:::4')
        next()
      }
    }
  } else {
    // 当没有token的时候，直接跳转登录页
    if (to.path !== '/login') {
      console.log('next:::5')
      next({ path: '/login' })
    } else {
      console.log('next:::6')
      next()
    }
  } */
  next()
})

router.afterEach((to, from) => {
  // 关闭进度条
  NProgress.done()
})
