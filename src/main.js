/* Element Plus의 기본 변수·컴포넌트 스타일을 먼저 싣고,
 * 그 다음 우리 스타일(main.css)이 덮어쓰도록 순서를 고정한다.
 * 전체 등록(app.use(ElementPlus)) 대신 실제로 쓰는 것만 가져온다. */
import 'element-plus/theme-chalk/base.css'
import 'element-plus/theme-chalk/el-icon.css'
import 'element-plus/theme-chalk/el-overlay.css'
import 'element-plus/theme-chalk/el-button.css'
import 'element-plus/theme-chalk/el-message.css'
import 'element-plus/theme-chalk/el-message-box.css'

import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
