/* ===== ADMIN DE INVÍTAME · parte 3 de 4 · el evento: cargar, guardar y publicar =========================

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
  function invitadosHtml(){
    return '<div class="stat"><div class="b"><div class="n" id="st-inv">0</div><div class="l">Invitados</div></div><div class="b"><div class="n" id="st-per">0</div><div class="l">Personas</div></div></div>'+
      '<div class="addrow"><div class="f"><label>Nombre</label><input type="text" id="gname" placeholder="Familia Pérez"></div><div class="f" style="max-width:70px"><label>Pers.</label><input type="text" id="gper" value="2"></div><div class="f" style="max-width:70px"><label>Mesa</label><input type="text" id="gmesa" value="1"></div><button class="addbtn" onclick="addGuest()">+ Agregar</button></div>'+
      '<div style="margin-top:10px"><button class="addbtn" style="background:var(--uva)" onclick="verMesas()">🍽 Gestión de mesas (arrastrar)</button></div>'+
      '<div style="margin-top:8px"><button class="addbtn" style="background:#5b8ac9" onclick="traerMesasDeLosNovios()">⬇ Traer las mesas que armaron los novios</button>'+
      '<div class="hint">Si les diste clave de panel, ellos arman sus mesas desde el celular. Esto las baja acá.</div></div>'+
      '<div class="mejoras" style="margin-top:14px"><div class="h">📄 Carga masiva por Excel</div>'+
      '<div class="hint" style="margin-bottom:8px">1) Descargá la plantilla · 2) Completala en Excel (una fila por invitado) · 3) Subila acá: se cargan todos y cada uno recibe su link único.</div>'+
      '<button class="addbtn" style="background:#5a5a58;margin-right:6px" onclick="descargarPlantilla()">⬇ Descargar plantilla</button>'+
      '<label class="addbtn" style="display:inline-block;cursor:pointer">⬆ Subir Excel/CSV completado<input type="file" accept=".csv,.xlsx,.xls" style="display:none" onchange="importarArchivo(this)"></label>'+
      '<div style="margin-top:10px"><button class="lnk" onclick="tcsv()">▾ …o pegar la lista a mano</button><div id="csvbox" style="display:none;margin-top:8px"><textarea id="csv" rows="4" placeholder="Familia Pérez,4,3"></textarea><div class="hint">Un renglón por invitado: nombre,personas,mesa</div><button class="addbtn" style="margin-top:6px" onclick="impcsv()">Importar</button></div></div>'+
      '<div style="margin-top:10px"><button class="addbtn" style="background:var(--uva)" onclick="exportarLinks()">⬇ Exportar todos los links</button></div>'+
      '</div>'+
      '<div class="hint">Cada invitado recibe su link único + QR automáticamente.</div><div id="guests" style="margin-top:12px"></div>';
  }

  // ==== PERSONAS IMPORTANTES (hasta 12) ====
  function personasHtml(){
    return '<div class="mejoras"><div class="h">👑 Personas importantes (hasta 12)</div>'+
      '<div class="hint" style="margin-bottom:8px">Padres, padrinos, testigos, damas, caballeros… Cargá foto, nombre y relación. Aparecen en la sección de la invitación.</div>'+
      '<div id="pers-list"></div>'+
      '<button class="addbtn" id="pers-add" style="margin-top:8px" onclick="addPersona()">+ Agregar persona</button>'+
      '</div>';
  }
  function renderPersonas(){
    if(!Array.isArray(D.personas))D.personas=[];
    const cont=el('pers-list'); if(!cont)return;
    cont.innerHTML=D.personas.map((p,i)=>{
      const foto=p.foto?'<img src="'+p.foto+'" style="width:52px;height:52px;border-radius:50%;object-fit:cover">':'<div style="width:52px;height:52px;border-radius:50%;background:#e7dfd2;display:flex;align-items:center;justify-content:center;color:#9a8">📷</div>';
      return '<div class="guest" style="align-items:center;gap:10px">'+foto+
        '<div style="flex:1;display:flex;flex-direction:column;gap:6px">'+
        '<input type="text" placeholder="Nombre" value="'+(p.nombre||'').replace(/"/g,'&quot;')+'" oninput="setPersona('+i+',\'nombre\',this.value)">'+
        '<input type="text" placeholder="Relación (ej: Mamá de la novia)" value="'+(p.rel||'').replace(/"/g,'&quot;')+'" oninput="setPersona('+i+',\'rel\',this.value)">'+
        '<label class="lnk" style="cursor:pointer;color:#6D1233">⬆ '+(p.foto?'Cambiar foto':'Subir foto')+'<input type="file" accept="image/*" style="display:none" onchange="subirImgPersona(this,'+i+')"></label>'+
        '</div>'+
        '<span class="x" onclick="delPersona('+i+')">✕</span></div>';
    }).join('')||'<div class="hint">Todavía no agregaste personas. (Si no cargás ninguna, la invitación muestra el diseño por defecto.)</div>';
    const add=el('pers-add'); if(add)add.style.display=D.personas.length>=12?'none':'';
  }
  function addPersona(){if(!Array.isArray(D.personas))D.personas=[];if(D.personas.length>=12)return;D.personas.push({nombre:'',rel:'',foto:''});renderPersonas();}
  function delPersona(i){D.personas.splice(i,1);renderPersonas();}
  function setPersona(i,k,v){if(D.personas[i]){D.personas[i][k]=v;}}
  async function subirImgPersona(input,i){
    const f=input.files&&input.files[0]; if(!f)return;
    if(!window.INV||!INV.uploadImage){alert('Todavía no cargó la base. Esperá 2 seg.');return;}
    const lbl=input.parentElement; const prev=lbl?lbl.firstChild.textContent:'';
    if(lbl)lbl.childNodes[0].textContent='⏳ Subiendo…';
    try{const url=await INV.uploadImage(f); if(D.personas[i])D.personas[i].foto=url; renderPersonas();
      if(typeof postPreview==='function') postPreview();}
    catch(e){alert('No pude subir la foto. Probá de nuevo.'); if(lbl)lbl.childNodes[0].textContent=prev;}
  }

  let cur="PRINCIPAL";
  function buildTabs(){el('tabs').innerHTML=ORDER.map(t=>'<div class="tab '+(t===cur?'on':'')+(t==='INVITADOS'||t==='EFECTOS'?' nuevo':'')+'" onclick="go(\''+t+'\')">'+(t==='INVITADOS'?'INVITADOS ✦':t==='EFECTOS'?'✨ EFECTOS':t)+'</div>').join('');}
  // Cada pestaña edita principalmente una sección de la invitación.
  // Al cambiar de pestaña, scrolleamos el preview a esa sección para que
  // la diseñadora VEA lo que está tocando (antes el preview se quedaba en la portada).
  const TAB2SEC={PRINCIPAL:'',LUGAR_VEST:'eventos',GALERIA_INSTA_VID:'galeria',PERSONAS:'padres',REGALOS:'regalos','CONFIRMACIÓN':'confirmacion',MUSIC_PASES:'spotify',AVANZADO:'',TRIVIA:'trivia',EFECTOS:'',INVITADOS:''};
  function scrollPreviewTo(sec){
    const fr=el('pv-frame'); if(!fr||!fr.contentDocument)return;
    try{
      const doc=fr.contentDocument, scr=fr.parentElement;
      // Agrandamos el iframe a la altura de su contenido para que el "celular"
      // (.screen, overflow-y:auto) pueda scrollearlo. La invitación ya neutralizó
      // el 100vh en modo preview, así que la altura es estable.
      const h=Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
      fr.style.height=h+'px';
      setTimeout(function(){
        try{
          if(!sec){ scr.scrollTop=0; return; }
          const target=[].slice.call(doc.querySelectorAll('[data-sec="'+sec+'"]'))
                        .find(function(e){return e.querySelector('h2,h3');}) || doc.querySelector('[data-sec="'+sec+'"]');
          if(target){
            const rt=target.getBoundingClientRect(), rs=scr.getBoundingClientRect();
            scr.scrollTop = scr.scrollTop + (rt.top - rs.top) - 6;
          }
        }catch(e){}
      },140);
    }catch(e){}
  }
  function go(t){cur=t;buildTabs();renderPanel(); setTimeout(function(){ scrollPreviewTo(TAB2SEC[t]); },250);}

  // La previsualización sigue al CAMPO, no sólo a la pestaña.
  // Antes, en LUGAR_VEST la vista previa quedaba clavada en "Los eventos": si la
  // diseñadora cargaba hoteles, itinerario o vestimenta, el cambio pasaba abajo,
  // fuera de lo que se ve, y parecía que no se reflejaba nada.
  const PALABRA2SEC=[
    [/hotel|hosped|aloja/i,        'hospedaje'],
    [/itinerar/i,                  'itinerario'],
    [/vestimenta|dress/i,          'dresscode'],
    [/ceremonia|evento|donde y cuando|d[óo]nde/i,'eventos'],
    [/galer|foto.*men[úu]|instagram|hashtag/i,'galeria'],
    [/persona|padres|padrin/i,     'padres'],
    [/regalo|mesa|transferen|banc/i,'regalos'],
    [/confirm|rsvp|asistencia/i,   'confirmacion'],
    [/trivia|pregunt/i,            'trivia'],
    [/spotify|playlist|m[úu]sica/i,'spotify'],
    [/video/i,                     'video'],
    [/frase larga/i,               'frase'],
    [/carta/i,                     'carta']
  ];
  function secDeCampo(nodo){
    var grp=nodo&&nodo.closest?nodo.closest('.grp,.campo,label'):null;
    var txt='';
    if(grp){ var lb=grp.querySelector('label'); txt=(lb?lb.textContent:grp.textContent)||''; }
    if(!txt && nodo && nodo.id) txt=nodo.id.replace(/^f-/,'').replace(/-/g,' ');
    for(var i=0;i<PALABRA2SEC.length;i++){ if(PALABRA2SEC[i][0].test(txt)) return PALABRA2SEC[i][1]; }
    return null;
  }
  let _ultimaSec=null;
  function seguirCampo(e){
    var s=secDeCampo(e.target);
    if(!s || s===_ultimaSec) return;
    _ultimaSec=s; scrollPreviewTo(s);
  }
  document.addEventListener('focusin', seguirCampo);
  document.addEventListener('input', function(e){ setTimeout(function(){ seguirCampo(e); }, 350); });
  function renderPanel(){
    if(cur==='INVITADOS'){el('panel').innerHTML=invitadosHtml();renderGuests();return;}
    if(cur==='EFECTOS'){el('panel').innerHTML=efectosHtml();return;}
    let h=(cur==='PRINCIPAL'?mejorasHtml():cur==='TRIVIA'?triviaHtml():cur==='GALERIA_INSTA_VID'?galeriaHtml():cur==='PERSONAS'?personasHtml():'');
    h+=FIELDS[cur].map(fieldHtml).join('');
    el('panel').innerHTML=h;
    if(cur==='PRINCIPAL'){buildTemas();el('mf-nfont').value=D.nfont;sincronizarVersionPreview();render();}
    if(cur==='PERSONAS'){renderPersonas();}
  }
  function actualizarVersion(){
    if(!confirm('Esta invitación se va a actualizar al diseño más nuevo ('+VERSION+').\n\n'
      +'Puede cambiar cómo se ve. Si ya se la enviaste a los invitados, revisala después de actualizar.\n\n¿Actualizamos?'))return;
    D.ver=VERSION; _pvVer=null; sincronizarVersionPreview(); go('PRINCIPAL');
    alert('Listo. Acordate de tocar "Guardar y publicar" para que quede.');
  }
  function buildTemas(){const c=el('temas');if(!c)return;c.innerHTML=Object.entries(TEMAS).map(([k,t])=>'<div class="tema '+(k===D.tema?'on':'')+'" onclick="setTema(\''+k+'\')"><div class="sw" style="background:'+t.sw+'"></div><div class="nm">'+t.n+'</div></div>').join('');}
  function setTema(k){D.tema=k;const t=TEMAS[k];D.color=t.v;D.nfont=t.fS;D.fTit=t.fD;buildTemas();const mf=el('mf-nfont');if(mf)mf.value=t.fS;render();}
  function setB(k,v){D[k]=v;render();}

  // ==== Editor de foto: arrastrar para mover + zoom (tipo Instagram) ====
  let edOn=false,edX=0,edY=0;
  function edPt(e){const t=e.touches&&e.touches[0];return t?{x:t.clientX,y:t.clientY}:{x:e.clientX,y:e.clientY};}
  function edStart(e){e.preventDefault();edOn=true;const p=edPt(e);edX=p.x;edY=p.y;
    document.addEventListener('mousemove',edMove);document.addEventListener('mouseup',edEnd);
    document.addEventListener('touchmove',edMove,{passive:false});document.addEventListener('touchend',edEnd);}
  function edMove(e){if(!edOn)return;e.preventDefault();const p=edPt(e),w=el('imgedit').offsetWidth||220,h=el('imgedit').offsetHeight||130;
    D.cx=Math.max(0,Math.min(100,D.cx-(p.x-edX)/w*80));
    D.cy=Math.max(0,Math.min(100,D.cy-(p.y-edY)/h*80));
    edX=p.x;edY=p.y;render();}
  function edEnd(){edOn=false;document.removeEventListener('mousemove',edMove);document.removeEventListener('mouseup',edEnd);
    document.removeEventListener('touchmove',edMove);document.removeEventListener('touchend',edEnd);}

  // ==== Subir foto propia a Cloudinary ====
  // Revisa si una foto sirve como FONDO a pantalla completa. Una foto muy alta y
  // angosta (por ejemplo la captura larga de una pantalla) se recorta y queda a la
  // vista solo una tira del medio; una casi blanca desaparece bajo el velo oscuro.
  function avisarFotoFondo(url,id){
    const caja=el('prev-'+id); if(!caja)return;
    const previo=caja.querySelector('.avisoFoto'); if(previo)previo.remove();
    const img=new Image(); img.crossOrigin='anonymous';
    img.onload=function(){
      const alto=img.naturalHeight/img.naturalWidth; let msg='';
      if(alto>1.5) msg='Esta foto es muy alta y angosta ('+img.naturalWidth+'&times;'+img.naturalHeight+'). En esta franja se va a ver <b>solo una tira del medio</b>. Para que se luzca, sub&iacute; una foto <b>horizontal</b> (apaisada).';
      if(!msg){
        try{
          const c=document.createElement('canvas'); c.width=40; c.height=40;
          const x=c.getContext('2d'); x.drawImage(img,0,0,40,40);
          const d=x.getImageData(0,0,40,40).data;
          let suma=0,n=0;
          for(let i=0;i<d.length;i+=4){ suma+=(d[i]+d[i+1]+d[i+2])/3; n++; }
          const prom=suma/n; let dif=0;
          for(let i=0;i<d.length;i+=4){ dif+=Math.abs((d[i]+d[i+1]+d[i+2])/3-prom); }
          if(prom>222 && dif/n<16) msg='Esta foto es casi toda blanca y sin contraste. Encima lleva un velo oscuro para que se lea la frase, as&iacute; que va a verse como <b>un gris parejo</b>. Sub&iacute; una foto con m&aacute;s color.';
        }catch(e){}
      }
      if(!msg) return;
      const av=document.createElement('div');
      av.className='avisoFoto';
      av.style.cssText='margin-top:6px;padding:8px 10px;border-radius:8px;background:#FFF4E5;border:1px solid #F0C48A;color:#7A4A00;font-size:12px;line-height:1.45';
      av.innerHTML='⚠️ '+msg;
      caja.appendChild(av);
    };
    img.src=url;
  }
  async function subirImg(input,key,id){
    const f=input.files&&input.files[0]; if(!f)return;
    if(!window.INV||!INV.uploadImage){alert('Todavía no cargó la base. Esperá 2 seg.');return;}
    const box=input.previousElementSibling; const prev=box?box.textContent:'';
    if(box)box.textContent='Subiendo… ⏳';
    try{const url=await INV.uploadImage(f); D[key]=url;
      if(box)box.textContent='✓ Imagen subida (tocá para cambiar)';
      const p=el('prev-'+id); if(p)p.innerHTML='<img src="'+url+'" style="max-height:60px;border-radius:8px;margin-top:6px">';
      if(/fondo/i.test(key)) avisarFotoFondo(url,id);
      // La vista previa NO se refrescaba al subir una foto: la diseñadora cargaba la
      // imagen y seguía viendo la de antes ("elijo la foto y no se aplica").
      if(typeof postPreview==='function') postPreview();
    }catch(e){console.error(e); if(box)box.textContent=prev||'⬆ Subir imagen'; alert('No se pudo subir: '+(e.message||e));}
    input.value='';
  }
  function cargarFontCustom(val,target){
    val=(val||'').trim(); if(!val)return;
    let fam=val; const m=val.match(/family=([^:&]+)/i); if(m)fam=decodeURIComponent(m[1].replace(/\+/g,' '));
    fam=fam.replace(/["']/g,'').trim(); if(!fam)return;
    const gid2='gf-'+fam.replace(/[^a-z0-9]/gi,'');
    if(!document.getElementById(gid2)){const lk=document.createElement('link');lk.id=gid2;lk.rel='stylesheet';lk.href='https://fonts.googleapis.com/css2?family='+encodeURIComponent(fam).replace(/%20/g,'+')+':wght@400;600;700&display=swap';document.head.appendChild(lk);}
    setB(target, "'"+fam+"',cursive");
  }
  async function subirVideo(input){
    const f=input.files&&input.files[0]; if(!f)return;
    if(!window.INV||!INV.uploadVideo){alert('Todavía no cargó la base. Esperá 2 seg.');return;}
    const b=el('vidbtn'); if(b)b.textContent='Subiendo video… ⏳';
    try{const url=await INV.uploadVideo(f); setB('coverVideo',url); renderPanel();}
    catch(e){console.error(e); if(b)b.textContent='⬆ Subir video (.mp4)'; alert('No se pudo subir: '+(e.message||e));}
    input.value='';
  }
  async function subirFoto(input,campo){
    const f=input.files&&input.files[0]; if(!f)return;
    if(!window.INV||!INV.uploadImage){alert('Todavía no cargó la base. Esperá 2 seg.');return;}
    const btn=el('coverbtn'); const prev=btn?btn.textContent:'';
    if(btn){btn.textContent='Subiendo… ⏳';}
    try{ const url=await INV.uploadImage(f); setB(campo,url); if(btn)btn.textContent='✓ Foto subida'; }
    catch(e){ console.error(e); if(btn)btn.textContent='⬆ Subir tu propia foto'; alert('No se pudo subir: '+(e.message||e)); }
    input.value='';
    setTimeout(()=>{if(btn)btn.textContent=prev||'⬆ Subir tu propia foto';},2500);
  }

  const mesesL=["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
  const dias=["Domingo","Lunes","Martes","Miércoles","Jueves","Viernes","Sábado"];
  // ==== VISTA PREVIA REAL ====
  // El preview es la invitación de verdad dentro de un iframe. Le mandamos los
  // datos del panel por postMessage, así se ven TODOS los sectores mientras se carga.
  let _pvListo=false;
  window.addEventListener('message',function(e){
    if(e&&e.data&&e.data.type==='inv-preview-ready'){ _pvListo=true; postPreview(); }
  });
  let _pvVer=null;
  function sincronizarVersionPreview(){
    const fr=el('pv-frame'); if(!fr)return;
    const v=D.ver||VERSION;
    if(_pvVer===v) return;              // ya está en la versión correcta
    _pvVer=v;
    fr.src='i/?preview=1&ver='+encodeURIComponent(v);   // el preview muestra SU versión
  }
  function postPreview(){
    const fr=el('pv-frame'); if(!fr||!fr.contentWindow)return;
    try{ const {invitados, ..._cfg}=D; fr.contentWindow.postMessage({type:'inv-preview', ev:_cfg},'*'); }catch(e){}
  }
  function render(){
    // editor de foto del panel (no es el preview)
    const ie=el('imgedit');
    if(ie){ie.style.backgroundImage="url('"+D.cover+"')";ie.style.backgroundPosition=D.cx+'% '+D.cy+'%';ie.style.backgroundSize='auto '+D.cz+'%';}
    postPreview();
  }
  // por las dudas: si el iframe carga después, mandamos igual
  window.addEventListener('load',function(){ const fr=el('pv-frame'); if(fr){ fr.addEventListener('load',postPreview); postPreview(); } });
  // La cuenta regresiva y el QR ahora los dibuja la invitación real dentro del iframe.
  // Se dejan como no-op para no romper llamadas viejas.
  function updCount(){ const b=el('pv-count'); if(!b)return;
    const f=new Date(D.fecha),x=f-new Date();const d=Math.max(0,Math.floor(x/864e5)),h=Math.max(0,Math.floor(x%864e5/36e5)),m=Math.max(0,Math.floor(x%36e5/6e4)),sc=Math.max(0,Math.floor(x%6e4/1e3));
    b.innerHTML=['<div class="b"><div class="num">'+d+'</div><div class="l">Días</div></div>','<div class="s">:</div>','<div class="b"><div class="num">'+String(h).padStart(2,'0')+'</div><div class="l">Hs</div></div>','<div class="s">:</div>','<div class="b"><div class="num">'+String(m).padStart(2,'0')+'</div><div class="l">Min</div></div>','<div class="s">:</div>','<div class="b"><div class="num">'+String(sc).padStart(2,'0')+'</div><div class="l">Seg</div></div>'].join('');}
  function drawQR(){const b=el('pv-qr');if(!b)return;b.innerHTML='';if(window.QRCode)new QRCode(b,{text:'https://invitaciones.tumarca.com/x?g='+encodeURIComponent(D.pnom),width:58,height:58,colorDark:D.color,colorLight:'#fff'});}

  function tcsv(){const b=el('csvbox');b.style.display=b.style.display==='none'?'block':'none';}
  // "Pegar la lista a mano" tenía SU PROPIO código para agregar invitados, distinto
  // del de Excel/CSV: por eso duplicaba aunque el otro camino ya no lo hiciera, y
  // encima ignoraba la columna de restricción alimentaria. Ahora los dos caminos
  // pasan por _cargarFilas (anti-duplicados + aviso + restricción).
  function impcsv(){
    const filas=el('csv').value.split(/\r?\n/).filter(l=>l.trim()!=='').map(_parseCSVline);
    el('csv').value='';
    if(!filas.length){ alert('Pegá la lista primero: un invitado por renglón, separando con comas (Nombre, Personas, Mesa).'); return; }
    _cargarFilas(filas);
  }
  // ==== CARGA MASIVA POR EXCEL ====
  function _bajar(nombre,contenido,tipo){const blob=new Blob(['﻿'+contenido],{type:tipo||'text/csv;charset=utf-8;'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=nombre;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove();},200);}
  function descargarPlantilla(){
    const filas=[['Nombre','Personas','Mesa','Restriccion / nota'],
      ['Familia Pérez','4','3','Sin gluten'],
      ['Juan y Ana','2','5',''],
      ['Abuela Rosa','1','1','Menú vegetariano']];
    _bajar('plantilla-invitados.csv', filas.map(f=>f.map(x=>/[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x).join(',')).join('\n'));
  }
  function _parseCSVline(line){const out=[];let cur='',q=false;for(let i=0;i<line.length;i++){const ch=line[i];if(q){if(ch==='"'){if(line[i+1]==='"'){cur+='"';i++;}else q=false;}else cur+=ch;}else{if(ch==='"')q=true;else if(ch===',' ){out.push(cur);cur='';}else cur+=ch;}}out.push(cur);return out;}
  function _cargarFilas(filas){
    let ini=0;
    if(filas.length){const h=(filas[0][0]||'').toString().toLowerCase();if(h.indexOf('nombre')>=0||h.indexOf('name')>=0)ini=1;}
    // Anti-duplicados: si sube/pega la misma lista dos veces (pasa siempre, porque
    // uno duda de si se cargó), antes se duplicaban TODOS en silencio y el día del
    // evento había el doble de pases. Ahora los repetidos se saltean y se avisa.
    const _norm=s=>(s||'').toString().trim().toLowerCase().replace(/\s+/g,' ');
    const yaEstan=new Set(D.invitados.map(g=>_norm(g.n)));
    let n=0, repes=[];
    for(let i=ini;i<filas.length;i++){const c=filas[i];if(!c)continue;const nom=(c[0]||'').toString().trim();if(!nom)continue;
      const k=_norm(nom);
      if(yaEstan.has(k)){ repes.push(nom); continue; }
      yaEstan.add(k);
      D.invitados.push({n:nom,p:((c[1]!=null&&c[1]!=='')?c[1]:'1').toString().trim(),m:((c[2]!=null&&c[2]!=='')?c[2]:'-').toString().trim(),restriccion:(c[3]||'').toString().trim(),t:nuevoTokenSeguro()});n++;}
    renderGuests();
    let msg;
    if(n>0){ msg='✅ Se cargaron '+n+' invitados.';
      if(repes.length) msg+='\n\n↷ Salteé '+repes.length+' que ya estaban en la lista:\n· '+repes.slice(0,8).join('\n· ')+(repes.length>8?'\n…y más':'');
      msg+='\n\nRevisá la lista y tocá "Guardar y publicar" para activar todos los links.';
    } else if(repes.length){ msg='Esos '+repes.length+' invitados YA estaban cargados, así que no agregué ninguno.\n\nSi querés cargarlos igual (por ejemplo dos familias con el mismo apellido), cambiales un poco el nombre.';
    } else { msg='No encontré invitados en el archivo. Revisá que la primera columna tenga los nombres.'; }
    alert(msg);
  }
  function _cargarSheetJS(cb){if(window.XLSX)return cb();const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js';s.onload=cb;s.onerror=function(){alert('No pude leer el Excel (sin internet). Guardalo como CSV y subilo de nuevo.');};document.head.appendChild(s);}
  function importarArchivo(inp){
    const f=inp.files&&inp.files[0];if(!f)return;const nom=f.name.toLowerCase();
    if(nom.endsWith('.xlsx')||nom.endsWith('.xls')){
      _cargarSheetJS(function(){const rd=new FileReader();rd.onload=function(e){try{const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array'});const ws=wb.Sheets[wb.SheetNames[0]];const filas=XLSX.utils.sheet_to_json(ws,{header:1});_cargarFilas(filas);}catch(err){alert('No pude leer el Excel. Probá guardarlo como CSV.');}inp.value='';};rd.readAsArrayBuffer(f);});
    }else{
      const rd=new FileReader();rd.onload=function(e){const txt=e.target.result.replace(/\r/g,'');const filas=txt.split('\n').filter(l=>l.trim()!=='').map(_parseCSVline);_cargarFilas(filas);inp.value='';};rd.readAsText(f);
    }
  }
  function exportarLinks(){
    if(!D.invitados||!D.invitados.length){alert('Todavía no hay invitados cargados.');return;}
    const slug=encodeURIComponent(D.slug||'');
    const filas=[['Nombre','Personas','Mesa','Link personalizado']];
    D.invitados.forEach(g=>{filas.push([g.n||'',g.p||'',g.m||'',BASEURL+'?e='+slug+'&g='+g.t]);});
    _bajar('links-invitados.csv', filas.map(f=>f.map(x=>{x=(x==null?'':x).toString();return /[",\n]/.test(x)?'"'+x.replace(/"/g,'""')+'"':x;}).join(',')).join('\n'));
  }
  function addGuest(){const n=el('gname').value.trim();if(!n)return;D.invitados.push({n:n,p:el('gper').value||'1',m:el('gmesa').value||'-',t:nuevoTokenSeguro()});el('gname').value='';renderGuests();}
  // Invitados borrados del panel: hay que darlos de baja TAMBIÉN en la base.
  // Antes `delGuest` sólo los sacaba de la lista local: el documento quedaba vivo,
  // el link del invitado seguía funcionando y el escáner de puerta lo seguía
  // dejando entrar. Ahora se anotan y se dan de baja al publicar.
  let _borrados=[];
  function delGuest(i){
    const g=D.invitados[i];
    if(!g) return;
    if(g.rsvp==='confirmado' && !confirm('"'+(g.n||'Este invitado')+'" ya confirmó su asistencia.\n\n¿Lo borrás igual? Su link va a dejar de funcionar.')) return;
    if(g.t) _borrados.push(g.t);
    D.invitados.splice(i,1);
    renderGuests();
  }
  function renderGuests(){if(!el('st-inv'))return;el('st-inv').textContent=D.invitados.length;el('st-per').textContent=D.invitados.reduce((a,g)=>a+(parseInt(g.p,10)||0),0);
    // Estado de la confirmación al lado de cada invitado. Antes el RSVP se guardaba
    // en la base y NO se veía en ninguna pantalla: la diseñadora no tenía forma de
    // saber quién confirmó.
    const _RS={confirmado:['✅','confirmó','#1f7a4d'],rechazado:['✖','no puede','#8a2b2b'],pendiente:['·','sin responder','#a39a90']};
    el('guests').innerHTML=D.invitados.map((g,i)=>{const url=BASEURL+'?e='+encodeURIComponent(D.slug||'')+'&g='+g.t;
      const r=_RS[g.rsvp||'pendiente']||_RS.pendiente;
      const cuantos=(g.rsvp==='confirmado'&&g.rsvpPersonas)?(' ('+g.rsvpPersonas+')'):'';
      return '<div class="guest"><b>'+g.n+'</b>'+
      '<span title="'+r[1]+'" style="font-size:12px;font-weight:800;color:'+r[2]+';margin-left:8px;white-space:nowrap">'+r[0]+' '+r[1]+cuantos+'</span>'+
      '<button class="lnk" style="margin-left:auto;color:#6D1233" onclick="navigator.clipboard.writeText(\''+url+'\');this.textContent=\'¡copiado!\';setTimeout(()=>this.textContent=\'🔗 copiar link\',1500)">🔗 copiar link</button>'+
      '<a class="lnk" href="'+url+'" target="_blank" style="text-decoration:none;color:#6D1233">👁 ver</a>'+
      '<span class="x" onclick="delGuest('+i+')">✕</span></div>';}).join('')||'<div class="hint">Todavía no cargaste invitados. (Los links quedan activos después de \'Guardar y publicar\'.)</div>';}
  // ==== GUARDAR/PUBLICAR EN FIREBASE (de verdad) ====
  const BASEURL="https://invitame.littlemomentsok.com/i/";
  // ¿Quedó algo del ejemplo sin cambiar? El panel arranca con la demo cargada,
  // así que lo que no se toca se publica tal cual. Esto avisa ANTES de publicar.
  function restosDemo(){
    const av=[];
    const P=((D.n1||'')+' y '+(D.n2||'')).trim();
    if(/Mar[íi]a/.test(D.n1||'')||/Diego/.test(D.n2||'')) av.push('Los nombres siguen siendo los del ejemplo («'+P+'»)');
    if((D.slug||'')==='maria-y-diego') av.push('La dirección del link sigue siendo «maria-y-diego»');
    if(String(D.fecha||'').indexOf('2026-11-28')===0) av.push('La fecha sigue siendo la del ejemplo (28/11/2026)');
    if(/Hay un instante en la vida/.test(D.frase||'')) av.push('La frase principal es la del ejemplo');
    if(/images\.unsplash\.com/.test(D.cover||'')) av.push('La foto de portada es una del ejemplo (no es de la pareja)');
    if(D.trivia&&D.trivia[0]&&/D[óo]nde se conocieron\?$/.test(D.trivia[0].q||'')) av.push('Las preguntas de la trivia son las de ejemplo');
    // Nota: sólo se avisa por cosas que el invitado VE. Campos internos o que ya
    // no se muestran (cer, pnom, nombre de plantilla) no entran, para que el
    // aviso no se llene de ruido y se termine ignorando.
    return av;
  }
  let _demoAvisado=false;
  // Deja armado (o actualizado) el acceso de los novios a SU panel.
  // No rompe la publicación si falla: la invitación es lo importante.
  // Los novios arman las mesas desde SU panel. No escriben en la ficha de cada invitado
  // (eso lo bloquea la regla): guardan la asignacion en su propio documento de panel.
  window.traerMesasDeLosNovios = async function(){
    const clave=String(D['c_clave-del-panel-de-los-novios']||'').trim();
    if(!clave){ alert('Esta invitacion todavia no tiene clave de panel. Ponesela en AVANZADO y publica.'); return; }
    const slug=String(D.slug||'').trim();
    try{
      const m=await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const snap=await m.getDoc(m.doc(window.INV.db,'inv_paneles',slug+'__'+clave));
      if(!snap.exists()){ alert('No encontre el panel de los novios. Publica de nuevo para crearlo.'); return; }
      const p=snap.data()||{};
      const mesas=Array.isArray(p.mesas)?p.mesas:[];
      const asig=(p.asig&&typeof p.asig==='object')?p.asig:{};
      if(!mesas.length && !Object.keys(asig).length){ alert('Los novios todavia no armaron ninguna mesa.'); return; }
      const nombreDe={}; mesas.forEach(x=>{ nombreDe[x.id]=x.nombre; });
      let tocados=0;
      (D.invitados||[]).forEach(g=>{
        const t=g.t||g.token; if(!t) return;
        // Si los novios no lo tocaron, NO se le cambia nada. Antes esto borraba la mesa
        // de todos los que no habian movido, que es justo lo contrario de lo que se espera.
        if(!Object.prototype.hasOwnProperty.call(asig,t)) return;
        const id=asig[t];
        if(id && !nombreDe[id]) return;              // mesa que no conozco: no piso nada
        const nuevo = id ? nombreDe[id] : '-';
        if(String(g.m||'')!==String(nuevo)){ g.m=nuevo; tocados++; }
      });
      renderGuests();
      alert(tocados ? ('Listo: actualice la mesa de '+tocados+' invitado(s). Acordate de tocar Guardar y publicar.')
                    : 'Ya estaba todo igual, no habia nada que traer.');
    }catch(e){ console.error(e); alert('No pude traer las mesas: '+(e.message||e)); }
  };
  window._panelNoviosLink='';
  async function guardarPanelNovios(slug, res){
    window._panelNoviosLink='';
    const clave=String(D['c_clave-del-panel-de-los-novios']||'').trim();
    if(!clave) return;                        // sin clave no hay panel, y está bien
    try{
      const m=await import('https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js');
      const tokens=(res||[]).map(r=>r&&r.token).filter(Boolean);
      const nombres=[D.n1,D.n2].filter(Boolean).join(' & ')||slug;
      // ⚠️⚠️ EL `{merge:true}` NO SE SACA NUNCA.  (7/9/2026)
      // Sin él, `setDoc` REEMPLAZA el documento entero y les borra a los novios
      // las mesas, a quién sentaron en cada una, la capacidad, el mensaje para
      // compartir y el itinerario. En silencio: ese documento no se ve en
      // ninguna pantalla del admin, así que nadie se entera hasta que ellos
      // entran y no está más lo que habían armado.
      // Durante un tiempo esto se tapó con un módulo (`panel-novios-guardar.js`)
      // que sacaba una copia antes y la reponía después. Era un parche: si el
      // módulo no cargaba, o si la lectura previa fallaba, se perdía igual.
      // Maki: «hay que arreglar todo para siempre, no quiero parches».
      await m.setDoc(m.doc(window.INV.db,'inv_paneles',slug+'__'+clave),{
        slug, nombres, tokens,
        fechaTexto: String(D['c_ceremonia-1-fecha-descripcion']||D.ev1fecha||''),
        actualizado: new Date().toISOString()
      }, {merge:true});
      window._panelNoviosLink=location.origin+'/mi-panel.html?e='+encodeURIComponent(slug);
    }catch(e){ console.error('panel novios',e); }
  }

  async function publicar(){
    if(!window.INV||!window.INV.ok){alert("Todavía no se conectó la base de datos. Esperá 2 segundos y probá de nuevo.");return;}
    const _rd=restosDemo();
    if(_rd.length && !_demoAvisado){
      _demoAvisado=true;
      if(!confirm('⚠️ Antes de publicar, revisá esto:\n\n· '+_rd.join('\n· ')+
        '\n\nEsos datos son del EJEMPLO y se van a ver así en la invitación del cliente.\n\n'+
        'Aceptar = publicar igual   ·   Cancelar = volver y corregir')) return;
    }
    const slug=(D.slug||"").trim();
    if(!D.nEvento){ try{ const _all=await INV.exportAll(); const _mx=_all.eventos.reduce((m,e)=>Math.max(m,parseInt(e.nEvento,10)||0),0); D.nEvento=_mx+1; }catch(_e){ D.nEvento=1; } }
    if(!slug){alert("Poné la 'Dirección del evento' en la pestaña PRINCIPAL (ej: maria-y-diego).");return;}
    // Nunca publicar el video de ejemplo (la flor de MDN)
    if(/interactive-examples|flower\.mp4/i.test(D.coverVideo||'')){
      D.coverVideo='';
      alert("⚠️ Saqué el video de ejemplo (la flor) porque no corresponde a esta pareja.\n\nSi querés video de portada, subí el de los novios; si no, queda solo la foto. Ya podés volver a tocar 'Guardar y publicar'.");
      if(cur==='PRINCIPAL') go('PRINCIPAL');
      return;
    }
    const btn=document.querySelector('.btn-g');const txt=btn?btn.textContent:'';if(btn){btn.textContent='Guardando…';btn.disabled=true;}
    try{
      // 1) guarda la config del evento (todo el objeto de diseño)
      const _primeraVez = !D.ver;            // ¿es la primera vez que se publica?
      if(_primeraVez) D.ver=VERSION;         // queda clavada a esta versión
      const {invitados, ...cfg}=D;
      // La clave del panel y el mail NO van al documento publico (lo lee cualquiera que
      // tenga el link de la invitacion). Se guardan aparte, en inv_privado.
      const _priv={};
      (INV.CAMPOS_PRIVADOS||[]).forEach(k=>{ if(cfg[k]!==undefined){ _priv[k]=cfg[k]; delete cfg[k]; } });
      // INVITACION PRIVADA (candado de verdad, 2026-08-11):
      // la clave ya no viaja en el documento publico. En su lugar queda una marca
      // "privado", y la REGLA de Firestore usa esa marca para no entregar el evento
      // a nadie. Los datos solo salen por evento-privado.php, con la clave correcta.
      const _esPrivado = !!String(_priv['c_contrasena-para-el-evento']||'').trim();
      cfg.privado = _esPrivado;
      if(_esPrivado && cfg.ver && cfg.ver < VER_CANDADO_SERVIDOR){
        if(!confirm('Esta invitación tiene clave.\n\nPara que la clave proteja de verdad (y no sea solo un cartel), hay que pasarla al diseño '+VER_CANDADO_SERVIDOR+'.\n\nSe ve igual, pero si cancelás la invitación va a quedar sin candado.\n\n¿La actualizo?')){
          cfg.privado=false;                     // sin motor nuevo no se marca privada: quedaria en blanco
          _priv['c_contrasena-para-el-evento']=''; // y la clave no sirve de nada
        } else {
          cfg.ver=VER_CANDADO_SERVIDOR; D.ver=cfg.ver;
        }
      }
      await INV.saveEvento(slug, cfg);
      /* ===== QUIÉN LA ARMÓ Y QUIÉN LA TOCÓ ÚLTIMO ==========================
         El 7/9/2026 nadie pudo decir dónde estaba la invitación que había hecho
         Jazmín: el sistema no guardaba el autor. Con tres personas cargando
         invitaciones, esa pregunta vuelve siempre.

         ⚠️ VA EN `inv_privado`, NO en el documento del evento. El evento lo lee
         CUALQUIERA que tenga el link de la invitación; los mails del equipo no
         son asunto de los invitados. `inv_privado` sólo se lee con login. */
      _priv.guardadoPor = ((window.INV&&INV.user&&INV.user.email)||'').toLowerCase();
      _priv.guardadoEl  = new Date().toISOString();
      if(_primeraVez){ _priv.creadoPor=_priv.guardadoPor; _priv.creadoEl=_priv.guardadoEl; }
      /* Ojo: antes esto sólo se guardaba si había campos privados. Ahora siempre
         hay algo que guardar, así que la llamada va sin condición. */
      await INV.savePrivado(slug, _priv);
      await INV.limpiarPrivadosDelPublico(slug);   // saca los que habian quedado de antes
      // 2) guarda cada invitado y obtiene su token/link
      const arr=D.invitados.map(g=>({n:g.n,p:g.p,m:g.m,restriccion:g.restriccion,token:g.t}));
      const res=await INV.saveInvitados(slug, arr);
      // devuelve tokens -> los reflejo en D para mostrar el link
      res.forEach((r,i)=>{ if(D.invitados[i]){ D.invitados[i].t=r.token; D.invitados[i].rsvp=r.rsvp; D.invitados[i].rsvpPersonas=r.rsvpPersonas; D.invitados[i].usos=r.usos; } });
      // dar de baja en la base a los que se borraron del panel
      if(_borrados.length){
        const quedan=[];
        for(const tk of _borrados){
          if(D.invitados.some(g=>g.t===tk)) continue;   // lo volvió a agregar
          try{ await INV.delInvitado(slug, tk); }catch(e){ console.error('baja',tk,e); quedan.push(tk); }
        }
        _borrados=quedan;
        if(quedan.length) alert('Ojo: '+quedan.length+' invitado(s) que borraste no se pudieron dar de baja. Volvé a tocar "Guardar y publicar".');
      }
      // 3) Panel de los novios: si le pusiste clave, dejamos armado su acceso.
      //    El documento se llama slug__clave: si la clave está mal, sencillamente no
      //    existe. Guarda solo la lista de tokens, así el panel puede leer cada
      //    invitado por separado y ver las confirmaciones al día.
      await guardarPanelNovios(slug, res);
      renderGuests();
      showLinks(slug, res);
    }catch(e){console.error(e);
      var m=String(e&&e.message||e);
      // "Missing or insufficient permissions" casi siempre = se cayó la sesión.
      // Antes salía el error técnico y la diseñadora no sabía qué hacer.
      if(/permission|insufficient/i.test(m)) alert('⚠️ Se cerró tu sesión, por eso no se pudo guardar.\n\nNO cierres esta pestaña: iniciá sesión de nuevo en la ventana que aparece y volvé a tocar "Guardar y publicar". Lo que cargaste sigue acá.');
      else if(/network|offline|unavailable|failed to fetch/i.test(m)) alert('Sin internet: no se pudo guardar. Revisá la conexión y volvé a tocar "Guardar y publicar" (no cierres la pestaña).');
      else alert("No se pudo guardar: "+m);
    }
    if(btn){btn.textContent=txt||'Guardar';btn.disabled=false;}
  }
  window.copiarPanelNovios=function(b){
    const i=b.parentNode.querySelector('input');
    if(i){ navigator.clipboard.writeText(i.value); b.textContent='Copiado'; }
  };
  // Recuadro con el link del panel de los novios, listo para pasarles.
  // Solo aparece si la invitación tiene clave cargada en AVANZADO.
