import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
// 官方样式
import 'element-plus/dist/index.css'
// 中文化
import zhCn from 'element-plus/es/locale/lang/zh-cn'

const app = createApp(App)
app.use(ElementPlus, {
    locale: zhCn,
}).use(router).mount('#app')
