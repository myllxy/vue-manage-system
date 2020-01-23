import Vue from 'vue';
import App from './App.vue';
import router from './router';
import ElementUI from 'element-ui';
import VueI18n from 'vue-i18n';
import { messages } from './components/common/i18n';
import 'element-ui/lib/theme-chalk/index.css'; // 默认主题
// import './assets/css/theme-green/index.css'; // 浅绿色主题
import './assets/css/icon.css';
import './components/common/directives';
import 'babel-polyfill';
import echarts from 'echarts'
import BaiduMap  from 'vue-baidu-map'
/*使用百度地图*/
Vue.use(BaiduMap, {
    // ak 是在百度地图开发者平台申请的密钥 详见 http://lbsyun.baidu.com/apiconsole/key */
    ak: 'NzuUeeoK9OhdCAjP6cr1ZVwIy35Zst2P'
});

import axios from 'axios';
//配置axios的全局基本路径
axios.defaults.baseURL='http://localhost/';
/* 配置echarts的全局基本路径 */
Vue.prototype.$echarts = echarts;
//全局属性配置，在任意组件内可以使用this.$http获取axios对象
Vue.prototype.$http = axios;

Vue.config.productionTip = false;
Vue.use(VueI18n);
Vue.use(ElementUI, {
    size: 'small'
});
const i18n = new VueI18n({
    locale: 'zh',
    messages
});



//拦截器   ajax拦截器（每次发送ajax请求之前进行拦截）
axios.interceptors.request.use(config => {
    if (sessionStorage.getItem('sessionId')) {
        // 让每个请求携带token--['X-Token']为自定义key 请根据实际情况自行修改
        config.headers['X-TOKEN'] = sessionStorage.getItem('sessionId')
    }
    return config
}, error => {
    // Do something with request error
    Promise.reject(error)
});
/* 因为登录也是用的假数据,所以现在先把登录功能注销 */
router.beforeEach((to, from, next) => {

    if (to.path == '/login') {
        sessionStorage.removeItem('user');
    }
    let user = JSON.parse(sessionStorage.getItem('user'));
    if (!user && to.path != '/login') {
        next({path: '/login'})
    } else {
        next()
    }
});

new Vue({
    router,
    i18n,
    render: h => h(App)
}).$mount('#app');
