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
- Use pronounced, irregular curves and small organic offshoots within a chapter; reserve extra visual whitespace between sections and switch sides **only there**, using smooth two-axis botanical waves. **All adjoining spline segments share the same tangent slope**, removing kinks at sampled points. Do not cross text, cards or photographs.
- On narrow screens, avoid page-wide crossings altogether: use a gently winding line in a reserved narrow left gutter. Content must remain readable.
- Recalculate on resize, font load, and image load; changes in text length and EN/DE localization should not break the geometry.

## 4. Scroll actually draws the line
- Calculate the drawing tip from the browser viewport and the actual narrative bounding box on each scroll frame, **without rerendering React**.
- Draw the existing path up to the height reached by the scrolling viewport, including its full horizontal distance. Use a path-length binary search to avoid a pause or jump at left/right transitions.
- Reverse the drawing naturally on upward scroll. Limit the drawing speed to approximately **1,040 SVG path-length pixels per second**, add gentle scroll-following damping (approximately **340 ms**) and use a tip around **53% of the viewport height** so the plant grows visibly *with* the reader rather than racing ahead. Branches and the flower follow the actual rendered main tip, not the raw scroll target. No fixed-position botanical overlay or time-only animation.

## 5. Recognizable hand-drawn leaves
- Place repeated but deliberately staggered pairs of narrow leaves along each chapter and transition; scale their density down on mobile. Position motifs close to the measured curve, rather than the page edge.
- Draw each twig, leaf outline and inner vein sequentially using SVG dash-offset animation coupled to the scrolling tip.
- Keep the line fine and organic: dark forest green, approximately **1.925 px** for the main desktop route (1.6 px on mobile), with all twig, leaf, vein and petal outlines similarly halved. The transition areas have slightly more whitespace to accommodate rounder growth. The design follows the user's annotated curve as a qualitative reference, not an exact tracing.
- Use extra leaves without filling the page with solid foliage or overlapping the content.

## 6. Bloom at Lea & Jessi
- End the route in the final `#people` section, leaving room below the biography content.
- Bring the final branch into the **centre of the reserved whitespace beneath** Lea & Jessi and progressively draw a **substantially larger** eight-petal flower: stem, leaf, petal outlines, delicate inner strokes, and flower centre last.
- Finish unfolding before the section disappears below the viewport; honour reduced-motion preferences.

## Review checklist
- Desktop: Hero retains the earlier strong, scroll-tied zoom and shows the first sprout as it nears completion.
- Desktop: The vine alternates in the reserved gutters around actual chapter bounds and crosses exclusively in whitespace.
- Both languages: All text and images remain unobscured.
- Mobile: No page-wide crossings, no horizontal overflow, legible single-column reading.
- Scroll downward/upward, repeatedly and slowly: continuous frame-accurate growth and reversal of the main path, all leaf groups and the flower; no gaps or freezes on the large side-switching arcs.
- Browser layout: verify the line stays in outer gutters around real content blocks and crosses only inside the added empty inter-section bands.
- End of page: the full-sized central flower finishes opening before scroll reaches the footer.
- Reduced motion: Static readable narrative, fully drawn botanical motif, no forced zoom animation.
- Five Get Involved choices and their editable prefilled contact message remain working.

**Deployment:** A Vercel *feature-branch preview*, not a merge to `main`. Review before release.
