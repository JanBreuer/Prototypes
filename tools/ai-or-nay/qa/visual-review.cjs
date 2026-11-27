const { chromium } = require('@playwright/test');
const { spawn } = require('node:child_process');
const fs = require('node:fs/promises');
const path = require('node:path');
const [baseDir, headDir, output] = process.argv.slice(2).map(p=>path.resolve(p));
const urlPath='/tools/ai-or-nay/';
const scenarios=[['desktop-wizard',1440,900,false],['desktop-results',1440,900,true],['mobile-wizard',390,844,false],['mobile-results',390,844,true],['desktop-demo-preview',1440,900,'preview'],['mobile-demo-preview',390,844,'preview']];
async function server(dir,port){
 const p=spawn('python3',['-m','http.server',String(port),'--bind','127.0.0.1'],{cwd:dir,stdio:'ignore'});
 try { for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:'+port+urlPath)).ok)return p;}catch{} await new Promise(r=>setTimeout(r,100));}throw Error('Server unavailable: '+dir); }catch(e){p.kill();throw e;}
}
async function capture(browser,port,w,h,results,sensitivity=false){
 const ctx=await browser.newContext({viewport:{width:w,height:h},deviceScaleFactor:1,locale:'de-DE',timezoneId:'Europe/Berlin',reducedMotion:'reduce'});
 try{
  const page=await ctx.newPage();
  await page.addInitScript(()=>{localStorage.setItem('magenta-lab-intro-v2-ai-or-nay','1');localStorage.setItem('magenta-lab-lang','de');});
  await page.goto('http://127.0.0.1:'+port+urlPath);
  await page.locator('#guideTop').waitFor({state:'visible'});
  await page.locator('#guideDE').click();
  if(results){await page.locator('#guideDemo').click();if(await page.locator('#demoCasePicker').isVisible())await page.locator('#demoCasePicker [data-demo-case="it"]').click();const preview=await page.locator('[data-demo-confirm]').isVisible();if(preview&&results===true)await page.locator('[data-demo-confirm]').click();if(!preview||results===true){await page.locator('body.guideResults').waitFor();await page.waitForFunction(()=>window.latest?.results?.errors?.length===0);}}
  else await page.locator('#guidedRoot').waitFor({state:'visible'});
  await page.evaluate(async()=>{await document.fonts.ready;window.scrollTo(0,0);if(document.activeElement instanceof HTMLElement)document.activeElement.blur();});
  if(sensitivity){
   const panel=page.locator('#roiSensitivity');
   if(await page.locator('#roiSensitivityOpen').count()){
    await page.locator('#roiSensitivityOpen').click();await page.locator('#roiSensitivityDialog .ssTitle').waitFor({state:'visible'});
   }else if(await panel.count()){
    await panel.locator('summary').click();await panel.locator('.sensitivityRow').first().waitFor({state:'visible'});
    await panel.evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
   }else{
    await page.locator('#guideLeanResults').evaluate(el=>el.scrollIntoView({block:'end',behavior:'instant'}));
   }
  }
  return await page.screenshot({animations:'disabled',caret:'hide',scale:'css'});
 }finally{await ctx.close();}
}
async function compare(browser,before,after){
 const page=await browser.newPage();
 try{return await page.evaluate(async({a,b})=>{
  const load=async data=>{const img=new Image();img.src='data:image/png;base64,'+data;await img.decode();return img;};
  const [x,y]=await Promise.all([load(a),load(b)]);
  if(x.width!==y.width||x.height!==y.height)throw Error('Viewport mismatch');
  const w=x.width,h=x.height,c=document.createElement('canvas');c.width=w;c.height=h;const ctx=c.getContext('2d',{willReadFrequently:true});
  ctx.drawImage(x,0,0);const left=ctx.getImageData(0,0,w,h);ctx.drawImage(y,0,0);const right=ctx.getImageData(0,0,w,h);
  const out=ctx.createImageData(w,h);let changed=0;
  for(let i=0;i<left.data.length;i+=4){
   const delta=Math.max(...[0,1,2].map(j=>Math.abs(left.data[i+j]-right.data[i+j])));
   if(delta>32){changed++;out.data.set([220,25,100,255],i);}
   else{const gray=Math.round((right.data[i]+right.data[i+1]+right.data[i+2])/3*.35+166);out.data.set([gray,gray,gray,255],i);}
  }
  ctx.putImageData(out,0,0);return {percent:100*changed/(w*h),png:c.toDataURL('image/png').split(',')[1]};
 },{a:before.toString('base64'),b:after.toString('base64')});}finally{await page.close();}
}
(async()=>{
 await fs.mkdir(output,{recursive:true});
 let base,head,browser;
 try{
  base=await server(baseDir,8766);head=await server(headDir,8767);browser=await chromium.launch();
  const results=[];
  const hasSensitivity=await fs.access(path.join(headDir,'tools/ai-or-nay/roi-sensitivity.js')).then(()=>true,()=>false);
  const cases=hasSensitivity?[...scenarios,['desktop-sensitivity',1440,900,true,true],['mobile-sensitivity',390,844,true,true]]:scenarios;
  for(const [name,w,h,demo,sensitivity] of cases){
   const before=await capture(browser,8766,w,h,demo,sensitivity),after=await capture(browser,8767,w,h,demo,sensitivity),diff=await compare(browser,before,after);
   await Promise.all([fs.writeFile(path.join(output,name+'-before.png'),before),fs.writeFile(path.join(output,name+'-after.png'),after),fs.writeFile(path.join(output,name+'-diff.png'),Buffer.from(diff.png,'base64'))]);
   results.push({name,percent:diff.percent.toFixed(2),w,h});
  }
  const html='<!doctype html><meta charset="utf-8"><title>AI or Nay visual review</title><style>body{font:16px system-ui;margin:24px;color:#242126;background:#fafafa}section{margin:36px 0}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}figure{margin:0}img{width:100%;height:auto;border:1px solid #ccc}figcaption{font-weight:bold;margin:8px 0}</style><h1>AI or Nay: visueller PR-Vergleich</h1><p>Vorher = Zielbranch am PR-Basiscommit. Nachher = geplanter Merge-Stand. Magenta markiert Pixelabweichungen (RGB-Schwelle 32/255). Die Prozentzahl ist keine Qualitätsbewertung. Nur sichtbarer Viewport, kein automatisches Bestehen/Versagen.</p>'+results.map(r=>'<section><h2>'+r.name+' · '+r.percent+' % abweichende Pixel</h2><div class="grid">'+[['before','Vorher'],['after','Nachher'],['diff','Unterschiede']].map(([key,label])=>'<figure><figcaption>'+label+'</figcaption><a href="'+r.name+'-'+key+'.png"><img src="'+r.name+'-'+key+'.png"></a></figure>').join('')+'</div></section>').join('');
  await fs.writeFile(path.join(output,'index.html'),html);
  if(process.env.GITHUB_STEP_SUMMARY)await fs.appendFile(process.env.GITHUB_STEP_SUMMARY,'## Visueller PR-Vergleich\n\n| Ansicht | Abweichende Pixel |\n|---|---:|\n'+results.map(r=>'| '+r.name+' | '+r.percent+' % |').join('\n')+'\n\nArtefakt **ai-or-nay-visual-review** herunterladen, entpacken und index.html öffnen. Kein automatischer Designentscheid.\n');
 }finally{if(browser)await browser.close();if(base)base.kill();if(head)head.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});
