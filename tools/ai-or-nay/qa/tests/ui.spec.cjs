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
  await page.locator('#demoCasePicker [data-demo-case="it"]').click();
  await page.locator('[data-demo-confirm]').click();
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

const demoFixtures=[
 ['it',44182.4,'positive'],['meeting',56195.2,'positive'],['customer',76800,'positive'],['software',93445,'positive'],
 ['invoice',-1440,'borderline'],['ba',4011.25,'borderline'],['knowledge',-4528,'borderline'],['report',-5040,'borderline'],
 ['bid',-7081.5,'negative'],['contract',-23920,'negative'],['hr',-19224,'negative'],['quality',-36232,'negative']
];
for(const locale of ['DE','EN']){
 test('all twelve demo scenarios load with independently expected economics '+locale,async({page})=>{
  await open(page);await page.locator('#guide'+locale).click();
  for(const [id,net,band] of demoFixtures){
   await page.locator('#guideDemo').click();
   await expect(page.locator('#demoCasePicker [data-demo-case]')).toHaveCount(12);
   await expect(page.locator('#demoPickerTitle')).toContainText(locale==='EN'?'Choose a demo use case':'Demo-Use-Case auswählen');
   await page.locator('#demoCasePicker [data-demo-case="'+id+'"]').click();
   await expect(page.locator('#demoCasePicker')).toHaveAttribute('data-stage','preview');
   await expect(page.locator('[data-demo-confirm]')).toContainText(locale==='EN'?'Calculate AI potential':'KI-Potenzial berechnen');
   await page.locator('[data-demo-confirm]').click();
   await expect(page.locator('body')).toHaveClass(/guideResults/);
   const r=await page.evaluate(()=>window.latest.results);
   expect(r.errors, id).toEqual([]);expect(r.currentNet,id).toBeCloseTo(net,2);
   if(band==='positive')expect(r.currentROI).toBeGreaterThan(30);
   else if(band==='negative')expect(r.currentROI).toBeLessThan(-15);
   else expect(Math.abs(r.currentROI)).toBeLessThanOrEqual(15);
   await expect(page.locator('#description')).toHaveValue(new RegExp(locale==='EN'?'Illustrative assumptions':'Illustrative Annahmen'));
  }
 });
}
test('demo picker cancels without replacement and supports editing on mobile',async({page})=>{
 await page.setViewportSize({width:390,height:844});await demo(page);
 const old=await page.evaluate(()=>window.latest.results.currentNet);
 await page.locator('#guideDemo').click();
 await expect(page.locator('#demoCasePicker')).toBeVisible();
 expect(await page.evaluate(()=>document.querySelector('#demoCasePicker').scrollWidth)).toBeLessThanOrEqual(390);
 await page.keyboard.press('Escape');await expect(page.locator('#demoCasePicker')).not.toBeVisible();
 expect(await page.evaluate(()=>window.latest.results.currentNet)).toBeCloseTo(old,6);
 await page.locator('#guideQuick [data-qfield="volume"]').fill('1300');
 await expect.poll(()=>page.evaluate(()=>window.latest.results.vol)).toBe(1300);
 expect(await page.evaluate(()=>window.latest.results.currentNet)).toBeGreaterThan(old);
 await page.locator('#guideDemo').click();
 await page.locator('#demoCasePicker [data-demo-case="it"]').click();
  await page.locator('[data-demo-confirm]').click();
 expect(await page.evaluate(()=>window.latest.results.vol)).toBe(1200);
});

test('demo preview shows baseline, does not overwrite until confirmation, and supports back',async({page})=>{
 await open(page);await page.locator('#guideDE').click();
 const before=await page.evaluate(()=>JSON.stringify(window.latest.inputs));
 await page.locator('#guideDemo').click();await page.locator('[data-demo-case="it"]').click();
 await expect(page.locator('#demoCasePicker')).toHaveAttribute('data-stage','preview');
 await expect(page.locator('[data-demo-metric="cost"]')).toContainText('12.600,00');
 await expect(page.locator('[data-demo-metric="volume"]')).toHaveText('1.200');
 await expect(page.locator('[data-demo-metric="hours"]')).toHaveText('300');
 await expect(page.locator('[data-demo-metric="minutes"]')).toHaveText('15 min');
 await expect(page.locator('.demoPreviewStep')).toHaveCount(2);
 expect(await page.evaluate(()=>JSON.stringify(window.latest.inputs))).toBe(before);
 await expect(page.locator('body')).not.toHaveClass(/guideResults/);
 await page.locator('[data-demo-back]').click();await expect(page.locator('[data-demo-case]')).toHaveCount(12);
 await page.locator('[data-demo-case="it"]').click();await page.keyboard.press('Escape');
 await expect(page.locator('#demoCasePicker')).not.toBeVisible();
 expect(await page.evaluate(()=>JSON.stringify(window.latest.inputs))).toBe(before);
 await page.locator('#guideDemo').click();await page.locator('[data-demo-case="it"]').click();
 await page.locator('[data-demo-confirm]').click();
 await expect(page.locator('body')).toHaveClass(/guideResults/);
 const result=await page.evaluate(()=>window.latest.results);
 expect(result.monthHumanBefore+result.monthTechBefore).toBeCloseTo(12600,2);
 expect(result.currentNet).toBeCloseTo(44182.4,2);
 // Cancel a different preview while viewing results.
 await page.locator('#guideDemo').click();await page.locator('[data-demo-case="hr"]').click();
 await page.locator('[data-demo-close]').click();
 expect(await page.evaluate(()=>window.latest.results.currentNet)).toBeCloseTo(44182.4,2);
});
test('demo baseline preview fits mobile and localizes',async({page})=>{
 await page.setViewportSize({width:390,height:844});await open(page);await page.locator('#guideEN').click();
 await page.locator('#guideDemo').click();await page.locator('[data-demo-case="it"]').click();
 await expect(page.locator('#demoPickerTitle')).toHaveText('IT ticket handling');
 await expect(page.locator('[data-demo-metric="cost"]')).toContainText('12,600.00');
 expect(await page.locator('#demoCasePicker').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await expect(page.locator('[data-demo-confirm]')).toBeInViewport();
 await page.locator('[data-demo-confirm]').click();await expect(page.locator('body')).toHaveClass(/guideResults/);
});
