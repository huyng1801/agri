# Mobile Review Notes

Generated: 2026-07-13

## Focus of this pass

- Reduce first-fold heaviness on public mobile pages.
- Make bottom navigation feel lighter and less intrusive.
- Remove unnecessary whitespace from one-column mobile card grids.
- Keep the "back to top" affordance only on long reading pages where it helps instead of interrupting card browsing.

## What changed

- Home hero, shared public headers, and several static pages keep a denser spacing rhythm than earlier builds.
- Product listing cards were compacted and now avoid extra vertical stretch on one-column mobile.
- Cooperative listing cards no longer inherit forced equal-height stretching on mobile one-column layouts.
- News search and topic chips were tightened for better first-fold density.
- Floating bottom navigation stays lighter and can hide while scrolling.
- Mobile top-button visibility is now restricted to long reading routes such as article and policy pages.

## Current route-level observations

- `/` feels denser and more intentional than the earlier screenshots, though branded green panels are still visually bold by design.
- `/san-pham` has cleaner product-card rhythm and less dead vertical space between elements.
- `/htx` cards now collapse to content height correctly on single-column mobile.
- `/tin-tuc` header, search shell, and chips are noticeably tighter and easier to scan.
- `/tin-tuc/[slug]` keeps the top-button support for long reading.
- Static info pages benefit from the shared tighter header rhythm without losing readability.

## Evidence

- Production mobile audit rerun after deploy: 27/27 passed.
- Screenshots under `frontend/test-results/ui-audit` were regenerated against `https://htxonline.vn` after deploy.
