const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    generateData: (date, startTime, endTime) => ipcRenderer.invoke('generate-data', date, startTime, endTime),
    getData: () => ipcRenderer.invoke("get_data"),
    screenLock: (callback) => ipcRenderer.on('screen-locked', (_event) => callback()),
});