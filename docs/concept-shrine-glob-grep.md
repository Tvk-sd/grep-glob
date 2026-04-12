# Concept: Greg (grep) & Glop (glob)

**Status:** Aligned with shipped app (see strategic brief)  
**Canonical brief:** [`context/PROJECT-BRIEF.md`](../context/PROJECT-BRIEF.md)

---

## One-line pitch

A floating **shrine** on macOS: **Glop** finds files by **path shape**; **Greg** pulls your **next work** from markdown and opens it in the editor—same desk, two different verbs.

---

## How the names map to the product today

| | **Glop (glob / paths)** | **Greg (grep / content side)** |
| --- | --- | --- |
| **Menu label** | “glob - jump to project” | “grep - next from tracker” |
| **Opens** | Glob panel: pattern + search root, live matches | Greg panel: queue from `PROJECT-TRACKER.md` |
| **Primary action** | Click row → copy **relative path**; ↗ → Terminal in that file’s folder | Click row → open **file at line** in Cursor / VS Code |
| **Engine** | `mdfind` for plain names, `find` for `*` / `?` patterns (pruned noise dirs) | Parses `## Greg value — Active` → bullets under `### Now` / `### Next` / `### Later` (fallback: lone `### Next`) |

The UI still speaks **glob** and **grep** so users never confuse “walk the tree” with “read the file.”

---

## The distinction (still the mental model)

| | **Glob** | **Grep** |
| --- | --- | --- |
| **Matches** | Paths (names, folders) | Text inside files |
| **Typical question** | “Which files live *here*, named like this?” | “Where is this string / what should I open next?” |
| **In this app** | Glop panel | Greg panel (tracker queue; not a free-text project search in the current build) |

**Mnemonic:** Glob walks the halls (paths). Grep reads the scrolls (contents). The shipped shrine encodes that split in two characters and two panels.

---

## Glop panel: Jobs To Be Done

Glop today: **glob or plain name** from a **chosen search root**; results **grouped by the top-level folder under that root**; each row shows a **truncated path prefix** plus an emphasized **path tail**; **click** copies the full **relative path**; **↗** opens **Terminal** in the hit’s directory. The jobs below assume that behavior.

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

### When Glop is the wrong hire (boundary job)

- **When** my question is semantic (“where is auth implemented?” or “what calls this?”), **I want to** use **editor / content search** or **Greg’s queue and file jumps**, **so I can** answer meaning in the codebase instead of mistaking path matching for understanding.

---

## Shrine shell (implemented)

- **200×200** transparent window, **always on top**, draggable canvas; **right-click** → custom menu; **left-click** (no drag) → Terminal at `~/Projects`.
- **Separate panels** to the right (blur closes them); Greg uses the dark **glass** panel; Glop uses a lighter inline panel.
- **Tray** right-click opens the same menu; **login item** optional.
- Main process still exposes **projects.json** IPC for a future pinned-list jumper; the **current** Glop surface is glob search, not pin management.

---

## Success criteria (product)

- A teammate can say what Greg does vs Glop **without** reading source.
- Tracker bullets open the **correct** file and line; glob results copy **useful** paths and Terminal lands in the **right** directory.

---

## Historical note

An earlier draft of this doc described a **predict-then-reveal learning shrine**. That teaching game is **not** what ships today; the living spec for goals and scope is `context/PROJECT-BRIEF.md`.
