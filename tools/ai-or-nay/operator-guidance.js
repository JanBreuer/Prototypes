/* Optional operator support; never writes scenario values or calls the calculation engine. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const en = () => window.appLanguage === 'en';
const t = (de, eng) => en() ? eng : de;
const chapters = [
 ['ROI-Hebel','ROI drivers','Volumen, aktive Minuten je Vorgang, Vollkostensatz, KI-Abdeckung und finanzielle Realisierung bestimmen den bewerteten Zeitnutzen. Setup, Betrieb und API-Kosten reduzieren den Nettonutzen. Der Horizont beeinflusst, wie lange laufende Effekte wirken.','Volume, active minutes per case, fully loaded labor rate, AI coverage and financial realization determine the valued time benefit. Setup, operations and API costs reduce net value. The horizon controls how long recurring effects accumulate.','Teste jeweils einen Hebel bei unveränderten übrigen Annahmen. Die wichtigsten Hebel sind vom konkreten Case abhängig.','Vary one driver at a time, holding others constant. The most important drivers depend on the case.'],
 ['Plausible Annahmen','Plausible assumptions','Beginne mit repräsentativen Stichproben, Prozessdaten und realen Kostensätzen. Nutze Pilotmessungen für KI-Restzeit einschließlich Review und tatsächliche Abdeckung. Dokumentiere Quelle, Zeitraum und Bandbreite.','Start with representative samples, process data and actual labor rates. Use pilot measurements for remaining human time including review, and actual coverage. Document source, period and range.','Zeige ein konservatives, ein mittleres und ein optimistisches Szenario. Demo-Werte und Tool-Standards sind keine Benchmarks.','Show conservative, central and optimistic scenarios. Demo values and tool defaults are not benchmarks.'],
 ['Typische Eingabefehler','Common input errors','Verwechsle weder Jahres- mit Monatsvolumen noch Stunden mit Minuten. Zähle Wartezeit, Review, Fehlerkorrektur oder Plattformkosten nicht doppelt. Unbekannt bedeutet nicht null. 100 % KI-Abdeckung bedeutet nicht 100 % Zeitersparnis.','Do not confuse annual with monthly volume or hours with minutes. Do not double-count waiting time, review, rework or platform costs. Unknown does not mean zero. 100% coverage does not mean 100% time saved.','Prüfe außerdem, ob Restaufwand, höhere Qualitätsanforderungen, Lizenzen und Integrationen vollständig abgebildet sind.','Also check remaining effort, higher quality expectations, licenses and integrations.'],
 ['Nutzen unterscheiden','Distinguish benefits','Finanzieller Nutzen: tatsächlich vermiedene Ausgaben oder belastbar monetarisierter Mehrwert. Produktivität: frei werdende Stunden, mehr Durchsatz oder bessere Qualität bei gleicher Belegschaft. Strategischer Nutzen: z. B. Skalierbarkeit, Resilienz oder Kundenerlebnis.','Financial benefit: actually avoided spending or credibly monetized incremental value. Productivity: freed hours, greater throughput or better quality with the same workforce. Strategic benefit: e.g. scalability, resilience or customer experience.','Freie Kapazität nicht automatisch als Cashflow zählen. Nicht monetarisierte Vorteile separat mit eigenen KPIs dokumentieren; keine Doppelzählung.','Do not automatically count freed capacity as cash flow. Track non-monetized benefits separately using their own KPIs; avoid double-counting.'],
 ['Negativen ROI einordnen','Interpret negative ROI','Ein negativer ROI bedeutet, dass der modellierte finanzielle Nutzen im gewählten Zeitraum die relevanten Kosten nicht deckt. Prüfe Datenqualität, Sensitivität, Kostenstruktur und eine regelbasierte Alternative. Ein negativer Case kann eine richtige Entscheidung gegen KI sein.','Negative ROI means modeled financial benefits do not cover relevant costs over the selected horizon. Check data quality, sensitivity, cost structure and a rules-based alternative. A negative case can correctly indicate a decision against AI.','Strategische Gründe können einen Pilot rechtfertigen, aber nicht nachträglich den finanziellen ROI schönrechnen. Vereinbare messbare Erfolgskriterien.','Strategic reasons may justify a pilot but do not retrospectively make financial ROI positive. Agree measurable success criteria.'],
 ['Mini-Sensitivitätsübung','Mini sensitivity exercise','Fiktiver Prozess: 1.000 Vorgänge/Monat, 10 Minuten Zeitersparnis je KI-bearbeitetem Vorgang, 60 €/h, 2.000 € monatlicher KI-Betrieb, 12.000 € Setup, 12 Monate. Verändere Abdeckung und finanziell realisierbaren Anteil.','Fictional process: 1,000 cases/month, 10 minutes saved per AI-processed case, €60/h, €2,000 monthly AI operations, €12,000 setup, 12 months. Vary coverage and financial realization.','Vereinfachtes isoliertes Beispiel ohne weitere Kosten, keine Empfehlung und keine Änderung des echten Cases.','Simplified isolated example without other costs; not a recommendation and does not alter the real case.']
];
const help = {
 volume:['Monatliches Fallvolumen bestimmt, wie oft Nutzen und variable Kosten anfallen. Jahreswerte durch zwölf teilen; saisonale Schwankungen prüfen.','Monthly case volume scales benefits and variable costs. Divide annual figures by twelve; check seasonality.'],
 horizon:['Längere Horizonte verteilen einmalige Kosten über mehr laufenden Nutzen, aber verlängern auch laufende Kosten. An Vertragslaufzeit und belastbarer Prognose ausrichten.','Longer horizons spread setup over more recurring benefits but also extend recurring costs. Align with contract duration and credible forecasts.'],
 rate:['Vollkosten je Arbeitsstunde bestimmen den Wert eingesparter Zeit. Vergütungsart und Einheit prüfen; Bruttogehalt ist nicht automatisch Vollkosten.','Fully loaded hourly cost determines the value of saved time. Check compensation type and unit; gross salary is not automatically fully loaded cost.'],
 before:['Aktive menschliche Minuten je Vorgang messen, nicht Durchlauf- oder Wartezeit. Repräsentative Fälle und Rollen ohne Doppelzählung erfassen.','Measure active human minutes per case, not elapsed or waiting time. Capture representative cases and roles without double-counting.'],
 mode:['KI-Assistent, Automation und feste Regeln nach Eignung vergleichen. Wähle die einfachste Lösung, die Qualitätsanforderungen erfüllt.','Compare AI assistance, automation and fixed rules for suitability. Choose the simplest solution meeting quality requirements.'],
 share:['KI-Abdeckung ist der Anteil geeigneter Fälle, nicht der automatisierte Zeitanteil. Nicht geeignete Fälle behalten ihren bisherigen Aufwand.','AI coverage is the share of eligible cases, not the fraction of time automated. Ineligible cases retain their existing effort.'],
 future:['Menschliche Restzeit inklusive regulärer Prüfung, Korrektur im normalen Ablauf und höherer Qualitätsanforderungen messen. Eine Einsparung von 100 % ist selten belastbar.','Measure remaining human time including routine review, normal corrections and higher quality expectations. A 100% saving is rarely defensible.'],
 billing:['Pauschale oder nutzungsbasierte Abrechnung passend zum Vertrag wählen. Gebühren nicht erneut erfassen, wenn sie bereits im Plattformbetrieb enthalten sind.','Select flat or usage-based billing according to the contract. Do not enter fees again if already included in platform operations.'],
 model:['Modellwahl anhand gemessener Qualität, Latenz und Kosten treffen. Preis allein belegt weder Eignung noch Freigabe.','Choose based on measured quality, latency and cost. Price alone proves neither suitability nor approval.'],
 quality:['Fehlerquote mal Zusatzminuten ergibt erwartete Nacharbeit. Reguläre Prüfung nicht noch einmal als Fehlerkorrektur zählen.','Error rate times extra minutes gives expected rework. Do not count routine review again as error correction.'],
 tokens:['Token und Aufrufe je KI-Fall aus repräsentativen Logs schätzen. Wiederholungen und Zusatztools berücksichtigen.','Estimate tokens and calls per AI case from representative logs. Include retries and extra tools.'],
 realization:['Nur wirtschaftlich realisierbaren Anteil ansetzen, z. B. vermiedene Überstunden oder Neueinstellungen. Freie Kapazität für mehr Aufgaben separat ausweisen.','Use only the economically realizable share, e.g. avoided overtime or hiring. Report capacity freed for additional tasks separately.'],
 platform:['Gemeinsame Kosten einmal erfassen und nachvollziehbar zuordnen. Weitere Use Cases nur berücksichtigen, wenn die Nutzung belastbar ist.','Enter shared costs once and allocate transparently. Count additional use cases only if their use is credible.'],
 costs:['Einmalige Einführung und monatlichen Betrieb trennen; Integrationen, Daten, Wartung und verbleibende Lizenzen berücksichtigen. Null nur bei tatsächlich entfallenden Kosten.','Separate one-time setup and monthly operations; include integrations, data, maintenance and retained licenses. Use zero only for genuinely absent costs.'],
 rules:['Regelbasierte Alternative auf identischer Fallbasis und Qualität mit ihren eigenen Restzeiten und Kosten vergleichen.','Compare rules-based alternatives on the same case and quality basis, with their own remaining effort and costs.']
};
function keyFor(el) {
 let k=el.dataset.qfield||el.dataset.gkey||el.dataset.gfield||el.dataset.taskchoice||el.dataset.rolechoice||el.dataset.gchoice||el.id||'';
 if(k.startsWith('rules:'))return 'rules';
 if(k.startsWith('platform:')||/^(platform|sharedCount|sharedSetup|sharedOpex|portfolioCount|portfolioSetup|portfolioOpex|portfolioMode)$/.test(k))return 'platform';
 if(/^(single:|tech:|contract:)/.test(k))return 'costs';
 k=k.split(':').pop();
 if(/^(salaryType|salary|rate|grossLoad|dayHours|dayRate|fulltime)$/.test(k))return 'rate';
 if(/^(savedPct|aiSavedPct|future)$/.test(k))return 'future';
 if(/^(errorRate|rework|aiError|aiRework|depRate|depMinutes|depLevel)$/.test(k))return 'quality';
 if(/^(inputTokens|outputTokens|calls|fx)$/.test(k))return 'tokens';
 if(/^(currentTech|remainingTech|extraSetup|extraOpex|contractFee|flatIncluded|complexity|integrations|dataReady|currentTechMonthly|remainingTechMonthly|dataReadiness|maintenanceShare)$/.test(k))return 'costs';
 return Object.hasOwn(help,k)?k:null;
}
let step=0, enabled=false, coverage=60, realization=50, lastLang, opener;
const style=document.createElement('style');
style.textContent='#operatorBriefing{border:1px solid var(--line,#e7e1e9);border-radius:17px;padding:0;color:var(--ink,#272236);background:white;width:min(560px,calc(100% - 24px));max-height:90dvh;overflow:auto;box-shadow:0 16px 60px #27112830}#operatorBriefing::backdrop{background:#27112866}#operatorBriefing .opBody{padding:22px}#operatorBriefing h2{margin:8px 0;font-size:22px}#operatorBriefing p{margin:10px 0}#operatorBriefing .opNav{display:flex;justify-content:space-between;gap:8px;margin-top:18px;flex-wrap:wrap}#operatorBriefing .opTop{display:flex;align-items:center;justify-content:space-between;gap:8px}#operatorBriefing .opTrack{height:5px;background:#f0e7ee;border-radius:5px;overflow:hidden;margin:12px 0}#operatorBriefing .opTrack span{display:block;height:100%;background:var(--pink,#e20074)}#operatorBriefing input[type=range]{width:100%;accent-color:var(--pink,#e20074)}#operatorBriefing .opNumbers{background:var(--soft,#fff0f7);border-radius:8px;padding:10px;font-variant-numeric:tabular-nums}#operatorBriefing .opToggle{display:flex;align-items:center;gap:7px;margin:18px 0 0;font-size:12px}#operatorBriefing .opToggle input{accent-color:var(--pink,#e20074)}.operatorHint{font-size:11px;color:var(--muted,#746c7c);margin:5px 0 8px;padding:4px 7px;border-left:2px solid var(--pink,#e20074);line-height:1.45}.operatorHint summary{cursor:pointer;font-weight:650;color:var(--pinkdeep,#ae005c)}.operatorHint p{margin:5px 0!important;font-size:11px!important}.operatorHint[hidden]{display:none!important}#operatorOpen{white-space:nowrap;flex:none}@media print{#operatorBriefing,#operatorOpen,.operatorHint{display:none!important}}';
document.head.append(style);
const dialog=document.createElement('dialog');dialog.id='operatorBriefing';dialog.setAttribute('aria-labelledby','operatorTitle');document.body.append(dialog);
const button=document.createElement('button');button.type='button';button.id='operatorOpen';button.setAttribute('aria-haspopup','dialog');
const host=$('guideTop')?.querySelector('.guideActions')||document.querySelector('.headActions');if(!host)return;
host.insertBefore(button,host.querySelector('#guideDemo')||host.firstChild);
function updateNumbers(){
 const f=new Intl.NumberFormat(en()?'en-GB':'de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
 const hours=1000*10/60*coverage/100, value=hours*60*realization/100, cost=12000+12*2000, net=value*12-cost;
 $('opCoverageValue').textContent=coverage+'%';$('opRealizationValue').textContent=realization+'%';
 $('opNumbers').textContent=t('Freie Zeit: ','Freed time: ')+hours.toFixed(1)+' h / '+t('Monat','month')+' · '+t('Finanzieller Nutzen: ','Financial benefit: ')+f.format(value)+' / '+t('Monat','month')+' · '+t('Nettonutzen: ','Net value: ')+f.format(net)+' · ROI: '+(100*net/cost).toFixed(1)+'%';
}
function render(){
 const c=chapters[step], l=en()?1:0;
 dialog.innerHTML='<div class="opBody"><div class="opTop"><span class="eyebrow">'+t('Bediener-Briefing','Operator briefing')+' · '+(step+1)+' / '+chapters.length+'</span><button type="button" id="opClose" aria-label="'+t('Schließen','Close')+'">×</button></div><div class="opTrack" aria-hidden="true"><span style="width:'+100*(step+1)/chapters.length+'%"></span></div><h2 id="operatorTitle">'+c[l]+'</h2><p>'+c[2+l]+'</p><p class="muted">'+c[4+l]+'</p>'+(step===5?'<label for="opCoverage">'+t('KI-Abdeckung','AI coverage')+' · <b id="opCoverageValue"></b></label><input id="opCoverage" type="range" min="0" max="100" value="'+coverage+'"><label for="opRealization">'+t('Finanzielle Realisierung','Financial realization')+' · <b id="opRealizationValue"></b></label><input id="opRealization" type="range" min="0" max="100" value="'+realization+'"><p id="opNumbers" class="opNumbers" aria-live="polite"></p>':'')+'<label class="opToggle"><input type="checkbox" id="opHints" '+(enabled?'checked':'')+'> '+t('Kontext-Hinweise in der Eingabemaske anzeigen','Show contextual hints in the input form')+'</label><div class="opNav"><button type="button" id="opPrev" '+(step===0?'disabled':'')+'>'+t('Zurück','Back')+'</button><button type="button" id="opNext" class="primary">'+(step===5?t('Fertig','Done'):t('Weiter','Next'))+'</button></div></div>';
 $('opClose').onclick=()=>dialog.close();$('opPrev').onclick=()=>{step--;render();$('operatorTitle').focus();};$('opNext').onclick=()=>{if(step===5)dialog.close();else{step++;render();$('operatorTitle').focus();}};
 $('operatorTitle').tabIndex=-1;
 $('opHints').onchange=e=>{enabled=e.target.checked;refresh();};
 if(step===5){$('opCoverage').oninput=e=>{coverage=+e.target.value;updateNumbers();};$('opRealization').oninput=e=>{realization=+e.target.value;updateNumbers();};updateNumbers();}
}
button.onclick=()=>{opener=document.activeElement;step=0;render();dialog.showModal();$('operatorTitle').focus();};
dialog.addEventListener('close',()=>opener?.focus());
/* Stop the existing wizard's document-level Enter shortcut while briefing is open. */
dialog.addEventListener('keydown',e=>{if(e.key==='Enter')e.stopPropagation();});
function refresh(){
 const language=en();button.textContent=t('ⓘ Demo-Briefing','ⓘ Demo briefing');
 if(lastLang!==language){lastLang=language;if(dialog.open)render();}
 document.querySelectorAll('.operatorHint').forEach(n=>{n.hidden=!enabled;const copy=help[n.dataset.operatorKey];if(copy){n.firstElementChild.textContent=t('Demo-Hinweis','Demo tip');n.lastElementChild.textContent=copy[language?1:0];}});
 if(!enabled)return;
 for(const root of [$('guidedRoot'),$('guideQuick'),$('guideFullDetails')].filter(Boolean)){
  for(const el of root.querySelectorAll('[data-gfield],[data-gkey],[data-gchoice],[data-taskchoice],[data-rolechoice],[data-qfield],input[id],select[id]')){
   const key=keyFor(el);if(!key)continue;
   const box=el.closest('.guideQfield,.guideSubquestion,.guideDependentField,.guideBasicUnit,.field');if(!box)continue;
   if([...box.children].some(n=>n.dataset.operatorKey===key))continue;
   const d=document.createElement('details');d.className='operatorHint noPrint';d.dataset.operatorKey=key;
   const s=document.createElement('summary');s.textContent=t('Demo-Hinweis','Demo tip');const p=document.createElement('p');p.textContent=help[key][language?1:0];d.append(s,p);box.append(d);
  }
 }
}
let queued=false;
const schedule=()=>{if(!queued){queued=true;requestAnimationFrame(()=>{queued=false;refresh();});}};
const observer=new MutationObserver(records=>{if(records.some(r=>!r.target.closest?.('.operatorHint,#operatorBriefing,#operatorOpen')&&[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&!n.classList?.contains('operatorHint'))))schedule();});
for(const root of [$('guidedRoot'),$('guideQuick'),$('guideFullDetails')].filter(Boolean))observer.observe(root,{childList:true,subtree:true});
$('guideDE')?.addEventListener('click',schedule);$('guideEN')?.addEventListener('click',schedule);$('langDE')?.addEventListener('click',schedule);$('langEN')?.addEventListener('click',schedule);
refresh();
})();