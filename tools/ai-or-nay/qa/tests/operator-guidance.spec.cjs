const {test,expect}=require('@playwright/test');
const url='/tools/ai-or-nay/';
async function start(page){
 await page.addInitScript(()=>{localStorage.setItem('magenta-lab-intro-v2-ai-or-nay','1');localStorage.setItem('magenta-lab-lang','de');});
 await page.goto(url);
 const b=page.locator('#operatorOpen');await expect(b).toBeVisible();await b.click();
 await expect(page.locator('#operatorBriefing')).toBeVisible();
}
test('optional bilingual briefing, isolated exercise, contextual hints',async({page},testInfo)=>{
 await start(page);
 await testInfo.attach('briefing-desktop',{body:await page.screenshot(),contentType:'image/png'});
 const snap=()=>page.evaluate(()=>JSON.stringify(window.aiGuidedSnapshot()));
 const initial=await snap();
 await expect(page.locator('#operatorTitle')).toHaveText('ROI-Hebel');
 await expect(page.locator('.opFormula')).toBeVisible();
 await expect(page.locator('.opDetail')).not.toHaveAttribute('open','');
 await page.locator('.opDetail summary').click();
 await expect(page.locator('.opDetail p').first()).toBeVisible();
 await page.locator('.opDetail summary').click();
 await page.locator('#opHints').check();
 await expect(page.locator('#guidedRoot .operatorHint').first()).toBeAttached();
 for(let i=0;i<5;i++){
  await page.locator('#opNext').click();
  if(i<4)await testInfo.attach('briefing-step-'+(i+2),{body:await page.screenshot(),contentType:'image/png'});
 }
 await expect(page.locator('#opNumbers .opMetric')).toHaveCount(4);
 await expect(page.locator('#opNumbers')).toContainText('ROI: 0.0%');
 await testInfo.attach('briefing-sensitivity',{body:await page.screenshot(),contentType:'image/png'});
 await page.locator('#opRealization').fill('0');
 await expect(page.locator('#opNumbers')).toContainText('ROI: -100.0%');
 expect(await snap()).toBe(initial);
 await page.locator('#opNext').click();
 await expect(page.locator('#operatorBriefing')).not.toBeVisible();
 await page.locator('#guideEN').click();
 await page.locator('#operatorOpen').click();
 await expect(page.locator('#operatorTitle')).toHaveText('ROI drivers');
 await page.locator('#opHints').uncheck();
 await page.keyboard.press('Escape');
 await expect(page.locator('#guidedRoot .operatorHint:visible')).toHaveCount(0);
});
test('mobile briefing fits and closes without advancing the wizard',async({page},testInfo)=>{
 await page.setViewportSize({width:390,height:844});await start(page);
 const before=await page.evaluate(()=>JSON.stringify(window.aiGuidedSnapshot()));
 const box=await page.locator('#operatorBriefing').boundingBox();expect(box.width).toBeLessThanOrEqual(390);
 await testInfo.attach('briefing-mobile',{body:await page.screenshot(),contentType:'image/png'});
 for(let i=0;i<5;i++)await page.locator('#opNext').click();
 expect(await page.locator('#operatorBriefing').evaluate(el=>el.scrollWidth<=el.clientWidth+1)).toBe(true);
 await testInfo.attach('briefing-mobile-exercise',{body:await page.screenshot(),contentType:'image/png'});
 await page.keyboard.press('Escape');await expect(page.locator('#operatorBriefing')).not.toBeVisible();
 expect(await page.evaluate(()=>JSON.stringify(window.aiGuidedSnapshot()))).toBe(before);
});
test('guidance in results editor leaves actual ROI untouched',async({page},testInfo)=>{
 await start(page);await page.locator('#opHints').check();await page.locator('#opClose').click();
 await page.locator('#guideDemo').click();await page.locator('#demoCasePicker [data-demo-case="it"]').click();
 await page.locator('body.guideResults').waitFor();await page.waitForFunction(()=>window.latest?.results?.errors?.length===0);
 const snapshot=await page.evaluate(()=>JSON.stringify(window.latest));
 await expect(page.locator('#guideQuick .operatorHint').first()).toBeAttached();
 await page.locator('#operatorOpen').click();await page.locator('#opHints').uncheck();await page.locator('#opClose').click();
 expect(await page.evaluate(()=>JSON.stringify(window.latest))).toBe(snapshot);
 await expect(page.locator('#guideQuick .operatorHint:visible')).toHaveCount(0);
});
