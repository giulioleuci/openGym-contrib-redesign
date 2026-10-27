/* openGym 1.4.3 · Progression Engine v2. Shared demo workout session and phone shell. */


const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const fmt=n=>String(n);
const IC={plus:'M12 5v14M5 12h14',minus:'M5 12h14',check:'M5 12.5l4.5 4.5L19 7.5',chevR:'M9 5l7 7-7 7',chevL:'M15 5l-7 7 7 7',chevD:'M5 9l7 7 7-7',chevU:'M5 15l7-7 7 7',
  dots:'M12 5.5v.01M12 12v.01M12 18.5v.01',flame:'M12 3c1 3 5 5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 0 2 1 3 2 3 0-3-1-5 1-9z',
  link:'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
  note:'M6 3h9l4 4v14H6zM9 12h7M9 16h7',x:'M6 6l12 12M18 6L6 18',skip:'M5 5l9 7-9 7zM18 5v14',pause:'M8 5v14M16 5v14',play:'M7 5l12 7-12 7z',
  home:'M4 11l8-7 8 7v9H4z',dumb:'M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12',hist:'M4 12a8 8 0 1 0 3-6.2M4 4v4h4M12 8v4l3 2',set:'M4 7h10M18 7h2M4 17h2M10 17h10M14 5v4M6 15v4',
  img:'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4',down:'M12 5v14M6 13l6 6 6-6',up:'M12 19V5M6 11l6-6 6 6',info:'M12 3.8a8.2 8.2 0 1 0 0 16.4 8.2 8.2 0 0 0 0-16.4ZM12 11v5.4M12 7.9v.01',star:'M12 3.8l2.4 5 5.5.8-4 3.9.9 5.5-4.8-2.6-4.8 2.6.9-5.5-4-3.9 5.5-.8z',trophy:'M8 4h8v5a4 4 0 0 1-8 0ZM8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M8.5 20h7',timer:'M12 6.2a7.2 7.2 0 1 0 0 14.4 7.2 7.2 0 0 0 0-14.4ZM12 10v3.4h2.8M9.6 3.4h4.8',warn:'M12 3.4 21.2 19.4H2.8ZM12 9.6v4.4M12 16.6v.01',undo:'M9 7L4 12l5 5M4 12h10a6 6 0 0 1 0 12',pencil:'M4 20l4-1L19 8l-3-3L5 16zM14 7l3 3',bolt:'M13 3L5 14h6l-1 7 8-11h-6z',trash:'M5 7h14M10 7V4h4v3M7 7l1 13h8l1-13',search:'M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4',gauge:'M4 17a8 8 0 1 1 16 0M12 17l4-6'};
const ic=(n,s=20,sw=1.8)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${IC[n]}"/></svg>`;



const R2=v=>[].concat(v,v).slice(0,2);
const PLAN=(preset,n,r,rir,load,rest,x={})=>({preset,n:R2(n),r:R2(r),rir:rir==null?null:R2(rir),load:load==null?null:R2(load),rest,...x});

const PRESET={
  "autoregulated": [
    "Autoregulated",
    "You set every value by feel (reps, load or seconds); nothing is advanced for you."
  ],
  "linear": [
    "Linear",
    "Add a fixed amount of weight after every successful session."
  ],
  "greyskull": [
    "Greyskull LP",
    "Add weight when you hit the target; the last set is an AMRAP."
  ],
  "double": [
    "Double progression",
    "Reach the top of the rep or time range, then add weight and start again."
  ],
  "triple": [
    "Triple progression",
    "Fill sets and reps up to the top of the range, then add weight."
  ],
  "hold_seconds": [
    "Timed hold progression",
    "Hold for time; the target seconds go up each time you reach the longest time."
  ],
  "bodyweight_ladder": [
    "Bodyweight ladder",
    "Build reps and sets, then move to a harder variation."
  ],
  "pyramid_reps": [
    "Pyramid sets",
    "A different rep target for each set, e.g. 12 · 8 · 6 · Max · 12."
  ],
  "pyramid": [
    "Pyramid",
    "Sets at different shares of one anchor load, lightest first or heaviest first."
  ],
  "five_three_one": [
    "5/3/1",
    "Wendler cycle: four weeks of percentages of your training max."
  ],
  "top_set_backoff": [
    "Top set and back-off",
    "One heavy top set, then lighter back-off sets; the top set decides the next load."
  ],
  "accumulation_intensification": [
    "Accumulation then intensification",
    "Build reps at a lighter percentage of your training max, then a heavier block of fewer reps."
  ],
  "density": [
    "Density",
    "Same work, a little less rest after every clean session."
  ]
};

const FLD={w:{lbl:"Weight",hd:"Weight (kg)"},r:{lbl:"Reps",hd:'Reps',step:1},sec:{lbl:"Seconds",hd:"Seconds",step:5},min:{lbl:"Duration (min)",hd:"Duration (min)",step:1},speed:{lbl:"Speed (km/h)",hd:'Km/h',step:.5},inc:{lbl:"Incline",hd:'Incl. (%)',step:.5}};   
const modeOf=id=>EX[id].mode||'reps';

const weOk=id=>{const x=EX[id];return !!x&&modeOf(id)==='reps'&&x.equip==="Dumbbells"&&!x.side&&!x.bw};
const weMode=id=>weOk(id)&&['each','total'].includes(S.weightEntry?.[id]?.mode)?S.weightEntry[id].mode:'as';
const WEL={as:"As entered",each:"One dumbbell",total:"Both"};
const wShow=(id,w)=>w, wSave=(id,v)=>v;
const weHd=id=>weMode(id)==='each'?"Each (kg)":weMode(id)==='total'?"Both (kg)":FLD.w.hd;   
const vFactor=id=>weMode(id)==='each'?2:1;

const RACK=[2,4,6,8,10,12,14,16,18,20,22,24,26,28,30,32],rackOn=()=>sg('og-rack','1')==='1',bellEx=id=>EX[id].equip==="Dumbbells"&&modeOf(id)==='reps'&&!EX[id].bw;
const nearRack=v=>RACK.reduce((a,b)=>Math.abs(b-v)<Math.abs(a-v)?b:a);
const stepRack=(v,d)=>{const i=RACK.indexOf(v);if(i<0)return d>0?(RACK.find(x=>x>v)??RACK[RACK.length-1]):([...RACK].reverse().find(x=>x<v)??RACK[0]);return RACK[Math.max(0,Math.min(RACK.length-1,i+d))]};
const colsOf=id=>{const x=EX[id],m=modeOf(id);return m==='cardio'?['min','speed','inc']:m==='time'?['sec']:x.bw?['r']:['w','r']};
const stepOf=(id,f)=>f==='w'?EX[id].step:FLD[f].step;
const hasEff=id=>modeOf(id)==='reps';   
const DEF_REST=90;   
const EX={
  bench:{name:"Barbell bench press",equip:"Barbell",tags:["Chest","Triceps"],plan:PLAN('linear',4,8,2,60,120,{warm:"Automatic · 1 set"}),bar:20,step:2.5,
    pin:"Retract your shoulder blades and plant your feet.",note:"Pause for 1 second at the chest.",ref:[[60,8],[60,8],[57.5,9]],best:[62.5,8]},
  fly:{name:"Cable fly",equip:"Cables",tags:["Chest"],plan:PLAN('autoregulated',3,12,1,15,90),step:2.5,note:"Keep elbows slightly bent.",ref:[[15,12],[15,12],[12.5,13]],best:[17.5,10]},
  push:{name:"Cable pushdown",equip:"Cables",tags:["Triceps"],plan:PLAN('linear',3,12,1,25,120,{deload:{stalls:3,from:27.5,to:25},fail:1,kv:[["Last set to failure","Selected"]]}),step:2.5,ref:[[25,12],[25,11],[22.5,12]],best:[27.5,10]},
  ohp:{name:'Military press',equip:"Barbell",tags:["Shoulders"],plan:PLAN('five_three_one',3,5,null,[30,37.5],150,{rows:[[30,5],[35,5],[37.5,5]]}),bar:20,step:2.5,note:"Brace your glutes without arching your back.",ref:[[30,5],[35,5],[37.5,5]],best:[42.5,6]},
  legp:{name:'Leg press',equip:"Machine",tags:["Legs"],plan:PLAN('double',3,[10,15],[1,2],120,120,{warm:"Automatic · 2 sets",kv:[["Back-off sets","Each set one step lighter (−5 kg)"]]}),step:5,ref:[[120,12],[120,11],[120,10]],best:[130,10]},
  squat:{name:'Barbell squat',equip:"Barbell",tags:["Legs"],plan:PLAN('linear',3,5,2,null,180,{pct:75,warm:"Automatic · 3 sets"}),step:2.5,note:"Load is 75% of your 1RM.",ref:[[100,5],[100,5],[100,5]],best:[105,5]},
  bulg:{name:"Dumbbell bulgarian split squat",equip:"Dumbbells",tags:["Legs","Glutes"],side:1,plan:PLAN('linear',3,16,1,14,90,{side:1}),step:2,ref:[[14,16],[14,16],[12,16]],best:[16,16]},
  pullup:{name:"Pull-up",equip:"Bodyweight",tags:["Back"],bw:1,plan:PLAN('bodyweight_ladder',[3,6],[6,20],[0,1],null,90,{completed:1}),step:1,ref:[[8],[7],[6]],best:[10]},
  curl:{name:"Dumbbell biceps curl",equip:"Dumbbells",tags:["Biceps"],plan:PLAN('triple',[3,4],[8,12],[1,2],12,75),step:1,ref:[[12,10],[12,9],[11,10]],best:[14,8]},
  plank:{name:'Front plank',equip:"Bodyweight",tags:['Core'],mode:'time',bw:1,plan:PLAN('hold_seconds',3,[0,0],null,null,60,{sec:[30,45]}),step:5,ref:[[40],[35],[30]],best:[50]},
  rowb:{name:"Barbell bent over row",equip:"Barbell",tags:["Back"],plan:PLAN('accumulation_intensification',3,[8,12],null,[52.5,52.5],120,{phase:"Accumulation",kv:[['Phase',"Accumulation · reps 8 → 12 at 65% of training max"],["Training max",'80 kg (90% 1RM)'],["Then","Intensification 3 × 4 at 80%, after 4 successful sessions"]]}),bar:20,step:2.5,ref:[[52.5,9],[52.5,9],[52.5,8]],best:[60,8]},
  crunch:{name:"Cable kneeling crunch",equip:"Cables",tags:['Core'],plan:PLAN('density',3,10,null,30,85,{kv:[["Density","Rest −5 sec after each successful session, down to 45 sec"]]}),step:2.5,ref:[[30,10],[30,10],[30,10]],best:[35,8]},
  run:{name:"Run on treadmill",equip:"Machine",tags:['Cardio'],mode:'cardio',plan:PLAN('autoregulated',1,[0,0],null,null,0,{min:20,speed:8,kv:[["Incline","Optional, in % (0–40): enter it on the set"]]}),step:1,ref:[[20,8,2]],best:[25,8,3]},
  incl:{name:"Dumbbell incline bench press",equip:"Dumbbells",tags:["Chest","Shoulders"],plan:PLAN('pyramid',3,8,2,[16,24],150,{rows:[[16,8],[20,8],[24,8]],perRow:false,kv:[["Direction","Lightest first: 70 · 85 · 100% of the anchor load"],["Decide the session","Sets at 100%"]]}),step:2,ref:[[16,8],[20,8],[24,7]],best:[26,6]},
  latm:{name:'Lat machine',equip:"Cables",tags:["Back"],plan:PLAN('pyramid_reps',4,[8,12],null,[40,50],120,{rows:[[40,12],[45,10],[50,8],[50,'max']],kv:[["Set Max","Last set: as many reps as possible. Record at this weight: 11 reps at 50 kg"],["Load per set",'40 / 45 / 50 / 50 kg']]}),step:2.5,note:"Last set: as many reps as possible.",rec:'11 reps at 50 kg',ref:[[40,12],[45,10],[50,8],[50,10]],best:[50,11]},
  rdl:{name:"Barbell Romanian deadlift",equip:"Barbell",tags:["Hamstrings","Glutes"],plan:PLAN('top_set_backoff',[4,4],[6,8],null,[90,100],180,{rows:[[100,6],[90,8],[90,8],[90,8]],tsb:{n:3,r:8,pct:90,rest:120},warm:"Automatic · 2 sets",kv:[['Top set',"1 × 6 @ 100 kg · rest 3min"],['Back-off',"3 × 8 @ 90% (90 kg) · rest 2min"],["Top set decides","Load increases after a successful top set"]]}),bar:20,step:2.5,ref:[[100,6],[90,8],[90,8],[90,7]],best:[100,6]},
  lat:{name:"Dumbbell lateral raise",equip:"Dumbbells",tags:["Shoulders"],plan:PLAN('double',[3,4],[12,15],[0,1],8,75,{out:1}),step:1,ref:[[8,12],[8,11],[8,10]],best:[10,8]}
};

for(const k in EX)EX[k].id=k;
EX.push.plan.int={t:'drop',count:1,pct:20};EX.lat.plan.int={t:'rp',total:6,rest:15};   
const nextDrop=(prev,pct,step)=>{const raw=prev*(1-pct/100);let w=Math.round(raw/step)*step;if(prev>0&&w>=prev)w=prev-step;return Math.max(0,Math.round(w*1000)/1000)};
const nextBurst=r=>Math.max(1,Math.round((r||0)/2));
const splitBursts=t=>{const o=[];for(let r=t;r>0;){const b=Math.min(r,nextBurst(r));o.push(b);r-=b}return o};
const withInt=(id,sets)=>{const it=EX[id].plan.int;if(!it)return sets;
  return sets.map(x=>{if(it.t==='drop'){const d=[];let w=x.w;for(let k=0;k<it.count;k++){w=nextDrop(w,it.pct,EX[id].step);d.push({w,r:x.r})}return{...x,type:'dropset',drops:d}}
    const c=splitBursts(it.total).map(r=>({r,restSec:it.rest}));return{...x,type:'restpause',clusters:c,r:x.r+it.total}})};

