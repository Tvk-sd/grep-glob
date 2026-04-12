# Agent Instructions — Greg & Glop

Instructions for AI coding agents working on this project.

## Project Understanding

You're working on a macOS desktop shrine app — two pixel-art characters (Greg & Glop) that float on screen representing `grep` and `glob` bash commands. Users interact via right-click context menu and left-click Terminal opening.

## Coding Conventions

### Electron Architecture
- **Main process** (`main.js`) — Window management, IPC handlers, panel factories
- **Shrine renderer** (`index.html` + `preload.js`) — Canvas animation, drag, clicks
- **Panel renderers** (various `.html` + `panel-preload.js`) — UI panels

### File Organization
```
main.js                 # Electron main process
preload.js              # Shrine renderer bridge
panel-preload.js        # Panel renderer bridge (shared)
index.html              # Main shrine interface
*-panel.html            # Individual panel interfaces
assets/                 # Sprites and icons
docs/                   # Documentation
```

### IPC Patterns
- Use descriptive channel names: `move-window`, `run-grep`, `get-projects`
- Main → Renderer: Push state updates (`shrine-state`, `grep-result`)
- Renderer → Main: Request actions (`open-terminal`, `close-panel`)

### UI Consistency
- **Glassmorphic panels**: `rgba(18,18,18,0.88)` background with `backdrop-filter: blur(20px)`
- **Panel positioning**: 8px right of shrine, computed from `win.getPosition()`
- **Window constraints**: Shrine stays 200×200, panels are separate windows

## Development Workflow

1. **Test frequently** — `npm start` to verify changes
2. **Check both characters** — Greg (grep) and Glop (glob) behaviors
3. **Verify panel interactions** — Right-click menu, blur-to-close, positioning
4. **Test IPC channels** — Ensure main ↔ renderer communication works

## Known Issues

See `CLAUDE.md` for current bugs and technical debt.