import axios from 'axios'
import * as echarts from 'echarts'
import 'element-ui/lib/theme-chalk/index.css'
import Vue from 'vue'
import App from './App.vue'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/font/iconfont.css'
import './plugins/element.js'
import router from './router'

// 配置请求根路径
axios.defaults.baseURL = 'http://192.168.1.154:8008/stu/'
axios.interceptors.request.use(config => {
    config.headers.Authorization = window.sessionStorage.getItem('token')
    // 必须return config
    return config
})


Vue.prototype.$http = axios
Vue.prototype.$echarts = echarts
Vue.config.productionTip = false

new Vue({
    router,
    render: h => h(App)
}).$mount('#app')