const UNITS=[{ex:['bench']},{ex:['fly','push'],ss:1,name:"Chest finisher",rest:100},{ex:['ohp']},{ex:['incl']},{ex:['lat']},{ex:['latm']},{ex:['rdl']},{ex:['legp']},{ex:['squat']},{ex:['bulg']},{ex:['pullup']},{ex:['curl']},{ex:['rowb']},{ex:['crunch']},{ex:['plank']},{ex:['run']}];
const mk=(w,r,n)=>Array.from({length:n},()=>({w,r}));
const INIT=()=>({cur:0,pop:null,sets:{
  bench:[{w:40,r:10,wu:1,d:1,t:1},{w:60,r:8,d:1,t:1,e:3},{w:60,r:6,d:1,t:1,e:1},{w:65,r:11,d:1,t:1,e:0,f:1},{w:60,r:8}],
  fly:[{w:15,r:12},{w:15,r:12},{w:12.5,r:14}],push:(()=>{const a=withInt('push',mk(25,12,3));a[2].f=1;return a})(),ohp:[{w:30,r:5},{w:35,r:5},{w:37.5,r:5}],lat:withInt('lat',mk(8,12,1)),
  legp:[{w:60,r:10,wu:1},{w:90,r:6,wu:1},{w:120,r:12},{w:115,r:12},{w:110,r:12}],
  incl:[{w:16,r:8},{w:20,r:8},{w:24,r:8}],latm:[{w:40,r:12},{w:45,r:10},{w:50,r:8},{w:50,r:0,max:1}],
  rdl:[{w:40,r:8,wu:1},{w:70,r:4,wu:1},{w:100,r:6,ph:'top'},{w:90,r:8,ph:'bo'},{w:90,r:8,ph:'bo'},{w:90,r:8,ph:'bo'}],rowb:mk(52.5,10,3),crunch:mk(30,10,3),squat:mk(0,5,3),
  bulg:Array.from({length:3},()=>({w:14,r:16,sides:{L:{w:14,r:8},R:{w:14,r:8}}})),
  pullup:Array.from({length:3},()=>({r:8})),curl:mk(12,10,3),plank:[{sec:30},{sec:25},{sec:30}],run:[{min:20,speed:8,inc:2}]}});
const sg=(k,d)=>{try{return sessionStorage.getItem(k)??d}catch{return d}}, ss=(k,v)=>{try{sessionStorage.setItem(k,v)}catch{}};
let S;try{S=JSON.parse(sg('og-demo5','null'))}catch{}S=S||INIT();S.weightEntry=S.weightEntry||{};

const EF=()=>sg('og-effort','off'),effOf=(id,s)=>s.e??null,effShow=v=>EF()==='rpe'?10-v:v;
const save=()=>ss('og-demo5',JSON.stringify(S));
for(const k in S.sets)S.sets[k]=S.sets[k].filter(s=>!s.o);S.added=(S.added||[]).filter(a=>Array.isArray(a.ex.plan?.n));   
(S.added||[]).forEach(a=>{a.ex.id=a.id;EX[a.id]=a.ex;UNITS.push({ex:[a.id]})});


const unitOf=id=>UNITS.findIndex(u=>u.ex.includes(id));
const unitDone=u=>UNITS[u].ex.every(e=>S.sets[e].every(s=>s.d));
const req=ids=>ids.flatMap(e=>S.sets[e]);

const restOf=u=>UNITS[u].rest||Math.max(...UNITS[u].ex.map(e=>EX[e].plan.rest||RS()));

const restAt=(id,i)=>{const p=EX[id].plan;return p.tsb&&!UNITS[unitOf(id)].ss?(wn(id,i)===1?p.rest:p.tsb.rest):restOf(unitOf(id))};
const wn=(id,i)=>S.sets[id].slice(0,i+1).filter(s=>!s.wu).length;
const wTot=id=>S.sets[id].filter(s=>!s.wu).length;
const counts=()=>{let d=0,t=0;for(const k in S.sets)for(const s of S.sets[k]){t++;d+=s.d?1:0}return{d,t}};
const maxSets=u=>Math.max(...UNITS[u].ex.map(e=>S.sets[e].length));
const curRound=u=>{const m=maxSets(u);for(let i=0;i<m;i++)if(UNITS[u].ex.some(e=>S.sets[e][i]&&!S.sets[e][i].d))return i;return m-1};
function nextOpen(from=S.cur){
  for(let k=0;k<UNITS.length;k++){const u=(from+k)%UNITS.length,m=maxSets(u);
    for(let i=0;i<m;i++)for(const e of UNITS[u].ex){const s=S.sets[e][i];if(s&&!s.d)return{u,e,i}}}
  return null}
const volume=id=>vFactor(id)*S.sets[id].reduce((a,s)=>a+(s.d&&!s.wu?(s.sides?s.sides.L.w*s.sides.L.r+s.sides.R.w*s.sides.R.r:(s.w||0)*(s.r||0))+(s.drops||[]).reduce((b,d)=>b+d.w*d.r,0):0),0);   
const refRow=(ex,a)=>ex.mode==='time'?a[0]+" s":ex.mode==='cardio'?a[0]+' min @ '+fmt(a[1])+(a[2]!=null?' · '+fmt(a[2])+'%':''):ex.bw?a[0]+' reps':fmt(ex.id&&weOk(ex.id)?wShow(ex.id,a[0]):a[0])+'×'+a[1];
const refTxt=ex=>sg('og-logref','last')==='best'?refRow(ex,ex.best):ex.ref.map(a=>refRow(ex,a)).join(' · ');


const FI=sz=>`<span class="fico">${ic('gauge',sz||13,2.4)}</span>`;
const valTxt=(id,s)=>valBase(id,s)+(s.f?' · '+FI():'');
const valBase=(id,s)=>{const m=modeOf(id);return s.sides?`${fmt(s.w)} kg × ${s.sides.L.r}+${s.sides.R.r}`:m==='time'?s.sec+" s":m==='cardio'?`${s.min} min @ ${fmt(s.speed)} km/h${s.inc!=null?` · ${fmt(s.inc)}%`:''}`:EX[id].bw?s.r+' reps':`${fmt(s.w)} kg × ${s.max&&!s.r?'Max':s.r}`};
const shortVal=(id,s)=>{const m=modeOf(id);return s.sides?`${fmt(s.w)}×${s.sides.L.r}+${s.sides.R.r}`:m==='time'?s.sec+"sec":m==='cardio'?s.min+'min':EX[id].bw?s.r+'':`${fmt(wShow(id,s.w))}×${s.r}`};
const lastVal=id=>{const s=S.sets[id].filter(x=>!x.wu).slice(-1)[0],m=modeOf(id);return m==='time'?s.sec+" s":m==='cardio'?s.min+' min':EX[id].bw?s.r+' reps':fmt(wShow(id,s.w))+' kg'};
const PL=[25,20,15,10,5,2.5,1.25];
function plates(w,bar){if(!bar)return null;let rem=(w-bar)/2;const o=[];if(rem<0)return o;for(const p of PL)while(rem>=p-1e-9){o.push(p);rem-=p}return o}
const platesTxt=a=>a.length?a.map(fmt).join(' + '):"bar only";
function platesDelta(a,b){const c={};a.forEach(p=>c[p]=(c[p]||0)-1);b.forEach(p=>c[p]=(c[p]||0)+1);
  return Object.keys(c).map(Number).sort((x,y)=>y-x).filter(p=>c[p]).map(p=>(c[p]<0?'−':'+')+fmt(p)).join(' ')}
function plateLine(id,i){const ex=EX[id],s=S.sets[id][i];if(!ex.bar||lkind(id)==='none')return'';if(lkind(id)==='single')return`<div class="plateline"><span>Plates · ${fmt(Math.max(0,s.w-ex.bar))} kg total</span></div>`;const p=plates(s.w,ex.bar),pv=i>0?plates(S.sets[id][i-1].w,ex.bar):null;
  const d=pv?platesDelta(pv,p):'';return`<div class="plateline"><span>Per side · ${platesTxt(p)}</span>${d?`<span class="moves">${d}</span>`:''}</div>`}

function syncSide(s){const{L,R}=s.sides;s.w=Math.max(L.w,R.w);s.r=L.r+R.r;s.d=L.d&&R.d?1:0;const es=[L.e,R.e].filter(v=>v!=null);if(es.length)s.e=Math.min(...es);else delete s.e}
function adjust(id,i,f,dir,side){const s=S.sets[id][i],x=side?s.sides[side]:s;
  if(f==='e'){const r=stepE(x.e??null,dir);if(r==null)delete x.e;else x.e=r}
  else if(f==='inc'){const n=Math.round(((x.inc??0)+dir*.5)*10)/10;if(x.inc==null&&dir<0||n<0)delete x.inc;else x.inc=Math.min(40,n)}   
  else if(f==='w'&&bellEx(id)&&rackOn())x.w=stepRack(x.w||0,dir)   
  else x[f]=Math.max(0,Math.round(((x[f]||0)+dir*stepOf(id,f))*100)/100);x.t=1;s.t=1;if(side)syncSide(s);save()}
function toggle(id,i,side){
  const s=S.sets[id][i],un=UNITS[unitOf(id)],was=!!s.d;
  if(s.sides){if(side){const x=s.sides[side];x.d=x.d?0:1;x.t=1}else{const v=s.d?0:1;s.sides.L.d=s.sides.R.d=v}syncSide(s)}else s.d=s.d?0:1;
  s.t=1;S.pop=id+':'+i;
  if(s.d&&!was){const roundDone=un.ex.every(e=>!S.sets[e][i]||S.sets[e][i].d),n=nextOpen(unitOf(id));
    if(n)S.cur=n.u;
    if(!n)Rest.stop();else if(roundDone){const r=S.sets[id][i].rest;r===0?Rest.stop():Rest.start(r||restAt(id,i))}}
  save()}



const I18N={'{0}min':'{0}min','{0}sec':'{0}sec','{0}min{1}sec':'{0}min{1}sec'};
const tr=(k,...a)=>(I18N[k]||k).replace(/\{(\d)\}/g,(_,i)=>a[i]);
const fmtRest=s=>{const m=Math.floor(s/60),x=s%60;return m&&x?tr('{0}min{1}sec',m,x):m?tr('{0}min',m):tr('{0}sec',x)};
const rg=(a,f=fmt)=>a[0]===a[1]?f(a[0]):f(a[0])+'–'+f(a[1]);
const rowsReps=p=>p.rows&&p.perRow!==false?p.rows.map(x=>x[1]==='max'?'Max':x[1]).join('/'):rg(p.r);

const planShort=id=>{const p=EX[id].plan,m=modeOf(id);if(m==='cardio')return`${rg(p.n)}×${p.min} min @ ${fmt(p.speed)} km/h`;
  if(m==='time')return`${rg(p.n)}×${rg(p.sec)} sec`;return rg(p.n)+'×'+rowsReps(p)+(p.side?` (${rg(p.r.map(v=>v/2))}/side)`:'')};
const loadTxt=(p,id)=>{const f=v=>fmt(Math.round(v*100)/100);return p.pct?`${p.pct}% 1RM`:p.load?(p.rows?[...new Set(p.rows.map(x=>f(x[0])))].join('/'):rg(p.load,f))+' kg':''};
const hasLoad=p=>!!(p.pct||p.load);
const effRg=p=>EF()==='rpe'?rg([10-p.rir[1],10-p.rir[0]]):rg(p.rir);   
const restTxt=p=>p.tsb?fmtRest(p.rest)+' / '+fmtRest(p.tsb.rest):fmtRest(p.rest);   
const chipTxt=(id,o={})=>{const p=EX[id].plan;return[planShort(id)+(o.short||o.lead||!hasLoad(p)?'':' @ '+loadTxt(p,id)),EF()==='off'||o.short||!p.rir||!hasEff(id)?null:EF().toUpperCase()+' '+effRg(p),o.rest===false||!p.rest?null:o.html?`<span class="prest">${ic('timer',14,2)}${restTxt(p)}</span>`:restTxt(p),o.short||!p.phase?null:p.phase,o.short||!p.int?null:p.int.t==='drop'?`Drop −${p.int.pct}%`:'Rest-pause'].filter(Boolean).join(' · ')};

const refBest=()=>sg('og-logref','last')==='best',refLbl=()=>refBest()?"Best":"Last time";


const OOPW=()=>sg('og-oopw','live');
function findsL(id,i){const p=EX[id].plan,s=S.sets[id][i],m=modeOf(id),o=[];if(s.wu||p.rows||s.clusters||s.sides||m==='cardio'||(OOPW()==='done'&&!s.d))return o;
  const chk=(f,v,[lo,hi],name,u)=>{if(v<lo)o.push({f,dir:-1,d:Math.round((v-lo)*100)/100,name,u,id});else if(v>hi)o.push({f,dir:1,d:Math.round((v-hi)*100)/100,name,u,id})};
  if(m==='time')chk('sec',s.sec,p.sec,"seconds","sec");
  else{chk('r',s.r,p.r,"reps",'reps');if(p.load)chk('w',s.w,p.load,"weight",'kg')}
  return o}
const oopLong=x=>`${x.name} ${x.dir<0?"below":"above"} target`,oopTxt=x=>`${x.dir<0?'−':'+'}${fmt(Math.abs(x.f==='w'?wShow(x.id,x.d):x.d))} ${x.u}`;
const finds=(id,i)=>findsL(id,i).map(oopLong).join(' · ');
const oopChip=x=>`<span class="oopc ${x.dir<0?'lo':'hi'}">${ic(x.dir<0?'down':'up',12,2.8)}${oopTxt(x)}<span class="oop-vh"> ${oopLong(x)}</span></span>`;
const oopSets=id=>S.sets[id].map((_,i)=>i).filter(i=>findsL(id,i).length);

