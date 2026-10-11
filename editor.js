
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const E = EditorEngine;
const clone = v => structuredClone(v);
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmt = n => Number.isFinite(n) ? new Intl.NumberFormat('en-GB', {maximumFractionDigits:2}).format(n) : '—';
const duration = n => `${Math.floor(n / 60)}:${String(Math.round(n % 60)).padStart(2,'0')}`;
const rangeText = r => r ? (r.min === r.max ? fmt(r.min) : `${fmt(r.min)}–${fmt(r.max)}`) : '—';
const KEY = 'openGym_editor_mock_v1';
const CATALOGUE = [
  {id:'0025',name:"Barbell bench press",muscle:"Chest",eq:'barbell',equipment:"Barbell",category:"Strength",cues:"Retract your shoulder blades and plant your feet. Lower the bar to your chest and press with control."},
  {id:'0289',name:"Dumbbell bench press",muscle:"Chest",eq:'dumbbell',equipment:"Dumbbells",category:"Strength",cues:"Keep wrists aligned and shoulder blades stable. Lower with control while holding your position."},
  {id:'0334',name:"Dumbbell lateral raise",muscle:"Shoulders",eq:'dumbbell',equipment:"Dumbbells",category:"Strength",cues:"Keep elbows slightly bent. Lift without swinging and lower with control."},
  {id:'0294',name:"Dumbbell biceps curl",muscle:"Biceps",eq:'dumbbell',equipment:"Dumbbells",category:"Strength"},
  {id:'0201',name:"Cable pushdown",muscle:"Triceps",eq:'cable',equipment:"Cable",category:"Strength"},
  {id:'3593',name:"Barbell squat",muscle:"Legs",eq:'barbell',equipment:"Barbell",category:"Strength"},
  {id:'2290',name:"Dumbbell bulgarian split squat",muscle:"Legs",eq:'dumbbell',equipment:"Dumbbells",category:"Strength",side:true},
  {id:'0652',name:"Pull-up",muscle:"Back",eq:'body weight',equipment:"Bodyweight",category:"Bodyweight",bodyweight:true},
  {id:'0017',name:"Assisted pull-up",muscle:"Back",eq:'leverage machine',equipment:"Machine",category:"Strength",assisted:true},
  {id:'0463',name:"Front plank",muscle:'Core',eq:'body weight',equipment:"Bodyweight",category:"Bodyweight",bodyweight:true,timed:true},
  {id:'2197',name:"Run on treadmill",muscle:'Cardio',eq:'stationary bike',equipment:"Treadmill",category:'Cardio',cardio:true}
];
const LABELS = {
  "autoregulated": [
    "Autoregulated",
    "Your choice",
    "You set every value by feel (reps, load or seconds); nothing is advanced for you."
  ],
  "linear": [
    "Linear",
    "More load",
    "Add a fixed amount of weight after every successful session."
  ],
  "greyskull": [
    "Greyskull LP",
    "More load",
    "Add weight when you hit the target; the last set is an AMRAP."
  ],
  "double": [
    "Double progression",
    "Reps first",
    "Reach the top of the rep or time range, then add weight and start again."
  ],
  "triple": [
    "Triple progression",
    "Sets, reps, load",
    "Fill sets and reps up to the top of the range, then add weight."
  ],
  "hold_seconds": [
    "Timed hold progression",
    "More seconds",
    "Hold for time; the target seconds go up each time you reach the longest time."
  ],
  "bodyweight_ladder": [
    "Bodyweight ladder",
    "Harder variations",
    "Build reps and sets, then move to a harder variation."
  ],
  "pyramid_reps": [
    "Pyramid sets",
    "Reps per set",
    "A different rep target for each set, e.g. 12 · 8 · 6 · Max · 12."
  ],
  "pyramid": [
    "Pyramid",
    "Anchor percentages",
    "Sets at different shares of one anchor load, lightest first or heaviest first."
  ],
  "five_three_one": [
    "5/3/1",
    "Four-week cycle",
    "Wendler cycle: four weeks of percentages of your training max."
  ],
  "top_set_backoff": [
    "Top set and back-off",
    "Heavy, then lighter",
    "One heavy top set, then lighter back-off sets; the top set decides the next load."
  ],
  "accumulation_intensification": [
    "Accumulation then intensification",
    "Two blocks",
    "Build reps at a lighter percentage of your training max, then a heavier block of fewer reps."
  ],
  "density": [
    "Density",
    "Less rest",
    "Same work, a little less rest after every clean session."
  ]
};
const METRICS = {target_load:"Reach the target load",max_sets:"Reach the most sets",max_reps:"Reach the most reps",max_duration:"Reach the longest duration",cycle_count:"Complete cycles",training_max:"Reach a training max",difficulty_rung:"Reach the final variation",rest_floor:"Reach the shortest rest"};
const INCREMENTS = {absolute:"Fixed amount",current_load_percent:"% of current load",snapshot_1rm_percent:"% of 1RM",target_load_percent:"% of target",percentage_points:"Percentage points"};
let serial = Date.now();
const uid = () => `mock-${++serial}`;
const exOf = occ => CATALOGUE.find(x => x.id === occ.exerciseId) || {id:occ.exerciseId,name:"Exercise unavailable",muscle:"Needs review",equipment:"Unknown",eq:'machine',unknown:true};
function makeOccurrence(id, preset, patch = {}) {
  const ex = CATALOGUE.find(x => x.id === id) || {id};
  const occurrenceId = uid();
  let rule = E.defaultPlanRule(preset || (ex.cardio ? 'autoregulated' : ex.timed ? 'hold_seconds' : ex.bodyweight ? 'bodyweight_ladder' : 'double'), {id:uid(),exerciseId:id,routineId:'mock-routine',unit:'kg'});
  if (ex.cardio) rule = E.editPlan(rule, E.cardioParameters({sets:4,min:5,speed:8}));
  return {occurrenceId,exerciseId:id,rule,bodyweight:!!ex.bodyweight,side:!!ex.side,assisted:!!ex.assisted,warmup:{mode:'off'},note:'',...patch};
}
function fixture(scenario = 'upper') {
  const bench = makeOccurrence('0025','linear');
  bench.rule = E.editPlan(bench.rule,{sets:{min:4,max:4},reps:{min:8,max:8},load:{mode:'absolute',value:60,unit:'kg'},restSeconds:120});
  bench.warmup = {mode:'smart',count:3};
  const lateral = makeOccurrence('0334','double');
  lateral.rule = E.editPlan(lateral.rule,{load:{mode:'absolute',value:8,unit:'kg'},reps:{min:12,max:15},restSeconds:75}); lateral.dbLoad='each';
  const curl = makeOccurrence('0294','double',{sg:'arms',sgName:"Arm finisher",sgRest:90});
  const push = makeOccurrence('0201','linear',{sg:'arms',sgName:"Arm finisher",sgRest:90,intensifier:{type:'dropset',count:1,pct:20}});
  let exercises = [bench,lateral,curl,push,makeOccurrence('0463')];
  if (scenario === 'types') exercises = [bench,makeOccurrence('2290'),makeOccurrence('0652'),makeOccurrence('0017'),makeOccurrence('0463'),makeOccurrence('2197')];
  if (scenario === 'empty') exercises = [];
  if (scenario === 'imported') {bench.imported=true;bench.rule.program.phases[0].groups[0].reps=7;}
  if (scenario === 'onerm') bench.rule=E.editPlan(bench.rule,{load:{mode:'percent_1rm',percent:75},step:{type:'percentage_points',value:2.5}});
  if (scenario === 'missing') {bench.unavailable=true;exercises.push(makeOccurrence('missing-exercise','autoregulated'));}
  return {version:1,name:scenario === 'types'?'Full body':scenario === 'empty'?"New routine":'Upper body A',glyph:'dumb',deload:false,exercises,theme:'dark',accent:'lime',unit:'kg',effort:'rir',scenario,favorites:['0025','0334'],customExercises:[],globalLoads:{},oneRm:scenario === 'onerm'?null:100};
}
let state = fixture();
try {const saved=JSON.parse(localStorage.getItem(KEY));if(saved?.version===1 && Array.isArray(saved.exercises))state=saved;} catch {}
CATALOGUE.push(...(state.customExercises||[]));
let page='routine',tab='target',draft=null,editingId=null,replaceId=null,pickerReturn='routine',query='',muscle='',equipment='',category='',scope='',showAll=false,week=0;
let undo=null,toastTimer;
function persist() {try {localStorage.setItem(KEY,JSON.stringify(state));} catch {toast("Local storage is unavailable. The mock still works for this session.");}}
function toast(message, action=null) {
  clearTimeout(toastTimer);undo=action;
  $('#toast').innerHTML=`${ic('check',16)}<span>${esc(message)}</span>${action?"<button data-action=\"undo\">Undo</button>":''}`;
  $('#toast').hidden=false;toastTimer=setTimeout(()=>{$('#toast').hidden=true;undo=null;},6500);
}
function btn(action,label,style='secondary',extra='') {return `<button class="button ${style}" data-action="${action}" ${extra}>${esc(label)}</button>`;}
function iconButton(action,icon,label,extra='') {return `<button class="icon-button" data-action="${action}" aria-label="${esc(label)}" ${extra}>${ic(icon)}</button>`;}
function settingToggle(path,label,hint,value) {return `<div class="setting-row"><div class="setting-copy"><strong>${esc(label)}</strong>${hint?`<small>${esc(hint)}</small>`:''}</div><label class="switch-hit"><input class="switch" type="checkbox" data-toggle="${path}" aria-label="${esc(label)}" ${value?'checked':''}></label></div>`;}
function stepper(path,value,label,options={}) {
  const {step=1,min=0,max='',unit=''}=options;
  const inputId=`field-${path.replaceAll('.','-')}`;
  return `<div class="field"><label for="${inputId}">${esc(label)}</label><div class="stepper"><button data-step="${path}" data-delta="-${step}" aria-label="Decrease ${esc(label)}">${ic('minus',14)}</button><input id="${inputId}" type="number" inputmode="decimal" data-number="${path}" value="${value??''}" step="any" min="${min}" ${max!==''?`max="${max}"`:''}>${unit?`<span class="unit">${esc(unit)}</span>`:''}<button data-step="${path}" data-delta="${step}" aria-label="Increase ${esc(label)}">${ic('plus',14)}</button></div></div>`;
}
function selectField(path,value,label,options) {return `<div class="field"><label for="select-${path}">${esc(label)}</label><select class="select-field" id="select-${path}" data-select="${path}">${options.map(([v,l])=>`<option value="${esc(v)}" ${v===value?'selected':''}>${esc(l)}</option>`).join('')}</select></div>`;}
function segmented(action,value,options) {return `<div class="segmented" role="group">${options.map(([v,l])=>`<button data-action="${action}" data-value="${v}" aria-pressed="${v===value}">${esc(l)}</button>`).join('')}</div>`;}
function rangeField(path,value,label,policy='fixed',step=1,max=100) {
  const ranged=policy==='range'||value.min!==value.max||draft.rangeOpen?.includes(path);
  if(!ranged&&policy==='fixed')return stepper(`${path}.min`,value.min,label,{min:1,max,step});
  return `<div class="field"><div class="field-label"><span>${esc(label)}</span>${policy==='either'?`<button class="range-toggle" data-action="range" data-path="${path}" aria-pressed="${!!ranged}">${ranged?"Fixed value":"Use a range"}</button>`:''}</div>${ranged?`<div class="range-fields">${stepper(`${path}.min`,value.min,"From",{min:1,max,step})}${stepper(`${path}.max`,value.max,"To",{min:1,max,step})}</div>`:stepper(`${path}.min`,value.min,label,{min:1,max,step})}</div>`;
}
function disclosure(id,title,value,body,open=false) {return `<details class="disclosure" data-disclosure="${id}" ${open?'open':''}><summary><span>${esc(title)}</span><span class="detail-value">${esc(value)}</span><span class="chevron">${ic('chevD',16)}</span></summary><div class="disclosure-body">${body}</div></details>`;}
function optionsOf() {return E.planOptions(draft.rule);}
function setOptions(patch) {draft.rule=E.editPlan(draft.rule,patch);}
function getPath(object,path) {return path.split('.').reduce((v,k)=>v?.[k],object);}
function setPath(object,path,value) {const parts=path.split('.');const last=parts.pop();let obj=object;for(const k of parts){obj[k]??={};obj=obj[k];}obj[last]=value;}
function loadText(load) {if(!load||['empty','none'].includes(load.mode))return "Bodyweight";return load.mode==='percent_1rm'?`${fmt(load.percent)}% 1RM`:`${fmt(load.value)} ${load.unit}`;}
function summary(occ) {
  const p=E.planOptions(occ.rule),ex=exOf(occ);
  if(ex.cardio)return `${p.sets.min} intervals · ${fmt((p.durationSeconds?.min||0)/60)} min · ${fmt(state.unit==='lb'?p.speed.value/1.609344:p.speed.value)} ${state.unit==='lb'?'mph':'km/h'}`;
  if(p.trainingMax)return `${rangeText(p.sets)} sets · ${LABELS[occ.rule.preset][0]}`;
  return `${rangeText(p.sets)} × ${p.durationSeconds?rangeText(p.durationSeconds)+E.failureSuffix(occ,E.failureSetRange(occ.rule).max)+" s":rangeText(p.reps)+E.failureSuffix(occ,E.failureSetRange(occ.rule).max)}${p.setReps?" · per set":p.load.mode!=='empty'?' · '+loadText(p.load):''}`;
}
function chipsOf(occ) {
  const p=E.planOptions(occ.rule);
  return [!exOf(occ).cardio?LABELS[occ.rule.preset][0]:'Cardio',occ.side?"Per side":null,occ.warmup?.mode!=='off'?"Warm-ups":null,occ.intensifier?.type==='dropset'?"Drops":occ.intensifier?.type==='restpause'?'Rest-pause':null,E.failureSuffix(occ,E.failureSetRange(occ.rule).max)?"To failure":null,occ.backoff?'Back-off':null,p.rir&&state.effort!=='none'?`${state.effort.toUpperCase()} ${rangeText(effortRange(p.rir))}`:null,occ.imported?"Imported":null].filter(Boolean);
}
function routineHeader() {return `<div class="bar"><a class="back-button" href="index.html" aria-label="All mocks">${ic('chevL')}</a><div class="grow"><h2>Edit routine</h2></div><span class="save-state" title="Saved in the mock only">${ic('check',13)}<span>Saved</span></span>${iconButton('routine-menu','dots',"Routine actions")}</div>`;}
function renderRoutine() {
  $('#app-header').innerHTML=routineHeader();
  const exercises=state.exercises,total=exercises.reduce((sum,occ)=>sum+E.planOptions(occ.rule).sets.min,0);
  let letters=new Map(),letter=0;
  exercises.forEach(occ=>{if(occ.sg&&!letters.has(occ.sg))letters.set(occ.sg,String.fromCharCode(65+letter++));});
  let list=exercises.map((occ,i)=>{
    const ex=exOf(occ),prev=exercises[i-1],linked=occ.sg&&prev?.sg===occ.sg;
    const position=occ.sg?letters.get(occ.sg)+(exercises.slice(0,i+1).filter(x=>x.sg===occ.sg).length):'';
    const ssStart=occ.sg&&!linked;
    return `${ssStart?`<button class="superset-label" data-action="superset" data-id="${occ.sg}">${ic('link',16)}<span>${esc(occ.sgName||'Superset '+letters.get(occ.sg))}</span><small>${occ.sgRest?duration(occ.sgRest):'Auto'}</small>${ic('pencil',14)}</button>`:''}${i>0?`<div class="link-row"><button data-action="link" data-id="${occ.occurrenceId}" aria-pressed="${!!linked}" class="${linked?'on':''}">${ic('link',13)}${linked?"Linked":"Link to previous"}</button></div>`:''}<div class="exercise-row" data-row-id="${occ.occurrenceId}"><button class="grip" draggable="true" data-drag-id="${occ.occurrenceId}" aria-label="Drag ${esc(ex.name)} to reorder">${ic('set',14)}</button>${(ex.unknown||ex.custom)?`<div class="exercise-thumb row" style="justify-content:center;color:#555">${ic('warn')}</div>`:`<img class="exercise-thumb" src="editor-assets/${ex.id}.webp" alt="" loading="lazy">`}<button class="exercise-open" data-action="edit" data-id="${occ.occurrenceId}"><strong>${position?`<span class="ss-position">${position}</span>`:''}${esc(ex.name)}</strong><span class="exercise-summary">${esc(summary(occ))}</span><span class="chips">${chipsOf(occ).slice(0,3).map(c=>`<span class="chip">${esc(c)}</span>`).join('')}${occ.unavailable?`<span class="chip warning">${ic('warn',10)}Equipment</span>`:''}</span></button><div class="order-controls"><button data-action="move" data-id="${occ.occurrenceId}" data-dir="-1" aria-label="Move ${esc(ex.name)} up" ${i===0?'disabled':''}>${ic('chevU',16)}</button><button data-action="move" data-id="${occ.occurrenceId}" data-dir="1" aria-label="Move ${esc(ex.name)} down" ${i===exercises.length-1?'disabled':''}>${ic('chevD',16)}</button></div></div>`;
  }).join('');
  const unavailable=exercises.filter(x=>x.unavailable||exOf(x).unknown).length;
  $('#screen').innerHTML=`<div class="routine-title"><button class="glyph-button" data-action="glyph" aria-label="Change routine icon">${ic(state.glyph,26)}</button><input id="routine-name" aria-label="Routine name" maxlength="80" value="${esc(state.name)}"></div><div class="routine-info">${exercises.length} exercises <span aria-hidden="true">·</span> ${total} working sets</div><div class="group">${settingToggle('routine.deload',"Deload routine","Shown in history; does not advance progression.",state.deload)}</div>${state.deload?"<p class=\"hint\">The next regular session resumes from the last included workout.</p>":''}${unavailable?`<div class="notice">${ic('warn',17)}<span>${unavailable} exercises need equipment outside the “Home gym” profile. Replace them or change the profile in the app.</span></div>`:''}<div class="section-head"><h3 class="section-title">Exercises <span class="pill-count">${exercises.length}</span></h3><button class="button tinted small" data-action="add">${ic('plus',16)}Add</button></div>${exercises.length?`<div class="routine-list">${list}</div>`:`<div class="empty-state">${ic('dumb',44)}<h3>Your routine starts here.</h3><p>Add your first exercise, then choose sets, targets and progression.</p>${btn('add',"Add exercise",'primary')}</div>`}${exercises.length?`<div class="section-head"><h3 class="section-title">Muscle coverage</h3><span class="muted small">Planned sets</span></div><div class="group coverage">${coverageHTML()}</div><p class="coverage-note">Primary muscle distribution from demo data. Warm-up excluded.</p>`:''}`;
  $('#app-footer').innerHTML=`<button class="button ${exercises.length?'secondary':''}" data-action="routine-preview" ${!exercises.length?'disabled':''}>${ic('note',18)}Routine preview</button>`;
}
function coverageHTML() {
  const counts={};state.exercises.forEach(occ=>{const muscle=exOf(occ).muscle;if(muscle!=='Cardio'&&!exOf(occ).unknown)counts[muscle]=(counts[muscle]||0)+E.planOptions(occ.rule).sets.min;});
  const max=Math.max(...Object.values(counts),1);
  return Object.entries(counts).sort((a,b)=>b[1]-a[1]).map(([m,n])=>`<div class="muscle-row"><span>${esc(m)}</span><span class="track"><i style="width:${n/max*100}%"></i></span><span class="tnum">${n} sets</span></div>`).join('')||"<p class=\"muted small\">No strength sets in this routine.</p>";
}
function openExercise(id) {
  const occ=state.exercises.find(x=>x.occurrenceId===id);if(!occ)return;
  draft=clone(occ);editingId=id;replaceId=null;tab='target';page='exercise';week=0;render(true);
}
function validation() {
  if(!draft)return {ok:true};
  const result=E.validatePlanRule(draft.rule),warmupOk=E.validateWarmup(draft.warmup,2);
  const intensifierOk=!draft.intensifier||draft.intensifier.type==='dropset'?( !draft.intensifier || (draft.intensifier.count>=1&&draft.intensifier.count<=5&&draft.intensifier.pct>=5&&draft.intensifier.pct<=90)):draft.intensifier.totalReps>=1&&draft.intensifier.totalReps<=100&&draft.intensifier.restSec>=5&&draft.intensifier.restSec<=120;
  return {ok:result.ok&&warmupOk&&intensifierOk&&!draft.invalidFields?.length,errors:result.errors,warmupOk,intensifierOk};
}
function renderExercise() {
  const ex=exOf(draft),p=optionsOf(),custom=draft.imported||!E.isTemplateRule(draft.rule);
  draft.invalidFields=(draft.invalidFields||[]).filter(path=>{
    if(p.durationSeconds&&path.startsWith('reps.'))return false;
    return getPath(path.startsWith('occ.')?draft:p,path.replace(/^occ\./,''))!==undefined;
  });
  $('#app-header').innerHTML=`<div class="bar"><button class="back-button" data-action="leave-exercise" aria-label="Back to routine">${ic('chevL')}</button><div class="grow"><h2>${editingId?"Edit exercise":"Add exercise"}</h2><span class="subtitle">${esc(state.name)}</span></div>${editingId?iconButton('exercise-menu','dots',"Exercise actions"):''}</div>`;
  const hero=`<div class="exercise-hero">${!ex.unknown&&!ex.custom?`<img src="editor-assets/${ex.id}.webp" alt="${esc(ex.name)}">`:''}<div class="grow"><h1>${esc(ex.name)}</h1><p class="muted">${esc(ex.equipment)} · ${esc(ex.muscle)}</p></div></div>${!ex.unknown&&!ex.custom?`<details class="info-disclosure"><summary>${ic('info',14)}Technique and image</summary><img class="media-large" src="editor-assets/${ex.id}.webp" alt="Position for ${esc(ex.name)}"><p>${esc(ex.cues||"Image from the openGym catalogue. The mock uses a static preview.")}</p></details>`:''}`;
  const tabs=`<div class="editor-tabs" role="tablist" aria-label="Exercise configuration">${[['target',"Target"],['progression',"Progression"],['options','Options']].map(([id,l])=>`<button role="tab" id="tab-${id}" aria-controls="tab-content" tabindex="${tab===id?0:-1}" aria-selected="${tab===id}" data-action="tab" data-value="${id}">${l}</button>`).join('')}</div>`;
  let body=custom&&tab!=='options'?`<div class="notice neutral">${ic('info',18)}<span>This program was configured outside the editor. Its phases are preserved.</span></div><div class="preserved"><span class="chip">Imported program</span><span class="chip">Read only</span></div><div class="form-section">${btn('presets',"Choose a template to replace it",'secondary')}<p class="hint">Replacement requires confirmation. Notes remain editable.</p></div>`:tab==='target'?targetHTML():tab==='progression'?progressionHTML():advancedHTML();
  const valid=validation();
  $('#screen').innerHTML=hero+tabs+`<section id="tab-content" role="tabpanel" aria-labelledby="tab-${tab}">${body}</section>${!valid.ok?`<div class="notice error" role="alert">${ic('warn',17)}<span>${!valid.warmupOk?"Check warm-up: 1–5 steps, 1–100% and 1–30 reps.":!valid.intensifierOk?"Check the intensifier values against the limits shown.":"Check the values: stay within the limits and keep the range start at or below its end."} Fix the fields before saving.</span></div>`:''}`;
  const label=editingId?"Save changes":replaceId?"Replace exercise":"Add to routine";
  $('#app-footer').innerHTML=`<div class="footer-summary"><strong id="live-summary">${esc(summary(draft))}</strong><button data-action="exercise-preview">Preview</button></div><button class="button primary" data-action="save-exercise" ${valid.ok&&!ex.unknown?'':'disabled'}>${ic('check',18)}${label}</button>`;
}
function loadHTML(path,load,label,rangeable=false,upTo=null,allowNone=true) {
  const mode=load.mode,loaded=['absolute','percent_1rm'].includes(mode),key=mode==='percent_1rm'?'percent':'value';
  return `<div class="starting-load" data-section="starting-load"><div class="field-label"><span>${esc(label)}</span>${rangeable&&loaded?`<button class="range-toggle" data-action="load-range" data-path="${path}">${upTo?"Fixed value":"Use a range"}</button>`:''}</div><div class="form-grid">${selectField(`${path}.mode`,mode,"Expressed as",[...(allowNone?[['empty',"No load"]]:[]),['absolute',state.unit],['percent_1rm',"% 1RM"]])}${loaded?stepper(`${path}.${key}`,load[key],"Load",{step:key==='percent'?2.5:(draft.rule.rounding.step||2.5),max:key==='percent'?300:100000,unit:key==='percent'?'%':state.unit}):'<div class="field"><span class="field-label">Load</span><span class="load-path-none">No load</span></div>'}</div>${upTo?stepper(`loadTo.${key}`,upTo[key],'Range end',{step:2.5,max:100000,unit:key==='percent'?'%':state.unit}):''}${!loaded?'<p class="hint">This target does not require a load.</p>':''}</div>`;
}
function targetLoadHTML(p) {
  const t=p.target,loaded=t.mode!=='none',key=t.mode==='percent_1rm'?'percent':'value';
  return `<div class="starting-load target-load" data-section="target-load"><div class="field-label"><span>${draft.assisted?"Target assistance":"Target load"}</span></div><div class="form-grid">${selectField('target.mode',t.mode,"Expressed as",[['none',"No limit"],['absolute',state.unit],['percent_1rm',"% 1RM"]])}${loaded?stepper(`target.${key}`,t[key],"Load",{step:key==='percent'?2.5:(draft.rule.rounding.step||2.5),max:key==='percent'?300:100000,unit:key==='percent'?'%':state.unit}):'<div class="field"><span class="field-label">Load</span><span class="load-path-none">No limit</span></div>'}</div></div>`;
}
function presetCopy(preset,timed) {
  const copy=[...LABELS[preset]];
  if(preset==='autoregulated')copy[2]=`You set every value by feel (${timed?'seconds':'reps'} and load); nothing is advanced for you.`;
  if(preset==='double'){copy[1]=timed?'Time first':'Reps first';copy[2]=`Reach the top of the ${timed?'time':'rep'} range, then add weight and start again.`;}
  if(preset==='triple'){copy[1]=`Sets, ${timed?'time':'reps'}, load`;copy[2]=`Fill sets and ${timed?'duration':'reps'} up to the top of the range, then add weight.`;}
  if(preset==='greyskull'&&timed)copy[2]='Add weight when you hit the target; hold the last set as long as possible.';
  return copy;
}
function effortRange(rir) {return state.effort==='rpe'?{min:10-rir.max,max:10-rir.min}:rir;}
function targetHTML() {
  const p=optionsOf(),preset=draft.rule.preset,def=E.PRESETS[preset],ex=exOf(draft),timed=!!p.durationSeconds,copy=presetCopy(preset,timed);
  if(ex.cardio) return `<p class="preset-hint">Every interval has the same duration and speed, with no strength progression or rest between sets.</p><div class="form-grid">${stepper('cardio.sets',p.sets.min,"Intervals",{min:1,max:100})}${stepper('cardio.minutes',p.durationSeconds.min/60,"Duration",{min:1,max:240,unit:'min'})}<div class="full">${stepper('cardio.speed',state.unit==='lb'?Number((p.speed.value/1.609344).toFixed(2)):p.speed.value,"Speed",{step:.5,min:0,max:100,unit:state.unit==='lb'?'mph':'km/h'})}</div></div><p class="hint">Incline is recorded during the workout and is not a field in this editor.</p>`;
  const supportsTime=!['hold_seconds','bodyweight_ladder','five_three_one','pyramid_reps','top_set_backoff','accumulation_intensification','density'].includes(preset);
  let html=`<button class="preset-selector" data-action="presets"><div><strong>${LABELS[preset][0]}</strong><small>${copy[1]}</small></div>${ic('chevR',18)}</button><p class="preset-hint">${copy[2]}</p>`;
  if(supportsTime) html+=segmented('target-mode',timed?'time':'reps',[['reps',"Reps"],['time',"Time"]]);
  html+='<div class="form-section">';
  if(!['five_three_one','pyramid_reps','top_set_backoff'].includes(preset))html+=rangeField('sets',p.sets,"Sets",def.ranges.sets,1,100);
  if(!['five_three_one','pyramid_reps'].includes(preset))html+=timed?rangeField('durationSeconds',p.durationSeconds,"Duration in seconds",def.ranges.durationSeconds,5,86400):rangeField('reps',p.reps,preset==='top_set_backoff'?"Top set reps":"Reps",def.ranges.reps,1,1000);
  const fromLoad=!['five_three_one','accumulation_intensification'].includes(preset),toLoad=def.metrics.includes('target_load');
  if(fromLoad||toLoad)html+=`<div class="load-pair">${fromLoad?loadHTML('load',p.load,p.offsets||preset==='top_set_backoff'?"Anchor load":draft.assisted?"Starting assistance":"Starting load",def.ranges.load==='either',p.loadTo,def.steps!=='load'&&preset!=='density'):''}${toLoad?targetLoadHTML(p):''}</div>`;
  if(p.load.mode==='percent_1rm'&&state.oneRm==null)html+=`<div class="notice">${ic('warn',17)}<span>No recorded 1RM. You can save the plan; load will be requested when the workout starts.</span></div>`;
  if(p.setReps)html+=perSetRepsHTML(p);
  if(p.offsets)html+=offsetsHTML(p);
  if(p.trainingMax)html+=trainingMaxHTML(p);
  if(preset==='top_set_backoff')html+=`<h3 class="section-title">Back-off sets</h3><p class="hint">Follow the top set at a percentage of its load.</p><div class="form-grid form-section">${stepper('backoff.sets',p.backoff.sets,"Sets",{min:1,max:99})}${stepper('backoff.reps',p.backoff.reps,"Reps",{min:1,max:1000})}${stepper('backoff.percent',p.backoff.percent,"Top set load",{min:5,max:100,step:5,unit:'%'})}${stepper('backoff.restSeconds',p.backoff.restSeconds,"Rest",{min:0,max:3600,step:15,unit:"sec"})}</div>`;
  if(preset==='accumulation_intensification')html+=`<div class="form-section"><h3 class="section-title">Accumulation</h3>${stepper('accumulation.percent',p.accumulation.percent,'% of training max',{min:1,max:300,step:2.5,unit:'%'})}</div><div class="form-section"><h3 class="section-title">Intensification</h3><div class="form-grid">${stepper('intensification.sets',p.intensification.sets,"Sets",{min:1,max:100})}${stepper('intensification.reps',p.intensification.reps,"Reps",{min:1,max:1000})}${stepper('intensification.percent',p.intensification.percent,'Training max',{min:1,max:300,step:2.5,unit:'%'})}${stepper('intensification.successes',p.intensification.successes,"Successful sessions",{min:1,max:100})}</div>${settingToggle('program.repeat',"Repeat at the end","Restart the accumulation block.",p.end==='repeat')}</div>`;
  if(preset==='bodyweight_ladder')html+=`<div class="field"><label for="rungs">Harder variations</label><textarea id="rungs" class="input" data-text="rungs" placeholder="One variation per line">${esc((p.rungs||[]).join('\n'))}</textarea><p class="hint">One variation per line. Advance after completing the prescribed sets and reps.</p></div>`;
  html+=`<section class="form-section inline-settings" data-section="rest"><div class="section-head"><h3 class="section-title">${preset==='density'?"Starting rest":"Rest"}</h3><span class="muted small tnum">${draft.restFromProfile?"Profile · 1:30":duration(p.restSeconds)}</span></div>${!draft.restFromProfile?stepper('restSeconds',p.restSeconds,"Rest seconds",{min:0,max:3600,step:15,unit:"sec"}):''}${settingToggle('occ.restFromProfile',"Use equipment profile rest",'',draft.restFromProfile)}<p class="hint">0:00 uses equipment profile rest (1:30 in this mock).</p></section>`;
  if(state.effort!=='none'){
    const rpe=state.effort==='rpe',kind=rpe?'RPE':'RIR',effort=p.rir?effortRange(p.rir):null;
    html+=`<section class="form-section inline-settings" data-section="effort"><h3 class="section-title">Target ${kind}</h3>${settingToggle('program.rir',`Use ${rpe?'an RPE':'a RIR'} range`,rpe?'How hard you want the set to feel.':timed?'Effort you want to keep in reserve.':'Reps you want to leave in reserve.',!!p.rir)}${effort?`<div class="form-grid">${stepper(rpe?'rir.max':'rir.min',effort.min,`Minimum ${kind}`,{min:0,max:10})}${stepper(rpe?'rir.min':'rir.max',effort.max,`Maximum ${kind}`,{min:0,max:10})}</div><p class="hint">${rpe?'Load increases only if the hardest set stays within this effort target.':'Load increases only if the hardest set keeps at least this reserve.'}</p>`:''}</section>`;
  }
  if(preset!=='pyramid_reps'&&E.supports(draft.rule).failure&&draft.intensifier?.type!=='restpause')html+=failureHTML(p);
  return html+'</div>';
}
function failureHTML(p) {
  const sets=E.failureSetRange(draft.rule);
  const selection=E.failureSetsOf(draft),mode=typeof selection==='string'?selection:selection.length?'custom':'none';
  return `<section class="form-section inline-settings" data-section="failure"><h3 class="section-title">Sets to failure</h3><p class="hint">Reach the minimum ${p.durationSeconds?'duration':'reps'}, then continue to failure in the selected sets. ${state.effort==='none'?'No effort rating is required.':state.effort.toUpperCase()+' is optional.'}</p>${segmented('failure-mode',mode,[['none',"None"],['last',"Last"],['all',"All"]])}<div class="failure-sets" role="group" aria-label="Choose sets to failure">${Array.from({length:sets.max},(_,i)=>`<button data-action="failure-set" data-index="${i}" aria-pressed="${E.failureSetSelected(draft,i,sets.max)}" aria-label="Set ${i+1}${i>=sets.min?", optional":''} to failure">${i+1}${i>=sets.min?'<span aria-hidden="true">?</span>':''}</button>`).join('')}</div><p class="hint">Tap set numbers to combine them. <strong>+</strong> all to failure; <strong>(+)</strong> at least one.${sets.min!==sets.max?" Sets marked ? are optional. “Last” follows the prescribed set count.":''} Warm-up is excluded.</p></section>`;
}
function perSetRepsHTML(p) {
  return `<div class="form-section"><h3 class="section-title">A target for each set</h3><div class="filter-strip">${[[12,10,8,6],[6,8,10,12],[12,10,8,10,12],[12,8,6,'max',12]].map((v,i)=>`<button data-action="pyramid-pattern" data-value="${i}">${v.map(x=>x==='max'?'Max':x).join(' · ')}</button>`).join('')}</div>${p.setReps.map((v,i)=>`<div class="per-set"><div class="per-set-head"><strong>Sets ${i+1}</strong><div class="row"><button class="range-toggle" data-action="set-max" data-index="${i}" aria-pressed="${v==='max'}">${v==='max'?"Max enabled":"Use Max"}</button>${iconButton('remove-set','trash',"Remove set "+(i+1),`data-index="${i}" ${p.setReps.length===1?'disabled':''}`)}</div></div><div class="form-grid">${v==='max'?"<p class=\"hint\">AMRAP: as many reps as possible.</p>":stepper(`setReps.${i}`,v,"Reps",{min:1,max:1000})}${!draft.bodyweight?stepper(`setWeights.${i}`,p.setWeights?.[i]||0,"Load",{step:2.5,max:100000,unit:state.unit}):''}<div class="full">${stepper(`setRest.${i}`,p.setRest?.[i]||0,"Rest",{step:15,max:3600,unit:"sec"})}</div></div></div>`).join('')}${btn('add-set',"Add set",'tinted small',p.setReps.length>=E.SET_REPS_MAX?'disabled':'')}<p class="hint">Rest set to 0 uses the exercise value. Max applies to the individual set.</p></div>`;
}
function offsetsHTML(p) {
  const direction=p.offsets[0].percentOfAnchor<=p.offsets.at(-1).percentOfAnchor?'ascending':'descending';
  return `<div class="form-section"><h3 class="section-title">Pyramid</h3>${selectField('offsetDirection',direction,"Direction",[['ascending',"Lightest first"],['descending',"Heaviest first"]])}${p.offsets.map((o,i)=>`<div class="per-set"><div class="per-set-head"><strong>Sets ${i+1}</strong>${iconButton('remove-offset','trash',"Remove set "+(i+1),`data-index="${i}" ${p.offsets.length<=1?'disabled':''}`)}</div><div class="form-grid">${stepper(`offsets.${i}.percentOfAnchor`,o.percentOfAnchor,"Anchor load",{step:5,min:5,max:300,unit:'%'})}${o.percentOfAnchor!==100?stepper(`offsets.${i}.reps`,o.reps??p.reps.min,"Reps",{min:1,max:1000}):"<p class=\"hint\">Anchor load</p>"}</div></div>`).join('')}<div class="row wrap">${btn('add-offset',"Add set",'tinted small',p.offsets.length>=E.MAX_GROUPS?'disabled':'')}${direction==='descending'?btn('rpt',"Apply RPT",'secondary small'):''}${p.offsets.some(o=>o.reps)?btn('same-reps',"Same reps",'secondary small'):''}</div></div>`;
}
function trainingMaxHTML(p) {
  return `<div class="form-section"><h3 class="section-title">Training max</h3>${segmented('tm-mode',p.trainingMax.mode,[['ninety_percent_1rm',"90% of 1RM"],['direct',"Direct value"]])}${p.trainingMax.mode==='direct'?stepper('trainingMax.value',p.trainingMax.value,'Training max',{step:2.5,min:1,max:100000,unit:state.unit}):`<p class="hint">${state.oneRm?`1RM demo: ${fmt(state.oneRm)} ${state.unit}. Training max is 90%, rounded to the selected step.`:"Missing 1RM: load will be requested when the workout starts."}</p>`}${draft.rule.preset==='five_three_one'?`<div class="cycle-tabs">${['5','3','5/3/1',"Deload"].map((w,i)=>`<button data-action="week" data-value="${i}" class="${week===i?'active':''}" aria-pressed="${week===i}">W${i+1} · ${w}</button>`).join('')}</div><table class="preview-table"><thead><tr><th>Sets</th><th>% TM</th><th>Reps</th></tr></thead><tbody>${p.cycleSets[week].map((s,i)=>`<tr><td>${i+1}</td><td>${s.percentOfTM}%</td><td>${s.reps}${s.amrap?'+':''}</td></tr>`).join('')}</tbody></table><p class="hint">+ marks an AMRAP set. The cycle follows the app editor.</p>`:''}</div>`;
}
function progressionHTML() {
  const p=optionsOf(),preset=draft.rule.preset,def=E.PRESETS[preset],ex=exOf(draft),loaded=def.steps==='load',copy=presetCopy(preset,!!p.durationSeconds);
  if(ex.cardio)return '<div class="notice neutral">'+ic('info',18)+"<span>Cardio uses intervals, duration and speed. Strength progression templates do not apply.</span></div>";
  let html=`<button class="preset-selector" data-action="presets"><div><strong>${LABELS[preset][0]}</strong><small>Change progression strategy</small></div>${ic('chevR',18)}</button><p class="preset-hint">${copy[2]}</p>`;
  if(loaded||def.metrics.includes('target_load')){
    const targetLoaded=p.target.mode!=='none';
    html+=`<section class="form-section load-path" data-section="load-progression"><div class="section-head"><h3 class="section-title">${draft.assisted?"Assistance and progression":"Load and progression"}</h3><button class="range-toggle" data-action="tab" data-value="target">Edit loads</button></div><div class="load-path-summary"><span>Start<strong>${esc(loadText(p.load))}</strong></span>${ic('chevR',18)}<span>Target<strong>${targetLoaded?esc(loadText(p.target)):"No limit"}</strong></span></div>${loaded?`<div class="load-path-step form-grid">${selectField('step.type',p.step.type,"Increment type",E.INCREMENT_TYPES.filter(t=>(t==='percentage_points')===(p.load.mode==='percent_1rm')).map(t=>[t,INCREMENTS[t]]))}${stepper('step.value',p.step.value,draft.assisted?"Reduce assistance by":"Increase load by",{step:p.step.type==='absolute'?.25:.5,min:.01,max:1000,unit:p.step.type==='absolute'?state.unit:'%'})}</div>`:''}<p class="hint">${draft.assisted?"Reduce machine assistance after a successful session until you reach the target assistance. Set both loads in Target.":loaded?"The increment sets how much to add after a successful session. Set the start and target loads in Target.":"Target load is the goal. This template does not increase load automatically. Set it in Target."}</p></section>`;
  }
  if(def.steps==='seconds')html+=stepper('step.value',p.step.value,"Seconds added",{step:5,min:1,max:3600,unit:"sec"});
  if(preset==='density')html+=`<div class="form-grid">${stepper('restStep',p.restStep,"Reduce rest by",{step:5,max:3600,unit:"sec"})}${stepper('restFloor',p.restFloor,"Reach the shortest rest",{step:5,max:3600,unit:"sec"})}</div>`;
  if(preset==='top_set_backoff')html+=selectField('scope',p.scope,"Sets that decide the increase",[['top',"Top set only"],['all',"All sets"]]);
  if(p.trainingMax)html+=stepper('cycleIncrement.value',p.cycleIncrement.value,"Training max increase per cycle",{step:2.5,min:.01,max:1000,unit:state.unit});
  if(def.metrics.length)html+=disclosure('completion',"When to stop progression",p.completion.length?`${p.completion.length} ${p.completion.length===1?'condition':'conditions'}`:"None",`<p class="hint">Progression ends when all selected conditions are met.</p>${def.metrics.map(metric=>{const selected=p.completion.find(c=>c.metric===metric);return `${settingToggle(`metric.${metric}`,p.durationSeconds&&metric==='max_reps'?"Reach the longest duration":METRICS[metric],'',!!selected)}${selected&&['cycle_count','training_max','rest_floor'].includes(metric)||selected&&metric==='max_duration'&&preset==='hold_seconds'?stepper(`completion.${metric}`,selected.target,"Target",{step:metric==='cycle_count'?1:metric==='training_max'?2.5:5,min:1,max:100000,unit:metric==='training_max'?state.unit:metric==='cycle_count'?"cycles":"sec"}):''}`;}).join('')}`);
  if(def.stalls)html+=disclosure('deload',"If progression stalls",p.deload?`After ${p.deload.after} · at ${Math.round(p.deload.factor*100)}%`:"No deload",`${settingToggle('program.deload',"Deload after unsuccessful sessions","Reduce the load and build up again.",!!p.deload)}${p.deload?`${stepper('deload.after',p.deload.after,"Consecutive sessions",{min:1,max:10})}${stepper('deload.factor',Math.round(p.deload.factor*100),"Reduce to",{step:5,min:50,max:95,unit:'%'})}`:''}`);
  return html;
}
function advancedHTML() {
  const p=optionsOf(),ex=exOf(draft),custom=draft.imported||!E.isTemplateRule(draft.rule),can=E.supports(draft.rule),timed=!!p.durationSeconds,preset=draft.rule.preset;
  if(ex.cardio)return noteHTML();
  const canBackoff=!timed&&!draft.bodyweight&&!draft.assisted&&draft.intensifier?.type!=='restpause'&&!['pyramid_reps','pyramid'].includes(preset);
  let html=custom?'<div class="notice neutral">'+ic('info',18)+"<span>Imported program settings are preserved. You can edit the note without replacing the program.</span></div>":`<div class="group">${settingToggle('occ.bodyweight',"Bodyweight",draft.bodyweight?"Any load prescribed by the progression is additional weight.":"Enter a load for each set.",draft.bodyweight)}${settingToggle('occ.side',timed?"Time per side":"Reps per side",timed?(draft.side?`${p.sets.min} sets become ${p.sets.min*2}: one full hold per side.`:"Train the left and right sides separately."):(draft.side?`${p.reps.max} total reps = ${p.reps.max/2} per side.`:"The total is split between left and right."),draft.side)}${canBackoff?settingToggle('occ.backoff',"Descending load per set","Each set is one increment lighter than the previous set.",draft.backoff):''}</div><p class="hint">Per-set back-off is separate from the “Top set and back-off” template.</p>`;
  if(!custom&&ex.eq==='dumbbell'&&!draft.bodyweight)html+=`<div class="form-section">${disclosure('db-load',"Dumbbell weight means",({as:"As entered",each:"One dumbbell",total:"Both"})[draft.dbLoad||'as'],`${segmented('db-load',draft.dbLoad||'as',[['as',"As entered"],['each','One'],['total',"Both"]])}<p class="hint">${draft.dbLoad==='each'?"20 kg means 20 kg per hand. Volume includes both dumbbells.":draft.dbLoad==='total'?"40 kg means two 20 kg dumbbells.":"Volume counts the weight exactly as entered."}</p>`)}</div>`;
  if(!custom&&(p.load.mode!=='empty'||p.trainingMax)&&draft.rule.rounding.mode!=='allowed_values')html+=disclosure('rounding',"Load rounding",`${fmt(draft.rule.rounding.step)} ${state.unit}`,`${segmented('rounding-mode',draft.rule.rounding.mode,[['nearest',"Nearest"],['up',"Up"],['down',"Down"]])}${stepper('rounding.step',draft.rule.rounding.step,"Available increment",{step:.25,min:.01,max:1000,unit:state.unit})}`);
  if(draft.rule.rounding.mode==='allowed_values')html+="<p class=\"hint\">Imported available loads are preserved.</p>";
  if(!custom&&can.warmup)html+=disclosure('warmup',"Warm-ups",({off:"Off",smart:"Smart ramp",template:"Custom percentages"})[draft.warmup.mode],warmupHTML());
  if(!custom&&(can.dropset||can.restpause))html+=disclosure('intensifier',"Intensifier",draft.intensifier?.type==='dropset'?"Drops":draft.intensifier?.type==='restpause'?'Rest-pause':"None",`${segmented('intensifier',draft.intensifier?.type||'',[['',"None"],...(can.dropset?[['dropset',"Drops"]]:[]),...(can.restpause?[['restpause','Rest-pause']]:[])])}${draft.intensifier?.type==='dropset'?`<div class="form-grid">${stepper('occ.intensifier.count',draft.intensifier.count,"Number of drops",{min:1,max:5})}${stepper('occ.intensifier.pct',draft.intensifier.pct,"Load reduction",{min:5,max:90,step:5,unit:'%'})}</div>`:draft.intensifier?.type==='restpause'?`<div class="form-grid">${stepper('occ.intensifier.totalReps',draft.intensifier.totalReps,"Total reps",{min:1,max:100})}${stepper('occ.intensifier.restSec',draft.intensifier.restSec,"Short rest",{min:5,max:120,step:5,unit:"sec"})}</div><p class="hint">Working sets become one set with short rests.</p>`:''}`);
  if(!custom&&(!can.warmup||!can.dropset||!can.restpause))html+=`<p class="hint">${timed?"Warm-up and intensifiers are not available for timed holds.":"Options incompatible with this target do not apply."}</p>`;
  if(!custom&&!timed)html+=disclosure('plates',"Plate loading",plateSummary(),platesHTML());
  return html+`<div class="form-section">${noteHTML()}</div>`;
}
function noteHTML() {return `<div class="field"><label for="exercise-note">Note for this routine <span id="note-count">${draft.note.length}/500</span></label><textarea id="exercise-note" class="input" data-text="note" maxlength="500" placeholder="Indicazioni, posizione, cose da ricordare…">${esc(draft.note)}</textarea><p class="hint">This note appears with the exercise during the workout.</p></div>`;}
function warmupHTML() {
  const w=draft.warmup,ex=exOf(draft);
  let html=segmented('warmup-mode',w.mode,[['off',"Off"],['smart',"Smart"],['template',"Custom"]]);
  if(w.mode==='smart')html+=stepper('occ.warmup.count',w.count,"Warm-up sets",{min:1,max:E.warmupMaxCount(ex.eq)});
  if(w.mode==='template')html+=w.steps.map((s,i)=>`<div class="per-set"><div class="per-set-head"><strong>Step ${i+1}</strong>${iconButton('remove-warmup','trash',"Remove step "+(i+1),`data-index="${i}" ${w.steps.length===1?'disabled':''}`)}</div><div class="form-grid">${stepper(`occ.warmup.steps.${i}.percent`,s.percent,"Working load",{min:1,max:100,step:5,unit:'%'})}${stepper(`occ.warmup.steps.${i}.reps`,s.reps,"Reps",{min:1,max:30})}</div></div>`).join('')+btn('add-warmup',"Add step",'tinted small',w.steps.length>=5?'disabled':'');
  if(w.mode!=='off')html+=`<p class="hint">${E.warmupSteps(w,ex.eq).map(s=>`${s.percent}% × ${s.reps}`).join(' · ')}. Loads are rounded to available increments; duplicate sets are excluded.</p>`;
  return html;
}
function globalLoad() {return state.globalLoads[draft.exerciseId]||{kind:exOf(draft).eq==='barbell'?'pairs':'none',base:exOf(draft).eq==='barbell'?20:0,noBar:false};}
function plateSummary() {return ({pairs:"Plates per side",single:'Single stack',none:"Off"})[globalLoad().kind];}
function platesHTML() {
  const g=globalLoad();
  return `${segmented('plate-kind',g.kind,[['pairs',"Per side"],['single','Single stack'],['none',"Off"]])}${g.kind!=='none'?`${exOf(draft).eq==='barbell'?settingToggle('global.noBar',"No bar","Recorded weight includes plates only.",g.noBar):''}${!g.noBar?stepper('global.base',g.base,exOf(draft).eq==='barbell'?"Bar weight":"Frame weight",{step:2.5,max:100000,unit:state.unit}):''}`:''}<p class="hint">Applies to this exercise in every mock routine immediately, including when other changes are cancelled.</p>`;
}
function renderPicker() {
  $('#app-header').innerHTML=`<div class="bar"><button class="back-button" data-action="close-picker" aria-label="Go back">${ic('chevL')}</button><div class="grow"><h2>${replaceId?"Replace exercise":"Add exercises"}</h2><span class="subtitle">${esc(state.name)}</span></div>${iconButton('custom','plus',"Create custom exercise")}</div>`;
  $('#screen').innerHTML=`<div class="search-box">${ic('search',18)}<input id="exercise-search" type="search" placeholder="Search for an exercise" aria-label="Search exercises" value="${esc(query)}"></div><div class="filter-strip">${[['',"All"],['favorites',"Favourites"],['chosen',"Previously used"],['same',"Same muscle"]].filter(([id])=>id!=='same'||replaceId).map(([id,l])=>`<button data-action="scope" data-value="${id}" class="${scope===id?'active':''}" aria-pressed="${scope===id}">${l}</button>`).join('')}</div><div class="form-grid">${selectField('picker.muscle',muscle,"Muscle",[['',"All"],...["Chest","Back","Shoulders","Biceps","Triceps","Legs",'Core','Cardio'].map(x=>[x,x])])}${selectField('picker.category',category,"Type",[['',"All"],["Strength","Strength"],["Bodyweight","Bodyweight"],['Cardio','Cardio']])}</div><div class="filter-strip">${['',"Barbell","Dumbbells","Cable","Machine","Bodyweight","Treadmill","Custom"].map(eq=>`<button data-action="equipment" data-value="${eq}" class="${equipment===eq?'active':''}" aria-pressed="${equipment===eq}">${eq||"All equipment"}</button>`).join('')}</div><div class="group">${settingToggle('picker.showAll',"Include unavailable equipment","Demo equipment profile: Home gym.",showAll)}</div><div id="picker-results"></div>`;
  renderPickerResults();$('#app-footer').innerHTML=btn('close-picker',replaceId?"Cancel replacement":"Finish",'secondary');
}
function pickerItems() {
  const like=state.exercises.find(x=>x.occurrenceId===replaceId),q=query.trim().toLocaleLowerCase('en');
  return CATALOGUE.filter(ex=>!q||`${ex.name} ${ex.muscle} ${ex.equipment}`.toLocaleLowerCase('en').includes(q)).filter(ex=>!muscle||ex.muscle===muscle).filter(ex=>!category||ex.category===category).filter(ex=>!equipment||ex.equipment===equipment).filter(ex=>showAll||!["Cable","Machine","Treadmill"].includes(ex.equipment)).filter(ex=>scope==='favorites'?state.favorites.includes(ex.id):scope==='chosen'?state.exercises.some(o=>o.exerciseId===ex.id):scope==='same'?ex.muscle===exOf(like).muscle:true).sort((a,b)=>Number(state.favorites.includes(b.id))-Number(state.favorites.includes(a.id)));
}
function renderPickerResults() {
  const list=pickerItems();
  $('#picker-results').innerHTML=`<div class="picker-topline"><span>${list.length} results in the demo catalogue</span>${query||muscle||equipment||category||scope?"<button class=\"range-toggle\" data-action=\"clear-filters\">Clear filters</button>":''}</div>${list.length?list.map(ex=>`<div class="picker-row">${ex.custom?`<span class="glyph-button">${ic('dumb',24)}</span>`:`<img class="exercise-thumb" src="editor-assets/${ex.id}.webp" alt="" loading="lazy">`}<button class="exercise-open" data-action="pick-config" data-id="${ex.id}"><strong>${state.favorites.includes(ex.id)?ic('star',12):''}${esc(ex.name)}</strong><small>${esc(ex.muscle)} · ${esc(ex.equipment)}</small>${state.exercises.some(o=>o.exerciseId===ex.id)?"<span class=\"chip accent\">In this routine</span>":''}</button><button class="icon-button" data-action="quick-add" data-id="${ex.id}" aria-label="${replaceId?"Replace with":"Add"} ${esc(ex.name)}">${ic(replaceId?'check':'plus',18)}</button></div>`).join(''):`<div class="empty-state">${ic('search',36)}<h3>No exercises found</h3><p>Try another name or remove a filter.</p>${btn('clear-filters',"Clear filters",'tinted')}${btn('custom',"Create custom exercise",'secondary')}</div>`}`;
}
function render(resetScroll=false) {
  const scroll=$('#screen').scrollTop;
  if(page==='routine')renderRoutine();else if(page==='exercise')renderExercise();else renderPicker();
  $('#screen').scrollTop=resetScroll?0:scroll;
  document.documentElement.dataset.theme=state.theme;document.documentElement.dataset.accent=state.accent;
  syncDemoControls();
}
function openSheet(title,body) {
  $('#sheet-title').textContent=title;$('#sheet-body').innerHTML=body;$('#sheet [data-action="close-sheet"]').innerHTML=ic('x',18);
  const phone=$('.editor-phone').getBoundingClientRect();
  if(innerWidth>520){$('#sheet').style.left=`${phone.left+phone.width/2}px`;$('#sheet').style.bottom=`${innerHeight-phone.bottom+10}px`;}else{$('#sheet').style.left='';$('#sheet').style.bottom='';}
  if(!$('#sheet').open)$('#sheet').showModal();
}
function closeSheet() {$('#sheet').close();}
function presetsSheet() {
  const timed=!!optionsOf().durationSeconds;
  const groups=[["At your pace",['autoregulated']],["Build the progression",['linear','greyskull','double','triple','hold_seconds','bodyweight_ladder']],["Arrange sets",['pyramid_reps','pyramid','top_set_backoff']],["Cycles and density",['five_three_one','accumulation_intensification','density']]];
  openSheet("Choose a progression",groups.map(([name,ids])=>`<h3 class="sheet-section">${name}</h3>${ids.filter(id=>id!=='triple'||!draft.bodyweight||optionsOf().load.value>0||draft.rule.preset==='triple').map(id=>`<button class="preset-option" data-action="choose-preset" data-value="${id}"><span class="grow"><strong>${LABELS[id][0]}</strong><small>${presetCopy(id,timed)[2]}</small></span>${draft.rule.preset===id?ic('check',20):ic('chevR',16)}</button>`).join('')}`).join(''));
}
function choosePreset(id,force=false) {
  if(!force&&(draft.imported||!E.isTemplateRule(draft.rule))){openSheet("Replace the imported program?",`<p class="sheet-copy">The template “${LABELS[id][0]}” will replace custom phases. The exercise and notes are preserved.</p><div class="sheet-actions">${btn('confirm-preset',"Replace program",'primary',`data-value="${id}"`)}${btn('close-sheet',"Keep program")}</div>`);return;}
  draft.rule=E.defaultPlanRule(id,{id:draft.rule.id,exerciseId:draft.exerciseId,routineId:'mock-routine',unit:state.unit});
  if(id==='greyskull')draft.lastToFailure=true;
  else if(!E.supports(draft.rule).failure)delete draft.lastToFailure;
  delete draft.imported;draft.rangeOpen=[];draft.invalidFields=[];cleanCapabilities();closeSheet();render();
}
function cleanCapabilities() {
  const can=E.supports(draft.rule),p=optionsOf();
  if(!can.warmup)draft.warmup={mode:'off'};
  if(draft.intensifier&&!can[draft.intensifier.type])delete draft.intensifier;
  if(p.durationSeconds||draft.bodyweight||draft.assisted||draft.intensifier?.type==='restpause'||['pyramid','pyramid_reps'].includes(draft.rule.preset))delete draft.backoff;
  if(!can.failure||draft.intensifier?.type==='restpause')delete draft.failureSets;
  if(draft.rule.preset==='pyramid_reps')delete draft.lastToFailure;
  if(Array.isArray(draft.failureSets))draft.failureSets=draft.failureSets.filter(n=>n<=E.failureSetRange(draft.rule).max);
}
function normalizeGroups() {
  state.exercises.forEach((occ,i)=>{if(!occ.sg)return;const indices=state.exercises.map((x,j)=>x.sg===occ.sg?j:-1).filter(j=>j>=0);if(indices.length<2||indices.some((x,j)=>j&&x!==indices[j-1]+1)){delete occ.sg;delete occ.sgName;delete occ.sgRest;}});
}
function leaveExercise() {
  if(!draft){page='routine';render(true);return;}
  const original=state.exercises.find(o=>o.occurrenceId===editingId);
  const cleaned=clone(draft);delete cleaned.rangeOpen;delete cleaned.invalidFields;
  if(!editingId||JSON.stringify(original)!==JSON.stringify(cleaned))openSheet("Leave without saving?",`<p class="sheet-copy">Exercise changes will be discarded. Plate settings already applied are kept.</p><div class="sheet-actions">${btn('discard-exercise',"Discard changes",'danger')}${btn('close-sheet',"Keep editing",'primary')}</div>`);
  else {page='routine';draft=null;render(true);}
}
function saveExercise() {
  if(!validation().ok||exOf(draft).unknown)return;
  cleanCapabilities();
  const saved=clone(draft);delete saved.rangeOpen;delete saved.invalidFields;saved.note=saved.note.trim();
  if(editingId){const i=state.exercises.findIndex(x=>x.occurrenceId===editingId);if(i>=0)state.exercises[i]=saved;}
  else if(replaceId){const i=state.exercises.findIndex(x=>x.occurrenceId===replaceId);if(i>=0)state.exercises[i]=saved;}
  else state.exercises.push(saved);
  normalizeGroups();persist();page='routine';draft=null;editingId=null;replaceId=null;render(true);toast("Exercise saved in the demo routine.");
}
function pick(id,quick) {
  const ex=CATALOGUE.find(e=>e.id===id),old=state.exercises.find(x=>x.occurrenceId===replaceId);
  let next=old?{...clone(old),exerciseId:id,rule:{...clone(old.rule),exerciseId:id},assisted:!!ex.assisted,bodyweight:!!ex.bodyweight,side:!!ex.side}:makeOccurrence(id);
  if(old&&ex.cardio)next.rule=E.editPlan(E.defaultPlanRule('autoregulated',{id:next.rule.id,exerciseId:id,routineId:'mock-routine',unit:state.unit}),E.cardioParameters({sets:4,min:5,speed:8}));
  else if(old&&exOf(old).cardio&&!ex.cardio)next.rule=E.defaultPlanRule(ex.timed?'hold_seconds':'double',{id:next.rule.id,exerciseId:id,routineId:'mock-routine',unit:state.unit});
  if(!old&&state.unit==='lb')next=convertOccurrenceUnit(next,'lb');
  if(quick){if(old){const index=state.exercises.indexOf(old);state.exercises[index]=next;replaceId=null;page='routine';}else state.exercises.push(next);persist();render();toast(`${ex.name} ${old?"replaced":"added"}.`);return;}
  draft=next;editingId=null;tab='target';page='exercise';render(true);
}
function removeExercise(id) {
  const before=clone(state.exercises),occ=state.exercises.find(x=>x.occurrenceId===id);if(!occ)return;
  state.exercises=state.exercises.filter(x=>x.occurrenceId!==id);normalizeGroups();persist();closeSheet();page='routine';draft=null;render(true);toast(`${exOf(occ).name} removed.`,()=>{state.exercises=before;persist();render();});
}
function previewHTML(occ) {
  const p=E.planOptions(occ.rule),can=E.supports(occ.rule),ex=exOf(occ);
  if(!E.validatePlanRule(occ.rule).ok||!E.validateWarmup(occ.warmup,2))return "<p class=\"sheet-copy\">Fix the values before previewing.</p>";
  try {
    const prescription=E.generatePrescription({id:'demo-preview',now:'2026-10-11T12:00:00Z',trackId:'demo-track',rule:occ.rule,oneRm:state.oneRm?{value:state.oneRm,unit:state.unit}:null,warmup:can.warmup?occ.warmup:null,equipment:ex.eq,perSide:occ.side,bodyweight:occ.bodyweight,assisted:occ.assisted,backoff:occ.backoff,failureSets:occ.failureSets,lastToFailure:occ.lastToFailure,restPause:occ.intensifier?.type==='restpause',restPauseReps:occ.intensifier?.totalReps});
    const rows=[...(prescription.warmupRows||[]).map((r,i)=>({...r,warmup:true,label:`W${i+1}`})),...prescription.rows.flatMap((r,i)=>occ.side?["L","R"].map(side=>({...r,...(!p.durationSeconds&&r.reps?{reps:{min:r.reps.min/2,max:r.reps.max/2}}:{}),label:`${i+1} · ${side}`})):[{...r,label:String(i+1)}])];
    return `<p class="sheet-copy">${esc(ex.name)} · ${esc(summary(occ))}. Preview of the first session using demo references.</p>${state.deload?"<div class=\"notice\">Deload routine: session excluded from progression.</div>":''}${E.needsOneRm(occ.rule)&&state.oneRm==null?"<div class=\"notice\">Missing 1RM: percentage loads will be requested when the workout starts.</div>":''}<table class="preview-table"><thead><tr><th>Sets</th><th>${ex.cardio?"Speed":occ.assisted?'Assistance':"Load"}</th><th>${p.durationSeconds?"Duration":"Reps"}</th><th>${ex.cardio?'':"Rest"}</th></tr></thead><tbody>${rows.map(r=>`<tr class="${r.warmup?'warmup':''}"><td>${r.label}${r.amrap?'+':''}</td><td>${ex.cardio?fmt(state.unit==='lb'?p.speed.value/1.609344:p.speed.value)+(state.unit==='lb'?' mph':' km/h'):r.load?fmt(r.load.value)+' '+(r.load.unit||state.unit):'—'}</td><td>${p.durationSeconds&&!r.warmup?rangeText(p.durationSeconds)+(r.failure?'+':'')+" s":r.max?'Max':(typeof r.reps==='object'?rangeText(r.reps):r.reps??'—')+(r.failure?'+':'')}</td><td>${ex.cardio?'—':duration(r.restSeconds??p.restSeconds)}</td></tr>`).join('')}</tbody></table>${occ.intensifier?.type==='dropset'?`<p class="hint">${occ.intensifier.count} drops per set, reduction of ${occ.intensifier.pct}% of the load.</p>`:occ.intensifier?.type==='restpause'?`<p class="hint">${occ.intensifier.totalReps} total reps with short rests of ${occ.intensifier.restSec} s.</p>`:''}${prescription.rows.some(r=>r.failure)?"<p class=\"hint\">Sets marked + continue to failure after the prescribed minimum.</p>":''}${occ.note?`<p class="hint">Note: ${esc(occ.note)}</p>`:''}`;
  }catch{return "<p class=\"sheet-copy\">Preview is unavailable for this imported program. Its phases are preserved.</p>";}
}
function convertOccurrenceUnit(occ,unit) {
  const converted=clone(occ),factor=unit==='lb'?2.2046226218:1/2.2046226218;
  const walk=value=>{if(!value||typeof value!=='object')return;if(value.unit&&['kg','lb'].includes(value.unit)&&value.unit!==unit){if(typeof value.value==='number')value.value=Number((value.value*factor).toFixed(2));value.unit=unit;}Object.values(value).forEach(walk);};
  walk(converted.rule);converted.rule.rounding.step=unit==='lb'?5:2.5;
  const p=E.planOptions(converted.rule);if(p.setWeights)converted.rule=E.editPlan(converted.rule,{setWeights:p.setWeights.map(v=>Number((v*factor).toFixed(2)))});
  return converted;
}
function updateNumber(path,value) {
  const input=$$('input[data-number]').find(el=>el.dataset.number===path);
  if(input){const invalid=value<Number(input.min)||(input.max!==''&&value>Number(input.max));draft.invalidFields=(draft.invalidFields||[]).filter(p=>p!==path);if(invalid)draft.invalidFields.push(path);}
  if(path.startsWith('global.')){const g=clone(globalLoad());setPath(g,path.slice(7),value);state.globalLoads[draft.exerciseId]=g;persist();return;}
  if(path.startsWith('occ.')){setPath(draft,path.slice(4),value);return;}
  const p=optionsOf();
  if(path.startsWith('cardio.')){const key=path.slice(7),cfg={sets:p.sets.min,min:p.durationSeconds.min/60,speed:p.speed.value};cfg[key==='minutes'?'min':key]=key==='speed'&&state.unit==='lb'?value*1.609344:value;setOptions(E.cardioParameters(cfg));return;}
  if(path.startsWith('completion.')){const metric=path.slice(11);setOptions({completion:p.completion.map(c=>c.metric===metric?{...c,target:value}:c)});return;}
  if(path==='rounding.step'){draft.rule.rounding.step=value;return;}
  if(path==='deload.factor'){setOptions({deload:{...p.deload,factor:value/100}});return;}
  const [root,...parts]=path.split('.');
  let updated=clone(p[root]);
  if(['setWeights','setRest'].includes(root)&&!updated)updated=Array(p.setReps.length).fill(0);
  if(parts.length){if(updated==null)updated={};setPath(updated,parts.join('.'),value);}else updated=value;
  if(['sets','reps','durationSeconds'].includes(root)){
    const policy=E.PRESETS[draft.rule.preset].ranges[root],ranged=policy==='range'||p[root].min!==p[root].max||draft.rangeOpen?.includes(root);
    if(!ranged)updated={min:value,max:value};
    else if(parts[0]==='min')updated.max=Math.max(value,updated.max);else updated.min=Math.min(value,updated.min);
  }
  if(root==='rir'&&state.effort==='rpe'){value=10-value;setPath(updated,parts.join('.'),value);}
  if(root==='rir'){if(parts[0]==='min')updated.max=Math.max(value,updated.max);else updated.min=Math.min(value,updated.min);}
  if(root==='load'&&p.loadTo){setOptions({load:updated,loadTo:{...p.loadTo,[parts[0]]:Math.max(value,p.loadTo[parts[0]])}});return;}
  if(root==='loadTo'){setOptions({loadTo:updated,load:{...p.load,[parts[0]]:Math.min(value,p.load[parts[0]])}});return;}
  if(root==='setReps'){const first=updated.find(v=>v!=='max')||1;setOptions({setReps:updated,sets:{min:updated.length,max:updated.length},reps:{min:first,max:first}});return;}
  setOptions({[root]:updated});
}
function rerenderPreservingFocus() {
  const focused=document.activeElement,id=focused?.id;
  const open=$$('.disclosure[open]').map(d=>d.dataset.disclosure);
  render();open.forEach(key=>{const el=$(`[data-disclosure="${key}"]`);if(el)el.open=true;});
  if(id){const input=document.getElementById(id);input?.focus({preventScroll:true});}
}
function applyToggle(path,on) {
  if(path==='routine.deload'){state.deload=on;persist();render();return;}
  if(path==='picker.showAll'){showAll=on;renderPickerResults();return;}
  if(path.startsWith('global.')){const g=clone(globalLoad());setPath(g,path.slice(7),on);state.globalLoads[draft.exerciseId]=g;persist();rerenderPreservingFocus();return;}
  const p=optionsOf();
  if(path.startsWith('occ.')){
    setPath(draft,path.slice(4),on);
    if(path==='occ.bodyweight'&&on){const unloaded=E.editPlan(draft.rule,{load:{mode:'empty'}});if(E.validatePlanRule(unloaded).ok)draft.rule=unloaded;}
    if(path==='occ.side'&&on&&!p.durationSeconds){const even=n=>Math.ceil(n/2)*2;setOptions({reps:{min:even(p.reps.min),max:even(p.reps.max)},...(p.setReps?{setReps:p.setReps.map(n=>n==='max'?n:even(n))}:{})});}
    if(path==='occ.restFromProfile'&&on)setOptions({restSeconds:90});
  }
  if(path==='program.rir')setOptions({rir:on?{min:1,max:3}:null});
  if(path==='program.deload')setOptions({deload:on?E.defaultDeload(draft.rule.preset)||{after:3,factor:.9}:null});
  if(path==='program.repeat')setOptions({end:on?'repeat':'complete'});
  if(path.startsWith('metric.')){const metric=path.slice(7);setOptions({completion:on?[...p.completion,{metric,target:metric==='cycle_count'?4:metric==='training_max'?100:metric==='max_duration'?120:metric==='rest_floor'?p.restFloor:null}]:p.completion.filter(c=>c.metric!==metric)});}
  cleanCapabilities();rerenderPreservingFocus();
}
function applySelect(path,value) {
  if(path.startsWith('picker.')){if(path==='picker.muscle')muscle=value;else category=value;renderPickerResults();return;}
  const p=optionsOf();
  if(path==='load.mode'||path==='target.mode'){
    const root=path.split('.')[0];const load=value==='absolute'?{mode:value,value:0,unit:state.unit}:value==='percent_1rm'?{mode:value,percent:70}:{mode:value};
    setOptions({[root]:load,...(root==='load'?{loadTo:null,...(E.PRESETS[draft.rule.preset].steps==='load'?{step:value==='percent_1rm'?{type:'percentage_points',value:2.5}:{type:'absolute',value:state.unit==='lb'?5:2.5,unit:state.unit}}:{})}:{})});
  }else if(path==='step.type')setOptions({step:value==='absolute'?{type:value,value:state.unit==='lb'?5:2.5,unit:state.unit}:{type:value,value:2.5}});
  else if(path==='offsetDirection'){const direction=p.offsets[0].percentOfAnchor<=p.offsets.at(-1).percentOfAnchor?'ascending':'descending';if(value!==direction)setOptions({offsets:[...p.offsets].reverse()});}
  else setOptions({[path]:value});
  cleanCapabilities();rerenderPreservingFocus();
}
document.addEventListener('input',event=>{
  const el=event.target;
  if(el.id==='exercise-search'){query=el.value;renderPickerResults();return;}
  if(el.id==='routine-name'){state.name=el.value.trim()||"New routine";persist();return;}
  if(el.dataset.text){if(el.dataset.text==='note'){draft.note=el.value.slice(0,500);$('#note-count').textContent=`${draft.note.length}/500`;}else if(el.dataset.text==='rungs')setOptions({rungs:el.value.split('\n')});}
});
document.addEventListener('change',event=>{
  const el=event.target;
  if(el.dataset.number){updateNumber(el.dataset.number,el.value===''?0:Number(el.value));rerenderPreservingFocus();}
  else if(el.dataset.toggle)applyToggle(el.dataset.toggle,el.checked);
  else if(el.dataset.select)applySelect(el.dataset.select,el.value);
  else if(el.dataset.demo||el.id.startsWith('demo-'))changeDemo(el.dataset.demo||el.id.slice(5),el.value);
});
document.addEventListener('keydown',event=>{
  const tabButton=event.target.closest('[role="tab"]');
  if(tabButton&&['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){
    event.preventDefault();const ids=['target','progression','options'],i=ids.indexOf(tab);tab=event.key==='Home'?ids[0]:event.key==='End'?ids[2]:ids[(i+(event.key==='ArrowRight'?1:2))%3];render();$(`#tab-${tab}`).focus();
  }
});
document.addEventListener('click',event=>{
  const step=event.target.closest('[data-step]');
  if(step){const input=$('input',step.parentElement),next=Number((Number(input.value)+Number(step.dataset.delta)).toFixed(4)),min=Number(input.min),max=input.max?Number(input.max):Infinity;updateNumber(step.dataset.step,Math.max(min,Math.min(max,next)));rerenderPreservingFocus();return;}
  const button=event.target.closest('[data-action]');if(!button||button.disabled)return;
  const {action,id,value,path}=button.dataset,index=Number(button.dataset.index);
  if(action==='close-sheet'){closeSheet();return;}
  if(action==='undo'){const restore=undo;undo=null;$('#toast').hidden=true;restore?.();return;}
  if(action==='edit'){openExercise(id);return;}
  if(action==='tab'){tab=value;render();return;}
  if(action==='failure-mode'){draft.failureSets=value==='none'?[]:value;delete draft.lastToFailure;rerenderPreservingFocus();return;}
  if(action==='failure-set'){
    const sets=E.failureSetRange(draft.rule),numbers=Array.from({length:sets.max},(_,i)=>i+1).filter(n=>E.failureSetSelected(draft,n-1,sets.max));
    draft.failureSets=numbers.includes(index+1)?numbers.filter(n=>n!==index+1):[...numbers,index+1].sort((a,b)=>a-b);delete draft.lastToFailure;rerenderPreservingFocus();return;
  }

  if(action==='presets'){presetsSheet();return;}
  if(action==='choose-preset'||action==='confirm-preset'){choosePreset(value,action==='confirm-preset');return;}
  if(action==='leave-exercise'){leaveExercise();return;}
  if(action==='discard-exercise'){closeSheet();page='routine';draft=null;editingId=null;replaceId=null;render(true);return;}
  if(action==='save-exercise'){saveExercise();return;}
  if(action==='add'||action==='replace'){replaceId=action==='replace'?editingId:null;pickerReturn=action==='replace'?'exercise':'routine';page='picker';query='';scope=replaceId?'same':'';muscle='';equipment='';category='';closeSheet();render(true);return;}
  if(action==='close-picker'){page=pickerReturn;if(page==='routine'){draft=null;replaceId=null;}render(true);return;}
  if(action==='pick-config'||action==='quick-add'){pick(id,action==='quick-add');return;}
  if(action==='scope'){scope=value;renderPicker();return;}
  if(action==='equipment'){equipment=value;renderPicker();return;}
  if(action==='clear-filters'){query='';scope='';muscle='';equipment='';category='';renderPicker();return;}
  if(action==='exercise-preview'){openSheet("Set preview",previewHTML(draft));return;}
  if(action==='routine-preview'){openSheet("Your routine",`<p class="sheet-copy">${esc(state.name)} · ${state.exercises.length} exercises${state.deload?" · Deload":''}</p>${state.exercises.map(occ=>`<button class="setting-row clickable" data-action="preview-occurrence" data-id="${occ.occurrenceId}"><span class="grow"><strong>${esc(exOf(occ).name)}</strong><small>${esc(summary(occ))}${occ.sg?' · '+esc(occ.sgName||'Superset'):''}</small></span>${ic('chevR',16)}</button>`).join('')}<div class="sheet-actions">${btn('print',"Print / Save PDF",'secondary')}</div>`);return;}
  if(action==='preview-occurrence'){openSheet("Set preview",previewHTML(state.exercises.find(x=>x.occurrenceId===id)));return;}
  if(action==='exercise-menu'){openSheet("Exercise actions",`${btn('replace',"Replace exercise")}<p class="hint">Keep compatible settings from this position in the routine.</p><div class="sheet-actions">${btn('remove-exercise',"Remove from routine",'danger',`data-id="${editingId}"`)}</div>`);return;}
  if(action==='remove-exercise'){removeExercise(id);return;}
  if(action==='routine-menu'){openSheet("Routine actions",`<div class="stack">${btn('copy',"Duplicate routine")}${btn('print',"Print / Save PDF",'secondary',state.exercises.length?'':'disabled')}${btn('delete-routine',"Delete routine",'danger')}</div>`);return;}
  if(action==='copy'){state.name=`${state.name} · Copy`;state.exercises=state.exercises.map(x=>({...clone(x),occurrenceId:uid(),rule:{...clone(x.rule),id:uid()}}));persist();closeSheet();render(true);toast("Copy created. The mock shows one routine at a time.");return;}
  if(action==='delete-routine'){openSheet("Delete routine?",`<p class="sheet-copy">«${esc(state.name)}” and all its exercises will be removed from the mock.</p><div class="sheet-actions">${btn('confirm-delete',"Delete routine",'danger')}${btn('close-sheet',"Keep routine",'primary')}</div>`);return;}
  if(action==='confirm-delete'){const before=clone(state);state.exercises=[];state.name="New routine";persist();closeSheet();render(true);toast("Routine deleted.",()=>{state=before;persist();render(true);});return;}
  if(action==='glyph'){openSheet("Routine icon",`<div class="glyph-grid">${['dumb','bolt','flame','gauge','trophy','timer','star','link','home','hist'].map(g=>`<button data-action="set-glyph" data-value="${g}" aria-label="Icon ${g}" class="${state.glyph===g?'on':''}">${ic(g,26)}</button>`).join('')}</div>`);return;}
  if(action==='set-glyph'){state.glyph=value;persist();closeSheet();render();return;}
  if(action==='move'){const i=state.exercises.findIndex(x=>x.occurrenceId===id),to=i+Number(button.dataset.dir);if(to<0||to>=state.exercises.length)return;const [occ]=state.exercises.splice(i,1);state.exercises.splice(to,0,occ);normalizeGroups();persist();render();toast("Order updated.");return;}
  if(action==='link'){const i=state.exercises.findIndex(x=>x.occurrenceId===id),occ=state.exercises[i],prev=state.exercises[i-1];if(!prev)return;if(occ.sg&&occ.sg===prev.sg){delete occ.sg;delete occ.sgName;delete occ.sgRest;}else{const sg=prev.sg||uid();prev.sg=sg;occ.sg=sg;occ.sgName=prev.sgName||'';occ.sgRest=prev.sgRest||0;}normalizeGroups();persist();render();return;}
  if(action==='superset'){const occ=state.exercises.find(x=>x.sg===id);openSheet("Superset settings",`<div class="field"><label for="ss-name">Name</label><input id="ss-name" class="input" maxlength="40" value="${esc(occ.sgName||'')}" placeholder="e.g. Arm finisher"></div><div class="field"><label for="ss-rest">Rest after each round (s)</label><input id="ss-rest" class="input" type="number" min="0" max="3600" step="15" value="${occ.sgRest||0}"></div><p class="hint">0 uses the longest rest among the exercises in the group.</p><div class="sheet-actions">${btn('save-superset',"Save superset",'primary',`data-id="${id}"`)}</div>`);return;}
  if(action==='save-superset'){if(!$('#ss-rest').checkValidity()){$('#ss-rest').reportValidity();return;}state.exercises.filter(x=>x.sg===id).forEach(x=>{x.sgName=$('#ss-name').value.trim();x.sgRest=Number($('#ss-rest').value)||0;});persist();closeSheet();render();return;}
  if(action==='range'){const p=optionsOf(),open=draft.rangeOpen||[];const ranged=p[path].min!==p[path].max||open.includes(path);draft.rangeOpen=ranged?open.filter(x=>x!==path):[...open,path];if(ranged)setOptions({[path]:{min:p[path].min,max:p[path].min}});rerenderPreservingFocus();return;}
  if(action==='load-range'){const p=optionsOf();setOptions({loadTo:p.loadTo?null:clone(p.load)});rerenderPreservingFocus();return;}
  if(action==='target-mode'){const def=E.PRESETS[draft.rule.preset];setOptions({durationSeconds:value==='time'?{min:45,max:def.ranges.durationSeconds==='range'?60:45}:null});cleanCapabilities();rerenderPreservingFocus();return;}
  if(action==='tm-mode'){setOptions({trainingMax:value==='direct'?{mode:value,value:state.unit==='lb'?225:100,unit:state.unit}:{mode:value}});rerenderPreservingFocus();return;}
  if(action==='week'){week=Number(value);render();return;}
  if(action==='db-load'){draft.dbLoad=value;rerenderPreservingFocus();return;}
  if(action==='rounding-mode'){draft.rule.rounding.mode=value;rerenderPreservingFocus();return;}
  if(action==='warmup-mode'){draft.warmup=value==='smart'?{mode:value,count:Math.min(3,E.warmupMaxCount(exOf(draft).eq))}:value==='template'?{mode:value,steps:[{percent:50,reps:5},{percent:75,reps:3}]}:{mode:'off'};rerenderPreservingFocus();return;}
  if(action==='add-warmup'){if(draft.warmup.steps.length<5)draft.warmup.steps.push(clone(draft.warmup.steps.at(-1)));rerenderPreservingFocus();return;}
  if(action==='remove-warmup'){if(draft.warmup.steps.length>1)draft.warmup.steps.splice(index,1);rerenderPreservingFocus();return;}
  if(action==='intensifier'){draft.intensifier=value==='dropset'?{type:value,count:1,pct:20}:value==='restpause'?{type:value,totalReps:8,restSec:15}:null;cleanCapabilities();rerenderPreservingFocus();return;}
  if(action==='plate-kind'){state.globalLoads[draft.exerciseId]={...clone(globalLoad()),kind:value};persist();rerenderPreservingFocus();return;}
  if(['pyramid-pattern','set-max','add-set','remove-set'].includes(action)){
    const p=optionsOf();let reps=clone(p.setReps),rests=clone(p.setRest||Array(reps.length).fill(0)),weights=clone(p.setWeights||Array(reps.length).fill(0));
    if(action==='pyramid-pattern'){reps=clone([[12,10,8,6],[6,8,10,12],[12,10,8,10,12],[12,8,6,'max',12]][Number(value)]);rests=Array(reps.length).fill(0);weights=Array(reps.length).fill(0);}
    if(action==='set-max')reps[index]=reps[index]==='max'?p.reps.min:'max';
    if(action==='add-set'&&reps.length<E.SET_REPS_MAX){reps.push(reps.at(-1));rests.push(rests.at(-1)||0);weights.push(weights.at(-1)||0);}
    if(action==='remove-set'&&reps.length>1){reps.splice(index,1);rests.splice(index,1);weights.splice(index,1);}
    const first=reps.find(n=>n!=='max')||1;setOptions({setReps:reps,sets:{min:reps.length,max:reps.length},reps:{min:first,max:first},setRest:rests,setWeights:weights});cleanCapabilities();rerenderPreservingFocus();return;
  }
  if(['add-offset','remove-offset','rpt','same-reps'].includes(action)){
    const p=optionsOf(),offsets=clone(p.offsets),ascending=offsets[0].percentOfAnchor<=offsets.at(-1).percentOfAnchor;
    if(action==='add-offset'&&offsets.length<E.MAX_GROUPS){const old=ascending?offsets[0]:offsets.at(-1),newSet={percentOfAnchor:Math.max(5,old.percentOfAnchor-10),reps:(old.reps||p.reps.min)+2};ascending?offsets.unshift(newSet):offsets.push(newSet);}
    if(action==='remove-offset'&&offsets.length>1)offsets.splice(index,1);
    if(action==='rpt') {setOptions({reps:{min:6,max:6},offsets:E.rptOffsets(offsets.length,6)});}
    else setOptions({offsets:action==='same-reps'?offsets.map(({reps,...o})=>o):offsets,sets:p.sets.min===p.sets.max?{min:offsets.length,max:offsets.length}:p.sets});
    cleanCapabilities();rerenderPreservingFocus();return;
  }
  if(action==='custom'){openSheet("Create exercise",`<p class="sheet-copy">A custom exercise in this demo catalogue.</p><div class="field"><label for="custom-name">Name</label><input id="custom-name" class="input" required maxlength="80" placeholder="e.g. Machine row"></div><div class="field"><label for="custom-muscle">Primary target</label><select id="custom-muscle" class="select-field">${["Chest","Back","Shoulders","Biceps","Triceps","Legs",'Core'].map(m=>`<option>${m}</option>`).join('')}</select></div><div class="sheet-actions">${btn('save-custom',"Create and configure",'primary')}</div>`);return;}
  if(action==='save-custom'){const name=$('#custom-name').value.trim();if(!name){$('#custom-name').reportValidity();return;}const id=uid();const custom={id,name,muscle:$('#custom-muscle').value,eq:'machine',equipment:"Custom",category:"Strength",custom:true};CATALOGUE.push(custom);state.customExercises??=[];state.customExercises.push(custom);persist();closeSheet();pick(id,false);return;}
  if(action==='print'){closeSheet();$('.print-only')?.remove();const print=document.createElement('section');print.className='print-only';print.innerHTML=`<h1>${esc(state.name)}</h1><p>${state.exercises.length} exercises · ${state.deload?"Deload routine":"Workout routine"} · Demo data</p><table><thead><tr><th>Exercise</th><th>Target</th><th>Progression</th><th>Rest</th></tr></thead><tbody>${state.exercises.map(o=>`<tr><td>${esc(exOf(o).name)}${o.sg?'<br>'+esc(o.sgName||'Superset'):''}${o.note?'<br>'+esc(o.note):''}</td><td>${esc(summary(o))}</td><td>${chipsOf(o).map(esc).join(', ')}</td><td>${duration(o.sgRest||E.planOptions(o.rule).restSeconds)}</td></tr>`).join('')}</tbody></table>`;document.body.append(print);window.print();return;}
  if(action==='reset'){state=fixture();persist();draft=null;page='routine';closeSheet();render(true);toast("Demo data reset.");}
});
let dragId=null;
document.addEventListener('dragstart',event=>{const handle=event.target.closest('[data-drag-id]');if(handle){dragId=handle.dataset.dragId;event.dataTransfer.setData('text/plain',dragId);event.dataTransfer.effectAllowed='move';}});
document.addEventListener('dragover',event=>{if(dragId&&event.target.closest('[data-row-id]')){event.preventDefault();event.dataTransfer.dropEffect='move';}});
document.addEventListener('drop',event=>{const row=event.target.closest('[data-row-id]');if(!dragId||!row)return;event.preventDefault();moveDragged(dragId,row.dataset.rowId);dragId=null;});
document.addEventListener('dragend',()=>{dragId=null;});
function moveDragged(source,target){const list=state.exercises,from=list.findIndex(x=>x.occurrenceId===source),to=list.findIndex(x=>x.occurrenceId===target);if(from<0||to<0||from===to)return;const sg=list[from].sg,unit=sg?list.filter(x=>x.sg===sg):[list[from]],destination=list[to];if(unit.includes(destination))return;const rest=list.filter(x=>!unit.includes(x));const index=rest.findIndex(x=>x===destination);rest.splice(index,0,...unit);state.exercises=rest;normalizeGroups();persist();render();toast("Order updated.");}
let touchDrag=null;
document.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse')return;const handle=event.target.closest('[data-drag-id]');if(handle){touchDrag={id:handle.dataset.dragId,x:event.clientX,y:event.clientY};handle.setPointerCapture(event.pointerId);}});
document.addEventListener('pointermove',event=>{if(!touchDrag)return;touchDrag.x=event.clientX;touchDrag.y=event.clientY;$$('[data-row-id]').forEach(el=>el.classList.remove('selected'));document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-row-id]')?.classList.add('selected');});
document.addEventListener('pointerup',event=>{if(!touchDrag)return;const target=document.elementFromPoint(event.clientX,event.clientY)?.closest('[data-row-id]');if(target)moveDragged(touchDrag.id,target.dataset.rowId);touchDrag=null;$$('[data-row-id]').forEach(el=>el.classList.remove('selected'));});
document.addEventListener('pointercancel',()=>{touchDrag=null;$$('[data-row-id]').forEach(el=>el.classList.remove('selected'));});
$('#sheet').addEventListener('click',event=>{if(event.target!==$('#sheet'))return;const bounds=$('#sheet').getBoundingClientRect();if(event.clientX<bounds.left||event.clientX>bounds.right||event.clientY<bounds.top||event.clientY>bounds.bottom)closeSheet();});
function syncDemoControls(){['theme','accent','unit','effort','scenario'].forEach(key=>{$$(`[data-demo="${key}"],#demo-${key}`).forEach(el=>el.value=state[key]);});}
function changeDemo(key,value) {
  if(key==='preset'){if(!value)return;const first=state.exercises.find(o=>!exOf(o).cardio)||makeOccurrence('0025');draft=clone(first);editingId=state.exercises.some(o=>o.occurrenceId===first.occurrenceId)?first.occurrenceId:null;page='exercise';tab='target';choosePreset(value,true);render(true);return;}
  if(key==='scenario'){const prefs={theme:state.theme,accent:state.accent,unit:state.unit,effort:state.effort};state={...fixture(value),...prefs};if(prefs.unit==='lb'){state.exercises=state.exercises.map(o=>convertOccurrenceUnit(o,'lb'));if(state.oneRm)state.oneRm=Number((state.oneRm*2.2046226218).toFixed(2));}page='routine';draft=null;replaceId=null;closeSheet();}
  else if(key==='unit'&&value!==state.unit){state.exercises=state.exercises.map(o=>convertOccurrenceUnit(o,value));if(draft)draft=convertOccurrenceUnit(draft,value);const factor=value==='lb'?2.2046226218:1/2.2046226218;if(state.oneRm)state.oneRm=Number((state.oneRm*factor).toFixed(2));Object.values(state.globalLoads).forEach(g=>g.base=Number((g.base*factor).toFixed(2)));state.unit=value;}
  else state[key]=value;
  persist();render(true);
}
$('#demo-preset').insertAdjacentHTML('beforeend',E.PRESET_IDS.map(id=>`<option value="${id}">${LABELS[id][0]}</option>`).join(''));
const mobileControls=$('.demo-controls').cloneNode(true);
$$('select',mobileControls).forEach(el=>{const key=el.id.slice(5);el.dataset.demo=key;el.id='mobile-'+key;});
$('#mobile-controls').append(mobileControls);$('#mobile-controls').insertAdjacentHTML('beforeend',"<p>Demo prototype. Changes stay separate from the app.</p><a href=\"index.html\">All mocks</a>");
render(true);
