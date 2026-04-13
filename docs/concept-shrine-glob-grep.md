# Concept: Greb (`greb`) & Glob (`glob`)

**Status:** Aligned with shipped app (see strategic brief)  
**Canonical brief:** [`context/PROJECT-BRIEF.md`](../context/PROJECT-BRIEF.md)

---

## One-line pitch

A floating **shrine** on macOS: **Glob** finds files by **path shape**; **Greb** pulls your **next work** from markdown and opens it in the editor—same desk, two different verbs.

---

## How the names map to the product today

| | **Glob (`glob` / paths)** | **Greb (`greb` / content side)** |
| --- | --- | --- |
| **Menu label** | “glob it all up” | “greb whats next” |
| **Opens** | Glob panel: pattern + search root, live matches | Greb panel: queue from `PROJECT-TRACKER.md` |
| **Primary action** | Click row → copy **relative path**; ↗ → Terminal in that file’s folder | Click row → open **file at line** in Cursor / VS Code |
| **Engine** | `mdfind` for plain names, `find` for `*` / `?` patterns (pruned noise dirs) | Parses `## Greb value — Active` → bullets under `### Now` / `### Next` / `### Later` (fallback: lone `### Next`) |

The UI still speaks **`glob`** and **`greb`** so users never confuse “walk the tree” with “read the file.”

---

## The distinction (still the mental model)

| | **Glob** | **Greb** |
| --- | --- | --- |
| **Matches** | Paths (names, folders) | Text inside files |
| **Typical question** | “Which files live *here*, named like this?” | “Where is this string / what should I open next?” |
| **In this app** | Glob panel | Greb panel (tracker queue; not a free-text project search in the current build) |

**Mnemonic:** Glob walks the halls (paths). Greb reads the scrolls (contents). The shipped shrine encodes that split in two characters and two panels.

---

## Glob panel: Jobs To Be Done

Glob today: **glob or plain name** from a **chosen search root**; results **grouped by the top-level folder under that root**; each row shows a **truncated path prefix** plus an emphasized **path tail**; **click** copies the full **relative path**; **↗** opens **Terminal** in the hit’s directory. The jobs below assume that behavior.

### When the root holds several repos (e.g. `~/Projects`)

- **When** I search a pattern that hits the same filename or shape in more than one project, **I want to** see matches grouped by the first folder under my root with the filename tail visually clear, **so I can** choose the right repo without opening the wrong tree.
- **When** I’m onboarding or auditing how repos document themselves (e.g. every `README.md` or `AGENTS.md`), **I want to** scan hits organized per top-level folder, **so I can** compare structure across projects without losing place in a flat list.

### When the root is one large repo or monorepo

- **When** I use a broad glob (e.g. under `packages/` or `apps/`), **I want to** read a path line that keeps the “where in the tree” suffix obvious while the long middle can shrink, **so I can** tell package or area apart before I copy a path or open Terminal next to the wrong folder.
- **When** generated and source paths both match (e.g. build outputs vs `src/`), **I want to** infer the neighborhood from the visible path tail and prefix, **so I can** avoid copying or `cd`’ing into generated junk when that matters.

### When I remember a name, not a path

- **When** I know the file name (or a simple name query) but not which project or subfolder it’s in, **I want to** run a quick search from a root I trust and still get grouping + tail emphasis, **so I can** orient spatially and get a copyable relative path in one click.

### Clipboard and handoff

- **When** I’m writing a ticket, doc, or message that says “from repo root, this file,” **I want to** copy a path **relative to the root I picked**, **so I can** match how teammates run commands or open files from that same anchor.

### Terminal-first follow-up

- **When** the directory matters more than opening the file in an editor (scripts, `git`, `ls`, local tools), **I want to** jump Terminal straight into the folder that contains the hit, **so I can** act there without Finder or manual `cd` from memory.

### Narrow or non-default roots

- **When** work is scoped to one client, product, or subtree, **I want to** set the search root there and glob deeply, **so I can** keep the result set small and have grouping mean “areas inside this scope,” not “every repo on disk.”

### When Glob is the wrong hire (boundary job)

- **When** my question is semantic (“where is auth implemented?” or “what calls this?”), **I want to** use **editor / content search** or **Greb’s queue and file jumps**, **so I can** answer meaning in the codebase instead of mistaking path matching for understanding.

---

## Shrine shell (implemented)

- **Shrine window:** **200×200** when collapsed (transparent, **always on top**). **Right-click** the canvas (or **tray** right-click) opens the **custom context menu** to the right of the shrine’s **current** width (panels follow `getBounds().width`, not a fixed 208px offset).
- **Left-drag** on the canvas moves the whole shrine (pointer capture + main `move-window` nudges open panels).
- **Left tap** (no meaningful drag): expands the **same** `BrowserWindow` to about **560×420**, animates a slim **middle chrome bar** (drag strip + close **×**), and opens an **embedded** terminal (**xterm.js** in the renderer, **`node-pty`** in the main process) running **`claude`** with cwd **`~/Projects`**. Ending the session (**exit**, quitting Claude Code, or **×** / SIGTERM) disposes the PTY and **shrinks** the shrine back to 200×200. If `claude` is not on the Electron process **PATH**, spawn falls back to an interactive login shell in that directory (same cwd).
- **Glob “Terminal in folder”** remains **macOS Terminal.app** via AppleScript (`openTerminalAtPath`) — only the shrine left-tap path is embedded.
- **Context menu + Greb + Glob panels:** separate small windows, still **always on top**, positioned just right of the shrine. While you **drag the shrine**, open panels **stay visible** and **move with it** (main process nudges their position on each move). **Blur does not auto-dismiss** when focus simply lands on the shrine or back on the same panel—only after a tick, if focus is **elsewhere** (another app, etc.), so you can grab the shrine without the menu vanishing first.
- **Moving the menu itself:** the context menu window uses a **native drag region** (`-webkit-app-region: drag` on the menu chrome; **no-drag** on rows and system controls) so you can reposition it from gutters / padding while rows stay clickable.
- **After a drag:** the shrine tells main to **refocus** whichever panel was open so the next click on a menu row or list item still lands without an extra focus tap.
- **Greb** uses the dark **glass** panel; **Glob** uses the minimal transparent panel. **Login item** optional.
- Main process still exposes **projects.json** IPC for a future pinned-list jumper; the **current** Glob surface is glob search, not pin management.

---

## Success criteria (product)

- A teammate can say what Greb does vs Glob **without** reading source.
- Tracker bullets open the **correct** file and line; glob results copy **useful** paths and Terminal lands in the **right** directory.

---

## Historical note

An earlier draft of this doc described a **predict-then-reveal learning shrine**. That teaching game is **not** what ships today; the living spec for goals and scope is `context/PROJECT-BRIEF.md`.
