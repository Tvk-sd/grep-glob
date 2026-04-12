const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('panelAPI', {
  // context menu
  menuHover:    (cmd) => ipcRenderer.send('menu-hover', cmd),
  menuSelect:   (cmd) => ipcRenderer.send('menu-select', cmd),
  isAlwaysOnTop: ()   => ipcRenderer.invoke('is-always-on-top'),

  // grep panel
  getDefaultDir: ()             => ipcRenderer.invoke('get-default-dir'),
  pickDirectory: ()             => ipcRenderer.invoke('pick-directory'),
  runGrep:       (pat, dir)     => ipcRenderer.invoke('run-grep', pat, dir),
  grepDone:      (result)       => ipcRenderer.send('grep-done', result),
  closePanel:    ()             => ipcRenderer.send('close-panel'),

  // projects panel
  getProjects:   ()             => ipcRenderer.invoke('get-projects'),
  addProject:    (dirPath)      => ipcRenderer.invoke('add-project', dirPath),
  removeProject: (id)           => ipcRenderer.invoke('remove-project', id),
  openProject:   (dirPath)      => ipcRenderer.send('open-project', dirPath),
})
