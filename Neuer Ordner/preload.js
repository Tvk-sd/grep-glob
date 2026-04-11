const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  createTab:    ()                    => ipcRenderer.invoke('tab:create'),
  closeTab:     (tabId)               => ipcRenderer.invoke('tab:close', tabId),
  writeToTab:   (tabId, data)         => ipcRenderer.send('pty:write', { tabId, data }),
  resizePty:    (tabId, cols, rows)   => ipcRenderer.send('pty:resize', { tabId, cols, rows }),
  toggleWindow: ()                    => ipcRenderer.invoke('window:toggle'),

  onPtyData: (tabId, cb) => {
    const channel = `pty:data:${tabId}`;
    const handler = (_, data) => cb(data);
    ipcRenderer.on(channel, handler);
    return () => ipcRenderer.removeListener(channel, handler);
  },

  onStateChange: (cb) => {
    ipcRenderer.on('tab:state-change', (_, payload) => cb(payload));
  },
});
