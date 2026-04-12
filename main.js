const { app, BrowserWindow, Tray, ipcMain, dialog, clipboard, screen } = require('electron')
const path = require('path')
const { spawn, execFile } = require('child_process')
const { homedir } = require('os')
const fs = require('fs')

const PROJECTS_FILE = path.join(app.getPath('userData'), 'projects.json')
const TRACKER_SCAN_ROOT_FILE = path.join(app.getPath('userData'), 'tracker-scan-root.txt')

/** Where to look for `context/`, `conductor/`, etc. Defaults to ~/Projects (each child repo is scanned). */
function getTrackerScanRoot() {
  try {
    const s = fs.readFileSync(TRACKER_SCAN_ROOT_FILE, 'utf8').trim()
    if (s && fs.existsSync(s) && fs.statSync(s).isDirectory()) return path.resolve(s)
  } catch {
    /* use default */
  }
  return path.join(homedir(), 'Projects')
}

function setTrackerScanRoot(absPath) {
  const p = path.resolve(String(absPath || '').trim())
  if (!fs.existsSync(p) || !fs.statSync(p).isDirectory()) return false
  fs.writeFileSync(TRACKER_SCAN_ROOT_FILE, `${p}\n`, 'utf8')
  return true
}

const TRACKER_WALK_SKIP = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'vendor', '.cache'])

/** Top-level dirs (any case) where every `.md` file is scanned for `### Now`. */
const QUEUE_MD_SUBDIRS = ['context', 'conductor', 'docs', 'notes', 'spec', 'planning', 'handoffs']

function resolveChildDirCaseInsensitive(rootDir, preferredLowerName) {
  const direct = path.join(rootDir, preferredLowerName)
  try {
    if (fs.existsSync(direct) && fs.statSync(direct).isDirectory()) return direct
  } catch {
    return null
  }
  try {
    const ents = fs.readdirSync(rootDir, { withFileTypes: true })
    for (const e of ents) {
      if (e.isDirectory() && e.name.toLowerCase() === preferredLowerName) {
        return path.join(rootDir, e.name)
      }
    }
  } catch {
    return null
  }
  return null
}

function isTrackerOrHandoffMd(filename) {
  const l = String(filename).toLowerCase()
  if (!l.endsWith('.md')) return false
  return l.includes('tracker') || l.includes('handoff') || l.includes('hand-off')
}

/** All `.md` under `dir` (recursive), capped. */
function walkAllMarkdownFiles(dir, seen, out, maxTotal, depth = 0) {
  if (depth > 14 || out.length >= maxTotal) return
  let ents
  try {
    ents = fs.readdirSync(dir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of ents) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (TRACKER_WALK_SKIP.has(e.name)) continue
      walkAllMarkdownFiles(p, seen, out, maxTotal, depth + 1)
    } else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) {
      if (!seen.has(p)) {
        seen.add(p)
        out.push(p)
      }
    }
  }
}

/** Anywhere under repo: filename looks like tracker or handoff (recursive, capped). */
function discoverTrackerHandoffMarkdowns(rootDir, maxFiles = 100) {
  const root = path.resolve(rootDir)
  const seen = new Set()
  const out = []
  function walk(dir, depth) {
    if (depth > 12 || out.length >= maxFiles) return
    let ents
    try {
      ents = fs.readdirSync(dir, { withFileTypes: true })
    } catch {
      return
    }
    for (const e of ents) {
      const p = path.join(dir, e.name)
      if (e.isDirectory()) {
        if (TRACKER_WALK_SKIP.has(e.name)) continue
        walk(p, depth + 1)
      } else if (e.isFile() && isTrackerOrHandoffMd(e.name)) {
        if (!seen.has(p)) {
          seen.add(p)
          out.push(p)
        }
      }
    }
  }
  walk(root, 0)
  return out.sort((a, b) => a.localeCompare(b))
}

/** Every `.md` under context/conductor/docs/… plus tracker-named `.md` anywhere else (one repo). */
function discoverTrackerQueueMarkdownsSingleRepoPaths(rootDir, maxTotal = 160) {
  const root = path.resolve(rootDir)
  const seen = new Set()
  const out = []

  for (const name of QUEUE_MD_SUBDIRS) {
    const d = resolveChildDirCaseInsensitive(root, name)
    if (d) walkAllMarkdownFiles(d, seen, out, maxTotal, 0)
  }

  for (const p of discoverTrackerHandoffMarkdowns(root, 500)) {
    if (out.length >= maxTotal) break
    if (!seen.has(p)) {
      seen.add(p)
      out.push(p)
    }
  }

  return out.sort((a, b) => a.localeCompare(b))
}