function oopCell(id,i,f){const x=findsL(id,i).find(y=>y.f===f);if(!x)return{cls:'',html:''};
  const k=x.dir<0?'lo':'hi';
  return{cls:` oop ${k}`,html:`<i class="oopb ${k}">${ic(x.dir<0?'down':'up',10,3)}<span aria-hidden="true">${oopTxt(x)}</span><span class="oop-vh">${oopLong(x)}: ${oopTxt(x)}</span></i>`}}

function oopPill(id){const l=oopSets(id);if(!l.length)return'';
  return`<button class="oopp ${l.some(i=>findsL(id,i).some(x=>x.dir<0))?'lo':'hi'}" data-act="oopinfo" data-ex="${id}" aria-haspopup="dialog" aria-label="Out of plan: ${l.length} ${l.length===1?"set":"sets"}">${ic('warn',15,2)}${l.length}</button>`}
function oopSheet(id){const p=EX[id].plan;
  openSheet(`<h3 style="margin-bottom:2px">Out of plan</h3><div class="muted small" style="margin-bottom:10px">${esc(EX[id].name)} · target ${planShort(id)}${hasLoad(p)?' @ '+loadTxt(p,id):''}. These are hints; entered values stay unchanged.</div>
    <div class="list menu-list">${oopSets(id).map(i=>`<div class="item menu-item"><div class="grow"><div class="tt">Set ${wn(id,i)} · ${valTxt(id,S.sets[id][i])}</div><div class="oopline" style="margin:4px 0 0">${findsL(id,i).map(oopChip).join('')}</div></div></div>`).join('')}</div>`)}
const PLV=(()=>{try{return JSON.parse(sg('og-plv','{}'))}catch{return{}}})();
const kvr=(a,b)=>`<div class="kv"><span>${a}</span><span>${b}</span></div>`;
function planBody(id,lv){const ex=EX[id],p=ex.plan,pr=PRESET[p.preset],m=modeOf(id),today=wTot(id),e=p.int?.t==='rp'?[1,1]:p.n;
  const hint=p.preset==='autoregulated'?`You set every value by feel (${m==='time'?'seconds':'reps'} and load); nothing is advanced for you.`:p.preset==='double'?`Reach the top of the ${m==='time'?'time':'rep'} range, then add weight and start again.`:p.preset==='triple'&&m==='time'?'Fill sets and duration up to the top of the range, then add weight.':pr[1];
  return`<div class="pctx"><div class="kv"><span>${refLbl()}</span><button class="kvbtn" data-act="logref" aria-label="Show ${refBest()?"last time":"best"} instead">${refTxt(ex)}${ic('undo',13,2)}</button></div>${kvr("Progression",pr[0])}
    ${p.deload?`<div class="pnote">Reduced after ${p.deload.stalls} off-target sessions: ${fmt(p.deload.from)} → ${fmt(p.deload.to)} kg.</div>`:''}${p.out?"<div class=\"pnote\">Suggested from a recorded off-target session.</div>":''}
    ${p.pct&&!rmRec(id)?`<div class="pnote">No recorded 1RM: enter your working load.</div><button class="plink" data-act="rmprompt" data-ex="${id}">Enter 1RM${ic('chevR',14,2)}</button>`:''}${p.completed?"<div class=\"pnote acc\">Progression completed.</div>":''}
    ${today<e[0]||today>e[1]?kvr("Today",`${today} sets (planned ${rg(e)})`):''}${lv===1?`<button class="plink" data-act="plv" data-k="${id}" data-to="2">How it works${ic('chevR',14,2)}</button>`:''}</div>`+
  (lv>1?`<div class="pdet">${kvr("Sets",rg(p.n))}${m==='cardio'?kvr("Duration",p.min+' min')+kvr("Speed",fmt(p.speed)+' km/h'):m==='time'?kvr("Duration",rg(p.sec)+" s"):kvr("Reps",rowsReps(p)+(p.side?" (total, half per side)":''))}${hasLoad(p)?kvr("Load",loadTxt(p,id))+(p.pct&&rmRec(id)?`<div class="rmcalc">${rmCalc(p.pct,rmRec(id))}</div>`:'')+(weOk(id)?`<div class="kv"><span>Weight is</span><button class="kvbtn" data-act="excfg" data-ex="${id}" aria-label="Change weight meaning">${WEL[weMode(id)]}${ic('chevR',13,2)}</button></div>`:''):''}${p.rir&&EF()!=='off'&&hasEff(id)?kvr("Effort",EF().toUpperCase()+' '+effRg(p)):''}
    ${m==='cardio'?'':kvr("Rest",p.rest?restTxt(p):"Default · "+fmtRest(DEF_REST))}${m==='reps'?kvr("Warm-ups",p.warm||"None"):''}${p.side?kvr('Sides',"Left and right recorded separately"):''}${(p.kv||[]).map(([a,b])=>kvr(a,b)).join('')}${p.int?kvr("Intensifier",p.int.t==='drop'?`Drop-set · ${p.int.count} drop, −${p.int.pct}% a drop`:`Rest-pause · +${p.int.total} reps in bursts with ${p.int.rest}sec`):''}
    <div class="how"><b>${pr[0]}</b><p>${hint}</p><button class="plink" data-say="Progression settings open in the app">Progression settings${ic('chevR',14,2)}</button></div>${ex.note?`<div class="note">${ic('note',16)}${ex.note}</div>`:''}
    ${lv===2?`<button class="plink" data-act="plv" data-k="${id}" data-to="1">Fewer details</button>`:''}</div>`:'')}

function planUI(id,o={}){const lv=o.sheet?0:(PLV[id]??(o.def||0)),at=o.sheet?`data-act="plsheet" data-ex="${id}"`:`data-act="plv" data-k="${id}" data-to="${lv?0:1}" aria-expanded="${!!lv}"`;
  return`<div class="plan${o.lead?' ss':''}"><div class="prow">${o.lead||''}<button class="pchip" ${at}><span>${chipTxt(id,{...o,html:true})}</span>${o.sheet?'':ic(lv?'chevU':'chevD',16)}</button>${oopPill(id)}${!o.lead&&EX[id].plan.completed?"<span class=\"ptag ok\">Completed</span>":''}</div>${lv?planBody(id,lv):''}</div>`}
const ssName=u=>UNITS[u].name||'Superset';
const ssHd=u=>`${ssName(u)} · Round ${curRound(u)+1} / ${maxSets(u)}`;
const unitName=u=>UNITS[u].ss&&UNITS[u].name?UNITS[u].name:UNITS[u].ex.map(e=>EX[e].name).join(' + ');
const ssPlan=(u,o={})=>`<div class="ss-ord">${UNITS[u].ex.map((e,k)=>planUI(e,{...o,rest:false,lead:`<span class="L">${String.fromCharCode(65+k)}</span>${o.dense?`<span class="nm">${EX[e].name}</span>`:`<span class="nm">${EX[e].name}<small>${esc(EX[e].equip)}</small></span>${infoBtn(e)}`}`})).join('')}<div class="ss-rest"><span class="rchip">${ic('timer',15,2)}${fmtRest(restOf(u))}</span><span class="ss-note">${UNITS[u].rest?"after each round · chosen for this superset":"after each round · longest exercise rest"}</span></div></div>`;



const infoBtn=id=>`<button class="infob" data-act="exinfo" data-ex="${id}" aria-label="Info: ${esc(EX[id].name)}">${ic('info',18,2)}</button>`;
const eqChip=id=>`<div class="eqrow"><span class="eqchip">${ic('dumb',14,2)}${esc(EX[id].equip)}</span></div>`;
const sethead=(id,lt)=>{const cs=id?colsOf(id):['w','r'],m=id?modeOf(id):'reps';
  return`<div class="sethead">${lt?'<span class="n"></span>':''}${id&&EX[id].side?'<span class="sdh"></span>':''}${cs.map((c,k)=>`<span class="${k?'r':'w'}">${c==='w'&&id?weHd(id):FLD[c].hd}</span>`).join('')}${m==='reps'&&EF()!=='off'?`<span class="e">${EF().toUpperCase()}</span>`:''}${m==='time'?'<span class="g"></span>':''}<span class="c"></span><span class="m"></span></div>`};
function stp(id,i,f,o,side){const s=S.sets[id][i],x=side?s.sides[side]:s,v=f==='e'?effShow(effOf(id,x)):f==='w'?wShow(id,x[f]||0):x[f],ghost=o.ghost&&!x.d&&!x.t,lbl=FLD[f]?(f==='w'&&weOk(id)?(weMode(id)==='total'?"Weight of both dumbbells":weMode(id)==='each'?"Weight of one dumbbell":"Weight"):FLD[f].lbl)+' '+EX[id].name+(side?(side==='L'?" left":" right"):''):EF().toUpperCase()+' '+EX[id].name,at=`data-f="${f}" data-ex="${id}" data-i="${i}"${side?` data-side="${side}"`:''}`;
  const fk=(f==='r'||f==='sec')&&s.f?`<i class="fmark" aria-hidden="true">${ic('gauge',9,2.8)}</i>`:'';
  const empty=(f==='inc'&&x.inc==null)||(f==='r'&&s.max&&!x.r&&!x.d);
  const b=(a,n)=>o.steppers===false?'':`<button data-act="${a}" ${at} aria-label="${a==='inc'?"Increase":"Decrease"} ${lbl}">${ic(n,18,2.2)}</button>`;
  const oc=side?{cls:'',html:''}:oopCell(id,i,f);
  return`<div class="stp ${colsOf(id).indexOf(f)?'r':'w'}${oc.cls}">${fk}${b('dec','minus')}<input class="num${ghost?' ghost':''}" inputmode="decimal" ${at} value="${empty?'':fmt(v||0)}"${empty?` placeholder="${f==='inc'?'–':'Max'}"`:''} aria-label="${lbl}">${b('inc','plus')}${oc.html}</div>`}
const rowCells=(id,i,o,side)=>colsOf(id).map(c=>stp(id,i,c,o,side)).join('')+(hasEff(id)&&EF()!=='off'?effCell(id,i,o,side):'');
function setRow(id,i,o={}){const s=S.sets[id][i],nx=nextOpen(),next=nx&&!s.d&&((nx.e===id&&nx.i===i)||(UNITS[nx.u].ss&&unitOf(id)===nx.u&&i===nx.i)),pop=S.pop===id+':'+i,m=modeOf(id),a=`data-ex="${id}" data-i="${i}"`,
  num=!o.letter?'':`<button class="n" data-act="smenu" ${a} aria-label="Set options ${s.wu?"warm-up":wn(id,i)}">${o.letter}</button>`,
  chk=(side,d)=>`<button class="chk${pop?' pop':''}" data-act="tick" ${a}${side?` data-side="${side}"`:''} aria-pressed="${!!d}" aria-label="Complete ${side?(side==='L'?"left":"right")+" side of ":''}${s.wu?"warm-up":"set "+wn(id,i)}${s.f?", to failure":''}">${ic('check',20,2.6)}</button>`,
  more=`<button class="more" data-act="smenu" ${a} aria-label="More about ${s.wu?"warm-up":"set "+wn(id,i)}: drop set, rest-pause, remove" title="${s.sides||m!=='reps'?"Remove":"Drops · Rest-pause · Remove"}">${ic('dots',20,3.4)}</button>`,
  fm='',cr=modeOf(id)==='cardio'?' c3':'',
  cls=`setrow${cr}${s.d?' done':''}${next?' is-next':''}${s.wu?' wu':''}${s.sides?' sidewrap':''}`;
  const main=s.sides?`<div class="${cls}"${next?' aria-current="step"':''}>${fm}${num}<div class="side-rows">${['L','R'].map(sd=>`<div class="srow${s.sides[sd].d?' done':''}"><span class="sd">${sd}</span>${rowCells(id,i,o,sd)}${chk(sd,s.sides[sd].d)}</div>`).join('')}</div>${more}</div>`
    :`<div class="${cls}"${next?' aria-current="step"':''}>${fm}${num}${rowCells(id,i,o)}${m==='time'?`<button class="setgo" data-act="tick" ${a} aria-label="Start hold" title="Start hold">${ic('play',16)}</button>`:''}${chk(null,s.d)}${more}</div>`;
  const pv=S.sets[id][i-1],lab=s.max?`<div class="setlbl">Max: as many reps as possible${EX[id].rec?` · Record: ${EX[id].rec}`:''}</div>`:s.ph&&s.ph!==pv?.ph?`<div class="setlbl">${s.ph==='top'?'Top set':'Back-off'}</div>`:'';
  return lab+main+subs(id,i,next)}

const setCtl=(id,lbl,o={})=>{const a=`data-ex="${id}"`;return`<div class="sctl${unitOf(String(id).split(',')[0])===S.cur?' cur':''}"><div class="sbtns">${lbl?`<span class="L">${lbl}</span>`:''}${modeOf(String(id).split(',')[0])==='reps'?`<button class="btn sm" data-act="wadd" ${a}>${ic('flame',15)}Warm-ups</button>`:''}<button class="btn sm" data-act="sadd" ${a}>${ic('plus',15,2.2)}Add set</button>${o.i!=null?`<button class="btn sm" data-act="smenu" ${a} data-i="${o.i}">${ic('dots',15)}Set options</button>`:''}</div></div>`};

