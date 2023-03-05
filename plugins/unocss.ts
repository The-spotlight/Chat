import Unocss from 'unocss/vite'
import {presetAttributify, presetIcons, presetUno} from "unocss";

const safelist = [
]
export default () => Unocss({
    safelist,
    presets: [presetUno(), presetAttributify(), presetIcons()],
})