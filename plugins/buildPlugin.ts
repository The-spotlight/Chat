import * as path from "path";
import * as fs from "fs";

class BuildObj {
    buildMain() {
        require('esbuild').buildSync({
            entryPoints: ["./src/main/mainEntry.ts"],
            bundle: true,
            platform: "node",
            minify: true,
            outfile: "./dist/mainEntry.js",
            external: ["electron"],
        })
    }

    preparePackage() {
        const packPath = path.join(process.cwd(), 'package.json')
        let packAge = JSON.parse(fs.readFileSync(packPath, 'utf-8'))
        const electronPage = packAge.devDependencies.electron.replace('^', '')
        packAge.main = 'mainEntry.js'
        delete packAge.scripts
        delete packAge.devDependencies
        packAge.devDependencies = {electron: electronPage}
        fs.writeFileSync(path.join(process.cwd(), 'dist/package.json'), JSON.stringify(packAge))
        fs.mkdirSync(path.join(process.cwd(), 'dist/node_modules'))
    }

    buildInstaller() {
        let options = {
            config: {
                directories: {
                    output: path.join(process.cwd(), 'release'),
                    app: path.join(process.cwd(), 'dist')
                },
                files: ['**'],
                extends: null,
                productName: 'JueJin',
                appId: "com.juejin.desktop",
                asar: true,
                nsis: {
                    oneClick: true,
                    perMachine: true,
                    allowToChangeInstallationDirectory: false,
                    createDesktopShortcut: true,
                    createStartMenuShortcut: true,
                    shortcutName: "juejinDesktop",
                },
                publish: [{ provider: "generic", url: "http://localhost:5500/" }],
            },
            project: process.cwd(),
        }
        return require('electron-builder').build(options)
    }
}

export const buildPlugin = () => {
    return {
        name: 'build-plugin',
        closeBundle: () => {
            const buildObj = new BuildObj()
            buildObj.buildMain()
            buildObj.preparePackage()
            buildObj.buildInstaller()
        }
    }
}
