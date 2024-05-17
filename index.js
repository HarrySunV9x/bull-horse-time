const {Tray, Menu, app, BrowserWindow, ipcMain, ipcRenderer, powerMonitor} = require('electron/main')
const path = require('path');
const fs = require('fs');

let win = null;
let tray = null;
let isQuiting = false;

const userDataPath = app.getPath('userData');
try {
    require('electron-reloader')(module, {});
} catch (_) {
}
const createWindow = () => {
    win = new BrowserWindow({
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

    win.webContents.on('dom-ready', () => {
        // 设置 powerMonitor 监听器
        powerMonitor.on('lock-screen', () => {
            win.webContents.send('screen-locked');
        });

        powerMonitor.on('unlock-screen', () => {
            win.webContents.send('screen-locked');
        });
    });

    // 系统托盘图标设置
    tray = new Tray(path.join(__dirname, './public/logo.jpg')); // 确保你的图标路径正确
    const contextMenu = Menu.buildFromTemplate([
        { label: '显示', click: () => { win.show(); } },
        { label: '退出', click: () => {
                isQuiting = true;
                app.quit();
            } }
    ]);
    tray.setToolTip('bull-horse-time');
    tray.setContextMenu(contextMenu);

    tray.on('click', () => {
        win.isVisible() ? win.hide() : win.show();
    });

    win.on('close', (event) => {
        if (!isQuiting) {
            event.preventDefault();
            win.hide();
        }
        return false;
    });
}

app.whenReady().then(() => {
    createWindow()

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })

    app.setLoginItemSettings({
        openAtLogin: true,  // 开机启动
        path: app.getPath('exe'),
        args: ['--hidden']  // 可选参数，表示启动时隐藏窗口
    });
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

