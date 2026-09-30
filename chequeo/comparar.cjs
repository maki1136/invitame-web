/* ===== LA MINIATURA DEL PANEL CONTRA LA INVITACIÓN PUBLICADA, EN TODAS =========
   LA REGLA DE ORO (Maki, 30/9/2026): lo que Jazmín ve en la miniatura del panel
   es EXACTAMENTE lo que queda publicado. Si difieren, el panel miente.
   Para cada invitación de chequeo/muestras.txt abre el panel (sin login, sin
   guardar nada) y la invitación publicada, y compara: colección, fondo,
   nombres, nubes y, sección por sección, si se ve y con qué colores.
   Deja chequeo/tablero-muestras.json, que lee admin/tablero.html.
   Uso: node chequeo/comparar.cjs [slug ...]    INV_HOOK=archivo.js para probar archivos locales
   ============================================================================ */
const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
const inj=process.env.INV_HOOK?require(process.env.INV_HOOK):null;
const slugs=process.argv.slice(2).length?process.argv.slice(2):fs.readFileSync(path.join(__dirname,'muestras.txt'),'utf8').split('\n').map(s=>s.trim()).filter(s=>s&&!s.startsWith('#'));
const medir=()=>{const d=document;const n=d.getElementById('pv-names');const c=n?getComputedStyle(n):{};
 const secs={};d.querySelectorAll('.frame section').forEach((x,i)=>{const k=x.dataset.sec||x.id||('#'+i);const cs=getComputedStyle(x);/* ⚠️ velo-legible.js ajusta la transparencia de cada sección según lo que mide
    detrás del texto, y eso depende del alto de la pantalla: en un celular es
    una, en la miniatura otra, en una Mac otra. No es un dato del panel. Esas
    secciones se comparan por su color, sin la transparencia. */
 const adapt=x.hasAttribute('data-velo-auto');
 secs[k]=(cs.display==='none'||!x.offsetHeight)?'oculta':(cs.backgroundColor+'/'+cs.color+(adapt?' ~velo':''));});
 return {col:d.documentElement.getAttribute('data-col')||'',fondo:d.documentElement.getAttribute('data-fondo')||'',nombres:(c.fontFamily||'').slice(0,24)+' '+c.fontSize+' '+c.color,
 nubes:(d.querySelector('.sec.amb-on')||{}).dataset?d.querySelector('.sec.amb-on').dataset.sec:'no',secs};};
(async()=>{const b=await chromium.launch();const out={};
async function uno(s){let p,q;try{
 p=await b.newPage({viewport:{width:1440,height:900}});if(inj)await inj(p);
 await p.goto(''+(process.env.INV_BASE||'https://invitame.littlemomentsok.com')+'/admin.html?e='+s+'&cb='+Date.now(),{waitUntil:'load',timeout:90000});
 await p.waitForFunction(s=>{try{const f=document.getElementById('pv-frame');return D.slug===s&&f&&f.contentWindow.INVEV&&f.contentWindow.INVEV.slug===s}catch(e){return false}},s,{timeout:90000,polling:500});
 await p.waitForTimeout(12000);
 const pre=await p.frame({url:/preview=1/}).evaluate(medir);const ver=await p.evaluate(()=>D.ver||'(sin)');
 q=await b.newPage({viewport:{width:390,height:844}});if(inj)await inj(q);
 await q.goto(''+(process.env.INV_BASE||'https://invitame.littlemomentsok.com')+'/i/?e='+s+'&cb='+Date.now(),{waitUntil:'load',timeout:90000});
 await q.waitForFunction(()=>window.INVEV&&document.querySelector('.frame'),null,{timeout:90000});await q.waitForTimeout(12000);
 const pub=await q.evaluate(medir);
 let pre2=pre;
 for(let k=0;k<3&&Object.keys(pub.secs).some(x=>!(x in pre2.secs));k++){await p.waitForTimeout(8000);pre2=await p.frame({url:/preview=1/}).evaluate(medir);}
 Object.assign(pre,pre2);
 const dif=[];for(const k of ['col','fondo','nombres','nubes'])if(pre[k]!==pub[k])dif.push(k+': previa «'+pre[k]+'» · publicada «'+pub[k]+'»');
 /* si el velo adaptable tocó la sección en cualquiera de las dos, se compara sin transparencia */
 /* los colores se escriben de dos maneras según quién los calcula (rgb() y
    color(srgb …) con decimales): se pasan todos a la misma antes de comparar */
 const unaForma=v=>String(v).replace(/color\(srgb ([\d.]+) ([\d.]+) ([\d.]+)(?: \/ ([\d.]+))?\)/g,(m,r,g,b,a)=>'rgba('+Math.round(r*255)+', '+Math.round(g*255)+', '+Math.round(b*255)+', '+(a===undefined?1:(+a).toFixed(2))+')')
   .replace(/rgb\((\d+), (\d+), (\d+)\)/g,'rgba($1, $2, $3, 1)').replace(/rgba\((\d+), (\d+), (\d+), ([\d.]+)\)/g,(m,r,g,b,a)=>'rgba('+r+', '+g+', '+b+', '+(+a).toFixed(2)+')');
 const norm=(v,velo)=>{v=unaForma(String(v).replace(' ~velo',''));return velo?v.replace(/rgba\((\d+), (\d+), (\d+), [\d.]+\)/g,'rgb($1, $2, $3)').replace(/rgb\(0, 0, 0\)/g,'transp'):v;};
 for(const k of new Set([...Object.keys(pre.secs),...Object.keys(pub.secs)])){const velo=/~velo/.test(pre.secs[k]||'')||/~velo/.test(pub.secs[k]||'');if(norm(pre.secs[k],velo)===norm(pub.secs[k],velo))continue;dif.push('sección '+k+': previa «'+(pre.secs[k]||'—')+'» · publicada «'+(pub.secs[k]||'—')+'»');}
 out[s]={ver,dif};}catch(e){out[s]={error:String(e.message).split('\n')[0].slice(0,90)}}
 try{p&&await p.close();q&&await q.close();}catch(e){}}
const cola=[...slugs];await Promise.all([...Array(+(process.env.PAR||3)).keys()].map(async()=>{while(cola.length)await uno(cola.shift());}));
/* las que no abrieron por lentitud del servidor se prueban una vez más, de a una */
for(const s of slugs){if(out[s]&&out[s].error){delete out[s];await uno(s);}}
const lista=slugs.map(s=>({slug:s,ver:(out[s]||{}).ver||'',estado:(out[s]||{}).error?'gris':((out[s].dif||[]).length?'rojo':'verde'),dif:(out[s]||{}).dif||[],error:(out[s]||{}).error||''}));
fs.writeFileSync(path.join(__dirname,'tablero-muestras.json'),JSON.stringify({cuando:new Date().toISOString(),total:lista.length,verde:lista.filter(x=>x.estado==='verde').length,rojo:lista.filter(x=>x.estado==='rojo').length,gris:lista.filter(x=>x.estado==='gris').length,items:lista},null,1));
let igual=0;for(const s of slugs){const o=out[s];if(o.dif&&!o.dif.length)igual++;console.log(s.padEnd(22),o.error?('ERROR '+o.error):(o.ver+'  '+(o.dif.length?o.dif.length+' diferencias':'IGUAL')));}
console.log('IGUALES',igual,'de',slugs.length);await b.close();})();
