import {createApp} from 'vue'
import 'uno.css'
import App from '../App.vue'
import {router} from "./router";
import {createPinia} from "pinia";
import './assets/style.css'
import './assets/icon/iconfont.css'

createApp(App).use(createPinia()).use(router).mount('#app')
