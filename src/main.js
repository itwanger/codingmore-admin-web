// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import Vue from 'vue/dist/vue.common.js'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
import router from './router'
import store from './store'
// import './router/global-guard'
import './styles/common.css'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // nprogress样式文件

Vue.use(ElementUI)
Vue.config.productionTip = false

router.beforeEach((to, from, next) => {
  console.log('router.beforeEach参数：', 'to=', to, 'from=', from)
  console.log('router=', router)
  // 开启进度条
  NProgress.start()
  next()
})

router.afterEach((to, from) => {
  console.log('afterEach to=', to, 'from=', from)
  // 关闭进度条
  NProgress.done()
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: {
    App
  },
  template: '<App/>'
  // render: h => h(App)
})
