const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getBatFiles: () => ipcRenderer.invoke('get-bat-files'),
    startBatFile: (file) => ipcRenderer.send('start-bat-file', file),
    stopBatFile: () => ipcRenderer.send('stop-bat-file'),
    onBatFileStarted: (callback) => ipcRenderer.on('bat-file-started', callback),
    onBatFileStopped: (callback) => ipcRenderer.on('bat-file-stopped', callback),
});
