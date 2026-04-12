# Greg & Glop — Tracker

**Status:** In Progress
**Last updated:** 2026-04-12

---

## How Claude should update this tracker

Rules that apply in every session — follow automatically, no instruction needed:

1. **On task complete** → mark `[x]`, move item to `### Done` within the same stage block
2. **Ad-hoc tasks** → any work done mid-session that was not pre-tracked must be added to `### Done` immediately when shipped — do not leave untracked work out of the record
3. **Now is empty** → pull the top item from Next into Now
4. **Stage complete** → collapse the stage block to a one-line summary under `## Completed Stages`
5. **Done section > 8 items** → oldest items move to `CHANGELOG.md` (append entry, dated, 1–3 sentences)
6. **Update `Last updated`** at the end of every session that touches the tracker

---

## Greg value — Active

### Now

- Greg (grep panel): first **surfacing** slice — a **sweep** preset (e.g. TODO / FIXME / HACK) that returns a **grouped list** of hits (path + line/snippet), not only a match count; keep the shrine window fixed, expand behavior inside the grep panel only

### Next

- Greg: **search mode** stays — literal pattern — but wire results to the same list UI; add **copy** actions (all matching lines, unique paths)
- Greg: **click row → open file at line** (or documented editor integration)

### Later

- Greg: **digest** mode — e.g. “latest TODO” card — with an explicit, labeled recency rule (git mtime vs file mtime vs first hit)
- Greg: **multi-root sweep** across Glop-pinned projects
- Glop: **project jumper “Finder view”** — richer than a plain list: folder cards, optional last-modified or file-count metadata, icon or colour per project, maybe two columns (recent + pinned); keep glass dark aesthetic; `projects-panel.html` (feature build, after core jumper behavior stays solid)
- **Context menu** — center panel under shrine (today reads offset right): `main.js` → `createContextMenuWin()` + `context-menu.html`; then full visual pass (sizing, rows, sprite presentation, muted system row). Preserve hover→shrine reactions and row sprites (Group 6 grep / Group 8 glob)
- **Context menu (ideas)** — optional in-row sprite “preview” vs shrine-as-preview; cleaner transition; typography/padding
- **Badge** — screen position vs sprite feels off; tune `#badge` in `index.html` (`position: absolute` in `#wrapper`; consider below or above sprite)

### Done

- Reliable Terminal cwd for `open-project` (AppleScript `cd` + fallback) — 2026-04-12

---

## Completed Stages

*(archive collapsed stage summaries here)*

---

## Resume

**Prompt:** "Resume Greg & Glop. Read `CLAUDE.md` and `context/PROJECT-TRACKER.md`."

**Bottom line:** Greg should **surface patterns**, not only answer “how many matches?” Treat the product as three related modes on one engine: **search** (string in mind), **sweep** (catalog of common signals in a tree), and **digest** (one headline finding, e.g. latest TODO). Sweeps and grouped hit lists teach the model; digest compresses the list. Shrine stays 200×200; value lives in panels and actions (list, copy, open-at-line).

**Product metaphor:** **Greg (grep)** reads scrolls — search inside file contents (sprite frame Group 6). **Glop (glob)** walks the halls — paths and structure (Group 8). **Idle** Group 10; **loop** frames 5→10 on hover / activity states (`idle` / `grep` / `glob` / `searching` / `found` / `error` per `CLAUDE.md`).

**Shipped baseline:** shrine + hover loop; left-click Terminal at `~/Projects`; tray right-click menu; Greg panel = tracker queue + open in editor; Glop panel = glob + copy path + Terminal in folder; blur-to-close panels; `run-grep` / badge path still in main for a future sweep UI. See `CLAUDE.md` for IPC.

**Branches:** `main` = baseline shrine; active feature work may live on `features/v2` (or a v2 worktree). Prefer merging **to `main`** once polish items (menu centering/visuals, badge) are in good shape. File layout and IPC channels: `CLAUDE.md`.

**Quick reference:** `npm start` from repo root; stack and IPC in `CLAUDE.md`; projects persist under app userData `projects.json`.