function repoHasQueueMarkdown(repoPath) {
  return discoverTrackerQueueMarkdownsSingleRepoPaths(repoPath, 1).length > 0
}

/** If `listRoot` is a repo, `[listRoot]`; if it is a folder of repos (e.g. ~/Projects), each child with trackers. */
function resolveTrackerRepoRoots(listRoot) {
  const root = path.resolve(listRoot)
  if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) return []
  if (repoHasQueueMarkdown(root)) return [root]
  const children = []
  try {
    for (const e of fs.readdirSync(root, { withFileTypes: true })) {
      if (!e.isDirectory() || e.name.startsWith('.')) continue
      if (TRACKER_WALK_SKIP.has(e.name)) continue
      children.push(path.join(root, e.name))
    }
  } catch {
    return []
  }
  children.sort((a, b) => a.localeCompare(b))
  const withMd = []
  for (const d of children) {
    if (repoHasQueueMarkdown(d)) withMd.push(d)
  }
  return withMd.length ? withMd : [root]
}

function discoverTrackerQueueScanEntries(listRoot, maxTotal = 220) {
  const roots = resolveTrackerRepoRoots(listRoot)
  const per = Math.max(30, Math.floor(maxTotal / Math.max(1, roots.length)))
  const entries = []
  for (const rr of roots) {
    for (const absPath of discoverTrackerQueueMarkdownsSingleRepoPaths(rr, per)) {
      entries.push({ absPath, repoRoot: rr, displayRoot: path.resolve(listRoot) })
      if (entries.length >= maxTotal) return entries
    }
  }
  return entries
}

/**
 * First `### Now` block in a file: `-` / `*` bullets until the next `###`.
 * `repoRoot` resolves backtick `.md` links; `displayRoot` scopes `sourceRel` in the UI (often ~/Projects).
 */
