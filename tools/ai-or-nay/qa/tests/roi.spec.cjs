const { test, expect } = require('@playwright/test');
const base = () => ({
  inputs: { caseName:'Synthetic QA case', volume:'1000', portfolioMode:'single', portfolioAllocation:'equal', currentTechMonthly:'0', remainingTechMonthly:'0', costDevelopment:'12000', costHosting:'2000', contractFee:'0', fx:'1', rulesName:'Rules alternative', rulesSetup:'0', rulesOpex:'0' },
  costMode:'advanced',
  staff:[{id:1,name:'Synthetic role',salaryType:'hour',rate:60}],
  steps:[{id:1,role:1,name:'Synthetic task',before:10,errorRate:0,rework:0,mode:'assist',share:100,future:4,aiError:0,aiRework:0,model:'contract',review:'always',rules:7,depLevel:'none'}],
  ranges:{horizon:12,realization:100}
});
async function evaluateCase(page, modify) {
  const d=base(); modify(d);
  return page.evaluate(d => { loadData(d); return window.latest.results; }, d);
}
test.beforeEach(async ({page}) => {
  await page.addInitScript(() => localStorage.setItem('magenta-lab-intro-v2-ai-or-nay','1'));
  await page.goto('/tools/ai-or-nay/');
  await page.waitForFunction(() => !!window.latest && typeof loadData === 'function');
});
const near=(actual,expected)=>expect(actual).toBeCloseTo(expected,6);
const scenarios=[
  ['baseline labor costs and savings',()=>{}, {monthHumanBefore:10000,monthHumanAfter:4000,monthHumanBenefitToday:6000}],
  ['baseline horizon investment, ROI and payback',()=>{}, {currentCost:36000,currentValue:72000,currentNet:36000,currentROI:100,currentPayback:3}],
  ['six month horizon',d=>d.ranges.horizon=6,{currentCost:24000,currentValue:36000,currentNet:12000,currentROI:50}],
  ['half financial realization',d=>d.ranges.realization=50,{currentValue:36000,currentNet:0,currentROI:0,currentPayback:12}],
  ['zero financial realization',d=>d.ranges.realization=0,{currentValue:0,currentNet:-36000,currentROI:-100,currentPayback:null}],
  ['partial AI coverage',d=>d.steps[0].share=50,{after:7,monthHumanAfter:7000,currentROI:0,currentPayback:12}],
  ['no AI coverage',d=>d.steps[0].share=0,{after:10,currentNet:-36000,currentROI:-100,currentPayback:null}],
  ['day salary converted into hourly cost',d=>{d.staff[0].salaryType='day';d.staff[0].rate=480;d.inputs.dayHours='8';},{hr:60,monthHumanBefore:10000}],
  ['annual gross with employer overhead',d=>{d.staff[0].salaryType='gross';d.staff[0].rate=99840;d.inputs.grossLoad='25';d.inputs.fulltime='40';},{hr:60,monthHumanBefore:10000}],
  ['expected quality rework',d=>{Object.assign(d.steps[0],{errorRate:10,rework:5,aiError:20,aiRework:5});},{before:10.5,after:5,monthHumanBefore:10500,monthHumanAfter:5000}],
  ['dependency disruption weighted by coverage',d=>{Object.assign(d.steps[0],{share:50,depRate:20,depMinutes:10});},{after:8,monthHumanAfter:8000}],
  ['tech cost saving',d=>{d.inputs.currentTechMonthly='500';d.inputs.remainingTechMonthly='100';},{monthlyToolSaving:400,currentValue:76800,currentMonthNet:4400}],
  ['extra benefit must be enabled',d=>{d.inputs.cashExtra='500';d.inputs.includeExtra=false;},{extra:0,currentValue:72000}],
  ['explicit extra benefit included',d=>{d.inputs.cashExtra='500';d.inputs.includeExtra=true;},{extra:6000,currentValue:78000}],
  ['zero investment does not fabricate ROI',d=>{d.inputs.costDevelopment='0';d.inputs.costHosting='0';},{currentCost:0,currentROI:null,currentPayback:0}],
  ['rules alternative incremental comparison',d=>{d.inputs.rulesSetup='3000';d.inputs.rulesOpex='500';},{rulesValue:36000,rulesTotal:9000,rulesCompareBenefit:36000,rulesCompareCost:27000,rulesCompareNet:9000}],
  ['equal shared costs without double counting contract',d=>{Object.assign(d.inputs,{portfolioMode:'shared',portfolioCount:'5',portfolioSetup:'50000',portfolioOpex:'2000',caseSetupOverride:'2000',caseOpexOverride:'600',contractIncludedInPlatform:'yes',contractFee:'900'});},{currentCost:24000,monthAiOpex:1000,currentROI:200}],
  ['custom shared cost fraction',d=>{Object.assign(d.inputs,{portfolioMode:'shared',portfolioCount:'5',portfolioAllocation:'custom',portfolioCustomShare:'10',portfolioSetup:'50000',portfolioOpex:'2000',caseSetupOverride:'0',caseOpexOverride:'0',contractIncludedInPlatform:'yes'});},{currentCost:7400,monthAiOpex:200}],
  ['token costs with known tariff and exchange rate',d=>{Object.assign(d.steps[0],{model:'luna',inputTokens:1000,outputTokens:1000,calls:2});},{requestPerProcess:.0012,inference:14.4}],
];
for(const [title,modify,expected] of scenarios) test(title,async({page})=>{
  const r=await evaluateCase(page,modify);
  expect(r.errors).toEqual([]);
  for(const [key,value] of Object.entries(expected)) value===null?expect(r[key]).toBeNull():near(r[key],value);
});
test('zero volume is invalid, not a financial result',async({page})=>{
  const r=await evaluateCase(page,d=>d.inputs.volume='0');
  expect(r.errors.length).toBeGreaterThan(0);
  expect(r.currentROI).toBeUndefined();
});
test('missing monthly technology cost is not silently zero',async({page})=>{
  const r=await evaluateCase(page,d=>d.inputs.currentTechMonthly='');
  expect(r.errors.length).toBeGreaterThan(0);
  expect(r.currentROI).toBeUndefined();
});