function subs(id,i,on){const s=S.sets[id][i];if(s.wu||s.sides||modeOf(id)!=='reps')return'';const a=`data-ex="${id}" data-i="${i}"`,L=(k,kd,f,v)=>`${a} data-k="${k}" data-kind="${kd}" data-f="${f}"`;
  const mini=(v,k,kd,f)=>`<div class="stp mini"><button data-act="sdec" ${L(k,kd,f)} aria-label="Decrease">${ic('minus',14,2.2)}</button><input class="num sub" inputmode="decimal" ${L(k,kd,f)} value="${fmt(f==='w'?wShow(id,v):v)}" aria-label="${kd==='d'?'Drop':'Burst'} ${k+1} ${f==='w'?"weight":"reps"}"><button data-act="sinc" ${L(k,kd,f)} aria-label="Increase">${ic('plus',14,2.2)}</button></div>`;
  const x=(k,kd)=>`<button class="sx" data-act="srm" ${a} data-k="${k}" data-kind="${kd}" aria-label="Remove ${kd==='d'?'drop':'burst'}">${ic('x',13,2.2)}</button>`;
  const plus=(kd,last)=>last?`<button class="sx" data-act="sext" ${a} data-kind="${kd}" aria-label="Add ${kd==='d'?'drop':'burst'}" title="Add ${kd==='d'?'drop':'burst'}">${ic('plus',16,2.4)}</button>`:'<span class="sx"></span>';   
  const dr=s.drops||[],cl=s.clusters||[];
  return dr.map((d,k)=>`<div class="subrow${on?' on':''}"><span class="subn">Drop ${k+1}</span>${mini(d.w,k,'d','w')}${mini(d.r,k,'d','r')}${plus('d',k===dr.length-1)}${x(k,'d')}</div>`).join('')+
    cl.map((c,k)=>`<div class="subrow${on?' on':''}"><span class="subn">Burst ${k+1}</span>${mini(c.r,k,'c','r')}<span class="dim">${c.restSec}sec</span>${plus('c',k===cl.length-1)}${x(k,'c')}</div>`).join('')}
function addExtra(id,i,kind){const s=S.sets[id][i],int=EX[id].plan.int;
  if(kind==='d'){const d=s.drops||(s.drops=[]),base=d.length?d[d.length-1].w:s.w;d.push({w:nextDrop(base,int?.t==='drop'?int.pct:20,EX[id].step),r:s.r});s.type='dropset'}
  else{const c=s.clusters||(s.clusters=[]),add=nextBurst(c.length?c[c.length-1].r:s.r);c.push({r:add,restSec:int?.t==='rp'?int.rest:15});s.r+=add;s.type='restpause'}
  save()}
function subSet(id,i,kind,k,f,v){const s=S.sets[id][i];
  if(kind==='d')s.drops[k][f]=Math.max(0,Math.round(v*100)/100);
  else{const c=s.clusters[k],nv=Math.max(0,Math.round(v));s.r=Math.max(0,s.r+nv-c.r);c.r=nv}save()}
function setMenu(id,i){const s=S.sets[id][i],warm=s.wu,work=S.sets[id].filter(x=>!x.wu),reps=modeOf(id)==='reps',it=(m,ico,t,sb,cls,on)=>`<div class="item menu-item${cls||''}" tabindex="0" role="button" data-m="${m}"><span class="lrow-i">${ic(ico,16)}</span><div class="grow"><div class="tt">${t}</div>${sb?`<div class="muted small">${sb}</div>`:''}</div>${on==null?'':`<span class="menu-on${on?' is-on':''}">${ic('check',16,2.4)}</span>`}</div>`;
  openSheet(`<h3 style="margin-bottom:2px">${warm?"Warm-ups":"Set "+wn(id,i)}</h3><div class="muted small" style="margin-bottom:10px">${esc(EX[id].name)} · ${valTxt(id,s)}</div>${findsL(id,i).length?`<div class="oopline" style="margin:0 0 10px">${findsL(id,i).map(oopChip).join('')}</div>`:''}<div class="list menu-list">
    ${!warm&&reps&&!s.sides&&!s.drops&&!s.clusters&&work.length>1?it('wu','flame',"Make warm-up set"):''}${warm&&reps?it('wk','dumb',"Count as a working set"):''}
    ${!warm&&modeOf(id)!=='cardio'?it('fail','gauge',"To failure",hasEff(id)&&EF()!=='off'?`Nothing left: counts as ${EF().toUpperCase()} ${effShow(0)} if unrated`:modeOf(id)==='time'?'Hold until you cannot continue.':'Continue until you cannot complete another rep.','',!!s.f):''}
    ${!warm&&!s.clusters&&!s.sides&&reps?it('drop','down',"Drops",'+ Drop'):''}${!warm&&!s.drops&&!s.sides&&reps?it('burst','bolt','Rest-pause','+ Burst'):''}
    ${!warm?it('rst','timer',"Rest after this set",S.sets[id][i].rest==null?"Uses the exercise's rest":S.sets[id][i].rest?fmtRest(S.sets[id][i].rest)+' today':"No timer today"):''}${it('copy','plus',"Copy this set")}${it('rm','trash',"Remove this set",'',(!warm&&work.length<=1)?' disabled':'')}</div>`,(sh,close)=>{
    sh.addEventListener('click',e=>{const m=e.target.closest('[data-m]')?.dataset.m;if(!m)return;close();const a=S.sets[id];
      if(m==='rst'){restSheet(id,i);return}
      if(m==='fail'){if(s.f)delete s.f;else s.f=1}
      else if(m==='drop'||m==='burst')addExtra(id,i,m==='drop'?'d':'c')
      else if(m==='wu'||m==='wk'){const[r]=a.splice(i,1);if(m==='wu')r.wu=1;else delete r.wu;a.splice(a.filter(x=>x.wu).length,0,r)}   
      else if(m==='copy'){const c=JSON.parse(JSON.stringify(s));for(const x of[c,...Object.values(c.sides||{})]){x.d=0;x.t=0;delete x.e}delete c.drops;delete c.clusters;delete c.type;a.splice(i+1,0,c)}
      else a.splice(i,1);
      save();RENDER()})})}

const ROPEN={};
function ssBody(u,o={}){const un=UNITS[u],cr=curRound(u),m=maxSets(u),sum=r=>un.ex.map(e=>{const s=S.sets[e][r];return s?fmt(wShow(e,s.w))+'×'+s.r:''}).filter(Boolean).join(' · ');
  const L=k=>String.fromCharCode(65+k),ord=o.abc?ssPlan(u,o):'';
  
  const hdr=(sets,k)=>{const h=sethead(sets[k],true),prev=k?sethead(sets[k-1],true):o.dense?sethead(null,true):'';return h===prev?'':h};
  return ord+Array.from({length:m},(_,r)=>{const sets=un.ex.filter(e=>S.sets[e][r]),done=sets.every(e=>S.sets[e][r].d),key=u+':'+r,open=ROPEN[key]??true,st=done?'done':r===cr?'cur':'fut';
    return`<section class="rgrp ${st}${open?' open':''}"><button class="rhd" data-act="rtoggle" data-key="${key}" data-open="${open?1:0}" aria-expanded="${open}"><span class="rt">${done?ic('check',14,2.6):''}Round ${r+1}</span><span class="rs tnum">${open?'':sum(r)}</span>${ic(open?'chevU':'chevD',16)}</button>
      ${open?`<div class="rbody">${sets.map((e,k)=>hdr(sets,k)+(o.abc?setRow(e,r,{...o,letter:L(un.ex.indexOf(e))}):`<div class="rname">${EX[e].name}<span> · ${EX[e].equip}</span></div>${setRow(e,r,o)}`)).join('')}</div>`:''}</section>`}).join('')+`<div class="sctls">${setCtl(un.ex.join(','))}</div>`}

const Rest={on:0,left:0,total:0,paused:0,ready:0,open:sg('og-rest-open','0')==='1',
  mode:()=>sg('og-rest-mode','remember'),
  start(sec){Object.assign(Rest,{on:1,left:sec,total:sec,plan:sec,paused:0,ready:0});const m=Rest.mode();if(m==='expanded')Rest.open=true;else if(m==='collapsed')Rest.open=false;Rest.paint();Rest.detail()},
  stop(){Rest.on=0;Rest.paint()},
  setOpen(v){Rest.open=v;if(Rest.mode()==='remember')ss('og-rest-open',v?'1':'0');Rest.paint()},
  paint(){const r=$('#rest');if(!r)return;r.hidden=!Rest.on;r.classList.toggle('open',Rest.open);r.classList.toggle('ready',!!Rest.ready);
    $('.rest-handle',r).setAttribute('aria-expanded',Rest.open);
    const m=Math.floor(Rest.left/60),s=String(Rest.left%60).padStart(2,'0');
    $('#rt').textContent=Rest.ready?"Ready":`${m}:${s}`;$('#rl').textContent=Rest.ready?"rest finished":Rest.paused?"paused":"rest";
    $('#rp').style.width=(Rest.total?(Rest.ready?100:(1-Rest.left/Rest.total)*100):0)+'%';
    const pb=$('[data-r=pause]',r);pb.innerHTML=ic(Rest.paused?'play':'pause',16);pb.setAttribute('aria-label',Rest.paused?"Resume":"Pause");$('[data-r=skip]',r).textContent=Rest.ready?"Dismiss":"Skip"},
  detail(){const el=$('#rd');if(!el)return;const n=nextOpen();
    if(!n){el.innerHTML="<div class=\"rd-t\">Workout completed</div>";return}
    const un=UNITS[n.u],lab=ex=>un.ss?`Round ${n.i+1}/${maxSets(n.u)}`:S.sets[n.e][n.i].wu?"Warm-ups":`Set ${wn(n.e,n.i)}/${wTot(n.e)}`;
    if(un.ss){   
      el.innerHTML=`<div class="rd-k">Up next · Superset · ${lab()}</div>`+un.ex.filter(e=>S.sets[e][n.i]).map(e=>{const ex=EX[e],s=S.sets[e][n.i];
        return`<div class="rd-row${s.d?' dn':''}"><div class="rd-t">${s.d?ic('check',15,2.6)+' ':''}${ex.name} <span>· ${ex.equip}</span></div><div class="rd-v sm">${valTxt(e,s)}</div>${plateLine(e,n.i)}</div>`}).join('')}
    else{const ex=EX[n.e],s=S.sets[n.e][n.i];
      el.innerHTML=`<div class="rd-k">Up next</div><div class="rd-t">${ex.name} <span>· ${lab()}</span></div><div class="rd-v">${valTxt(n.e,s)}</div>${plateLine(n.e,n.i)}
        <div class="plateline"><span>${refLbl()} · ${refTxt(ex)}</span></div>${ex.pin?`<div class="note pin">${ic('note',16)}${ex.pin}</div>`:''}`}
    if(Rest.plan)el.innerHTML+=`<div class="plateline"><span>Planned rest · ${fmtRest(Rest.plan)}</span></div>`}};
setInterval(()=>{if(Rest.on&&!Rest.paused){if(!Rest.ready){if(--Rest.left<=0){Rest.left=0;Rest.ready=1;if(sg('og-snd','1')==='1')playSnd()}Rest.paint()}}head()},1000);


const CHIPS=()=>sg('og-chips','1')==='1';
let ON_CHIP=()=>{},CHIP_CUR=-1;

const chipOf=u=>{const ids=UNITS[u].ex,work=ids.map(e=>S.sets[e].filter(s=>!s.wu)),all=work.flat(),
  touched=ids.some(e=>S.sets[e].some(s=>s.d||(s.sides&&(s.sides.L.d||s.sides.R.d))));
  return{state:work.every(w=>w.length&&w.every(s=>s.d))?'done':touched?'partial':'todo',p:all.length?Math.round(all.filter(s=>s.d).length/all.length*100):0}};
function chipsPaint(){const el=$('#chips');if(!el)return;el.hidden=!CHIPS();if(el.hidden)return;
  const left=el.scrollLeft,W={done:"finished",partial:"started",todo:"not started"};
  el.innerHTML=UNITS.map((un,u)=>{const c=chipOf(u),cur=u===S.cur,n=un.ex.map(e=>EX[e].name).join(' + ');
    return`<button class="wchip ${c.state}${cur?' cur':''}" style="--p:${Math.max(c.p,14)}%" data-chip="${u}"${cur?' aria-current="step"':''} title="${esc(n)}" aria-label="${un.ss?'Superset':"Exercise"} ${u+1}: ${esc(n)} (${W[c.state]})"><span>${u+1}</span>${un.ss?ic('link',12,2.4):''}</button>`}).join('');
  el.scrollLeft=left;   
  if(CHIP_CUR!==S.cur){const first=CHIP_CUR<0;CHIP_CUR=S.cur;const c=el.querySelector('.cur');if(c)el.scrollTo({left:c.offsetLeft-(el.clientWidth-c.offsetWidth)/2,behavior:first?'auto':'smooth'})}}
document.addEventListener('click',e=>{const c=e.target.closest('[data-chip]');if(c)ON_CHIP(+c.dataset.chip)});


