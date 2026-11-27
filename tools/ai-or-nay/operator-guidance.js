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

/* Visual summaries are intentionally qualitative unless the numbers are explicitly illustrative. */
const iconPaths={
 trend:'<path d="M3 17l6-6 4 4 8-9M15 6h6v6"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 coins:'<circle cx="12" cy="12" r="9"/><path d="M15 8h-3a2 2 0 000 4h1a2 2 0 010 4h-4M12 6v2m0 8v2"/>',
 target:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
 layers:'<path d="M12 3l9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 16l9 5 9-5"/>',
 check:'<path d="M5 12l4 4L19 6"/>',
 cross:'<path d="M6 6l12 12M18 6L6 18"/>',
 chart:'<path d="M4 4v16h16M8 16v-5m4 5V7m4 9V9"/>',
 file:'<path d="M6 3h8l4 4v14H6zM14 3v5h4M9 12h6m-6 4h6"/>',
 spark:'<path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>'
};
const pict=name=>'<svg class="opIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+iconPaths[name]+'</svg>';
const tile=(icon,title,desc)=>'<div class="opTile">'+pict(icon)+'<div><b>'+title+'</b><small>'+desc+'</small></div></div>';
const note=copy=>'<div class="opTakeaway">'+copy+'</div>';
const group=(html,cls='')=>'<div class="opGrid '+cls+'">'+html+'</div>';
const arrow='<span class="opArrow" aria-hidden="true">↓</span>';
const errorRow=(bad,good)=>'<div class="opError"><div>'+pict('cross')+'<span>'+bad+'</span></div><div>'+pict('check')+'<span>'+good+'</span></div></div>';
const bar=(label,pct,cls,value)=>'<div class="opBar"><div><span>'+label+'</span><b>'+value+'</b></div><div class="opBarTrack"><span class="'+cls+'" style="width:'+pct+'%"></span></div></div>';
function visualChapter(){
 switch(step){
 case 0:return '<div class="opFormula"><span>'+t('Realisierter Nutzen','Realized benefit')+' − '+t('KI-Kosten','AI costs')+'</span><span class="opFraction">'+t('KI-Kosten','AI costs')+'</span><strong>× 100 = ROI %</strong></div>'+group(
 tile('layers',t('Volumen','Volume'),t('Fälle pro Monat','Cases per month'))+
 tile('clock',t('Zeitersparnis','Time saved'),t('Abdeckung × Restzeit berücksichtigen','Account for coverage and remaining effort'))+
 tile('coins',t('Vollkosten & Realisierung','Labor cost & realization'),t('Wert je Stunde × realisierbarer Anteil','Hourly value × realizable share'))+
 tile('chart',t('Kosten & Horizont','Costs & horizon'),t('Setup + Betrieb + API','Setup + operations + API')))+note(t('Hebel einzeln variieren. Ihre Relevanz hängt vom Use Case ab.','Vary one driver at a time. Importance depends on the use case.'));
 case 1:return '<div class="opFlow">'+tile('file',t('Messen','Measure'),t('Ist-Zeit, Volumen, Kostensatz','Baseline time, volume, labor cost'))+arrow+tile('target',t('Pilotieren','Pilot'),t('KI-Restzeit inklusive Review','Remaining human time including review'))+arrow+tile('chart',t('Szenarien bilden','Build scenarios'),t('Konservativ · Basis · optimistisch','Conservative · base · optimistic'))+'</div>'+note(t('Quelle, Zeitraum und Bandbreite dokumentieren.','Document source, period and range.'));
 case 2:return '<div class="opErrors">'+errorRow(t('Jahresvolumen','Annual volume'),t('Monatsvolumen','Monthly volume'))+errorRow(t('Wartezeit','Waiting time'),t('Aktive Arbeitszeit','Active work time'))+errorRow(t('Unbekannt = 0','Unknown = 0'),t('Unbekannt kennzeichnen','Mark unknown'))+errorRow(t('100 % Abdeckung = 100 % Einsparung','100% coverage = 100% savings'),t('Restarbeit einrechnen','Include remaining effort'))+errorRow(t('Kosten doppelt zählen','Double-count costs'),t('Review und Plattform einmal erfassen','Count review and platform once'))+'</div>'+note(t('Auch höhere Qualitätsanforderungen und verbleibende Lizenzen berücksichtigen.','Include higher quality expectations and retained licenses.'));
 case 3:return '<div class="opFlow">'+tile('coins',t('Finanziell','Financial'),t('Vermiedene Kosten oder monetarisierter Mehrwert','Avoided cost or monetized value'))+tile('clock',t('Produktivität','Productivity'),t('Mehr Durchsatz · freie Zeit · Qualität','More throughput · freed time · quality'))+tile('spark',t('Strategisch','Strategic'),t('Skalierbarkeit · Resilienz · Kundenerlebnis','Scalability · resilience · customer experience'))+'</div>'+note(t('Freie Zeit ist nicht automatisch Cashflow. Nicht monetarisierten Nutzen separat messen.','Freed time is not automatically cash flow. Measure non-monetized value separately.'));
 case 4:return '<div class="opExample"><small>'+t('Beispiel · 12 Monate','Example · 12 months')+'</small>'+bar(t('Finanzieller Nutzen','Financial benefit'),70,'opBenefit','7.000 €')+bar(t('KI-Kosten','AI costs'),100,'opCost','10.000 €')+'<div class="opNegative"><strong>−30 % ROI</strong><span>'+t('Kosten nicht gedeckt','Costs not covered')+'</span></div></div>'+group(tile('check',t('Annahmen prüfen','Check assumptions'),t('Daten und Sensitivität','Data and sensitivity'))+tile('target',t('Alternativen prüfen','Check alternatives'),t('Regeln, Pilot oder Nein','Rules, pilot or no-go')))+note(t('Ein negatives Ergebnis ist eine valide Entscheidung.','A negative result can be a valid decision.'));
 default:return '<div class="opFacts"><span><b>1.000</b>'+t('Fälle/Monat','cases/month')+'</span><span><b>10 min</b>'+t('Ersparnis/KI-Fall','saved/AI case')+'</span><span><b>60 €/h</b>'+t('Vollkosten','labor cost')+'</span><span><b>12.000 €</b>Setup</span><span><b>2.000 €</b>'+t('Betrieb/Monat','operations/month')+'</span><span><b>12</b>'+t('Monate','months')+'</span></div>';
 }
}