function parseNowSectionFromFile(filePath, repoRoot, displayRoot) {
  const repo = path.resolve(repoRoot)
  const disp = displayRoot && String(displayRoot).trim()
    ? path.resolve(displayRoot)
    : repo
  let raw
  try {
    raw = fs.readFileSync(filePath, 'utf8')
  } catch {
    return []
  }
  const lines = raw.split(/\r?\n/)
  const items = []
  let i = 0
  while (i < lines.length) {
    if (!/^###\s+now\s*$/i.test(lines[i].trim())) {
      i++
      continue
    }
    i++
    while (i < lines.length) {
      const line = lines[i]
      if (/^###\s+/i.test(line)) break
      const bullet = line.match(/^\s*[-*]\s+(.*)$/)
      if (bullet) {
        const body = bullet[1].trim()
        const fileLine = i + 1
        let openPath = filePath
        let openLine = fileLine
        const tick = body.match(/`([^`]+\.md)`/)
        if (tick) {
          const rel = tick[1].trim()
          const candidates = path.isAbsolute(rel)
            ? [path.normalize(rel)]
            : [
                path.join(path.dirname(filePath), rel),
                path.join(repo, rel),
                path.join(disp, rel),
                path.join(__dirname, rel),
                path.join(process.cwd(), rel)
              ]
          for (const abs of candidates) {
            if (fs.existsSync(abs)) {
              openPath = abs
              openLine = 1
              break
            }
          }
        }
        let sourceRel = ''
        try {
          sourceRel = path.relative(disp, filePath)
        } catch {
          sourceRel = path.basename(filePath)
        }
        items.push({ text: body, line: fileLine, path: openPath, openLine, sourceRel })
      }
      i++
    }
    break
  }
  return items
}

const SWEEP_EXCLUDE_DIRS = ['.git', 'node_modules', 'vendor', '.next', 'dist', 'build']
const GREP_MAX_BUFFER = 8 * 1024 * 1024
const TODO_SWEEP_REGEX = 'TODO'

let win, tray
let contextMenuWin = null
let grepWin = null
let projectsWin = null
let grepBlurIgnoreUntil = 0

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
  if (win.isDestroyed()) return
  const projectsOpen = projectsWin && !projectsWin.isDestroyed()
  const grepOpen = grepWin && !grepWin.isDestroyed()
  if (state === 'idle' && (projectsOpen || grepOpen)) return
  if (projectsOpen && state !== 'glob' && state !== 'idle') return
  if (
    grepOpen &&
    state !== 'grep' &&
    state !== 'idle' &&
    state !== 'searching' &&
    state !== 'found' &&
    state !== 'error'
  ) {
    return
  }
  win.webContents.send('shrine-state', state)
}

function closeAllPanels() {
  [contextMenuWin, grepWin, projectsWin].forEach(w => {
    if (w && !w.isDestroyed()) w.close()
  })
  contextMenuWin = null
  grepWin = null
  projectsWin = null
}

/**
 * Open Terminal with cwd set reliably (open -a Terminal <path> often ignores path if Terminal is already open).
 * `opts.claude` — after cd, run `claude` (Claude Code CLI) in that directory.
 */
function openTerminalAtPath(dirPath, opts = {}) {
  const runClaude = !!opts.claude
  const resolved = path.resolve(dirPath)
  if (process.platform !== 'darwin') {
    spawn('open', ['-a', 'Terminal', resolved])
    return
  }
  const asLiteral = '"' + resolved.replace(/"/g, '""') + '"'
  const doScriptExpr = runClaude
    ? `"cd " & quoted form of ${asLiteral} & " && claude"`
    : `"cd " & quoted form of ${asLiteral}`
  const source = `tell application "Terminal"
  activate
  do script ${doScriptExpr}
end tell`
  execFile('osascript', ['-e', source], (err) => {
    if (err) spawn('open', ['-a', 'Terminal', resolved])
  })
}

// ── Panel factories ───────────────────────────────────────────────────────────

function createContextMenuWin() {
  closeAllPanels()
  const { x, y } = shrinePos()
  const menuW = 220, menuH = 132
  const display = screen.getDisplayNearestPoint({ x, y })
  const menuX = x + 200 + 8
  const menuY = y + Math.round((200 - menuH) / 2)
  contextMenuWin = new BrowserWindow(panelConfig(menuW, menuH, menuX, menuY))
  contextMenuWin.loadFile('context-menu.html')
  contextMenuWin.on('closed', () => {
    contextMenuWin = null
    setImmediate(() => {
      if ((projectsWin && !projectsWin.isDestroyed()) || (grepWin && !grepWin.isDestroyed())) return
      setShrineState('idle')
    })
  })
  contextMenuWin.on('blur', () => { if (!contextMenuWin?.isDestroyed()) contextMenuWin.close() })
}

function createGrepWin() {
  closeAllPanels()
  const { x, y } = shrinePos()
  const grepW = 300
  const grepH = 360
  grepWin = new BrowserWindow(panelConfig(grepW, grepH, x + 208, y))
  grepWin.loadFile('grep-panel.html')
  grepBlurIgnoreUntil = Date.now() + 500
  grepWin.webContents.once('did-finish-load', () => {
    if (grepWin && !grepWin.isDestroyed()) {
      grepWin.show()
      grepWin.focus()
    }
  })
  grepWin.on('closed', () => {
    grepWin = null
    setShrineState('idle')
  })
  grepWin.on('focus', () => setShrineState('grep'))
  grepWin.on('blur', () => {
    if (Date.now() < grepBlurIgnoreUntil) return
    if (!grepWin?.isDestroyed()) grepWin.close()
  })
}

function createProjectsWin() {
  closeAllPanels()
  const { x, y } = shrinePos()
  projectsWin = new BrowserWindow(panelConfig(300, 360, x + 208, y))
  projectsWin.loadFile('projects-panel.html')
  projectsWin.on('closed', () => { projectsWin = null; setShrineState('idle') })
  projectsWin.on('focus', () => setShrineState('glob'))
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

ipcMain.on('open-terminal', () =>
  openTerminalAtPath(path.join(homedir(), 'Projects'), { claude: true }))

ipcMain.on('open-context-menu', () => createContextMenuWin())

// ── IPC: context menu ─────────────────────────────────────────────────────────

ipcMain.on('menu-hover', (_e, command) => {
  if (command === 'grep' || command === 'glob') setShrineState(command)
  else if (command === 'idle') setShrineState('idle')
})

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

ipcMain.handle('get-tracker-scan-root', () => ({ path: getTrackerScanRoot() }))

ipcMain.handle('set-tracker-scan-root', (_e, dir) => {
  if (typeof dir !== 'string' || !dir.trim()) return { ok: false }
  return { ok: setTrackerScanRoot(dir) }
})

ipcMain.handle('pick-directory', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result.canceled ? null : result.filePaths[0]
})

function shellQuoteArg(s) {
  return `'${String(s).replace(/'/g, `'\\''`)}'`
}

function sweepGrepArgs(dir) {
  return [
    '-r', '-H', '-n', '-i', '-E',
    TODO_SWEEP_REGEX,
    '-I',
    ...SWEEP_EXCLUDE_DIRS.flatMap((d) => ['--exclude-dir', d]),
    dir
  ]
}

function sweepCmdLine(dir) {
  return `grep ${sweepGrepArgs(dir).map(shellQuoteArg).join(' ')}`
}

/** First `path:lineno:rest` using non-greedy file segment (paths may contain `:`). */
function parseGrepLine(line) {
  const m = line.match(/^(.+?):(\d+):(.*)$/)
  if (!m) return null
  const lineNo = parseInt(m[2], 10)
  if (!Number.isFinite(lineNo) || lineNo < 1) return null
  return { filePath: m[1], line: lineNo, snippet: m[3] }
}

function resolveGrepHitPath(rawPath, sweepRoot) {
  const s = String(rawPath || '').trim()
  if (!s) return ''
  const norm = path.normalize(s)
  if (path.isAbsolute(norm)) return norm
  const root = sweepRoot && String(sweepRoot).trim()
    ? path.resolve(String(sweepRoot).trim())
    : ''
  return root ? path.resolve(root, norm) : path.resolve(norm)
}

function parseTodoSweepHits(stdout, sweepRoot) {
  const lines = stdout.split('\n').filter(Boolean)
  const hits = []
  for (const line of lines) {
    const parsed = parseGrepLine(line)
    if (!parsed) continue
    hits.push({
      path: resolveGrepHitPath(parsed.filePath, sweepRoot),
      line: parsed.line,
      snippet: parsed.snippet
    })
  }
  return { count: hits.length, hits }
}

const GOTO_ARG_BUILDERS = [
  (filePath, line) => ['--goto', `${filePath}:${line}:1`],
  (filePath, line) => ['-g', `${filePath}:${line}:1`]
]

function editorCandidates() {
  if (process.platform === 'darwin') {
    return [
      '/Applications/Cursor.app/Contents/Resources/app/bin/cursor',
      'cursor',
      '/Applications/Visual Studio Code.app/Contents/Resources/app/bin/code',
      'code'
    ]
  }
  return ['cursor', 'code']
}

function trySpawnEditorOnce(execPath, argv) {
  return new Promise((resolve) => {
    const child = spawn(execPath, argv, { detached: true, stdio: 'ignore' })
    let settled = false
    const timer = setTimeout(() => done(false), 1200)
    function done(ok) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (ok) child.unref()
      resolve(ok)
    }
    child.on('error', () => done(false))
    child.on('spawn', () => done(true))
  })
}

