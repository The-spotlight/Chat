import {createApp} from 'vue'
import 'uno.css'
import App from '../App.vue'
import {router} from "./router";
import './assets/style.css'
import './assets/icon/iconfont.css'

createApp(App).use(router).mount('#app')
