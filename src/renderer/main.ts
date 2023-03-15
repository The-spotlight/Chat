import {createApp} from 'vue'
import 'uno.css'
import App from '../App.vue'
import {router} from "./router";
import {createPinia} from "pinia";
import './assets/style.css'
import './assets/icons/iconfont.css'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import {respondLocal} from "./store/plugins/respondLocal";

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate).use(respondLocal)

createApp(App).use(pinia).use(router).mount('#app')
