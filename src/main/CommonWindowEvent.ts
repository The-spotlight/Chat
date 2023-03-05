import {BrowserWindow, ipcMain} from "electron";
import {config as configWin} from "./data";

export class CommonWindowEvent {
    private static getWin(event: any) {
        return BrowserWindow.fromWebContents(event.sender)
    }

    public static listen() {
        ipcMain.handle('closeWin', (e) => {
            this.getWin(e)?.close()
        })

        ipcMain.handle('maximizeMainWin', (e) => {
            this.getWin(e)?.maximize()
        })

        ipcMain.handle('minimizeMainWin', (e) => {
            this.getWin(e)?.minimize()
        })

        ipcMain.handle('unMaximizeMainWin', (e) => {
            this.getWin(e)?.unmaximize()
        })

        ipcMain.handle('showWin', (e) => {
            this.getWin(e)?.show()
        })

        ipcMain.handle('hideWin', (e) => {
            this.getWin(e)?.hide()
        })
    }

    public static regWinEvent(win: BrowserWindow) {
        win.on('maximize', () => {
            win.webContents.send('windowMaximized')
        })

        win.on('unmaximize', () => {
            win.webContents.send('windowUnMaximized')
        })


        win.webContents.setWindowOpenHandler((params) => {
            const features = JSON.parse(params.features)
            let config: any = configWin
            config.show = true
            for (const p in features) {
                if (p === 'webPreferences') {
                    for (const p2 in features.webPreferences) {
                        config.webPreferences[p2] = features.webPreferences[p2]
                    }
                } else {
                    config[p] = features[p]
                }
            }

            if (config['modal'] === true) config.parent = win
            return {action: 'allow', overrideBrowserWindowOptions: config}
        })

    }
}