const MODES=[['cards','Cards'],['list','List'],['compact','Compact'],['focus','Focus']];
const T0=+sg('og-t0',Date.now());ss('og-t0',T0);
const clock=()=>{const t=34*60+12+Math.floor((Date.now()-T0)/1000);return`${Math.floor(t/3600)}:${String(Math.floor(t/60)%60).padStart(2,'0')}:${String(t%60).padStart(2,'0')}`};
function head(){const c=counts();$('.cnt')&&($('.cnt').textContent=`${c.d}/${c.t} sets · ${Math.round(Object.keys(S.sets).reduce((a,id)=>a+volume(id),0)).toLocaleString('en-GB')} kg`);$('#clk')&&($('#clk').textContent=clock());$('.wprog i')&&($('.wprog i').style.width=(c.d/c.t*100)+'%')}
function chrome(){
  const mode=document.body.dataset.mode,name=MODES.find(m=>m[0]===mode)[1],notes=$('#notes')?.innerHTML||'',ctl=$('#ctl')?.innerHTML||'';
  document.body.insertAdjacentHTML('afterbegin',`
  <nav class="top" aria-label="Views">${MODES.map(([k,n])=>`<a href="${k}.html" class="${k===mode?'on':''}">${n}</a>`).join('')}<a href="index.html">All mocks</a></nav>
  <div class="row"><div class="phone" id="phone">
    <div class="screen" id="screen"><header class="whdr"><div class="whdr-row"><div><div class="wt">Push A</div>
      <div class="wsub"><span id="clk"></span> · <span class="cnt" aria-live="polite"></span></div></div>
      <button class="fpill" data-act="finish">Finish</button><button class="ibtn" data-act="menu" aria-label="Workout menu" aria-haspopup="true">${ic('dots',22)}</button></div>
      <div class="wprog" role="progressbar"><i></i></div><nav class="chips" id="chips" aria-label="Workout exercises"></nav><div id="hx"></div></header><main id="view"></main></div>
    <div class="menu" id="menu" hidden><button data-act="wset">${ic('set',18)}Workout settings</button><button data-act="addex">${ic('plus',18)}Add exercise</button><button data-act="note">${ic('pencil',18)}Session note</button><div class="mh">View</div>${MODES.map(([k,n])=>`<a href="${k}.html" class="${k===mode?'on':''}">${n}${k===mode?ic('check',16,2.4):''}</a>`).join('')}<button class="dng" data-act="discard">${ic('trash',18)}Discard workout</button></div>
    <div class="rest" id="rest" hidden><button class="rest-handle" data-r="toggle" aria-expanded="false" aria-label="Rest details"><span></span></button>
      <div class="rest-detail" id="rd"></div>
      <div class="rest-main"><button class="rest-t" data-act="rtime" aria-label="Change the time left"><b id="rt">0:00</b><small id="rl">rest</small></button><div class="rest-prog"><i id="rp"></i></div>
        <button class="rbtn" data-r="-15" aria-label="Subtract 15 seconds">−15</button><button class="rbtn" data-r="15" aria-label="Add 15 seconds">+15</button><button class="rbtn" data-r="pause" aria-label="Pause"></button><button class="rbtn pri" data-r="skip">Skip</button></div></div>
  </div>
  <aside class="aside"><h3>${name}</h3><p class="muted">openGym 1.4.3 · Progression Engine v2</p><ul>${notes}<li>Try reps, timed holds, cardio, supersets and intensifiers. Set menus expose planned targets and recorded effort.</li><li>Exercise information includes equipment, records, plate loading and estimated 1RM.</li></ul>
    <div class="ctl"><label>Rest bar<select id="rmode"><option value="collapsed">Always collapsed</option><option value="remember">Remember last choice</option><option value="expanded">Always expanded</option></select></label>
      <label>Exercise animations<select id="mmode"><option value="full">Full</option><option value="mini">Small</option><option value="off">Hidden</option></select></label>
      <label>Exercise chips<select id="chmode"><option value="1">Shown</option><option value="0">Hidden</option></select></label>
      <label>Effort<select id="emode"><option value="off">Off</option><option value="rir">RIR</option><option value="rpe">RPE</option></select></label>
      <label>Weight means (dumbbells)<select id="wemode"><option value="as">As entered</option><option value="each">One dumbbell</option><option value="total">Both</option></select></label>
      <label>My dumbbells<select id="rackmode"><option value="0">Not specified</option><option value="1">2–32 kg in 2 kg steps</option></select></label>
      <label>Squat 1RM<select id="sqrm"><option value="none">Not recorded</option><option value="est">Estimated from the log</option></select></label>
      <label>Show target differences<select id="oopw"><option value="live">As you type</option><option value="done">After completing a set</option></select></label>${ctl}
      <button class="abtn" id="reset">Reset demo</button></div>
    <div class="muted">Demo data. Complete a set with ✓ to start rest; tap the rest bar handle to expand it.</div></aside></div>`);
  $('#mmode').value=MS();$('#mmode').onchange=e=>{ss('og-media',e.target.value);RENDER()};$('#chmode').value=CHIPS()?'1':'0';$('#chmode').onchange=e=>{ss('og-chips',e.target.value);RENDER()};$('#emode').value=EF();$('#emode').onchange=e=>{ss('og-effort',e.target.value);RENDER()};$('#wemode').value=['each','total'].find(m=>Object.keys(EX).filter(weOk).every(k=>weMode(k)===m))||'as';$('#wemode').onchange=e=>{Object.keys(EX).filter(weOk).forEach(k=>S.weightEntry[k]={mode:e.target.value,_ts:Date.now()});save();RENDER()};$('#rackmode').value=rackOn()?'1':'0';$('#rackmode').onchange=e=>{ss('og-rack',e.target.value)};$('#sqrm').value=sg('og-sqrm','none');$('#sqrm').onchange=e=>{ss('og-sqrm',e.target.value);if(S.oneRm)delete S.oneRm.squat;save();RENDER()};$('#oopw').value=OOPW();$('#oopw').onchange=e=>{ss('og-oopw',e.target.value);RENDER()};$('#rmode').value=Rest.mode();$('#rmode').onchange=e=>{ss('og-rest-mode',e.target.value)};
  $('#reset').onclick=()=>{try{sessionStorage.clear()}catch{}location.reload()};
  new ResizeObserver(()=>$('#phone').style.setProperty('--rest-h',$('#rest').hidden?'0px':$('#rest').offsetHeight+8+'px')).observe($('#rest'));
}
let RENDER=()=>{};
function mount(fn){chrome();RENDER=()=>{const sc=$('#screen'),y=sc.scrollTop;sc.style.scrollBehavior='auto';$('#phone').classList.toggle('eff',EF()!=='off');fn();chipsPaint();sc.scrollTop=y;sc.style.scrollBehavior='';S.pop=null;head();Rest.detail()};RENDER();head()}

document.addEventListener('click',e=>{
  const rb=e.target.closest('[data-r]');
  if(rb){const a=rb.dataset.r;if(a==='toggle')Rest.setOpen(!Rest.open);else if(a==='skip')Rest.stop();else if(a==='pause')Rest.paused=!Rest.paused;
    else{Rest.left=Math.max(1,Rest.left+ +a);Rest.total=Math.max(Rest.total,Rest.left);Rest.ready=0}Rest.paint();return}
  const m=$('#menu');if(m&&!m.hidden&&!e.target.closest('#menu'))m.hidden=true;
  const b=e.target.closest('[data-act]');if(!b)return;const a=b.dataset.act,id=b.dataset.ex,i=+b.dataset.i;
  if(a==='menu'){m.hidden=!m.hidden;e.stopPropagation();return}
  if(a==='mtoggle'){e.stopPropagation();ss('og-media',MS()==='mini'?'full':'mini');$('#mmode')&&($('#mmode').value=MS());RENDER();return}
  if(a==='rtoggle'){ROPEN[b.dataset.key]=b.dataset.open!=='1';RENDER();return}
  if(a==='mplay'){MPLAY=!MPLAY;RENDER();return}
  if(a==='plv'){PLV[b.dataset.k]=+b.dataset.to;ss('og-plv',JSON.stringify(PLV));RENDER();return}
  if(a==='rmprompt'){rmPrompt(b.dataset.ex);return}
  if(a==='plsheet'){openSheet(`<h3>${EX[id].name}</h3><div class="pchips">${esc(chipTxt(id))}</div>${planBody(id,3)}`);return}
  if(a==='logref'){ss('og-logref',refBest()?'last':'best');RENDER();return}
  if(a==='smenu'){setMenu(id,i);return}
  if(a==='oopinfo'){oopSheet(id);return}
  if(a==='excfg'){exCfgSheet(id);return}
  if(a==='exinfo'){infoSheet(id);return}
  if(a==='sdec'||a==='sinc'){const k=+b.dataset.k,kd=b.dataset.kind,f=b.dataset.f,s=S.sets[id][i],cur=kd==='d'?s.drops[k][f]:s.clusters[k].r;subSet(id,i,kd,k,f,cur+(a==='sinc'?1:-1)*(f==='w'?EX[id].step:1));RENDER();return}
  if(a==='sext'){addExtra(id,i,b.dataset.kind);RENDER();return}
  if(a==='srm'){const s=S.sets[id][i],k=+b.dataset.k;
    if(b.dataset.kind==='d'){s.drops.splice(k,1);if(!s.drops.length){delete s.drops;delete s.type}}
    else{s.r=Math.max(0,s.r-s.clusters[k].r);s.clusters.splice(k,1);if(!s.clusters.length){delete s.clusters;delete s.type}}
    save();RENDER();return}
  if(a==='sadd'||a==='wadd'){for(const x of id.split(',')){const a2=S.sets[x],w=a2.filter(s=>!s.wu);   
    if(a==='sadd'){const l=w[w.length-1]||{w:0,r:8};a2.push(l.sides?(()=>{const n={sides:{L:{...l.sides.L,d:0,t:0},R:{...l.sides.R,d:0,t:0}}};delete n.sides.L.e;delete n.sides.R.e;syncSide(n);return n})():modeOf(x)==='time'?{sec:l.sec}:modeOf(x)==='cardio'?{min:l.min,speed:l.speed,...(l.inc!=null?{inc:l.inc}:{})}:EX[x].bw?{r:l.r}:{w:l.w,r:l.r-(l.clusters||[]).reduce((n,c)=>n+c.r,0)})}   
    else{const f=w[0]||{w:0,r:8},st=EX[x].step,hw=bellEx(x)&&rackOn()?nearRack(f.w/2):Math.round(f.w/2/st)*st;a2.splice(a2.filter(s=>s.wu).length,0,{w:hw,r:Math.min(f.r,10),wu:1})}}
    save();RENDER();return}
  if(a==='finish'){finishSheet();return}if(a==='discard'){m.hidden=true;confirmDiscard();return}if(a==='wset'){m.hidden=true;wsetSheet();return}if(a==='rtime'){restTimeSheet();return}
  if(a==='note'){m.hidden=true;noteSheet();return}if(a==='addex'){addExSheet();return}if(a==='effpick'){effPicker(id,i,b.dataset.side);return}
  if(a==='inc'||a==='dec')adjust(id,i,b.dataset.f,a==='inc'?1:-1,b.dataset.side);else if(a==='tick')toggle(id,i,b.dataset.side);else return;
  RENDER()});
document.addEventListener('pointerdown',e=>{if(Rest.open&&Rest.on&&!e.target.closest('#rest'))Rest.setOpen(false)});   
document.addEventListener('change',e=>{const t=e.target;if(!t.matches?.('input.num')||!t.dataset.ex)return;
  if(t.dataset.f==='inc'&&!t.classList.contains('sub')&&t.value.trim()===''){const s0=S.sets[t.dataset.ex][+t.dataset.i];delete s0.inc;save();RENDER();return}
  const v=parseFloat(t.value.replace(',','.'));if(t.classList.contains('sub')){if(!isNaN(v))subSet(t.dataset.ex,+t.dataset.i,t.dataset.kind,+t.dataset.k,t.dataset.f,t.dataset.f==='w'?wSave(t.dataset.ex,v):v);RENDER();return}
  if(!isNaN(v)){const s=S.sets[t.dataset.ex][+t.dataset.i],sd=t.dataset.side,x=sd?s.sides[sd]:s,f=t.dataset.f;x[f]=f==='e'?Math.min(5,Math.max(0,EF()==='rpe'?10-v:v)):f==='inc'?Math.min(40,Math.max(0,Math.round(v*2)/2)):Math.max(0,f==='w'?wSave(t.dataset.ex,v):v);x.t=1;s.t=1;if(sd)syncSide(s);save()}RENDER()});
function toast(m){let t=$('#toast');if(!t){$('#phone').insertAdjacentHTML('beforeend','<div id="toast" role="status" style="position:absolute;left:50%;top:70px;transform:translateX(-50%);z-index:40;background:var(--surface-3);padding:9px 14px;border-radius:99px;font-size:13px;transition:opacity .2s;opacity:0;pointer-events:none"></div>');t=$('#toast')}
  t.textContent=m;t.style.opacity=1;clearTimeout(t._h);t._h=setTimeout(()=>t.style.opacity=0,1800)}


const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function openSheet(html,init,onClose){
  const back=document.createElement('div');back.className='mback';back.innerHTML=`<div class="sheet" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`;
  $('#phone').appendChild(back);let shut=false;
  const close=()=>{if(shut)return;shut=true;document.removeEventListener('keydown',key);back.remove();onClose&&onClose()};
  const key=e=>{if(e.key==='Escape')close()};document.addEventListener('keydown',key);
  back.addEventListener('pointerdown',e=>{if(e.target===back)close()});init&&init($('.sheet',back),close);return close}


const EB=[{rir:0,max:.25,color:'var(--purple)',feel:"Nothing left — to failure"},{rir:.5,max:.75,color:'var(--red)',feel:"Maybe half a rep left"},
  {rir:1,max:1.5,color:'var(--orange)',feel:"One more rep in the tank"},{rir:2,max:2.5,color:'var(--yellow)',feel:"Two more reps"},
  {rir:3,max:3.5,color:'var(--green)',feel:"Three more reps"},{rir:4,max:Infinity,color:'var(--acc-2)',feel:"Easy — warm-up zone"}];
const effColor=r=>r==null?null:(EB.find(b=>r<=b.max)||EB[5]).color;
const r1=v=>Math.round(v*10)/10, hd=()=>EF().toUpperCase();
const eMin=()=>EF()==='rpe'?6:0;

function stepE(cur,dir){const d=cur==null?null:r1(effShow(cur));if(d==null)return dir<0?null:(EF()==='rpe'?10-6:0);
  const nd=d+dir*.5;if(nd<eMin())return null;if(nd>10)return cur;return EF()==='rpe'?10-nd:nd}
const capE=v=>{if(v==null||isNaN(v))return null;const d=Math.min(10,Math.max(eMin(),v));return EF()==='rpe'?10-d:d};
function effCell(id,i,o={},side){const s0=S.sets[id][i],s=side?s0.sides[side]:s0;if(s0.wu)return'<div class="effcell ph"></div>';const v=s.e??null,H=hd(),a=`data-ex="${id}" data-i="${i}"${side?` data-side="${side}"`:''}`;
  if(v==null)return`<button class="effcell is-empty${s0.f?' fail':''}" data-act="effpick" ${a} aria-label="${H}"${s0.f?` title="To failure: counts as ${H} ${effShow(0)} if unrated"`:''}>${H}</button>`;
  const c=effColor(v),b=()=>'';   
  
  return`<div class="stp effcell-stp plain" style="color:${c};border-color:${c};background:color-mix(in srgb,${c} 20%,var(--surface-2))">${b('dec','minus')}<button class="val" data-act="effpick" ${a} aria-label="${H}">${fmt(r1(effShow(v)))}</button>${b('inc','plus')}</div>`}
