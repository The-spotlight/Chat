import {defineConfig} from 'vite';
import vue from '@vitejs/plugin-vue';
import {devPlugin, getReplacer} from "./plugins/devPlugin";
import {buildPlugin} from "./plugins/buildPlugin";
import optimizer from "vite-plugin-optimizer";
import Unocss from "./plugins/unocss";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [Unocss(), optimizer(getReplacer()), devPlugin(), vue()],
    build: {
        rollupOptions: {
            plugins: [buildPlugin()]
        }
    }
})
