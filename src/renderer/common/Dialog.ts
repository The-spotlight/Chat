import {BrowserWindow} from "electron";

export const createDialog = (url: string, config: any): Promise<Window> => {
    return new Promise((resolve, reject) => {
        const winProxy: any = window.open(url, '_blank', JSON.stringify(config))
        const readyHandler = (e: any) => {
            const msg = e.data
            if (msg['msgName'] === '__dialogReady') {
                window.removeEventListener('message', readyHandler)
                resolve(winProxy)
            }
        }
        window.addEventListener('message', readyHandler)
    })
}

export const dialogReady = () => {
    const msg = {msgName: `__dialogReady`}
    window.opener.postMessage(msg)
}