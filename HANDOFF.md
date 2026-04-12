# Greg & Glop — Handoff (v2)

**Date:** 2026-04-12
**Branch:** `features/v2` (worktree at `~/Projects/Greg & glop-v2/`)
**Baseline:** `main` branch at `~/Projects/Greg & glop/` — original shrine, untouched

---

## What this is

A floating macOS desktop shrine for the bash commands `grep` and `glob`. Pixel-art characters (Greg & Glop) live on screen, always-on-top, animated, and now interactive — surfacing a command menu, a grep launcher, and a project jumper.

**The core metaphor:**
- **Greg (grep)** = reads scrolls. Searches inside file contents. Frame: Group 6 (compact single bug).
- **Glop (glob)** = walks the halls. Navigates paths and structure. Frame: Group 8 (two bugs splitting wide).
- **Idle** = Group 10 (fully spread, at rest).
- **Loop** = frames 5→10, triggered on hover.

---

## Current state (features/v2)

### What works ✅

| Feature | Notes |
|---|---|
| Shrine renders, hover animates | Loop plays on mouseenter, snaps to Group 10 on leave |
| Left click → Open Terminal | Opens `~/Projects` in Terminal. Shrine pulses on click. |
| Right-click → Custom menu | Opens glassmorphic panel with Greg + Glop sprite icons |
| Menu hover → shrine reacts | Hovering grep row = Group 6, hovering glob row = Group 8 |
| Menu: Always on Top toggle | Works. Shows active state. |
| Menu: Quit | Works. |
| Grep launcher | Pattern input, directory picker, runs grep, badge shows match count, command copied to clipboard |
| Grep badge | Shows match count (e.g. `12 matches`). Fades after 8s. |
| Shrine state reactions | idle → Group 10, grep → Group 6, glob → Group 8, searching → loop, found → Group 6, error → Group 5 |

### What needs fixing 🔧

**1. Custom menu — design needs full rework**
- Current design is functional but not visually right — layout, spacing, and proportions don't feel intentional
- Needs to be **centered** (currently appears offset to the right of shrine)
- Full redesign needed: bring in the user's visual language — revisit sizing, row layout, sprite presentation, and muted system row styling
- Keep: hover color-coding (Greg/Glop row dims correctly, shrine reacts correctly — don't break this)
- Keep: the sprite icons in each row (Group 6 for grep, Group 8 for glob)
- File: `context-menu.html` + position logic in `main.js` → `createContextMenuWin()`

**2. Grep badge — position is off**
- Badge renders but its screen position feels wrong relative to the sprite
- Review: `#badge` in `index.html` is `position: absolute; bottom: 4px; right: 4px` inside `#wrapper`
- Likely needs repositioning — consider placing it below the sprite or floating it above
- File: `index.html` → `#badge` CSS

**3. Project jumper — does not open terminal at selected project**
- Clicking a project row does not open Terminal at that directory
- IPC path: `projects-panel.html` → `panelAPI.openProject(path)` → `ipcMain.on('open-project')` → `spawn('open', ['-a', 'Terminal', dirPath])`
- Debug: check if `openProject` IPC is firing, and whether the path passed is correct
- File: `projects-panel.html`, `main.js` → `open-project` handler

---

## Planned features 🚧

### Project jumper redesign — "Finder view"
The current project jumper is a basic list. The user wants this to feel more like a **mini Finder** — a richer navigation surface for jumping between projects. Ideas to explore:
- Visual folder cards instead of plain text rows
- Show last-modified date or file count as metadata
- Folder icon or colour coding per project
- Possibly a two-column layout (recent projects + pinned)
- Keep the glassmorphic dark aesthetic
- File to redesign: `projects-panel.html`
- This is a **new feature build**, not a bug fix

### Context menu — visual redesign
After fixing the positioning/centering issue, the menu needs a visual pass:
- Revisit the sprite size and presentation in each row
- Consider showing the sprite frame in a small "preview window" that updates as you hover (instead of updating the main shrine behind it)
- Or keep the shrine as the preview — but make the transition cleaner
- Typography, padding, and system row need refinement

---

## File map

| File | Role |
|---|---|
| `main.js` | Electron main — window setup, all IPC handlers, panel factories, projects persistence |
| `preload.js` | Shrine renderer bridge — moveWindow, openTerminal, openContextMenu, onShrineState, onGrepResult |
| `panel-preload.js` | Panel renderer bridge — all menu/grep/projects IPC |
| `index.html` | Shrine renderer — canvas animation, badge, click-vs-drag, context menu trigger |
| `context-menu.html` | Custom right-click menu — Greg/Glop rows + system row |
| `grep-panel.html` | Grep launcher — pattern input, directory picker, status |
| `projects-panel.html` | Project jumper — list, add, remove, open |
| `assets/` | Sprite frames (Group 5–10.png), tray-icon.png |

---

## IPC map

| Channel | Direction | Purpose |
|---|---|---|
| `move-window` | renderer → main | Drag window to new position |
| `open-terminal` | renderer → main | Open Terminal at ~/Projects |
| `open-context-menu` | renderer → main | Show custom right-click menu |
| `shrine-state` | main → shrine | Push state: idle/grep/glob/searching/found/error |
| `grep-result` | main → shrine | Push grep result for badge |
| `menu-hover` | panel → main | Relay hover state to shrine |
| `menu-select` | panel → main | Menu item clicked |
| `is-always-on-top` | panel → main | Read current always-on-top state |
| `get-default-dir` | panel → main | Get ~/Projects path |
| `pick-directory` | panel → main | Open folder picker dialog |
| `run-grep` | panel → main | Execute grep, returns { count, error, cmd } |
| `grep-done` | panel → main | Panel signals result back to shrine |
| `close-panel` | panel → main | Panel asks to close itself |
| `get-projects` | panel → main | Load projects.json |
| `add-project` | panel → main | Add project, returns updated list |
| `remove-project` | panel → main | Remove by id, returns updated list |
| `open-project` | panel → main | Open Terminal at project path |

---

## To resume

1. `cd ~/Projects/Greg\ \&\ glop-v2 && npm start`
2. Fix `open-project` IPC bug first (projects panel → terminal) — lowest risk, high impact
3. Fix badge position in `index.html`
4. Then redesign `context-menu.html` — get positioning centered, then visual pass
5. Project jumper Finder redesign is a separate feature — start fresh once bugs are fixed

---

## Branch structure

```
main              ← baseline shrine (working, minimal)
features/v2       ← current build (this folder)
```

Merge `features/v2` → `main` only after the three bug fixes are resolved.
