const { test, expect } = require('@playwright/test');
const fs = require('node:fs/promises');
const URL='/tools/ai-or-nay/';
async function open(page) {
  await page.addInitScript(() => localStorage.setItem('magenta-lab-intro-v2-ai-or-nay','1'));
  await page.goto(URL);
  await expect(page.locator('#guideTop')).toBeVisible();
}
async function demo(page) {
  await open(page);
  await page.locator('#guideDemo').click();
  await expect(page.locator('body')).toHaveClass(/guideResults/);
  await expect.poll(()=>page.evaluate(()=>window.latest?.results?.errors?.length)).toBe(0);
}
async function download(page,action) {
  await page.locator('#guideSave').click();
  const [file]=await Promise.all([page.waitForEvent('download'),page.locator('[data-file-action="'+action+'"]').click()]);
  return {file,bytes:await fs.readFile(await file.path())};
}
test('first visit intro opens and can be dismissed',async({page})=>{
  await page.goto(URL);
  await expect(page.locator('.intro-overlay')).toBeVisible();
  await page.locator('[data-intro-dismiss]').click();
  await expect(page.locator('.intro-overlay')).toBeHidden();
  await expect(page.locator('#guidedRoot')).toBeVisible();
});
test('intro dismissal persists across reload',async({page})=>{
  await page.goto(URL); await page.locator('[data-intro-dismiss]').click();
  await page.reload(); await expect(page.locator('.intro-overlay')).toBeHidden();
});
test('blank wizard blocks progression',async({page})=>{
  await open(page); await page.locator('#gNext').click();
  await expect(page.locator('[data-gfield="case"]')).toBeVisible();
  await expect(page.locator('#guideBasicVolume')).toBeHidden();
});
test('case name reveals volume and positive volume reveals horizon',async({page})=>{
  await open(page); await page.locator('[data-gfield="case"]').fill('Synthetic QA');
  await expect(page.locator('#guideBasicVolume')).toBeVisible();
  await page.locator('[data-gfield="volume"]').fill('1000');
  await expect(page.locator('#guideBasicHorizon')).toBeVisible();
});
test('switches German and English',async({page})=>{
  await open(page); await page.locator('#guideEN').click();
  await expect(page.locator('.guideTitle')).toContainText('Build your AI business case');
  await page.locator('#guideDE').click();
  await expect(page.locator('.guideTitle')).toContainText('KI-Business-Case');
});
test('demo reaches complete financial results without uncaught errors',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await demo(page); expect(await page.evaluate(()=>Number.isFinite(window.latest.results.currentNet))).toBe(true);
  expect(errors).toEqual([]);
});
test('rules scenario switches visible comparison and preserves the AI baseline',async({page})=>{
  await demo(page);
  await page.locator('#guideEN').click();
  const old=await page.evaluate(()=>window.latest.results.currentNet);
  await expect(page.locator('#guideLeanResults .guideTopKpiTitle').first()).toContainText('AI ROI vs. today');
  await page.locator('#compareRules').click();
  await expect(page.locator('#compareRules')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#guideLeanResults .guideTopKpiTitle').first()).toContainText('Rules ROI vs. today');
  await expect(page.locator('#guideLeanResults .guideLeanCol.future').first()).toContainText('With rules');
  // Rules vs. today is a separate presentation scenario; the engine retains the AI baseline.
  expect(await page.evaluate(()=>window.latest.comparisonMode)).toBe('today');
  expect(await page.evaluate(()=>window.latest.results.currentNet)).toBeCloseTo(old,6);
  await page.locator('#compareToday').click();
  await expect(page.locator('#compareToday')).toHaveAttribute('aria-pressed','true');
  await expect(page.locator('#guideLeanResults .guideTopKpiTitle').first()).toContainText('AI ROI vs. today');
  expect(await page.evaluate(()=>window.latest.results.currentNet)).toBeCloseTo(old,6);
});
test('JSON save and reimport preserves completed case net',async({page})=>{
  await demo(page); const old=await page.evaluate(()=>window.latest.results.currentNet);
  const {file,bytes}=await download(page,'save-json');
  expect(file.suggestedFilename()).toMatch(/\.json$/i); expect(JSON.parse(bytes.toString('utf8'))).toBeTruthy();
  await page.locator('#guideDraftImport').setInputFiles({name:'case.json',mimeType:'application/json',buffer:bytes});
  await expect.poll(()=>page.evaluate(()=>window.latest?.results?.currentNet)).toBeCloseTo(old,6);
});
test('Excel export generates an XLSX archive',async({page})=>{
  await demo(page); const {file,bytes}=await download(page,'save-excel');
  expect(file.suggestedFilename()).toMatch(/\.xlsx$/i);
  expect(bytes.subarray(0,2).toString()).toBe('PK'); expect(bytes.length).toBeGreaterThan(500);
});
test('PDF export generates a PDF',async({page})=>{
  await demo(page); const {file,bytes}=await download(page,'report-pdf');
  expect(file.suggestedFilename()).toMatch(/\.pdf$/i); expect(bytes.subarray(0,5).toString()).toBe('%PDF-');
});
test('mobile wizard fits viewport',async({page})=>{
  await page.setViewportSize({width:390,height:844}); await open(page);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(391);
  await expect(page.locator('[data-gfield="case"]')).toBeVisible();
});
test('desktop and mobile demo screenshots for human review',async({page},info)=>{
  await demo(page);
  await page.screenshot({path:info.outputPath('desktop-results.png'),animations:'disabled'});
  await page.setViewportSize({width:390,height:844});
  await page.screenshot({path:info.outputPath('mobile-results.png'),animations:'disabled'});
});
