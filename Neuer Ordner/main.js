const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const ptyManager = require('./ptyManager');
const stateDetector = require('./stateDetector');

const COLLAPSED_H = 52;
const EXPANDED_H  = 460;
const WIN_W       = 640;

let win;

const posFile = path.join(app.getPath('userData'), 'position.json');

function loadPosition() {
  try { return JSON.parse(fs.readFileSync(posFile, 'utf8')); }
  catch { return null; }
}

function savePosition(x, y) {
  fs.writeFileSync(posFile, JSON.stringify({ x, y }));
}

function createWindow() {
  const pos = loadPosition();

  win = new BrowserWindow({
    width:  WIN_W,
    height: COLLAPSED_H,
    x: pos?.x,
    y: pos?.y ?? 40,
    frame: false,
    transparent: true,
    hasShadow: true,
    alwaysOnTop: true,
    vibrancy: 'sidebar',
    visualEffectState: 'active',
    type: 'panel',
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      sandbox: false,
    },
  });

  win.setAlwaysOnTop(true, 'floating');
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  win.on('moved', () => {
    const [x, y] = win.getPosition();
    savePosition(x, y);
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  ptyManager.closeAll();
  app.quit();
});

// ── IPC ──────────────────────────────────────────────────────────────────────

ipcMain.handle('tab:create', () => {
  return ptyManager.create(win, stateDetector);
});

ipcMain.handle('tab:close', (_, tabId) => {
  ptyManager.close(tabId);
});

ipcMain.on('pty:write', (_, { tabId, data }) => {
  ptyManager.write(tabId, data);
});

ipcMain.on('pty:resize', (_, { tabId, cols, rows }) => {
  ptyManager.resize(tabId, cols, rows);
});

ipcMain.handle('window:toggle', () => {
  const [w, h] = win.getSize();
  const expanding = h <= COLLAPSED_H;
  win.setBounds({ width: w, height: expanding ? EXPANDED_H : COLLAPSED_H }, true);
  return expanding;
});
