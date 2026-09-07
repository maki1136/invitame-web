/* ===== ADMIN DE INVÍTAME · parte 2 de 4 · el dibujo del panel =========================

   ⚠️⚠️ ESTO ERA UN SOLO `<script>` DE 128 KB ADENTRO DE `admin.html`.
   Se partió el 7/9/2026 por una razón concreta: mientras estuvo en una sola
   pieza, NADA de admin.html se podía arreglar en el origen. Cada corrección
   había que escribirla como módulo aparte que corre después —un parche— porque
   el archivo entero no entra por la API de GitHub (techo medido: ~40 KB).
   Maki: «hay que arreglar todo para siempre, no quiero parches».

   REGLAS PARA NO ROMPERLO
   · Los cuatro archivos se cargan EN ORDEN desde admin.html, sin `defer`.
     El orden es el mismo que tenían adentro del script original.
   · Todo lo que se declara acá (`const`, `let`, `function`) queda visible para
     los otros tres: son scripts clásicos, comparten el ámbito global.
     ⚠️ Pero `const` y `let` NO quedan en `window` — se leen con el nombre
        pelado. `window.D` da undefined; `D` anda.
   · El ARRANQUE (`buildTabs(); renderPanel(); render(); …`) vive al final de
     la parte 4, y ahí tiene que quedarse: corre cuando ya está todo declarado.
   · Si hay que mover una función de un archivo a otro, mirar antes si alguna
     línea que EJECUTA al cargar la necesita. Al partirlo se verificó que
     ninguna dependía de algo declarado más adelante.

   Cómo se verificó el corte: pegando los cuatro archivos de nuevo, uno atrás
   del otro, el resultado es IDÉNTICO byte a byte al script original.
   ============================================================================ */
  function triviaHtml(){
    D.trivia=D.trivia||[];
    const qs=D.trivia.map((p,i)=>{
      const opts=(p.o||[]).map((o,j)=>
        '<div class="tqopt"><input type="radio" name="tqc'+i+'" '+(p.c===j?'checked':'')+' onchange="tqCorrect('+i+','+j+')" title="Respuesta correcta">'+
        '<input type="text" value="'+String(o).replace(/"/g,'&quot;')+'" oninput="tqOpt('+i+','+j+',this.value)" placeholder="Opción '+(j+1)+'">'+
        (p.o.length>2?'<span class="tqx" onclick="tqDelOpt('+i+','+j+')">✕</span>':'')+'</div>'
      ).join('');
      return '<div class="tqcard"><div class="tqhead"><b>Pregunta '+(i+1)+'</b><span class="tqx" onclick="tqDel('+i+')">🗑 quitar</span></div>'+
        '<input type="text" value="'+String(p.q||'').replace(/"/g,'&quot;')+'" oninput="tqSet('+i+',this.value)" placeholder="Escribí la pregunta">'+
        '<div class="tqopts">'+opts+'</div>'+
        (p.o.length<4?'<button class="lnk" onclick="tqAddOpt('+i+')">+ agregar opción</button>':'')+
        '<div class="hint">Marcá el círculo de la respuesta correcta.</div></div>';
    }).join('');
    return '<div class="mejoras"><div class="h">✨ Preguntas y respuestas de la trivia</div>'+
      '<div class="hint" style="margin-bottom:10px">Cada invitado responde y suma puntos. Se muestran en la sección "¡Pregúntame!" de la invitación.</div>'+
      qs+'<button class="addbtn" onclick="tqAdd()">+ Agregar pregunta</button></div>';
  }
  function tqSet(i,v){D.trivia[i].q=v;}
  function tqOpt(i,j,v){D.trivia[i].o[j]=v;}
  function tqCorrect(i,j){D.trivia[i].c=j;}
  function tqAddOpt(i){if(D.trivia[i].o.length<4){D.trivia[i].o.push('');renderPanel();}}
  function tqDelOpt(i,j){if(D.trivia[i].o.length>2){D.trivia[i].o.splice(j,1);if(D.trivia[i].c>=D.trivia[i].o.length)D.trivia[i].c=0;renderPanel();}}
  function tqAdd(){D.trivia.push({q:'',o:['',''],c:0});renderPanel();}
  function tqDel(i){D.trivia.splice(i,1);renderPanel();}
  const SECLABELS={frase:'Frase',eventos:'Dónde y cuándo',itinerario:'Itinerario',hospedaje:'Hospedaje',dresscode:'Dress code',padres:'Los papás',galeria:'Galería',trivia:'Trivia',regalos:'Mesa de regalos'};
  const SECALL=['frase','eventos','itinerario','hospedaje','dresscode','padres','galeria','trivia','regalos'];
  let _dragO=null;
  function verOrden(){
    D.secOrden=D.secOrden||SECALL.slice();
    SECALL.forEach(k=>{if(D.secOrden.indexOf(k)<0)D.secOrden.push(k);});
    D.secOrden=D.secOrden.filter(k=>SECALL.indexOf(k)>=0);
    let box=el('ordbox');
    if(!box){box=document.createElement('div');box.id='ordbox';box.style.cssText='position:fixed;inset:0;background:rgba(73,17,26,.55);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:26px 18px;overflow:auto';document.body.appendChild(box);}
    box.innerHTML='<div style="background:#fff;max-width:440px;width:100%;border-radius:14px;padding:20px;font-family:Nunito">'+
      '<h3 style="margin:0 0 4px;color:#6D1233;font-weight:900">↕ Orden de las secciones</h3>'+
      '<div class="hint" style="margin-bottom:12px">Arrastrá, o usá ▲▼, para cambiar el orden. La portada, el pase, la confirmación y el cierre quedan fijos.</div>'+
      '<div id="ordlist"></div>'+
      '<div style="margin-top:14px;text-align:right"><button style="background:#F56770;color:#fff;border:0;border-radius:20px;padding:9px 18px;font-weight:800;font-family:Nunito;cursor:pointer" onclick="document.getElementById(\'ordbox\').remove()">Listo (guardá con Publicar)</button></div></div>';
    ordRender();
  }
  function ordRender(){
    el('ordlist').innerHTML=D.secOrden.map((k,i)=>
      '<div class="ordrow" draggable="true" ondragstart="_dragO='+i+'" ondragover="event.preventDefault()" ondrop="ordDrop('+i+')">'+
      '<span style="cursor:grab;opacity:.6">☰</span><span style="flex:1">'+(i+1)+'. '+(SECLABELS[k]||k)+'</span>'+
      '<button class="ordb" onclick="ordMove('+i+',-1)">▲</button><button class="ordb" onclick="ordMove('+i+',1)">▼</button></div>').join('');
  }
  function ordDrop(i){if(_dragO==null||_dragO===i)return;const it=D.secOrden.splice(_dragO,1)[0];D.secOrden.splice(i,0,it);_dragO=null;ordRender();}
  function ordMove(i,d){const j=i+d;if(j<0||j>=D.secOrden.length)return;const a=D.secOrden;const t=a[i];a[i]=a[j];a[j]=t;ordRender();}
  let _dragG=null;
  function verMesas(){
    let box=el('mesabox');
    if(!box){box=document.createElement('div');box.id='mesabox';box.style.cssText='position:fixed;inset:0;background:rgba(73,17,26,.55);display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding:20px;overflow:auto';document.body.appendChild(box);}
    D.mesaCap=D.mesaCap||10;
    const nums=[]; D.invitados.forEach(g=>{const n=parseInt(g.m,10);if(n>0)nums.push(n);});
    D.mesaCount=Math.max(D.mesaCount||0, nums.length?Math.max.apply(null,nums):0, 1);
    box.innerHTML='<div style="background:#fff;max-width:940px;width:100%;border-radius:14px;padding:20px;font-family:Nunito">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:6px"><h3 style="margin:0;color:#6D1233;font-weight:900">🍽 Gestión de mesas</h3>'+
      '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:12px;color:#9a8f88">Capacidad</span><input type="number" min="1" value="'+D.mesaCap+'" style="width:58px;padding:6px;border:1px solid #e7ddd3;border-radius:8px" onchange="D.mesaCap=parseInt(this.value)||10;mesaRender()">'+
      '<button class="addbtn" onclick="mesaAdd()">+ Mesa</button>'+
      '<button style="background:#efe7de;color:#49111A;border:0;border-radius:20px;padding:8px 14px;font-family:Nunito;font-weight:700;cursor:pointer" onclick="document.getElementById(\'mesabox\').remove();if(cur===\'INVITADOS\')renderGuests()">Cerrar</button></div></div>'+
      '<div class="hint" style="margin-bottom:12px">Arrastrá cada invitado a su mesa. Se guarda al tocar "Guardar y publicar".</div><div id="mesagrid"></div></div>';
    mesaRender();
  }
  function mesaRender(){
    const cap=parseInt(D.mesaCap,10)||10;
    const groups={},sin=[];
    D.invitados.forEach((g,idx)=>{const n=parseInt(g.m,10);if(n>0){(groups[n]=groups[n]||[]).push(idx);}else sin.push(idx);});
    const chip=idx=>{const g=D.invitados[idx];const mn=(parseInt(g.m,10)>0)?parseInt(g.m,10):0;return '<div class="mchip" draggable="true" ondragstart="_dragG='+idx+'"><span style="flex:1">'+(g.n||'')+' <span style="opacity:.55">·'+(g.p||1)+'p</span></span><input type="number" min="0" value="'+mn+'" title="N° de mesa (0 = sin asignar)" onclick="event.stopPropagation()" onchange="D.invitados['+idx+'].m=(parseInt(this.value,10)>0?this.value:\'-\');mesaRender()" style="width:44px;padding:3px;border:1px solid #e7ddd3;border-radius:6px;font-family:Nunito"></div>';};
    const zone=(num,idxs,label)=>{const per=idxs.reduce((a,ix)=>a+(parseInt(D.invitados[ix].p,10)||1),0);const over=num&&per>cap;
      return '<div class="mcard'+(over?' over':'')+'" ondragover="event.preventDefault()" ondrop="mesaDrop('+(num||0)+')">'+
        '<div class="mcardh"><b>'+label+'</b><span style="font-size:11px;color:'+(over?'#F56770':'#9a8f88')+'">'+per+(num?'/'+cap:'')+' pers</span></div>'+
        (idxs.map(chip).join('')||'<div class="hint" style="margin:0">— vacía —</div>')+'</div>';};
    const cards=[]; for(let n=1;n<=(D.mesaCount||1);n++){cards.push(zone(n,groups[n]||[],'Mesa '+n));}
    el('mesagrid').innerHTML='<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px">'+cards.join('')+'</div>'+
      '<div style="margin-top:12px">'+zone(0,sin,'Sin asignar')+'</div>';
  }
  function mesaDrop(num){ if(_dragG==null)return; D.invitados[_dragG].m=(num>0?String(num):'-'); _dragG=null; mesaRender(); }
  function mesaAdd(){ D.mesaCount=(D.mesaCount||1)+1; mesaRender(); }
  function galeriaHtml(){
    D.galeria=D.galeria||[];
    const thumbs=D.galeria.map((u,i)=>'<div class="gthumb"><img src="'+u+'"><span class="gx" onclick="galDel('+i+')">✕</span></div>').join('');
    return '<div class="mejoras"><div class="h">✨ Galería de fotos (sin límite)</div>'+
      '<div class="hint" style="margin-bottom:10px">Subí todas las fotos que quieras — aparecen en el carrusel de la invitación. Ya no hay tope de 6.</div>'+
      '<div class="gthumbs">'+(thumbs||'<div class="hint" style="margin:0">Todavía no subiste fotos (se usan las de la plantilla).</div>')+'</div>'+
      '<div class="file" style="margin-top:10px" id="galbtn" onclick="this.nextElementSibling.click()">⬆ Agregar foto(s) a la galería</div>'+
      '<input type="file" accept="image/*" multiple style="display:none" onchange="galAdd(this)"></div>'+extrasHtml();
  }
  function _selOpt(v,cur){return '<option value="'+v[0]+'"'+((cur||'')===v[0]?' selected':'')+'>'+v[1]+'</option>';}
  function extrasHtml(){
    const inp=(k,ph)=>'<input value="'+String(D[k]||'').replace(/"/g,'&quot;')+'" oninput="setB(\''+k+'\',this.value)" placeholder="'+ph+'">';
    const fxOpts=[['none','Ninguno'],['bokeh','Bokeh (círculos suaves)'],['destellos','Destellos'],['estrellas','Estrellas doradas'],['petalos','Pétalos cayendo'],['gradiente','Degradado animado'],['ondas','Ondas suaves']];
    return ''+
    '<div class="mejoras"><div class="h">🎵 Música de fondo</div>'+
     '<div class="hint" style="margin-bottom:8px">Arranca cuando el invitado abre el sobre; queda un botón 🔊 para silenciar. Subí un audio o pegá el link (.mp3).</div>'+
     '<div class="file" id="audiobtn" onclick="this.nextElementSibling.click()">⬆ Subir audio (.mp3)</div>'+
     '<input type="file" accept="audio/*" style="display:none" onchange="subirAudio(this)">'+
     '<input style="margin-top:8px" value="'+String(D.musicaUrl||'').replace(/"/g,'&quot;')+'" oninput="setB(\'musicaUrl\',this.value)" placeholder="…o pegá el link del audio (.mp3)"></div>'+
    '<div class="mejoras"><div class="h">✨ Fondo con movimiento (frase principal)</div>'+
     '<select onchange="setB(\'fraseFx\',this.value)">'+fxOpts.map(o=>_selOpt(o,D.fraseFx)).join('')+'</select></div>'+
    '<div class="mejoras"><div class="h">📷 Hashtag de Instagram</div>'+inp('igHashtag','#MariaYDiego2026')+'</div>'+
    '<div class="mejoras"><div class="h">🎶 Playlist de Spotify</div>'+
     '<div class="hint" style="margin-bottom:8px">En Spotify: Compartir → Copiar enlace de la playlist, y pegalo acá.</div>'+inp('spotifyUrl','https://open.spotify.com/playlist/...')+'</div>'+
    '<div class="mejoras"><div class="h">🎁 Mesa de Regalos (botones)</div>'+
     '<div class="hint" style="margin-bottom:8px">Pegá el link de cada mesa. Los que dejes vacíos no aparecen.</div>'+
     '<label>Liverpool</label>'+inp('reg_liverpool','link Liverpool')+
     '<label>Amazon</label>'+inp('reg_amazon','link Amazon')+
     '<label>Sears</label>'+inp('reg_sears','link Sears')+
     '<label>Mercado Libre</label>'+inp('reg_mercadolibre','link Mercado Libre')+
     '<label>Palacio de Hierro</label>'+inp('reg_palacio','link Palacio de Hierro')+
     '<label>Venmo</label>'+inp('reg_venmo','link o usuario Venmo')+
     '<label>PayPal</label>'+inp('reg_paypal','link PayPal')+
     '<div class="two"><div class="grp"><label>Otra (nombre)</label>'+inp('reg_otro_n','Ej: Amazon US')+'</div><div class="grp"><label>Otra (link)</label>'+inp('reg_otro_u','https://...')+'</div></div></div>'+
    '<div class="mejoras"><div class="h">🏦 Datos para transferencia (opcional)</div>'+
     '<label>CLABE / Cuenta</label>'+inp('regClabe','CLABE (18 dígitos) o número de cuenta')+
     '<label>Titular</label>'+inp('regTitular','Nombre del titular')+
     '<label>Banco</label>'+inp('regBanco','Banco')+'</div>'+
    '<div class="mejoras"><div class="h">🌤️ Clima del día del evento</div>'+
     '<label style="display:flex;align-items:center;gap:8px;font-weight:700"><input type="checkbox" '+(D.climaOff?'':'checked')+' onchange="setB(\'climaOff\',!this.checked)" style="width:auto"> Mostrar el clima</label>'+
     '<div class="hint">Se activa si cargaste las coordenadas del lugar en "Dónde y cuándo". Muestra el clima típico de esa fecha y, cuando falta poco, el pronóstico real.</div></div>';
  }
  async function subirAudio(input){
    const f=input.files&&input.files[0]; if(!f)return;
    if(!window.INV||!INV.uploadVideo){alert('Todavía no cargó la base. Esperá 2 seg.');return;}
    const b=el('audiobtn'); const prev=b?b.textContent:''; if(b)b.textContent='Subiendo audio… ⏳';
    try{const url=await INV.uploadVideo(f); setB('musicaUrl',url); if(b)b.textContent='✓ Audio subido';}
    catch(e){ if(b)b.textContent=prev||'⬆ Subir audio (.mp3)'; alert('No se pudo subir: '+(e.message||e)); }
    input.value='';
  }
  function galDel(i){D.galeria.splice(i,1);renderPanel();}
  async function galAdd(input){
    const files=[...(input.files||[])]; if(!files.length)return;
    if(!window.INV||!INV.uploadImage){alert('Todavía no cargó la base. Esperá 2 seg.');return;}
    const box=el('galbtn'); if(box)box.textContent='Subiendo '+files.length+' foto(s)… ⏳';
    D.galeria=D.galeria||[];
    for(const f of files){ try{const url=await INV.uploadImage(f); D.galeria.push(url);}catch(e){console.error(e);} }
    input.value=''; renderPanel();
  }
  // ==== PANEL DE EFECTOS ====
  // CATALOGO DE SOBRES (modo "carta"). Para sumar uno: subir la imagen del papel
  // a /sobres/ del repo y agregar UNA linea aca. El mismo catalogo esta copiado en
  // la invitacion (constante SOBRES en index.html): si agregas uno, agregalo en LOS DOS.
  // El evento guarda solo el id, asi la imagen se puede cambiar despues sin tocar
  // ninguna invitacion ya entregada.
  // Hay dos clases de sobre. Los que tienen "video" se REPRODUCEN: el sobre se
  // abre en la filmacion y despues entra la invitacion real. Los que tienen solo
  // "img" se dibujan por CSS con esa foto de papel (el modo viejo). En los de
  // video, "poster" es el primer cuadro y es lo que se muestra en la miniatura.
  // El catalogo vive en /sobres/catalogo.js (compartido con el motor).
  const SOBRES = window.SOBRES_INVITAME || {};
  const CFFONTS=[['Lora','Lora (clásica)'],['Great Vibes','Great Vibes ✒'],['Forum','Forum'],['Montserrat','Montserrat'],['Rouge Script','Rouge Script ✒']];
  function chk(grp,key,label){ensureFX();return '<label class="chk"><input type="checkbox" '+(D.fx[grp][key]?'checked':'')+' onchange="D.fx.'+grp+'.'+key+'=this.checked;postPreview()"> '+label+'</label>';}
  function col(grp,key){ensureFX();return '<input type="color" value="'+(D.fx[grp][key]||'#ffffff')+'" oninput="D.fx.'+grp+'.'+key+'=this.value;postPreview()">';}
  function txt(grp,key,ph){ensureFX();return '<input type="text" value="'+String(D.fx[grp][key]||'').replace(/"/g,'&quot;')+'" oninput="D.fx.'+grp+'.'+key+'=this.value;postPreview()" placeholder="'+(ph||'')+'">';}
  function area(grp,key){ensureFX();return '<textarea oninput="D.fx.'+grp+'.'+key+'=this.value;postPreview()">'+String(D.fx[grp][key]||'')+'</textarea>';}
  function sel(grp,key,opts){ensureFX();return '<select onchange="D.fx.'+grp+'.'+key+'=this.value;postPreview()">'+opts.map(o=>'<option value="'+o[0]+'" '+(D.fx[grp][key]===o[0]?'selected':'')+'>'+o[1]+'</option>').join('')+'</select>';}
  // Igual que sel(), pero ademas vuelve a dibujar el panel. Lo usan los campos que
  // hacen aparecer o desaparecer otros campos (ej: elegir "Carta" muestra el catalogo).
  function selR(grp,key,opts){ensureFX();return '<select onchange="D.fx.'+grp+'.'+key+'=this.value;postPreview();renderPanel()">'+opts.map(o=>'<option value="'+o[0]+'" '+(D.fx[grp][key]===o[0]?'selected':'')+'>'+o[1]+'</option>').join('')+'</select>';}
  function setAdorno(id){ ensureFX(); D.fx.diseno.adorno=id; D.fx.diseno.adornoCustom=''; renderPanel(); }
  async function subirAdorno(input){ const f=input.files&&input.files[0]; if(!f)return;
    if(!window.INV||!INV.uploadImage){alert('Todavía no cargó la base. Esperá 2 seg.');return;}
    try{ const url=await INV.uploadImage(f); ensureFX(); D.fx.diseno.adornoCustom=url; D.fx.diseno.adorno=''; renderPanel(); }
    catch(e){ console.error(e); alert('No se pudo subir: '+(e.message||e)); } }
  function efectosHtml(){
    ensureFX();
    const secOpts=Object.keys(SECLABELS).map(k=>[k,SECLABELS[k]]);
    const pauto=(D.fx.particulas.color==='auto');
    const _esCarta=(D.fx.sobre.tipo==='carta');
    return '<div class="mejoras"><div class="h">✨ Efectos — sobre de entrada</div>'+
        '<div class="hint" style="margin-bottom:10px">El sobre que se abre al inicio. Todo se puede prender/apagar y cambiar de color.</div>'+
        '<div class="grp"><label>Cómo se abre</label>'+
          selR('sobre','tipo',[['clasico','Clásico — el sobre se abre y aparece la invitación'],['carta','Carta — la tarjeta se desliza hacia arriba, sale y se convierte en la portada']])+
          '<div class="hint">El modo <b>Carta</b> usa un sobre del catálogo de abajo. El resto de los controles de esta sección (lacre, relieve, iniciales) son del modo Clásico.</div>'+
        '</div>'+
        '</div>'+
        (_esCarta
          ? '<div class="grp"><label>Sobre del catálogo</label>'+
              selR('sobre','modelo',[['','— Elegí un sobre —']].concat(Object.keys(SOBRES).map(k=>[k,SOBRES[k].nombre])))+
              '<div class="hint">Cada sobre trae su papel y su color sugerido. Si querés otro color, cambialo abajo.</div>'+
              (D.fx.sobre.modelo&&SOBRES[D.fx.sobre.modelo]
                ? '<img src="'+(SOBRES[D.fx.sobre.modelo].poster||SOBRES[D.fx.sobre.modelo].img||'')+'" alt="" style="max-height:90px;border-radius:8px;margin-top:8px">'+
                  (SOBRES[D.fx.sobre.modelo].video?'<div class="hint">Este sobre es un video: se abre solo y despues entra la invitacion.</div>':'')
                : '')+
            '</div>'+
            '<div class="grp"><label>Color de la carta (se multiplica sobre el papel, conserva el relieve)</label>'+
              '<input type="color" value="'+(D.fx.sobre.colorCarta||(SOBRES[D.fx.sobre.modelo]||{}).color||'#d9a7ae')+'" oninput="D.fx.sobre.colorCarta=this.value;postPreview()">'+
              '<div class="hint">⚠ El sobre de entrada NO se ve en esta vista previa (acá la invitación abre directo). Para verlo, usá el botón 👁 y abrí la invitación de verdad.</div>'+
            '</div>'
          : '')+
        '<div class="grp">'+chk('sobre','relieve','Relieve / volumen del papel')+'</div>'+
        '<div class="grp"><label>Textura del sobre</label>'+sel('sobre','textura',[['lino','Lino (tela suave)'],['liso','Liso / satinado'],['kraft','Kraft (papel rústico)'],['acuarela','Acuarela'],['marmol','Mármol'],['floral','Floral punteado'],['ninguno','Sin textura']])+'<div class="hint">El color de abajo se combina con la textura.</div></div>'+
        '<div class="two"><div class="grp"><label>Color del sobre</label>'+col('sobre','color')+'</div>'+
        '<div class="grp"><label>Color del lacre</label>'+col('sobre','selloColor')+'</div></div>'+
        '<div class="grp">'+chk('sobre','sello','Mostrar sello de lacre')+'</div>'+
        '<div class="two"><div class="grp"><label>Emblema del sello</label>'+sel('sobre','emblema',[['iniciales','Iniciales'],['corazon','Corazón ❤'],['anillos','Anillos ⚭']])+'</div>'+
        '<div class="grp"><label>Iniciales (ej: M&D)</label>'+txt('sobre','ini','M&D')+'</div></div>'+
      '</div>'+
        (function(){ D.fx=D.fx||{}; D.fx.calendario=D.fx.calendario||{}; return ''; })()+
        '<div class="h">✨ Efectos — calendario de la fecha</div>'+
        '<div class="hint" style="margin-bottom:10px">La grilla del mes se arma sola con la fecha del evento. Si la fecha cambia, el calendario se acomoda y el día nunca queda en la columna equivocada. No es una imagen.</div>'+
        '<div class="grp">'+chk('calendario','encendido','Mostrar el calendario')+'</div>'+
        '<div class="two"><div class="grp"><label>Tipo de número</label>'+sel('calendario','fuente',[['forum','Forum — serif clásica'],['marcellus','Marcellus — serif fina'],['prata','Prata — serif marcada'],['montserrat','Montserrat — sin serif']])+'</div>'+
        '<div class="grp"><label>Marcador de la fecha</label>'+sel('calendario','marca',[['corazon','Corazón'],['circulo','Círculo'],['cuadrado','Cuadrado'],['relleno','Círculo relleno']])+'</div></div>'+
        '<div class="two"><div class="grp"><label>Color de los números</label>'+col('calendario','num')+'</div>'+
        '<div class="grp"><label>Color del marcador</label>'+col('calendario','mk')+'</div></div>'+
        '<div class="two"><div class="grp"><label>Color de fondo</label>'+col('calendario','bg')+'</div>'+
        '<div class="grp"><label>Tamaño</label>'+sel('calendario','tam',[['390','Grande — el máximo que entra en un celular'],['340','Mediano'],['290','Chico'],['240','Muy chico']])+'</div></div>'+
        '<div class="grp"><label>Imagen de fondo (opcional)</label>'+txt('calendario','img','pegá acá el link de la imagen')+'<div class="hint">Si ponés una imagen manda sobre el color, y se le aplica un velo del color de fondo para que los números se lean siempre.</div></div>'+
        '<div class="two"><div class="grp"><label>Texto de arriba</label>'+txt('calendario','kick','Guardá la fecha')+'</div>'+
        '<div class="grp"><label>Texto de abajo</label>'+txt('calendario','pie','Nos casamos')+'</div></div>'+
        '<div class="hint" style="margin-bottom:10px">El calendario aparece justo después del sector de la fecha. Miralo con el botón 👁: en la vista previa de arriba no se ve.</div>'+
        (function(){ D.fx=D.fx||{};
          D.fx.itinerario=D.fx.itinerario||{}; D.fx.fecha=D.fx.fecha||{}; D.fx.raspadita=D.fx.raspadita||{};
          var R=D.fx.raspadita; if(R.polvillo===undefined)R.polvillo=true;
          if(R.destello===undefined)R.destello=true; if(R.vibrar===undefined)R.vibrar=true;
          return ''; })()+
        '<div class="h">✨ Efectos — itinerario</div>'+
        '<div class="hint" style="margin-bottom:10px">La línea se dibuja sola a medida que el invitado baja, y cada momento aparece cuando le toca. Sólo funciona si el itinerario está cargado como LISTA (con su hora, título y descripción); si subiste una imagen, no hay nada que animar.</div>'+
        '<div class="grp"><label>Cómo se ve la línea</label>'+sel('itinerario','estilo',[['izquierda','A la izquierda — todo el texto a la derecha'],['centro','Al medio — los momentos alternando en zigzag']])+'</div>'+
        '<div class="h">✨ Efectos — cómo se muestra la fecha</div>'+
        '<div class="hint" style="margin-bottom:10px">Nueve maneras de mostrar la fecha. Se arma sola con la fecha del evento. Las de FOTOS necesitan tres imágenes.</div>'+
        '<div class="grp"><label>Disposición</label>'+sel('fecha','disposicion',[['','Como siempre'],['fotos','Tres fotos — un número sobre cada una'],['circulos','Tres círculos con foto'],['barras','Barras — 28 | 11 | 26'],['apilada','Apilada — una debajo de la otra'],['filetes','Con filetes — NOV — 28 — 2026'],['semana','Con día de la semana y hora'],['monograma','Monograma arriba y la fecha abajo'],['grande','El día grande y el mes al costado'],['manuscrita','Manuscrita — Save the date en cursiva']])+'</div>'+
        '<div class="two"><div class="grp"><label>Color del texto</label>'+col('fecha','color')+'</div>'+
        '<div class="grp"><label>Color de los detalles</label>'+col('fecha','acento')+'</div></div>'+
        '<div class="two"><div class="grp"><label>Texto de arriba</label>'+txt('fecha','kick','Save the date')+'</div>'+
        '<div class="grp"><label>Texto de abajo</label>'+txt('fecha','pie','Nos casamos')+'</div></div>'+
        '<div class="two"><div class="grp"><label>Hora — para "día de la semana"</label>'+txt('fecha','hora','20:30')+'</div>'+
        '<div class="grp"><label>Iniciales — para "monograma"</label>'+txt('fecha','ini','J / D')+'</div></div>'+
        '<div class="grp"><label>Foto 1 — va con el día</label>'+txt('fecha','foto1','pegá el link de la imagen')+'</div>'+
        '<div class="two"><div class="grp"><label>Foto 2 — el mes</label>'+txt('fecha','foto2','link')+'</div>'+
        '<div class="grp"><label>Foto 3 — el año</label>'+txt('fecha','foto3','link')+'</div></div>'+
        '<div class="h">✨ Efectos — raspadita de la fecha</div>'+
        '<div class="hint" style="margin-bottom:10px">Tapa la fecha con una capa que el invitado rasca con el dedo. Se monta sobre la disposición que hayas elegido arriba: si elegiste una de fotos, va apareciendo una foto por vez.</div>'+
        '<div class="grp">'+chk('raspadita','encendido','Tapar la fecha para rascar')+'</div>'+
        '<div class="two"><div class="grp"><label>Cómo se rasca</label>'+sel('raspadita','modo',[['simple','Todo junto'],['partes','Por partes — el día, el mes y el año']])+'</div>'+
        '<div class="grp"><label>Forma de las fichas</label>'+sel('raspadita','forma',[['cuadrado','Cuadradas'],['redondo','Redondas'],['corazon','Corazones']])+'</div></div>'+
        '<div class="two"><div class="grp"><label>El mes</label>'+sel('raspadita','mes',[['corto','Corto — NOV'],['completo','Completo — Noviembre']])+'</div>'+
        '<div class="grp"><label>Se destapa sola al llegar a</label>'+sel('raspadita','auto',[['42','42% — lo recomendado'],['30','30% — enseguida'],['60','60% — más tarde'],['0','Nunca, hay que raspar todo']])+'</div></div>'+
        '<div class="two"><div class="grp"><label>Color de la capa</label>'+col('raspadita','color')+'</div>'+
        '<div class="grp"><label>Color de los números</label>'+col('raspadita','num')+'</div></div>'+
        '<div class="two"><div class="grp"><label>Relleno de la ficha</label>'+col('raspadita','fondo')+'</div>'+
        '<div class="grp"><label>Color del filete</label>'+col('raspadita','linea')+'</div></div>'+
        '<div class="grp">'+chk('raspadita','polvillo','Polvillo mientras se rasca')+'</div>'+
        '<div class="grp">'+chk('raspadita','destello','Destello al terminar')+'</div>'+
        '<div class="grp">'+chk('raspadita','vibrar','Vibración al completar cada parte')+'</div>'+
        '<div class="hint" style="margin-bottom:10px">La vibración sólo funciona en Android: iPhone no permite vibrar desde una página web. No es un error — en iPhone simplemente no pasa nada y todo lo demás anda igual.</div>'+
                
      '<div class="mejoras"><div class="h">✨ Efectos — lluvia delicada</div>'+
        '<div class="hint" style="margin-bottom:10px">Partículas suaves cayendo. Elegí que combinen con tu paleta.</div>'+
        '<div class="grp">'+chk('particulas','on','Mostrar el efecto')+'</div>'+
        '<div class="two"><div class="grp"><label>Forma</label>'+sel('particulas','tipo',[['hoja','Hojitas 🌿'],['petalo','Pétalos 🌸'],['perla','Perlas 🤍'],['flor','Flores secas 🌼'],['corazon','Corazones ❤'],['nieve','Copos ❄'],['luz','Luces ✨'],['ninguno','Ninguno']])+'</div>'+
        '<div class="grp"><label>Densidad</label>'+sel('particulas','densidad',[['suave','Suave'],['normal','Normal'],['intenso','Intenso']])+'</div></div>'+
        '<div class="grp"><label class="chk"><input type="checkbox" id="fx-pauto" '+(pauto?'checked':'')+' onchange="D.fx.particulas.color=this.checked?\'auto\':(el(\'fx-pcolor\').value)"> Color automático (combina con el tema)</label></div>'+
        '<div class="grp"><label>…o elegí un color</label><input type="color" id="fx-pcolor" value="'+(pauto?'#a9b8a0':D.fx.particulas.color)+'" oninput="if(!el(\'fx-pauto\').checked)D.fx.particulas.color=this.value"></div>'+
      '</div>'+
      '<div class="mejoras"><div class="h">✨ Efectos — carta que sale del sobre</div>'+
        '<div class="hint" style="margin-bottom:10px">Una sección donde un sobre de color se abre y sale una cartita con tu mensaje.</div>'+
        '<div class="grp">'+chk('carta','on','Mostrar la sección de la carta')+'</div>'+
        '<div class="grp"><label>Color del sobre — elegí un preset o un color libre</label>'+
          '<div style="display:flex;gap:9px;flex-wrap:wrap;margin-bottom:9px">'+[['','Marfil','#efe6d2'],['#6d7f68','Verde','#6d7f68'],['#6d3a52','Uva','#6d3a52'],['#8fa9bd','Celeste','#8fa9bd'],['#d8a68a','Durazno','#d8a68a'],['#c98b96','Rosa','#c98b96']].map(p=>'<button type="button" title="'+p[1]+'" onclick="D.fx.carta.sobreColor=\''+p[0]+'\';var i=document.getElementById(\'cf-col-inp\');if(i)i.value=\''+(p[0]||'#efe6d2')+'\'" style="width:32px;height:32px;border-radius:50%;border:2px solid #fff;box-shadow:0 1px 5px rgba(0,0,0,.2);background:'+p[2]+';cursor:pointer"></button>').join('')+'</div>'+
          '<input type="color" id="cf-col-inp" value="'+(D.fx.carta.sobreColor||'#efe6d2')+'" oninput="D.fx.carta.sobreColor=this.value"><div class="hint">El color se aplica al sobre manteniendo el relieve.</div></div>'+
        '<div class="grp"><label>Bajada (arriba del título)</label>'+txt('carta','kicker','Con cariño')+'</div>'+
        '<div class="grp"><label>Título de la carta</label>'+txt('carta','titulo','Queridos amigos y familia')+'</div>'+
        '<div class="grp"><label>Texto de la carta</label>'+area('carta','texto')+'</div>'+
        '<div class="two"><div class="grp"><label>Tipografía de la carta</label>'+sel('carta','fuente',CFFONTS)+'</div>'+
        '<div class="grp"><label>Color del texto</label>'+col('carta','colorTexto')+'</div></div>'+
      '</div>'+
      '<div class="mejoras"><div class="h">✨ Efectos — fondo de una sección</div>'+
        '<div class="hint" style="margin-bottom:10px">Un fondo animado (nubes, degradado o luces) detrás de la sección que elijas.</div>'+
        '<div class="grp">'+chk('ambiente','on','Mostrar el fondo animado')+'</div>'+
        '<div class="two"><div class="grp"><label>Tipo</label>'+sel('ambiente','tipo',[['nubes','Nubes / cielo ☁'],['degradado','Degradado'],['bokeh','Luces suaves ✨'],['ninguno','Ninguno']])+'</div>'+
        '<div class="grp"><label>¿En qué sección?</label>'+sel('ambiente','seccion',secOpts)+'</div></div>'+
        '<div class="two"><div class="grp"><label>Color de arriba</label>'+col('ambiente','colorTop')+'</div>'+
        '<div class="grp"><label>Color de abajo</label>'+col('ambiente','colorBot')+'</div></div>'+
      '</div>'+
      '<div class="mejoras"><div class="h">✨ Cortes y textura de fondo</div>'+
        '<div class="hint" style="margin-bottom:10px">El borde entre secciones y la textura del fondo. En vez de líneas rectas y color plano, elegí un corte con diseño y una textura real (le da el toque premium).</div>'+
        '<div class="grp"><label>Estilo del corte entre secciones</label>'+sel('diseno','cortes',[['','Recto (sin corte)'],['onda','Onda ～'],['curva','Curva suave ⌣'],['diagonal','Diagonal ╱'],['arco','Arcos / festón ⌣⌣⌣'],['rasgado','Papel rasgado']])+'</div>'+
        '<div class="grp"><label>Textura del fondo</label>'+sel('diseno','textura',[['','Color liso (sin textura)'],['papel','Papel'],['lino','Lino'],['kraft','Kraft'],['marmol','Mármol'],['acuarela','Acuarela']])+'</div>'+
        '<div class="hint">La textura se tiñe con el color de cada sección, así combina con tu paleta.</div>'+
      '</div>'+
      '<div class="mejoras"><div class="h">✨ Adorno de las secciones</div>'+
        '<div class="hint" style="margin-bottom:10px">El detallito decorativo que aparece arriba de cada sección. Elegí uno de la biblioteca o subí el tuyo (PNG con fondo transparente).</div>'+
        '<div class="adgrid">'+ MOTIFS.map(m=>'<button type="button" class="adopt'+((D.fx.diseno.adorno===m.id&&!D.fx.diseno.adornoCustom)?' on':'')+'" title="'+m.name+'" onclick="setAdorno(\''+m.id+'\')">'+(m.svg?('<svg viewBox=\'0 0 120 44\'>'+m.svg+'</svg>'):'<span class="adnone">—</span>')+'</button>').join('') +'</div>'+
        '<div class="grp" style="margin-top:10px"><div class="file" onclick="document.getElementById(\'adornofile\').click()">⬆ Subir mi adorno</div>'+
          '<input type="file" id="adornofile" accept="image/*" style="display:none" onchange="subirAdorno(this)">'+
          (D.fx.diseno.adornoCustom?'<div style="margin-top:8px;display:flex;align-items:center;gap:10px"><img src="'+D.fx.diseno.adornoCustom+'" style="max-height:40px;background:#eee;border-radius:6px;padding:3px"><button class="lnk" onclick="D.fx.diseno.adornoCustom=\'\';renderPanel()">Quitar el mío</button></div>':'')+
        '</div>'+
      '</div>'+
      '<div class="hint" style="margin-top:2px">Los efectos se ven en la invitación real. Tocá <b>Guardar y publicar</b> y abrí la invitación (👁 ver) para verlos.</div>';
  }
