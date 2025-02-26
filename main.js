const { app, BrowserWindow, ipcMain, Menu, Tray, nativeImage } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { exec } = require('child_process');

let mainWindow;
let tray = null;
let contextMenu = null;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        title: 'Discord-Fix',
        frame: true,
        icon: path.join(__dirname, 'icons', 'icon.ico'),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            enableRemoteModule: false,
        },
    });

    mainWindow.loadFile('index.html');
    Menu.setApplicationMenu(null);

    const iconPath = path.join(__dirname, 'icons', 'icon.ico');
    const trayIcon = nativeImage.createFromPath(iconPath).resize({ width: 16, height: 16 });
    tray = new Tray(trayIcon);

    const updateContextMenu = () => {
        contextMenu = Menu.buildFromTemplate([
            {
                label: mainWindow.isVisible() ? 'Скрыть окно' : 'Показать окно',
                click: () => {
                    if (mainWindow.isVisible()) {
                        mainWindow.hide();
                    } else {
                        mainWindow.show();
                    }
                    updateContextMenu();
                },
            },
            {
                type: 'separator',
            },
            {
                label: 'Выход',
                click: () => {
                    app.isQuitting = true;
                    app.quit();
                },
            },
        ]);
        tray.setContextMenu(contextMenu);
    };

    updateContextMenu();

    tray.on('click', () => {
        if (mainWindow.isVisible()) {
            mainWindow.hide();
        } else {
            mainWindow.show();
        }
        updateContextMenu();
    });

    mainWindow.on('close', (event) => {
        if (!app.isQuitting) {
            event.preventDefault();
            mainWindow.hide();
            updateContextMenu();
        }
    });

    app.on('before-quit', () => {
        app.isQuitting = true;
    });
}

app.whenReady().then(() => {
    createWindow();

    ipcMain.handle('get-bat-files', async () => {
        const batFolder = path.join(__dirname, 'DiscordFix');
        try {
            const files = await fs.readdir(batFolder);
            return files.filter(file => file.endsWith('.bat'));
        } catch (err) {
            console.error('Ошибка чтения папки:', err);
            return [];
        }
    });

    ipcMain.on('start-bat-file', (event, file) => {
        const batFilePath = path.join(__dirname, 'DiscordFix', file);
        console.log('Запуск файла:', batFilePath);
        const batProcess = exec(`cmd.exe /c "${batFilePath}"`, (err) => {
            if (err) {
                console.error('Ошибка при запуске .bat файла:', err);
            }
        });
        mainWindow.webContents.send('bat-file-started');
    });

    ipcMain.on('stop-bat-file', () => {
        exec('taskkill /IM winws.exe /F /T', (err, stdout, stderr) => {
            if (err) {
                console.error('Ошибка при завершении winws.exe:', err);
                console.error('stderr:', stderr);
            } else {
                console.log('Процесс winws.exe завершен');
                console.log('stdout:', stdout);
            }
            mainWindow.webContents.send('bat-file-stopped');
        });
    });

    ipcMain.on('close-window', () => {
        mainWindow.close();
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
