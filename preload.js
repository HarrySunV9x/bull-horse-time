const {contextBridge, ipcRenderer} = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    generateData: (date, startTime, endTime) => ipcRenderer.invoke('generate-data', date, startTime, endTime),
    getData: () => ipcRenderer.invoke("get_data")
});