function effPicker(id,i,side){const s0=S.sets[id][i],s=side?s0.sides[side]:s0,kind=EF(),H=hd(),orig=s.e??null;let v=orig,dismissed=false;
  const apply=nv=>{if(nv==null)delete s.e;else s.e=nv;s.t=1;if(side)syncSide(s0);save();if(nv!=null&&!s.d)toggle(id,i,side);RENDER()};   
  const lab=r=>fmt(r1(kind==='rpe'?10-r:r));
  const rows=EB.map((p,k)=>{const on=v!=null&&effColor(v)===p.color&&(v===p.rir||(k===5&&v>=4)||(k<5&&v>p.rir-.01&&v<=p.max));
    return`<div class="item menu-item${v===p.rir?' on':''}" style="--bc:${p.color}" tabindex="0" role="button" data-p="${p.rir}"><span class="lrow-i effpick-n">${k===5&&kind==='rpe'?'≤':''}${lab(p.rir)}${k===5&&kind!=='rpe'?'+':''}</span><div class="grow"><div class="tt">${p.feel}</div></div><span class="menu-on${v===p.rir?' is-on':''}">${ic('check',16,2.4)}</span></div>`}).join('');
  openSheet(`<h3 style="margin-bottom:2px">How hard was that set?</h3><div class="muted small" style="margin-bottom:10px">${kind==='rpe'?'Choose how hard the set felt':'Choose how many reps you had left'}, or enter an exact ${H} rating.</div>
    <div class="list menu-list effpick">${rows}<div class="item menu-item effpick-free"><div class="grow"><div class="tt">${H} rating</div></div>
      <div class="stp effcell-stp" id="epf"><button data-d="-1" aria-label="Decrease">${ic('minus',16,2.2)}</button><span class="val"><input class="num" id="epv" inputmode="decimal" placeholder="–"></span><button data-d="1" aria-label="Increase">${ic('plus',16,2.2)}</button></div></div></div>
    <div id="epfoot"></div>`,(sh,close)=>{
    const inp=$('#epv',sh),box=$('#epf',sh),foot=$('#epfoot',sh);
    const finish=nv=>{dismissed=true;close();apply(nv)};
    const paint=()=>{const c=effColor(v);inp.value=v==null?'':fmt(r1(effShow(v)));box.style.cssText=c?`color:${c};background:color-mix(in srgb,${c} 20%,var(--surface-2))`:'';
      $$('.menu-item[data-p]',sh).forEach(r=>{const on=v!=null&&+r.dataset.p===v;r.classList.toggle('on',on);$('.menu-on',r).classList.toggle('is-on',on)});
      foot.innerHTML=v==null?'':`<div style="height:10px"></div>${v!==orig?`<button class="btn primary" style="width:100%" data-f="done">${ic('check',18,2.4)}Done</button>`:''}<button class="btn ghost" style="width:100%" data-f="clear">${ic('x',16)}Clear rating</button>`};
    sh.addEventListener('click',e=>{const p=e.target.closest('[data-p]'),d=e.target.closest('[data-d]'),f=e.target.closest('[data-f]');
      if(p)finish(+p.dataset.p);else if(d){v=stepE(v,+d.dataset.d);paint()}
      else if(f)finish(f.dataset.f==='done'?v:null)});
    sh.addEventListener('keydown',e=>{if((e.key==='Enter'||e.key===' ')&&e.target.dataset.p){e.preventDefault();e.target.click()}});
    inp.addEventListener('input',()=>{const n=parseFloat(inp.value.replace(',','.'));v=isNaN(n)?null:capE(n);foot.innerHTML=v==null?'':foot.innerHTML});
    inp.addEventListener('change',()=>{const n=parseFloat(inp.value.replace(',','.'));v=isNaN(n)?null:capE(n);paint()});paint()},
    ()=>{if(!dismissed&&v!==orig)apply(v)})}                       


const weWhy=id=>{const x=EX[id];return x.bar?"Barbell weight is already the total. Plates are counted per side.":x.bw?"Bodyweight exercise: no weight to enter.":x.side?"One arm uses one dumbbell; the weight already means one dumbbell.":x.equip!=="Dumbbells"?"This setting applies to dumbbells and kettlebells only.":"This exercise has no load."};
function weRow(id,inner){const ok=weOk(id),m=weMode(id),ws=S.sets[id].filter(x=>!x.wu),w=(ws[ws.length-1]||{}).w||0;
  return`<div class="wecfg" data-id="${id}">${inner?'':`<div class="tt">Weight means</div><div class="muted small" style="margin-bottom:8px">${esc(EX[id].name)}</div>`}
    ${ok?`<div class="sgm wesgm" role="group" aria-label="Weight means">${['as','each','total'].map(k=>`<button data-we="${k}" aria-pressed="${m===k}" class="${m===k?'on':''}">${WEL[k]}</button>`).join('')}</div>
      <div class="muted small" style="margin-top:8px">${m==='as'?`The entered weight is counted once, as in previously recorded sets: ${fmt(w)} kg.`:m==='each'?`Enter the weight of one dumbbell: ${fmt(w)} kg each = ${fmt(w*2)} kg lifted. Volume includes both dumbbells.`:`Enter the combined weight of both dumbbells: ${fmt(w)} kg in total, counted once.`}</div>
      <div class="muted small" style="margin-top:4px">Changes the column label and volume calculation. Recorded values stay unchanged. Records and 1RM compare weights with the same meaning.</div>`:`<div class="muted small">${weWhy(id)}</div>`}</div>`}
function exCfgSheet(ids){openSheet(`<h3 style="margin-bottom:10px">Exercise settings</h3>${ids.split(',').map(weRow).join('')}<div style="height:14px"></div><button class="btn primary" style="width:100%" data-x>Done</button>`,(sh,close)=>
  sh.addEventListener('click',e=>{if(e.target.closest('[data-x]')){close();return}const b=e.target.closest('[data-we]');if(!b)return;const box=b.closest('.wecfg'),id=box.dataset.id;
    S.weightEntry[id]={mode:b.dataset.we,_ts:Date.now()};save();box.outerHTML=weRow(id);RENDER()}))}



const HOW={bench:["Lie on the bench with your eyes under the bar, feet planted and shoulder blades retracted.","Grip slightly wider than shoulder width and unrack the bar.","Lower with control to your chest, keeping elbows about 45° from your torso.","Press until your arms extend, keeping glutes and shoulder blades on the bench."],
  fly:["Set the pulleys at shoulder height, step forward and lean slightly.","Keep a slight, constant bend in your elbows throughout the movement.","Bring your hands together in a wide arc, squeezing your chest.","Return slowly until you feel a stretch."],
  push:["Hold the rope or bar with elbows close to your sides.","Extend your arms downward until straight.","Pause briefly at full contraction.","Return slowly to a 90° elbow bend without moving your shoulders."],
  ohp:["Start with the bar at your collarbones and grip slightly wider than your shoulders.","Brace your glutes and core without arching your back.","Press vertically, moving your head back and then forward under the bar.","Lower with control to your collarbones."],
  legp:["Sit with your back and glutes supported, feet shoulder-width apart on the platform.","Release the safety and lower to about a 90° knee bend.","Press without lifting your hips off the pad or locking your knees."],
  squat:["Rest the bar on your upper back, with feet shoulder-width apart and toes slightly out.","Inhale, brace your core and lower with knees tracking over your feet.","Lower to at least parallel while keeping your spine neutral.","Drive through your heels and exhale at the top."],
  bulg:["Place your back foot on a bench and your front foot about a stride and a half ahead.","Lower vertically until your back knee approaches the floor.","Push through your front foot to rise. Complete the reps, then switch sides."],
  pullup:["Grip the bar slightly wider than your shoulders with arms extended.","Draw your shoulder blades down and pull until your chin is above the bar.","Lower slowly until your elbows are fully extended."],
  curl:["Stand with dumbbells by your sides and palms facing forward.","Bend your elbows close to your torso without swinging.","Squeeze your biceps at the top, then lower slowly."],
  plank:["Rest on your forearms with elbows under your shoulders.","Align your head, hips and heels; brace your glutes and core.","Hold the position and breathe steadily for the target duration."],
  run:["Warm up with 3–5 minutes of walking.","Set the target speed and maintain a steady pace.","Finish with a few minutes at low speed."],
  lat:["Stand with dumbbells by your sides and elbows slightly bent.","Raise your arms to shoulder height, leading with your elbows.","Lower slowly without swinging your torso."]};
const DESC={bench:"A horizontal press for the chest, front deltoids and triceps.",legp:"A machine leg press that trains the quadriceps with less load on the back.",lat:"Lateral deltoid isolation with a light load and controlled movement.",plank:"An isometric hold for the core."};

const FORM={epley:(w,r)=>w*(1+r/30),brzycki:(w,r)=>w*36/(37-r),lombardi:(w,r)=>w*Math.pow(r,.1),oconner:(w,r)=>w*(1+r/40),mayhew:(w,r)=>w*100/(52.2+41.9*Math.exp(-.055*r)),wathan:(w,r)=>w*100/(48.8+53.8*Math.exp(-.075*r)),lander:(w,r)=>w*100/(101.3-2.67123*r)};
const FNAME={weighted:"Blend of all",epley:'Epley',brzycki:'Brzycki',lombardi:'Lombardi',oconner:'O’Conner',mayhew:'Mayhew',wathan:'Wathan',lander:'Lander'};
const formula=()=>FNAME[sg('og-1rm','weighted')]?sg('og-1rm','weighted'):'weighted';
// The blend weighs the seven formulas and the RIR scale by how far each is trusted at this many reps (as the app does).
const RIR_PCT=[100,95.5,92.2,89.2,86.3,83.7,81.1,78.6,76.2,73.9,71.7,69.5,67.5,65.5,63.6];
const WT={epley:[.95,6,.12,.4],brzycki:[1.1,8,.18,.3],lombardi:[.85,5,.1,.4],oconner:[.9,6,.12,.4],mayhew:[.95,8,.1,.5],wathan:[.9,7,.12,.4],lander:[.85,7,.15,.35],rir:[1,10,.15,.4]};
const wtOf=(k,r)=>{const[a,t,st,fl]=WT[k];return a*(r<=t?1:Math.max(fl,1-(r-t)*st))};
const rirEst=(w,r)=>w*100/RIR_PCT[Math.min(Math.max(Math.round(r)-1,0),RIR_PCT.length-1)];
const rmCap=()=>formula()==='weighted'?15:12;
// {low, mid, high}: the estimate and how far the models disagree about the same set. A single to failure has no spread.
const rmRange=(w,r,rir=0)=>{if(!(w>0)||r<1)return null;const f=formula(),wt=f==='weighted',eff=wt?r+rir:Math.round(r);if(eff>rmCap())return null;
  const rd=v=>Math.round(v*10)/10;if(eff<=1)return{low:rd(w),mid:rd(w),high:rd(w)};
  const ks=Object.keys(FORM),vals=[...ks.map(k=>FORM[k](w,eff)),rirEst(w,eff)],den=ks.reduce((a,k)=>a+wtOf(k,eff),0)+wtOf('rir',eff),
    mid=rd(wt?(ks.reduce((a,k)=>a+FORM[k](w,eff)*wtOf(k,eff),0)+rirEst(w,eff)*wtOf('rir',eff))/den:FORM[f](w,eff));
  return{low:Math.min(rd(Math.min(...vals)),mid),mid,high:Math.max(rd(Math.max(...vals)),mid)}};
