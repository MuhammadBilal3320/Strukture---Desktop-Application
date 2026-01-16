// preload.js
import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("api", {
  selectFolder: () => ipcRenderer.invoke("select-folder"),
  createFolder: (folderPath) => ipcRenderer.invoke("create-folder", folderPath),
  createFile: (filePath) => ipcRenderer.invoke("create-file", filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke("write-file", filePath, content),
  scanFolder: (folderPath) => ipcRenderer.invoke("scan-folder", folderPath),
  readFile: (filePath) => ipcRenderer.invoke("read-file", filePath),
  scanFolderDeep: (folderPath)=> ipcRenderer.invoke("scan-folder-deep", folderPath)
});
