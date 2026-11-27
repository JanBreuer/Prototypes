const {test,expect}=require('@playwright/test');
const url='/tools/ai-or-nay/';
async function start(page){
 await page.goto(url);
 // Existing portfolio intro is independent; dismiss if it is shown.
 await page.evaluate(()=>{const el=document.querySelector('#toolIntroOverlay, .tool-intro-overlay');if(el)el.querySelector('button')?.click();});
 const b=page.locator('#operatorOpen');await expect(b).toBeVisible();
 // Use existing intro dismissal when a modal intercepts clicks.
 await b.click({force:true});
 await expect(page.locator('#operatorBriefing')).toBeVisible();
}
test('optional bilingual briefing, isolated exercise, contextual hints',async({page})=>{
 await start(page);
 const snap=()=>page.evaluate(()=>JSON.stringify(window.aiGuidedSnapshot()));
 const initial=await snap();
 await expect(page.locator('#operatorTitle')).toHaveText('ROI-Hebel');
 await page.locator('#opHints').check();
 await expect(page.locator('#guidedRoot .operatorHint').first()).toBeAttached();
 for(let i=0;i<5;i++)await page.locator('#opNext').click();
 await expect(page.locator('#opNumbers')).toContainText('ROI: 0.0%');
 await page.locator('#opRealization').fill('0');
 await expect(page.locator('#opNumbers')).toContainText('ROI: -100.0%');
 expect(await snap()).toBe(initial);
 await page.locator('#opNext').click();
 await expect(page.locator('#operatorBriefing')).not.toBeVisible();
 await page.locator('#guideEN').click({force:true});
 await page.locator('#operatorOpen').click({force:true});
 await expect(page.locator('#operatorTitle')).toHaveText('ROI drivers');
 await page.locator('#opHints').uncheck();
 await page.keyboard.press('Escape');
 await expect(page.locator('#guidedRoot .operatorHint:visible')).toHaveCount(0);
});
test('mobile briefing fits and closes without advancing the wizard',async({page})=>{
 await page.setViewportSize({width:390,height:844});await start(page);
 const before=await page.evaluate(()=>JSON.stringify(window.aiGuidedSnapshot()));
 const box=await page.locator('#operatorBriefing').boundingBox();expect(box.width).toBeLessThanOrEqual(390);
 await page.keyboard.press('Escape');await expect(page.locator('#operatorBriefing')).not.toBeVisible();
 expect(await page.evaluate(()=>JSON.stringify(window.aiGuidedSnapshot()))).toBe(before);
});