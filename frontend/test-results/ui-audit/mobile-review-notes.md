# Mobile Review Notes

Generated: 2026-07-13

## Focus of this pass

- Reduce first-fold heaviness on public mobile pages.
- Make floating bottom navigation feel lighter and less intrusive while scrolling.
- Remove unnecessary whitespace caused by single-column card grids stretching too tall.
- Tighten search, chip, and card spacing on list pages.

## Route Notes

- `/`: hero headline, paragraph, search shell, and signal cards were tightened to shorten the first fold.
- `/san-pham`: product cards were compacted; single-column mobile grid no longer stretches cards with `auto-rows-fr`.
- `/san-pham?search=tra`: filtered list keeps the denser product-card rhythm from the main catalog.
- `/htx`: HTX listing now avoids forced equal-height stretching on one-column mobile.
- `/tin-tuc`: mobile search shell and topic chips were compacted; list grid no longer stretches single-column cards.
- `/login`: shared auth shell remains stable and visually balanced on mobile.
- `/register`: shared auth shell remains stable and visually balanced on mobile.
- `/san-pham/[slug]`: product hero and pricing block remain tighter than earlier passes for better above-the-fold density.
- `/htx/[code]`: detail layout remains readable, with bottom navigation now less visually dominant while scrolling.
- `/tin-tuc/[slug]`: article route uses a live public slug in the audit so screenshots reflect production content.
- `/gioi-thieu`: static content page keeps the tighter public header rhythm.
- `/ve-chung-toi`: hero and showcase remain denser, though long branded panels still deserve occasional visual review.
- `/huong-dan-mua-hang`: static reading rhythm remains clean after shared header tightening.
- `/chinh-sach-bao-mat`: static reading rhythm remains clean after shared header tightening.
- `/chinh-sach-van-chuyen`: static reading rhythm remains clean after shared header tightening.
- `/chinh-sach-doi-tra`: static reading rhythm remains clean after shared header tightening.
- `/dieu-khoan-su-dung`: static reading rhythm remains clean after shared header tightening.
- `/gio-hang`: compact mobile cart cards still hold up after the global navigation changes.
- `/thanh-toan`: checkout summary and form spacing remain stable with less floating-action interference.
- `/tra-cuu-don-hang`: lookup page remains compact and readable.
- `/lien-he`: mobile footer approach remains cleaner because the floating elements now back off more aggressively.
- `/dat-hang-thanh-cong`: confirmation page remains compact and easier to scan.
- `/passport/[code]`: passport view remains intentionally denser and separate from the public marketplace shell.
- `/qr/[code]`: QR alias remains visually equivalent to the passport route after redirect.

## Remaining Attention Areas

- Some branded feature panels on long marketing pages are still visually tall by design, even after density tuning.
- Floating bottom navigation is lighter and can auto-hide while scrolling, but it still occupies visible space on screenshots where the capture stops mid-scroll.
- Cooperative cards feel better after removing mobile row stretching, but they should still be reviewed against future content variations with longer names.
