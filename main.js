const { app, BrowserWindow, Menu, Tray, ipcMain } = require('electron')
const path = require('path')
const { spawn } = require('child_process')
const { homedir } = require('os')

let win
let tray

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

  // Auto-start on login
  app.setLoginItemSettings({ openAtLogin: true })

  // System tray icon (fallback control surface)
  tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'))
  tray.setToolTip('Greg & Glop')
  tray.on('right-click', () => tray.setContextMenu(buildContextMenu()))

  win.webContents.on('context-menu', () => {
    buildContextMenu().popup({ window: win })
  })
})

function buildContextMenu() {
  return Menu.buildFromTemplate([
    {
      label: 'Open Terminal',
      click: () => {
        spawn('open', ['-a', 'Terminal', path.join(homedir(), 'Projects')])
      }
    },
    { type: 'separator' },
    {
      label: 'Always on Top',
      type: 'checkbox',
      checked: win.isAlwaysOnTop(),
      click: (item) => {
        win.setAlwaysOnTop(item.checked)
      }
    },
    { type: 'separator' },
    { label: 'Quit Greg & Glop', role: 'quit' }
  ])
}

ipcMain.on('move-window', (_e, x, y) => {
  win.setPosition(x, y)
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
