# Changelog

## 2026-04-13 — Greb & Glob naming

Mascot and product copy now use **Greb** and **Glob** (aligned with **`greb`** and **`glob`**). Window title, tray tooltip, README / agent docs, and context menu row **greb whats next**; internal IPC and `shrine-state` values remain `grep` / `glob` for compatibility.

## 2026-04-12 — Session 2: Glob grouping, shrine lock, panels, menu copy

### Summary
Glob results are easier to scan (grouped paths + tail emphasis), both panels stay compact without duplicate sprites (the shrine carries Greb/Glob identity), the shrine no longer flickers to idle while a panel is open, and the context menu lines were refreshed.

### Glob (`projects-panel.html`)
- Group matches by the **first folder** under the search root; files directly in the root appear under **Here**.
- Path subtitle: **left-truncated prefix** + **bold tail** (last one or two segments); full relative path on row `title` and unchanged click-to-copy behavior.
- **HTML escaping** on rendered paths and errors.

### Shrine state (`main.js`, `context-menu.html`)
- **Idle race:** context menu `closed` no longer overwrites `glob`/`grep` — deferred check so opening Greb/Glob wins over menu teardown.
- **Hover flicker:** row `mouseleave` no longer sends idle; system row uses **`hover('idle')`** so the shrine only idles when leaving command rows for the utility row.
- While **Glob** is open, ignore stray `shrine-state` updates except **`glob`** (and idle when the panel closes); **`focus`** re-applies **`glob`**.
- While **Greb** is open, allow only **`grep`** / sweep outcomes / idle on close; blocks e.g. **`glob`** from stealing the frame. **`focus`** re-applies **`grep`**.

### Panel chrome
- **Greb** and **Glob** panels: **300×360**, single column — **removed** side-column **Group 6 / Group 8** images (sprites live on the shrine only).

### Context menu copy (`context-menu.html`)
- Greb row: **grep whats next** (menu label; see 2026-04-13 for **greb** copy)
- Glob row: **glob it all up**

### Docs
- **`docs/concept-shrine-glob-grep.md`** — added **Jobs To Be Done** section for the Glob panel (grouped paths + git-scoped ideas from product discussion).

---

## 2026-04-12 — Session 1: Foundation + Feature Build

### Summary
First full build session. Took the project from a standalone HTML animation to a working Electron desktop app with three interactive features.

---

### What was built

**Electron scaffold**
- Initialized npm project with Electron 34
- `main.js` — transparent 200×200 frameless window, always-on-top, skip taskbar, auto-start on login
- `preload.js` — context-isolated IPC bridge
- System tray icon with tooltip

**Shrine animation**
- Ported existing 6-frame pixel-art Canvas animation into Electron
- Hover → animation loops (Group 5→10), mouse leave → snaps to Group 10 (idle)
- JS drag-to-move: click-vs-drag discriminator (5px threshold), `ipcMain` moves window via `win.setPosition()`
- Left click (no drag) → opens Terminal at `~/Projects`, shrine pulses

**Custom right-click menu** (`context-menu.html`)
- Replaced native OS context menu with custom HTML panel (required for hover events to reach shrine)
- Greb row (`grep`) with Group 6 sprite icon — hover dims other row, shrine switches to Group 6
- Glob row (`glob`) with Group 8 sprite icon — hover dims other row, shrine switches to Group 8
- Muted system row: Always on Top toggle (reads live state) + Quit
- Closes on blur (click outside)

**Grep launcher** (`grep-panel.html`)
- Pattern input with focus on open
- Directory picker (defaults to `~/Projects` via IPC, folder picker on click)
- Enter → runs `grep -r` via `execFile`, copies full command to clipboard
- Panel closes immediately after search
- Result badge on shrine (`12 matches` / `0 matches` / `!` for error), fades after 8s
- Shrine animates during search (loop), holds on Group 6 when results found

**Project jumper** (`projects-panel.html`)
- Pinned project list with name + truncated path
- `+` button → folder picker → adds project (name = folder basename)
- Trash icon on row hover → removes immediately, no confirmation
- Projects persist to `~/Library/Application Support/greg-and-glop/projects.json`
- Closes on blur

**Shrine state machine**
- States: `idle` / `grep` / `glob` / `searching` / `found` / `error`
- Each state maps to a specific frame or behaviour
- Main process pushes state via `win.webContents.send('shrine-state', state)`

**IPC architecture**
- `preload.js` — shrine-only channels
- `panel-preload.js` — shared bridge for all panel windows
- All panels use `panelConfig()` factory, positioned 8px right of shrine

---

### Git history
```
3406b02  baseline: working shrine with hover animation and drag
94b8a29  feat: custom context menu, grep launcher, project jumper, shrine state reactions
00fd275  docs: update handoff with v2 test results, bugs, and redesign notes
5ae7d8c  chore: remove junk files, old Neuer Ordner build, and demo folder
57a1ff5  docs: add CLAUDE.md project instructions
```

---

### Tested and confirmed working ✅
- Shrine renders, hover animates
- Left click opens Terminal at ~/Projects
- Right-click menu opens, hover switches shrine frame (Group 6/8)
- Menu hover color-coding (non-hovered row dims)
- Always on Top toggle reflects live state
- Quit works
- Grep panel opens, runs search, badge shows count, command copied to clipboard
- Shrine reacts to search state
- Project list renders, add/remove works, persists across restarts

---

### Known bugs 🔧
1. **Context menu** — design and centering need a full rework (functional, not visually intentional)
2. **Badge position** — sits awkwardly on the sprite, needs repositioning
3. **Project jumper** — clicking a project row does not open Terminal at the correct path (IPC fires, spawn may be failing silently)

---

### Planned next 🚧
- Fix the three bugs above before any new features
- Context menu visual redesign (after centering is fixed)
- Project jumper "Finder view" redesign — folder cards, metadata, richer navigation