async function launchEditorAtLine(absPath, lineNo) {
  const n = Math.max(1, parseInt(String(lineNo), 10) || 1)
  for (const bin of editorCandidates()) {
    for (const build of GOTO_ARG_BUILDERS) {
      const argv = build(absPath, n)
      if (await trySpawnEditorOnce(bin, argv)) return { ok: true, editor: bin }
    }
  }
  return { ok: false }
}

function tryOpenDarwinDefault(absPath) {
  return new Promise((resolve) => {
    const child = spawn('open', [absPath], { detached: true, stdio: 'ignore' })
    let settled = false
    const timer = setTimeout(() => done(false), 1200)
    function done(ok) {
      if (settled) return
      settled = true
      clearTimeout(timer)
      if (ok) child.unref()
      resolve(ok)
    }
    child.on('error', () => done(false))
    child.on('spawn', () => done(true))
  })
}

/** Collect `### Now` bullets from tracker `.md` under the scan root (see getTrackerScanRoot). */
function parseTrackerNextItems() {
  const listRoot = getTrackerScanRoot()
  if (!fs.existsSync(listRoot)) {
    return { error: 'missing-root', items: [] }
  }
  const entries = discoverTrackerQueueScanEntries(listRoot, 220)
  if (!entries.length) {
    return { error: 'no-tracker-files', items: [] }
  }
  const items = []
  for (const { absPath, repoRoot, displayRoot } of entries) {
    items.push(...parseNowSectionFromFile(absPath, repoRoot, displayRoot))
  }
  return { error: '', items }
}

