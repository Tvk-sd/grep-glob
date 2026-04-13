# Nano Banana concept prompt: Glob & Greb shrine

Use with **Gemini image generation** (`gemini-3-pro-image-preview` / Nano Banana Pro). Paste the **Master prompt** into the image model; tune **Aspect ratio** and **resolution** as noted.

---

## Suggested generation settings


| Setting      | Value            | Why                                             |
| ------------ | ---------------- | ----------------------------------------------- |
| Aspect ratio | `16:9` or `21:9` | Triptych reads as one wide composition          |
| Resolution   | `2K`             | UI legibility for small labels                  |
| Style        | See prompt       | Product concept art, not a literal oil painting |


---

## Master prompt (copy from below)

```
Ultra-wide desktop app concept art, triptych "shrine" layout on a deep navy
background. Three-panel interface inspired by a medieval altarpiece but executed
as clean modern product UI — flat vectors, subtle gold accent, crimson and
sapphire secondary accents, generous whitespace, no ornate Gothic clutter.

LEFT WING — title "Structure (paths)". A compact file-tree and an 8-tile grid
of path-shaped cards; some tiles empty, some highlighted with a cool cyan glow
labeled "glob match". Small caption: "Patterns match filenames and folders".
Icons: folder, document outline, asterisk path pattern.

CENTER — largest panel, "Predict before reveal". A single focused stage: a
pattern input field, a prominent button "Lock prediction", then a secondary
"Reveal matches" state (show as subtle ghosted/disabled until ready). Bottom
predella strip: thin status bar with monospace hint text "Glob = where · Greb =
what".

RIGHT WING — title "Content (inside files)". Stacked document panels with line
numbers and highlighted text spans in warm amber; a list of matching lines
across files. Caption: "Patterns match text inside files". No religious
imagery, no human figures — abstract UI only.

Overall mood: disciplined, ritual-like spacing and framing (thick soft borders
between panels like picture frames), but readable as a real developer tool.
High contrast, WCAG-friendly text. No logos, no watermarks, no photorealistic
screens — stylized UI mockup suitable for a pitch deck.
```

---

## Shorter variant (if the model truncates)

```
Wide triptych desktop UI mockup, navy background, gold accents. Left: file tree +
grid of path tiles, label "Glob — paths". Center: large "predict then reveal"
flow with two buttons. Right: code snippets with line highlights, label "Greb —
content". Modern flat design, framed panels, no people, no religious icons,
high contrast, 16:9 concept art.
```

---

## Negative cues (optional second message or suffix)

Add if the output drifts too decorative or literal:

```
Avoid: oil painting texture, halos, saints, angels, photorealistic wood,
excessive filigree, tiny illegible text, 3D skeuomorphic chrome, stock photo
hands, brand logos, watermarks, low-resolution blur.
```

---

## Variation prompts (optional)

**A — Dark editor vibe**  
Append: `Dark IDE theme, syntax-highlight colors only as accents, monospace UI font feel.`

**B — Light parchment discipline**  
Append: `Light warm gray background, ink-navy text, wax-seal red accent only on primary button.`

**C — “Same repo, two lenses”**  
Append: `Small duplicate mini-tree visible in both wings showing the SAME project; left wing highlights paths, right wing highlights interior matches — visual analogy of intersection.`

---

## Reference image (optional)

If your pipeline supports image + text: attach your triptych reference from the project assets folder and prepend:

```
Use this ONLY as loose layout inspiration (three-part shrine, central emphasis).
Redraw as the modern UI concept described below, not as a reproduction of the
artwork.
```

Path (Cursor project asset):  
`/Users/Till/.cursor/projects/Users-Till-Projects-Greg-glop/assets/image-6ea817cc-801c-4c1a-9e67-025556a066d8.png`

---

## Link to product concept

Full interaction spec: `[concept-shrine-glob-grep.md](./concept-shrine-glob-grep.md)`