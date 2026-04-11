# JTBD Analysis — Grep & Glob in Claude Code Desktop

## The tools

**Glob** — finds files by name/path pattern (e.g. `**/*.tsx`)
**Grep** — searches file *contents* for a string or regex pattern

---

## Jobs To Be Done

### Functional Jobs

| Job | Trigger | Outcome |
|---|---|---|
| *Find where something lives* | "I know the function name, not the file" | Locate a symbol without opening everything |
| *Understand codebase shape before touching it* | Starting a new task in an unfamiliar repo | Know which files are relevant before reading |
| *Verify something exists before referencing it* | About to recommend a file path or function | Avoid hallucinating stale paths |
| *Find all usages of X before changing X* | Refactor, rename, or deprecate | Safe, complete change surface |
| *Narrow scope before a deep read* | File is large; only one section matters | Skip boilerplate, go straight to the relevant block |

### Emotional Jobs

- *Feel in control* — not guessing at file locations
- *Feel efficient* — not loading entire files to find one line
- *Feel safe* — confirming structure before making changes

### Social/Context Jobs

- PM reviewing code: "I need to find the relevant logic without getting lost"
- Dev onboarding: "I need to understand where things are before I touch anything"

---

## The core insight

Glob and Grep are **orientation tools, not execution tools.** Their job is to reduce the cost of the next action — a targeted Read, a scoped Edit, a confident recommendation.

Used well: Glob first (what files exist?) → Grep next (where is the thing I need?) → Read only the relevant lines.
