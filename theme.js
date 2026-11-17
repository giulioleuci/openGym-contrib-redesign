/* Theme and accent, ported from the app (lib/accent.js, App.jsx applyPrefs, Settings accent picker).
   Choices live in sessionStorage so every mock page shares them. No dependencies. */
(()=>{
const ACCENTS={brand:'#a3e635',lime:'#30d158',sky:'#0a84ff',orange:'#ff9f0a',violet:'#bf5af2',pink:'#ff375f',red:'#ff453a',teal:'#40c8e0',gold:'#ffd60a'},
  NAMES={brand:'openGym green',lime:'Classic green',sky:'Blue',orange:'Orange',violet:'Purple',pink:'Pink',red:'Red',teal:'Teal',gold:'Yellow'};
const g=(k,d)=>{try{return sessionStorage.getItem(k)??d}catch{return d}},s=(k,v)=>{try{sessionStorage.setItem(k,v)}catch{}};
const HEX=/^#[0-9a-f]{6}$/i,cleanHex=v=>typeof v==='string'&&HEX.test(v.trim())?v.trim().toLowerCase():null;
const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255]},toHex=c=>'#'+c.map(v=>Math.round(Math.min(255,Math.max(0,v))).toString(16).padStart(2,'0')).join('');
const lin=v=>{v/=255;return v<=.03928?v/12.92:((v+.055)/1.055)**2.4},lum=h=>{const[r,gg,b]=rgb(h);return .2126*lin(r)+.7152*lin(gg)+.0722*lin(b)};
const contrast=(a,b)=>{const x=lum(a),y=lum(b);return(Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
const mix=(h,to,t)=>{const a=rgb(h),b=rgb(to);return toHex(a.map((v,i)=>v+(b[i]-v)*t))};
const inkOn=h=>contrast(h,'#000000')>=contrast(h,'#ffffff')?'#000000':'#ffffff';
const THEMES={dark:{bgs:['#000000','#1c1c1e'],min:3,toward:'#ffffff',label2:['#8d8d93','#98989f']},light:{bgs:['#f2f2f7','#ffffff'],min:3,toward:'#000000',label2:['#85858b','#8a8a8e']}};
const worst=(h,bgs)=>Math.min(...bgs.map(b=>contrast(h,b)));
function toHsl(h){const[r,gg,b]=rgb(h).map(v=>v/255),max=Math.max(r,gg,b),min=Math.min(r,gg,b),l=(max+min)/2,d=max-min;if(!d)return[0,0,l];
  const sat=d/(1-Math.abs(2*l-1)),hh=max===r?((gg-b)/d)%6:max===gg?(b-r)/d+2:(r-gg)/d+4;return[hh*60,sat,l]}
function fromHsl([h,sat,l]){const c=(1-Math.abs(2*l-1))*sat,x=c*(1-Math.abs(((h/60)%2)-1)),m=l-c/2;
  const[r,gg,b]=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return toHex([r,gg,b].map(v=>(v+m)*255))}
const isGrey=h=>toHsl(h)[1]<.25;
function readableIn(hex,theme,min){const th=THEMES[theme]||THEMES.dark,grey=isGrey(hex),bar=min||th.min;
  const ok=c=>grey?worst(c,th.bgs)>=Math.max(4.5,bar)&&worst(c,th.label2)>=2:worst(c,th.bgs)>=bar;if(ok(hex))return hex;
  const[h,sat,l]=toHsl(hex),up=th.toward==='#ffffff',hue=h<0?h+360:h,yellow=!up&&hue>=48&&hue<=72;
  for(let i=1;i<=50;i++){const c=fromHsl([yellow?Math.max(42,hue-i*1.5):hue,sat,up?Math.min(1,l+i*.02):Math.max(0,l-i*.02)]);if(ok(c))return c}return th.toward}
const inkIn=(hex,theme)=>readableIn(readableIn(hex,theme),theme,4.5);
function inkOnBoth(acc,acc2){const ink=inkOn(acc);if(contrast(acc2,ink)>=3)return ink;const o=ink==='#000000'?'#ffffff':'#000000',sc=k=>Math.min(contrast(acc,k),contrast(acc2,k));return sc(o)>sc(ink)?o:ink}
const VARS=['--acc','--acc-2','--on-acc','--acc-ink','--knob-ring'];
function customVars(hex,theme){const c=cleanHex(hex);if(!c)return null;const acc=readableIn(c,theme),acc2=mix(acc,'#000000',.25);
  return{'--acc':acc,'--acc-2':acc2,'--on-acc':inkOnBoth(acc,acc2),'--acc-ink':inkIn(acc,theme),'--knob-ring':contrast('#ffffff',acc)<1.5?'rgba(0,0,0,.28)':'transparent'}}
const sysDark=()=>!(window.matchMedia&&matchMedia('(prefers-color-scheme: light)').matches);
const choice=()=>g('og-theme','dark'),accent=()=>g('og-accent','lime'),own=()=>cleanHex(g('og-accent-own',''));
function apply(){const de=document.documentElement,t=choice(),theme=t==='system'?(sysDark()?'dark':'light'):t==='light'?'light':'dark',a=accent();
  de.dataset.theme=theme;const v=a==='custom'&&own()?customVars(own(),theme):null;
  if(v){de.dataset.accent='custom';for(const[k,x]of Object.entries(v))de.style.setProperty(k,x)}
  else{de.dataset.accent=ACCENTS[a]?a:'lime';for(const k of VARS)de.style.removeProperty(k)}
  document.querySelectorAll('[data-th]').forEach(b=>b.classList.toggle('on',b.dataset.th===t));
  document.querySelectorAll('[data-ac]').forEach(b=>b.classList.toggle('on',b.dataset.ac===a&&(a!=='custom'||!!own())));
  document.querySelectorAll('.swatch-own').forEach(b=>{const o=own();b.classList.toggle('unset',!o);b.style.background=o||'';b.style.color=o?inkOn(o):''});
  document.querySelectorAll('.swatch-note').forEach(n=>{const o=own(),notes=[];if(a==='custom'&&o){for(const th of['dark','light'])if(readableIn(o,th)!==o)notes.push(isGrey(o)?`Greys show ${th==='dark'?'lighter':'darker'} in ${th} mode, so buttons don’t look switched off.`:`A touch ${th==='dark'?'lighter':'darker'} in ${th} mode, so you can still read it.`)}n.innerHTML=notes.join('<br>')})}
// The picker markup, used by the side panel and by Workout settings.
window.OGTheme={apply,ACCENTS,NAMES,contrast,inkIn,readableIn,customVars,
  pickerHTML:()=>`<div class="swatches" role="group" aria-label="Accent color">${Object.entries(ACCENTS).map(([k,c])=>`<button class="swatch" data-ac="${k}" style="background:${c}" aria-label="${NAMES[k]}" title="${NAMES[k]}"></button>`).join('')}<span class="swatch swatch-own unset" data-ac="custom">${'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>'}<input type="color" class="swatch-input" value="${own()||'#a3e635'}" aria-label="Pick your own color"></span></div><div class="swatch-note"></div>`,
  themeHTML:()=>`<div class="sgm" data-k="theme">${[['system','System'],['light','Light'],['dark','Dark']].map(([v,l])=>`<button data-th="${v}">${l}</button>`).join('')}</div>`};
document.addEventListener('click',e=>{const t=e.target.closest('[data-th]');if(t){s('og-theme',t.dataset.th);apply();return}
  const a=e.target.closest('button[data-ac]');if(a){s('og-accent',a.dataset.ac);apply()}});
document.addEventListener('input',e=>{if(e.target.classList?.contains('swatch-input')){const c=cleanHex(e.target.value);if(c){s('og-accent-own',c);s('og-accent','custom');apply()}}});
if(window.matchMedia)matchMedia('(prefers-color-scheme: light)').addEventListener?.('change',()=>choice()==='system'&&apply());
apply();window.addEventListener('DOMContentLoaded',apply);
})();
