/* ===== EL FORMULARIO DEL CLIENTE ==============================================
   El script que antes vivia adentro de crear.html.

   POR QUE ESTA AFUERA
   crear.html pesaba 50 KB y el techo de una subida al repo por la API es de
   unos 45 KB: o sea que el formulario que usan los clientes NO SE PODIA TOCAR.
   Partido, quedan dos archivos de 25 KB y los dos entran. Es lo mismo que ya se
   hizo con mi-panel.html (51 KB -> 13 KB + mi-panel.js).

   /!\ VA CON type="module": usa import. Si se carga como script normal, no
       arranca y el formulario queda mudo sin ningun error visible.
   /!\ ESTE ARCHIVO NO ESCRIBE `fx`. Escribe una SOLICITUD en inv_solicitudes.
       El diseno se lo pone Jazmin despues, desde el panel.
   ============================================================================ */
  import { collection, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  const $=id=>document.getElementById(id);
  const TEMAS={rustica:{n:"Rústica Campestre",c:"#2e433c"},uva:{n:"Uva Elegante",c:"#5b2a4e"},blanco:{n:"Blanco Clásico",c:"#5f574d"},xv:{n:"XV Rosa",c:"#b06a7e"},boho:{n:"Boho",c:"#a5674f"}};
  const tpl=(new URLSearchParams(location.search).get('tpl')||'boho').toLowerCase();
  const T=TEMAS[tpl]||TEMAS.boho;
  $('modelo-nom').textContent=T.n; document.querySelector('.modelo .sw').style.background=T.c;

  // ---- Tipo de evento ----
  const TITDEF={boda:'Nuestra Boda',xv:'Mis XV',bautismo:'Mi Bautismo',comunion:'Mi Comunión',cumple:'Mi Cumpleaños',otro:''};
  const PROT={boda:['Los protagonistas','¿Quiénes se casan?'],xv:['La quinceañera','¿Quién cumple los XV?'],bautismo:['El/la homenajeado/a','¿Quién se bautiza?'],comunion:['El/la homenajeado/a','¿Quién toma la comunión?'],cumple:['El/la homenajeado/a','¿Quién cumple?'],otro:['Los protagonistas','¿Quiénes festejan?']};
  function aplicarTipo(){ const t=$('tipo').value; $('kick').placeholder=TITDEF[t]||'Título'; if(!$('kick').dataset.touched)$('kick').value=TITDEF[t]||''; const p=PROT[t]||PROT.boda; $('h-prot').textContent=p[0]; $('d-prot').textContent=p[1];
    // "Nombre 2" solo se esconde en los eventos de UNA persona. Antes solo se
    // evaluaba para boda/xv, así que al pasar de XV a Bautismo quedaba escondido
    // para siempre (y encima se seguía guardando el valor viejo).
    const solo1 = (t==='xv'||t==='bautismo'||t==='comunion'||t==='cumple');
    const cajaN2 = $('n2').closest('div');
    if(cajaN2) cajaN2.style.display = solo1 ? 'none' : '';
    if(solo1) $('n2').value='';
  }
  $('tipo').addEventListener('change',aplicarTipo);
  $('kick').addEventListener('input',()=>{$('kick').dataset.touched='1';});
  aplicarTipo();

  // ================= AYUDA VISUAL POR CAMPO =================
  function phone(rows){
    const n=rows.length, top=18, bot=196, gap=4, rowH=(bot-top-gap*(n-1))/n; let y=top, inner='';
    rows.forEach(([t,hot])=>{ inner+='<rect x="15" y="'+y.toFixed(1)+'" width="90" height="'+rowH.toFixed(1)+'" rx="6" fill="'+(hot?'#F56770':'#e5d8ca')+'"/><text x="60" y="'+(y+rowH/2+2.6).toFixed(1)+'" text-anchor="middle" font-size="7.5" font-weight="700" fill="'+(hot?'#fff':'#8a7a6a')+'" font-family="Nunito,sans-serif">'+t+'</text>'; y+=rowH+gap; });
    return '<svg viewBox="0 0 120 214" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="4" width="110" height="206" rx="18" fill="#efe6da" stroke="#d3c4b4"/><rect x="10" y="10" width="100" height="194" rx="13" fill="#fbf6ef"/>'+inner+'</svg>';
  }
  const FOTOVIS='<svg viewBox="0 0 120 214" xmlns="http://www.w3.org/2000/svg"><rect x="5" y="4" width="110" height="206" rx="18" fill="#efe6da" stroke="#d3c4b4"/><rect x="10" y="10" width="100" height="194" rx="13" fill="#b98c6a"/><text x="60" y="104" text-anchor="middle" font-size="30">📷</text><text x="60" y="128" text-anchor="middle" font-size="8" fill="#fff" font-family="Nunito,sans-serif">tu foto de fondo</text></svg>';
  let _qr=''; for(let i=0;i<7;i++)for(let j=0;j<7;j++){ if((i*j+i+j)%3===0)_qr+='<rect x="'+(20+j*6)+'" y="'+(18+i*6)+'" width="6" height="6" fill="#3f3730"/>'; }
  const QRVIS='<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="13" fill="#fbf6ef" stroke="#e5d8ca"/>'+_qr+'<rect x="16" y="70" width="88" height="9" rx="4" fill="#F56770"/><rect x="16" y="84" width="66" height="7" rx="3" fill="#e5d8ca"/><text x="60" y="108" text-anchor="middle" font-size="8" font-weight="700" fill="#6D1233" font-family="Nunito,sans-serif">link + QR único</text></svg>';
  const NOTEVIS='<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg"><rect width="120" height="120" rx="13" fill="#fbf6ef" stroke="#e5d8ca"/><rect x="26" y="24" width="68" height="72" rx="7" fill="#fff" stroke="#e5d8ca"/><rect x="34" y="36" width="52" height="6" rx="3" fill="#F56770"/><rect x="34" y="50" width="44" height="5" rx="2" fill="#e5d8ca"/><rect x="34" y="62" width="50" height="5" rx="2" fill="#e5d8ca"/><rect x="34" y="74" width="36" height="5" rx="2" fill="#e5d8ca"/><text x="88" y="30" font-size="15">✏️</text></svg>';
  const HELP={
    tipo:{rows:[['Título',1],['Nombres',0],['Fecha ⏳',0]],txt:'<b>Elegí qué estás festejando.</b> Con esto adaptamos los textos automáticamente. Ej: si elegís <b>XV</b>, el título sugerido pasa a "Mis XV"; si es <b>Bautismo</b>, "Mi Bautismo". Igual después podés escribir el título que quieras.'},
    kick:{rows:[['Título',1],['Nombres',0],['Fecha',0],['Cuenta ⏳',0]],txt:'<b>Es el textito chico de arriba de todo</b>, arriba de los nombres, en la portada. Ejemplos: "Nuestra Boda", "Mis XV", "¡Nos casamos!". Va en mayúsculas y separado. Si lo dejás con el sugerido, está perfecto.'},
    nombres:{rows:[['Título',0],['Nombres',1],['Fecha',0],['Cuenta ⏳',0]],txt:'<b>Los nombres de los protagonistas</b>, en letra grande y destacada en la portada. Si es una pareja, poné los dos; si es una persona (XV, bautismo), con el primero alcanza.'},
    fecha:{rows:[['Título',0],['Nombres',0],['Fecha',1],['Cuenta ⏳',1]],txt:'<b>La fecha y hora del evento.</b> Se usa para dos cosas: se muestra escrita en la portada (ej: "Sábado 28 · Noviembre") <b>y</b> alimenta la <b>cuenta regresiva</b> (los días/horas/minutos que faltan). Elegí la fecha exacta.'},
    foto:{special:'foto',txt:'<b>Es el fondo de toda la portada</b> (la primera pantalla). Puede ser <b>foto o video</b>. Consejos: que sea <b>vertical</b> y de buena calidad (llena mejor el celular), con la pareja/protagonista bien visible. La foto la achicamos sola; el video, si lo subís, que sea vertical, de 6 a 15 seg y en MP4 (ideal menos de 40 MB) — nosotros lo optimizamos. Los nombres van encima, así que evitá imágenes muy cargadas en el centro.'},
    frase:{rows:[['Portada',0],['La frase',1],['Eventos',0],['Galería',0]],txt:'<b>Una frase o dedicatoria</b> que aparece en una sección propia, en letra cursiva elegante. Puede ser romántica, un versículo, o algo tuyo. Ej: "Hay un instante en la vida en que se decide caminar juntos para siempre." Si no ponés nada, se saltea esa sección.'},
    eventos:{rows:[['Portada',0],['La frase',0],['Dónde y cuándo',1],['Galería',0]],txt:'<b>El lugar y horario de la ceremonia y la fiesta.</b> Cada uno aparece como una tarjeta con foto, dirección y un botón de "Ver mapa". Completá lo que tengas: si es un solo lugar, dejá el otro vacío.'},
    hospedaje:{rows:[['Eventos',0],['Hospedaje',1],['Dress code',0]],txt:'<b>Los hoteles que recomendás</b> para los invitados que vienen de otra ciudad. Aparece como una sección propia. Poné el nombre, la dirección, la web, el teléfono y el código de descuento si conseguiste uno. Si no cargás ninguno, la sección no aparece.'},
    itinerario:{rows:[['Eventos',0],['Itinerario',1],['Dress code',0]],txt:'<b>El cronograma del día</b>, momento por momento, con la hora. Se muestra como una lista vertical. Ej: "17:00 · Ceremonia". Si lo dejás vacío, la sección no aparece.'},
    dress:{rows:[['Eventos',0],['Dress code',1],['Regalos',0]],txt:'<b>El código de vestimenta.</b> Aparece en su propia sección. Ej: "Elegante", "Formal", "Campestre", "De gala". Podés aclarar algo (ej: "evitar el blanco").'},
    regalos:{rows:[['Dress code',0],['Mesa de regalos',1],['Galería',0]],txt:'<b>Datos para los regalos.</b> Aparece en una sección con un botón. Podés poner el alias/CBU para transferencias, el link de una tienda de regalos, o lo que prefieras. Si no querés mostrarlo, dejalo vacío.'},
    galeria:{rows:[['Frase',0],['Galería',1],['Invitados',0]],txt:'<b>Fotos que se muestran en un carrusel</b> dentro de la invitación. Subí las que quieras (las achicamos solas). Es opcional: si no subís, no aparece la sección.'},
    invitados:{special:'qr',txt:'<b>Cada invitado recibe su propio link + QR.</b> Con eso entran a la invitación con su nombre, y en la puerta escaneás el QR para controlar el ingreso.<br><br><b>Para cargar muchos de una:</b><ul><li>Descargá la <b>plantilla</b> (botón de arriba).</li><li>Completá una fila por invitado con: <b>Nombre</b> (ej: "Familia Pérez"), <b>Personas</b> (cuántos entran, ej: 4) y <b>Mesa</b> (número o nombre).</li><li>Guardá el Excel y subilo con "Subir Excel / CSV". ¡Listo, se cargan todos solos!</li></ul>También podés cargar de a uno a mano.'},
    observaciones:{special:'note',txt:'<b>Contanos cualquier pedido especial</b> que quieras. Ej: "que los nombres sean dorados", "agregar una sección de padrinos", "cambiar la música", "quiero un color distinto". Nuestro equipo lo revisa y lo arma. Si no se puede automático, te avisamos.'},
    contacto:{special:'note',txt:'<b>Tus datos para avisarte</b> cuando la invitación esté lista. El WhatsApp y el email son para contactarte y mandarte el link final.'}
  };
  window.toggleHelp=function(btn){ const box=btn.nextElementSibling; const op=box.classList.toggle('open'); btn.innerHTML=op?'✕ Cerrar':'ℹ️ ¿Qué es y cómo lo completo?'; };
  window.openLB=function(src){ $('lbimg').src=src; $('lbox').classList.add('open'); document.body.style.overflow='hidden'; };
  window.closeLB=function(){ $('lbox').classList.remove('open'); document.body.style.overflow=''; };
  document.addEventListener('keydown',e=>{ if(e.key==='Escape')closeLB(); });
  // Fotos REALES de cada sector, capturadas de una invitación de verdad y alojadas
  // en la Cloudinary de Invítame (oc8cgqt4). Antes había 9 archivos ayuda-*.jpg que
  // nunca se subieron (se veían rotos) y 2 que colgaban de la cuenta de Little Moments.
  const CLD='https://res.cloudinary.com/oc8cgqt4/image/upload/f_auto,q_auto,w_620/invitame/ayuda/';
  const IMGURL={
    tipo:      CLD+'zxvzwxpvokz0lpnposht.jpg',
    kick:      CLD+'zxvzwxpvokz0lpnposht.jpg',
    nombres:   CLD+'zxvzwxpvokz0lpnposht.jpg',
    fecha:     CLD+'zxvzwxpvokz0lpnposht.jpg',
    foto:      CLD+'zxvzwxpvokz0lpnposht.jpg',
    frase:     CLD+'owywct18dlmpaotq5fwq.jpg',
    // Estas dos se habían capturado de una invitación con las secciones VACÍAS, así
    // que el cliente veía dos rectángulos en blanco. Recapturadas con datos reales.
    eventos:   CLD+'ngcyltrduex5f7rfor36.jpg',
    itinerario:CLD+'qhtrg6kolh8o95igmx94.jpg',
    hospedaje: CLD+'s10d7dddrdwlq09dpijq.jpg',
    dress:     CLD+'sceawxxrov6afrnuvokk.jpg',
    galeria:   CLD+'r5oieumem4awipqgxeqg.jpg',
    // Estas dos colgaban de la Cloudinary de Little Moments (dlicangft), no de la de
    // Invítame. Si algún día se limpia esa cuenta, el formulario del cliente queda con
    // dos fotos rotas. Recapturadas y subidas a la cuenta propia (oc8cgqt4).
    regalos:   CLD+'hupaylzmtati1cdskhzu.jpg',
    invitados: CLD+'gsef6mniu001bcpnwy7q.jpg'
  };
  const imgVis=src=>'<img src="'+src+'" alt="" onclick="openLB(this.src)" style="width:100%;height:auto;display:block;border-radius:11px;box-shadow:0 5px 14px rgba(0,0,0,.16);cursor:zoom-in"><span class="zoomtag">🔍 ampliar</span>';
  // Jazmín pidió que se vea la FOTO del sector, no que haya que abrir un desplegable.
  // Ahora la miniatura va siempre visible arriba del campo (se amplía al tocarla) y
  // el texto explicativo queda detrás del botón, para quien lo necesite.
  function injectHelp(){
    document.querySelectorAll('[data-help]').forEach(ph=>{
      const k=ph.getAttribute('data-help'); const h=HELP[k]; if(!h) return;
      const w=document.createElement('div');
      let html='';
      if(IMGURL[k]){
        html+='<div class="sectorfoto">'
            + '<img src="'+IMGURL[k]+'" alt="Así se ve este sector en la invitación" loading="lazy"'
            + ' onclick="openLB(this.src)" onerror="var c=this.closest(\'.sectorfoto\'); if(c)c.remove();">'
            + '<span class="cap">Así se ve en la invitación · tocá para ampliar</span>'
            + '</div>';
      } else if(h.special==='qr' && typeof QRVIS!=='undefined'){
        html+='<div class="helpbox open"><div class="vis">'+QRVIS+'</div></div>';
      }
      html+='<button type="button" class="helpbtn" onclick="toggleHelp(this)">ℹ️ ¿Qué es y cómo lo completo?</button>'
          + '<div class="helpbox"><div class="txt">'+h.txt+'</div></div>';
      w.innerHTML=html;
      ph.replaceWith(w);
    });
  }
  injectHelp();

  // ---- Comprimir imágenes antes de subir (para que la invitación abra rápido) ----
  async function comprimir(file, maxW, q){
    try{ if(!file.type.startsWith('image/')) return file;
      const bmp=await createImageBitmap(file); const sc=Math.min(1, maxW/bmp.width);
      if(sc>=1 && file.size<500000) return file;
      const c=document.createElement('canvas'); c.width=Math.round(bmp.width*sc); c.height=Math.round(bmp.height*sc);
      c.getContext('2d').drawImage(bmp,0,0,c.width,c.height);
      const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',q||0.82));
      return blob?new File([blob],(file.name||'foto').replace(/\.[^.]+$/,'')+'.jpg',{type:'image/jpeg'}):file;
    }catch(e){ return file; }
  }

  // ready() con tope de espera: si firebase-inv.js no cargó (404, caché vieja, red
  // bloqueada) el evento 'inv-ready' no llega nunca y antes el botón quedaba
  // "Enviando… ⏳" para siempre, sin decir nada.
  function ready(){
    if(window.INV&&window.INV.ok) return Promise.resolve();
    return new Promise((res,rej)=>{
      let listo=false;
      window.addEventListener('inv-ready',()=>{listo=true;res();},{once:true});
      const t=setInterval(()=>{ if(window.INV&&window.INV.ok){listo=true;clearInterval(t);res();} },300);
      setTimeout(()=>{ clearInterval(t); if(!listo) rej(new Error('No se pudo conectar con el servidor. Revisá tu internet y volvé a intentar (tus datos quedaron guardados).')); },12000);
    });
  }
  let coverURL='', coverVideoURL='', galURLs=[];

  // subir foto portada
  $('f-cover').addEventListener('change',async e=>{ const f=e.target.files[0]; if(!f)return; $('up-cover').textContent='Subiendo…'; try{ await ready(); coverURL=await window.INV.uploadImage(await comprimir(f,1600,0.85)); $('prev-cover').innerHTML='<img class="prev" src="'+coverURL+'">'; $('up-cover').textContent='✓ Foto cargada — cambiar'; }catch(err){ $('up-cover').textContent='⬆ Subir foto'; alert('No se pudo subir: '+(err.message||err)); } });
  // subir video portada (no se comprime en el navegador; Cloudinary lo optimiza al entregar)
  $('f-covervid').addEventListener('change',async e=>{ const f=e.target.files[0]; if(!f)return; const mb=Math.round(f.size/1048576); if(f.size>80*1024*1024){ if(!confirm('El video pesa '+mb+' MB, puede tardar bastante o fallar. Lo ideal es menos de 40 MB. ¿Subir igual?')) { e.target.value=''; return; } } $('up-covervid').textContent='Subiendo video… ⏳'; try{ await ready(); coverVideoURL=await window.INV.uploadVideo(f); $('prev-cover').innerHTML='<video class="prev" src="'+coverVideoURL+'" muted autoplay loop playsinline></video>'; $('up-covervid').textContent='✓ Video cargado — cambiar'; }catch(err){ $('up-covervid').textContent='🎬 Subir video'; alert('No se pudo subir el video: '+(err.message||err)); } });
  // subir galería
  $('f-gal').addEventListener('change',async e=>{ const fs=[...e.target.files]; if(!fs.length)return; $('up-gal').textContent='Subiendo…'; try{ await ready(); for(const f of fs){ const u=await window.INV.uploadImage(await comprimir(f,1400,0.8)); galURLs.push(u); $('prev-gal').innerHTML+='<img class="prevmini" src="'+u+'">'; } $('up-gal').textContent='⬆ Agregar más fotos'; }catch(err){ $('up-gal').textContent='⬆ Subir fotos de la galería'; alert('No se pudo subir: '+(err.message||err)); } });

  // ---- Invitados por Excel/CSV ----
  window.addGuest=function(n,p,m){ const d=document.createElement('div'); d.className='rowinv'; d.innerHTML='<input type="text" placeholder="Nombre (ej: Familia Pérez)"><input type="text" placeholder="Pers." value="2"><input type="text" placeholder="Mesa"><button class="rmx" type="button">✕</button>'; const ins=d.querySelectorAll('input'); if(typeof n==='string'){ins[0].value=n; if(p)ins[1].value=p; if(m)ins[2].value=m;} d.querySelector('.rmx').onclick=()=>d.remove(); $('guests').appendChild(d); };
  $('f-xls').addEventListener('change',e=>{ const f=e.target.files[0]; if(!f)return; if(typeof XLSX==='undefined'){alert('Esperá unos segundos y volvé a intentar.');return;} const rd=new FileReader(); rd.onload=ev=>{ try{ const wb=XLSX.read(ev.target.result,{type:'array'}); const ws=wb.Sheets[wb.SheetNames[0]]; const rows=XLSX.utils.sheet_to_json(ws,{header:1}); document.querySelectorAll('#guests .rowinv').forEach(r=>{ if(!r.querySelector('input').value.trim())r.remove(); }); let added=0; rows.forEach((r,i)=>{ if(!r||r[0]==null)return; const nom=String(r[0]).trim(); if(!nom)return; if(i===0&&/nombre/i.test(nom))return; addGuest(nom, r[1]!=null?String(r[1]).trim():'', r[2]!=null?String(r[2]).trim():''); added++; }); $('up-xls').textContent='✓ '+added+' invitados cargados'; }catch(err){ alert('No pude leer el archivo. Revisá que tenga las columnas Nombre, Personas, Mesa.'); } }; rd.readAsArrayBuffer(f); });
  $('tpl-xls').addEventListener('click',e=>{ e.preventDefault(); if(typeof XLSX==='undefined')return; const ws=XLSX.utils.aoa_to_sheet([['Nombre','Personas','Mesa'],['Familia Pérez',4,'1'],['Juan y Ana',2,'2'],['Carlos López',1,'3']]); const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Invitados'); XLSX.writeFile(wb,'plantilla-invitados.xlsx'); });

  // invitados: fila inicial vacía
  addGuest();

  // ---- Personas importantes (hasta 9, igual que el formulario viejo) ----
  window.addPersona=function(nombre,rel){
    const cont=$('personas');
    if(cont.querySelectorAll('.rowpers').length>=9) return;
    const d=document.createElement('div'); d.className='rowpers';
    d.innerHTML='<input type="text" placeholder="Nombre y apellido"><input type="text" placeholder="Qué es (mamá, padrino…)"><button class="rmx" type="button">✕</button>';
    const ins=d.querySelectorAll('input');
    if(typeof nombre==='string'){ ins[0].value=nombre; if(rel)ins[1].value=rel; }
    d.querySelector('.rmx').onclick=()=>{ d.remove(); actualizarBotonPersona(); };
    cont.appendChild(d); actualizarBotonPersona();
  };
  function actualizarBotonPersona(){
    const b=$('pers-add'); if(!b) return;
    b.style.display = $('personas').querySelectorAll('.rowpers').length>=9 ? 'none' : '';
  }
  function leerPersonas(){
    return [...$('personas').querySelectorAll('.rowpers')].map(function(r){
      const i=r.querySelectorAll('input');
      return {nombre:i[0].value.trim(), rel:i[1].value.trim(), foto:''};
    }).filter(function(p){ return p.nombre; });
  }

  // ---- Borrador automático ----
  // El formulario tiene 30+ campos. Antes, un refresh o un toque de "atrás" y el
  // cliente perdía TODO. Ahora se guarda solo en el navegador y se ofrece recuperarlo.
  const BORR='inv_borrador_'+(tpl||'x');
  const CAMPOS=['orden','tipo','kick','n1','n2','fecha','frase','ev1t','ev1f','ev1d','ev1maps',
    'ev2t','ev2f','ev2d','ev2maps','ev3t','ev3f','ev3d','ev3maps',
    'hotDesc','hoteles','itinerario','persFrase',
    'dress','regalos','musica','fraseFx','igHashtag','igUser','videoUrl','spotifyUrl','galEstilo',
    'cfFrase','cfMail','cfWsp1','cfWsp1n','cfWsp2','cfWsp2n','fraseFinal','textoFinal',
    'reg_liverpool','reg_amazon','reg_sears','reg_mercadolibre','reg_palacio','reg_venmo','reg_paypal',
    'colorSug','tipoSug','obs','cnom','cwsp','cmail'];
  function guardarBorrador(){
    try{
      const d={_t:Date.now()};
      CAMPOS.forEach(function(k){ const e=$(k); if(e) d[k]=e.value; });
      d._inv=[...document.querySelectorAll('#guests .rowinv')].map(function(r){
        const i=r.querySelectorAll('input'); return [i[0].value,i[1].value,i[2].value]; })
        .filter(function(x){return x[0];});
      d._pers=[...document.querySelectorAll('#personas .rowpers')].map(function(r){
        const i=r.querySelectorAll('input'); return [i[0].value,i[1].value]; })
        .filter(function(x){return x[0];});
      localStorage.setItem(BORR, JSON.stringify(d));
    }catch(e){}
  }
  function borrarBorrador(){ try{ localStorage.removeItem(BORR); }catch(e){} }
  function recuperarBorrador(){
    let d=null; try{ d=JSON.parse(localStorage.getItem(BORR)||'null'); }catch(e){}
    if(!d||!d.n1) return;
    const dias=(Date.now()-(d._t||0))/86400000;
    if(dias>30){ borrarBorrador(); return; }
    if(!confirm('Encontramos lo que habías empezado a cargar. ¿Lo recuperamos?\n\n(Si decís que no, arrancás de cero.)')){ borrarBorrador(); return; }
    CAMPOS.forEach(function(k){ const e=$(k); if(e&&d[k]!=null) e.value=d[k]; });
    if(d.kick) $('kick').dataset.touched='1';
    try{ aplicarTipo(); }catch(e){}
    if(d._inv&&d._inv.length){
      document.getElementById('guests').innerHTML='';
      d._inv.forEach(function(g){ addGuest(); const filas=document.querySelectorAll('#guests .rowinv');
        const i=filas[filas.length-1].querySelectorAll('input'); i[0].value=g[0]||''; i[1].value=g[1]||''; i[2].value=g[2]||''; });
    }
    if(d._pers&&d._pers.length){
      document.getElementById('personas').innerHTML='';
      d._pers.forEach(function(p){ addPersona(p[0]||'', p[1]||''); });
    }
  }
  document.addEventListener('input', function(e){ if(e.target&&e.target.closest('.card,#guests')) guardarBorrador(); });
  document.addEventListener('change', function(e){ if(e.target&&e.target.closest('.card,#guests')) guardarBorrador(); });
  setTimeout(recuperarBorrador, 600);


  /* ===== EL PASE CON VOZ ======================================================
     Graba el mensaje, lo sube a Cloudinary y MIDE LA ONDA acá mismo, con el
     archivo que ya está en memoria. Esos 26 números son los que después dibujan
     las rayitas del boleto en la invitación SIN que el invitado baje el audio.

     ⚠️ Se mide acá y no en la invitación a propósito: si la onda se calculara
        al abrir la invitación, habría que bajar el audio siempre, y se perdería
        el ahorro entero.
     ⚠️ El micrófono sólo anda en https. En http el navegador ni pregunta.
     ⚠️ Cloudinary recibe el audio por el endpoint de VIDEO (uploadVideo). No es
        un error: para Cloudinary el audio es video sin imagen.
     ========================================================================== */
  let pasevozURL='', pasevozOnda='';
  (function(){
    const ABC='0123456789abcdefghijklmnopqrstuvwxyz';
    const btn=$('pv-btn'), otra=$('pv-otra'), est=$('pv-estado'), oir=$('pv-oir');
    if(!btn) return;
    let rec=null, trozos=[], corte=null;

    if(!navigator.mediaDevices||!window.MediaRecorder){
      est.textContent='Este navegador no puede grabar. Se puede mandar el audio por WhatsApp y lo cargamos nosotros.';
      btn.style.opacity='.5'; btn.style.pointerEvents='none'; return;
    }

    /* la onda: 26 picos, normalizados contra el más alto */
    async function medir(blob){
      try{
        const AC=window.AudioContext||window.webkitAudioContext;
        const audio=await new AC().decodeAudioData(await blob.arrayBuffer());
        const d=audio.getChannelData(0), paso=Math.floor(d.length/26)||1, picos=[];
        for(let i=0;i<26;i++){ let m=0; const tope=Math.min(d.length,(i+1)*paso);
          for(let k=i*paso;k<tope;k++){ const v=d[k]<0?-d[k]:d[k]; if(v>m)m=v; }
          picos.push(m); }
        const alto=Math.max(...picos)||1;
        return picos.map(p=>ABC.charAt(Math.max(0,Math.min(35,Math.round(p/alto*35))))).join('');
      }catch(e){ return ''; }   /* sin onda el pase igual anda */
    }

    async function guardar(blob){
      est.textContent='Subiendo el mensaje…';
      try{
        await ready();
        const arch=new File([blob],'pase-voz.webm',{type:blob.type||'audio/webm'});
        const [url,onda]=await Promise.all([window.INV.uploadVideo(arch), medir(blob)]);
        pasevozURL=url; pasevozOnda=onda;
        oir.src=URL.createObjectURL(blob); oir.style.display='block';
        btn.style.display='none'; otra.style.display='block';
        est.textContent='Listo. Escuchalo acá abajo; si no te gusta, grabalo de nuevo.';
      }catch(err){
        pasevozURL=''; pasevozOnda='';
        btn.textContent='Grabar el mensaje';
        est.textContent='No se pudo subir: '+(err.message||err);
      }
    }

    function parar(){
      if(corte){ clearTimeout(corte); corte=null; }
      if(rec && rec.state!=='inactive') rec.stop();
    }

    async function arrancar(){
      try{
        const señal=await navigator.mediaDevices.getUserMedia({audio:true});
        trozos=[]; rec=new MediaRecorder(señal);
        rec.ondataavailable=e=>{ if(e.data && e.data.size) trozos.push(e.data); };
        rec.onstop=()=>{
          señal.getTracks().forEach(t=>t.stop());   /* apaga el micrófono */
          const blob=new Blob(trozos,{type:rec.mimeType||'audio/webm'});
          if(blob.size>1000) guardar(blob);
          else { btn.textContent='Grabar el mensaje'; est.textContent='Quedó muy cortito. Probá de nuevo.'; }
        };
        rec.start();
        btn.textContent='Detener y guardar';
        est.textContent='Grabando… hablá tranquilo.';
        corte=setTimeout(parar,60000);            /* el minuto, solo */
      }catch(e){
        est.textContent='No nos dejó usar el micrófono. Se puede habilitar en los permisos del navegador.';
      }
    }

    btn.onclick=()=>{ if(rec && rec.state==='recording') parar(); else arrancar(); };
    otra.onclick=()=>{
      pasevozURL=''; pasevozOnda='';
      oir.style.display='none'; oir.removeAttribute('src');
      otra.style.display='none'; btn.style.display='block';
      btn.textContent='Grabar el mensaje';
      est.textContent='Hasta 60 segundos. Se graba desde el celular o la computadora.';
    };
  })();

  window.enviar=async function(){
    $('err').style.display='none';
    const n1=$('n1').value.trim(), fecha=$('fecha').value, cnom=$('cnom').value.trim(), cwsp=$('cwsp').value.trim(), cmail=$('cmail').value.trim();
    if(!n1){ return showErr('Poné al menos el primer nombre.'); }
    if(!fecha){ return showErr('Poné la fecha del evento.'); }
    if(!cnom||!cwsp||!cmail){ return showErr('Dejanos tu nombre, WhatsApp y email para poder avisarte.'); }
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(cmail)){ return showErr('Revisá el email, parece que tiene un error.'); }
    const invitados=[...document.querySelectorAll('#guests .rowinv')].map(r=>{const i=r.querySelectorAll('input');return {n:i[0].value.trim(),p:i[1].value.trim()||'1',m:i[2].value.trim()||'-'};}).filter(g=>g.n);
    const data={
      estado:'pendiente', creado:serverTimestamp(),
      tpl, tplNombre:T.n, tipoEvento:$('tipo').value, kick:$('kick').value.trim(),
      n1, n2:$('n2').value.trim(), fecha, frase:$('frase').value.trim(),
      cover:coverURL, coverVideo:coverVideoURL, galeria:galURLs,
      orden:$('orden').value.trim(),
      ev1t:$('ev1t').value.trim(), ev1f:$('ev1f').value.trim(), ev1d:$('ev1d').value.trim(), ev1maps:$('ev1maps').value.trim(),
      ev2t:$('ev2t').value.trim(), ev2f:$('ev2f').value.trim(), ev2d:$('ev2d').value.trim(), ev2maps:$('ev2maps').value.trim(),
      ev3t:$('ev3t').value.trim(), ev3f:$('ev3f').value.trim(), ev3d:$('ev3d').value.trim(), ev3maps:$('ev3maps').value.trim(),
      hotDesc:$('hotDesc').value.trim(), hoteles:$('hoteles').value.trim(),
      itinerario:$('itinerario').value.trim(),
      persFrase:$('persFrase').value.trim(), personas:leerPersonas(),
      galEstilo:$('galEstilo').value, videoUrl:$('videoUrl').value.trim(), igUser:$('igUser').value.trim(),
      cfFrase:$('cfFrase').value.trim(), cfMail:$('cfMail').value.trim(),
      cfWsp1:$('cfWsp1').value.trim(), cfWsp1n:$('cfWsp1n').value.trim(),
      cfWsp2:$('cfWsp2').value.trim(), cfWsp2n:$('cfWsp2n').value.trim(),
      fraseFinal:$('fraseFinal').value.trim(), textoFinal:$('textoFinal').value.trim(),
      colorSug:$('colorSug').value.trim(), tipoSug:$('tipoSug').value.trim(),
      dress:$('dress').value.trim(), regalos:$('regalos').value.trim(), musica:$('musica').value.trim(),
      fraseFx:$('fraseFx').value, igHashtag:$('igHashtag').value.trim(), spotifyUrl:$('spotifyUrl').value.trim(),
      reg_liverpool:$('reg_liverpool').value.trim(), reg_amazon:$('reg_amazon').value.trim(), reg_sears:$('reg_sears').value.trim(),
      reg_mercadolibre:$('reg_mercadolibre').value.trim(), reg_palacio:$('reg_palacio').value.trim(), reg_venmo:$('reg_venmo').value.trim(), reg_paypal:$('reg_paypal').value.trim(),
      invitados, observaciones:$('obs').value.trim(),
      contactoNombre:cnom, contactoWsp:cwsp, contactoEmail:cmail,
      pasevozAudio:pasevozURL, pasevozOnda,
      origen:'formulario-cliente'
    };
    $('loading').style.display='flex'; $('send').disabled=true;
    try{
      await ready();
      const ref=doc(collection(window.INV.db,'inv_solicitudes'));
      await setDoc(ref, data);
      borrarBorrador();
      $('loading').style.display='none';
      $('wrap').style.display='none'; document.querySelector('.top .sub').textContent='¡Gracias!';
      $('done').style.display='block'; window.scrollTo(0,0);
    }catch(err){ $('loading').style.display='none'; $('send').disabled=false; showErr('No se pudo enviar: '+(err.message||err)); }
  };
  function showErr(m){ const e=$('err'); e.textContent=m; e.style.display='block'; e.scrollIntoView({block:'center'}); }
