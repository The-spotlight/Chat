import {app, BrowserWindow} from 'electron'
import {CustomScheme} from "./CustomScheme";
import {CommonWindowEvent} from "./CommonWindowEvent";
import {config} from "./data";

process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = "true";
let mainWindow: BrowserWindow;

app.whenReady().then(() => {

    mainWindow = new BrowserWindow(config);

    CommonWindowEvent.listen();
    // mainWindow.webContents.openDevTools({mode: "detach"});
    if (process.argv[2]) {
        mainWindow.loadURL(process.argv[2]);
    } else {
        CustomScheme.registerScheme()
        mainWindow.loadURL(`app://index.html`)
    }
});

app.on('browser-window-created', (e, win) => {
    CommonWindowEvent.regWinEvent(win)
})
