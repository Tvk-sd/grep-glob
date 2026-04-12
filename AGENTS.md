# Agent Instructions — Greg & Glop

Instructions for AI coding agents working on this project.

## Project Understanding

You're working on a macOS desktop shrine app — two pixel-art characters (Greg & Glop) that float on screen. **Greg** opens a panel tied to **markdown tracker** + editor jumps; **Glop** opens a **glob** path finder. Users interact via right-click context menu, tray, and left-click Terminal at `~/Projects` on the shrine canvas.

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
- Use descriptive channel names: `move-window`, `run-glob`, `get-tracker-next-items`, `open-project`
- Main → Renderer: Push state updates (`shrine-state`, `grep-result`)
- Renderer → Main: Request actions (`open-terminal`, `close-panel`)

### UI Consistency
- **Greg panel**: glass stack (`rgba(18,18,18,0.88)` + `backdrop-filter: blur(20px)`) per `grep-panel.html`
- **Glop panel**: minimal transparent chrome on `projects-panel.html` (still blur-to-close like other panels)
- **Panel positioning**: 8px right of shrine, computed from `win.getPosition()`
- **Window constraints**: Shrine stays 200×200, panels are separate windows

## Development Workflow

1. **Test frequently** — `npm start` to verify changes
2. **Check both characters** — Greg (grep) and Glop (glob) behaviors
3. **Verify panel interactions** — Right-click menu, blur-to-close, positioning
4. **Test IPC channels** — Ensure main ↔ renderer communication works

## Known Issues

See `CLAUDE.md` for current bugs and technical debt.