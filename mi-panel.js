/* ===== EL PANEL DE LOS NOVIOS =================================================

   Esto vivía ADENTRO de mi-panel.html, como un <script type="module"> inline.
   Se sacó a este archivo el 4/9/2026 por un motivo práctico y medido: con el
   script adentro, mi-panel.html pesaba 51 KB, y la herramienta con la que subo
   archivos al repo tiene un techo de ~45 KB por llamada. O sea que CUALQUIER
   cambio, por chico que fuera, obligaba a reescribir el archivo entero con
   riesgo de subirlo cortado. Ahora el HTML pesa 13 KB y este archivo 38 KB:
   los dos entran cómodos y se pueden tocar de a uno.

   QUÉ HACE
   El panel que usan los novios con su slug y su clave: ven quién confirmó,
   arman las mesas, leen los mensajes, imprimen los QR y cargan el itinerario.

   ⚠️ LOS NOVIOS NO ESCRIBEN EN LA INVITACIÓN
   Todo lo que tocan queda en `inv_paneles/<slug>__<clave>`. Las reglas de
   Firestore no los dejan tocar `inv_eventos`, y está bien: cualquiera con el
   link del panel podría romper la invitación. Lo que eligen viaja a la
   invitación cuando la diseñadora toca «Traer lo de los novios» en el bloque
   del itinerario del admin, y publica.

   ⚠️ Y ESE DOCUMENTO SE BORRABA SOLO
   `admin.html` lo guardaba con `setDoc` sin `{merge:true}`: cada "Guardar y
   publicar" reemplazaba el documento entero y les borraba las mesas. Lo repara
   `/efectos/panel-novios-guardar.js`.
   ============================================================================ */

  import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
  import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

  // Config pública del proyecto (la apiKey web NO es secreta: lo que protege son las reglas).
  const firebaseConfig = {
    apiKey: "AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc",
    authDomain: "invitame-9b51f.firebaseapp.com",
    projectId: "invitame-9b51f",
    storageBucket: "invitame-9b51f.appspot.com",
    messagingSenderId: "1060290054006",
    appId: "1:1060290054006:web:938ea367197d2a6462dc57"
  };
  const db = getFirestore(initializeApp(firebaseConfig));

  const $  = id => document.getElementById(id);
  const esc = s => String(s==null?'':s).replace(/[&<>"']/g, c =>
    ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const limpiarSlug = s => String(s||'').trim().toLowerCase()
    .replace(/^https?:\/\/[^/]+\//,'').replace(/^i\/\?e=/,'').replace(/[^a-z0-9-]/g,'');

  // ---------------- estado ----------------
  let SLUG='', CLAVE='', PANEL=null, GENTE=[], VISTA='resumen', FILTRO='todos', BUSCA='';
  let arrastrando = null;

  const num = v => { const n=parseInt(v,10); return isNaN(n)?0:n; };
  const personasDe = g => (g.rsvp==='confirmado')
        ? (num(g.rsvpPersonas) || num(g.pases))
        : (g.rsvp==='rechazado' ? 0 : num(g.pases));
  const estadoDe = g => g.rsvp==='confirmado' ? 'si' : (g.rsvp==='rechazado' ? 'no' : 'sin');
  const colorDe  = e => e==='si' ? 'var(--ok)' : (e==='no' ? 'var(--no)' : 'var(--sin)');
  const linkDe   = g => location.origin + '/i/?e=' + encodeURIComponent(SLUG) + '&g=' + encodeURIComponent(g.token);

  function toast(txt){ const t=$('toast'); t.textContent=txt||'Guardado'; t.classList.add('ver');
    clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('ver'),1600); }

  // ---------------- datos ----------------
  async function traerPanel(slug, clave){
    const snap = await getDoc(doc(db,'inv_paneles', slug + '__' + clave));
    if(!snap.exists()) return null;
    return snap.data();
  }
  async function traerGente(slug, tokens){
    const out=[];
    for(const t of (tokens||[])){
      try{
        const s = await getDoc(doc(db,'inv_invitados', slug + '__' + t));
        if(s.exists()){ const d=s.data(); if(d.activo!==false) out.push(Object.assign({token:t}, d)); }
      }catch(e){}
    }
    return out;
  }
  // Los novios NO escriben en la ficha de cada invitado (eso lo protege la regla).
  // Todo lo que tocan queda guardado en SU propio documento de panel, cuyo id lleva
  // la clave adentro: sin la clave, ese documento no se puede ni encontrar ni tocar.
  async function guardarPanel(cambios){
    try{
      await updateDoc(doc(db,'inv_paneles', SLUG + '__' + CLAVE),
        Object.assign({}, cambios, {actualizado:new Date().toISOString()}));
      Object.assign(PANEL, cambios);
      toast('Guardado');
      return true;
    }catch(e){ console.error(e); toast('No se pudo guardar'); return false; }
  }

  // ---------------- mesas ----------------
  const mesasDe   = () => Array.isArray(PANEL.mesas) ? PANEL.mesas : [];
  const asigDe    = () => (PANEL.asig && typeof PANEL.asig==='object') ? PANEL.asig : {};
  const mesaDe    = g => {
    const a=asigDe();
    if(Object.prototype.hasOwnProperty.call(a,g.token)) return String(a[g.token]||'');
    const n = g.mesa ? String(g.mesa).trim() : '';
    if(!n || n==='-') return '';
    const m = mesasDe().find(x=>String(x.nombre)===n);
    return m ? String(m.id) : '';
  };
  const nombreMesa = id => { const m=mesasDe().find(x=>String(x.id)===String(id)); return m?m.nombre:''; };
  const enMesa    = id => GENTE.filter(g => mesaDe(g)===String(id));
  const sinMesa   = () => GENTE.filter(g => !mesaDe(g));
  const sumaPers  = arr => arr.reduce((s,g)=>s+personasDe(g),0);

  // ---------------- cuentas ----------------
  function cuentas(){
    const c={inv:GENTE.length, pers:0, si:0, no:0, sin:0, vienen:0, mesas:mesasDe().length};
    GENTE.forEach(g=>{
      c.pers += num(g.pases);
      const e=estadoDe(g);
      if(e==='si'){ c.si++; c.vienen += personasDe(g); }
      else if(e==='no') c.no++;
      else c.sin++;
    });
    return c;
  }

  // =====================================================================
  //  VISTAS
  // =====================================================================
  function pintar(){
    $('ttNombres').textContent = PANEL.nombres || SLUG;
    $('ttFecha').textContent   = PANEL.fechaTexto || '';
    $('topSub').textContent    = ({resumen:'Panel de control', invitados:'Personas y pases',
      mesas:'Mesas', itinerario:'Itinerario', mensajes:'Mensajes', qr:'QR para imprimir', opciones:'Opciones'})[VISTA] || 'Mi panel';
    document.querySelectorAll('.lat a[data-vista]').forEach(a=>
      a.classList.toggle('on', a.dataset.vista===VISTA));
    ({resumen:vResumen, invitados:vInvitados, mesas:vMesas, itinerario:vItinerario,
      mensajes:vMensajes, qr:vQR, opciones:vOpciones}[VISTA] || vResumen)();
  }

  function bloqueNumeros(){
    const c=cuentas(), t=c.si+c.no+c.sin || 1;
    return '<div class="nums">'+
      '<div class="num"><b>'+c.inv+'</b><span>Invitaciones enviadas</span></div>'+
      '<div class="num"><b>'+c.pers+'</b><span>Personas invitadas</span></div>'+
      '<div class="num"><b>'+c.si+'</b><span>Confirmaron</span><div class="barra"><i style="width:'+(c.si/t*100)+'%"></i></div></div>'+
      '<div class="num rojo"><b>'+c.no+'</b><span>No pueden</span><div class="barra"><i style="width:'+(c.no/t*100)+'%"></i></div></div>'+
      '<div class="num"><b>'+c.sin+'</b><span>Sin responder</span></div>'+
      '<div class="num"><b>'+c.vienen+'</b><span>Personas que vienen</span></div>'+
      '<div class="num"><b>'+c.mesas+'</b><span>Mesas armadas</span></div>'+
    '</div>';
  }

  // ---------- 1. RESUMEN ----------
  function vResumen(){
    const conMsj = GENTE.filter(g=>g.rsvpMensaje).slice(0,6);
    const respondieron = GENTE.filter(g=>estadoDe(g)!=='sin').slice(0,12);
    $('vista').innerHTML = bloqueNumeros() +
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px">'+
        '<div class="card"><h3>Mensajes que te dejaron</h3>'+
          (conMsj.length
            ? conMsj.map(g=>'<div style="margin-bottom:12px"><div style="font-weight:900;font-size:13.5px">'+esc(g.nombre)+'</div>'+
                '<div style="color:#6b6058;font-size:13px;font-style:italic">'+esc(g.rsvpMensaje)+'</div></div>').join('')
              + (GENTE.filter(g=>g.rsvpMensaje).length>6 ? '<button class="lnk" data-ir="mensajes">Ver todos</button>' : '')
            : '<div class="vacio">Todavía no te dejaron mensajes.</div>')+
        '</div>'+
        '<div class="card"><h3>Quiénes ya respondieron</h3>'+
          (respondieron.length
            ? '<div>'+respondieron.map(g=>{const e=estadoDe(g);
                return '<div style="display:flex;align-items:center;gap:9px;padding:6px 0;border-bottom:1px solid #f5efe8">'+
                  '<span style="width:9px;height:9px;border-radius:50%;background:'+colorDe(e)+'"></span>'+
                  '<span style="flex:1;font-weight:700;font-size:13.5px">'+esc(g.nombre)+'</span>'+
                  '<span class="chip '+e+'">'+(e==='si'?'Asistirá':'No asistirá')+'</span></div>';}).join('')+'</div>'+
              '<button class="lnk" data-ir="invitados" style="margin-top:10px">Ver todos</button>'
            : '<div class="vacio">Todavía no respondió nadie.</div>')+
        '</div>'+
      '</div>';
  }

  // ---------- ITINERARIO ----------
  // Los novios cargan los horarios (que cambian mil veces) y eligen si el
  // itinerario se ve ESCRITO --con los efectos de la coleccion-- o como una
  // IMAGEN que suben ellos.
  //
  // /!\ POR QUE NO ESCRIBE DIRECTO EN LA INVITACION
  // Las reglas de Firestore NO dejan que los novios toquen `inv_eventos`, y esta
  // bien que sea asi: cualquiera con el link del panel podria romper la
  // invitacion. Lo que cargan queda en SU documento (`inv_paneles`), y la
  // disenadora lo trae con un boton desde el admin y publica. Es el mismo
  // camino que ya usan las mesas.
  const ITIN = () => (PANEL.itinerario && typeof PANEL.itinerario==='object')
    ? PANEL.itinerario : {modo:'', momentos:[]};
  const ITIN_MS = () => Array.isArray(ITIN().momentos) ? ITIN().momentos.slice() : [];

  function vItinerario(){
    const it = ITIN(), ms = ITIN_MS();
    const modo = String(it.modo||'');
    $('vista').innerHTML =
      '<div class="card"><h3>Como se muestra el itinerario</h3>'+
        '<div style="display:grid;gap:8px;margin:8px 0 4px">'+
          '<label style="display:flex;gap:8px;align-items:flex-start;cursor:pointer">'+
            '<input type="radio" name="itmodo" value="texto" '+(modo==='texto'?'checked':'')+'>'+
            '<span><b>Escrito</b><br><span style="color:#6b6058;font-size:12.5px">Cada momento con su hora. Se dibuja con el diseno de la invitacion y va apareciendo al bajar.</span></span>'+
          '</label>'+
          '<label style="display:flex;gap:8px;align-items:flex-start;cursor:pointer">'+
            '<input type="radio" name="itmodo" value="imagen" '+(modo==='imagen'?'checked':'')+'>'+
            '<span><b>Una imagen</b><br><span style="color:#6b6058;font-size:12.5px">Suben su propio diseno. Reemplaza a la lista escrita.</span></span>'+
          '</label>'+
        '</div>'+
        (modo==='imagen'
          ? '<div style="margin-top:10px">'+
              '<button class="btn" id="itSubir" style="max-width:240px">Subir imagen del itinerario</button>'+
              '<input type="file" id="itFile" accept="image/*" style="display:none">'+
              '<div id="itPrev" style="margin-top:8px">'+
                (it.imagen ? '<img src="'+esc(it.imagen)+'" style="max-height:120px;border-radius:10px;display:block">'
                           : '<span class="vacio">Todavia no subieron la imagen.</span>')+
              '</div></div>'
          : '')+
      '</div>'+
      (modo==='imagen' ? '' :
      '<div class="card"><h3>Los momentos del dia</h3>'+
        '<div id="itLista">'+
          (ms.length ? ms.map((m,i)=>
            '<div style="display:grid;grid-template-columns:80px 1fr auto;gap:6px;margin-bottom:6px;align-items:start">'+
              '<input type="text" data-it="h" data-i="'+i+'" value="'+esc(m.h||'')+'" placeholder="17:00">'+
              '<div style="display:grid;gap:4px">'+
                '<input type="text" data-it="t" data-i="'+i+'" value="'+esc(m.t||'')+'" placeholder="Ceremonia">'+
                '<input type="text" data-it="d" data-i="'+i+'" value="'+esc(m.d||'')+'" placeholder="Detalle (opcional)" style="font-size:12.5px">'+
              '</div>'+
              '<button class="lnk" data-itdel="'+i+'" title="Borrar">&#10005;</button>'+
            '</div>').join('')
            : '<div class="vacio">Todavia no cargaron ningun momento.</div>')+
        '</div>'+
        '<button class="lnk" id="itMas" style="margin-top:8px">+ Agregar momento</button>'+
      '</div>')+
      '<div class="card"><button class="btn" id="itGuardar" style="max-width:200px">Guardar</button>'+
        '<div style="color:#6b6058;font-size:12.5px;margin-top:8px">Cuando guardes, le avisamos a quien armo tu invitacion para que lo publique.</div>'+
      '</div>';
  }

  function leerItinerarioDeLaPantalla(){
    const modoEl = document.querySelector('input[name="itmodo"]:checked');
    const modo = modoEl ? modoEl.value : '';
    const ms = [];
    document.querySelectorAll('#itLista [data-it="h"]').forEach((h)=>{
      const i = h.dataset.i;
      const t = document.querySelector('#itLista [data-it="t"][data-i="'+i+'"]');
      const d = document.querySelector('#itLista [data-it="d"][data-i="'+i+'"]');
      ms.push({h:h.value.trim(), t:t?t.value.trim():'', d:d?d.value.trim():''});
    });
    const anterior = ITIN();
    return {modo:modo, momentos:ms.length?ms:ITIN_MS(), imagen:anterior.imagen||''};
  }

  async function subirImagenItinerario(f){
    const fd = new FormData();
    fd.append('file', f);
    fd.append('upload_preset', 'invitame_unsigned');
    fd.append('folder', 'invitame');
    const r = await fetch('https://api.cloudinary.com/v1_1/oc8cgqt4/image/upload', {method:'POST', body:fd});
    const j = await r.json();
    if (j.secure_url) return j.secure_url;
    throw new Error((j.error && j.error.message) || 'Fallo la subida');
  }

  // ---------- 2. INVITADOS ----------
  function filtrada(){
    const q=BUSCA.trim().toLowerCase();
    return GENTE.filter(g=>{
      const e=estadoDe(g);
      if(FILTRO==='si'&&e!=='si')return false;
      if(FILTRO==='no'&&e!=='no')return false;
      if(FILTRO==='sin'&&e!=='sin')return false;
      if(!q) return true;
      return (String(g.nombre||'')+' '+mesaDe(g)).toLowerCase().indexOf(q)>-1;
    });
  }
  function vInvitados(){
    const lista=filtrada();
    $('vista').innerHTML = bloqueNumeros()+
      '<div class="barrita">'+
        '<div class="buscador"><input type="text" id="buscar" placeholder="Buscar por nombre o mesa…" value="'+esc(BUSCA)+'"></div>'+
        '<button class="filtro'+(FILTRO==='todos'?' on':'')+'" data-f="todos">Todos</button>'+
        '<button class="filtro'+(FILTRO==='si'?' on':'')+'" data-f="si">Confirmaron</button>'+
        '<button class="filtro'+(FILTRO==='no'?' on':'')+'" data-f="no">No pueden</button>'+
        '<button class="filtro'+(FILTRO==='sin'?' on':'')+'" data-f="sin">Sin responder</button>'+
        '<button class="accion" id="cargarPase">+ Cargar pases</button>'+
        '<button class="lnk" id="bajar">Descargar lista</button>'+
      '</div>'+
      '<div class="tablaWrap">'+
        (lista.length ? '<table><thead><tr>'+
          '<th>Invitado</th><th>Personas</th><th>Mesa</th><th class="ocultar-chico">Usos</th>'+
          '<th>Estado</th><th class="ocultar-chico">Mensaje</th><th>Compartir</th>'+
        '</tr></thead><tbody>'+ lista.map((g,i)=>{
          const e=estadoDe(g);
          return '<tr class="'+(i%2?'par':'')+'">'+
            '<td><button class="lapiz" data-ver="'+esc(g.token)+'" title="Ver ficha">&#9998;</button><b>'+esc(g.nombre)+'</b></td>'+
            '<td>'+personasDe(g)+' <span style="color:var(--muted);font-size:11.5px">de '+num(g.pases)+'</span></td>'+
            '<td><input class="mini mesaInput" data-tok="'+esc(g.token)+'" value="'+esc(nombreMesa(mesaDe(g)))+'" placeholder="—"></td>'+
            '<td class="ocultar-chico">'+num(g.usos)+'/'+(num(g.usosMax)||num(g.pases))+'</td>'+
            '<td><span class="chip '+e+'">'+(e==='si'?'Confirmó ✓':(e==='no'?'No puede':'Sin responder'))+'</span></td>'+
            '<td class="ocultar-chico" style="max-width:210px;color:#6b6058;font-size:12.5px">'+
              (g.rsvpMensaje?'<span title="'+esc(g.rsvpMensaje)+'">'+esc(String(g.rsvpMensaje).slice(0,48))+(String(g.rsvpMensaje).length>48?'…':'')+'</span>':'')+'</td>'+
            '<td><div class="comp">'+
              '<button data-wa="'+esc(g.token)+'" title="Enviar por WhatsApp">&#128241;</button>'+
              '<button data-tg="'+esc(g.token)+'" title="Enviar por Telegram">&#9992;</button>'+
              '<button data-cp="'+esc(g.token)+'" title="Copiar el link">&#128203;</button>'+
            '</div></td></tr>';
        }).join('')+'</tbody></table>'
        : '<div class="vacio">No hay invitados que coincidan.</div>')+
      '</div>'+
      '<div class="hint" style="margin-top:10px">Podés cambiar el número de mesa escribiéndolo directo en la tabla. '+
        'Para cambiar nombres o cantidad de personas, escribile a quien te armó la invitación.</div>';
  }

  // ---------- 3. MESAS ----------
  function tarjetaMesa(id, titulo, gente, esSin, cap){
    const total = sumaPers(gente);
    const llena = (!esSin && cap>0 && total>cap);
    return '<div class="mesa'+(esSin?' sinmesa':'')+(llena?' llena':'')+'" data-mesa="'+esc(id)+'">'+
      '<div class="cab">'+
        (esSin ? '<span class="n" style="padding-left:0">Sin mesa</span>'
               : '<input class="n" data-nombre="'+esc(id)+'" value="'+esc(titulo)+'">')+
        '<span class="cuenta">'+total+' '+(total===1?'persona':'personas')+'</span>'+
        (esSin ? '' : '<button class="x" data-borrar="'+esc(id)+'" title="Quitar esta mesa">&times;</button>')+
      '</div>'+
      '<div class="zona" data-zona="'+esc(id)+'">'+
        (gente.length ? gente.map(g=>{const e=estadoDe(g);
          return '<div class="pers" draggable="true" data-tok="'+esc(g.token)+'">'+
            '<span class="pto" style="background:'+colorDe(e)+'"></span>'+
            '<span class="nom">'+esc(g.nombre)+'</span>'+
            '<span class="cant">'+personasDe(g)+'</span>'+
            '<span class="mover">&#10021;</span></div>';}).join('')
          : '<div class="mesaVacia">— vacía —</div>')+
      '</div></div>';
  }
  function vMesas(){
    const cap = num(PANEL.capacidad) || 10;
    const ms = mesasDe();
    $('vista').innerHTML =
      '<div class="barrita">'+
        '<button class="accion" id="nuevaMesa">+ Nueva mesa</button>'+
        '<button class="accion gris" id="bajarMesas">Descargar</button>'+
        '<span style="font-size:12.5px;color:var(--muted);font-weight:700;margin-left:6px">Lugares por mesa</span>'+
        '<input type="number" min="1" id="capMesa" value="'+cap+'" style="width:64px;padding:7px;border-radius:10px">'+
      '</div>'+
      '<div class="refs">'+
        '<span><i style="background:var(--ok)"></i>Asistirán</span>'+
        '<span><i style="background:var(--no)"></i>No asistirán</span>'+
        '<span><i style="background:var(--sin)"></i>Sin confirmar</span>'+
      '</div>'+
      '<div class="aviso">Arrastrá cada invitado a su mesa. Se guarda solo. '+
        'Si una mesa se pasa de lugares, se pone roja.</div>'+
      '<div class="grillaMesas">'+
        tarjetaMesa('', '', sinMesa(), true, cap)+
        ms.map(m=>tarjetaMesa(m.id, m.nombre, enMesa(m.id), false, cap)).join('')+
      '</div>';
    conectarArrastre();
  }
  function conectarArrastre(){
    document.querySelectorAll('.pers').forEach(p=>{
      p.addEventListener('dragstart', e=>{ arrastrando=p.dataset.tok; p.classList.add('arrastrando');
        try{ e.dataTransfer.setData('text/plain', p.dataset.tok); e.dataTransfer.effectAllowed='move'; }catch(_){} });
      p.addEventListener('dragend', ()=>{ arrastrando=null; p.classList.remove('arrastrando'); });
      // en el celular no hay arrastre: al tocar, se elige la mesa de una lista
      p.addEventListener('click', ()=>{ if(window.matchMedia('(max-width:820px)').matches) elegirMesa(p.dataset.tok); });
    });
    document.querySelectorAll('.zona').forEach(z=>{
      z.addEventListener('dragover', e=>{ e.preventDefault(); z.classList.add('sobre'); });
      z.addEventListener('dragleave', ()=> z.classList.remove('sobre'));
      z.addEventListener('drop', e=>{ e.preventDefault(); z.classList.remove('sobre');
        const tok = arrastrando || (e.dataTransfer && e.dataTransfer.getData('text/plain'));
        if(tok) moverA(tok, z.dataset.zona); });
    });
  }
  async function moverA(token, mesaId){
    const a = Object.assign({}, asigDe());
    // Vacío en vez de borrar la clave: así la diseñadora sabe que lo sacaron a propósito.
    a[token] = mesaId ? String(mesaId) : '';
    PANEL.asig = a; vMesas();
    await guardarPanel({asig:a});
  }
  function elegirMesa(token){
    const ms = mesasDe();
    if(!ms.length){ alert('Primero creá una mesa con "+ Nueva mesa".'); return; }
    const g = GENTE.find(x=>x.token===token); if(!g) return;
    const op = ms.map((m,i)=>(i+1)+') '+m.nombre).join('\n');
    const r = prompt('¿A qué mesa va '+g.nombre+'?\n\n'+op+'\n\n0) Sacarlo de la mesa', '1');
    if(r===null) return;
    const n = parseInt(r,10);
    if(n===0) return moverA(token,'');
    if(n>=1 && n<=ms.length) moverA(token, ms[n-1].id);
  }
  async function nuevaMesa(){
    const ms = mesasDe().slice();
    const id = 'm'+Date.now().toString(36);
    ms.push({id, nombre:'Mesa '+(ms.length+1)});
    PANEL.mesas = ms; vMesas();
    await guardarPanel({mesas:ms});
  }
  async function borrarMesa(id){
    const gente = enMesa(id);
    if(gente.length && !confirm('Esa mesa tiene '+gente.length+' invitado(s). Se van a quedar sin mesa. ¿Seguimos?')) return;
    const ms = mesasDe().filter(m=>m.id!==id);
    const a = Object.assign({}, asigDe());
    Object.keys(a).forEach(k=>{ if(a[k]===String(id)) delete a[k]; });
    PANEL.mesas=ms; PANEL.asig=a; vMesas();
    await guardarPanel({mesas:ms, asig:a});
  }
  async function renombrarMesa(id, nombre){
    const ms = mesasDe().map(m => m.id===id ? Object.assign({},m,{nombre:nombre||'Mesa'}) : m);
    PANEL.mesas = ms;
    await guardarPanel({mesas:ms});
  }

  // ---------- 4. MENSAJES ----------
  function vMensajes(){
    const con = GENTE.filter(g=>g.rsvpMensaje);
    $('vista').innerHTML = con.length
      ? '<div class="grillaMsj">'+con.map(g=>{const e=estadoDe(g);
          return '<div class="msj"><div class="de">'+esc(g.nombre)+'</div>'+
            '<div style="margin-bottom:9px"><span class="chip '+e+'">'+
              (e==='si'?'Asistirá':(e==='no'?'No asistirá':'Sin responder'))+'</span></div>'+
            '<div class="txt">“'+esc(g.rsvpMensaje)+'”</div>'+
            '<div class="pie">'+esc(fechaCorta(g.rsvpAt))+'</div></div>';}).join('')+'</div>'
      : '<div class="card"><div class="vacio">Todavía no te dejaron mensajes.<br>'+
        '<span style="font-size:12.5px">Aparecen acá cuando un invitado escribe algo al confirmar.</span></div></div>';
  }
  function fechaCorta(ts){
    try{
      let d = null;
      if(!ts) return '';
      if(ts.seconds) d = new Date(ts.seconds*1000);
      else if(ts.toDate) d = ts.toDate();
      else d = new Date(ts);
      if(isNaN(d.getTime())) return '';
      return String(d.getDate()).padStart(2,'0')+'/'+String(d.getMonth()+1).padStart(2,'0')+
             ' · '+String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0');
    }catch(e){ return ''; }
  }

  // ---------- 5. QR PARA IMPRIMIR ----------
  function vQR(){
    $('vista').innerHTML =
      '<div class="barrita"><button class="accion" id="imprimir">Imprimir esta hoja</button></div>'+
      '<div class="aviso">Una fila por invitado, con su link y su código. Sirve para imprimir '+
        'y repartir en mano, o para pegar en un sobre.</div>'+
      '<div class="hojaQR"><table><thead><tr><th>Invitado</th><th>Su link</th><th>Código</th></tr></thead><tbody>'+
        GENTE.map(g=>'<tr><td><b>'+esc(g.nombre)+'</b><br><span style="color:var(--muted);font-size:12px">'+
          num(g.pases)+' '+(num(g.pases)===1?'lugar':'lugares')+'</span></td>'+
          '<td class="lk">'+esc(linkDe(g))+'</td>'+
          '<td><div class="qrbox" data-qr="'+esc(linkDe(g))+'"></div></td></tr>').join('')+
      '</tbody></table></div>';
    // los códigos se dibujan acá, en el navegador: no viaja nada a ningún servidor de afuera
    document.querySelectorAll('.qrbox').forEach(b=>{
      try{ new QRCode(b,{text:b.dataset.qr,width:130,height:130,correctLevel:QRCode.CorrectLevel.M}); }
      catch(e){ b.textContent='—'; }
    });
  }

  // ---------- 6. OPCIONES ----------
  function vOpciones(){
    const msj = PANEL.msjCompartir || 'Te esperamos en nuestro gran día. Acá está tu invitación:';
    $('vista').innerHTML =
      '<div class="card" style="max-width:560px">'+
        '<h3>Mensaje para compartir</h3>'+
        '<p style="font-size:13px;color:var(--muted);margin:0 0 10px">Es el texto que se manda junto '+
          'con el link cuando tocás el botón de WhatsApp o Telegram en la lista de invitados.</p>'+
        '<textarea id="msjComp" rows="3">'+esc(msj)+'</textarea>'+
        '<button class="btn" id="guardarOps" style="max-width:200px">Guardar</button>'+
      '</div>'+
      '<div class="card" style="max-width:560px">'+
        '<h3>Tu invitación</h3>'+
        '<p style="font-size:13px;color:#6b6058;margin:0 0 10px">Dirección: <b>'+esc(SLUG)+'</b></p>'+
        '<button class="accion gris" id="verInv2">Abrir mi invitación</button>'+
      '</div>'+
      '<div class="card" style="max-width:560px">'+
        '<h3>Cosas que no podés cambiar desde acá</h3>'+
        '<p style="font-size:13px;color:#6b6058;margin:0;line-height:1.6">Los nombres de tus invitados, '+
          'cuántos lugares tiene cada uno, y el diseño de la invitación los maneja quien te la armó. '+
          'Escribile y lo cambia en el momento. Vos manejás las mesas, que es lo que se mueve todo el tiempo.</p>'+
      '</div>';
  }

  // ---------- alta de un invitado nuevo ----------
  function ventanaNuevoPase(){
    const f=document.createElement('div');
    f.className='fondo'; f.id='ventPase';
    f.innerHTML =
      '<div class="vent">'+
        '<h3>Nuevo pase de invitado</h3>'+
        '<p style="font-size:12.5px;color:var(--text-secondary);margin:0 0 6px">'+
          'Se crea con su código QR al instante.</p>'+
        '<label>Nombre</label><input type="text" id="np-nombre" placeholder="Familia Pérez">'+
        '<div class="fila">'+
          '<div><label>Personas</label><input type="number" id="np-personas" min="1" max="30" value="1"></div>'+
          '<div><label>Número de mesa</label><input type="text" id="np-mesa" placeholder="—"></div>'+
        '</div>'+
        '<label>Cantidad de usos</label><input type="number" id="np-usos" min="1" max="30" value="1">'+
        '<div class="hint">Cuántas veces se puede escanear su QR en la puerta. '+
          'Normalmente, igual que la cantidad de personas.</div>'+
        '<label>Descripción personas</label>'+
        '<input type="text" id="np-desc" placeholder="Ej: 2 adultos y 1 niño">'+
        '<label>Mensaje</label><textarea id="np-msj" rows="2" placeholder="Opcional"></textarea>'+
        '<div class="err" id="np-err"></div>'+
        '<div class="pie">'+
          '<button class="btn gris" id="np-cerrar">Cerrar</button>'+
          '<button class="btn" id="np-guardar">Guardar</button>'+
        '</div>'+
      '</div>';
    document.body.appendChild(f);
    const per=f.querySelector('#np-personas'), uso=f.querySelector('#np-usos');
    per.addEventListener('input',()=>{ uso.value=per.value; });
    f.querySelector('#np-cerrar').addEventListener('click',()=>f.remove());
    f.addEventListener('click',e=>{ if(e.target===f) f.remove(); });
    f.querySelector('#np-guardar').addEventListener('click',()=>guardarNuevoPase(f));
    f.querySelector('#np-nombre').focus();
  }

  async function guardarNuevoPase(f){
    const err=f.querySelector('#np-err');
    const nombre=f.querySelector('#np-nombre').value.trim();
    if(!nombre){ err.textContent='Poneles un nombre.'; return; }
    const btn=f.querySelector('#np-guardar');
    btn.disabled=true; btn.textContent='Creando…'; err.textContent='';
    try{
      const r=await fetch('/pase-nuevo.php',{
        method:'POST', headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          slug:SLUG, clave:CLAVE, nombre,
          personas:parseInt(f.querySelector('#np-personas').value,10)||1,
          mesa:f.querySelector('#np-mesa').value.trim(),
          usos:parseInt(f.querySelector('#np-usos').value,10)||1,
          desc:f.querySelector('#np-desc').value.trim(),
          mensaje:f.querySelector('#np-msj').value.trim()
        })
      });
      const j=await r.json();
      if(!j.ok){
        const porQue={
          'clave':'No pudimos verificar tu clave. Volvé a entrar al panel.',
          'sin-config':'Falta terminar una configuración del sistema. Escribinos.',
          'login':'El sistema no pudo conectarse. Escribinos.',
          'faltan-datos':'Falta el nombre.'
        };
        err.textContent = porQue[j.error] || 'No se pudo crear. Probá de nuevo.';
        btn.disabled=false; btn.textContent='Guardar';
        return;
      }
      f.remove();
      PANEL.tokens=(PANEL.tokens||[]).concat([j.token]);
      await cargar();
      toast('Invitado creado');
    }catch(e){
      console.error(e);
      err.textContent='No se pudo crear. Revisá tu conexión.';
      btn.disabled=false; btn.textContent='Guardar';
    }
  }

  // ---------- descargas ----------
  function bajarCSV(nombre, filas){
    const csv = filas.map(f => f.map(c => '"'+String(c==null?'':c).replace(/"/g,'""')+'"').join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿'+csv], {type:'text/csv;charset=utf-8'}));
    a.download = nombre; a.click(); URL.revokeObjectURL(a.href);
  }
  function bajarLista(){
    bajarCSV('invitados-'+SLUG+'.csv',
      [['Invitado','Lugares','Vienen','Mesa','Usos','Estado','Mensaje']].concat(
        filtrada().map(g=>{ const e=estadoDe(g);
          return [g.nombre, num(g.pases), personasDe(g), nombreMesa(mesaDe(g)), num(g.usos)+'/'+(num(g.usosMax)||num(g.pases)),
                  e==='si'?'Confirmó':(e==='no'?'No puede':'Sin responder'), g.rsvpMensaje||'']; })));
  }
  function bajarMesas(){
    const filas=[['Mesa','Invitado','Personas','Estado']];
    mesasDe().forEach(m => enMesa(m.id).forEach(g=>{ const e=estadoDe(g);
      filas.push([m.nombre, g.nombre, personasDe(g), e==='si'?'Confirmó':(e==='no'?'No puede':'Sin responder')]); }));
    sinMesa().forEach(g=>{ const e=estadoDe(g);
      filas.push(['Sin mesa', g.nombre, personasDe(g), e==='si'?'Confirmó':(e==='no'?'No puede':'Sin responder')]); });
    bajarCSV('mesas-'+SLUG+'.csv', filas);
  }

  // =====================================================================
  //  EVENTOS (uno solo, delegado: la vista se redibuja todo el tiempo)
  // =====================================================================
  function textoCompartir(g){
    const base = PANEL.msjCompartir || 'Te esperamos en nuestro gran día. Acá está tu invitación:';
    return base + ' ' + linkDe(g);
  }
  document.addEventListener('click', async e=>{
    const t = e.target.closest('button, a[data-vista], .lnk');
    if(!t) return;

    if(t.dataset && t.dataset.vista){ VISTA=t.dataset.vista; $('lat').classList.remove('abierto'); pintar(); return; }
    if(t.dataset && t.dataset.ir){ VISTA=t.dataset.ir; pintar(); return; }
    if(t.dataset && t.dataset.f){ FILTRO=t.dataset.f; pintar(); return; }

    if(t.id==='cargarPase') return ventanaNuevoPase();
    if(t.id==='bajar')      return bajarLista();
    if(t.id==='bajarMesas') return bajarMesas();
    if(t.id==='imprimir')   return window.print();
    if(t.id==='nuevaMesa')  return nuevaMesa();
    if(t.id==='verInv' || t.id==='verInv2') return window.open('/i/?e='+encodeURIComponent(SLUG),'_blank');

    if(t.dataset && t.dataset.borrar) return borrarMesa(t.dataset.borrar);

    if(t.dataset && t.dataset.ver){
      const g = GENTE.find(x=>x.token===t.dataset.ver); if(!g) return;
      const e2 = estadoDe(g);
      alert(g.nombre+'\n\n'+
        'Lugares: '+num(g.pases)+'\n'+
        'Vienen: '+personasDe(g)+'\n'+
        'Mesa: '+(nombreMesa(mesaDe(g))||'sin asignar')+'\n'+
        'Entradas usadas: '+num(g.usos)+' de '+(num(g.usosMax)||num(g.pases))+'\n'+
        'Estado: '+(e2==='si'?'Confirmó':(e2==='no'?'No puede venir':'Sin responder'))+
        (g.rsvpMensaje ? '\n\nMensaje que dejó:\n"'+g.rsvpMensaje+'"' : '')+
        '\n\nSu link:\n'+linkDe(g));
      return;
    }
    if(t.dataset && t.dataset.wa){
      const g=GENTE.find(x=>x.token===t.dataset.wa); if(!g) return;
      window.open('https://wa.me/?text='+encodeURIComponent(textoCompartir(g)),'_blank'); return;
    }
    if(t.dataset && t.dataset.tg){
      const g=GENTE.find(x=>x.token===t.dataset.tg); if(!g) return;
      window.open('https://t.me/share/url?url='+encodeURIComponent(linkDe(g))+
        '&text='+encodeURIComponent(PANEL.msjCompartir||''),'_blank'); return;
    }
    if(t.dataset && t.dataset.cp){
      const g=GENTE.find(x=>x.token===t.dataset.cp); if(!g) return;
      try{ await navigator.clipboard.writeText(linkDe(g)); toast('Link copiado'); }
      catch(_){ prompt('Copiá el link:', linkDe(g)); }
      return;
    }
    if(t.id==='guardarOps'){
      const v=$('msjComp').value.slice(0,300);
      PANEL.msjCompartir=v; await guardarPanel({msjCompartir:v}); return;
    }
    // ---- itinerario ----
    if(t.id==='itMas'){
      const it=leerItinerarioDeLaPantalla();
      it.momentos=it.momentos.concat([{h:'',t:'',d:''}]);
      PANEL.itinerario=it; vItinerario(); return;
    }
    if(t.dataset && t.dataset.itdel!=null){
      const it=leerItinerarioDeLaPantalla();
      it.momentos.splice(parseInt(t.dataset.itdel,10),1);
      PANEL.itinerario=it; vItinerario(); return;
    }
    if(t.id==='itSubir'){ $('itFile').click(); return; }
    if(t.id==='itGuardar'){
      const it=leerItinerarioDeLaPantalla();
      t.disabled=true; const antes=t.textContent; t.textContent='Guardando…';
      const ok=await guardarPanel({itinerario:it});
      t.disabled=false; t.textContent=antes;
      if(ok){ PANEL.itinerario=it; vItinerario(); }
      return;
    }
  });

  // la imagen del itinerario (input file: no burbujea el click)
  document.addEventListener('change', async e=>{
    if(e.target.id!=='itFile') return;
    const f=e.target.files && e.target.files[0]; if(!f) return;
    const btn=$('itSubir'); const antes=btn?btn.textContent:'';
    if(btn){ btn.disabled=true; btn.textContent='Subiendo…'; }
    try{
      const url=await subirImagenItinerario(f);
      const it=leerItinerarioDeLaPantalla(); it.imagen=url; it.modo='imagen';
      const ok=await guardarPanel({itinerario:it});
      if(ok){ PANEL.itinerario=it; }
      vItinerario();
    }catch(err){ toast('No pude subir la imagen'); if(btn){ btn.disabled=false; btn.textContent=antes; } }
  });

  // cambiar entre Escrito / Imagen repinta la vista (sin perder lo escrito)
  document.addEventListener('change', e=>{
    if(e.target.name!=='itmodo') return;
    PANEL.itinerario=leerItinerarioDeLaPantalla();
    vItinerario();
  });

  document.addEventListener('input', e=>{
    if(e.target.id==='buscar'){ BUSCA=e.target.value; const p=e.target.selectionStart;
      vInvitados(); const n=$('buscar'); if(n){ n.focus(); try{n.setSelectionRange(p,p);}catch(_){} } }
  });
  document.addEventListener('change', async e=>{
    if(e.target.classList.contains('mesaInput')){
      const v=e.target.value.trim();
      const tok=e.target.dataset.tok;
      // si escribe un número suelto, lo tomamos como nombre de mesa y la creamos si no existe
      let ms=mesasDe().slice(), destino='';
      if(v){
        let m = ms.find(x=>String(x.nombre).toLowerCase()===v.toLowerCase());
        if(!m){ m={id:'m'+Date.now().toString(36), nombre:v}; ms.push(m); PANEL.mesas=ms; }
        destino=m.id;
      }
      const a=Object.assign({}, asigDe());
      a[tok] = destino || '';
      PANEL.asig=a;
      await guardarPanel({mesas:mesasDe(), asig:a});
      pintar(); return;
    }
    if(e.target.dataset && e.target.dataset.nombre)
      return renombrarMesa(e.target.dataset.nombre, e.target.value.trim());
    if(e.target.id==='capMesa'){
      const c=Math.max(1, num(e.target.value)||10);
      PANEL.capacidad=c; await guardarPanel({capacidad:c}); vMesas(); return;
    }
  });
  $('burger').addEventListener('click', ()=> $('lat').classList.toggle('abierto'));

  // =====================================================================
  //  ENTRAR / CARGAR / SALIR
  // =====================================================================
  async function cargar(){
    GENTE = await traerGente(SLUG, PANEL.tokens);
    GENTE.sort((a,b)=>String(a.nombre||'').localeCompare(String(b.nombre||''),'es'));
    // Las mesas que ya venían puestas desde el panel de la diseñadora se convierten en
    // tarjetas de verdad. Si no, esos invitados no aparecían en ninguna parte del tablero.
    {
      const ms = Array.isArray(PANEL.mesas) ? PANEL.mesas.slice() : [];
      const hay = new Set(ms.map(m=>String(m.nombre)));
      const a = asigDe();
      GENTE.forEach(g=>{
        if(Object.prototype.hasOwnProperty.call(a,g.token)) return;
        const n = g.mesa ? String(g.mesa).trim() : '';
        if(n && n!=='-' && !hay.has(n)){ hay.add(n); ms.push({id:'jz'+n.replace(/[^a-zA-Z0-9]/g,'')||'jz', nombre:n}); }
      });
      const cambio = JSON.stringify(ms)!==JSON.stringify(PANEL.mesas||[]);
      PANEL.mesas = ms;
      // Hay que guardarlas: si no, el panel de la diseñadora recibe ids que no conoce.
      if(cambio && ms.length) guardarPanel({mesas:ms});
    }
    pintar();
  }
  async function hacerLogin(slug, clave){
    const p = await traerPanel(slug, clave);
    if(!p) return false;
    SLUG=slug; CLAVE=clave; PANEL=p;
    $('entrar').style.display='none';
    $('panel').style.display='';
    await cargar();
    return true;
  }
  $('btnEntrar').addEventListener('click', async ()=>{
    const slug=limpiarSlug($('slug').value), clave=$('clave').value.trim();
    const err=$('errLogin');
    if(!slug || !clave){ err.textContent='Completá la dirección de tu invitación y tu clave.'; return; }
    err.textContent='Buscando…';
    const ok = await hacerLogin(slug, clave);
    if(ok){ err.textContent=''; try{ localStorage.setItem('inv_panel_novios', JSON.stringify({slug,clave})); }catch(_){} }
    else err.textContent='No encontramos ese panel. Revisá la dirección y la clave.';
  });
  $('clave').addEventListener('keydown', e=>{ if(e.key==='Enter') $('btnEntrar').click(); });
  $('btnRecargar').addEventListener('click', async ()=>{
    const p=await traerPanel(SLUG,CLAVE); if(p) PANEL=p;
    await cargar(); toast('Actualizado');
  });
  $('btnSalir').addEventListener('click', ()=>{
    try{ localStorage.removeItem('inv_panel_novios'); }catch(_){}
    location.href = location.pathname;
  });

  (async function(){
    let g=null; try{ g=JSON.parse(localStorage.getItem('inv_panel_novios')||'null'); }catch(_){}
    if(g && g.slug && g.clave){ if(await hacerLogin(g.slug,g.clave)) return; }
    const qs = new URLSearchParams(location.search).get('e');
    if(qs) $('slug').value = limpiarSlug(qs);
  })();
