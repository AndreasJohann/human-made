# Human Made — Living Journey (React interaction specification)

This document describes the design contract for the **implemented feature branch** `feat/living-journey-react-preview`. The implementation is in `src/App.jsx` (hero + narrative composition), `src/BotanicalThread.jsx` (responsive layout-sensitive botanical route) and `src/styles.css` (reserved gutters and illustration styles). It is **not** a production release.

## 1. Protect the full-screen hero
- On entry show the project landscape full-viewport and only the large **HUMAN MADE** wordmark plus a small scroll instruction.
- While scrolling, pin the scene and shrink the landscape significantly into the left side of a beige page, revealing the project statement beside it.
- Preserve the earlier React Hero geometry, timing and image; the botanical work must not replace or regress its zoom/shrink effect.

## 2. Introduce the living line at the hero
- A short sprout appears at the *lower edge of the now-small landscape* late in the hero's scroll sequence. Its leaf grows after the stem.
- The narrative's main line picks up at the left edge of the first content chapter, so the handoff appears as one visual storyline.
- Never put a large plant illustration over the hero or explanatory text.

## 3. Layout-aware alternating growth (not an image overlay)
- Render **one** continuous SVG path spanning the narrative sections.
- Measure the actual bounding boxes and effective vertical padding of: `#idea`, `#foundations`, `#project`, `#indonesia`, `#road`, `#involved` and `#people`.
- On desktop, route the plant through reserved *left*, *right*, *left*, *right*, *left*, *right*, *left* outside gutters.
- Use organic, modest S-curves within a chapter, and switch sides **only across the blank vertical padding between adjacent chapters**. Do not cross text, cards or photographs.
- On narrow screens, avoid page-wide crossings altogether: use a gently winding line in a reserved narrow left gutter. Content must remain readable.
- Recalculate on resize, font load, and image load; changes in text length and EN/DE localization should not break the geometry.

## 4. Scroll actually draws the line
- Determine the route's progress from its real scroll position.
- Draw the existing path up to the height reached by the scrolling viewport, including its full horizontal distance. Use a path-length binary search to avoid a pause or jump at left/right transitions.
- Reverse the drawing naturally on upward scroll. No fixed-position botanical overlay or time-only animation.

## 5. Sparse hand-drawn leaves
- Place a few sprigs on different chapters, close to the route's measured local x position.
- Draw each twig, leaf outline and inner vein sequentially using SVG dash-offset animation coupled to the scrolling tip.
- Keep the line simple and delicate but visible: slightly darker forest green, ~3 px for the main route; significantly thinner twigs and veins.
- No dense foliage and no overlap with content.

## 6. Bloom at Lea & Jessi
- End the route in the final `#people` section, leaving room below the biography content.
- Progressively draw a small flower: short stem, six simple petal outlines, delicate inner strokes, and the flower centre last.
- Finish unfolding before the section disappears below the viewport; honour reduced-motion preferences.

## Review checklist
- Desktop: Hero retains the earlier strong, scroll-tied zoom and shows the first sprout as it nears completion.
- Desktop: The vine alternates in the reserved gutters around actual chapter bounds and crosses exclusively in whitespace.
- Both languages: All text and images remain unobscured.
- Mobile: No page-wide crossings, no horizontal overflow, legible single-column reading.
- Scroll downward/upward: Continuous drawing, sprigs and flower follow direction.
- Reduced motion: Static readable narrative, fully drawn botanical motif, no forced zoom animation.
- Five Get Involved choices and their editable prefilled contact message remain working.

**Deployment:** A Vercel *feature-branch preview*, not a merge to `main`. Review before release.
