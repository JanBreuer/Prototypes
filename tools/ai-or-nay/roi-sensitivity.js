/* One-at-a-time sensitivity: the existing calculation engine evaluates immutable snapshots. */
(() => {
 'use strict';
 const finite=x=>typeof x==='number'&&Number.isFinite(x);
 const numeric=x=>x!==null&&x!==undefined&&x!==''&&Number.isFinite(Number(x))?Number(x):null;
 const tr=(de,en)=>window.appLanguage==='en'?en:de;
 const locale=()=>tr('de-DE','en-GB');
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
   add(['staff',i,'rate'],name+' · Vergütung',name+' · compensation',p.salaryType==='gross'?'€/yr':p.salaryType==='day'?'€/d':'€/h',field('role:'+p.id+':rate')+','+roleField(p.id,'rate'));
   if(s.timeMode==='staff')add(['staff',i,'amount'],name+' · Einsatz',name+' · allocation',p.salaryType==='hour'?'h/wk':'FTE',roleField(p.id,'amount'),{min:0.000001});
  });
  s.steps.forEach((t,i)=>{
   const name=t.name||tr('Task ','Task ')+(i+1), ai=aiStep(t);
   const step=(key,de,en,unit,opts={},quick='')=>add(['steps',i,key],name+' · '+de,name+' · '+en,unit,quick?field(quick)+','+stepField(t.id,key):stepField(t.id,key),opts);
   if(s.timeMode==='steps'){
    step('before','Ist-Zeit','Current effort','min',{max:240}); // exact field; quick editor couples before/future
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
 style.textContent='#roiSensitivity{border:1px solid #e8dce9;border-radius:12px;background:white;margin:16px 0;padding:14px;color:#54485b}#roiSensitivity>summary{cursor:pointer;font-weight:800;color:#61234c;font-size:14px}#roiSensitivity p{font-size:12px;line-height:1.45;margin:9px 0}#roiSensitivity label{display:block;font-size:12px;font-weight:700;margin:10px 0 5px}#roiSensitivity select{width:100%;padding:8px;border:1px solid #e8dce9;border-radius:8px;background:white;color:#54485b}#roiSensitivity .sensitivityRow{border-top:1px solid #eee5ee;padding:11px 0}#roiSensitivity .sensitivityHead{display:flex;gap:8px;align-items:center;justify-content:space-between}#roiSensitivity .sensitivityHead button{border:0;background:transparent;color:#b00065;font-weight:750;text-align:left;cursor:pointer;padding:4px 0;overflow-wrap:anywhere}#roiSensitivity .sensitivityHead small{white-space:nowrap;color:#756879}#roiSensitivity .sensitivityValues{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px;margin-top:8px}#roiSensitivity .sensitivityValue{background:#faf6fa;padding:8px;border-radius:7px;font-size:11px;overflow-wrap:anywhere}#roiSensitivity .sensitivityValue b{display:block;margin-bottom:4px;color:#54485b}#roiSensitivity .sensitivityValue span{display:block;line-height:1.5}#roiSensitivity .sensitivityMore{margin-top:8px;background:white;border:1px solid #e8dce9;padding:8px;border-radius:8px;color:#9c0059;cursor:pointer}@media print{#roiSensitivity{display:none!important}}';
 document.head.append(style);
 const panel=document.createElement('details');panel.id='roiSensitivity';panel.className='noPrint';panel.innerHTML='<summary></summary><div class="sensitivityContent"></div>';
 const lean=$id('guideLeanResults');if(!lean)return;lean.insertAdjacentElement('afterend',panel);
 const content=panel.querySelector('.sensitivityContent');
 let sort='roi',all=false,queued=false;
 function goto(c){
  const nodes=[...document.querySelectorAll(c.selector)];
  const quick=nodes.find(el=>el.closest('#guideQuick')&&!el.disabled);
  // Prefer a visible exact numeric input, otherwise the existing advanced control.
  const target=quick||nodes.find(el=>el.type==='number'&&!el.disabled)||nodes.find(el=>!el.disabled);
  if(!target)return false;
  for(let p=target.parentElement;p;p=p.parentElement)if(p.tagName==='DETAILS')p.open=true;
  target.scrollIntoView({block:'center',behavior:'smooth'});target.focus({preventScroll:true});
  return true;
 }
 const node=(tag,text,cls)=>{const n=document.createElement(tag);if(text!==undefined)n.textContent=text;if(cls)n.className=cls;return n;};
 function render(){
  panel.querySelector('summary').textContent=tr('Sensitivitätsanalyse · wirtschaftliche Hebel','Sensitivity analysis · economic drivers');
  if(!panel.open||!document.body.classList.contains('guideResults'))return;
  const view=window.roiSensitivityView?.()==='rules'?'rules':'ai';
  const data=analyze(serialize(),view);
  content.replaceChildren();
  content.append(node('p',tr('Isolierte Szenarien gegenüber heute: jeweils nur eine Eingabe wird verändert. Alle abhängigen Ergebnisse werden neu berechnet. Keine Änderung der Kundendaten. Leere und Nullwerte sind nicht relativ variierbar.','Isolated scenarios versus today: change only one input and recalculate all dependent results. Customer data stays unchanged. Blank and zero values cannot be varied relatively.')));
  if(!data.baseline){content.append(node('p',tr('Für dieses Szenario fehlen noch erforderliche Angaben oder ein KI-Schritt.','This scenario needs complete inputs or an AI step.')));return;}
  content.append(node('p',tr('Basis: ','Baseline: ')+(view==='rules'?tr('Regeln vs. heute','Rules vs. today'):tr('KI vs. heute','AI vs. today'))+' · ROI '+fmt(data.baseline.roi)+' % · '+tr('Nettonutzen ','Net value ')+money(data.baseline.net)+' · '+tr('Amortisation ','Payback ')+(finite(data.baseline.payback)?fmt(data.baseline.payback)+' '+tr('Mon.','mo') :tr('nicht erreicht','not reached'))));
  const label=node('label',tr('Rangfolge nach größter absoluter Abweichung','Rank by largest absolute deviation'));label.htmlFor='roiSensitivitySort';content.append(label);
  const select=node('select');select.id='roiSensitivitySort';
  for(const [key,name] of [['roi',tr('ROI (Prozentpunkte)','ROI (percentage points)')],['net',tr('Nettonutzen (€)','Net value (€)')],['payback',tr('Amortisationsdauer (Monate)','Payback period (months)')]]){const o=node('option',name);o.value=key;select.append(o);}
  select.value=sort;select.onchange=()=>{sort=select.value;render();};content.append(select);
  const rows=data.rows.slice().sort((a,b)=>{const x=score(a,sort,data.baseline),y=score(b,sort,data.baseline);return x===y?a.id.localeCompare(b.id):y>x?1:-1;});
  if(!rows.length){content.append(node('p',tr('Keine wirksamen relativen Änderungen der angegebenen Parameter.','No effective relative changes to the supplied parameters.')));return;}
  for(const [i,row] of rows.slice(0,all?rows.length:5).entries()){
   const wrap=node('div',undefined,'sensitivityRow'),head=node('div',undefined,'sensitivityHead');
   const title=node('button',(i+1)+'. '+tr(row.de,row.en)+' ↗');title.type='button';title.title=tr('Zur Eingabe springen','Go to input');title.onclick=()=>{if(!goto(row))title.title=tr('Eingabefeld ist in diesem Modus nicht verfügbar','Input is unavailable in this mode');};
   head.append(title,node('small',fmt(row.value)+' '+row.unit));wrap.append(head);
   const values=node('div',undefined,'sensitivityValues');
   for(const s of row.scenarios){
    const block=node('div',undefined,'sensitivityValue');
    const actual=Math.abs(s.actualPercent-s.percent)>1e-7?' ('+signed(s.actualPercent,1)+' % '+tr('effektiv','actual')+')':'';
    block.append(node('b',signed(s.percent,0)+' % → '+fmt(s.value)+' '+row.unit+actual));
    if(!s.result)block.append(node('span',tr('Ungültiges Szenario','Invalid scenario')));
    else{
     block.append(node('span','ROI: '+(finite(s.roi)?signed(s.roi)+' '+tr('PP','pp'):'—')));
     block.append(node('span',tr('Nettonutzen: ','Net value: ')+money(s.net)));
     let pb=finite(s.payback)?signed(s.payback)+' '+tr('Mon.','mo'):finite(s.result.payback)?fmt(s.result.payback)+' '+tr('Mon. (jetzt erreichbar)','mo (now achievable)'):tr('nicht erreicht','not reached');
     block.append(node('span',tr('Amortisation: ','Payback: ')+pb));
    }
    values.append(block);
   }
   wrap.append(values);content.append(wrap);
  }
  if(rows.length>5){const more=node('button',all?tr('Weniger anzeigen','Show fewer'):tr('Alle '+rows.length+' Hebel anzeigen','Show all '+rows.length+' drivers'),'sensitivityMore');more.type='button';more.onclick=()=>{all=!all;render();};content.append(more);}
  content.append(node('p',tr('Grenzen und Ganzzahlen können die effektive Variation einschränken. Die Rangfolge gilt nur für dieses Szenario; Wechselwirkungen zwischen mehreren Eingaben werden nicht separat getestet. Änderungen am Zeithorizont vergleichen unterschiedliche Zeiträume.','Bounds and integers can limit the effective variation. Rankings apply to this scenario only; interactions between multiple inputs are not separately tested. Horizon changes compare different periods.')));
 }
 const queue=()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;render();});}};
 panel.addEventListener('toggle',queue);
 const old=calculate;calculate=function(){const result=old.apply(this,arguments);queue();return result;};
 document.addEventListener('click',e=>{if(e.target.closest('#compareToday,#compareRules,#guideDE,#guideEN'))queue();});
 queue();
})();