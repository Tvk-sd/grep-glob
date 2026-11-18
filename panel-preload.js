const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('panelAPI', {
  // context menu
  menuHover:    (cmd) => ipcRenderer.send('menu-hover', cmd),
  menuSelect:   (cmd) => ipcRenderer.send('menu-select', cmd),
  isAlwaysOnTop: ()   => ipcRenderer.invoke('is-always-on-top'),

  // grep panel
  getDefaultDir: ()             => ipcRenderer.invoke('get-default-dir'),
  getTrackerScanRoot: ()        => ipcRenderer.invoke('get-tracker-scan-root'),
  setTrackerScanRoot: (dir)     => ipcRenderer.invoke('set-tracker-scan-root', dir),
  pickDirectory: ()             => ipcRenderer.invoke('pick-directory'),
  runGrep:       (pat, dir, opts) => ipcRenderer.invoke('run-grep', pat, dir, opts ?? {}),
  getTrackerNextItems: () => {
    try {
      const raw = ipcRenderer.sendSync('tracker-next-sync')
      if (typeof raw !== 'string' || !raw) {
        return ipcRenderer.invoke('get-tracker-next-items')
      }
      try {
        return JSON.parse(raw)
      } catch {
        return ipcRenderer.invoke('get-tracker-next-items')
      }
    } catch {
      return ipcRenderer.invoke('get-tracker-next-items')
    }
  },
  openFileAtLine: (filePath, line, sweepRoot) => ipcRenderer.invoke('open-file-at-line', filePath, line, sweepRoot),
  grepDone:      (result)       => ipcRenderer.send('grep-done', result),
  closePanel:    ()             => ipcRenderer.send('close-panel'),

  // glob panel
  openProject:       (dirPath)      => ipcRenderer.send('open-project', dirPath),
  copyToClipboard:   (text)         => ipcRenderer.send('copy-to-clipboard', text),
  runGlob:           (pattern, dir) => ipcRenderer.invoke('run-glob', pattern, dir),

  // zoo panel
  scanAgents:        (dir)          => ipcRenderer.invoke('scan-agents', dir),
  zooPickDirectory:  ()             => ipcRenderer.invoke('zoo-pick-directory'),
})
