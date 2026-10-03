# Portfolio PDF export

The footer's **Download as PDF** button creates a Letter-size text PDF directly in the browser. No server, build step, print dialog, or separately maintained resume file is needed.

The document reads the current introduction, contact links, experience, earlier work, project cards, and `cases` in `app.js` every time it is downloaded. Edit those existing sources as usual. New `data-case` cards and new `cases` entries are discovered automatically; adding an ID to the case-navigation `order` array is not required by the export. Cards without a detailed case study still export their summary. New top-level sections also export their text.

The exporter handles wrapping, page breaks, continued-project headings, page numbers, embedded fonts, and clickable contact/project links. The full detailed portfolio can span several pages; the existing Resume link remains the separate resume.

The library and fonts load only on the first download and are hosted alongside the site, so visitors do not rely on a third-party CDN. Failed loads show a retry message and re-enable the button.

Vendored dependencies:

- jsPDF 4.2.1 (MIT), `vendor/jsPDF-LICENSE.txt`
- Noto Sans Regular and Bold (SIL Open Font License), `vendor/NotoSans-LICENSE.txt`

Development: serve the repository over HTTP (font loading needs HTTP), then click the footer button. `window.portfolioPdf.collect()` exposes the current content and `await window.portfolioPdf.create()` returns the PDF document for verification.
