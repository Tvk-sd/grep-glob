# Greb & Glob — Claude Session Context

Technical context and key architectural decisions for AI coding sessions.

## Quick Reference
```bash
cd path/to/this-repo
npm start       # launch the shrine
```

## Stack
- **Electron 34** — frameless transparent window, always-on-top, IPC bridge
- **Vanilla JS + Canvas** — no framework, no bundler
- **node_modules**: electron only (devDependency)
- No backend, no database — optional `~/Library/Application Support/greg-and-glop/projects.json` with `get-projects` / `add-project` / `remove-project` IPC (reserved for a future pinned jumper; **Glob panel does not use it** today)

## Project structure
```
main.js               — Electron main process: window setup, IPC handlers, panel factories
preload.js            — Shrine renderer bridge (contextBridge)
panel-preload.js      — Panel renderer bridge (contextBridge for all panels)
index.html            — Shrine: canvas animation, badge, drag, click, context menu trigger
context-menu.html     — Custom right-click menu (Greb/Glob rows + system row)
grep-panel.html       — Greb panel: queue from `context/PROJECT-TRACKER.md` (Now / Next / Later), open file at line in editor
projects-panel.html   — Glob panel: glob pattern + search root, live matches, copy relative path, Terminal in hit folder
assets/               — Sprite PNGs (Group 5–10.png) + tray-icon.png
docs/                 — Concept docs and research
```

## Sprite frame map
| File | Index | Meaning |
|---|---|---|
| Group 5.png | 0 | Loop start |
| Group 6.png | 1 | **Greb (`greb`)** — compact single bug |
| Group 7.png | 2 | Loop mid |
| Group 8.png | 3 | **Glob (`glob`)** — two bugs splitting wide |
| Group 9.png | 4 | Loop end |
| Group 10.png | 5 | **Idle** — fully spread, at rest |

## Shrine states
| State | Frame | When |
|---|---|---|
| `idle` | Group 10 | Default |
| `grep` | Group 6 | Hovering Greb row / Greb (`grep-panel`) open |
| `glob` | Group 8 | Hovering Glob row / Glob (`projects-panel`) open |
| `searching` | Loop | `run-grep` sweep in flight (main still supports this; current Greb panel does not call it) |
| `found` | Group 6 | After `grep-done` with a result (badge path) |
| `error` | Group 5 | After `grep-done` with error (badge path) |

## IPC channels
| Channel | Direction | Purpose |
|---|---|---|
| `move-window` | renderer → main | Drag reposition |
| `open-terminal` | renderer → main | Open Terminal at ~/Projects |
| `open-context-menu` | renderer → main | Show custom menu |
| `shrine-state` | main → shrine | Push animation state |
| `grep-result` | main → shrine | Push match count / error for badge (when `grep-done` runs) |
| `menu-hover` | panel → main | Relay hover to shrine |
| `menu-select` | panel → main | Menu item clicked |
| `is-always-on-top` | panel → main | Read window state |
| `get-default-dir` | panel → main | ~/Projects path |
| `pick-directory` | panel → main | Folder picker dialog (Glob root) |
| `tracker-next-sync` | panel → main | Sync read: tracker JSON payload |
| `get-tracker-next-items` | panel → main | Same payload (async) |
| `open-file-at-line` | panel → main | Open path in Cursor/VS Code at line |
| `run-grep` | panel → main | TODO sweep via `grep` when `opts.sweep` (copies cmd to clipboard; not used by current Greb panel UI) |
| `grep-done` | panel → main | Notify shrine after `run-grep` (badge + `found` / `error`) |
| `run-glob` | panel → main | Resolve glob under directory (`mdfind` / `find`) |
| `copy-to-clipboard` | panel → main | Copy string (Glob row path) |
| `close-panel` | panel → main | Self-close |
| `get-projects` | panel → main | Load projects.json (no panel UI yet) |
| `add-project` | panel → main | Add + save (no panel UI yet) |
| `remove-project` | panel → main | Remove by id + save (no panel UI yet) |
| `open-project` | panel → main | Open Terminal at directory (Glob ↗, plus menu flows) |

## Known bugs (see `context/PROJECT-TRACKER.md` → Later / Resume)
1. **Context menu** — design/centering needs rework
2. **Badge position** — sits awkwardly on the sprite
3. **Glob default root** — panel initializes search root as parent of `~/Projects` (home); confirm that is intentional vs searching from `~/Projects` only

## Key Architectural Decisions
- **Fixed shrine window** — Never expand main window (200×200), panels are separate BrowserWindows
- **Panel positioning** — 8px to the right of shrine, computed from `win.getPosition()`
- **Blur-to-close** — Panels close on blur, be careful with dialogs triggering premature blur
- **Preload separation** — `panel-preload.js` for panels, `preload.js` for shrine only
- **Greb panel chrome** — glass: `rgba(18,18,18,0.88)` + `backdrop-filter: blur(20px)` + light border (`grep-panel.html`)
- **Glob panel chrome** — transparent window, high-contrast black type (no glass stack on `projects-panel.html`); keep blur-to-close behavior consistent with other panels
