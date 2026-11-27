/* One-at-a-time sensitivity: the existing calculation engine evaluates immutable snapshots. */
(() => {
 'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const numeric=x=>x!==null&&x!==undefined&&String(x).trim()!==''&&Number.isFinite(Number(x))?Number(x):null;
 const tr=(de,en)=>window.appLanguage==='en'?en:de;
 const locale=()=>tr('de-DE','en-GB');
 const unitLabel=u=>({ '€/mo':tr('€/Monat','€/month'),'€/yr':tr('€/Jahr','€/year'),'€/d':tr('€/Tag','€/day'),'h/wk':tr('h/Woche','h/week') }[u]||u);
 const fmt=(n,maximumFractionDigits=2)=>finite(n)?n.toLocaleString(locale(),{maximumFractionDigits}):'—';
 const signed=(n,d=2)=>finite(n)?(n>0?'+':'')+fmt(n,d):'—';
 const money=n=>finite(n)?(n>0?'+':'')+n.toLocaleString(locale(),{style:'currency',currency:'EUR',maximumFractionDigits:0}):'—';
 const copy=x=>JSON.parse(JSON.stringify(x));
 const $id=id=>document.getElementById(id);
 const field=(key)=>'[data-qfield="'+CSS.escape(key)+'"]';
 const input=(id)=>'#'+CSS.escape(id);
 const stepField=(id,key)=>'[data-exact-range="'+CSS.escape('step:'+id+':'+key)+'"],[data-step-id="'+CSS.escape(String(id))+'"][data-step-field="'+key+'"],[data-step-id="'+CSS.escape(String(id))+'"][data-qfield="'+key+'"]';
 const roleField=(id,key)=>'[data-staff-id="'+CSS.escape(String(id))+'"][data-staff-field="'+key+'"]';
 function metrics(snapshot,view){
  const r=calc(snapshot);
  if(view==='rules'){
   const rule=window.roiSensitivityRuleModel(r,snapshot);
   return rule.ready?{roi:rule.roi,net:rule.net,payback:rule.netMonth>0?rule.setup/rule.netMonth:null}:null;
  }
  if(r.errors.length||!r.hasAI)return null;
  return {roi:r.currentROI,net:r.currentNet,payback:r.currentPayback};
 }
 function candidates(s,view){
  const a=[],shared=s.inputs.portfolioMode==='shared',rules=view==='rules';
  const add=(path,de,en,unit,selector,opts={})=>{
   // Fixed baseline facts, not actionable levers: retain them in every calculation snapshot.
   if((path[0]==='steps'&&path[2]==='before')||(path[0]==='staff'&&path[2]==='rate'))return;
   const obj=path.slice(0,-1).reduce((o,k)=>o[k],s),key=path[path.length-1],value=numeric(obj[key]);
   if(value===null||value===0)return; // relative changes to zero are not informative
   const {min=0,max=Infinity,integer=false}=opts;
   if(value<min||value>max)return;
   a.push({path,id:path.join('.'),de,en,unit,selector,value,min,max,integer});
  };
  const global=(id,de,en,unit='€',opts={},quick='')=>add(['inputs',id],de,en,unit,quick?field(quick)+','+input(id):input(id),opts);
  const range=(id,de,en,unit,min,max,integer=false)=>add(['ranges',id],de,en,unit,field(id)+',[data-exact-range="'+id+'"]',{min,max,integer});
  const bound=(id,lower=0)=>{const el=$id(id);return {min:Math.max(lower,numeric(el?.min)??lower),max:numeric(el?.max)??Infinity};};
  global('volume','Vorgänge pro Monat','Cases per month',tr('Vorgänge','cases'),{min:1,integer:true},'volume');
  range('horizon','Betrachtungszeitraum','Time horizon',tr('Monate','months'),6,60,true);
  range('realization','Finanziell realisierbare Zeit','Financial realization','%',0,100);
  if(!rules){
   global('currentTechMonthly','Heutige Technologiekosten','Current technology costs','€/mo',{},'tech:current');
   global('remainingTechMonthly','Verbleibende Toolkosten','Retained technology costs','€/mo');
   if(s.inputs.includeExtra)global('cashExtra','Zusätzlicher finanzieller Nutzen','Additional financial benefit','€/mo');
   if(shared){
    global('portfolioSetup','Plattform-Einführung','Shared platform setup','€',{},'platform:setup');
    global('portfolioOpex','Plattform-Betrieb','Shared platform operations','€/mo',{},'platform:opex');
    if(s.inputs.portfolioAllocation==='custom')global('portfolioCustomShare','Eigener Plattform-Kostenanteil','Allocated platform share','%',{max:100});
    else global('portfolioCount','Anzahl Use Cases','Number of use cases','',{min:2,integer:true},'platform:count');
    global('caseSetupOverride','Zusätzliche eigene Einführung','Dedicated setup');
    global('caseOpexOverride','Zusätzlicher eigener Betrieb','Dedicated operations','€/mo');
   }else{
    if(s.costMode==='advanced'){
     for(const [id,de,en] of [['costDevelopment','Entwicklung','Development'],['costIntegration','Integration','Integration'],['costData','Datenaufbereitung','Data preparation'],['costTraining','Schulung','Training'],['costGovernance','Governance','Governance'],['costHosting','Hosting','Hosting'],['costLicense','Lizenzen','Licenses'],['costMaintenance','Wartung','Maintenance'],['costMonitoring','Monitoring','Monitoring'],['costOperations','Betrieb','Operations']])
      global(id,de,en,['costDevelopment','costIntegration','costData','costTraining','costGovernance'].includes(id)?'€':'€/mo');
    }else{
     global('integrations','Anzahl Schnittstellen','Number of integrations','',{integer:true},'single:integrations');
     global('dayRate','Tagessatz Einführung','Implementation day rate','€/d');
    }
    global('extraCoordDays','Zusätzliche Abstimmungstage','Additional coordination days',tr('Tage','days'));
    global('extraCoordRate','Tagessatz Abstimmung','Coordination day rate','€/d');
    global('extraDependencyOpex','Zusätzlicher Abhängigkeitsbetrieb','Additional dependency operations','€/mo');
   }
   if(s.steps.some(t=>aiStep(t)&&contractModel(t))&&(!shared||s.inputs.contractIncludedInPlatform==='no'))global('contractFee','Vertragspauschale','Flat contract fee','€/mo',{},'contract:fee');
   if(s.steps.some(t=>aiStep(t)&&!contractModel(t)))global('fx','Wechselkurs','Exchange rate','EUR/USD',bound('fx',0.000001));
  }else{
   global('rulesSetup','Regel-Einführung','Rules setup','€',{},'rules:setup');
   global('rulesOpex','Regelbetrieb','Rules operations','€/mo',{},'rules:opex');
   if(s.inputs.rulesSetup===''){
    global('integrations','Anzahl Schnittstellen','Number of integrations','',{integer:true},'single:integrations');
    global('dayRate','Tagessatz Einführung','Implementation day rate','€/d');
   }
  }
  if(s.staff.some(t=>t.salaryType==='gross'||(s.timeMode==='staff'&&t.salaryType!=='hour')))global('fulltime','Vollzeitstunden','Full-time hours','h',bound('fulltime',1));
  if(s.staff.some(t=>t.salaryType==='day'))global('dayHours','Stunden pro Arbeitstag','Hours per working day','h',bound('dayHours',1));
  if(s.staff.some(t=>t.salaryType==='gross'))global('grossLoad','Lohnnebenkosten','Employer overhead','%',bound('grossLoad'));
  s.staff.forEach((p,i)=>{
   if(!s.steps.some(t=>String(t.role)===String(p.id)))return;
   const name=p.name||tr('Rolle ','Role ')+(i+1);
   if(s.timeMode==='staff')add(['staff',i,'amount'],name+' · Einsatz',name+' · allocation',p.salaryType==='hour'?'h/wk':'FTE',field('role:'+p.id+':amount')+','+roleField(p.id,'amount'),{min:0.000001});
  });
  s.steps.forEach((t,i)=>{
   const name=t.name||tr('Task ','Task ')+(i+1), ai=aiStep(t);
   const step=(key,de,en,unit,opts={},quick='')=>add(['steps',i,key],name+' · '+de,name+' · '+en,unit,quick?field(quick)+','+stepField(t.id,key):stepField(t.id,key),opts);
   if(s.timeMode==='steps'){
    step('errorRate','Fehlerquote heute','Current error rate','%',{max:100});
    step('rework','Nacharbeit heute','Current rework','min',{max:120});
   }else if(s.steps.filter(x=>String(x.role)===String(t.role)).length>1)step('effortShare','Zeitanteil','Effort share','%',{max:100});
   if(rules||t.mode==='rules'){
    if(s.timeMode==='steps'||rules)step('rules','Restzeit mit Regeln','Remaining effort with rules','min',{max:240},rules?'rules:step:'+t.id:'');
    else step('rulesSavedPct','Zeitersparnis mit Regeln','Rules time saving','%',{max:100});
   }
   if(!rules&&ai){
    step('share','KI-Nutzungsanteil','AI coverage','%',{max:100});
    if(s.timeMode==='staff')step('savedPct','KI-Zeitersparnis','AI time saving','%',{max:100});
    else step('future','Restzeit mit KI','Remaining effort with AI','min',{max:240});
    step('aiError','KI-Fehlerquote','AI error rate','%',{max:100});
    step('aiRework','KI-Nacharbeit','AI rework','min',{max:120});
    if(!contractModel(t)){
     step('inputTokens','Input-Token','Input tokens','',{integer:true});
     step('outputTokens','Output-Token','Output tokens','',{integer:true});
     step('calls','Modellaufrufe','Model calls','',{integer:true});
    }
   }
   if(!rules&&(ai||t.mode==='rules')){
    step('depRate','Störungsquote','Disruption rate','%',{max:100});
    step('depMinutes','Aufwand je Störung','Effort per disruption','min');
   }
  });
  return a;
 }
 function vary(c,percent){
  let raw=c.value*(1+percent/100);
  if(c.integer)raw=Math.round(raw);
  return Math.max(c.min,Math.min(c.max,+raw.toPrecision(12)));
 }
 function analyze(snapshot,view='ai'){
  const baseline=metrics(snapshot,view);
  if(!baseline)return {baseline:null,rows:[]};
  const delta=(a,b)=>finite(a)&&finite(b)?a-b:null;
  const rows=candidates(snapshot,view).map(c=>{
   const scenarios=[-20,-10,10,20].map(percent=>{
    const value=vary(c,percent),s=copy(snapshot);
    const owner=c.path.slice(0,-1).reduce((o,k)=>o[k],s),key=c.path[c.path.length-1];
    owner[key]=typeof owner[key]==='string'?String(value):value;
    const result=value===c.value?baseline:metrics(s,view);
    return {percent,value,actualPercent:(value/c.value-1)*100,result,roi:delta(result?.roi,baseline.roi),net:delta(result?.net,baseline.net),payback:delta(result?.payback,baseline.payback)};
   });
   return {...c,scenarios};
  }).filter(row=>row.scenarios.some(s=>['roi','net','payback'].some(k=>finite(s[k])&&Math.abs(s[k])>1e-8)||(s.result&&['roi','payback'].some(k=>finite(s.result[k])!==finite(baseline[k])))));
  return {baseline,rows};
 }
 // Rank by maximum absolute deviation from baseline, not by an assumed linear slope.
 function score(row,key,baseline){
  if(key==='payback'&&row.scenarios.some(s=>s.result&&finite(s.result.payback)!==finite(baseline.payback)))return Infinity;
  return Math.max(0,...row.scenarios.map(s=>finite(s[key])?Math.abs(s[key]):0));
 }
 window.roiSensitivityAnalyze=analyze;
 window.roiSensitivityScore=score;
 const style=document.createElement('style');
 style.textContent="#roiSensitivity{display:none;margin:8px 0 12px}\nbody.guideResults #roiSensitivity{display:block}\n#roiSensitivityOpen{width:100%;display:flex;align-items:center;justify-content:space-between;gap:12px;text-align:left;background:#fff;color:#9c0059;border:1px solid #e8c9df;border-radius:12px;padding:12px 14px;cursor:pointer;font:inherit}\n#roiSensitivityOpen strong{font-size:14px;display:block}#roiSensitivityOpen small{font-size:11px;color:#756879;display:block;margin-top:3px}\n#roiSensitivityDialog{box-sizing:border-box;width:min(760px,calc(100vw - 32px));max-width:none;max-height:calc(100dvh - 32px);padding:0;border:0;border-radius:20px;background:#fff;color:#30243a;box-shadow:0 16px 80px #30162b44;overflow:auto}\n#roiSensitivityDialog::backdrop{background:#24182c88;backdrop-filter:blur(3px)}\n#roiSensitivityDialog *{box-sizing:border-box}\n#roiSensitivityDialog .ssShell{padding:24px 28px;display:grid;gap:16px}\n#roiSensitivityDialog button{font:inherit;cursor:pointer;min-width:0}\n#roiSensitivityDialog button:focus-visible{outline:2px solid #e20074;outline-offset:3px}\n#roiSensitivityDialog .ssHeader,#roiSensitivityDialog .ssFooter,#roiSensitivityDialog .ssMetric,#roiSensitivityDialog .ssMeta{display:flex;align-items:center;justify-content:space-between;gap:10px}\n#roiSensitivityDialog .ssHeader h2{font-size:17px;margin:0;font-weight:800}\n#roiSensitivityDialog .ssClose{border:0;background:#f4eff4;border-radius:50%;width:36px;height:36px;font-size:24px;line-height:1;color:#57425a;flex:none}\n#roiSensitivityDialog .ssTabs{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}\n#roiSensitivityDialog .ssTabs button{border:0;border-top:4px solid #e4dae5;background:transparent;color:#766a7d;text-align:left;font-size:10px;padding:6px 2px 2px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}\n#roiSensitivityDialog .ssTabs button[aria-current=\"step\"]{border-color:#e20074;color:#9c0059;font-weight:800}\n#roiSensitivityDialog .ssTabs button:disabled{cursor:default;opacity:.45}\n#roiSensitivityDialog .ssMetric{justify-content:flex-start;flex-wrap:wrap;font-size:11px;color:#776a7d}\n#roiSensitivityDialog .ssMetric button{border:1px solid #e7dce8;border-radius:20px;background:white;color:#65556b;padding:7px 11px;font-size:11px;font-weight:650}\n#roiSensitivityDialog .ssMetric button[aria-pressed=\"true\"]{background:#fce7f2;border-color:#e9b6d6;color:#a50059}\n#roiSensitivityDialog .ssMetric button:disabled{opacity:.45}\n#roiSensitivityDialog .ssMeta{font-size:11px;color:#756879}\n#roiSensitivityDialog .ssTitle{font-size:clamp(20px,3.6vw,29px);line-height:1.15;letter-spacing:-.02em;margin:2px 0 5px;overflow-wrap:anywhere}\n#roiSensitivityDialog .ssSub{font-size:12px;color:#756879;margin:0;line-height:1.4}\n#roiSensitivityDialog .ssChart{border:1px solid #eee5ee;border-radius:14px;padding:14px;display:grid;gap:8px}\n#roiSensitivityDialog .ssChartHead{display:flex;justify-content:space-between;align-items:baseline;gap:6px;font-size:11px;color:#756879}\n#roiSensitivityDialog .ssChartHead strong{font-size:12px;color:#3c2b42}\n#roiSensitivityDialog .ssScenarios{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px}\n#roiSensitivityDialog .ssScenario{background:#fff;border:1px solid transparent;border-radius:9px;padding:6px 3px;display:grid;gap:4px;justify-items:center;text-align:center;color:#51425a}\n#roiSensitivityDialog .ssScenario[aria-pressed=\"true\"]{background:#fdf3f9;border-color:#eac2dc}\n#roiSensitivityDialog .ssScenario strong{font-size:clamp(12px,2vw,17px);font-variant-numeric:tabular-nums;overflow-wrap:anywhere;max-width:100%}\n#roiSensitivityDialog .ssScenario small{font-size:10px;color:#756879;max-width:100%;overflow-wrap:anywhere}\n#roiSensitivityDialog .ssPlot{height:104px;position:relative;width:100%;background:linear-gradient(to bottom,transparent 49.5%,#c7bacb 49.5%,#c7bacb 50.5%,transparent 50.5%)}\n#roiSensitivityDialog .ssBar{position:absolute;left:calc(50% - 12px);width:24px;border-radius:4px;background:#24816d}\n#roiSensitivityDialog .ssBad{color:#a3324c}#roiSensitivityDialog .ssGood{color:#146c59}#roiSensitivityDialog .ssBar.ssBad{background:#b64b63}\n#roiSensitivityDialog .ssKPIs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}\n#roiSensitivityDialog .ssKPI{padding:10px;background:#f8f5f8;border-radius:10px;min-width:0}\n#roiSensitivityDialog .ssKPI small{display:block;font-size:10px;color:#756879}\n#roiSensitivityDialog .ssKPI strong{display:block;font-size:clamp(13px,2.6vw,21px);line-height:1.25;margin-top:4px;overflow-wrap:anywhere;font-variant-numeric:tabular-nums}\n#roiSensitivityDialog .ssKPI span{display:block;font-size:10px;color:#756879;margin-top:4px;overflow-wrap:anywhere}\n#roiSensitivityDialog .ssFooter{flex-wrap:wrap}\n#roiSensitivityDialog .ssNav{display:flex;gap:8px;align-items:center;margin-left:auto}\n#roiSensitivityDialog .ssNav button,#roiSensitivityDialog .ssJump{border:1px solid #e6d9e6;border-radius:9px;background:white;color:#8c0053;padding:10px 13px;font-size:12px;font-weight:700}\n#roiSensitivityDialog .ssNav button:disabled{opacity:.4;cursor:default}\n#roiSensitivityDialog .ssNav .ssNext{background:#e20074;color:white;border-color:#e20074}\n#roiSensitivityDialog .ssNote{margin:0;color:#756879;font-size:10px;line-height:1.4}\n@media(max-width:540px){#roiSensitivityDialog{width:calc(100vw - 16px);max-height:calc(100dvh - 16px);border-radius:15px}#roiSensitivityDialog .ssShell{padding:16px;gap:12px}#roiSensitivityDialog .ssChart{padding:9px}#roiSensitivityDialog .ssKPI{padding:8px 6px}#roiSensitivityDialog .ssPlot{height:84px}#roiSensitivityDialog .ssTabs button{font-size:10px}#roiSensitivityDialog .ssFooter{gap:6px}#roiSensitivityDialog .ssNav button,#roiSensitivityDialog .ssJump{padding:9px;font-size:11px}}\n@media print{#roiSensitivity,#roiSensitivityDialog{display:none!important}}\n/* Keep the modal independent of the surrounding results layout. */\n#roiSensitivityDialog{position:fixed;inset:0;margin:auto;line-height:1.4}\n#roiSensitivityDialog .ssShell{grid-template-columns:minmax(0,1fr);gap:14px}\n#roiSensitivityDialog .ssTabs{grid-template-columns:repeat(var(--ss-tabs,5),minmax(0,1fr));gap:8px;align-items:stretch}\n#roiSensitivityDialog .ssTabs button{display:flex;flex-direction:column;align-items:flex-start;justify-content:flex-start;gap:3px;min-width:0;min-height:66px;padding:9px 7px 8px;border:0;border-top:3px solid #e2d9e4;border-radius:0 0 8px 8px;background:#faf8fa;text-align:left;white-space:normal;overflow:hidden;box-shadow:none;line-height:1.2}\n#roiSensitivityDialog .ssTabs button[aria-current=\"step\"]{border-top-color:#e20074;background:#fdf0f7}\n#roiSensitivityDialog .ssTabName{font-size:11px;font-weight:750;overflow-wrap:anywhere;hyphens:auto;display:block}\n#roiSensitivityDialog .ssTabContext{color:#786a7d;font-size:10px;line-height:1.15;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:block}\n#roiSensitivityDialog .ssTabRank{font-size:9px;color:#88778b;font-weight:650}\n#roiSensitivityDialog .ssTabs button[aria-current=\"step\"] .ssTabRank{color:#a50059}\n#roiSensitivityDialog .ssMeta{padding-top:2px}\n#roiSensitivityDialog .ssTitle{margin:0 0 4px}\n#roiSensitivityDialog .ssChartHead{align-items:center;min-height:24px}\n#roiSensitivityDialog .ssScenario{grid-template-rows:32px 104px 24px 32px 16px;align-items:center;align-content:start;min-width:0;padding:7px 4px 3px;gap:3px;box-shadow:none;line-height:1.2}\n#roiSensitivityDialog .ssScenario strong:first-child{align-self:end}\n#roiSensitivityDialog .ssScenario small{align-self:start}\n#roiSensitivityDialog .ssScenario .ssPlot{height:104px;align-self:stretch}\n#roiSensitivityDialog .ssKPIs{align-items:stretch}\n#roiSensitivityDialog .ssKPI{display:grid;grid-template-rows:auto 1fr auto;gap:4px}\n#roiSensitivityDialog .ssKPI strong,#roiSensitivityDialog .ssKPI span{margin:0}\n#roiSensitivityDialog .ssNav button,#roiSensitivityDialog .ssJump{min-height:40px;box-shadow:none}\n#roiSensitivityDialog .ssClose{padding:0;display:grid;place-items:center;box-shadow:none}\n@media(max-width:540px){\n#roiSensitivityDialog .ssShell{padding:14px;gap:11px}\n#roiSensitivityDialog .ssTabs{gap:4px}\n#roiSensitivityDialog .ssTabs button{min-height:70px;padding:7px 4px 5px;gap:3px}\n#roiSensitivityDialog .ssTabName{font-size:10px}\n#roiSensitivityDialog .ssTabContext{font-size:9px}\n#roiSensitivityDialog .ssScenario{grid-template-rows:32px 84px 22px 30px 16px;padding:5px 2px 2px;gap:2px}\n#roiSensitivityDialog .ssScenario .ssPlot{height:84px}\n#roiSensitivityDialog .ssMetric{gap:5px}\n#roiSensitivityDialog .ssMetric button{padding:6px 8px}\n#roiSensitivityDialog .ssFooter{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}\n#roiSensitivityDialog .ssNav{gap:5px}\n#roiSensitivityDialog .ssJump{white-space:normal;text-align:left}\n}\n\n#roiSensitivityDialog .ssFixedBaseline{margin:0;color:#756879;font-size:11px;line-height:1.4;padding-left:10px;border-left:2px solid #e6d9e6}\n";
 document.head.append(style);

 const panel=document.createElement('div');panel.id='roiSensitivity';panel.className='noPrint';
 const lean=$id('guideLeanResults');if(!lean)return;lean.insertAdjacentElement('beforebegin',panel);
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 const btn=(text,cls,fn)=>{const b=node('button',text,cls);b.type='button';b.onclick=fn;return b;};
 const launch=btn('', '',()=>{index=0;chosen=null;render();dialog.showModal();dialog.querySelector('.ssClose')?.focus();});launch.id='roiSensitivityOpen';launch.setAttribute('aria-haspopup','dialog');panel.append(launch);
 const dialog=node('dialog');dialog.id='roiSensitivityDialog';dialog.className='noPrint';dialog.setAttribute('aria-labelledby','roiSensitivityTitle');document.body.append(dialog);
 const content=node('div',undefined,'ssShell');dialog.append(content);
 let sort='roi',index=0,chosen=null,queued=false;
 function targetFor(c){
  const nodes=[...document.querySelectorAll(c.selector)];
  const quick=nodes.find(el=>el.closest('#guideQuick')&&!el.disabled);
  return quick||nodes.find(el=>el.type==='number'&&!el.disabled)||nodes.find(el=>!el.disabled);
 }
 function goto(c){
  const target=targetFor(c);if(!target)return;
  dialog.close();
  for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
  target.scrollIntoView({block:'center',behavior:'smooth'});target.focus({preventScroll:true});
 }
 const effect=(scenario,key)=>finite(scenario[key])?(key==='payback'?-scenario[key]:scenario[key]):null;
 const metricLabel=key=>key==='roi'?'ROI':key==='net'?tr('Nettonutzen','Net value'):tr('Amortisation','Payback');
 const absValue=(n,key)=>!finite(n)?(key==='payback'?tr('Nicht erreicht','Unreachable'):'—'):key==='net'?n.toLocaleString(locale(),{style:'currency',currency:'EUR',maximumFractionDigits:0}):fmt(n)+' '+(key==='roi'?'%':tr('Mon.','mo'));
 function deltaValue(s,key,baseline){
  if(!s.result)return '—';
  if(key==='payback'&&!finite(s.result.payback))return tr('Nicht erreicht','Unreachable');
  if(key==='payback'&&!finite(baseline.payback))return absValue(s.result.payback,key);
  if(!finite(s[key]))return '—';
  return key==='net'?money(s.net):signed(s[key])+' '+(key==='roi'?tr('PP','pp'):tr('Mon.','mo'));
 }
 const changeLabel=s=>signed(s.actualPercent,1)+' %';
 const metricClass=(s,key,base)=>{
  if(key==='payback'&&s.result&&finite(s.result.payback)!==finite(base.payback))return finite(s.result.payback)?'ssGood':'ssBad';
  return effect(s,key)>0?'ssGood':effect(s,key)<0?'ssBad':'';
 };
 const shortTab=(r,param)=>{
  const key=r.path[r.path.length-1];
  const names={volume:['Volumen','Volume'],horizon:['Zeithorizont','Time horizon'],realization:['Realisierung','Realization'],before:['Ist-Zeit','Current time'],future:['KI-Restzeit','AI time'],rate:['Vergütung','Pay rate'],amount:['Einsatz','Allocation'],share:['KI-Anteil','AI coverage'],savedPct:['KI-Ersparnis','AI savings'],rulesSavedPct:['Regel-Ersparnis','Rules savings'],rules:['Regel-Restzeit','Rules time'],errorRate:['Ist-Fehler','Current errors'],aiError:['KI-Fehler','AI errors'],rework:['Ist-Nacharbeit','Current rework'],aiRework:['KI-Nacharbeit','AI rework'],effortShare:['Zeitanteil','Effort share'],currentTechMonthly:['Ist-IT-Kosten','Current IT costs'],remainingTechMonthly:['Rest-IT-Kosten','Retained IT costs'],cashExtra:['Zusatznutzen','Extra benefit'],portfolioSetup:['Plattform-Setup','Platform setup'],portfolioOpex:['Plattform-Betrieb','Platform ops'],portfolioCustomShare:['Kostenanteil','Cost share'],portfolioCount:['Use Cases','Use cases'],caseSetupOverride:['Zusatz-Setup','Extra setup'],caseOpexOverride:['Zusatzbetrieb','Extra ops'],extraCoordDays:['Abstimmung','Coordination'],extraCoordRate:['Abstimmungsrate','Coordination rate'],extraDependencyOpex:['Abhängigkeiten','Dependencies'],contractFee:['Vertrag','Contract'],dayRate:['Tagessatz','Day rate'],rulesSetup:['Regel-Setup','Rules setup'],rulesOpex:['Regelbetrieb','Rules ops'],fulltime:['Vollzeit','Full-time'],dayHours:['Tagesstunden','Day hours'],grossLoad:['Lohnnebenkosten','Employer costs'],depRate:['Störungsquote','Disruption rate'],depMinutes:['Störungsdauer','Disruption time']};
  return Object.hasOwn(names,key)?tr(...names[key]):param;
 };
 function go(n,focus){index=n;chosen=null;render();dialog.querySelector(focus||'.ssTitle')?.focus({preventScroll:true});}
 function render(){
  launch.replaceChildren();
  const label=node('span');label.append(node('strong',tr('Sensitivitätsanalyse','Sensitivity analysis')),node('small',tr('Die wichtigsten steuerbaren Hebel entdecken','Explore the most important actionable drivers')));launch.append(label,node('span','↗'));
  const view=window.roiSensitivityView?.()==='rules'?'rules':'ai';
  const data=analyze(serialize(),view);
  content.replaceChildren();
  const header=node('div',undefined,'ssHeader'),heading=node('h2',tr('Sensitivitätsanalyse','Sensitivity analysis'));heading.id='roiSensitivityTitle';
  const close=btn('×','ssClose',()=>dialog.close());close.setAttribute('aria-label',tr('Schließen','Close'));header.append(heading,close);content.append(header);
  const fixed=node('p',tr('Ist-Bearbeitungszeit und aktuelle Vergütung bleiben als feste Ausgangswerte in der Rechnung. Sie sind keine kurzfristig steuerbaren Hebel und werden nicht variiert.','Current processing time and compensation remain fixed baseline values in the calculation. They are not short-term actionable drivers and are not varied.'),'ssFixedBaseline');content.append(fixed);
  if(!data.baseline){content.append(node('p',tr('Für diese Analyse fehlen noch notwendige Eingaben.','This analysis needs additional inputs.')));return;}
  if(sort==='roi'&&!finite(data.baseline.roi))sort='net';
  const rows=data.rows.slice().sort((a,b)=>{const x=score(a,sort,data.baseline),y=score(b,sort,data.baseline);return x===y?a.id.localeCompare(b.id):y>x?1:-1;}).filter(r=>score(r,sort,data.baseline)>1e-8);
  index=Math.max(0,Math.min(index,rows.length-1));
  const group=Math.floor(index/5)*5;
  const tabs=node('nav',undefined,'ssTabs');tabs.setAttribute('aria-label',tr('Wirtschaftliche Hebel','Economic drivers'));
  const tabCount=Math.min(5,Math.max(0,rows.length-group));tabs.style.setProperty('--ss-tabs',String(Math.max(1,tabCount)));
  tabs.lang=tr('de','en');
  for(let j=0;j<tabCount;j++){
   const n=group+j,r=rows[n],full=tr(r.de,r.en);
   // Role/step labels already have a context and a parameter. Split at the final separator only.
   const cut=full.lastIndexOf(' · '),context=cut<0?'':full.slice(0,cut),param=cut<0?full:full.slice(cut+3);
   const short=shortTab(r,param);
   const tab=btn('', '',()=>go(n,'.ssTabs [aria-current="step"]'));
   tab.title=full;tab.setAttribute('aria-label',String(n+1)+'. '+full);
   tab.append(node('span',String(n+1),'ssTabRank'),node('span',short,'ssTabName'));
   if(context)tab.append(node('span',context,'ssTabContext'));
   if(n===index)tab.setAttribute('aria-current','step');tabs.append(tab);
  }
  content.append(tabs);
  const metric=node('div',undefined,'ssMetric');metric.append(node('span',tr('Sortieren nach','Rank by')));
  for(const key of ['roi','net','payback']){const b=btn(metricLabel(key),'',()=>{sort=key;go(0,'.ssMetric [aria-pressed="true"]');});b.dataset.metric=key;b.disabled=key==='roi'&&!finite(data.baseline.roi);b.setAttribute('aria-pressed',String(key===sort));metric.append(b);}content.append(metric);
  if(!rows.length){content.append(node('p',tr('Keine wirksamen relativen Änderungen für diese Kennzahl.','No effective relative changes for this metric.')));return;}
  const row=rows[index],base=data.baseline;
  const valid=row.scenarios.filter(s=>s.result);
  const transition=s=>sort==='payback'&&s.result&&finite(s.result.payback)!==finite(base.payback);
  const strongest=valid.slice().sort((a,b)=>(Number(transition(b))-Number(transition(a)))||Math.abs(effect(b,sort)??0)-Math.abs(effect(a,sort)??0))[0];
  if(chosen===null||!row.scenarios.some(s=>s.percent===chosen))chosen=strongest?.percent??20;
  const selected=row.scenarios.find(s=>s.percent===chosen);
  const meta=node('div',undefined,'ssMeta');meta.append(node('span',tr('Hebel ','Driver ')+(index+1)+' / '+rows.length),node('span',view==='rules'?tr('Regeln vs. heute','Rules vs. today'):tr('KI vs. heute','AI vs. today')));content.append(meta);
  const title=node('div');const h=node('h3',tr(row.de,row.en),'ssTitle');h.tabIndex=-1;title.append(h,node('p',tr('Aktueller Wert: ','Current value: ')+fmt(row.value)+' '+unitLabel(row.unit),'ssSub'));content.append(title);
  const chart=node('div',undefined,'ssChart'),chartHead=node('div',undefined,'ssChartHead');
  chartHead.append(node('strong',tr('Auswirkung auf ','Impact on ')+metricLabel(sort)),node('span',tr('Basis: ','Base: ')+absValue(base[sort],sort)));chart.append(chartHead);
  const scenarios=node('div',undefined,'ssScenarios'),scale=Math.max(1e-10,...row.scenarios.map(s=>Math.abs(effect(s,sort)??0)));
  for(const s of row.scenarios){
   const b=btn('', 'ssScenario',()=>{chosen=s.percent;render();dialog.querySelector('[data-scenario="'+s.percent+'"]')?.focus({preventScroll:true});});b.dataset.scenario=s.percent;b.setAttribute('aria-pressed',String(s.percent===chosen));b.setAttribute('aria-label',signed(s.percent,0)+' %: '+deltaValue(s,sort,base));
   const plot=node('div',undefined,'ssPlot');plot.setAttribute('aria-hidden','true');
   const e=effect(s,sort);
   if(e!==null&&Math.abs(e)>1e-10){const bar=node('div',undefined,'ssBar '+(e<0?'ssBad':''));bar.style.height=(Math.abs(e)/scale*45)+'%';if(e>0)bar.style.bottom='50%';else bar.style.top='50%';plot.append(bar);}
   b.append(node('strong',deltaValue(s,sort,base),metricClass(s,sort,base)),plot,node('strong',signed(s.percent,0)+' %'),node('small',fmt(s.value)+' '+unitLabel(row.unit)));
   b.append(node('small',Math.abs(s.actualPercent-s.percent)>1e-7?changeLabel(s)+' '+tr('effektiv','actual'):''));
   scenarios.append(b);
  }
  chart.append(scenarios);content.append(chart);
  const chosenLine=node('p',tr('Bei ','At ')+changeLabel(selected)+' '+tr('Eingabeveränderung:','input change:')+' '+fmt(row.value)+' → '+fmt(selected.value)+' '+unitLabel(row.unit),'ssSub');content.append(chosenLine);
  const kpis=node('div',undefined,'ssKPIs');
  for(const key of ['roi','net','payback']){
   const k=node('div',undefined,'ssKPI');k.append(node('small',metricLabel(key)),node('strong',deltaValue(selected,key,base),metricClass(selected,key,base)),node('span',tr('Neu: ','New: ')+(selected.result?absValue(selected.result[key],key):'—')));kpis.append(k);
  }content.append(kpis);
  const footer=node('div',undefined,'ssFooter'),jump=btn(tr('↗ Eingabe anpassen','↗ Edit input'),'ssJump',()=>goto(row));jump.dataset.sensitivityId=row.id;jump.disabled=!targetFor(row);footer.append(jump);
  const nav=node('div',undefined,'ssNav'),prev=btn(tr('← Zurück','← Back'),'ssPrev',()=>go(index-1,'.ssPrev'));prev.disabled=index===0;nav.append(prev);
  const next=btn(index===rows.length-1?tr('Fertig','Done'):index%5===4?tr('Weitere Hebel →','More drivers →'):tr('Weiter →','Next →'),'ssNext',()=>{if(index===rows.length-1)dialog.close();else go(index+1,'.ssNext');});nav.append(next);footer.append(nav);content.append(footer);
  content.append(node('p',tr('Jeweils eine Eingabe variiert, alle anderen konstant. Balken zeigen Verbesserung bzw. Verschlechterung; Auswahl zeigt alle drei Kennzahlen. Nullwerte und Wechselwirkungen nicht getestet. Zeiträume können abweichen.','One input varies at a time; all others stay constant. Bars show improvement or worsening; selection shows all three metrics. Zero values and interactions are not tested. Time horizons may differ.'),'ssNote'));
 }
 function refresh(){
  const label=node('span');label.append(node('strong',tr('Sensitivitätsanalyse','Sensitivity analysis')),node('small',tr('Die wichtigsten steuerbaren Hebel entdecken','Explore the most important actionable drivers')));launch.replaceChildren(label,node('span','↗'));
  if(dialog.open)render();
 }
 dialog.addEventListener('close',()=>{if(document.activeElement===document.body)launch.focus();});
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 const queue=()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;refresh();});}};
 const old=calculate;calculate=function(){const result=old.apply(this,arguments);queue();return result;};
 document.addEventListener('click',e=>{if(e.target.closest('#compareToday,#compareRules,#guideDE,#guideEN'))queue();});
 refresh();
})();