/* ===== EL FORMULARIO DEL CLIENTE ==============================================
   El script de /crear.html. Rearmado el 15/10/2026 con el documento de Jazmín
   «AJUSTES FORMULARIO» (ver la nota de arriba de crear.html).

   /!\ VA CON type="module": usa import. Si se carga como script normal, no
       arranca y el formulario queda mudo sin ningun error visible.
   /!\ ESTE ARCHIVO NO ESCRIBE LA INVITACIÓN. Escribe una SOLICITUD en
       inv_solicitudes y le pasa el borrador a /solicitud-crear.php, que la
       crea. El mapeo vive en /solicitud-a-evento.js (UNA sola copia, la usa
       también el panel de Jazmín) y el diseño en /vestir.js.
   /!\ SI SE AGREGA UN CAMPO ACÁ, SE AGREGA EN /solicitud-a-evento.js. El chequeo
       `node chequeo/campos.js` (bloque 5) lee el objeto `data` de leerFormulario() y avisa
       «LO LLENA EL CLIENTE Y NO LLEGA AL PANEL».
   ============================================================================ */
  import { collection, doc, setDoc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
  const $=id=>document.getElementById(id);
  const tpl=(new URLSearchParams(location.search).get('tpl')||'').toLowerCase();
  /* ★ 15/10/2026 — EL LINK DE CADA CLIENTE. Jazmín lo copia desde la venta en
     el CRM: `crear.html?f=<código>`. El código apunta a `inv_formularios/<código>`,
     que dice qué paquete compró. Ver «EL PAQUETE QUE COMPRÓ», más abajo. */
  const formToken=((new URLSearchParams(location.search).get('f')||'').match(/^[a-z0-9]{12,40}$/i)||[''])[0];

  // ---- Tipo de evento: el título sugerido y los nombres ----
  const TITDEF={boda:'Nuestra Boda',xv:'Mis XV',bautismo:'Mi Bautizo',comunion:'Mi Primera Comunión',cumple:'Mi Cumpleaños',otro:''};
  function aplicarTipo(){
    const t=$('tipo').value;
    $('kick').placeholder=TITDEF[t]||'Título';
    if(!$('kick').dataset.touched) $('kick').value=TITDEF[t]||'';
    /* «Nombre 2» sólo se esconde en los eventos de UNA persona */
    const solo1=(t==='xv'||t==='bautismo'||t==='comunion'||t==='cumple');
    $('caja-n2').style.display=solo1?'none':'';
    if(solo1) $('n2').value='';
    $('l-n1').firstChild.textContent = solo1 ? 'Nombre ' : 'Nombre 1 ';
    /* las filas de diseños se filtran SÓLO si la persona eligió el tipo a mano:
       el selector viene en «Boda» de entrada y una quinceañera, que ve los
       modelos ANTES que esta pregunta, se quedaría sin ver los de XV */
    if(window.CREAR_DISENO && $('tipo').dataset.tocado) window.CREAR_DISENO.filtrar(t);
  }
  $('tipo').addEventListener('change',()=>{ $('tipo').dataset.tocado='1'; aplicarTipo(); });
  $('kick').addEventListener('input',()=>{$('kick').dataset.touched='1';});
  window.CREAR_TIPO = function(t){ if(t && $('tipo').value!==t){ $('tipo').value=t; aplicarTipo(); guardarBorrador(); } };

  // ================= LA IMAGEN DE AYUDA, UNA POR SECTOR =================
  /* Jazmín, 15/10: «tienen que haber imágenes de una invitación real». Son
     capturas de julia-y-santiago (Bohemia), una por sector, en /formulario/ayuda/.
     Si se cambia la muestra de referencia, se recapturan todas juntas. */
  const AYUDA={
    portada:     'La primera pantalla: tu <b>foto o video</b> de fondo, el <b>título</b> chico, los <b>nombres</b> en grande y la <b>cuenta regresiva</b> a la fecha. La frase aparece justo después.',
    eventos:     'Cada lugar es una tarjeta con su <b>foto</b>, el nombre, la hora, la dirección y los botones <b>Ver mapa</b> y <b>Agendar</b>.',
    hospedaje:   'Una sección con la <b>foto del hotel</b> y el botón <b>Ver hoteles</b>, que despliega los datos que escribas.',
    itinerario:  'El cronograma del día, momento por momento, con la hora.',
    personas:    'Cada persona con su <b>foto</b> redonda, su nombre y qué es para ustedes.',
    vestimenta:  'El código de vestimenta, en su propia sección.',
    regalos:     'Un botón por cada mesa de regalos y, si quieres, los datos para transferencia.',
    confirmacion:'El título, la frase, la fecha límite y el formulario donde cada invitado confirma.',
    galeria:     'Tus fotos, en un carrusel que se pasa con el dedo.',
    cierre:      'El «¡Gracias!» del final, sobre tu foto.'
  };
  window.openLB=function(src){ $('lbimg').src=src; $('lbox').classList.add('open'); document.body.style.overflow='hidden'; };
  window.closeLB=function(){ $('lbox').classList.remove('open'); document.body.style.overflow=''; };
  $('lbox').addEventListener('click',closeLB);
  document.addEventListener('keydown',e=>{ if(e.key==='Escape')closeLB(); });
  document.querySelectorAll('[data-ayuda]').forEach(ph=>{
    const k=ph.getAttribute('data-ayuda'); if(!AYUDA[k]) return;
    const src='/formulario/ayuda/'+k+'.webp?v=2';   /* ⚠️ subir la versión si se recaptura alguna */
    const w=document.createElement('div'); w.className='ayuda';
    w.innerHTML='<div class="ph"><img src="'+src+'" alt="Así se ve en la invitación" loading="lazy"><span>Así se ve · toca</span></div>'+
                '<div class="tx">'+AYUDA[k]+'</div>';
    w.querySelector('.ph').addEventListener('click',()=>openLB(src));
    ph.replaceWith(w);
  });

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

  /* ready() con tope de espera: si firebase-inv.js no cargó, antes el botón
     quedaba "Enviando…" para siempre, sin decir nada. */
  function ready(){
    if(window.INV&&window.INV.ok) return Promise.resolve();
    return new Promise((res,rej)=>{
      let listo=false;
      window.addEventListener('inv-ready',()=>{listo=true;res();},{once:true});
      const t=setInterval(()=>{ if(window.INV&&window.INV.ok){listo=true;clearInterval(t);res();} },300);
      setTimeout(()=>{ clearInterval(t); if(!listo) rej(new Error('No se pudo conectar con el servidor. Revisa tu internet y vuelve a intentar (tus datos quedaron guardados).')); },12000);
    });
  }

  /* ---- LAS FOTOS SUELTAS: una por botón ----
     FOTOS guarda la dirección de cada una. Viajan en la solicitud y también
     en el borrador: si se cierra la página, no hay que volver a subirlas. */
  const FOTOS={cover:'', coverVideo:'', ev1img:'', ev2img:'', ev3img:'', hotelImg:'', cierreImg:''};
  let galURLs=[], inspURLs=[];
  function marcar(btn, url, txt){
    const b=$(btn); if(!b) return;
    if(url){ b.classList.add('ok'); b.textContent='✓ '+txt+' — cambiar'; }
  }
  function subidor(btnId, clave, txtListo, maxW){
    const b=$(btnId); if(!b) return;
    const inp=document.createElement('input'); inp.type='file'; inp.accept='image/*'; inp.style.display='none';
    b.after(inp);
    b.addEventListener('click',()=>inp.click());
    inp.addEventListener('change',async e=>{
      const f=e.target.files[0]; if(!f) return;
      const antes=b.textContent; b.textContent='Subiendo…';
      try{ await ready(); FOTOS[clave]=await window.INV.uploadImage(await comprimir(f,maxW||1400,0.84));
        marcar(btnId, FOTOS[clave], txtListo); guardarBorrador(); }
      catch(err){ b.textContent=antes; alert('No se pudo subir: '+(err.message||err)); }
    });
  }
  subidor('up-ev1','ev1img','Foto cargada',1200);
  subidor('up-ev2','ev2img','Foto cargada',1200);
  subidor('up-ev3','ev3img','Foto cargada',1200);
  subidor('up-hotel','hotelImg','Foto cargada',1200);
  subidor('up-cierre','cierreImg','Foto cargada',1600);

  function pintarCover(){
    if(FOTOS.coverVideo) $('prev-cover').innerHTML='<video class="prev" src="'+FOTOS.coverVideo+'" muted autoplay loop playsinline></video>';
    else if(FOTOS.cover) $('prev-cover').innerHTML='<img class="prev" src="'+FOTOS.cover+'">';
    if(FOTOS.cover){ $('up-cover').classList.add('ok'); $('up-cover').textContent='✓ Foto — cambiar'; }
    if(FOTOS.coverVideo){ $('up-covervid').classList.add('ok'); $('up-covervid').textContent='✓ Video — cambiar'; }
  }
  $('up-cover').addEventListener('click',()=>$('f-cover').click());
  $('up-covervid').addEventListener('click',()=>$('f-covervid').click());
  $('f-cover').addEventListener('change',async e=>{ const f=e.target.files[0]; if(!f)return; $('up-cover').textContent='Subiendo…';
    try{ await ready(); FOTOS.cover=await window.INV.uploadImage(await comprimir(f,1600,0.85)); pintarCover(); guardarBorrador(); }
    catch(err){ $('up-cover').textContent='Subir foto'; alert('No se pudo subir: '+(err.message||err)); } });
  /* el video no se comprime en el navegador; Cloudinary lo optimiza al entregar */
  $('f-covervid').addEventListener('change',async e=>{ const f=e.target.files[0]; if(!f)return; const mb=Math.round(f.size/1048576);
    if(f.size>80*1024*1024){ if(!confirm('El video pesa '+mb+' MB, puede tardar bastante o fallar. Lo ideal es menos de 40 MB. ¿Subir igual?')) { e.target.value=''; return; } }
    $('up-covervid').textContent='Subiendo video…';
    try{ await ready(); FOTOS.coverVideo=await window.INV.uploadVideo(f); pintarCover(); guardarBorrador(); }
    catch(err){ $('up-covervid').textContent='Subir video'; alert('No se pudo subir el video: '+(err.message||err)); } });

  function pintarGaleria(){ $('prev-gal').innerHTML=galURLs.map(u=>'<img class="prevmini" src="'+u+'">').join('');
    if(galURLs.length) $('up-gal').textContent='Agregar más fotos ('+galURLs.length+' cargadas)'; }
  $('up-gal').addEventListener('click',()=>$('f-gal').click());
  $('f-gal').addEventListener('change',async e=>{ const fs=[...e.target.files]; if(!fs.length)return; $('up-gal').textContent='Subiendo…';
    try{ await ready(); for(const f of fs){ galURLs.push(await window.INV.uploadImage(await comprimir(f,1400,0.8))); pintarGaleria(); } guardarBorrador(); }
    catch(err){ pintarGaleria(); if(!galURLs.length) $('up-gal').textContent='Subir fotos de la galería'; alert('No se pudo subir: '+(err.message||err)); } });

  function pintarInsp(){ $('prev-insp').innerHTML=inspURLs.map(u=>'<img class="prevmini" src="'+u+'">').join('');
    if(inspURLs.length) $('up-insp').textContent='Agregar más ('+inspURLs.length+' cargadas)'; }
  $('up-insp').addEventListener('click',()=>$('f-insp').click());
  $('f-insp').addEventListener('change',async e=>{ const fs=[...e.target.files]; if(!fs.length)return; $('up-insp').textContent='Subiendo…';
    try{ await ready(); for(const f of fs){ inspURLs.push(await window.INV.uploadImage(await comprimir(f,1400,0.8))); pintarInsp(); } guardarBorrador(); }
    catch(err){ pintarInsp(); if(!inspURLs.length) $('up-insp').textContent='Subir imágenes de inspiración'; alert('No se pudo subir: '+(err.message||err)); } });

  /* ---- Vestimenta: imágenes de inspiración (hasta 6) ---- */
  let dressInspURLs=[];
  function pintarDressInsp(){ $('prev-dressinsp').innerHTML=dressInspURLs.map(u=>'<img class="prevmini" src="'+u+'">').join('');
    if(dressInspURLs.length) $('up-dressinsp').textContent='Agregar más ('+dressInspURLs.length+' de 6)'; }
  $('up-dressinsp').addEventListener('click',()=>{ if(dressInspURLs.length>=6){ alert('Ya cargaste 6, que es el máximo.'); return; } $('f-dressinsp').click(); });
  $('f-dressinsp').addEventListener('change',async e=>{ const fs=[...e.target.files].slice(0,6-dressInspURLs.length); if(!fs.length)return; $('up-dressinsp').textContent='Subiendo…';
    try{ await ready(); for(const f of fs){ dressInspURLs.push(await window.INV.uploadImage(await comprimir(f,1000,0.82))); pintarDressInsp(); } guardarBorrador(); }
    catch(err){ pintarDressInsp(); if(!dressInspURLs.length) $('up-dressinsp').textContent='Subir imágenes de inspiración'; alert('No se pudo subir: '+(err.message||err)); } });

  /* ---- Vestimenta: colores sugeridos y colores a evitar (hasta 6 cada uno) ----
     Van a `fx.dresscode.colores` y `fx.dresscode.evitar`, que dibuja
     /efectos/dresscode-colores.js y Jazmín ajusta en el panel. */
  const COLORES={si:[], no:[]};
  const COL_SUG={si:['#c9a77c','#7d8a72','#e9e1d3','#6e4b3a'], no:['#ffffff','#000000']};
  function pintarColores(k){
    const cont=$('col-'+k); cont.innerHTML='';
    COLORES[k].forEach((c,i)=>{
      const w=document.createElement('span'); w.className='cc';
      const inp=document.createElement('input'); inp.type='color'; inp.value=c; inp.title='Toca para cambiar el color';
      inp.oninput=()=>{ COLORES[k][i]=inp.value; guardarBorrador(); };
      const x=document.createElement('button'); x.type='button'; x.textContent='✕'; x.title='Quitar';
      x.onclick=()=>{ COLORES[k].splice(i,1); pintarColores(k); guardarBorrador(); };
      w.appendChild(inp); w.appendChild(x); cont.appendChild(w);
    });
    if(COLORES[k].length<6){
      const b=document.createElement('button'); b.type='button'; b.className='mas-col'; b.textContent='+ Agregar color';
      b.onclick=()=>{ COLORES[k].push(COL_SUG[k][COLORES[k].length % COL_SUG[k].length]); pintarColores(k);
        const ins=cont.querySelectorAll('input[type=color]'); const ult=ins[ins.length-1]; if(ult) try{ ult.click(); }catch(_){}
        guardarBorrador(); };
      cont.appendChild(b);
    }
  }
  pintarColores('si'); pintarColores('no');

  // ---- Personas importantes: nombre, qué es y foto (hasta 9) ----
  function addPersona(nombre,rel,foto){
    const cont=$('personas');
    if(cont.querySelectorAll('.rowpers').length>=9) return;
    const d=document.createElement('div'); d.className='rowpers';
    d.innerHTML='<input type="text" placeholder="Nombre"><input class="rel" type="text" placeholder="Qué es (mamá, padrino…)">'+
      '<div class="fp" title="Subir su foto">Foto</div><button class="rmx" type="button">✕</button>'+
      '<input type="file" accept="image/*" style="display:none">';
    const ins=d.querySelectorAll('input[type=text]'), fp=d.querySelector('.fp'), fi=d.querySelector('input[type=file]');
    if(nombre) ins[0].value=nombre; if(rel) ins[1].value=rel;
    function ponerFoto(u){ d.dataset.foto=u||''; if(u){ fp.style.backgroundImage="url('"+u+"')"; fp.textContent=''; } }
    ponerFoto(foto);
    fp.onclick=()=>fi.click();
    fi.onchange=async e=>{ const f=e.target.files[0]; if(!f)return; fp.textContent='…';
      try{ await ready(); ponerFoto(await window.INV.uploadImage(await comprimir(f,600,0.85))); guardarBorrador(); }
      catch(err){ fp.textContent='Foto'; alert('No se pudo subir: '+(err.message||err)); } };
    d.querySelector('.rmx').onclick=()=>{ d.remove(); botonPersona(); guardarBorrador(); };
    cont.appendChild(d); botonPersona();
  }
  function botonPersona(){ $('pers-add').style.display=$('personas').querySelectorAll('.rowpers').length>=9?'none':''; }
  $('pers-add').addEventListener('click',()=>addPersona());
  function leerPersonas(){
    return [...$('personas').querySelectorAll('.rowpers')].map(r=>{
      const i=r.querySelectorAll('input[type=text]');
      return {nombre:i[0].value.trim(), rel:i[1].value.trim(), foto:r.dataset.foto||''};
    }).filter(p=>p.nombre);
  }

  // ---- Mesas de regalos: tienda + link, de cualquier lugar del mundo ----
  function addMesa(n,u){
    const cont=$('mesas');
    if(cont.querySelectorAll('.rowreg').length>=4) return;
    const d=document.createElement('div'); d.className='rowreg';
    d.innerHTML='<input type="text" placeholder="Tienda (ej: Liverpool)"><input class="lk" type="text" placeholder="Pega el link de tu mesa"><button class="rmx" type="button">✕</button>';
    const i=d.querySelectorAll('input'); if(n) i[0].value=n; if(u) i[1].value=u;
    d.querySelector('.rmx').onclick=()=>{ d.remove(); botonMesa(); guardarBorrador(); };
    cont.appendChild(d); botonMesa();
  }
  function botonMesa(){ $('reg-add').style.display=$('mesas').querySelectorAll('.rowreg').length>=4?'none':''; }
  $('reg-add').addEventListener('click',()=>addMesa());
  function leerMesas(){
    return [...$('mesas').querySelectorAll('.rowreg')].map(r=>{ const i=r.querySelectorAll('input');
      return {n:i[0].value.trim(), u:i[1].value.trim()}; }).filter(m=>m.u);
  }

  // ---- Invitados (opcional; también se cargan desde el panel de los novios) ----
  function addGuest(n,p,m){ const d=document.createElement('div'); d.className='rowinv';
    d.innerHTML='<input type="text" placeholder="Nombre (ej: Familia Pérez)"><input type="text" placeholder="Pers." value="2"><input type="text" placeholder="Mesa"><button class="rmx" type="button">✕</button>';
    const ins=d.querySelectorAll('input'); if(typeof n==='string'){ins[0].value=n; if(p)ins[1].value=p; if(m)ins[2].value=m;}
    d.querySelector('.rmx').onclick=()=>{ d.remove(); guardarBorrador(); }; $('guests').appendChild(d); }
  $('guest-add').addEventListener('click',()=>addGuest());
  $('up-xls').addEventListener('click',()=>$('f-xls').click());
  $('f-xls').addEventListener('change',e=>{ const f=e.target.files[0]; if(!f)return; if(typeof XLSX==='undefined'){alert('Espera unos segundos y vuelve a intentar.');return;}
    const rd=new FileReader(); rd.onload=ev=>{ try{ const wb=XLSX.read(ev.target.result,{type:'array'}); const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1});
      document.querySelectorAll('#guests .rowinv').forEach(r=>{ if(!r.querySelector('input').value.trim())r.remove(); });
      let added=0; rows.forEach((r,i)=>{ if(!r||r[0]==null)return; const nom=String(r[0]).trim(); if(!nom)return; if(i===0&&/nombre/i.test(nom))return;
        addGuest(nom, r[1]!=null?String(r[1]).trim():'', r[2]!=null?String(r[2]).trim():''); added++; });
      $('up-xls').textContent='✓ '+added+' invitados cargados'; guardarBorrador(); }
      catch(err){ alert('No pude leer el archivo. Revisa que tenga las columnas Nombre, Personas y Mesa.'); } }; rd.readAsArrayBuffer(f); });
  $('tpl-xls').addEventListener('click',e=>{ e.preventDefault(); if(typeof XLSX==='undefined')return;
    const ws=XLSX.utils.aoa_to_sheet([['Nombre','Personas','Mesa'],['Familia Pérez',4,'1'],['Juan y Ana',2,'2'],['Carlos López',1,'3']]);
    const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'Invitados'); XLSX.writeFile(wb,'plantilla-invitados.xlsx'); });

  // ---- Borrador automático: los textos Y las fotos ya subidas ----
  const BORR='inv_borrador_v2';
  const CAMPOS=['orden','tipo','kick','n1','n2','fecha','frase','ev1t','ev1f','ev1d','ev2t','ev2f','ev2d','ev3t','ev3f','ev3d',
    'ev1maps','ev2maps','ev3maps',
    'hotDesc','hoteles','itinerario','persFrase','dressTitulo','dress','regTitulo','regalos','regClabe','regTitular','regBanco',
    'galTitulo','galFrase',
    'cfTitulo','cfFrase','rsvpLimite','cfMail','cfWsp1','cfWsp1n','cfWsp2','cfWsp2n','fraseFinal','textoFinal',
    'musica','igHashtag','igUser','videoUrl','spotifyUrl','persoTxt','obs','cnom','cwsp','cmail'];
  function restric(){ const r=document.querySelector('input[name=rsvpRestric]:checked'); return !!(r&&r.value==='si'); }
  function galEstilo(){ const r=document.querySelector('input[name=galEstilo]:checked'); return r?r.value:'Slider'; }
  function guardarBorrador(){
    try{
      const d={_t:Date.now(), _fotos:FOTOS, _gal:galURLs, _insp:inspURLs, _restric:restric(),
               _galEstilo:galEstilo(), _dinsp:dressInspURLs, _colSi:COLORES.si, _colNo:COLORES.no};
      CAMPOS.forEach(k=>{ const e=$(k); if(e) d[k]=e.value; });
      d._inv=[...document.querySelectorAll('#guests .rowinv')].map(r=>{ const i=r.querySelectorAll('input'); return [i[0].value,i[1].value,i[2].value]; }).filter(x=>x[0]);
      d._pers=[...document.querySelectorAll('#personas .rowpers')].map(r=>{ const i=r.querySelectorAll('input[type=text]'); return [i[0].value,i[1].value,r.dataset.foto||'']; }).filter(x=>x[0]||x[2]);
      d._mesas=leerMesas().map(m=>[m.n,m.u]);
      localStorage.setItem(BORR, JSON.stringify(d));
    }catch(e){}
  }
  function borrarBorrador(){ try{ localStorage.removeItem(BORR); }catch(e){} }
  function recuperarBorrador(){
    let d=null; try{ d=JSON.parse(localStorage.getItem(BORR)||'null'); }catch(e){}
    if(!d||!(d.n1||d.cmail)) return false;
    if((Date.now()-(d._t||0))/86400000>30){ borrarBorrador(); return false; }
    if(!confirm('Encontramos lo que empezaste a llenar. ¿Lo recuperamos?\n\n(Si dices que no, empiezas de cero.)')){ borrarBorrador(); return false; }
    CAMPOS.forEach(k=>{ const e=$(k); if(e&&d[k]!=null) e.value=d[k]; });
    if(d.kick) $('kick').dataset.touched='1';
    Object.assign(FOTOS, d._fotos||{}); galURLs=d._gal||[]; inspURLs=d._insp||[]; dressInspURLs=d._dinsp||[];
    pintarCover(); pintarGaleria(); pintarInsp(); pintarDressInsp();
    if(d._galEstilo){ const g=document.querySelector('input[name=galEstilo][value="'+d._galEstilo+'"]'); if(g) g.checked=true; }
    COLORES.si=(d._colSi||[]).slice(0,6); COLORES.no=(d._colNo||[]).slice(0,6); pintarColores('si'); pintarColores('no');
    [['up-ev1','ev1img'],['up-ev2','ev2img'],['up-ev3','ev3img'],['up-hotel','hotelImg'],['up-cierre','cierreImg']].forEach(([b,k])=>marcar(b,FOTOS[k],'Foto cargada'));
    if(d._restric){ const s=document.querySelector('input[name=rsvpRestric][value=si]'); if(s) s.checked=true; }
    if(d._inv&&d._inv.length){ $('guests').innerHTML=''; d._inv.forEach(g=>addGuest(g[0]||'',g[1]||'',g[2]||'')); }
    if(d._pers&&d._pers.length){ $('personas').innerHTML=''; d._pers.forEach(p=>addPersona(p[0]||'',p[1]||'',p[2]||'')); }
    if(d._mesas&&d._mesas.length){ $('mesas').innerHTML=''; d._mesas.forEach(m=>addMesa(m[0]||'',m[1]||'')); }
    return true;
  }
  document.addEventListener('input', e=>{ if(e.target&&e.target.closest('.card')) guardarBorrador(); });
  document.addEventListener('change', e=>{ if(e.target&&e.target.closest('.card')) guardarBorrador(); });

  /* arranque: filas iniciales, el borrador si hay, y el tipo */
  addMesa(); addGuest();
  setTimeout(()=>{ recuperarBorrador(); aplicarTipo(); }, 600);
  aplicarTipo();

  /* ===== EL PASE CON VOZ ======================================================
     Graba el mensaje, lo sube a Cloudinary y MIDE LA ONDA acá mismo. Esos 26
     números dibujan las rayitas del boleto SIN que el invitado baje el audio.
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
      est.textContent='Este navegador no puede grabar. Puedes mandarnos el audio por WhatsApp y lo cargamos nosotros.';
      btn.style.opacity='.5'; btn.style.pointerEvents='none'; return;
    }
    async function medir(blob){
      try{
        const AC=window.AudioContext||window.webkitAudioContext;
        const audio=await new AC().decodeAudioData(await blob.arrayBuffer());
        const d=audio.getChannelData(0), paso=Math.floor(d.length/26)||1, picos=[];
        for(let i=0;i<26;i++){ let m=0; const tope=Math.min(d.length,(i+1)*paso);
          for(let k=i*paso;k<tope;k++){ const v=d[k]<0?-d[k]:d[k]; if(v>m)m=v; } picos.push(m); }
        const alto=Math.max(...picos)||1;
        return picos.map(p=>ABC.charAt(Math.max(0,Math.min(35,Math.round(p/alto*35))))).join('');
      }catch(e){ return ''; }
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
        est.textContent='Listo. Escúchalo aquí abajo; si no te gusta, grábalo de nuevo.';
      }catch(err){ pasevozURL=''; pasevozOnda=''; btn.textContent='Grabar el mensaje'; est.textContent='No se pudo subir: '+(err.message||err); }
    }
    function parar(){ if(corte){ clearTimeout(corte); corte=null; } if(rec && rec.state!=='inactive') rec.stop(); }
    async function arrancar(){
      try{
        const senal=await navigator.mediaDevices.getUserMedia({audio:true});
        trozos=[]; rec=new MediaRecorder(senal);
        rec.ondataavailable=e=>{ if(e.data && e.data.size) trozos.push(e.data); };
        rec.onstop=()=>{ senal.getTracks().forEach(t=>t.stop());
          const blob=new Blob(trozos,{type:rec.mimeType||'audio/webm'});
          if(blob.size>1000) guardar(blob); else { btn.textContent='Grabar el mensaje'; est.textContent='Quedó muy cortito. Prueba de nuevo.'; } };
        rec.start(); btn.textContent='Detener y guardar'; est.textContent='Grabando… habla tranquilo.';
        corte=setTimeout(parar,60000);
      }catch(e){ est.textContent='No nos dejó usar el micrófono. Puedes habilitarlo en los permisos del navegador.'; }
    }
    btn.onclick=()=>{ if(rec && rec.state==='recording') parar(); else arrancar(); };
    otra.onclick=()=>{ pasevozURL=''; pasevozOnda=''; oir.style.display='none'; oir.removeAttribute('src');
      otra.style.display='none'; btn.style.display='block'; btn.textContent='Grabar el mensaje';
      est.textContent='Hasta 60 segundos. Se graba desde el celular o la computadora.'; };
  })();

  /* ===== LEER EL FORMULARIO ENTERO ==========================================
     Lo usan el envío Y la vista previa en vivo: una sola lectura, dos usos.
     ⚠️ ACÁ SE LEE EL VALOR, NO EL CASILLERO ($('n1').value, nunca `n1` suelto). */
  function leerFormulario(){
    const invitados=[...document.querySelectorAll('#guests .rowinv')].map(r=>{const i=r.querySelectorAll('input');return {n:i[0].value.trim(),p:i[1].value.trim()||'1',m:i[2].value.trim()||'-'};}).filter(g=>g.n);
    const elegido=(window.CREAR_DISENO && window.CREAR_DISENO.elegido()) || tpl || '';
    const M=window.muestraDe?window.muestraDe(elegido):null;
    const data={
      estado:'pendiente', creado:serverTimestamp(),
      tpl:elegido, tplNombre:(elegido==='personalizado'?'Diseño personalizado':(M?M.nombre:'')),
      tipoEvento:$('tipo').value, orden:$('orden').value.trim(),
      kick:$('kick').value.trim(), n1:$('n1').value.trim(), n2:$('n2').value.trim(), fecha:$('fecha').value, frase:$('frase').value.trim(),
      cover:FOTOS.cover, coverVideo:FOTOS.coverVideo, galeria:galURLs,
      galTitulo:$('galTitulo').value.trim(), galFrase:$('galFrase').value.trim(), galEstilo:galEstilo(),
      ev1t:$('ev1t').value.trim(), ev1f:$('ev1f').value.trim(), ev1d:$('ev1d').value.trim(), ev1img:FOTOS.ev1img, ev1maps:$('ev1maps').value.trim(),
      ev2t:$('ev2t').value.trim(), ev2f:$('ev2f').value.trim(), ev2d:$('ev2d').value.trim(), ev2img:FOTOS.ev2img, ev2maps:$('ev2maps').value.trim(),
      ev3t:$('ev3t').value.trim(), ev3f:$('ev3f').value.trim(), ev3d:$('ev3d').value.trim(), ev3img:FOTOS.ev3img, ev3maps:$('ev3maps').value.trim(),
      hotDesc:$('hotDesc').value.trim(), hoteles:$('hoteles').value.trim(), hotelImg:FOTOS.hotelImg,
      itinerario:$('itinerario').value.trim(),
      persFrase:$('persFrase').value.trim(), personas:leerPersonas(),
      dressTitulo:$('dressTitulo').value.trim(), dress:$('dress').value.trim(),
      dressColores:COLORES.si.slice(0,6), dressEvitar:COLORES.no.slice(0,6), dressInsp:dressInspURLs.slice(0,6),
      regTitulo:$('regTitulo').value.trim(), regalos:$('regalos').value.trim(), regLinks:leerMesas(),
      regClabe:$('regClabe').value.trim(), regTitular:$('regTitular').value.trim(), regBanco:$('regBanco').value.trim(),
      cfTitulo:$('cfTitulo').value.trim(), cfFrase:$('cfFrase').value.trim(),
      rsvpLimite:$('rsvpLimite').value, rsvpRestricciones:restric(),
      cfMail:$('cfMail').value.trim(),
      cfWsp1:$('cfWsp1').value.trim(), cfWsp1n:$('cfWsp1n').value.trim(),
      cfWsp2:$('cfWsp2').value.trim(), cfWsp2n:$('cfWsp2n').value.trim(),
      cierreImg:FOTOS.cierreImg, fraseFinal:$('fraseFinal').value.trim(), textoFinal:$('textoFinal').value.trim(),
      /* ⚠️ «Música de fondo» va a `musicaUrl`, NO a `musica` (17/9/2026):
         `musica` es el TEXTO que se muestra abajo de la playlist. */
      musicaUrl:$('musica').value.trim(),
      igHashtag:$('igHashtag').value.trim(), igUser:$('igUser').value.trim(), videoUrl:$('videoUrl').value.trim(), spotifyUrl:$('spotifyUrl').value.trim(),
      personalizado:(elegido==='personalizado'?$('persoTxt').value.trim():''), inspiracion:(elegido==='personalizado'?inspURLs:[]),
      invitados, observaciones:$('obs').value.trim(),
      contactoNombre:$('cnom').value.trim(), contactoWsp:$('cwsp').value.trim(), contactoEmail:$('cmail').value.trim(),
      pasevozAudio:pasevozURL, pasevozOnda,
      formToken:formToken,
      origen:'formulario-cliente'
    };
    return data;
  }

  /* lo que este archivo le presta a /crear-diseno.js */
  window.CREAR = { leerFormulario: leerFormulario, guardarBorrador: guardarBorrador };

  /* ===== EL PAQUETE QUE COMPRÓ (15/10/2026) ==================================
     Maki: «el formulario se achica, depende de lo contratado».
     Con `?f=<código>` se lee `inv_formularios/<código>` (lo crea Jazmín desde la
     venta en el CRM) y se esconden las partes que el paquete no trae. Sin
     código, el formulario sale completo, como siempre.
     ⚠️ ESTO ES SÓLO LA PANTALLA. Qué se prende de verdad lo decide el SERVIDOR
        (/solicitud-crear.php) leyendo el mismo documento: el navegador no
        puede regalarse nada aunque toque el link.
     ⚠️ La tabla de qué trae cada paquete vive en /paquetes.js y no se copia. */
  const NOMBRE_PAQ={estandar:'Estándar', premium:'Premium', platinum:'Platinum'};
  (async function(){
    if(!formToken) return;
    try{
      await ready();
      const s=await getDoc(doc(window.INV.db,'inv_formularios',formToken));
      if(!s.exists()) return;
      const f=s.data()||{}; const plan=f.paquete;
      const P=window.INVPAQUETES; if(!P||!P.PAQUETES[plan]) return;
      const tiene=k=>P.tiene(plan,k,f.extras||[]);
      document.querySelectorAll('[data-funcion]').forEach(el=>{
        if(!tiene(el.getAttribute('data-funcion'))) el.remove();
      });
      const box=$('paq');
      box.innerHTML='Tu paquete: <b>'+NOMBRE_PAQ[plan]+'</b>. Te mostramos sólo lo que incluye.';
      box.style.display='block';
      if(f.clave && !$('orden').value) $('orden').value=f.clave;
      const tip=String(f.tipoEvento||'').toLowerCase();
      if(['boda','xv'].indexOf(tip)>-1 && window.CREAR_TIPO) window.CREAR_TIPO(tip);
    }catch(e){ console.warn('no se pudo leer el paquete', e); }
  })();

  /* ===== ANTI-ROBOTS (6/10/2026) — ver /anti-robot-lib.php ===== */
  const AR = { t0: Date.now(), token: '', activo: false };
  fetch('/anti-robot.php', { cache: 'no-store' }).then(r => r.json()).then(j => {
    if (!j || !j.sitekey) return;
    AR.activo = true;
    window.__ivTurnstile = function () {
      try {
        window.turnstile.render('#robot', { sitekey: j.sitekey, language: 'es', theme: 'light',
          callback: function (tk) { AR.token = tk; },
          'expired-callback': function () { AR.token = ''; },
          'error-callback': function () { AR.token = ''; } });
      } catch (e) { AR.activo = false; }
    };
    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=__ivTurnstile';
    s.async = true; s.onerror = function () { AR.activo = false; };
    document.head.appendChild(s);
  }).catch(() => {});

  function showErr(m, campo){ const e=$('err'); e.textContent=m; e.style.display='block';
    const c=campo&&$(campo); (c||e).scrollIntoView({block:'center'}); if(c) try{c.focus();}catch(_){} }

  async function enviar(){
    $('err').style.display='none';
    const elegido=window.CREAR_DISENO && window.CREAR_DISENO.elegido();
    if(!elegido){ return showErr('Elige el modelo de tu invitación (arriba de todo).'); }
    if(!$('cmail').value.trim()) return showErr('Déjanos tu correo para poder avisarte.','cmail');
    if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test($('cmail').value.trim())) return showErr('Revisa el correo, parece que tiene un error.','cmail');
    if(!$('cnom').value.trim()) return showErr('Déjanos tu nombre.','cnom');
    if(!$('cwsp').value.trim()) return showErr('Déjanos tu WhatsApp para poder avisarte.','cwsp');
    if(!$('n1').value.trim()) return showErr('Pon al menos el primer nombre.','n1');
    if(!$('fecha').value) return showErr('Pon la fecha y hora del evento.','fecha');
    if(AR.activo && !AR.token){ return showErr('Un segundo: estamos comprobando que no seas un robot. Vuelve a tocar «Enviar» en unos segundos.'); }
    const trampa = (($('sitio_web')||{}).value||'').trim();
    const segundos = (Date.now()-AR.t0)/1000;
    if(trampa || segundos < 4){
      /* Un programa: se le muestra el «¡Gracias!» y no se guarda nada. */
      $('wrap').style.display='none'; document.querySelector('.top .sub').textContent='¡Gracias!';
      $('done').style.display='block'; window.scrollTo(0,0); return;
    }
    const data = leerFormulario();
    $('loading').style.display='flex'; $('send').disabled=true;
    try{
      await ready();
      const ref=doc(collection(window.INV.db,'inv_solicitudes'));
      await setDoc(ref, data);

      /* ===== Y LA INVITACIÓN SE CREA SOLA  (8/9/2026) =====================
         El mapeo es el MISMO que usa el panel (/solicitud-a-evento.js) y el
         vestido es el de la muestra elegida (/vestir.js).
         ⚠️ SI ESTO FALLA, EL CLIENTE NO PIERDE NADA: la solicitud ya quedó
            guardada arriba y el equipo la arma desde el panel. */
      try{
        if(window.SOLICITUD_A_EVENTO){
          const evento = window.SOLICITUD_A_EVENTO.mapear(data, {});
          /* ⚠️ AHORA SE ESPERA A LA MUESTRA. Antes, si el diseño no había
             terminado de bajar, la invitación nacía con el vestido de fábrica
             sin que nadie se enterara. */
          if(window.CREAR_DISENO) await window.CREAR_DISENO.vestirLoQueSeManda(evento, data);
          const r = await fetch('/solicitud-crear.php', {
            method:'POST', headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ evento, solicId: ref.id, antiRobot: { trampa: trampa, segundos: segundos, turnstile: AR.token }, marca: (new URLSearchParams(location.search).get('marca')||'invitame') })
          });
          const j = await r.json().catch(()=>({}));
          window.__creada = j;
          if(!j.ok) console.warn('no se pudo crear la invitacion sola:', j.error||r.status);
          if(j.ok && j.estado==='entregada' && j.link) window.__entregada = j;
        }
      }catch(e){ console.warn('no se pudo crear la invitacion sola:', e); }

      borrarBorrador();
      try{ localStorage.removeItem('inv_diseno_elegido'); }catch(e){}
      $('loading').style.display='none';
      $('wrap').style.display='none'; document.querySelector('.top .sub').textContent='¡Gracias!';
      const fono=document.getElementById('dis-fono'), ver=document.getElementById('dis-ver');
      if(fono) fono.remove(); if(ver) ver.remove();
      const _e = window.__entregada, _t = $('done-txt');
      if(_e && _t){
        _t.innerHTML = 'Tu invitación ya está lista.<br><br>'
          + '<b>Link para compartir con tus invitados</b><br>'
          + '<a href="'+_e.link+'" target="_blank" style="color:var(--rosa);word-break:break-all">'+_e.link+'</a>'
          + (_e.panel ? '<br><br><b>Tu panel</b>, para cargar invitados, acomodar las mesas y el itinerario<br>'
              + '<a href="'+_e.panel.url+'" target="_blank" style="color:var(--rosa);word-break:break-all">'+_e.panel.url+'</a>'
              + '<br>Clave: <b>'+_e.panel.clave+'</b>' : '')
          + '<br><br>Te lo mandamos también por WhatsApp.';
      }
      $('done').style.display='block'; window.scrollTo(0,0);
    }catch(err){ $('loading').style.display='none'; $('send').disabled=false; showErr('No se pudo enviar: '+(err.message||err)); }
  }
  $('send').addEventListener('click', enviar);