const rmEst=(w,r)=>rmRange(w,r)?.mid??null;
const spread=o=>o&&o.high>o.low?` (${fmt(o.low)}–${fmt(o.high)})`:'';
const rmShow=o=>o?fmt(o.mid)+spread(o):'–';
// The 1RM a % plan reads: typed by the lifter, else (demo control) estimated from the log.
const rmRec=id=>{const m=S.oneRm&&S.oneRm[id];if(m>0)return{low:m,mid:m,high:m,manual:true};const b=EX[id].best;return EX[id].plan.pct&&sg('og-sqrm','none')==='est'&&b?rmRange(b[0],b[1]):null};
// What a % of the 1RM comes to, with the spread of the 1RM carried through.
const rmCalc=(pct,r)=>{const k=v=>Math.round(v*pct/10)/10;return`${pct}% of ${rmShow(r)} → ${rmShow({low:k(r.low),mid:k(r.mid),high:k(r.high)})} kg`};
const lkind=id=>S.loadKind?.[id]?.kind||(EX[id].bar?'pairs':/machine/i.test(EX[id].equip)?'single':'none');
function infoSheet(id){const ex=EX[id],m=modeOf(id),reps=m==='reps',rm=reps&&!ex.bw,fav=()=>!!(S.fav&&S.fav[id]);
  const seen=new Set(),tags=[];const add=(l,c,ico)=>{const k=l.toLowerCase();if(seen.has(k))return;seen.add(k);tags.push(`<span class="tag${c||''}">${ico?ic(ico,14,2):''}${esc(l)}</span>`)};
  add(ex.tags[0],' acc');ex.tags.slice(1).forEach(l=>add(l));add(ex.equip,'','dumb');
  const best=ex.best,last=ex.ref&&ex.ref[0];
  const bw=ex.best&&ex.best[0]!=null&&m==='reps'&&!ex.bw?ex.best[0]:0,br=ex.best&&ex.best[1]||0,bshow=bw?wShow(id,bw):0;
  let rw=bw?bshow:20,rr=br||5,ri=0;
  const plateBlk=()=>{const k=lkind(id);return`<h4 class="sec">Plate loading</h4>
    <div class="sgm wesgm" role="group" aria-label="Plate loading">${[['pairs',"Per side"],['single',"Single stack"],['none',"Off"]].map(([v,l])=>`<button data-lk="${v}" aria-pressed="${k===v}" class="${k===v?'on':''}">${l}</button>`).join('')}</div>
    <div class="muted small" style="margin:8px 0 10px">${k==='pairs'?"Plates split over both sides of a bar.":k==='single'?"One stack: a belt, a landmine, a plate-loaded machine, a sled.":"No plate line under the sets."}</div>
    ${k!=='none'&&ex.bar?`<div class="kv"><span>Bar (kg)</span><span class="tnum">${fmt(ex.bar)}</span></div><div class="muted small" style="margin:6px 0 0">Default for this bar type. Record the total weight; this setting affects only the plate breakdown.</div>`:`<div class="muted small">Always record the total weight. This setting only affects the plate breakdown below each set.</div>`}`};
  const rmBlk=()=>{const est=rmRange(rw,rr,ri),eb=bw?rmRange(bshow,br):null;return`<h4 class="sec">Estimated 1RM</h4>
    ${eb?`<div class="small" style="margin-bottom:8px">From your log: <b class="accent">${rmShow(eb)} kg</b><span class="muted"> · ${fmt(bshow)} kg × ${br}</span></div>`:''}
    <div class="rm2"><div class="rmc"><span class="muted small">Weight (kg)</span><div class="stp"><button data-rm="w:-2.5" aria-label="Decrease weight">${ic('minus',18,2.2)}</button><span class="num rmv">${fmt(rw)}</span><button data-rm="w:2.5" aria-label="Increase weight">${ic('plus',18,2.2)}</button></div></div>
      <div class="rmc"><span class="muted small">Reps</span><div class="stp"><button data-rm="r:-1" aria-label="Decrease reps">${ic('minus',18,2.2)}</button><span class="num rmv">${rr}</span><button data-rm="r:1" aria-label="Increase reps">${ic('plus',18,2.2)}</button></div></div>
      ${formula()==='weighted'?`<div class="rmc"><span class="muted small">RIR</span><div class="stp"><button data-rm="i:-1" aria-label="Decrease RIR">${ic('minus',18,2.2)}</button><span class="num rmv">${ri}</span><button data-rm="i:1" aria-label="Increase RIR">${ic('plus',18,2.2)}</button></div></div>`:''}</div>
    <div class="row between" style="display:flex;justify-content:space-between;align-items:center;margin:10px 0 4px"><span class="muted small">Estimate</span><b class="accent" style="font-size:20px">${est===null?'–':rmShow(est)+' kg'}</b></div>
    <div class="row between" style="display:flex;justify-content:space-between;align-items:center;gap:10px;margin:6px 0"><span class="muted small">Formula</span><select class="input fsel" data-formula aria-label="1RM formula">${Object.keys(FNAME).map(k=>`<option value="${k}"${k===formula()?' selected':''}>${FNAME[k]}</option>`).join('')}</select></div>\n    <div class="small muted">${est===null?`Enter a weight and 1–${rmCap()} reps. Estimates become less reliable beyond this range.`:`${formula()==='weighted'?"A blend of seven formulas and your RIR":"Formula by "+FNAME[formula()]}: estimated from a set rather than a tested max. The range is how far the formulas disagree. Applies to the whole profile.`}</div>`};
  const body=()=>`<div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px"><h3 class="exdetail-name" style="margin-bottom:10px">${esc(ex.name)}</h3>
      <button class="ibtn fav-btn${fav()?' on':''}" data-fav aria-pressed="${fav()}" aria-label="${fav()?"Remove from favourites":"Add to favourites"}" style="margin:-6px -8px 0 0">${ic('star',22,1.8)}</button></div>
    <div class="exmedia" style="height:190px;cursor:default" role="img" aria-label="${esc(ex.name)}"><div class="mfig">${ic('dumb',64,1.3)}</div></div>
    <div class="tags" style="margin:12px 0">${tags.join('')}</div>
    ${DESC[id]?`<div class="exnote">${DESC[id]}</div>`:''}
    ${best?`<div class="small" style="display:flex;align-items:center;gap:5px;margin:8px 0 6px;flex-wrap:wrap">${ic('trophy',14,2)}Best: <b class="accent">${refRow(ex,best)}</b>${last?`<span class="muted"> · last time ${refRow(ex,last)}</span>`:''}</div>`:''}
    <button class="btn primary" style="width:100%;margin:10px 0 4px" data-say="Add to my plan opens in the app">${ic('plus',16,2.2)}Add to my plan</button>
    <button class="btn" style="width:100%;margin-top:4px" data-say="History opens in the app">${ic('hist',16)}History</button>
    ${reps?plateBlk():''}${weOk(id)?`<h4 class="sec">Weight means</h4>${weRow(id,true)}`:''}${rm?rmBlk():''}
    ${HOW[id]?`<h4 class="sec">How to</h4><ol class="steps-list">${HOW[id].map(x=>`<li>${x}</li>`).join('')}</ol>`:''}`;
  openSheet(`<div id="exi">${body()}</div>`,(sh,close)=>{const redo=()=>{const y=sh.scrollTop;$('#exi',sh).innerHTML=body();sh.scrollTop=y};
    sh.addEventListener('click',e=>{const sy=e.target.closest('[data-say]');if(sy){toast(sy.dataset.say);return}
      if(e.target.closest('[data-fav]')){(S.fav=S.fav||{})[id]=!fav();save();toast(fav()?"Added to favourites":"Removed from favourites");redo();return}
      const lk=e.target.closest('[data-lk]');if(lk){(S.loadKind=S.loadKind||{})[id]={kind:lk.dataset.lk,_ts:Date.now()};save();redo();RENDER();return}
      const r=e.target.closest('[data-rm]');if(r){const[f,d]=r.dataset.rm.split(':');if(f==='w')rw=Math.max(0,rw+ +d);else if(f==='i')ri=Math.max(0,Math.min(5,ri+ +d));else rr=Math.max(1,Math.min(30,rr+ +d));redo();return}
      const b=e.target.closest('[data-we]');if(b){S.weightEntry[id]={mode:b.dataset.we,_ts:Date.now()};save();redo();RENDER()}});
    sh.addEventListener('change',e=>{if(e.target.matches('[data-formula]')){ss('og-1rm',e.target.value);redo()}}) })}

// "One-rep max needed": a % plan with no recorded 1RM. The log's estimate is offered as its low, central and high end; a tap fills the field.
function rmPrompt(id){const ex=EX[id],b=ex.best,r=b&&rmRange(b[0],b[1]);
  openSheet(`<h3>One-rep max needed</h3><div class="muted small" style="margin-bottom:12px">${esc(ex.name)} is planned as a % of your 1RM. Enter it for exact weights, or skip and fill the weights in yourself.</div>
    <label class="muted small" for="rmv">${esc(ex.name)} (kg)</label><input class="input" id="rmv" inputmode="decimal" autocomplete="off" style="margin-top:6px">
    ${r?`<div class="rmchips"><span class="muted small">From your log:</span>${(r.high>r.low?[['Low',r.low],['Central',r.mid],['High',r.high]]:[['Use',r.mid]]).map(([l,v])=>`<button class="btn rmchip" data-rv="${v}" aria-pressed="false">${l} ${fmt(v)}</button>`).join('')}</div>`:''}
    <div style="height:18px"></div><button class="btn primary" style="width:100%" data-f="save">Save</button><button class="btn ghost" style="width:100%;margin-top:6px" data-f="skip">Skip</button>`,
  (sh,close)=>{const inp=$('#rmv',sh),mark=()=>sh.querySelectorAll('.rmchip').forEach(c=>c.setAttribute('aria-pressed',String(+inp.value===+c.dataset.rv)));
    sh.addEventListener('click',e=>{const c=e.target.closest('[data-rv]');if(c){inp.value=c.dataset.rv;mark();inp.focus()}});inp.addEventListener('input',mark);
    $('[data-f=skip]',sh).onclick=close;
    $('[data-f=save]',sh).onclick=()=>{const v=parseFloat(inp.value.replace(',','.'));if(v>0){(S.oneRm=S.oneRm||{})[id]=v;save();toast("1RM saved")}close();RENDER()}})}


function noteSheet(){openSheet(`<h3>Session note</h3><textarea class="input" id="sn" rows="4" maxlength="500" placeholder="How the session went as a whole.">${esc(S.note||'')}</textarea><div style="height:18px"></div><button class="btn primary" style="width:100%" data-f="save">Save</button>`,
  (sh,close)=>{$('[data-f=save]',sh).onclick=()=>{const t=$('#sn',sh).value.trim().slice(0,500);if(t)S.note=t;else delete S.note;save();close();RENDER()};setTimeout(()=>$('#sn',sh).focus(),50)})}
const noteBtn=(cls,short)=>`<button class="btn ${S.note?'tinted':''} ${cls||''}" data-act="note">${ic('pencil',16)}${short?"Note":(S.note?"Edit session note":"Add session note")}</button>`;
const noteCard=()=>S.note?`<button class="snote" data-act="note" aria-label="Edit session note">${ic('note',16)}<span>${esc(S.note)}</span></button>`:'';


const LIB=[['squat','Barbell squat',"Barbell",["Legs"],60,5,2.5,20],['rdl',"Barbell Romanian deadlift","Barbell",["Hamstrings"],60,8,2.5,20],['row',"Dumbbell bent over row","Dumbbells",["Back"],24,10,2],
  ['curl',"Dumbbell biceps curl","Dumbbells",["Biceps"],12,10,1],['legp','Leg press',"Machine",["Legs"],120,10,5],['latm','Lat machine',"Cables",["Back"],50,10,2.5],['face','Face pull',"Cables",["Shoulders"],20,15,2.5],['dip',"Parallel bar dip","Bodyweight",["Chest","Triceps"],10,8,2.5]];
function addEx(l){const [id,name,equip,tags,w,r,step,bar]=l,ex={name,equip,tags,plan:PLAN('linear',3,r,2,w,90),bar,step,ref:[[w,r],[w,r],[w,r]],best:[w,r]};
  ex.id=id;EX[id]=ex;UNITS.push({ex:[id]});S.sets[id]=mk(w,r,3);(S.added=S.added||[]).push({id,ex});save()}
function addExSheet(){openSheet(`<h3>Add exercise</h3><div class="searchbox">${ic('search',18)}<input class="input" id="xs" placeholder="Search among ${LIB.length} exercises…"></div><div class="list menu-list" id="xl"></div>`,(sh,close)=>{
  const list=$('#xl',sh),draw=()=>{const q=$('#xs',sh).value.toLowerCase();
    list.innerHTML=LIB.filter(l=>(l[1]+l[2]+l[3]).toLowerCase().includes(q)).map(l=>{const has=!!EX[l[0]];
      return`<div class="item menu-item${has?' disabled':''}" tabindex="0" role="button" data-x="${l[0]}"><span class="lrow-i">${ic('dumb',16)}</span><div class="grow"><div class="tt">${l[1]}</div><div class="muted small">${l[2]} · ${l[3].join(', ')}</div></div><span class="plus-b">${ic(has?'check':'plus',18,2.2)}</span></div>`}).join('')||"<div class=\"muted\" style=\"padding:14px\">No exercises match your search</div>"};
  $('#xs',sh).addEventListener('input',draw);draw();
  sh.addEventListener('click',e=>{const x=e.target.closest('[data-x]');if(!x)return;const l=LIB.find(l=>l[0]===x.dataset.x);addEx(l);close();RENDER();toast(`“${l[1]}” added to Push A`)})})}


const exBar=u=>{const nav=u!=null,last=nav&&u===UNITS.length-1;
  return`<div class="xbar">${nav?`<button class="btn sq" data-go="${u-1}" ${u?'':'disabled'} aria-label="Previous exercise">${ic('chevL',18)}</button><button class="btn nx${unitDone(u)?' primary':''}" data-go="${u+1}" ${last?'disabled':''}>${last?"Last exercise":"Next"}${last?'':ic('chevR',18)}</button>`:'<span class="grow"></span>'}${noteBtn('xs',true)}<button class="btn sq" data-act="addex" aria-label="Add exercise" title="Add exercise">${ic('plus',18)}</button></div>`};
const exNav=exBar;
const exFooter=()=>{const all=UNITS.every((_,k)=>unitDone(k)),dn=UNITS.filter((_,k)=>unitDone(k)).length;
  return`<div class="fin"><button class="btn${all?' primary':' ghost'}" data-act="finish">Finish workout · ${dn}/${UNITS.length} exercises</button></div>`};


const MS=()=>{const v=sg('og-media','full');return v==='mini'||v==='off'?v:'full'};
let MPLAY=true;
function mediaHTML(id,compact){if(MS()==='off')return'';const mini=MS()==='mini',ex=EX[id];
  return`<div class="exmedia${compact?' compact':''}${mini?' mini':''}${MPLAY?'':' paused'}" data-act="mplay" role="img" aria-label="${esc(ex.name)}"><div class="mfig">${ic('dumb',mini?34:compact?44:72,1.3)}</div>
    <button class="giftoggle" data-act="mtoggle" aria-label="${mini?"Expand":"Minimize"}" title="${mini?"Expand":"Minimize"}">${ic(mini?'chevD':'chevU',16,2.2)}</button>
    ${mini?'':`<span class="gifhint">${ic(MPLAY?'pause':'play',13)}${MPLAY?"tap to pause":"tap to play"}</span>`}</div>`}


const ssMedia=u=>MS()==='off'?'':`<div class="ssmedia">${UNITS[u].ex.map(e=>mediaHTML(e,true)).join('')}</div>`;


const menuItem=(m,ico,t,cls)=>`<div class="item menu-item${cls||''}" tabindex="0" role="button" data-m="${m}"><span class="lrow-i">${ic(ico,16)}</span><div class="grow"><div class="tt">${t}</div></div></div>`;
function finishSheet(){const c=counts(),left=c.t-c.d;
  openSheet(`<h3 style="margin-bottom:2px">${!c.d?"Nothing logged yet":left?"Finish early?":"Finish workout?"}</h3><div class="muted small" style="margin-bottom:10px">${!c.d?"You haven’t checked off any sets. Finish the workout anyway?":left?`${left} ${left===1?"set still unchecked":"sets still unchecked"}. Finish the workout now?`:"All sets are complete."}</div>
    <div class="list menu-list">${menuItem('save','check',"Finish and save")}${menuItem('rm','trash',"Discard workout",' danger')}</div>`,(sh,close)=>sh.addEventListener('click',e=>{const m=e.target.closest('[data-m]')?.dataset.m;if(!m)return;close();m==='save'?finishSummary():confirmDiscard()}))}

