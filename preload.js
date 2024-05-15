const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    generateData: (startTime, endTime) => ipcRenderer.invoke('generate-data', startTime, endTime)
});