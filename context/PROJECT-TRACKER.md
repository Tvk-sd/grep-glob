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
- Polish backlog: context menu redesign/centering, badge position on shrine (`CLAUDE.md` known issues)

### Done

- Reliable Terminal cwd for `open-project` (AppleScript `cd` + fallback) — 2026-04-12

---

## Completed Stages

*(archive collapsed stage summaries here)*

---

## Resume

**Prompt:** "Resume Greg & Glop. Read `CLAUDE.md` and `context/PROJECT-TRACKER.md`."

**Bottom line:** Greg should **surface patterns**, not only answer “how many matches?” Treat the product as three related modes on one engine: **search** (string in mind), **sweep** (catalog of common signals in a tree), and **digest** (one headline finding, e.g. latest TODO). Sweeps and grouped hit lists teach the model; digest compresses the list. Shrine stays 200×200; value lives in panels and actions (list, copy, open-at-line).

**Quick reference:** `npm start` from repo root; stack and IPC in `CLAUDE.md`; projects persist under app userData `projects.json`.