import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
// 官方样式
import 'element-plus/dist/index.css'
// 中文化
import zhCn from 'element-plus/es/locale/lang/zh-cn'
// 引入 vue-echarts
import VueECharts from 'vue-echarts'
import * as ECharts from 'echarts'
const app = createApp(App)
app.component('v-chart', VueECharts)
app.use(ElementPlus, {
    locale: zhCn,
}).use(router).mount('#app')
