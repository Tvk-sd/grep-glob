# Greg & Glop — Project Handoff

**Date:** 2026-04-12
**Status:** Active — mascot working, shrine UI not yet built

---

## What this is

An Electron desktop app with two parts:

1. **Mascot** — Greg & Glop, floating pixel-art characters that live on your screen. Animated on hover, draggable, always-on-top, auto-starts on login.
2. **Shrine** — A planned interactive learning tool teaching the difference between Glob (paths/structure) and Grep (contents/text) using a predict-then-reveal mechanic.

The mascot is built and working. The shrine exists only as a concept doc.

---

## The core idea

**Glob walks the halls (paths). Grep reads the scrolls (contents).**

| | Glob | Grep |
|---|---|---|
| Matches | File paths and names | Text inside files |
| Changes when you rename a file | Yes | No |
| Changes when you edit file body | No | Yes |
| Question it answers | "Which files are shaped/named like this?" | "Which files contain this string?" |

The shrine teaches this via a **triptych layout** — left wing (structure/paths), center (predict → reveal), right wing (content/lines). Think altarpiece, executed as clean product UI.

---

## What's built

### Mascot (root folder — working)

| File | Role |
|---|---|
| `main.js` | Electron shell — transparent frameless window, tray icon, IPC, login auto-start |
| `index.html` | Sprite renderer — 6-frame animation, hover to animate, drag to move |
| `preload.js` | Context bridge — exposes `electronAPI.moveWindow` to renderer |
| `assets/` | Sprite frames (Group 5–10.png) + tray-icon.png |

**How it works:** Canvas renders pixel-art sprites. On mouseenter → plays frames 5→10 in loop. On mouseleave → snaps to idle frame (Group 10). Dragging calls `ipcMain` to reposition the window.

Right-click menu (tray + canvas): Open Terminal, Always on Top toggle, Quit.

### Experimental build (`Neuer Ordner/` — unknown state)

Contains `ptyManager.js` and `stateDetector.js` — suggests a terminal embed was attempted. Not merged into root. **Review before continuing.**

---

## What's not built

- Shrine UI (predict-then-reveal challenges)
- Connection between mascot and shrine (does clicking Greg open the shrine?)
- Any routing between the two modes
- Git is not confirmed set up in root

---

## Key docs

| Doc | Location | What it contains |
|---|---|---|
| Shrine concept | `docs/concept-shrine-glob-grep.md` | Full interaction spec, layout, copy hooks, open questions |
| Image gen prompt | `docs/nano-banana-prompt-shrine-glob-grep.md` | Gemini prompt for triptych UI concept art (16:9, navy + gold) |
| JTBD analysis | `jtbd-grep-glob.md` | Jobs-to-be-done for Glob and Grep as orientation tools |

---

## Open decisions

- [ ] Does the shrine live **inside** the mascot window, or as a **separate panel** launched on click?
- [ ] Which tool to teach first — bash glob, ripgrep, or git grep?
- [ ] Defer regex on grep until after literal-string mastery?
- [ ] What to do with `Neuer Ordner/` — merge, discard, or branch?
- [ ] Set up git in root if not already done

---

## To resume

1. Run `npm start` in the root folder — mascot should launch
2. Read `docs/concept-shrine-glob-grep.md` for the shrine spec
3. Check `Neuer Ordner/` — understand what ptyManager and stateDetector do before building further
4. Decide on the shrine integration approach before writing any new code
