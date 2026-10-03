# Portfolio PDF export

The footer's **Download as PDF** button creates a Letter-size illustrated portfolio directly in the browser. It has a photographic cover, visual contents with internal navigation, project pages, design-development pages for CAD/drawings, and an experience section. Text remains selectable; images and contact links are clickable. No server, build step, print dialog, or separately maintained PDF is needed.

The document reads the current introduction, contact links, experience, earlier work, published project cards, `cases`, and `galleries` in `app.js` every time it is downloaded. Edit those existing sources as usual. A project's `data-case` card determines whether it belongs in the PDF. Removing or hiding that card also removes the project, even if its old case data and images remain. Unpublished case data is excluded. Cards without a detailed case study still export their summary. New top-level sections also export their text.

The layout is measured from the actual content, rather than having a fixed page count or fixed slots for seven projects. Longer text flows to continuation pages. Columns balance by section where space permits. Extra images get additional image pages; projects without images use a text layout. Contents pages and page references are rebuilt each time. Short card summaries appear in the contents; long summaries also appear in full in the study. The existing Resume link remains the separate resume.

The library, layout code, fonts, and project images load on download and are hosted alongside the site, so visitors do not rely on a third-party CDN. Images are embedded at print-friendly resolution with JPEG compression to keep the download compact. Failed loads show a retry message and re-enable the button.

Vendored dependencies:

- jsPDF 4.2.1 (MIT), `vendor/jsPDF-LICENSE.txt`
- Noto Sans Regular and Bold (SIL Open Font License), `vendor/NotoSans-LICENSE.txt`

Development: serve the repository over HTTP (font loading needs HTTP), then click the footer button. `window.portfolioPdf.collect()` exposes the current content and `await window.portfolioPdf.create()` returns the PDF document for verification.

Browser regression check: install Playwright locally, install its Chromium browser, then run `node tests/pdf-export.cjs`. An existing Chrome executable can be supplied through `CHROME_PATH`. The check covers current content, additions, removals with stale data, draft exclusion, long biography/project/experience text, expanded galleries, an empty project list, mobile layout, existing controls, and failed-load retry. Generated check artifacts are stored in `.test-artifacts/` for visual inspection.
