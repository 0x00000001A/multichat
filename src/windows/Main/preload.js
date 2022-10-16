const {contextBridge, ipcRenderer} = require('electron')

contextBridge.exposeInMainWorld('bridge', {
  onLogin: (providerName) => ipcRenderer.invoke('onLogin', providerName),
  onMessage: (messageText) => ipcRenderer.invoke('onMessage', messageText),
  getProviders: () => ipcRenderer.invoke('getProviders')
})
