/* Print composition. The content and images are supplied by the live portfolio. */
window.composePortfolioPdf = async function composePortfolioPdf(doc, model) {
  const W = 612, H = 792, M = 40, CW = W - M * 2, BOTTOM = 739;
  const ink = '#212121', muted = '#696763', paper = '#f2f0ec';
  const clean = value => String(value || '').replace(/[\u2010-\u2015]/g, '-');
  const font = (size, weight = 'normal', color = ink, display = false) => {
    doc.setFont(display ? 'helvetica' : 'NotoSans', weight);
    doc.setFontSize(size); doc.setTextColor(color);
  };
  function wrap(value, width, size, weight = 'normal', display = false) {
    font(size, weight, ink, display);
    return doc.splitTextToSize(clean(value), width);
  }
  function copy(value, x, y, width, options = {}) {
    const { size = 9.2, weight = 'normal', color = ink, leading = size * 1.4, display = false, url } = options;
    const lines = wrap(value, width, size, weight, display);
    font(size, weight, color, display);
    lines.forEach((line, i) => {
      doc.text(line, x, y + i * leading);
      if (url) doc.link(x, y + i * leading - size, Math.min(doc.getTextWidth(line), width), leading, { url });
    });
    return y + lines.length * leading;
  }
  const projectUrl = p => `${model.url}#case/${encodeURIComponent(p.id)}`;
  let pageLabel = '', firstPage = true;
  const pageLabels = [];
  function page(label = '') {
    if (!firstPage) doc.addPage();
    firstPage = false; pageLabel = label; pageLabels.push(label);
    font(7.5, 'normal', muted);
    doc.text(model.name, M, 28);
    doc.text(label, W - M, 28, { align: 'right' });
  }
  function title(value, meta, lead, size = 31) {
    let y = copy(value, M, 77, CW, { size, leading: size * 1.05, display: true, weight: 'bold' });
    if (meta) y = copy(meta, M, y + 7, CW, { size: 8, color: muted }) + 11;
    if (lead) y = copy(lead, M, y + 7, CW - 22, { size: 11.2, leading: 15.5 }) + 9;
    return y;
  }

  // Decode and resample once. The PDF embeds actual photographs and screenshots,
  // while all text remains native, selectable text.
  const imageCache = new Map();
  async function loadImage(src) {
    if (!imageCache.has(src)) imageCache.set(src, (async () => {
      const response = await fetch(src, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`Project image unavailable: ${src}`);
      const bitmap = await createImageBitmap(await response.blob());
      const scale = Math.min(1, 1800 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(bitmap.width * scale); canvas.height = Math.round(bitmap.height * scale);
      const context = canvas.getContext('2d');
      context.fillStyle = '#fff'; context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height); bitmap.close();
      return { data: canvas.toDataURL('image/jpeg', .9), width: canvas.width, height: canvas.height };
    })());
    return imageCache.get(src);
  }
  await Promise.all(model.projects.flatMap(p => (p.images || []).map(i => loadImage(i.src))));
  async function picture(image, x, y, width, height, { background = paper, crop = false } = {}) {
    const loaded = await loadImage(image.src);
    crop = crop && loaded.width / loaded.height > 1.1;
    doc.setFillColor(background); doc.rect(x, y, width, height, 'F');
    const ratio = crop ? Math.max(width / loaded.width, height / loaded.height) : Math.min(width / loaded.width, height / loaded.height);
    const iw = loaded.width * ratio, ih = loaded.height * ratio;
    doc.saveGraphicsState();
    doc.rect(x, y, width, height, null); doc.clip(); doc.discardPath();
    doc.addImage(loaded.data, 'JPEG', x + (width - iw) / 2, y + (height - ih) / 2, iw, ih, image.src, 'FAST');
    doc.restoreGraphicsState();
    doc.link(x, y, width, height, { url: image.src });
  }
  function caption(value, x, y, width) {
    return copy(value, x, y, width, { size: 7.1, leading: 10, color: muted });
  }

  // Flow paragraphs through columns. Ordinary sections stay intact where possible;
  // unusually long future additions receive a properly headed continuation page.
  function flow(sections, { y, columns = 2, x = M, width = CW, bottom = BOTTOM, continuation = pageLabel } = {}) {
    const gutter = 25;
    let columnWidth = (width - (columns - 1) * gutter) / columns;
    let column = 0, cursor = y, top = y;
    const step = 12.5;
    function advance() {
      column++;
      if (column >= columns) {
        page(continuation);
        top = title(continuation, 'Continued', '', 24) + 18;
        if (columns === 1 && width < 300) { columns = 2; x = M; width = CW; columnWidth = (CW - gutter) / 2; }
        column = 0;
      }
      cursor = top;
    }
    function ensure(height) { if (cursor + height > bottom) advance(); }
    for (const [heading, items] of sections) {
      const paragraphLines = items.filter(Boolean).map(item => wrap(item, columnWidth, 9.2));
      const headingLines = heading ? wrap(heading, columnWidth, 9, 'bold') : [];
      const sectionHeight = headingLines.length * 12 + (heading ? 7 : 0) + paragraphLines.reduce((sum, l) => sum + l.length * step + 5, 0) + 13;
      // If an entire section is modest, keep it in one column.
      ensure(Math.min(sectionHeight, Math.min(150, bottom - top)));
      const xx = () => x + column * (columnWidth + gutter);
      if (heading) {
        cursor = copy(heading, xx(), cursor, columnWidth, { size: 9, weight: 'bold', leading: 12 }) + 7;
      }
      for (const lines of paragraphLines) {
        ensure(Math.min(lines.length * step + 5, 85, Math.max(step * 2, bottom - top)));
        for (const line of lines) {
          ensure(step);
          font(9.2); doc.text(line, xx(), cursor); cursor += step;
        }
        cursor += 5;
      }
      cursor += 13;
    }
    return { y: cursor, column };
  }

  function balancedGroups(sections) {
    const heights = sections.map(([heading, items]) => (heading ? wrap(heading, 253.5, 9, 'bold').length * 12 + 7 : 0)
      + items.filter(Boolean).reduce((sum, item) => sum + wrap(item, 253.5, 9.2).length * 12.5 + 5, 0) + 13);
    let split = sections.length, height = heights.reduce((a, b) => a + b, 0);
    for (let i = 1; i < sections.length; i++) {
      const candidate = Math.max(heights.slice(0, i).reduce((a, b) => a + b, 0), heights.slice(i).reduce((a, b) => a + b, 0));
      if (candidate < height) { height = candidate; split = i; }
    }
    return { split, height };
  }
  function balancedFlow(sections, y, continuation) {
    const { split, height } = balancedGroups(sections);
    if (height < BOTTOM - y) {
      flow(sections.slice(0, split), { y, columns: 1, width: 253.5, continuation });
      flow(sections.slice(split), { y, columns: 1, x: 318.5, width: 253.5, continuation });
    } else flow(sections, { y, continuation });
  }

  const illustrated = model.projects.filter(p => p.images?.length);
  const unillustrated = model.projects.filter(p => !p.images?.length);
  const projectPages = new Map(), indexLinks = [];
  // Cover: one confident image, a large name, and only the useful introduction.
  page('Engineering portfolio');
  let coverY = copy(model.name, M, 102, CW, { size: 47, leading: 49, weight: 'bold', display: true });
  coverY = copy(model.role, M, coverY + 10, CW, { size: 12.5 }) + 27;
  let coverProject = illustrated[0], coverImage = coverProject?.images[0];
  for (const candidate of illustrated) {
    const landscape = candidate.images.find(image => {
      // Aspect ratios are checked below after the cached image resolves.
      return !/drawing|\bcad\b/i.test(`${image.title} ${image.src}`);
    });
    if (landscape && (await loadImage(landscape.src)).width / (await loadImage(landscape.src)).height > 1.1) {
      coverProject = candidate; coverImage = landscape; break;
    }
  }
  if (coverImage) {
    await picture(coverImage, M, coverY, CW, 335, { crop: true });
    caption(`${coverProject.title} / ${coverImage.caption || coverImage.title || ''}`, M, coverY + 349, CW);
    coverY += 383;
  }
  const introLines = wrap(model.bio.join(' '), 330, 10.2);
  const introRoom = Math.max(1, Math.floor((677 - coverY) / 15));
  const introEnd = copy(introLines.slice(0, introRoom).join('\n'), M, coverY, 330, { size: 10.2, leading: 15 });
  copy('Selected work', 418, coverY, 154, { size: 9, weight: 'bold' });
  copy(`${model.projects.length} projects\nMechanical design\nRobotics & software`, 418, coverY + 23, 154, { size: 9, leading: 15, color: muted });
  let contactY = Math.max(introEnd + 25, 700);
  for (const contact of model.contacts) {
    const label = contact.url.includes('linkedin.com') ? contact.url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') : contact.label;
    contactY = copy(label, M, contactY, CW, { size: 8, leading: 12, url: contact.url });
  }
  copy(model.url.replace(/^https?:\/\//, '').replace(/\/$/, ''), M, contactY, CW, { size: 8, url: model.url });
  if (introLines.length > introRoom) {
    page('About');
    const yy = title('About', '', '', 31) + 30;
    flow([['', [introLines.slice(introRoom).join(' ')]]], { y: yy, continuation: 'About' });
  }

  if (model.projects.length > 3) {
    page('Contents');
    let yy = title('Selected work', '', '', 32) + 23;
    const perPage = Math.ceil(model.projects.length / Math.ceil(model.projects.length / 8));
    const rowMinimum = Math.min(95, Math.floor((BOTTOM - yy) / perPage));
    for (const [index, project] of model.projects.entries()) {
      const titleHeight = wrap(project.title, 390, 13, 'bold', true).length * 16;
      const summaryHeight = Math.min(2, wrap(project.summary || project.lead, 390, 8.5).length) * 12;
      const rowHeight = Math.max(rowMinimum, titleHeight + summaryHeight + 23);
      if ((index > 0 && index % perPage === 0) || yy + rowHeight > BOTTOM) { page('Contents'); yy = title('Selected work', 'Continued', '', 28) + 23; }
      if (project.images?.length) await picture(project.images[0], M, yy - 10, 75, 57);
      else copy(String(index + 1).padStart(2, '0'), M, yy + 8, 75, { size: 19, color: muted, display: true });
      let sy = copy(project.title, 139, yy, 390, { size: 13, leading: 16, weight: 'bold', display: true });
      const summary = wrap(project.summary || project.lead, 390, 8.5).slice(0, 2);
      // The contents stays scannable; long summaries appear in full in the study.
      for (const line of summary) {
        if (sy + 15 > BOTTOM) { page('Contents'); sy = title(project.title, 'Continued', '', 23) + 20; }
        sy = copy(line, 139, sy + 3, 390, { size: 8.5, leading: 9, color: muted });
      }
      indexLinks.push({ id: project.id, page: doc.getNumberOfPages(), y: yy });
      yy = Math.max(yy + rowHeight, sy + 25);
    }
  }

  for (const [index, project] of illustrated.entries()) {
    const images = project.images;
    const drawings = images.filter(i => /drawing|\bcad\b/i.test(`${i.title} ${i.src}`));
    const photos = images.filter(i => !drawings.includes(i));
    const photoSequence = photos.length ? photos : images;
    const spreadImages = photoSequence.slice(0, 3);
    const extraPhotos = photoSequence.slice(3);
    const designSpread = drawings.length > 0 && photos.length > 0;
    const isInterface = spreadImages.length <= 2 && (await loadImage(spreadImages[0].src)).height / (await loadImage(spreadImages[0].src)).width > 1.8;
    page(`${String(index + 1).padStart(2, '0')} / Selected work`);
    projectPages.set(project.id, doc.getNumberOfPages());
    const lead = project.lead || project.summary;
    const leadLines = wrap(lead, CW - 22, 11.2);
    const start = title(project.title, project.meta, leadLines.slice(0, 5).join('\n'));
    doc.link(M, 45, CW, 50, { url: projectUrl(project) });
    const sections = project.sections.filter(([heading]) => !designSpread || !/failure|testing|engineering decisions/i.test(heading));
    // A card outcome is a concise closing line, not a second duplicate outcome paragraph.
    const textSections = sections.map(([heading, items]) => [heading, items]);
    if (project.summary && project.summary !== lead && wrap(project.summary, 390, 8.5).length > 2) textSections.unshift(['Overview', [project.summary]]);
    if (leadLines.length > 5) textSections.unshift(['Overview', [leadLines.slice(5).join(' ')]]);
    if (project.outcome && !sections.some(([heading]) => /outcome/i.test(heading))) textSections.push(['Result', [project.outcome]]);
    if (project.tools) textSections.push(['Tools', [project.tools]]);
    if (isInterface) {
      // The screenshots are shown at their natural proportions, alongside the story.
      const imageX = 323, areaW = 249, gap = 13, eachW = (areaW - gap) / spreadImages.length;
      for (let i = 0; i < spreadImages.length; i++) {
        const img = await loadImage(spreadImages[i].src);
        const height = eachW * img.height / img.width;
        await picture(spreadImages[i], imageX + i * (eachW + gap), start + 8, eachW, height, { background: '#fff' });
        caption(spreadImages[i].caption, imageX + i * (eachW + gap), start + height + 22, eachW);
      }
      flow(textSections, { y: start + 10, columns: 1, width: 253, continuation: project.title });
    } else {
      const idealHeight = spreadImages.length > 2 ? 226 : 243;
      const imageHeight = Math.max(164, Math.min(idealHeight, BOTTOM - start - 53 - balancedGroups(textSections).height));
      const gap = 12;
      if (spreadImages.length === 1) {
        await picture(spreadImages[0], M, start, CW, imageHeight, { crop: true });
        caption(spreadImages[0].caption, M, start + imageHeight + 13, CW);
      } else if (spreadImages.length === 2) {
        const ww = (CW - gap) / 2;
        for (let i = 0; i < 2; i++) {
          await picture(spreadImages[i], M + i * (ww + gap), start, ww, imageHeight);
          caption(spreadImages[i].caption, M + i * (ww + gap), start + imageHeight + 13, ww);
        }
      } else {
        // The most descriptive landscape photo is the large panel; smaller
        // prototype views retain their full framing in adjacent portrait panels.
        const landscape = spreadImages.find(i => /in use/i.test(i.title)) || spreadImages[0];
        const others = spreadImages.filter(i => i !== landscape);
        await picture(landscape, M, start, 276, imageHeight);
        caption(landscape.caption, M, start + imageHeight + 13, 276);
        const ww = (CW - 276 - gap * others.length) / others.length;
        for (let i = 0; i < others.length; i++) {
          await picture(others[i], M + 276 + gap + i * (ww + gap), start, ww, imageHeight);
          caption(others[i].caption, M + 276 + gap + i * (ww + gap), start + imageHeight + 13, ww);
        }
      }
      balancedFlow(textSections, start + imageHeight + 43, project.title);
    }
    // Every additional gallery image gets space, without shrinking technical drawings
    // into unreadable thumbnails on the project opener.
    if (designSpread) {
      page(`${String(index + 1).padStart(2, '0')} / Design development`);
      let y = title(project.title, 'Design development', '');
      for (let i = 0; i < drawings.length; i += 2) {
        if (i > 0) { page('Design development'); y = title(project.title, 'Design development', ''); }
        const pair = drawings.slice(i, i + 2), gap = 16, ww = (CW - gap * (pair.length - 1)) / pair.length;
        for (let j = 0; j < pair.length; j++) {
          await picture(pair[j], M + j * (ww + gap), y + 15, ww, 300, { background: '#fff' });
          caption(pair[j].caption, M + j * (ww + gap), y + 329, ww);
        }
      }
      balancedFlow(project.sections.filter(([heading]) => /failure|testing|engineering decisions/i.test(heading)), y + 372, `${project.title} / Design development`);
    }
    for (let i = 0; i < extraPhotos.length; i += 2) {
      page(`${String(index + 1).padStart(2, '0')} / Project images`);
      const yy = title(project.title, 'Project images', '', 28) + 25;
      const pair = extraPhotos.slice(i, i + 2);
      for (let j = 0; j < pair.length; j++) {
        await picture(pair[j], M, yy + j * 277, CW, 244);
        caption(pair[j].caption || pair[j].title, M, yy + j * 277 + 257, CW);
      }
    }
  }

  if (unillustrated.length) {
    page('Further engineering work');
    let cursor = title('Further engineering work', '', '', 28) + 35;
    for (const project of unillustrated) {
      // Two concise studies can share a page; long new studies continue naturally.
      if (cursor > 480) { page('Further engineering work'); cursor = 78; }
      projectPages.set(project.id, doc.getNumberOfPages());
      cursor = copy(project.title, M, cursor, CW, { size: 19, leading: 22, weight: 'bold', display: true, url: projectUrl(project) });
      cursor = copy([project.meta, project.tools].filter(Boolean).join(' / '), M, cursor + 5, CW, { size: 8, color: muted }) + 12;
      const introLines = wrap(project.lead || project.summary, CW, 10.2);
      cursor = copy(introLines.slice(0, 5).join('\n'), M, cursor, CW, { size: 10.2, leading: 14 }) + 18;
      const sections = [...project.sections];
      if (project.summary && project.summary !== project.lead && project.lead && wrap(project.summary, 390, 8.5).length > 2) sections.unshift(['Overview', [project.summary]]);
      if (introLines.length > 5) sections.unshift(['Overview', [introLines.slice(5).join(' ')]]);
      const first = sections.slice(0, 1), rest = sections.slice(1);
      const leftHeight = first.reduce((sum, [heading, items]) => sum + 32 + items.reduce((h, t) => h + wrap(t, 253, 9.2).length * 12.5 + 5, 0), 0);
      const rightHeight = rest.reduce((sum, [heading, items]) => sum + 32 + items.reduce((h, t) => h + wrap(t, 254, 9.2).length * 12.5 + 5, 0), 0);
      const fullHeight = Math.max(leftHeight, rightHeight);
      if (cursor + fullHeight <= BOTTOM) {
        flow(first, { y: cursor, columns: 1, width: 253, continuation: project.title });
        flow(rest, { y: cursor, columns: 1, x: 318, width: 254, continuation: project.title });
        cursor += fullHeight + 35;
      } else {
        const end = flow(sections, { y: cursor, continuation: project.title });
        cursor = end.column === 0 ? end.y + 40 : BOTTOM;
      }
    }
  }

  if (model.experience.length || model.earlier.length) {
  page('Experience & contact');
  let y = title('Experience', '', '', 32) + 32;
  for (const entry of [...model.experience, ...model.earlier]) {
    const height = wrap(entry.body, 350, 10).length * 14 + 50;
    if (y + Math.min(height, 160) > 698) { page('Experience & contact'); y = title('Experience', 'Continued', '', 32) + 25; }
    copy(entry.date || '', M, y, 155, { size: 8, color: muted, leading: 12 });
    let yy = copy(entry.title, 222, y, 350, { size: 14, weight: 'bold', display: true, leading: 17 });
    if (entry.role) yy = copy(entry.role, 222, yy + 5, 350, { size: 9, color: muted }) + 4;
    const bodyLines = wrap(entry.body, 350, 10);
    yy += 7;
    for (const line of bodyLines) {
      if (yy + 14 > BOTTOM) { page('Experience & contact'); yy = title(entry.title, 'Continued', '', 24) + 20; }
      font(10); doc.text(line, 222, yy); yy += 14;
    }
    y = yy + 34;
  }
  }
  for (const entry of model.additional) {
    page(entry.title || 'Additional work');
    const yy = title(entry.title || 'Additional work', '', '', 28) + 25;
    flow([['', [entry.body]]], { y: yy, continuation: entry.title });
  }
  const count = doc.getNumberOfPages();
  for (const entry of indexLinks) {
    const destination = projectPages.get(entry.id);
    if (!destination) continue;
    doc.setPage(entry.page); font(8, 'normal', muted);
    doc.text(String(destination).padStart(2, '0'), W - M, entry.y, { align: 'right' });
    doc.link(135, entry.y - 14, CW - 95, 24, { pageNumber: destination });
  }
  for (let i = 1; i <= count; i++) {
    doc.setPage(i); font(7.5, 'normal', muted);
    const url = model.url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    doc.text(url, M, 768); doc.link(M, 758, doc.getTextWidth(url), 13, { url: model.url });
    doc.text(String(i).padStart(2, '0'), W - M, 768, { align: 'right' });
  }
  return doc;
};
