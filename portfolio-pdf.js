/* A text-first document, generated from the portfolio at download time. */
(() => {
  const button = document.querySelector('#download-pdf');
  const status = document.querySelector('#pdf-status');
  const scriptBase = new URL('.', document.currentScript.src);
  const asset = path => new URL(path, scriptBase).href;
  const text = element => (element?.textContent || '').replace(/\s+/g, ' ').trim();
  let dependencies;

  function loadDependencies() {
    if (dependencies) return dependencies;
    dependencies = Promise.all([
      new Promise((resolve, reject) => {
        if (window.jspdf) return resolve();
        const script = document.createElement('script');
        const timer = setTimeout(() => { script.remove(); reject(new Error('PDF library timed out')); }, 20000);
        script.src = asset('vendor/jspdf.umd.min.js');
        script.onload = () => { clearTimeout(timer); resolve(); };
        script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('PDF library unavailable')); };
        document.head.append(script);
      }),
      ...['Regular', 'Bold'].map(async weight => {
        const response = await fetch(asset(`vendor/NotoSans-${weight}.ttf`), { signal: AbortSignal.timeout(20000) });
        if (!response.ok) throw new Error('PDF font unavailable');
        const bytes = new Uint8Array(await response.arrayBuffer());
        // Small chunks avoid exceeding JavaScript's argument limit.
        let binary = '';
        for (let i = 0; i < bytes.length; i += 8192) binary += String.fromCharCode(...bytes.subarray(i, i + 8192));
        return btoa(binary);
      })
    ]).catch(error => { dependencies = undefined; throw error; });
    return dependencies;
  }

  function collect() {
    const caseData = typeof cases === 'undefined' ? {} : cases;
    const cards = [...document.querySelectorAll('main [data-case]')];
    // Preserve the site's order, and include new case studies even before a card is added.
    const ids = [...new Set([...cards.map(card => card.dataset.case), ...Object.keys(caseData)])];
    return {
      name: text(document.querySelector('h1')),
      role: text(document.querySelector('.intro-role')),
      bio: [...document.querySelectorAll('.bio-copy p:not(.intro-role)')].map(text),
      url: asset('index.html').replace(/index\.html$/, ''),
      contacts: [...document.querySelectorAll('header nav a:not([data-resume])')].map(link => ({ label: text(link), url: link.href })),
      experience: [...document.querySelectorAll('.experience-row')].map(row => ({
        title: text(row.querySelector('h3')), role: text(row.querySelector('div p')),
        date: text(row.querySelector('.date')), body: text(row.querySelector(':scope > p'))
      })),
      earlier: [...document.querySelectorAll('.other-work h3')].map(heading => ({ title: text(heading), body: text(heading.nextElementSibling) })),
      projects: ids.map(id => {
        const card = cards.find(card => card.dataset.case === id);
        const detail = caseData[id];
        return {
          id, title: text(card?.querySelector('h3')) || detail?.title || id,
          meta: detail?.subtitle || text(card?.querySelector('.project-body > p, p')),
          summary: text(card?.querySelector('.project-summary, .small p')),
          outcome: text(card?.querySelector('.project-outcome')),
          tools: text(card?.querySelector('.project-tools')),
          lead: detail?.lead || '', sections: detail?.sections || []
        };
      }),
      // New ordinary sections are included without needing a PDF-specific copy.
      additional: [...document.querySelectorAll('main > section:not(.intro):not(#work):not(.supporting):not(.experience)')]
        .map(section => ({ title: text(section.querySelector('h2')), body: text(section) }))
    };
  }

  async function create(model = collect()) {
    const [, regular, bold] = await loadDependencies();
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter', compress: true, putOnlyUsedFonts: true });
    for (const [weight, data, style] of [['Regular', regular, 'normal'], ['Bold', bold, 'bold']]) {
      doc.addFileToVFS(`NotoSans-${weight}.ttf`, data);
      doc.addFont(`NotoSans-${weight}.ttf`, 'NotoSans', style);
    }
    doc.setProperties({ title: `${model.name} | Engineering Portfolio`, author: model.name, subject: model.role, creator: 'Portfolio PDF export' });
    doc.setLanguage('en-US');
    const margin = 46, width = 520, bottom = 736;
    let y = margin, continuation = '';
    const font = (size = 9.5, weight = 'normal', color = '#30383f') => {
      doc.setFont('NotoSans', weight); doc.setFontSize(size); doc.setTextColor(color);
    };
    const clean = value => String(value || '').replace(/[\u2010-\u2015]/g, '-');
    const lines = (value, size = 9.5, weight = 'normal', available = width) => {
      font(size, weight); return doc.splitTextToSize(clean(value), available);
    };
    function newPage() {
      doc.addPage(); y = margin;
      font(8, 'bold', '#66717a'); doc.text(model.name, margin, y);
      font(8, 'normal', '#66717a'); doc.text('ENGINEERING PORTFOLIO', 566, y, { align: 'right' });
      doc.setDrawColor('#d8dfe3'); doc.setLineWidth(.5); doc.line(margin, y + 10, 566, y + 10);
      y += 30;
      if (continuation) { font(10, 'bold'); doc.text(clean(`${continuation} / continued`), margin, y); y += 19; }
    }
    const ensure = height => { if (y + height > bottom) newPage(); };
    function paragraph(value, { size = 9.5, weight = 'normal', color = '#30383f', indent = 0, gap = 6, bullet = false, url } = {}) {
      if (!value) return;
      const wrapped = lines(value, size, weight, width - indent);
      const step = size * 1.48;
      // Keep normal paragraphs/bullets together; split very long future text safely.
      ensure(Math.min(wrapped.length * step, 110));
      for (let i = 0; i < wrapped.length; i++) {
        ensure(step);
        font(size, weight, color);
        doc.text(wrapped[i], margin + indent, y);
        if (url) doc.link(margin + indent, y - size, Math.min(doc.getTextWidth(wrapped[i]), width - indent), step, { url });
        if (bullet && i === 0) { doc.setFillColor('#66717a'); doc.circle(margin + 3, y - 3, 1.3, 'F'); }
        y += step;
      }
      y += gap;
    }
    function section(title) {
      continuation = '';
      ensure(65); y += 8;
      font(10, 'bold', '#275c65'); doc.text(clean(title.toUpperCase()), margin, y);
      doc.setDrawColor('#b9cbd0'); doc.setLineWidth(.6); doc.line(margin, y + 8, 566, y + 8); y += 27;
    }
    paragraph(model.name, { size: 29, weight: 'bold', color: '#202b31', gap: 0 });
    paragraph(model.role, { size: 12, color: '#275c65', gap: 10 });
    for (const contact of model.contacts) paragraph(contact.label, { size: 8.5, color: '#53646d', gap: 0, url: contact.url });
    paragraph(model.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), { size: 8.5, color: '#53646d', gap: 12, url: model.url });
    model.bio.forEach(value => paragraph(value, { gap: 5 }));

    if (model.experience.length || model.earlier.length) {
      section('Experience');
      for (const entry of model.experience) {
        ensure(80);
        paragraph(entry.title, { size: 11, weight: 'bold', gap: 1 });
        paragraph([entry.role, entry.date].filter(Boolean).join(' | '), { size: 8.5, color: '#66717a', gap: 4 });
        paragraph(entry.body, { gap: 10 });
      }
      for (const entry of model.earlier) {
        ensure(60);
        paragraph(entry.title, { size: 10, weight: 'bold', gap: 2 });
        paragraph(entry.body, { gap: 9 });
      }
    }
    if (model.projects.length) {
      section('Project directory');
      for (const project of model.projects) {
        paragraph(project.title, { size: 9.5, gap: 5, url: `${model.url}#case/${encodeURIComponent(project.id)}` });
      }
    }
    // Project details start on a fresh page, giving the overview room to breathe.
    if (model.projects.length) { newPage(); section('Projects'); }
    for (const project of model.projects) {
      continuation = '';
      const lead = project.lead || project.summary;
      const firstItems = project.sections[0]?.[1] || [];
      const firstHeight = firstItems.length ? Math.min(180, firstItems.reduce((height, item) => height + lines(item, 9.5, 'normal', width - 13).length * 14.06 + 3, 0)) + 27 : 0;
      const summaryHeight = project.summary && project.summary !== lead ? lines(project.summary).length * 14.06 + 5 : 0;
      ensure(Math.min(300, lines(project.title, 14, 'bold').length * 21 + lines(project.meta, 8.5).length * 13 + lines(lead).length * 14.06 + summaryHeight + firstHeight + 28));
      continuation = project.title;
      paragraph(project.title, { size: 14, weight: 'bold', color: '#202b31', gap: 1, url: `${model.url}#case/${encodeURIComponent(project.id)}` });
      paragraph(project.meta, { size: 8.5, color: '#66717a', gap: 7 });
      // Include card edits as well as details, without repeating identical copy.
      if (project.summary && project.summary !== lead) paragraph(project.summary, { color: '#53646d', gap: 5 });
      paragraph(lead, { gap: 8 });
      for (const [heading, items] of project.sections) {
        const sectionHeight = items.reduce((height, item) => height + lines(item, 9.5, 'normal', width - 13).length * 14.06 + 3, 0);
        ensure(Math.min(200, sectionHeight + 23));
        paragraph(heading, { size: 9, weight: 'bold', color: '#275c65', gap: 3 });
        items.forEach(item => paragraph(item, { indent: 13, bullet: true, gap: 3 }));
        y += 4;
      }
      paragraph(project.outcome, { size: 9, weight: 'bold', gap: 4 });
      paragraph(project.tools, { size: 8.5, color: '#66717a', gap: 4 });
      continuation = ''; y += 11;
    }
    for (const entry of model.additional) { section(entry.title || 'Additional information'); paragraph(entry.body); }
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page++) {
      doc.setPage(page); font(8, 'normal', '#66717a');
      doc.setDrawColor('#d8dfe3'); doc.line(margin, 752, 566, 752);
      doc.text(model.name, margin, 768);
      doc.text(`${page} / ${pageCount}`, 566, 768, { align: 'right' });
    }
    return doc;
  }

  button.hidden = false;
  button.addEventListener('click', async () => {
    if (button.disabled) return;
    button.disabled = true; button.setAttribute('aria-busy', 'true');
    button.textContent = 'Preparing PDF…'; status.textContent = 'Preparing your portfolio PDF.';
    try {
      const model = collect();
      const doc = await create(model);
      const filename = `${model.name.replace(/[^\p{L}\p{N}]+/gu, '_')}_Portfolio.pdf`;
      await doc.save(filename, { returnPromise: true });
      status.textContent = 'Your portfolio PDF is ready.';
    } catch (error) {
      console.error('Portfolio PDF export failed:', error);
      status.textContent = 'Could not prepare the PDF. Please try again.';
    } finally {
      button.disabled = false; button.removeAttribute('aria-busy'); button.textContent = 'Download as PDF';
    }
  });
  // Also supports automated regression checks without maintaining duplicate content.
  window.portfolioPdf = { collect, create };
})();
