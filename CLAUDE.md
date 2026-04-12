# Greg & Glop — Claude Code Project Instructions

## What this project is
A floating macOS desktop shrine for the bash commands `grep` and `glob`. Pixel-art characters (Greg & Glop) live on screen as an always-on-top Electron overlay — animated, draggable, and interactive. Right-click opens a command menu. Left-click opens Terminal.

## How to run
```bash
cd "/Users/Till/Projects/Greg & glop"
npm start       # launch the shrine
```

## Stack
- **Electron 34** — frameless transparent window, always-on-top, IPC bridge
- **Vanilla JS + Canvas** — no framework, no bundler
- **node_modules**: electron only (devDependency)
- No backend, no database — projects list persists to `~/Library/Application Support/greg-and-glop/projects.json`

## Project structure
```
main.js               — Electron main process: window setup, IPC handlers, panel factories
preload.js            — Shrine renderer bridge (contextBridge)
panel-preload.js      — Panel renderer bridge (contextBridge for all panels)
index.html            — Shrine: canvas animation, badge, drag, click, context menu trigger
context-menu.html     — Custom right-click menu (Greg/Glop rows + system row)
grep-panel.html       — Grep launcher: pattern input, directory picker, result badge
projects-panel.html   — Project jumper: pinned dirs, add/remove, open in Terminal
assets/               — Sprite PNGs (Group 5–10.png) + tray-icon.png
docs/                 — Concept docs and research
```

## Sprite frame map
| File | Index | Meaning |
|---|---|---|
| Group 5.png | 0 | Loop start |
| Group 6.png | 1 | **Greg (grep)** — compact single bug |
| Group 7.png | 2 | Loop mid |
| Group 8.png | 3 | **Glop (glob)** — two bugs splitting wide |
| Group 9.png | 4 | Loop end |
| Group 10.png | 5 | **Idle** — fully spread, at rest |

## Shrine states
| State | Frame | When |
|---|---|---|
| `idle` | Group 10 | Default |
| `grep` | Group 6 | Hovering grep row / grep panel open |
| `glob` | Group 8 | Hovering glob row / projects panel open |
| `searching` | Loop | Grep running |
| `found` | Group 6 | Grep returned results |
| `error` | Group 5 | Grep error |

## IPC channels
| Channel | Direction | Purpose |
|---|---|---|
| `move-window` | renderer → main | Drag reposition |
| `open-terminal` | renderer → main | Open Terminal at ~/Projects |
| `open-context-menu` | renderer → main | Show custom menu |
| `shrine-state` | main → shrine | Push animation state |
| `grep-result` | main → shrine | Push result for badge |
| `menu-hover` | panel → main | Relay hover to shrine |
| `menu-select` | panel → main | Menu item clicked |
| `is-always-on-top` | panel → main | Read window state |
| `get-default-dir` | panel → main | ~/Projects path |
| `pick-directory` | panel → main | Folder picker dialog |
| `run-grep` | panel → main | Execute grep → { count, error, cmd } |
| `grep-done` | panel → main | Result back to shrine |
| `close-panel` | panel → main | Self-close |
| `get-projects` | panel → main | Load projects.json |
| `add-project` | panel → main | Add + save project |
| `remove-project` | panel → main | Remove by id + save |
| `open-project` | panel → main | Open Terminal at project path |

## Known bugs (see HANDOFF.md for detail)
1. **Context menu** — design/centering needs rework
2. **Badge position** — sits awkwardly on the sprite
3. **Project jumper** — open-project IPC fires but Terminal doesn't open at correct path

## Rules
- Never expand the main shrine window (200×200) — panels are always separate BrowserWindows
- Panels appear 8px to the right of the shrine, position computed from `win.getPosition()`
- Panels close on blur (clicking outside) — be careful with dialog boxes triggering blur prematurely
- Always use `panel-preload.js` for panel renderers, `preload.js` for the shrine only
- Glassmorphic style for all panels: `rgba(18,18,18,0.88)` + `backdrop-filter: blur(20px)` + `border: 1px solid rgba(255,255,255,0.1)` + `border-radius: 12px`
