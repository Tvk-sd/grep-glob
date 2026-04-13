# Reflection — Greb & Glob (spring 2026)

Short retrospective after the Glob grouping / shrine lock / panel chrome / menu copy pass. Written for future us and anyone picking up the repo.

---

## What went well

**Spatial grouping without new infrastructure**  
Grouping Glob hits by the first folder under the search root and emphasizing path tails gave most of the “where does this live?” win in pure renderer logic—no new IPC, no git dependency. Cheap to ship, easy to reason about.

**One source of truth for the characters**  
Putting Greb and Glob **only on the shrine** (no duplicate sprites in the panels) tightened the product metaphor: the panels are tools; the shrine is the cast. It also avoided a second layout system to keep icons visible while scrolling.

**Shrine state became intentional, not accidental**  
The flicker and wrong-frame issues traced to small, fixable causes: context menu `closed` racing `setShrineState('glob'|'grep')`, and `menu-hover(null)` idling the shrine between row hover and click. Deferred idle + explicit “idle on system row” + guards while a panel is open made behavior match user expectation with modest main-process logic.

**Copy landed**  
“grep whats next” / “glob it all up” matched the playful tone without changing wiring (`data-cmd` unchanged). Good reminder that low-risk string changes can disproportionately improve feel. (Later renamed to **greb whats next** / **Glob** branding.)

**JTBD in the concept doc**  
Writing jobs for Glob (and the boundary with greb / content search) turned vague “orientation in the tree” into testable language for the next iteration.

---

## What went badly or took a detour

**Misread intent once**  
We added a Glob sprite column to match an assumed Greb-panel pattern; the user wanted the **opposite**—shrine stays on glob, **no** second icon. That was a product-listening miss: “static shrine” was clear in hindsight, “add an asset” was our default muscle.

**CSS fought the path-tail design**  
`text-overflow: ellipsis` on the whole `.rel` line clipped the **end**, so the “bold tail” never read until we split prefix vs tail with flex. Lesson: when the design is “keep the suffix visible,” the truncation model has to be explicit in layout, not only in string building.

**Group labels looked like generic chrome**  
`text-transform: uppercase` turned `Projects` into **PROJECTS**, which read like a section header, not a folder name. Small typography choices carry a lot of semantic weight in a tiny UI.

**Doc drift**  
Older changelog sections still describe earlier experiments (e.g. grep-as-shell sweep, project jumper list). Useful as history, confusing as “what ships today.” Worth a periodic “current behavior” sweep or a single `CURRENT.md` pointer.

---

## Carry forward

- Prefer **shrine** for character / state identity; keep **panels** thin and text-first unless there is a strong reason to duplicate art.
- When menu + panel open in one gesture, **order every `setShrineState`** as carefully as navigation stack pushes.
- For path UI: **layout truncation** and **string truncation** are two jobs—specify both.
- After a feature burst, **align CHANGELOG / reflection / brief** so newcomers are not reading three different products.
