# Greg & Glop

A floating macOS desktop shrine for the bash commands `grep` and `glob`. Pixel-art characters (Greg & Glop) live on screen as an always-on-top Electron overlay — animated, draggable, and interactive.

## Quick Start

```bash
cd "/Users/Till/Projects/Greg & glop"
npm start       # launch the shrine
```

## What it does

- **Greg (grep)** — Right-click menu → panel that reads **Now / Next / Later** from `context/PROJECT-TRACKER.md` and opens the right file at the right line in **Cursor** or **VS Code**
- **Glop (glob)** — Right-click menu → panel to type a **glob** (or plain filename), pick a search root, copy relative paths, or open **Terminal** in a hit’s folder
- **Left-click** — Opens Terminal at ~/Projects
- **Draggable** — Move the shrine around your desktop
- **Always on top** — Stays visible across all applications

## Features

- Animated pixel-art characters that respond to menu hover and state
- Custom context menu (Greg / Glop rows + always-on-top + quit)
- Greg: tracker queue + editor integration
- Glop: live glob results (`mdfind` / `find` on macOS)
- Optional `projects.json` IPC in main for a future pinned-project UI (not exposed in the Glop panel today)

## Tech Stack

- **Electron 34** — Frameless transparent window, always-on-top
- **Vanilla JS + Canvas** — No framework, no bundler
- **Node.js** — Electron only (devDependency)
- **Local storage** — `projects.json` under app userData exists for future pinned projects; tracker queue lives in-repo at `context/PROJECT-TRACKER.md`

## Documentation

- `[CLAUDE.md](./CLAUDE.md)` — Technical context for AI coding sessions
- `[AGENTS.md](./AGENTS.md)` — Agent-specific instructions and conventions
- `[docs/](./docs/)` — Concept documentation and research

