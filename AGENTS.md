# Agent Instructions — Greb & Glob

Instructions for AI coding agents working on this project.

## Project Understanding

You're working on a macOS desktop shrine app — two pixel-art characters (Greb & Glob) that float on screen. **Greb** opens a panel tied to **markdown tracker** + editor jumps; **Glob** opens a **glob** path finder. Users interact via right-click context menu, tray, and left-click Terminal at `~/Projects` on the shrine canvas.

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
- **Greb panel**: glass stack (`rgba(18,18,18,0.88)` + `backdrop-filter: blur(20px)`) per `grep-panel.html`
- **Glob panel**: minimal transparent chrome on `projects-panel.html` (still blur-to-close like other panels)
- **Panel positioning**: 8px right of shrine, computed from `win.getPosition()`
- **Window constraints**: Shrine stays 200×200, panels are separate windows

## Development Workflow

1. **Test frequently** — `npm start` to verify changes
2. **Check both characters** — Greb (`greb`) and Glob (`glob`) behaviors
3. **Verify panel interactions** — Right-click menu, blur-to-close, positioning
4. **Test IPC channels** — Ensure main ↔ renderer communication works

## Known Issues

See `CLAUDE.md` for current bugs and technical debt.

---

## Product clarity (metaphor-first)

Use this when product or UI intent is fuzzy so implementation does not run ahead of the user’s mental model.

### Invariants for *this* repo (Greb & Glob)

- **One hero for the characters:** Greb & Glob live on the **shrine** canvas only. **Do not** add duplicate mascot sprites inside `grep-panel.html` or `projects-panel.html` unless the user explicitly asks for an exception.
- **Shrine state is canonical:** While a panel is open, `shrine-state` must stay coherent with that tool (grep vs glob); avoid “idle” or cross-tool frames from menu races or background IPC unless `main.js` already guards it.

### Before implementing UI, layout, or cross-window state

1. **One sentence:** “The user should *feel* ___; the wrong outcome looks like ___.” If the second half is blank, ask one clarifying question before coding.
2. **Museum test:** In one glance, what is the **single focal object**? If there are two competing heroes (e.g. shrine + panel sprite), resolve which wins before shipping.
3. **Screenshot habit:** When something looks wrong, prefer **screenshot + “I expected X, I see Y”** over a long prose bug report.
4. **Spike boundary:** If trying an uncertain layout, name the **one rule** that would force a revert (e.g. “no second Glob image”).
5. **30-second grill:** Who is the hero? What must **not** change during scroll/focus/blur? What would embarrass us in a screen recording?

### First-message template (use or request from the user)

> The user should **feel** [emotion / clarity].  
> The **wrong** outcome looks like [concrete failure].  
> **Hero on screen:** [shrine | panel chrome | row content].

### Using this checklist in *other* Cursor projects

- **This repo only:** `.cursor/rules/product-clarity.mdc` is set to `alwaysApply: true` so agents see it every session alongside this file.
- **Another repo:** Copy `product-clarity.mdc` into that project’s `.cursor/rules/` (keep `alwaysApply: true` or tune `globs`), or paste the **User rules** block below into that repo’s `AGENTS.md`.
- **Every workspace (global):** Cursor **Settings → Rules → User rules** — paste the following block verbatim so all projects inherit the same habit (tweak invariants per repo in project `AGENTS.md` if needed).

```text
When product or UI intent is ambiguous, slow down before coding:
(1) Ask for or state: "User should feel ___; wrong outcome looks like ___."
(2) Name the single focal hero on screen (avoid two competing mascots or chrome vs content).
(3) For visual bugs, prefer screenshot + expected vs actual over long description.
(4) For uncertain UI spikes, name one explicit revert rule before implementing.
(5) Before shipping cross-window or animation state: who is hero; what must stay stable on scroll/focus/blur; what would fail a screen recording?
```

---

## Projects (Cursor)

- **Project rules** (this folder): live under `.cursor/rules/*.mdc`; they apply when this workspace is open. `product-clarity.mdc` uses `alwaysApply: true` here.
- **User rules** (all projects): Cursor **Settings → Rules → User rules** — paste the fenced block from **Product clarity** above; that is the supported way to apply the same habit to every workspace.
- **Optional:** A copy may exist at `~/.cursor/rules/product-clarity.mdc`. Whether Cursor loads user-level `.mdc` files depends on your Cursor version; if agents never see it, rely on **User rules** instead.
- Keep **repo-specific** invariants (e.g. shrine-only sprites) in this `AGENTS.md`; keep **generic** habits in **User rules** or re-copy `product-clarity.mdc` into each repo’s `.cursor/rules/`.