let step=0, enabled=false, coverage=60, realization=50, lastLang, opener;
const style=document.createElement('style');
style.textContent='#operatorBriefing{border:1px solid var(--line,#e7e1e9);border-radius:17px;padding:0;color:var(--ink,#272236);background:white;width:min(560px,calc(100% - 24px));max-height:90dvh;overflow:auto;box-shadow:0 16px 60px #27112830}#operatorBriefing::backdrop{background:#27112866}#operatorBriefing .opBody{padding:22px}#operatorBriefing h2{margin:8px 0;font-size:22px}#operatorBriefing p{margin:10px 0}#operatorBriefing .opNav{display:flex;justify-content:space-between;gap:8px;margin-top:18px;flex-wrap:wrap}#operatorBriefing .opTop{display:flex;align-items:center;justify-content:space-between;gap:8px}#operatorBriefing .opTrack{height:5px;background:#f0e7ee;border-radius:5px;overflow:hidden;margin:12px 0}#operatorBriefing .opTrack span{display:block;height:100%;background:var(--pink,#e20074)}#operatorBriefing input[type=range]{width:100%;accent-color:var(--pink,#e20074)}#operatorBriefing .opNumbers{background:var(--soft,#fff0f7);border-radius:8px;padding:10px;font-variant-numeric:tabular-nums}#operatorBriefing .opToggle{display:flex;align-items:center;gap:7px;margin:18px 0 0;font-size:12px}#operatorBriefing .opToggle input{accent-color:var(--pink,#e20074)}.operatorHint{font-size:11px;color:var(--muted,#746c7c);margin:5px 0 8px;padding:4px 7px;border-left:2px solid var(--pink,#e20074);line-height:1.45}.operatorHint summary{cursor:pointer;font-weight:650;color:var(--pinkdeep,#ae005c)}.operatorHint p{margin:5px 0!important;font-size:11px!important}.operatorHint[hidden]{display:none!important}#operatorOpen{white-space:nowrap;flex:none}@media print{#operatorBriefing,#operatorOpen,.operatorHint{display:none!important}}';
style.textContent += `
#operatorBriefing{width:min(620px,calc(100% - 24px));}
#operatorBriefing .opBody{padding:24px}
#operatorBriefing h2{margin:15px 0 14px;font-size:24px;letter-spacing:-.5px}
#operatorBriefing .opIcon{width:25px;height:25px;flex:none;color:var(--pinkdeep,#ae005c)}
#operatorBriefing .opGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
#operatorBriefing .opTile{display:flex;align-items:center;gap:11px;background:#faf7fa;border:1px solid #eee5ed;border-radius:12px;padding:11px;min-width:0}
#operatorBriefing .opTile b,#operatorBriefing .opTile small{display:block}
#operatorBriefing .opTile b{font-size:13px;line-height:1.3}
#operatorBriefing .opTile small{font-size:11px;color:var(--muted,#746c7c);line-height:1.4;margin-top:3px}
#operatorBriefing .opFormula{display:grid;justify-items:center;gap:5px;background:var(--soft,#fff0f7);border-radius:12px;padding:14px;margin-bottom:12px;color:var(--pinkdeep,#ae005c);font-weight:700}
#operatorBriefing .opFraction{border-top:1px solid currentColor;padding:5px 24px 0;font-size:12px}
#operatorBriefing .opFormula strong{font-size:22px}
#operatorBriefing .opFlow{display:grid;gap:6px}
#operatorBriefing .opArrow{text-align:center;color:var(--pinkdeep,#ae005c);line-height:1}
#operatorBriefing .opTakeaway{margin-top:12px;padding:10px 12px;background:#fff4fa;border-left:3px solid var(--pink,#e20074);border-radius:0 8px 8px 0;font-size:12px;font-weight:650}
#operatorBriefing .opErrors{display:grid;gap:5px}
#operatorBriefing .opError{display:grid;grid-template-columns:1fr 1fr;gap:6px;border-bottom:1px solid #eee5ed;padding:7px 0}
#operatorBriefing .opError>div{display:flex;align-items:center;gap:7px;font-size:12px}
#operatorBriefing .opError .opIcon{width:18px;height:18px;color:#a52f51}
#operatorBriefing .opError>div+div .opIcon{color:#11684b}
#operatorBriefing .opExample{background:#faf7fa;border-radius:12px;padding:12px;margin-bottom:12px}
#operatorBriefing .opExample>small{color:var(--muted,#746c7c)}
#operatorBriefing .opBar{margin:9px 0}
#operatorBriefing .opBar>div:first-child{display:flex;justify-content:space-between;gap:8px;font-size:12px}
#operatorBriefing .opBarTrack{height:8px;background:#ede7ee;border-radius:8px;overflow:hidden;margin-top:4px}
#operatorBriefing .opBarTrack span{display:block;height:100%;border-radius:8px;transition:width .15s}
#operatorBriefing .opBenefit{background:#359477}
#operatorBriefing .opCost{background:#998ca0}
#operatorBriefing .opNegative{display:flex;align-items:center;gap:12px;margin-top:12px}
#operatorBriefing .opNegative strong{color:#a52f51;font-size:23px}
#operatorBriefing .opNegative span{font-size:12px;color:var(--muted,#746c7c)}
#operatorBriefing .opFacts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:5px;margin-bottom:12px}
#operatorBriefing .opFacts span{background:#faf7fa;border-radius:8px;padding:8px;font-size:10px;color:var(--muted,#746c7c)}
#operatorBriefing .opFacts b{display:block;font-size:15px;color:var(--ink,#272236)}
#operatorBriefing .opNumbers{display:grid;grid-template-columns:1fr 1fr;gap:7px;background:none;padding:0;margin:10px 0}
#operatorBriefing .opMetric{background:#faf7fa;border:1px solid #eee5ed;border-radius:10px;padding:9px;font-size:11px;color:var(--muted,#746c7c)}
#operatorBriefing .opMetric strong{display:block;font-size:19px;color:var(--ink,#272236);line-height:1.2;margin-top:4px}
#operatorBriefing .opMetric.opRoi{background:var(--soft,#fff0f7);border-color:#efc9df}
#operatorBriefing .opMetric.opRoi strong{color:var(--pinkdeep,#ae005c)}
#operatorBriefing .opMetric.opLoss strong{color:#a52f51}
#operatorBriefing .opMetric.opGain strong{color:#11684b}
#operatorBriefing .opDetail{font-size:11px;color:var(--muted,#746c7c);margin-top:13px}
#operatorBriefing .opDetail summary{cursor:pointer;font-weight:650}
#operatorBriefing .opDetail p{margin:5px 0}
#operatorBriefing .opToggle{border-top:1px solid #eee5ed;padding-top:10px;margin-top:12px}
#operatorBriefing .opNav button{min-width:100px}
#operatorBriefing .opNav{margin-top:12px}
@media(max-width:480px){#operatorBriefing .opBody{padding:16px}#operatorBriefing h2{font-size:21px}#operatorBriefing .opGrid{grid-template-columns:1fr 1fr;gap:6px}#operatorBriefing .opGrid .opTile{align-items:flex-start;flex-direction:column;gap:4px;padding:9px}#operatorBriefing .opTile small{font-size:10px}#operatorBriefing .opFacts b{font-size:13px}}
`;
document.head.append(style);
const dialog=document.createElement('dialog');dialog.id='operatorBriefing';dialog.setAttribute('aria-labelledby','operatorTitle');document.body.append(dialog);
const button=document.createElement('button');button.type='button';button.id='operatorOpen';button.setAttribute('aria-haspopup','dialog');
const host=$('guideTop')?.querySelector('.guideActions')||document.querySelector('.headActions');if(!host)return;
host.insertBefore(button,host.querySelector('#guideDemo')||host.firstChild);
function updateNumbers(){
 const f=new Intl.NumberFormat(en()?'en-GB':'de-DE',{style:'currency',currency:'EUR',maximumFractionDigits:0});
 const hours=1000*10/60*coverage/100, value=hours*60*realization/100, cost=12000+12*2000, net=value*12-cost;
 $('opCoverageValue').textContent=coverage+'%';$('opRealizationValue').textContent=realization+'%';
 const roi=100*net/cost;
 const metric=(label,val,cls='')=>'<div class="opMetric '+cls+'">'+label+'<strong>'+val+'</strong></div>';
 $('opNumbers').innerHTML=metric(t('Freie Zeit / Monat','Freed time / month'),hours.toFixed(1)+' h')+metric(t('Finanzieller Nutzen / Monat','Financial benefit / month'),f.format(value))+metric(t('Nettonutzen · 12 Monate','Net value · 12 months'),f.format(net),net<0?'opLoss':net>0?'opGain':'')+metric('ROI: ',roi.toFixed(1)+'%','opRoi '+(roi<0?'opLoss':roi>0?'opGain':''));
 $('opNumbers').setAttribute('aria-label','ROI: '+roi.toFixed(1)+'%');
}
function render(){
 const c=chapters[step], l=en()?1:0;
 dialog.innerHTML='<div class="opBody"><div class="opTop"><span class="eyebrow">'+t('Bediener-Briefing','Operator briefing')+' · '+(step+1)+' / '+chapters.length+'</span><button type="button" id="opClose" aria-label="'+t('Schließen','Close')+'">×</button></div><div class="opTrack" aria-hidden="true"><span style="width:'+100*(step+1)/chapters.length+'%"></span></div><h2 id="operatorTitle">'+c[l]+'</h2>'+visualChapter()+(step===5?'<label for="opCoverage">'+t('KI-Abdeckung','AI coverage')+' · <b id="opCoverageValue"></b></label><input id="opCoverage" type="range" min="0" max="100" value="'+coverage+'"><label for="opRealization">'+t('Finanzielle Realisierung','Financial realization')+' · <b id="opRealizationValue"></b></label><input id="opRealization" type="range" min="0" max="100" value="'+realization+'"><div id="opNumbers" class="opNumbers" aria-live="polite"></div><div class="opTakeaway">'+t('Fiktives Beispiel – verändert keine echten Eingaben.','Fictional example – does not change real inputs.')+'</div>':'')+'<details class="opDetail"><summary>'+t('Fachliche Details','Technical details')+'</summary><p>'+c[2+l]+'</p><p>'+c[4+l]+'</p></details><label class="opToggle"><input type="checkbox" id="opHints" '+(enabled?'checked':'')+'> '+t('Kontext-Hinweise in der Eingabemaske anzeigen','Show contextual hints in the input form')+'</label><div class="opNav"><button type="button" id="opPrev" '+(step===0?'disabled':'')+'>'+t('Zurück','Back')+'</button><button type="button" id="opNext" class="primary">'+(step===5?t('Fertig','Done'):t('Weiter','Next'))+'</button></div></div>';
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