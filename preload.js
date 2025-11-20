const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    getPasswords: () => ipcRenderer.invoke('get-passwords'),
    addPassword: (entry) => ipcRenderer.invoke('add-password', entry),
    deletePassword: (id) => ipcRenderer.invoke('delete-password', id)
});