import {BrowserWindowConstructorOptions} from "electron";

export const config: BrowserWindowConstructorOptions = {
    frame: false,
    show: false,
    webPreferences: {
        nodeIntegration: true,
        webSecurity: false,
        allowRunningInsecureContent: true,
        contextIsolation: false,
        webviewTag: true,
        spellcheck: false,
        disableHtmlFullscreenWindowResize: true,
    },
}