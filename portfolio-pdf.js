/* A print-designed portfolio, composed from current project text and photography. */
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
      new Promise((resolve, reject) => {
        if (window.composePortfolioPdf) return resolve();
        const script = document.createElement('script');
        const timer = setTimeout(() => { script.remove(); reject(new Error('PDF layout timed out')); }, 20000);
        script.src = asset('portfolio-pdf-layout.js');
        script.onload = () => { clearTimeout(timer); resolve(); };
        script.onerror = () => { clearTimeout(timer); script.remove(); reject(new Error('PDF layout unavailable')); };
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
    const imageData = typeof galleries === 'undefined' ? {} : galleries;
    const cards = [...document.querySelectorAll('main [data-case]')].filter(card => !card.closest('[hidden], [aria-hidden="true"]'));
    // Published cards determine membership and order. Removed projects must not
    // reappear because their old case data or images still exist in app.js.
    const ids = [...new Set(cards.map(card => card.dataset.case))];
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
          lead: detail?.lead || '', sections: detail?.sections || [],
          images: (imageData[id] || []).map(image => ({ ...image, src: asset(image.src) }))
        };
      }),
      // New ordinary sections are included without needing a PDF-specific copy.
      additional: [...document.querySelectorAll('main > section:not(.intro):not(#work):not(.supporting):not(.experience)')]
        .map(section => ({ title: text(section.querySelector('h2')), body: text(section) }))
    };
  }

  async function create(model = collect()) {
    const [, , regular, bold] = await loadDependencies();
    const doc = new window.jspdf.jsPDF({ unit: 'pt', format: 'letter', compress: true, putOnlyUsedFonts: true });
    for (const [weight, data, style] of [['Regular', regular, 'normal'], ['Bold', bold, 'bold']]) {
      doc.addFileToVFS(`NotoSans-${weight}.ttf`, data);
      doc.addFont(`NotoSans-${weight}.ttf`, 'NotoSans', style);
    }
    doc.setProperties({ title: `${model.name} | Engineering Portfolio`, author: model.name, subject: model.role, creator: 'Portfolio PDF export' });
    doc.setLanguage('en-US');
    return window.composePortfolioPdf(doc, model);
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
