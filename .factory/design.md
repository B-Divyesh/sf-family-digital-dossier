# Visual thesis: the sealed constellation

## Direction

Generative geometry turns a usually anxious, invisible task into a calm map. Nested polygons behave like document envelopes; fine routes connect them into a family constellation. The forms are orderly but not clinical, suggesting that scattered records can become findable without ever exposing their secrets. The product is intentionally a single light treatment: a physical archival folio is the metaphor, and painting every surface preserves that legibility in browsers and installed mode.

## Palette

- `folio` `#F5F0E6`: warm paper background, explicit on every screen.
- `sheet` `#FFFCF5`: working surface and printable material.
- `ink` `#17233B`: primary text; archival navy rather than generic black.
- `muted` `#596273`: secondary text (5.6:1 on folio).
- `signal` `#B43A2F`: vermilion primary action and urgent review marker (5.1:1 with white).
- `signal-dark` `#84271F`: hover/pressed state.
- `teal` `#19675E`: confirmed/safe state (5.4:1 with white).
- `ochre` `#8A5A08`: warning text and due-date geometry.
- `rule` `#C9C2B3`: structural borders; never the only indicator of state.

## Typography

The product uses self-hosted system stacks to avoid network leakage and remain tiny. Headings use `Georgia, Cambria, Times New Roman, serif` for the authority of an estate folio; controls and body text use `Inter, ui-sans-serif, system-ui, sans-serif` for unambiguous utility. Body is never below 16px. The scale is 16, 18, 22, 30, and clamp(38–64). Numbers and dates use tabular figures.

## Spacing and shape

An 8px rhythm (`4, 8, 12, 16, 24, 32, 48, 72`) keeps long forms predictable. Corners are clipped with small polygon cuts rather than universally rounded cards. Independent records are cards; related setup fields are grouped by proximity and rules. Controls are at least 44px high. Desktop uses a 280px left rail once unlocked; at 390px it becomes a compact top summary and all two-column controls stack.

## Interaction grammar

- A vermilion seal marks the one current primary action.
- Fine geometric routes fill as the dossier becomes more complete.
- Record editors open as anchored modal sheets and return focus to their origin.
- Saving produces a quiet state label and updates the review constellation immediately.
- Risk is always named as text; color is supplementary.

## Motion

Interface changes use 180–240ms opacity and transform transitions: sheets rise by 8px from their trigger context, and progress strokes reveal once. Nothing loops. Under `prefers-reduced-motion: reduce`, transforms and drawing animations are removed and all state changes become instant opacity changes.

## Original asset plan and provenance

- Hero illustration: an abstract isometric paper archive made from interlocking geometric envelopes, connecting lines, and one sealed vermilion circle. It clarifies “a map, not a password vault.” Generated specifically for this product with the factory Azure image deployment, then reviewed and optimized to WebP/AVIF. No people, brands, text, logos, or interface screenshots.
- App icons: hand-authored SVG geometry using the same envelope and seal motif, rasterized locally to required PWA sizes. Original MIT-licensed repository artwork.

### Hero prompt sheet

Use case: stylized-concept. Asset type: landing page hero illustration. Primary request: an abstract isometric family archive made of seven interlocking folded-paper envelopes and document tabs connected by thin precise routes, with one small vermilion wax-seal circle representing trusted handoff. Scene: quiet warm paper field. Style: tactile editorial paper sculpture plus exact generative geometry, slight screen-print grain, sophisticated and reassuring. Composition: landscape, visual mass centered and right-biased with breathing space, no interface mockup. Light: soft top-left studio light, calm morning mood. Palette: warm ivory, archival navy, muted teal, ochre, vermilion accent. Materials: thick cotton paper, embossed lines, crisp folded edges. Avoid: people, hands, keys, padlocks, screens, gradients, photoreal office clutter, symbols resembling brands, text, letters, numbers, watermark, logos.

Generated asset disclosure: generated imagery is original to this product. Generator: factory Azure image deployment (`factory-image`); date: 2026-08-28; exact prompt above. Source PNG and prompt sidecar are retained under `assets/src/`; production files are optimized derivatives under `public/assets/`.