const setsLine=(a,bw)=>{const ws=new Set(a.map(x=>x.w)),rp=x=>x.r+(x.f?' '+FI(11):'');return bw||!ws.size||[...ws][0]==null?a.map(rp).join(', '):ws.size===1?`${fmt(a[0].w)} kg × ${a.map(rp).join(', ')}`:a.map(x=>`${fmt(x.w)}×${rp(x)}`).join(' · ')};
function lastNext(){const out=[];for(const id in S.sets){const ex=EX[id],m=modeOf(id);if(m!=='reps'||!EX[id].ref)continue;const done=S.sets[id].filter(x=>x.d&&!x.wu&&!x.sides);if(!done.length)continue;
    const bw=!!ex.bw,today=done.map(x=>({w:bw?null:x.w,r:x.r,f:x.f})),last=ex.ref.map(a=>bw?{w:null,r:a[0]}:{w:a[0],r:a[1]}),vol=a=>a.reduce((n,x)=>n+(x.w||1)*x.r,0),tr=Math.sign(vol(today)-vol(last)),
      all=done.length>=S.sets[id].filter(x=>!x.wu).length&&done.every(x=>x.r>=(ex.plan.r[1])),top=today[today.length-1];
    out.push({id,today,last,bw,trend:tr,next:all?bw?{r:top.r+1,k:"up"}:{w:Math.round((top.w+ex.step)*100)/100,r:ex.plan.r[0],k:"up"}:{w:top.w,r:top.r,k:'ancora'}})}return out}
function finishSummary(){const c=counts(),ids=Object.keys(S.sets),vol=ids.reduce((a,id)=>a+volume(id),0),prs=ids.filter(id=>modeOf(id)==='reps'&&EX[id].best&&S.sets[id].some(x=>x.d&&!x.wu&&x.w>EX[id].best[0])),
    cardio=ids.filter(id=>modeOf(id)==='cardio'&&S.sets[id].some(x=>x.d)),added=(S.added||[]).filter(a=>S.sets[a.id]&&S.sets[a.id].some(x=>x.d)),
    e1=ids.filter(id=>modeOf(id)==='reps'&&!EX[id].bw&&EX[id].best&&!prs.includes(id)).map(id=>({id,o:S.sets[id].filter(x=>x.d&&!x.wu).map(x=>rmRange(x.w,x.r)).reduce((a,o)=>o&&(!a||o.mid>a.mid)?o:a,null),was:rmRange(EX[id].best[0],EX[id].best[1])})).filter(x=>x.o&&(!x.was||x.o.mid>x.was.mid)),W={up:"step up",ancora:"unchanged"},TR={1:['up','var(--acc)'],0:['minus','var(--label-2)'],'-1':['down','var(--orange)']};
  openSheet(`<div style="text-align:center"><div style="color:var(--acc);display:flex;justify-content:center">${ic('trophy',44,1.6)}</div><h3 style="margin:8px 0 12px">Workout complete!</h3></div>
    <div class="tiles"><div class="tile"><div class="l">Duration</div><div class="v">${clock().replace(/^0:/,'')}</div></div><div class="tile"><div class="l">Volume</div><div class="v">${Math.round(vol).toLocaleString('en-GB')} kg</div></div><div class="tile"><div class="l">Sets</div><div class="v">${c.d}/${c.t}</div></div><div class="tile"><div class="l">PRs</div><div class="v">${prs.length||'–'}</div></div></div>
    ${prs.map(id=>`<div class="small accent" style="display:flex;gap:5px;align-items:center;margin-top:6px">${ic('trophy',13,2)}New PR: ${esc(EX[id].name)}</div>`).join('')}
    ${e1.map(x=>`<div class="small accent" style="display:flex;gap:5px;align-items:center;margin-top:6px">${ic('gauge',13,2)}Best estimated 1RM: ${esc(EX[x.id].name)} · ${rmShow(x.o)} kg</div>`).join('')}
    <h4 class="sec">Last time and next time</h4><div class="list">${lastNext().map(r=>`<div class="item" style="display:block"><div style="display:flex;justify-content:space-between;align-items:center;gap:8px"><b>${esc(EX[r.id].name)}</b><span style="color:${TR[r.trend][1]};display:inline-flex" aria-label="${r.trend>0?"Better than last time":r.trend<0?"Below last time":"Same as last time"}">${ic(TR[r.trend][0],18,2.2)}</span></div>
      <div class="small">Today: ${setsLine(r.today,r.bw)}</div><div class="small muted">Last time: ${setsLine(r.last,r.bw)}</div><div class="small accent">Next time: ${r.bw?r.next.r+' reps':fmt(r.next.w)+' kg × '+r.next.r} · ${W[r.next.k]}</div></div>`).join('')||"<div class=\"muted small\" style=\"padding:10px\">Complete a few sets to see the comparison.</div>"}</div>
    ${cardio.length?`<h4 class="sec">Cardio</h4><div class="list">${cardio.map(id=>`<div class="item" style="display:block"><b>${esc(EX[id].name)}</b><div class="small">${S.sets[id].filter(x=>x.d).map(x=>valBase(id,x)).join('  ·  ')}</div></div>`).join('')}</div>`:''}
    ${added.length?`<h4 class="sec">New in this workout</h4><div class="list">${added.map(a=>`<div class="item" style="display:block"><b>${esc(a.ex.name)}</b><div class="small">${S.sets[a.id].filter(x=>x.d&&!x.wu).length} sets done</div><button class="btn" style="margin-top:8px" data-add="${a.id}">Add to Push A</button></div>`).join('')}</div>`:''}
    <div style="height:14px"></div><button class="btn primary" style="width:100%" data-x>Done</button>`,(sh,close)=>sh.addEventListener('click',e=>{const b=e.target.closest('[data-add]');if(b){b.disabled=true;b.textContent='Added to Push A';return}if(e.target.closest('[data-x]'))close()}))}
function restSheet(id,i){const s=S.sets[id][i];openSheet(`<h3 style="margin-bottom:2px">Rest after this set</h3><div class="muted small" style="margin-bottom:10px">${esc(EX[id].name)} · Set ${wn(id,i)}. Applies to today's workout only.</div><div class="list menu-list">${[[null,"Exercise default"],[0,"No timer"],[30,"0:30"],[60,"1:00"],[90,"1:30"],[120,"2:00"],[180,"3:00"],[300,"5:00"]].map(([v,l])=>`<div class="item menu-item" tabindex="0" role="button" data-v="${v}"><div class="grow"><div class="tt">${l}</div></div><span class="menu-on${(s.rest??null)===v?' is-on':''}">${ic('check',16,2.4)}</span></div>`).join('')}</div>`,(sh,close)=>sh.addEventListener('click',e=>{const v=e.target.closest('[data-v]')?.dataset.v;if(v==null)return;if(v==='null')delete s.rest;else s.rest=+v;close();save();RENDER()}))}
function confirmDiscard(){openSheet(`<h3 style="margin-bottom:2px">Discard workout?</h3><div class="muted small" style="margin-bottom:10px">The sets you logged in this session will be lost.</div>
  <div class="list menu-list">${menuItem('go','trash',"Discard",' danger')}${menuItem('no','x',"Cancel")}</div>`,(sh,close)=>sh.addEventListener('click',e=>{const m=e.target.closest('[data-m]')?.dataset.m;if(!m)return;close();if(m==='go')toast("Workout discarded")}))}
const RS=()=>+sg('og-rest-sec',DEF_REST);
function wsetSheet(){const sw=(k,d)=>sg(k,d)==='1',seg=(k,v,o)=>`<div class="sgm" data-k="${k}">${o.map(([x,l])=>`<button data-v="${x}" class="${x===v?'on':''}">${l}</button>`).join('')}</div>`,
  row=(t,sub,c)=>`<div class="wrow"><div class="grow"><div class="tt">${t}</div>${sub?`<div class="muted small">${sub}</div>`:''}</div>${c}</div>`,tg=(k,d,l)=>`<button class="sw${sw(k,d)?' on':''}" role="switch" aria-checked="${sw(k,d)}" aria-label="${l}" data-sw="${k}"></button>`;
  openSheet(`<div class="wsh"><h3>Workout settings</h3><button class="btn sm primary" data-x>Done</button></div><div class="muted small" style="margin-bottom:8px">Changes also apply to your next workouts.</div><div class="list wlist">
    ${row("Rest timer",fmtRest(RS()),`<button class="btn sm" data-w="1" aria-label="Change rest timer">${ic('chevR',14,2)}</button>`)}
    ${row("Rest end sound",SND[sndKind()][0],`<button class="btn sm" data-snd aria-label="Choose sound">${ic('chevR',14,2)}</button>${tg('og-snd','1',"Rest end sound")}`)}${row("Vibrate",'',tg('og-vib','1',"Vibrate"))}${row("Flash screen",'',tg('og-fl','0',"Flash screen"))}${row("Keep screen awake","Stops the screen from turning off during a workout",tg('og-awake','1',"Keep screen awake"))}
    ${row('View','',seg('mode',document.body.dataset.mode,MODES))}${row("Effort per set",'',seg('og-effort',EF(),[['off',"Off"],['rir','RIR'],['rpe','RPE']]))}
    ${row("Collapse completed exercises","In List and Compact, a completed exercise collapses to one row",tg('og-collapse','1',"Collapse completed exercises"))}
    ${row("Swipe gestures","Sets, routines and rounds: swipe left to remove, right to copy",tg('og-swipe','1',"Swipe gestures"))}${row("Exercise animations",'',seg('og-media',MS(),[['full',"Full"],['mini',"Small"],['off',"Hidden"]]))}</div>`,(sh,close)=>{
    sh.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;
      if(b.dataset.x!=null){close();return}
      if(b.dataset.sw){const k=b.dataset.sw,on=!b.classList.contains('on');ss(k,on?'1':'0');b.classList.toggle('on',on);b.setAttribute('aria-checked',on);return}
      if(b.dataset.snd!=null){close();soundSheet();return}
      if(b.dataset.w){close();wheelSheet("Rest timer",RS(),"Set the wheel to 0:00 to stop the timer.",v=>{ss('og-rest-sec',v);wsetSheet()});return}
      const g=b.closest('.sgm');if(!g)return;const k=g.dataset.k,v=b.dataset.v;
      if(k==='mode'){location.href=v+'.html';return}
      ss(k,v);$$('button',g).forEach(x=>x.classList.toggle('on',x===b));RENDER()})})}

const SND={chime:["Chime",[[880,0,.3],[1318,.14,.5]]],classic:["Classic",[[800,0,.14],[800,.24,.14],[800,.48,.14]]],bell:["Bell",[[660,0,.9],[1320,0,.5]]],beep2:["Beep-beep",[[1000,0,.09],[1000,.17,.09]]],whistle:["Whistle",[[1700,0,.4,1]]],soft:["Soft",[[523,0,.7],[659,.2,.7]]]};
const sndKind=()=>SND[sg('og-snd-kind','chime')]?sg('og-snd-kind','chime'):'chime';
let AC;function playSnd(k=sndKind()){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();AC.resume&&AC.resume();const t0=AC.currentTime;
  for(const[f,at,d,sl]of SND[k][1]){const o=AC.createOscillator(),g=AC.createGain();o.type='sine';o.frequency.setValueAtTime(f,t0+at);if(sl)o.frequency.linearRampToValueAtTime(f*1.25,t0+at+d);
    g.gain.setValueAtTime(.0001,t0+at);g.gain.exponentialRampToValueAtTime(.25,t0+at+.02);g.gain.exponentialRampToValueAtTime(.0001,t0+at+d);o.connect(g);g.connect(AC.destination);o.start(t0+at);o.stop(t0+at+d+.05)}}catch{}}
function soundSheet(){openSheet(`<div class="wsh"><h3>Rest end sound</h3><button class="btn sm primary" data-x>Done</button></div><div class="muted small" style="margin-bottom:8px">Tap to preview. The Android app also plays this with the screen off.</div>
  <div class="list menu-list">${Object.keys(SND).map(k=>`<div class="item menu-item" tabindex="0" role="button" data-k="${k}"><span class="lrow-i">${ic('timer',16)}</span><div class="grow"><div class="tt">${SND[k][0]}</div></div><span class="menu-on${k===sndKind()?' is-on':''}">${ic('check',16,2.4)}</span></div>`).join('')}</div>`,(sh,close)=>
  sh.addEventListener('click',e=>{if(e.target.closest('[data-x]')){close();wsetSheet();return}const r=e.target.closest('[data-k]');if(!r)return;ss('og-snd-kind',r.dataset.k);$$('.menu-on',sh).forEach(x=>x.classList.toggle('is-on',x.closest('[data-k]')===r));playSnd(r.dataset.k)}))}

function wheelSheet(title,val,foot,onDone){const col=(n,v,l)=>`<div class="wcol" data-n="${n}" aria-label="${l}" tabindex="0"><i></i>${Array.from({length:n},(_,k)=>`<div>${String(k).padStart(n===60?2:1,'0')}</div>`).join('')}<i></i></div>`;
  openSheet(`<div class="wsh"><h3>${title}</h3><button class="btn sm primary" data-x>Done</button></div><div class="wheel"><div class="wband"></div>${col(16,0,"Minutes")}<b>:</b>${col(60,0,"Seconds")}</div><div class="muted small" style="text-align:center">${foot}</div>`,
    (sh,close)=>{const cs=$$('.wcol',sh),at=[Math.floor(val/60),val%60];cs.forEach((c,k)=>c.scrollTop=at[k]*44);
      $('[data-x]',sh).onclick=()=>{const v=Math.min(900,cs.reduce((t,c,k)=>t+Math.round(c.scrollTop/44)*(k?1:60),0));close();onDone(v)}})}
function restTimeSheet(){if(Rest.on)wheelSheet("Time left",Rest.left,"Set the wheel to 0:00 to finish rest now.",v=>{if(!v){Rest.stop();return}Rest.left=v;Rest.total=Math.max(Rest.total,v);Rest.ready=0;Rest.paint()})}
