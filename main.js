const { app, BrowserWindow, Tray, ipcMain, dialog, clipboard } = require('electron')
const path = require('path')
const { spawn, execFile } = require('child_process')
const { homedir } = require('os')
const fs = require('fs')

const PROJECTS_FILE = path.join(app.getPath('userData'), 'projects.json')

let win, tray
let contextMenuWin = null
let grepWin = null
let projectsWin = null

// ── Projects persistence ──────────────────────────────────────────────────────

function readProjects() {
  try { return JSON.parse(fs.readFileSync(PROJECTS_FILE, 'utf8')) }
  catch { return [] }
}

function writeProjects(list) {
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(list, null, 2))
}

// ── Shared panel window config ────────────────────────────────────────────────

function panelConfig(width, height, x, y) {
  return {
    width, height, x, y,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'panel-preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  }
}

function shrinePos() {
  const [x, y] = win.getPosition()
  return { x, y }
}

function setShrineState(state) {
  if (!win.isDestroyed()) win.webContents.send('shrine-state', state)
}

function closeAllPanels() {
  [contextMenuWin, grepWin, projectsWin].forEach(w => {
    if (w && !w.isDestroyed()) w.close()
  })
  contextMenuWin = null
  grepWin = null
  projectsWin = null
}

/** Open Terminal with cwd set reliably (open -a Terminal <path> often ignores path if Terminal is already open). */
function openTerminalAtPath(dirPath) {
  const resolved = path.resolve(dirPath)
  if (process.platform !== 'darwin') {
    spawn('open', ['-a', 'Terminal', resolved])
    return
  }
  const asLiteral = '"' + resolved.replace(/"/g, '""') + '"'
  const source = `tell application "Terminal"
  activate
  do script "cd " & quoted form of ${asLiteral}
end tell`
  execFile('osascript', ['-e', source], (err) => {
    if (err) spawn('open', ['-a', 'Terminal', resolved])
  })
}

// ── Panel factories ───────────────────────────────────────────────────────────

function createContextMenuWin() {
  closeAllPanels()
  const { x, y } = shrinePos()
  contextMenuWin = new BrowserWindow(panelConfig(220, 148, x + 208, y + 20))
  contextMenuWin.loadFile('context-menu.html')
  contextMenuWin.on('closed', () => { contextMenuWin = null; setShrineState('idle') })
  contextMenuWin.on('blur', () => { if (!contextMenuWin?.isDestroyed()) contextMenuWin.close() })
}

function createGrepWin() {
  closeAllPanels()
  const { x, y } = shrinePos()
  grepWin = new BrowserWindow(panelConfig(300, 130, x + 208, y + 35))
  grepWin.loadFile('grep-panel.html')
  grepWin.on('closed', () => { grepWin = null; setShrineState('idle') })
  grepWin.on('blur', () => { if (!grepWin?.isDestroyed()) grepWin.close() })
}

function createProjectsWin() {
  closeAllPanels()
  const { x, y } = shrinePos()
  projectsWin = new BrowserWindow(panelConfig(240, 300, x + 208, y))
  projectsWin.loadFile('projects-panel.html')
  projectsWin.on('closed', () => { projectsWin = null; setShrineState('idle') })
  projectsWin.on('blur', () => { if (!projectsWin?.isDestroyed()) projectsWin.close() })
}

// ── App setup ─────────────────────────────────────────────────────────────────

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 200,
    height: 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    hasShadow: false,
    resizable: false,
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  win.loadFile('index.html')
  app.setLoginItemSettings({ openAtLogin: true })

  tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'))
  tray.setToolTip('Greg & Glop')
  tray.on('right-click', () => createContextMenuWin())
})

// ── IPC: shrine ───────────────────────────────────────────────────────────────

ipcMain.on('move-window', (_e, x, y) => win.setPosition(x, y))

ipcMain.on('open-terminal', () => {
  spawn('open', ['-a', 'Terminal', path.join(homedir(), 'Projects')])
})

ipcMain.on('open-context-menu', () => createContextMenuWin())

// ── IPC: context menu ─────────────────────────────────────────────────────────

ipcMain.on('menu-hover', (_e, command) => setShrineState(command ?? 'idle'))

ipcMain.on('menu-select', (_e, command) => {
  if (!contextMenuWin?.isDestroyed()) { contextMenuWin.close(); contextMenuWin = null }
  if (command === 'grep') { setShrineState('grep'); createGrepWin() }
  else if (command === 'glob') { setShrineState('glob'); createProjectsWin() }
  else if (command === 'toggle-top') win.setAlwaysOnTop(!win.isAlwaysOnTop())
  else if (command === 'quit') app.quit()
})

ipcMain.handle('is-always-on-top', () => win.isAlwaysOnTop())

// ── IPC: grep panel ───────────────────────────────────────────────────────────

ipcMain.handle('get-default-dir', () => path.join(homedir(), 'Projects'))

ipcMain.handle('pick-directory', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result.canceled ? null : result.filePaths[0]
})

ipcMain.handle('run-grep', (_e, pattern, dir) => {
  setShrineState('searching')
  const cmd = `grep -r "${pattern}" "${dir}"`
  return new Promise((resolve) => {
    execFile('grep', ['-r', '--', pattern, dir], (err, stdout) => {
      clipboard.writeText(cmd)
      if (err?.code === 2) {
        resolve({ count: 0, error: true, cmd })
      } else {
        const count = stdout.trim() === '' ? 0 : stdout.trim().split('\n').length
        resolve({ count, error: false, cmd })
      }
    })
  })
})

ipcMain.on('grep-done', (_e, result) => {
  setShrineState(result.error ? 'error' : 'found')
  if (!win.isDestroyed()) win.webContents.send('grep-result', result)
})

ipcMain.on('close-panel', () => { closeAllPanels(); setShrineState('idle') })

// ── IPC: projects panel ───────────────────────────────────────────────────────

ipcMain.handle('get-projects', () => readProjects())

ipcMain.handle('add-project', (_e, dirPath) => {
  const list = readProjects()
  list.push({ id: Date.now().toString(), name: path.basename(dirPath), path: dirPath })
  writeProjects(list)
  return list
})

ipcMain.handle('remove-project', (_e, id) => {
  const list = readProjects().filter(p => p.id !== id)
  writeProjects(list)
  return list
})

ipcMain.on('open-project', (_e, dirPath) => {
  if (typeof dirPath === 'string' && dirPath.length > 0) openTerminalAtPath(dirPath)
  closeAllPanels()
  setShrineState('idle')
})

// ── Lifecycle ─────────────────────────────────────────────────────────────────

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
