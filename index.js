const {app, BrowserWindow, ipcMain} = require('electron/main')
const path = require('path');
const fs = require('fs');

const userDataPath = app.getPath('userData');
try {
    require('electron-reloader')(module, {});
} catch (_) {
}
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

function getWorkTime(startTime, endTime) {
    const startDate = new Date("2000-01-01 " + startTime);
    const endDate = new Date("2000-01-01 " + endTime);

    const timeDiff = endDate - startDate;

    return (timeDiff / (1000 * 60 * 60)).toFixed(3)
}

// 处理生成数据事件
ipcMain.handle('generate-data', (event, date, startTime, endTime) => {
    const data = {
        date: date,
        startTime: startTime,
        endTime: endTime,
        workTime: getWorkTime(startTime, endTime)
    };
    const filePath = path.join(userDataPath, 'data.json');
// 读取现有数据
    let existingData = [];
    if (fs.existsSync(filePath) && fs.readFileSync(filePath, 'utf8') !== "") {
        existingData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
    // 查找是否有匹配的日期条目
    const index = existingData.findIndex(entry => entry.date === date);
    if (index !== -1) {
        existingData[index].endTime = data.endTime;
        existingData[index].workTime = data.workTime;
    } else {
        // 不存在匹配的日期，添加新条目
        existingData.unshift(data);
    }

    fs.writeFileSync(filePath, JSON.stringify(existingData, null, 2));
    return data;
});

ipcMain.handle('get_data', (event) => {
    const filePath = path.join(userDataPath, 'data.json');
    const existingData = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath)) : [];
    return existingData;
});