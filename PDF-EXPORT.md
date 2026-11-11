# Portfolio PDF

The footer’s **Download as PDF** link downloads `Faris_Babsail_Portfolio.pdf`, a deliberately composed eight-page portfolio. It works without JavaScript. The Resume link remains a separate document.

This edition includes FactoryOS, combat robotics, sound tracking, MusicPod, MarketplaceOS, Cognate, Tidebound, experience, and additional engineering work. Text is selectable, fonts are embedded, and project/contact links are clickable.

The PDF is an editorial snapshot, not an automatic export. Website copy changes do not change the download. Revise `tools/build_portfolio.py`, run it with Python (ReportLab and Pillow required; Georgia fonts currently use macOS paths), then render and visually inspect every page before committing the new PDF. Noto Sans is supplied in `vendor/`.

The old `portfolio-pdf.js`, `portfolio-pdf-layout.js`, and dynamic-export tests are retained as legacy source but are no longer loaded or used by the site.
