# Plan

## 1. Round (circular) logo
- In `src/components/brand-mark.tsx`, render the logo inside a fixed square wrapper with `rounded-full overflow-hidden`, using `object-cover` so any uploaded image crops to a perfect circle (28px mobile / 32px desktop, matching current header height).
- Same circular treatment everywhere `BrandMark` is used: desktop header, mobile header, mobile drawer, footer, admin sidebar.
- The admin Settings → Branding preview also shows the logo as a circle so what admin sees matches the site.
- Favicon keeps following the logo; it will use a circular-crop Cloudinary transform so the tab icon matches too.

## 2. Search that works 100%
Current search only matches product name, short description, category **slug** and SKU, and there is no live feedback — you type, submit, and land on a results page.

Improvements:
- **Better matching**: also match the category *display name*, size and colour names, and normalise the query (trim, collapse spaces, case-insensitive, multi-word — every word must match somewhere). So "black tshirt", "T-Shirt", "polo blue" all return results.
- **Live suggestions in the header**: as you type (debounced), a dropdown shows up to 6 matching products with thumbnail, name and price; click goes straight to the product. Enter goes to the full results page. Escape / outside click closes it.
- **Search available on all widths**: the header search input currently appears only on large desktop; mobile/tablet keeps the search icon which opens `/search`, and the `/search` page gets the same live behaviour so results update as you type (URL stays in sync so results are shareable).
- **Proper states**: loading skeleton, "no results" with a suggestion to browse the shop, and error + retry — reusing the existing state components.
- Clear (×) button inside the input when there is text.

## Notes
- No database or Supabase query changes; search stays client-side over the already-fetched active product list.
- No changes to cart, checkout, orders, Telegram notifications, Cloudinary upload logic, or page structure.
- Visual system untouched: 2px radius elsewhere, existing type scale, no new colours (the circle is the only rounding exception, alongside the category cards).

## Technical detail
- Extend the matcher in `fetchProducts` (`src/data/api.ts`) to tokenised multi-field matching, including category name via the categories map.
- New `SearchSuggestions` piece inside `src/components/site-header.tsx` powered by `useQuery(["search", term])` with a ~200ms debounce.
- `src/routes/search.tsx` switches to debounced-as-you-type with `navigate({ replace: true })` to keep the URL in sync without polluting history.
