const {test,expect}=require('@playwright/test');
const base=()=>({
 inputs:{caseName:'Synthetic sensitivity',volume:'1000',portfolioMode:'single',portfolioAllocation:'equal',currentTechMonthly:'0',remainingTechMonthly:'0',costDevelopment:'12000',costHosting:'2000',contractFee:'0',rulesName:'Rules',rulesSetup:'0',rulesOpex:'0',fx:'1'},
 costMode:'advanced',staff:[{id:1,name:'Role',salaryType:'hour',rate:60}],
 steps:[{id:1,role:1,name:'Task',before:10,errorRate:0,rework:0,mode:'assist',share:100,future:4,aiError:0,aiRework:0,model:'contract',review:'always',rules:7,depLevel:'none'}],
 ranges:{horizon:12,realization:100}
});
test.beforeEach(async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('magenta-lab-intro-v2-ai-or-nay','1'));
 await page.goto('/tools/ai-or-nay/');
 await page.waitForFunction(()=>typeof window.roiSensitivityAnalyze==='function');
});
test('snapshot parity, independent numeric deltas, bounds and immutable inputs',async({page})=>{
 const out=await page.evaluate(d=>{
  loadData(d);const original=JSON.stringify(serialize()),latest=JSON.stringify(window.latest);
  const a=window.roiSensitivityAnalyze(serialize());
  return {baseline:a.baseline,live:window.latest.results,volume:a.rows.find(x=>x.id==='inputs.volume').scenarios,realization:a.rows.find(x=>x.id==='ranges.realization').scenarios,unchanged:original===JSON.stringify(serialize())&&latest===JSON.stringify(window.latest)};
 },base());
 expect(out.baseline).toEqual({roi:100,net:36000,payback:3});
 expect(out.baseline.roi).toBe(out.live.currentROI);
 expect(out.volume.map(x=>x.percent)).toEqual([-20,-10,10,20]);
 const plus=out.volume[3];expect(plus.roi).toBeCloseTo(40,6);expect(plus.net).toBeCloseTo(14400,6);expect(plus.payback).toBeCloseTo(12000/5200-3,6);
 expect(out.realization[3].value).toBe(100);expect(out.realization[3].roi).toBe(0);expect(out.unchanged).toBe(true);
});
test('payback becomes unreachable and is ranked as a material transition',async({page})=>{
 const d=base();d.ranges.realization=35;
 const x=await page.evaluate(d=>{loadData(d);const a=roiSensitivityAnalyze(serialize());const r=a.rows.find(x=>x.id==='ranges.realization');return {baseline:a.baseline,scenario:r.scenarios[0],critical:roiSensitivityScore(r,'payback',a.baseline)===Infinity};},d);
 expect(x.baseline.payback).toBeCloseTo(120,6);expect(x.scenario.result.payback).toBeNull();expect(x.scenario.payback).toBeNull();expect(x.critical).toBe(true);
});
test('shared platform and contract inclusion are respected',async({page})=>{
 const d=base();Object.assign(d.inputs,{portfolioMode:'shared',portfolioCount:'5',portfolioSetup:'50000',portfolioOpex:'2000',caseSetupOverride:'2000',caseOpexOverride:'600',contractIncludedInPlatform:'yes',contractFee:'900'});
 const a=await page.evaluate(d=>{loadData(d);return roiSensitivityAnalyze(serialize());},d);
 expect(a.baseline.roi).toBeCloseTo(200,6);expect(a.rows.some(x=>x.id==='inputs.contractFee')).toBe(false);
 expect(a.rows.find(x=>x.id==='inputs.portfolioCount').scenarios[3].value).toBe(6);
});
test('zero investment has no fabricated ROI; incomplete case has no ranking',async({page})=>{
 const d=base();d.inputs.costDevelopment='0';d.inputs.costHosting='0';
 const out=await page.evaluate(d=>{loadData(d);const a=roiSensitivityAnalyze(serialize());const s=serialize();s.inputs.volume='';return {a,b:roiSensitivityAnalyze(s)};},d);
 expect(out.a.baseline.roi).toBeNull();expect(out.b.baseline).toBeNull();expect(out.b.rows).toEqual([]);
});
test('weekly mode ignores inactive per-step time and includes role allocation',async({page})=>{
 const out=await page.evaluate(d=>{loadData(d);const s=serialize();s.timeMode='staff';s.staff[0].amount=40;s.steps[0].savedPct=50;return roiSensitivityAnalyze(s);},base());
 expect(out.rows.some(x=>x.id==='staff.0.amount')).toBe(true);expect(out.rows.some(x=>x.id==='steps.0.before')).toBe(false);
});
test('current effort and current compensation are fixed baseline facts in both comparisons',async({page})=>{
 const out=await page.evaluate(d=>{
  loadData(d);
  const snap=serialize(),original=JSON.stringify(snap),ai=roiSensitivityAnalyze(snap,'ai'),rules=roiSensitivityAnalyze(snap,'rules');
  const salaryModes=['hour','day','gross'].map(salaryType=>{
   const s=JSON.parse(original);s.staff[0].salaryType=salaryType;
   s.staff[0].rate=salaryType==='hour'?60:salaryType==='day'?480:124800;
   return roiSensitivityAnalyze(s,'ai').rows.map(r=>r.id);
  });
  const weekly=JSON.parse(original);weekly.timeMode='staff';weekly.staff[0].amount=40;weekly.steps[0].savedPct=50;
  return {baseline:ai.baseline,ai:ai.rows.map(r=>r.id),rules:rules.rows.map(r=>r.id),salaryModes,weekly:roiSensitivityAnalyze(weekly,'ai').rows.map(r=>r.id),unchanged:JSON.stringify(snap)===original};
 },base());
 expect(out.baseline).toEqual({roi:100,net:36000,payback:3});
 expect(out.ai).toContain('steps.0.future');
 expect(out.weekly).toContain('steps.0.savedPct');
 expect(out.rules).toContain('steps.0.rules');
 for(const ids of [out.ai,out.rules,...out.salaryModes,out.weekly]){
  expect(ids.some(id=>/^steps\.\d+\.before$|^staff\.\d+\.rate$/.test(id))).toBe(false);
 }
 expect(out.unchanged).toBe(true);
});
test('floating sensitivity replaces Tool-Info only in results and stays fixed while scrolling',async({page})=>{
 const button=page.locator('#roiSensitivityOpen'),intro=page.locator('.tool-intro-reopen'),dialog=page.locator('#roiSensitivityDialog');
 await expect(button).toBeHidden();await expect(intro).toBeVisible();
 await page.locator('#guideDemo').click();await page.locator('#demoCasePicker [data-demo-case="it"]').click();
 await page.locator('[data-demo-confirm]').click();
 await expect(button).toBeVisible();await expect(intro).toBeHidden();
 for(const viewport of [{width:1440,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  const before=await button.boundingBox();
  expect(before.x).toBeGreaterThanOrEqual(0);expect(before.y+before.height).toBeLessThanOrEqual(viewport.height);
  await page.evaluate(()=>{window.scrollTo({top:500,behavior:'instant'});for(const pane of document.querySelectorAll('#inputView>.right,#inputView>.left'))pane.scrollTop=500;});
  const after=await button.boundingBox();expect(Math.abs(after.x-before.x)).toBeLessThanOrEqual(1);expect(Math.abs(after.y-before.y)).toBeLessThanOrEqual(1);
  await button.click();await expect(dialog).toBeVisible();await dialog.locator('.ssClose').click();await expect(dialog).toBeHidden();
 }
 // A cancelled reset must keep the results and floating action intact.
 page.once('dialog',d=>d.dismiss());
 await page.locator('#guideNew').click();await expect(page.locator('body')).toHaveClass(/guideResults/);await expect(button).toBeVisible();
 // Explicitly confirm the reset before asserting the wizard visibility.
 page.once('dialog',d=>d.accept());
 await page.locator('#guideNew').click();await expect(page.locator('body')).toHaveClass(/guideWizard/);await expect(button).toBeHidden();await expect(intro).toBeVisible();
});
test('DE/EN modal story, scenario selection, direct navigation, live updates and mobile',async({page},info)=>{
 await page.locator('#guideDemo').click();await page.locator('#demoCasePicker [data-demo-case="it"]').click();
 await page.locator('[data-demo-confirm]').click();
 await expect(page.locator('body')).toHaveClass(/guideResults/);
 const open=page.locator('#roiSensitivityOpen'),dialog=page.locator('#roiSensitivityDialog');
 await expect(open).toBeVisible();await expect(dialog).toBeHidden();
 const before=await page.evaluate(()=>JSON.stringify(serialize()));
 await open.click();await expect(dialog).toBeVisible();
 await expect(dialog.locator('.ssTabs button')).toHaveCount(5);
 await expect(dialog.locator('.ssFixedBaseline')).toContainText('Ist-Bearbeitungszeit und aktuelle Vergütung');
 expect(await dialog.locator('.ssTabName').allTextContents()).not.toContain('Ist-Zeit');
 expect(await dialog.locator('.ssTabName').allTextContents()).not.toContain('Vergütung');
 const names=await dialog.locator('.ssTabName').allTextContents();
 expect(names).toHaveLength(5);expect(names.every(n=>n.trim()&&!/^(Hebel|Driver)$/.test(n))).toBe(true);
 await expect(dialog.locator('.ssTabs [aria-current="step"]')).toHaveAttribute('title',await dialog.locator('.ssTitle').textContent());
 await expect(dialog.locator('.ssScenario')).toHaveCount(4);
 await expect(dialog.locator('.ssKPI')).toHaveCount(3);
 await expect(dialog.locator('.ssTitle')).toBeVisible();
 await dialog.locator('[data-scenario="20"]').click();await expect(dialog.locator('[data-scenario="20"]')).toHaveAttribute('aria-pressed','true');
 const first=await dialog.locator('.ssTitle').textContent();
 await dialog.locator('.ssNext').click();await expect(dialog.locator('.ssTitle')).not.toHaveText(first);
 await dialog.locator('.ssTabs button').first().click();await expect(dialog.locator('.ssTitle')).toHaveText(first);
 expect(await page.evaluate(()=>JSON.stringify(serialize()))).toBe(before);
 await page.screenshot({path:info.outputPath('desktop-sensitivity.png')});
 await page.setViewportSize({width:390,height:844});
 expect(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 const geometry=await dialog.evaluate(el=>{const boxes=sel=>[...el.querySelectorAll(sel)].map(e=>e.getBoundingClientRect());const tabs=boxes('.ssTabs button'),plots=boxes('.ssPlot');return {tabHeight:Math.max(...tabs.map(r=>r.height))-Math.min(...tabs.map(r=>r.height)),plotTop:Math.max(...plots.map(r=>r.top))-Math.min(...plots.map(r=>r.top)),allTabsVisible:tabs.every(r=>r.left>=el.getBoundingClientRect().left&&r.right<=el.getBoundingClientRect().right)};});
 expect(geometry.tabHeight).toBeLessThanOrEqual(1);expect(geometry.plotTop).toBeLessThanOrEqual(1);expect(geometry.allTabsVisible).toBe(true);
 await page.screenshot({path:info.outputPath('mobile-sensitivity.png')});
 await page.keyboard.press('Escape');await expect(dialog).toBeHidden();
 await page.locator('#guideEN').click();await expect(open).toContainText('Sensitivity analysis');await open.click();
 await expect(dialog.locator('.ssFixedBaseline')).toContainText('Current processing time and compensation');
 await dialog.locator('[data-metric="net"]').click();
 const jump=dialog.locator('.ssJump');
 for(let n=0;n<100&&await jump.getAttribute('data-sensitivity-id')!=='inputs.volume';n++){
  await dialog.locator('.ssNext').click();
  await expect(dialog).toBeVisible();
 }
 await expect(jump).toHaveAttribute('data-sensitivity-id','inputs.volume');
 await jump.click();await expect(dialog).toBeHidden();await expect(page.locator('#guideQuick [data-qfield="volume"]')).toBeFocused();
 const old=await page.evaluate(()=>window.latest.results.currentNet);
 await page.locator('#guideQuick [data-qfield="volume"]').fill('1300');
 await expect.poll(()=>page.evaluate(()=>window.latest.results.currentNet)).not.toBe(old);
 await page.locator('#compareRules').click();await open.click();await expect(dialog).toContainText('Rules vs. today');
 await dialog.locator('.ssClose').click();await expect(dialog).toBeHidden();
});
