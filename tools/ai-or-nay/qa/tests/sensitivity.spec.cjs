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
test('DE/EN modal story, scenario selection, direct navigation, live updates and mobile',async({page},info)=>{
 await page.locator('#guideDemo').click();await page.locator('#demoCasePicker [data-demo-case="it"]').click();
 await expect(page.locator('body')).toHaveClass(/guideResults/);
 const open=page.locator('#roiSensitivityOpen'),dialog=page.locator('#roiSensitivityDialog');
 await expect(open).toBeVisible();await expect(dialog).toBeHidden();
 const before=await page.evaluate(()=>JSON.stringify(serialize()));
 await open.click();await expect(dialog).toBeVisible();
 await expect(dialog.locator('.ssTabs button')).toHaveCount(5);
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
