# Agripassport Public Design System

## Purpose

Agripassport is the public layer for agricultural product data, producer profiles,
market discovery and QR traceability. It should feel precise, calm, credible and
Vietnamese, with data and trust taking priority over decoration.

The public experience is separate from the internal HTXONLINE operations product
and from the Hộ chiếu nông nghiệp QR passport layer.

## Brand Architecture

| Platform | Role | Primary treatment |
| --- | --- | --- |
| HTXONLINE | Internal cooperative operations | Deep navy / indigo |
| AGRIPASSPORT | Public products, producer data and market discovery | Teal / cyan |
| HỘ CHIẾU NÔNG NGHIỆP | QR traceability and passport records | Agricultural green |

Do not use a platform name as a substitute for another platform in public copy.
Do not invent metrics, certifications, prices or verification claims.

## Source Of Truth

The exact implementation source for ecosystem colors is:

- `frontend/src/app/globals.css` for semantic tokens and platform scopes.
- `frontend/tailwind.config.ts` for legacy utility aliases.
- `frontend/src/components/public-ecosystem-showcase.tsx` for ecosystem card treatments.

Shared public components must consume semantic tokens instead of adding new
hardcoded brand colors. Platform-specific colors are scoped by
`[data-public-site]`.

## Tokens

### Surfaces and content

- `--surface-elevated`: primary cards and content surfaces.
- `--surface-muted`: quiet panels, filters and empty states.
- `--text-primary`: headings and important data.
- `--text-secondary`: descriptions and supporting copy.
- `--border`: default separators and card boundaries.
- `--border-strong`: selected controls and high-confidence boundaries.

### Brand and status

- `--brand-primary`: primary action and active navigation.
- `--brand-primary-hover`: hover and pressed state.
- `--brand-primary-strong`: labels and high-emphasis accents.
- `--brand-primary-subtle`: quiet brand background.
- `--brand-primary-ring`: keyboard focus ring.
- `--success`, `--warning`, `--danger`: semantic status only.

### Geometry

- Small controls use a subtle radius.
- Inputs and buttons use a medium radius.
- Cards use one consistent medium/large radius tier.
- Large brand surfaces may use the largest radius tier.
- Keep no more than three radius tiers in one component family.

### Elevation and motion

Use one restrained shadow hierarchy. Borders should carry most of the structure.
Transitions are normally 150–250ms and limited to opacity, transform, border,
background or shadow. All motion must respect `prefers-reduced-motion`.

## Typography

The public application uses Nunito Sans with Vietnamese and Latin subsets.

- Display: strong but compact, never oversized for its own sake.
- H1: one clear page statement, usually 2–4 lines on mobile.
- H2: section purpose and hierarchy, not decorative slogans.
- Body: comfortable reading measure and line-height around 1.7–1.9.
- Labels: short, sentence case where possible; uppercase tracking is reserved for
  small eyebrows and metadata.

Avoid excessive negative tracking, all-caps paragraphs and headings that split
Vietnamese words awkwardly.

## Layout

- Public container: centered, fluid and capped at the shared max width.
- Desktop content should expose real products, producers or articles early.
- Mobile uses one-column reading flow with intentional horizontal filter scrolling.
- No section may create horizontal overflow or rely on clipped text for meaning.
- Footer and fixed mobile navigation must reserve safe-area space.

## Component Rules

### Header and search

The Agripassport primary menu is `Về Agripassport`, `Sản phẩm`, `Đối tác`,
`Tin tức`, `Liên hệ`, `Tuyển dụng`. Login is a utility action, not a competing
primary navigation item. Search has a visible label, stable input geometry,
clear focus state and a useful empty state.

### Product cards

Use this order: image, category/QR state, product title, producer, location,
price/unit and one clear detail action. Images use a stable aspect ratio and
explicit fallback. Card bodies stretch so titles and CTAs share a baseline.

### Cooperative cards

Present the HTX as a producer profile, not as a seller account. Show name,
location, public product count only when real, public status and a clear profile
action. Never imply verification that is not present in the record.

### News cards and articles

News cards use consistent cover geometry, category, date, title and excerpt.
Article pages use a readable column, strong heading hierarchy, accessible tables,
responsive images with captions, related content and breadcrumbs.

### Ecosystem cards

Cards share geometry and spacing, while keeping the exact navy, teal/cyan and
green platform treatments. The current platform is announced as “Bạn đang ở
đây”; external platform actions are explicit and use “Mở nền tảng”.

### Forms and contact

Every field has a visible or programmatic label. Errors are adjacent to the
relevant control, success is announced clearly, and controls are at least 44px
high. Agripassport contact topics are data/platform support topics, not COD
checkout language.

### Map

Map frames have a stable aspect ratio, descriptive iframe title, lazy loading and
a visible external fallback. Overlay copy must never cover the address, marker or
primary map action.

## Responsive and Accessibility Rules

Validate at `360`, `375`, `390`, `430`, `768`, `1024`, `1280`, `1440` and `1920`.

- No horizontal page or header overflow.
- Visible focus for keyboard users.
- WCAG AA-oriented contrast for text and controls.
- Semantic landmarks and one H1 per page.
- Alt text on meaningful images; decorative images are marked decorative.
- Keyboard-safe menus, drawers and dialogs.
- No color-only status communication.
- Reduced motion support.

## Public Data Rules

Only records that are published, active and `publicVerified` are exposed through
the public product, HTX and news surfaces. Missing or unverified data is omitted
or shown as a neutral empty state. It is not replaced with fake records, random
images or fabricated counts.

## Quality Budget

Per viewport and visual region, keep at most one dominant brand treatment, one
strong gradient surface, two CTA levels, three radius tiers and one strong shadow
hierarchy. After the main refinement pass, remove anything that does not improve
clarity, hierarchy, trust, usability or brand identity.

## Verification

The definition of done includes typecheck, unit tests, production build, browser
console review, responsive screenshot review, accessibility checks, link and
identity scans, a second visual refinement pass and a restraint/subtraction pass.
