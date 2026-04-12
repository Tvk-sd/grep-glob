const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  moveWindow:      (x, y) => ipcRenderer.send('move-window', x, y),
  openTerminal:    ()     => ipcRenderer.send('open-terminal'),
  openContextMenu: ()     => ipcRenderer.send('open-context-menu'),
  onShrineState:   (cb)   => ipcRenderer.on('shrine-state', (_e, s) => cb(s)),
  onGrepResult:    (cb)   => ipcRenderer.on('grep-result', (_e, r) => cb(r)),
})
