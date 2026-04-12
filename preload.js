const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  moveWindow:        (x, y) => ipcRenderer.send('move-window', x, y),
  shrineDragEnded:   (didDrag) => ipcRenderer.send('shrine-drag-ended', !!didDrag),
  openTerminal:    ()     => ipcRenderer.send('open-terminal'),
  openContextMenu: ()     => ipcRenderer.send('open-context-menu'),
  onShrineState:   (cb)   => ipcRenderer.on('shrine-state', (_e, s) => cb(s)),
  onGrepResult:    (cb)   => ipcRenderer.on('grep-result', (_e, r) => cb(r)),
  terminalStart:   (opts) => ipcRenderer.invoke('terminal-start', opts),
  terminalWrite:   (data) => ipcRenderer.send('terminal-write', data),
  terminalResize:  (cols, rows) => ipcRenderer.send('terminal-resize', cols, rows),
  terminalKill:    ()     => ipcRenderer.send('terminal-kill'),
  shrineCollapsed: ()     => ipcRenderer.send('shrine-collapsed'),
  onOpenShrineTerminal: (cb) => ipcRenderer.on('open-shrine-terminal', () => cb()),
  onTerminalOutput: (cb) => ipcRenderer.on('terminal-output', (_e, d) => cb(d)),
  onTerminalClosed: (cb) => ipcRenderer.on('terminal-closed', () => cb()),
})
