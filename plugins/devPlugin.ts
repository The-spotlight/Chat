import {ViteDevServer} from 'vite';

export const devPlugin = () => {
    return {
        name: 'dev-plugin',
        configureServer(server: ViteDevServer) {
            require('esbuild').buildSync({
                entryPoints: ['./src/main/mainEntry.ts'],
                bundle: true,
                platform: 'node',
                outfile: './dist/mainEntry.js',
                external: ['electron'],
            });
            server?.httpServer?.once('listening', () => {
                const {spawn} = require('child_process')
                const addressInfo = server?.httpServer?.address();
                // @ts-ignore
                const httpAddress = `http://${addressInfo.address}:${addressInfo.port}`
                const electronProcess = spawn(require('electron').toString(), ['./dist/mainEntry.js', httpAddress], {
                    cwd: process.cwd(),
                    stdio: 'inherit',
                })
                electronProcess.on('close', () => {
                    server.close();
                    process.exit();
                })
            })
        }
    }
}

export const getReplacer = () => {
    let externalModels = ["os", "fs", "path", "events", "child_process", "crypto", "http", "buffer", "url", "better-sqlite3", "knex"];
    let result = {}
    for (const item of externalModels) {
        result[item] = () => ({
            find: new RegExp(`^${item}$`),
            code: `const ${item} = require('${item}'); export {${item} as default}`
        })
    }
    
    let electronModules = ["clipboard", "ipcRenderer", "nativeImage", "shell", "webFrame"].join(",");
    result['electron'] = `const {${electronModules}} = require('electron'); export {${electronModules}};`
    return result
}