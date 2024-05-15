const { app, BrowserWindow ,ipcMain} = require('electron/main')
const path = require('path');
const fs = require('fs');

try {
    require('electron-reloader')(module, {});
} catch (_) {}
const createWindow = () => {
    const win = new BrowserWindow({
        width: 350,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        titleBarStyle: 'hidden',
        titleBarOverlay: {
            color: '#ffffff',
            symbolColor: '#74b1be',
            height: 10,
        }
    })

    win.loadFile('index.html')
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

// 处理生成数据事件
ipcMain.handle('generate-data', (event, startTime, endTime) => {
    console.log(1);
    const data = {
        startTime: startTime,
        endTime: endTime
    };

    const filePath = path.join(__dirname, 'data.json');
    const existingData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];
    existingData.push(data);
    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));

    return data;
});