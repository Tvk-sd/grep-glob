# Greg & Glop

A floating macOS desktop shrine for the bash commands `grep` and `glob`. Pixel-art characters (Greg & Glop) live on screen as an always-on-top Electron overlay — animated, draggable, and interactive.

## Quick Start

```bash
cd "/Users/Till/Projects/Greg & glop"
npm start       # launch the shrine
```

## What it does

- **Greg (grep)** — Right-click → Grep panel for pattern searching
- **Glop (glob)** — Right-click → Projects panel for directory jumping  
- **Left-click** — Opens Terminal at ~/Projects
- **Draggable** — Move the shrine around your desktop
- **Always on top** — Stays visible across all applications

## Features

- Animated pixel-art characters that respond to interactions
- Custom context menu with glassmorphic styling
- Grep search with result badges
- Project directory management and quick Terminal access
- Persistent project list stored locally

## Tech Stack

- **Electron 34** — Frameless transparent window, always-on-top
- **Vanilla JS + Canvas** — No framework, no bundler
- **Node.js** — Electron only (devDependency)
- **Local storage** — Projects persist to `~/Library/Application Support/greg-and-glop/projects.json`

## Documentation

- `[CLAUDE.md](./CLAUDE.md)` — Technical context for AI coding sessions
- `[AGENTS.md](./AGENTS.md)` — Agent-specific instructions and conventions
- `[docs/](./docs/)` — Concept documentation and research

