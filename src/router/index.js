import Vue from 'vue'
import Router from 'vue-router'
import page404 from '../views/error-pages/404'
import page500 from '../views/error-pages/500'
import pageNoAnyPower from '../views/error-pages/no-any-power'
import pageLogin from '../views/login'
import mainFrame from '@/layout'
import pageRouters from './pages'

Vue.use(Router)

// 定义路由数组，暂时前端写死，之后加入权限管理之后，读取权限之后要进行过滤

// 不展示在菜单栏上，但是系统要使用到的数组
export const systemRouters = [{
  path: '/error/404',
  name: 'error-page404',
  component: page404
},
{
  path: '/error/500',
  name: 'error-page500',
  component: page500
},
{
  path: '/error/no-any-power',
  name: 'error-no-any-power',
  component: pageNoAnyPower
},
{
  path: '/login',
  name: 'login',
  component: pageLogin
},
  // {
  //   path: '/content/article-editing',
  //   name: 'article-editing',
  //   component: articleEdit
  // },
{
  path: '/main',
  name: 'empty',
  component: mainFrame
},
{
  path: '/',
  name: 'root',
  redirect: '/content/articles'
  // component: mainFrame
},
{
  path: '*',
  name: 'all',
  redirect: '/error/404'
}
]

const originalPush = Router.prototype.push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

export default new Router({
  routes: [...pageRouters, ...systemRouters]
  // routes: systemRouters
})
