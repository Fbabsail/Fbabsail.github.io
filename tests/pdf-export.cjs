const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const root = path.resolve(__dirname, '..');
const outputs = path.resolve(root, '.test-artifacts');
fs.mkdirSync(outputs, { recursive: true });
(async () => {
  const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}), headless: true });
  const context = await browser.newContext({ acceptDownloads: true });
  let failFont = false;
  await context.route('https://fbabsail.github.io/**', async route => {
    const relative = decodeURIComponent(new URL(route.request().url()).pathname).replace(/^\//, '') || 'index.html';
    if (failFont && relative.endsWith('.ttf')) return route.abort();
    const file = path.join(root, relative);
    const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.ttf': 'font/ttf', '.jpg': 'image/jpeg', '.png': 'image/png' };
    await route.fulfill({ body: fs.readFileSync(file), contentType: mime[path.extname(file)] || 'application/octet-stream' });
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto('https://fbabsail.github.io/');
  assert.equal(await page.locator('#download-pdf').isVisible(), true);
  assert.equal(await page.evaluate(() => window.jspdf === undefined), true, 'Library must load lazily');
  const [download] = await Promise.all([page.waitForEvent('download'), page.locator('#download-pdf').click()]);
  await download.saveAs(path.join(outputs, 'Faris_Babsail_Portfolio.pdf'));
  assert.equal(download.suggestedFilename(), 'Faris_Babsail_Portfolio.pdf');
  await page.screenshot({ path: path.join(outputs, 'footer-desktop.png'), fullPage: true });
  const data = await page.evaluate(() => window.portfolioPdf.collect());
  assert.equal(data.projects.length, 7);
  assert.equal(data.earlier.length, 2);
  fs.writeFileSync(path.join(outputs, 'pdf-model.json'), JSON.stringify(data));
  // Published membership, removal with stale case data, long text, and galleries.
  await page.evaluate(() => {
    document.querySelector('.bio-summary').textContent = 'Updated profile content for regression check. ' + Array(35).fill('A longer biography remains readable as it grows.').join(' ');
    document.querySelector('#combat').remove();
    document.querySelector('.work-list').insertAdjacentHTML('beforeend', '<article><a data-case="new-project"><div class="project-body"><h3>Future card project</h3><p>New discipline</p><p class="project-summary">Future project content from the live page.</p></div></a></article>');
    document.querySelector('.work-list').insertAdjacentHTML('beforeend', '<article><a data-case="future"><div class="project-body"><h3>Future detailed project</h3><p>New discipline</p><p class="project-summary">A new illustrated project and expanded gallery.</p></div></a></article>');
    cases.future = { title: 'Future detailed project', subtitle: 'Updated 2027', lead: 'Fresh published content. ' + Array(30).fill('This longer introduction must wrap cleanly.').join(' '), sections: [['Long contribution', [Array(200).fill('A longer future description exercises pagination.').join(' ')]]] };
    cases.draft = { title: 'Unpublished draft must stay out', subtitle: '', lead: 'Not on the site', sections: [] };
    galleries.future = [...galleries.sound, ...galleries.tidebound, ...galleries.music.slice(0, 3)];
    document.querySelector('#sound .project-summary').textContent = 'Edited current project summary appears in the PDF.';
    document.querySelector('.experience-row > p').textContent += ' ' + Array(100).fill('Long experience descriptions should also paginate without clipping.').join(' ');
  });
  const future = await page.evaluate(async () => {
    const model = window.portfolioPdf.collect();
    const doc = await window.portfolioPdf.create(model);
    return { model, pdf: Array.from(new Uint8Array(doc.output('arraybuffer'))) };
  });
  assert.equal(future.model.projects.length, 8);
  assert(!future.model.projects.some(p => p.id === 'combat' || p.id === 'draft'));
  assert(future.model.bio[0].startsWith('Updated profile content for regression check.'));
  fs.writeFileSync(path.join(outputs, 'future.pdf'), Buffer.from(future.pdf));
  // Removing every card must not resurrect archived case data or produce blanks.
  const empty = await page.evaluate(async () => {
    document.querySelectorAll('main [data-case]').forEach(card => card.remove());
    const model = window.portfolioPdf.collect();
    const doc = await window.portfolioPdf.create(model);
    return { count: model.projects.length, pdf: Array.from(new Uint8Array(doc.output('arraybuffer'))) };
  });
  assert.equal(empty.count, 0);
  fs.writeFileSync(path.join(outputs, 'no-projects.pdf'), Buffer.from(empty.pdf));
  await page.reload();
  // Existing interactions and mobile layout.
  await page.locator('#motion-toggle').click();
  assert.equal(await page.locator('#motion-toggle').getAttribute('aria-pressed'), 'true');
  await page.locator('[data-case="sound"]').click();
  assert.equal(await page.locator('#case-dialog').isVisible(), true);
  await page.locator('#close-case').click();
  await page.setViewportSize({ width: 375, height: 812 });
  await page.locator('#download-pdf').scrollIntoViewIfNeeded();
  assert(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.screenshot({ path: path.join(outputs, 'footer-mobile.png') });
  // A failed first load must recover without reloading the page.
  const retry = await context.newPage();
  await retry.goto('https://fbabsail.github.io/');
  failFont = true;
  await retry.locator('#download-pdf').click();
  await retry.waitForFunction(() => document.querySelector('#pdf-status').textContent.includes('Could not'));
  assert.equal(await retry.locator('#download-pdf').isEnabled(), true);
  failFont = false;
  const [retriedDownload] = await Promise.all([retry.waitForEvent('download'), retry.locator('#download-pdf').click()]);
  assert.equal(retriedDownload.suggestedFilename(), 'Faris_Babsail_Portfolio.pdf');
  assert.deepEqual(errors, []);
  console.log('PASS: current export; add/remove projects; stale/draft exclusion; long bio, lead, project and experience text; expanded galleries; no projects; lazy loading; mobile; controls; retry.');
  await browser.close();
})();
