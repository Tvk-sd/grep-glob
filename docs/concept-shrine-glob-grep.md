# Concept: Shrine UI for Glob vs. Grep

**Status:** Concept  
**Intent:** A small interactive “shrine” that teaches the difference between **glob** (structural, paths) and **grep** (textual, content) by making learners **predict** matches before they see them.

---

## One-line pitch

Two wings of one shrine: **left = where files live**, **right = what files say**—with a **predict-then-reveal** ritual in the center so the mental model sticks faster than watching a passive demo.

---

## Learning objective

After a short session, the user should reliably answer:

- “Does this pattern filter **paths** or **file contents**?”
- “If I change the folder layout but not the text inside files, which tool’s results change?”
- “Which tool do I reach for when I only know a string, vs. when I only know a shape of paths?”

---

## The distinction (canonical)


|                           | **Glob**                                     | **Grep**                                           |
| ------------------------- | -------------------------------------------- | -------------------------------------------------- |
| **Matches**               | Paths (filenames, directory structure)       | Bytes/lines inside files                           |
| **Thinks in**             | Structure: `*`*, `*`, `?`, `{a,b}`           | Text: literals, regex (per tool)                   |
| **Typical question**      | “Which files are named or placed like this?” | “Which files *contain* this text?”                 |
| **If you rename a file**  | Glob results can change                      | Grep results unchanged (unless path was the query) |
| **If you edit file body** | Glob results unchanged                       | Grep results can change                            |


The shrine should **never** blend these into one undifferentiated “search”—the frame and copy always say **structural** vs **textual**.

---

## Shrine layout (triptych mapping)

### ^

---

## Copy hooks (examples)

- Left wing header: **“Structure — paths & names”**
- Right wing header: **“Content — inside the files”**
- Center CTA: **“Lock in your prediction”** → **“Reveal matches”**
- Predella: **“Glob = where · Grep = what”**

---

## Success criteria

- Users who complete five alternating glob/grep challenges score **significantly better** on a post-quiz than a cohort that watched an animated demo with the same examples (measure: classify scenarios + pick correct tool).
- Qualitative: users articulate **intersection** (“narrow files, then search inside”) without prompting.

---

## Open questions

- Target shell/tooling: **bash glob** vs **git grep** vs **ripgrep** — same concept, different flags; does the shrine teach **one** canonical tool first?
- Regex scope: defer regex on grep until after literal-string mastery?
- Desktop shell: Electron/Tauri vs web-first — out of scope for this concept doc.

---

## Appendix: mnemonic

**Glob walks the halls (paths). Grep reads the scrolls (contents).**  
The shrine makes you **guess which doors** and **guess which scrolls** before it unlocks them.