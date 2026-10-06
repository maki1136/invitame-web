const { webkit } = require('playwright');
const fs=require('fs');
const UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6.1 Safari/605.1.15';
const modo=process.env.MODO||'bueno', slug=process.env.S||'camila-y-tomas';
const DIAG=fs.readFileSync('/home/claude/invitame-web/efectos/diag.js','utf8');
(async()=>{const b=await webkit.launch();const ctx=await b.newContext({viewport:{width:1024,height:1263},deviceScaleFactor:2,hasTouch:true,userAgent:UA,...(process.env.REC?{recordVideo:{dir:'rec-'+modo,size:{width:512,height:632}}}:{})});
await ctx.addInitScript(()=>{Object.defineProperty(navigator,'maxTouchPoints',{get:()=>5})});
const p=await ctx.newPage();
if(process.env.NOVID) await p.route(/\.mp4/,r=>r.abort());
await p.route('**/diag.php',r=>r.fulfill({status:204}));
await p.route('**/efectos/diag.js*',r=>r.fulfill({status:200,contentType:'text/javascript',body:DIAG}));
if(modo==='malo'){
  const T=fs.readFileSync('todo-viejo.js','utf8'),C=fs.readFileSync('catalogo-viejo.js','utf8');
  await p.route('**/efectos/todo.php*',r=>r.fulfill({status:200,contentType:'text/javascript',body:T}));
  await p.route('**/sobres/catalogo.js*',r=>r.fulfill({status:200,contentType:'text/javascript',body:C}));
}
const q=modo==='malo'?'&liviano-aparato=0':'';
const CSS={anim:'*,*::before,*::after{animation:none!important;transition:none!important}',
 fondo:'#inv-fondo,#inv-fondo-fuera{display:none!important}',
 opaco:'.frame .sec,.frame>section{background-color:#f4efe6!important}',
 iframes:'iframe{display:none!important}',
 filtros:'*,*::before,*::after{filter:none!important;-webkit-backdrop-filter:none!important;backdrop-filter:none!important;mix-blend-mode:normal!important}',
 sombras:'*,*::before,*::after{box-shadow:none!important;text-shadow:none!important}',
 fixed:'*{background-attachment:scroll!important}',
 fuentes:'*{font-family:Georgia,serif!important}',
 pbg:'#pbg{filter:none!important}',
 sombrasf:'*:not(#pbg),*::before,*::after{filter:none!important}',
 mascaras:'*,*::before,*::after{-webkit-mask:none!important;mask:none!important;clip-path:none!important}'};
const sacar=(process.env.SACAR||'').split(',').filter(Boolean);
if(sacar.length) await ctx.addInitScript((css)=>{const f=()=>{const s=document.createElement('style');s.textContent=css;(document.head||document.documentElement).appendChild(s)};if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',f);else f();setTimeout(f,3000);},sacar.map(k=>CSS[k]).join('\n'));
await p.goto('https://invitameok.net/i/?e='+slug+'&diag=1'+q+'&cb='+Date.now(),{waitUntil:'load',timeout:120000});
console.log('cargó',Date.now());await p.waitForTimeout(8000);
await p.evaluate(()=>{const x=document.getElementById('btn-ingresar');x&&x.click()});console.log('tocó');await p.waitForTimeout(6000);
await p.evaluate(async()=>{const se=document.scrollingElement;for(let y=0;y<4500;y+=225){se.scrollTop=y;await new Promise(r=>setTimeout(r,400))}});
await p.waitForTimeout(4000);
const o=await p.evaluate(()=>INVDIAG.estado());
const lags=o.lag.map(x=>+x.split('@')[0]);const lag=lags.reduce((a,x)=>a+x,0);
const fps=(o.cuadros/(o.t/1000)).toFixed(1);
console.log(`${(process.env.SACAR||'-').padEnd(16)} ${modo.padEnd(6)} ${slug.padEnd(22)} liviano:${o.ev?'' :''}${(await p.evaluate(()=>document.documentElement.classList.contains('aparato-liviano')))} cuadros/s ${fps.padStart(5)} · congelado ${String(lag).padStart(6)} ms · peor ${Math.max(0,...lags)} ms · scroll ${o.scroll}`);
if(process.env.V){console.log('lags',o.lag.join(' '));console.log('ev',o.ev.join(' '));console.log('JS total',o.jsTotal,'ms de',o.t);console.log(o.jsPorOrigen.join('\n'));}
await ctx.close();await b.close();})();
