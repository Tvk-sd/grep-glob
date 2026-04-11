const pty = require('node-pty');
const { randomUUID } = require('crypto');

const sessions = new Map();

function create(win, stateDetector) {
  const tabId = randomUUID();

  const proc = pty.spawn('claude', [], {
    name: 'xterm-256color',
    cols: 80,
    rows: 24,
    cwd: process.env.HOME,
    env: { ...process.env, TERM: 'xterm-256color' },
  });

  proc.onData(data => {
    win.webContents.send(`pty:data:${tabId}`, data);
    stateDetector.feed(tabId, data, win);
  });

  proc.onExit(({ exitCode }) => {
    const state = exitCode === 0 ? 'idle' : 'error';
    win.webContents.send('tab:state-change', { tabId, state });
    sessions.delete(tabId);
  });

  sessions.set(tabId, proc);
  return tabId;
}

function write(tabId, data)        { sessions.get(tabId)?.write(data); }
function resize(tabId, cols, rows) { sessions.get(tabId)?.resize(cols, rows); }
function close(tabId)              { sessions.get(tabId)?.kill(); sessions.delete(tabId); }
function closeAll()                { sessions.forEach(p => p.kill()); sessions.clear(); }

module.exports = { create, write, resize, close, closeAll };
