import {PiniaPluginContext} from "pinia";

export const respondLocal = ({store}: PiniaPluginContext ) => {
    window.addEventListener("storage", (e) => {
        store.$state = (JSON.parse(e.newValue!))
    });

}