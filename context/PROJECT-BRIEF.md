# Greg & Glop — project brief

## What it is

Greg & Glop is a macOS desktop companion: a tiny always-on-top **shrine** (two pixel characters) that opens **glass panels** beside it. **Greg** is the *text side*—today that means pulling your **markdown tracker queue** and jumping straight into the editor. **Glop** is the *paths side*—a live **glob** search over a folder you pick, then copy paths or peel open Terminal where a file lives. It is not a course, not a web app, and not a single unified search box that hides the difference between “where files sit” and “what files say.”

## The problem

Developers already live in Terminal, the editor, and half-finished notes. The **glob vs grep** distinction still costs time when people grab the wrong tool under pressure. Separately, the **next three things** you meant to do often live in a markdown file—easy to forget, annoying to open. Native UIs for either job are either heavy (full IDE) or scattered (shell history, Finder, ad hoc aliases). Nothing sits quietly on screen reminding you which muscle to flex.

## What we believe

> If we keep **structure** and **content** visibly split—Glop for paths, Greg for the words that matter—and wire each to **one decisive action** (open here, copy this, grep the queue), the habit sticks faster than another explainer diagram.

## Goals

- **Glop:** Find files by path pattern from a chosen root in a few keystrokes, with obvious copy and “open Terminal here” exits.
- **Greg:** Surface the repo’s **Now / Next / Later** queue from `context/PROJECT-TRACKER.md` and open the right file at the right line in Cursor or VS Code.
- **Shrine:** Stay small, draggable, and ignorable until invoked—menu from right-click, `~/Projects` Terminal from left-click on the canvas, tray menu as a second entry.

## Scope

**In:** Electron main process + separate transparent panel windows; IPC as documented in `CLAUDE.md`; macOS-first behavior (AppleScript Terminal `cd`, Spotlight `mdfind` for plain names, `find` for wildcard globs); tracker parsing under `## Greg value — Active` with `### Now` / `### Next` / `### Later`; blur-to-close panels; optional launch at login.

**Out:** Backend, accounts, cloud sync, teaching “predict then reveal” challenges (that was an earlier concept), cross-platform parity beyond pragmatic fallbacks, and a pinned-project **UI** (persistence hooks in main remain for later; the current glob panel does not manage the list).

## Who it’s for

The person who keeps a **markdown task queue** next to the code, jumps between several repos under `~/Projects`, and would rather **nudge Terminal and the editor** from a mascot-sized window than dig through tabs. They already use grep and glob; they want the **distinction honored in the product shape**, not erased.

## Milestones

- **Shipped baseline (now):** Shrine + context menu + Greg tracker panel + Glop glob panel + Terminal/editor bridges.
- **Next:** Tighten panel layout and badge behavior; verify every open path on real machines.
- **Later:** Revisit pinned projects or richer “jumper” surfaces if they earn their complexity.

## Success criteria

- Someone new reads this brief and the repo and knows **which row is which** without opening the code.
- From the Greg panel, a **tracker bullet** opens the intended file in the editor in one click.
- From the Glop panel, a **glob** resolves quickly, copies a usable relative path, and Terminal lands in the folder that contains the hit.
