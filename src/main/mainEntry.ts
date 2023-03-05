import {app, BrowserWindow} from 'electron'
import {CustomScheme} from "./CustomScheme";
import {CommonWindowEvent} from "./CommonWindowEvent";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
let mainWindow: BrowserWindow;

app.whenReady().then(() => {
    const config = {
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
    };
    mainWindow = new BrowserWindow(config);
    mainWindow.webContents.setWindowOpenHandler((params) => {
        return {action: 'allow'}
    })
    CommonWindowEvent.listen();
    CommonWindowEvent.regWinEvent(mainWindow);
    // mainWindow.webContents.openDevTools({mode: "detach"});
    if (process.argv[2]) {
        mainWindow.loadURL(process.argv[2]);
    } else {
        CustomScheme.registerScheme()
        mainWindow.loadURL(`app://index.html`)
    }
});

app.on('browser-window-created', () => {

})
