// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
// import Vue from 'vue/dist/vue.common.js'
import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'
import App from './App'
import router from './router'
import store from './store'
import './router/global-guard'
import './styles/common.css'
import Router from 'vue-router'
// import NProgress from 'nprogress'
import 'nprogress/nprogress.css' // nprogress样式文件
Vue.use(Router)
Vue.use(ElementUI)
Vue.config.productionTip = false

const originalPush = Router.prototype.push
const originalReplace = Router.prototype.replace

// push
Router.prototype.push = function push(location, onResolve, onReject) {
  if (onResolve || onReject) { return originalPush.call(this, location, onResolve, onReject) }
  return originalPush.call(this, location).catch(err => err)
}

// replace
Router.prototype.replace = function push(location, onResolve, onReject) {
  if (onResolve || onReject) { return originalReplace.call(this, location, onResolve, onReject) }
  return originalReplace.call(this, location).catch(err => err)
}

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
