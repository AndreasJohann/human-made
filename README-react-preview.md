# Human Made — Living Journey React feature branch

This is an isolated Vite/React prototype. **Do not merge without visual and content review.** The existing production HTML is preserved on `main`.

## Interaction
- Full-screen opening contains only the Human Made title and a small scroll affordance.
- Scroll pins the scene and shrinks the *whole landscape frame* to approximately a quarter-screen area; project context enters the newly visible warm-beige layout.
- Below the fold, a thin, section-anchored SVG botanical line reveals progressively with scrolling, growing four sparse leaves in the outer gutter (not over text).
- Reduced-motion visitors get a static alternative; the animation is reversible on upward scrolling.

## Temporary image
The hero currently uses a publicly hosted Indonesia illustration photograph solely for preview. Replace `HERO` in `src/App.jsx` with the project's own optimized `Meerblick` image before release; it must not be presented as the actual project site. Architectural sketches and original pictograms reference existing assets from this repository.

## Run
`npm install && npm run dev`, `npm run build`.

Contact uses a prefilling `mailto:` workflow and never falsely displays a submitted-message confirmation.
