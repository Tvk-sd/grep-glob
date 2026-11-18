/**
 * Agent Zoo scanner — finds Claude Code subagents on disk and reads what each one is for.
 *
 * Glop's half: walk a root folder for `.claude/agents/*.md` (the glob).
 * Greg's half: read each file's frontmatter for name / description / tools / model (the grep).
 *
 * Pure Node (no Electron) so it can be run and tested on its own.
 */
const fs = require('fs')
const path = require('path')
const { homedir } = require('os')

const WALK_SKIP = new Set(['node_modules', '.git', '.next', 'dist', 'build', 'vendor', '.cache'])
const MAX_PROJECT_DEPTH = 4
const MAX_AGENTS = 300
const MAX_FRONTMATTER_BYTES = 16 * 1024

function stripQuotes(s) {
  const t = String(s).trim()
  if (t.length >= 2 && ((t[0] === '"' && t.endsWith('"')) || (t[0] === "'" && t.endsWith("'")))) {
    return t.slice(1, -1)
  }
  return t
}

/**
 * Minimal YAML frontmatter reader: `key: value`, block scalars (`>` / `|`) and `- item` lists.
 * Returns `null` when the file has no frontmatter block.
 */
function parseFrontmatter(raw) {
  const lines = String(raw).replace(/^﻿/, '').split(/\r?\n/)
  if (!lines.length || lines[0].trim() !== '---') return null
  const end = lines.findIndex((l, i) => i > 0 && l.trim() === '---')
  if (end === -1) return null

  const out = {}
  let key = null
  let mode = null // 'block' | 'list' | null
  for (const line of lines.slice(1, end)) {
    const top = line.match(/^([A-Za-z][\w-]*):\s*(.*)$/)
    if (top) {
      key = top[1]
      const val = top[2].trim()
      if (/^[>|][+-]?$/.test(val)) {
        mode = 'block'
        out[key] = ''
      } else if (val === '') {
        mode = 'list'
        out[key] = []
      } else if (val.startsWith('[') && val.endsWith(']')) {
        mode = null
        out[key] = val.slice(1, -1).split(',').map(stripQuotes).filter(Boolean)
      } else {
        mode = null
        out[key] = stripQuotes(val)
      }
      continue
    }
    if (!key) continue
    if (mode === 'block') {
      out[key] = `${out[key]} ${line.trim()}`.trim()
    } else if (mode === 'list') {
      const item = line.match(/^\s*-\s+(.*)$/)
      if (item) out[key].push(stripQuotes(item[1]))
    }
  }
  return out
}

function toToolList(v) {
  if (Array.isArray(v)) return v.map((s) => String(s).trim()).filter(Boolean)
  if (typeof v === 'string' && v.trim()) return v.split(',').map((s) => s.trim()).filter(Boolean)
  return []
}

function readHead(filePath) {
  const fd = fs.openSync(filePath, 'r')
  try {
    const buf = Buffer.alloc(MAX_FRONTMATTER_BYTES)
    const n = fs.readSync(fd, buf, 0, MAX_FRONTMATTER_BYTES, 0)
    return buf.toString('utf8', 0, n)
  } finally {
    fs.closeSync(fd)
  }
}

/** One agent file → one zoo entry. A file without usable frontmatter is still listed, flagged `broken`. */
function readAgentFile(filePath, home) {
  let fm = null
  let mtimeMs = 0
  try {
    fm = parseFrontmatter(readHead(filePath))
    mtimeMs = fs.statSync(filePath).mtimeMs
  } catch {
    fm = null
  }
  const fallbackName = path.basename(filePath, '.md')
  const name = fm && typeof fm.name === 'string' && fm.name ? fm.name : fallbackName
  const description = fm && typeof fm.description === 'string' ? fm.description : ''
  const hasTools = !!fm && fm.tools !== undefined
  return {
    name,
    description,
    tools: hasTools ? toToolList(fm.tools) : [],
    allTools: !hasTools,
    model: fm && typeof fm.model === 'string' ? fm.model : '',
    path: filePath,
    home,
    mtimeMs,
    broken: !fm || !description
  }
}

function listAgentFiles(agentsDir, out, depth = 0) {
  if (depth > 2) return
  let ents
  try {
    ents = fs.readdirSync(agentsDir, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of ents) {
    const p = path.join(agentsDir, e.name)
    if (e.isDirectory()) listAgentFiles(p, out, depth + 1)
    else if (e.isFile() && e.name.toLowerCase().endsWith('.md')) out.push(p)
  }
}

/** Every directory under `root` (inclusive, depth-capped) that holds a `.claude/agents` folder. */
function findAgentDirs(root, out, depth = 0) {
  const candidate = path.join(root, '.claude', 'agents')
  try {
    if (fs.statSync(candidate).isDirectory()) out.push({ projectDir: root, agentsDir: candidate })
  } catch {
    /* no agents here */
  }
  if (depth >= MAX_PROJECT_DEPTH) return
  let ents
  try {
    ents = fs.readdirSync(root, { withFileTypes: true })
  } catch {
    return
  }
  for (const e of ents) {
    if (!e.isDirectory() || e.name.startsWith('.') || WALK_SKIP.has(e.name)) continue
    findAgentDirs(path.join(root, e.name), out, depth + 1)
  }
}

/**
 * Scan `scanRoot` for project agents, plus the personal agents in `~/.claude/agents`.
 * `opts.userHome` overrides the home directory (tests).
 */
function scanAgents(scanRoot, opts = {}) {
  const root = path.resolve(String(scanRoot || ''))
  const userHome = opts.userHome || homedir()
  let rootOk = false
  try {
    rootOk = fs.statSync(root).isDirectory()
  } catch {
    rootOk = false
  }

  const dirs = []
  if (rootOk) findAgentDirs(root, dirs)

  const agents = []
  const seen = new Set()
  function addDir(agentsDir, home) {
    const files = []
    listAgentFiles(agentsDir, files)
    for (const f of files.sort((a, b) => a.localeCompare(b))) {
      if (seen.has(f) || agents.length >= MAX_AGENTS) continue
      seen.add(f)
      agents.push(readAgentFile(f, home))
    }
  }

  for (const d of dirs.sort((a, b) => a.projectDir.localeCompare(b.projectDir))) {
    const rel = path.relative(root, d.projectDir)
    addDir(d.agentsDir, rel || path.basename(root))
  }
  addDir(path.join(userHome, '.claude', 'agents'), 'personal')

  return {
    error: rootOk ? '' : 'missing-root',
    root,
    agents,
    capped: agents.length >= MAX_AGENTS
  }
}

module.exports = { scanAgents, parseFrontmatter }
