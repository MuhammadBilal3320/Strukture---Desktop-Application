import { ipcMain, dialog } from 'electron'
import path from 'path'
import fs from 'fs'
import os from 'os'

export function registerIpcHandlers() {
    // Select folder
    ipcMain.handle('select-folder', async () => {
        try {
            const desktopPath = path.join(os.homedir(), 'Desktop')
            const result = await dialog.showOpenDialog({
                title: 'Select a Folder',
                defaultPath: desktopPath,
                properties: ['openDirectory', 'dontAddToRecent']
            })

            return result.canceled ? null : result.filePaths[0]
        } catch (err) {
            console.error('Folder selection error:', err)
            return null
        }
    })

    // === Python removed completely ===

    // Create folder
    ipcMain.handle('create-folder', async (_, folderPath) => {
        try {
            fs.mkdirSync(folderPath, { recursive: true })
            return { success: true, path: folderPath }
        } catch (err) {
            return { success: false, error: err.message }
        }
    })

    // Create file
    ipcMain.handle('create-file', async (_, filePath) => {
        try {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
            fs.writeFileSync(filePath, '')
            return { success: true, path: filePath }
        } catch (err) {
            return { success: false, error: err.message }
        }
    })

    // Scan folder (Node.js version of your Python code)
    ipcMain.handle('scan-folder', async (_, folderPath) => {
        try {
            const items = []
            const entries = fs.readdirSync(folderPath, { withFileTypes: true })

            for (const e of entries) {
                items.push({
                    name: e.name,
                    path: path.join(folderPath, e.name),
                    isFile: e.isFile()
                })
            }

            return { success: true, items }
        } catch (err) {
            return { success: false, error: err.message }
        }
    })

    // Read file content
    ipcMain.handle('read-file', async (_, filePath) => {
        try {
            const content = fs.readFileSync(filePath, 'utf-8')
            return { success: true, content }
        } catch (err) {
            return { success: false, error: err.message }
        }
    })

    // Write file
    ipcMain.handle('write-file', async (_, filePath, content) => {
        try {
            fs.mkdirSync(path.dirname(filePath), { recursive: true })
            fs.writeFileSync(filePath, content, 'utf-8')
            return { success: true, path: filePath }
        } catch (err) {
            return { success: false, error: err.message }
        }
    })
}

// Deep Scan Selected Folder
ipcMain.handle("scan-folder-deep", async (_, folderPath) => {
    const IGNORE = new Set(["node_modules", ".git", "dist", "build", ".next"]);

    const scan = async (dir) => {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });
        const results = [];

        for (const entry of entries) {
            if (IGNORE.has(entry.name)) continue;

            const fullPath = path.join(dir, entry.name);

            if (entry.isDirectory()) {
                results.push({
                    name: entry.name,
                    path: fullPath,
                    isFile: false,
                    children: await scan(fullPath),
                });
            } else {
                let size = 0;
                let lines = 0;

                try {
                    const stat = await fs.promises.stat(fullPath);
                    size = stat.size;

                    // Read only text files under 1MB
                    if (size < 1024 * 1024) {
                        const content = await fs.promises.readFile(fullPath, "utf8");
                        lines = content.split("\n").length;
                    }
                } catch {}

                results.push({
                    name: entry.name,
                    path: fullPath,
                    isFile: true,
                    size,
                    lines,
                });
            }
        }

        return results;
    };

    try {
        const tree = await scan(folderPath);
        return { success: true, tree };
    } catch (err) {
        return { success: false, error: err.message };
    }
});