function trackerNextPayload() {
  try {
    const data = parseTrackerNextItems()
    const err = data.error == null ? '' : String(data.error)
    return { error: err, items: Array.isArray(data.items) ? data.items : [] }
  } catch (err) {
    return { error: 'parse-failed', items: [], message: String(err && err.message) }
  }
}

ipcMain.on('tracker-next-sync', (event) => {
  event.returnValue = JSON.stringify(trackerNextPayload())
})

ipcMain.handle('get-tracker-next-items', () => trackerNextPayload())

ipcMain.handle('open-file-at-line', async (_e, filePath, line, sweepRoot) => {
  if (typeof filePath !== 'string' || !filePath.trim()) return { ok: false }
  const resolved = resolveGrepHitPath(filePath, sweepRoot)
  if (!resolved || !fs.existsSync(resolved)) return { ok: false }
  const n = Math.max(1, parseInt(String(line), 10) || 1)
  const r = await launchEditorAtLine(resolved, n)
  if (r.ok) return r
  if (process.platform === 'darwin' && (await tryOpenDarwinDefault(resolved))) {
    return { ok: true, editor: 'open' }
  }
  return { ok: false }
})

ipcMain.handle('run-grep', (_e, _pattern, dir, opts = {}) => {
  setShrineState('searching')
  if (!opts || !opts.sweep) {
    return Promise.resolve({ count: 0, error: true, cmd: '', hits: [] })
  }
  const cmd = sweepCmdLine(dir)
  const args = sweepGrepArgs(dir)
  const sweepRoot = path.resolve(String(dir || '').trim() || '.')
  return new Promise((resolve) => {
    execFile('grep', args, { maxBuffer: GREP_MAX_BUFFER }, (err, stdout) => {
      clipboard.writeText(cmd)
      if (err && err.code !== 1) {
        resolve({ count: 0, error: true, cmd, hits: [] })
        return
      }
      const { count, hits } = parseTodoSweepHits(stdout || '', sweepRoot)
      resolve({ count, error: false, cmd, hits })
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

ipcMain.on('copy-to-clipboard', (_e, text) => clipboard.writeText(text))

ipcMain.handle('run-glob', (_e, pattern, dir) => {
  if (!pattern.trim() || !dir) return { files: [], error: null }

  let searchDir = dir
  let namePattern = pattern

  if (pattern.startsWith('**/')) {
    namePattern = pattern.slice(3)
  } else {
    const split = pattern.indexOf('/**/')
    if (split !== -1) {
      searchDir = path.join(dir, pattern.slice(0, split))
      namePattern = pattern.slice(split + 4)
    }
  }

  const toFiles = (stdout) => (stdout || '').trim().split('\n')
    .filter(Boolean)
    .slice(0, 200)
    .map(p => ({ name: path.basename(p), rel: path.relative(dir, p), abs: p }))

  return new Promise(resolve => {
    // Plain filename (no wildcards): Spotlight via mdfind — instant, case-insensitive
    if (!/[*?]/.test(namePattern)) {
      execFile('/usr/bin/mdfind', ['-onlyin', searchDir, '-name', namePattern],
        { maxBuffer: 4 * 1024 * 1024, timeout: 6000 },
        (_err, stdout) => resolve({ files: toFiles(stdout), error: null })
      )
      return
    }

    // Glob pattern: find with -prune to skip noise dirs without descending into them
    execFile('find', [
      searchDir,
      '(', '-name', 'node_modules', '-o', '-name', '.git', '-o', '-name', '.*', ')',
      '-prune',
      '-o', '-iname', namePattern, '-print'
    ], { maxBuffer: 4 * 1024 * 1024, timeout: 10000 },
      (_err, stdout) => resolve({ files: toFiles(stdout), error: null })
    )
  })
})


// ── Lifecycle ─────────────────────────────────────────────────────────────────

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
