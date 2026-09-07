/* ===== ADMIN DE INVÍTAME · parte 1 de 4 · los campos y las tablas =========================

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

  /* ==== ESTRUCTURA REAL (9 pestañas, campos tal cual el admin de Gonza) ==== */
  const FIELDS={
   PRINCIPAL:["Frase principal:","Fecha para Cuenta Regresiva","Tipografía cuenta regresiva:","Posición cuentra regresiva y nombres:","Color de la frase principal:","Frase Larga:","Color frase larga:","Tipografía frase larga:","Tamaño de la frase larga (por defecto automático):","Fondo sección frase larga","Frase final:","Texto final:","Posición frase final:","Color título y texto final:","Foto para el fin de página","Tamaño de la seccion final (por defecto automático):","Deshabilitar sección frase final:","Tipografía principal:","Tipografía secundaria:","Imágen miniatura al compartir","Titulo al compartir:","Descripción al compartir:"],
   LUGAR_VEST:["Titulo sección eventos:","Bajada sección eventos (arriba del título):","Color sección eventos:","Color texto sección eventos:","Color botones sección eventos:","Color texto botones sección eventos:","Transparencia recuadros de texto:","Ceremonia 1 - Titulo:","Ceremonia 1 - Descripción:","Ceremonia 1 - Imagen (JPG 480x320)","Ceremonia 1 - Fecha","Ceremonia 1 - Fecha descripción:","Ceremonia 1 - Dirección:","Ceremonia 1 - Coordenadas:","Ceremonia 2 - Titulo:","Ceremonia 2 - Descripción:","Ceremonia 2 - Imagen (JPG 480x320)","Ceremonia 2 - Fecha","Ceremonia 2 - Fecha descripción:","Ceremonia 2 - Dirección:","Ceremonia 2 - Coordenadas:","Ceremonia 3 - Titulo:","Ceremonia 3 - Descripción:","Ceremonia 3 - Imagen (JPG 480x320)","Ceremonia 3 - Fecha","Ceremonia 3 - Fecha descripción:","Ceremonia 3 - Dirección:","Ceremonia 3 - Coordenadas:","Titulo hoteles:","Imagen hoteles","Descripción hotel:","Datos de hoteles recomendados:","vestimenta titulo:","vestimenta titulo 2:","Bajada dress code (arriba del título):","Fotos de inspiración dress code:","Vestimenta color:","Dresscode Texto:","Dresscode Imagen (aprox JPG 250x250)","Dresscode Texto 2:","Dresscode Imagen 2 (aprox JPG 250x250)","Color de fondo \"donde y cuando\":","Imagen de fondo sección \"donde y cuando\"","Color de fondo Dresscode:","Imagen de fondo sección \"Desscode\"","Título itinerario:","Itinerario descripción:","Itinerario imagen","Itinerario color de fondo:","Imagen de fondo sección \"Itinerario\"","Itinerario color de texto:"],
   GALERIA_INSTA_VID:["Hashtag Instagram (Sin el #):","Color logo y texto seccion Instagram:","Usuario de instragram:","Frase sección instagram:","Fondo sección instagram","URL Video:","Texto \"botón\" \"Ver vídeo\":","Estilo de la galería de fotos:","Titulo para fotos y menú:","Bajada galería (arriba del título):","Color de fondo \"Galería\":","Imagen de fondo sección \"Galería\"","Color de texto \"Galería\":"],
   PERSONAS:["Fondo color Personas:","Imagen de fondo sección \"Personas\"","Transparencia recuadros de personas:","Titulo - Personas importantes:","Color - Personas importantes:","Frase para la sección personas:","Color para la sección personas:"],
   REGALOS:["Color fondo \"Regalos\":","Imagen de fondo sección \"Regalos\"","Imagen decorativa (sobre o regalo)","TITULO SECCIÓN \"REGALOS\" Y MENÚ:","COLOR SECCIÓN \"REGALOS\" Y MENÚ:","Frase para sección regalos (mesa):","Color para sección regalos (mesa):","Datos bancarios para transferencias (Borrar texto en caso de no necesitar):","TEXTO BOTÓN \"Ver datos bancarios\":"],
   "CONFIRMACIÓN":["Color texto Confirmación:","Color fondo Confirmación:","Imagen de fondo sección \"Confirmación\"","Habilitar aviso por mail:","Email para confirmaciones:","TÍTULO DEL CORREO:","CONFIRMAR ASISTENCIA (MENÚ Y TITULOS):","Frase para sección confirmación:","Ocultar Formulario:","Color texto Contacto:","Color fondo Contacto:","Imagen de fondo sección \"Contacto\"","Título Contacto:","Frase para sección contacto:","Número de whatsapp:","Número de whatsapp 2:","Texto corto botón wsp:","Texto corto botón wsp 2:","Mostrar sección de contacto:"],
   MUSIC_PASES:["Música de la web","Color de fondo sección QR:","Imagen fondo QR"],
   AVANZADO:["IDIOMA de la invitación:","Detectar el del celular del invitado:","Mostrar botón para que el invitado elija:","Deshabilitar publicidad de invitame:","Deshabilitar invitación:","Contraseña para el evento:","Clave del panel de los novios:","ES DEMO ?:","NOMBRE DE LA DEMO:","Tipo de evento:","Imagen del logo - 150px ancho / 50px alto","Bloquear control de accesos QR y mesas:","Habilitar trivia:","Pedido especial del cliente:"],
   TRIVIA:["Texto sobre título:","Texto 'Puntos':","Texto 'Pregunta':","Texto del campo para ingresar el nombre:","Texto tabla de resultados:","Texto botón \"Iniciar Sesión\":","Texto \"Hola\" antes del nombre:","Texto botón \"Comenzar trivia\":","Texto botón \"Cerrar sesion\":","Texto \"No sos\" para cerrar sesión:","Texto columna \"Nombre\" en tabla de resultados:","Texto \"tabla de posiciones\":","Color 1 titulo trivia:","Color 2 titulo trivia:"]
  };
  FIELDS.EFECTOS=[];
  // VERSIÓN ACTUAL de la plataforma. Cada invitación se publica clavada a una versión
  // y NO cambia cuando mejoramos el sistema (pedido de Jazmín, pág. 35).
  // VERSION del motor de la invitacion. Cada invitacion queda CLAVADA a la version con
  // la que se publico: index.php sirve i/v/{VERSION}/index.html si esa carpeta existe.
  // Asi, cuando cambiamos el motor, las invitaciones ya entregadas NO se enteran.
  // AL SUBIR ESTE NUMERO HAY QUE CREAR LA CARPETA i/v/{nueva-version}/index.html.
  const VERSION='2026-09-07';
  // Primera version del motor que sabe pedirle al servidor un evento privado.
  // Una invitacion clavada a una version anterior NO entiende el candado nuevo, asi que
  // al ponerle clave se la sube a esta (con aviso). Ver "invitacion privada" mas abajo.
  const VER_CANDADO_SERVIDOR='2026-08-11b';
  const ORDER=["PRINCIPAL","LUGAR_VEST","GALERIA_INSTA_VID","PERSONAS","REGALOS","CONFIRMACIÓN","MUSIC_PASES","AVANZADO","TRIVIA","EFECTOS","INVITADOS"];
  /* Lista CURADA: solo fuentes que la invitación carga sí o sí (ver <link> en i/index.html). Menos, pero TODAS funcionan. */
  const FONTS=[["'Great Vibes',cursive","Great Vibes ✒"],["'Rouge Script',cursive","Rouge Script ✒"],["'Dancing Script',cursive","Dancing Script ✒"],["'Parisienne',cursive","Parisienne ✒"],["'Tangerine',cursive","Tangerine ✒"],["'Sacramento',cursive","Sacramento ✒"],["'Cormorant Garamond',serif","Cormorant"],["'Playfair Display',serif","Playfair Display"],["'Forum',serif","Forum"],["'Marcellus',serif","Marcellus"],["'EB Garamond',serif","EB Garamond"],["'Lora',serif","Lora"],["'Cinzel',serif","Cinzel"],["'Prata',serif","Prata"],["'Montserrat',sans-serif","Montserrat"],["'Poppins',sans-serif","Poppins"],["'Jost',sans-serif","Jost"]];
  const TEMAS={rustica:{n:"Rústica",v:"#2e433c",v2:"#26372f",lino:"#f4efe6",sage:"#7f9079",fD:"'Forum',serif",fS:"'Rouge Script',cursive",sw:"#2e433c"},uva:{n:"Uva",v:"#5b2a4e",v2:"#43203a",lino:"#f6efe8",sage:"#a06d92",fD:"'Cormorant Garamond',serif",fS:"'Great Vibes',cursive",sw:"#5b2a4e"},blanco:{n:"Blanco",v:"#5f574d",v2:"#463f37",lino:"#efece7",sage:"#b7ad9e",fD:"'Playfair Display',serif",fS:"'Cormorant Garamond',serif",sw:"#5f574d"},xv:{n:"XV Rosa",v:"#b06a7e",v2:"#8a4f60",lino:"#f7eef0",sage:"#c9a0b0",fD:"'Cormorant Garamond',serif",fS:"'Great Vibes',cursive",sw:"#b06a7e"},boho:{n:"Boho",v:"#a5674f",v2:"#8a5240",lino:"#f4ebde",sage:"#b98c6a",fD:"'Cormorant Garamond',serif",fS:"'Tangerine',cursive",sw:"#a5674f"}};
  const D={n1:"María",n2:"Diego",layout:"apilados",kick:"Nuestra Boda",fecha:"2026-11-28T12:00",frase:"Hay un instante en la vida en que se decide caminar juntos para siempre.",cer:"Basílica de Santa María",pnom:"Hugo y Lucía",tema:"rustica",tpl:"Rústica Campestre",slug:"maria-y-diego",color:"#2e433c",ncolor:"#fbf7ef",nsize:"52",nfont:"'Rouge Script',cursive",fTit:"'Forum',serif",cover:"https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&q=80",cx:50,cy:45,cz:100,invitados:[]};
  D.trivia=[{q:'¿Dónde se conocieron?',o:['En un viaje','En la facultad','En el trabajo'],c:0},{q:'¿Primer viaje juntos?',o:['Brasil','Bariloche','Europa'],c:1},{q:'¿Quién dijo te amo primero?',o:['Ella','Él'],c:1}];
  // ==== EFECTOS (todo personalizable: on/off, color, texto, tipografía) ====
  const FXD={
    sobre:{relieve:true,textura:'lino',color:'#efe6d2',sello:true,selloColor:'#3a5643',ini:'',emblema:'iniciales',tipo:'clasico',modelo:'',colorCarta:''},
    particulas:{on:true,tipo:'hoja',color:'auto',densidad:'suave'},
    carta:{on:true,sobreColor:'',kicker:'Con cariño',titulo:'Queridos amigos y familia',texto:'Hoy queremos compartir con ustedes uno de los días más felices de nuestras vidas. Gracias por acompañarnos en este camino de amor.',fuente:'Lora',colorTexto:'#5a5145'},
    ambiente:{on:true,tipo:'nubes',colorTop:'#cfe4f2',colorBot:'#eaf4fb',seccion:'itinerario'},
    diseno:{cortes:'',textura:'',adorno:'',adornoCustom:''}
  };
  const MOTIFS=[
   {id:'',name:'Ninguno',svg:''},
   {id:'linea',name:'Línea + punto',svg:'<g fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><line x1="24" y1="22" x2="52" y2="22"/><line x1="68" y1="22" x2="96" y2="22"/></g><circle cx="60" cy="22" r="3.2" fill="currentColor"/>'},
   {id:'puntos',name:'Tres puntos',svg:'<g stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><line x1="20" y1="22" x2="40" y2="22"/><line x1="80" y1="22" x2="100" y2="22"/></g><g fill="currentColor"><circle cx="50" cy="22" r="2.4"/><circle cx="60" cy="22" r="3.2"/><circle cx="70" cy="22" r="2.4"/></g>'},
   {id:'rombo',name:'Rombo',svg:'<g fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><line x1="18" y1="22" x2="46" y2="22"/><line x1="74" y1="22" x2="102" y2="22"/></g><g fill="currentColor"><path d="M60 14 L66 22 L60 30 L54 22 Z"/><circle cx="49" cy="22" r="1.6"/><circle cx="71" cy="22" r="1.6"/></g>'},
   {id:'ondas',name:'Onda',svg:'<path d="M30 22 Q40 14 50 22 T70 22 T90 22" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>'},
   {id:'hojas',name:'Ramita',svg:'<path d="M60 8 C60 20 60 30 60 37" stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"/><g fill="currentColor" opacity=".9"><ellipse cx="53" cy="15" rx="5" ry="2.3" transform="rotate(-32 53 15)"/><ellipse cx="67" cy="15" rx="5" ry="2.3" transform="rotate(32 67 15)"/><ellipse cx="52" cy="23" rx="5.6" ry="2.6" transform="rotate(-28 52 23)"/><ellipse cx="68" cy="23" rx="5.6" ry="2.6" transform="rotate(28 68 23)"/><ellipse cx="54" cy="31" rx="4.6" ry="2.2" transform="rotate(-26 54 31)"/><ellipse cx="66" cy="31" rx="4.6" ry="2.2" transform="rotate(26 66 31)"/></g>'},
   {id:'laurel',name:'Laurel',svg:'<g stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"><path d="M60 37 C45 33 37 24 39 11"/><path d="M60 37 C75 33 83 24 81 11"/></g><g fill="currentColor" opacity=".85"><ellipse cx="45" cy="20" rx="3.4" ry="1.7" transform="rotate(50 45 20)"/><ellipse cx="42" cy="27" rx="3.4" ry="1.7" transform="rotate(50 42 27)"/><ellipse cx="75" cy="20" rx="3.4" ry="1.7" transform="rotate(-50 75 20)"/><ellipse cx="78" cy="27" rx="3.4" ry="1.7" transform="rotate(-50 78 27)"/></g>'},
   {id:'flor',name:'Flor',svg:'<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><line x1="16" y1="22" x2="44" y2="22"/><line x1="76" y1="22" x2="104" y2="22"/></g><g fill="currentColor"><ellipse cx="60" cy="14" rx="2.6" ry="5"/><ellipse cx="67.6" cy="19.5" rx="2.6" ry="5" transform="rotate(72 67.6 19.5)"/><ellipse cx="64.7" cy="28.5" rx="2.6" ry="5" transform="rotate(144 64.7 28.5)"/><ellipse cx="55.3" cy="28.5" rx="2.6" ry="5" transform="rotate(216 55.3 28.5)"/><ellipse cx="52.4" cy="19.5" rx="2.6" ry="5" transform="rotate(288 52.4 19.5)"/></g><circle cx="60" cy="22" r="2.2" fill="currentColor"/>'},
   {id:'corazon',name:'Corazón',svg:'<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><line x1="18" y1="22" x2="46" y2="22"/><line x1="74" y1="22" x2="102" y2="22"/></g><path d="M60 31 C50 23 52 14 58 16 C60 16.6 60 18 60 18 C60 18 60 16.6 62 16 C68 14 70 23 60 31 Z" fill="currentColor"/>'},
   {id:'anillos',name:'Anillos',svg:'<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><line x1="14" y1="22" x2="40" y2="22"/><line x1="80" y1="22" x2="106" y2="22"/></g><g fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="55" cy="22" r="7.5"/><circle cx="66" cy="22" r="7.5"/></g>'},
   {id:'estrella',name:'Destello',svg:'<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><line x1="16" y1="22" x2="42" y2="22"/><line x1="78" y1="22" x2="104" y2="22"/></g><path d="M60 9 C61.5 18.5 62 20.5 71 22 C62 23.5 61.5 25.5 60 35 C58.5 25.5 58 23.5 49 22 C58 20.5 58.5 18.5 60 9 Z" fill="currentColor"/>'},
   {id:'luna',name:'Luna',svg:'<path d="M65 11 A11 11 0 1 0 65 33 A8.6 8.6 0 1 1 65 11 Z" fill="currentColor"/><g fill="currentColor"><path d="M44 16 l1.2 3 3 1.2 -3 1.2 -1.2 3 -1.2 -3 -3 -1.2 3 -1.2 z"/><circle cx="48" cy="30" r="1.3"/></g>'},
   {id:'sol',name:'Sol',svg:'<path d="M46 31 A14 14 0 0 1 74 31" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><g stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><line x1="60" y1="8" x2="60" y2="14"/><line x1="49" y1="12" x2="52" y2="17"/><line x1="71" y1="12" x2="68" y2="17"/><line x1="40" y1="22" x2="45" y2="24"/><line x1="80" y1="22" x2="75" y2="24"/></g>'},
   {id:'trigo',name:'Espigas',svg:'<g stroke="currentColor" stroke-width="1.3" fill="none" stroke-linecap="round"><path d="M60 37 V12"/><path d="M60 16 l-6 -4 M60 16 l6 -4 M60 22 l-6 -4 M60 22 l6 -4 M60 28 l-6 -4 M60 28 l6 -4"/></g>'},
   {id:'ampersand',name:'&',svg:'<g fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"><line x1="16" y1="22" x2="42" y2="22"/><line x1="78" y1="22" x2="104" y2="22"/></g><text x="60" y="31" text-anchor="middle" font-family="Great Vibes, cursive" font-size="28" fill="currentColor">&amp;</text>'},
   {id:'arco',name:'Arco',svg:'<path d="M42 34 A18 18 0 0 1 78 34" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="60" cy="16" r="2.4" fill="currentColor"/>'}
  ];
  function ensureFX(){ D.fx=D.fx||{}; for(const k in FXD){ D.fx[k]=Object.assign({},FXD[k],D.fx[k]||{}); } }
  ensureFX();
  const el=i=>document.getElementById(i);
  const slug=s=>s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,40);

  function typeFor(l){
    if(/color/i.test(l))return'c';
    if(/imagen|imágen|foto|ícono|icono|miniatura|música|galería de fotos|fondo secc|logo/i.test(l))return'f';
    if(/^prender o apagar/i.test(l))return'sel-menu';
    if(/personalizada.*google font|link google font|personalizada \(link/i.test(l))return'font-custom';
    if(/tipograf/i.test(l))return'sel-font';
    if(/detectar el del celular|bot[oó]n para que el invitado elija/i.test(l))return'k';
    if(/idioma/i.test(l))return'sel-idioma';
    if(/usuario asignado/i.test(l))return'sel-user';
    if(/tipo de evento/i.test(l))return'sel-tipo';
    if(/estilo de la galer/i.test(l))return'sel-galeria';
    if(/posici[oó]n/i.test(l))return'sel-pos';
    if(/deshabilitar|ocultar|es demo|habilitar|bloquear|usar en el cat|mostrar secc/i.test(l))return'k';
    if(/transparencia|tama[ñn]o/i.test(l))return'r';
    if(/fecha/i.test(l)&&!/descrip/i.test(l))return'd';   // "Fecha descripción" = texto libre, no calendario
    if(/datos de hoteles|datos bancarios|descripci[oó]n|frase|texto secc|dresscode texto|itinerario descrip/i.test(l))return'a';
    return't';
  }
  // Cada campo del panel necesita una clave donde guardar su valor.
  // Los que no tienen una asignada a mano reciben una automática y estable,
  // derivada de su propia etiqueta. Así NINGÚN campo queda sin guardar.
  function claveDe(l){ return BIND[l] || ('c_'+slug(l)); }
  function fieldHtml(l){
    const t=typeFor(l),id='f-'+slug(l),bind=claveDe(l);
    const oi=bind?(' oninput="setB(\''+bind+'\',this.value)"'):'';
    let inp;
    if(t==='c')inp='<input type="color" id="'+id+'"'+oi+' value="'+((bind&&D[bind])?D[bind]:'#2e433c')+'">';
    else if(t==='f'){const _k=bind?('img_'+bind):('img_'+id);inp='<div class="file" onclick="this.nextElementSibling.click()">⬆ Subir imagen · '+l.replace(/\(.*?\)/,'').trim()+'</div><input type="file" accept="image/*" style="display:none" onchange="subirImg(this,\''+_k+'\',\''+id+'\')"><div id="prev-'+id+'">'+(D[_k]?'<img src="'+D[_k]+'" style="max-height:60px;border-radius:8px;margin-top:6px">':'')+'</div>';}
    else if(t==='font-custom'){const _tg=/secundaria/i.test(l)?'fTit':'nfont';inp='<input type="text" id="'+id+'" placeholder="Nombre o link de Google Fonts (ej: Great Vibes)" oninput="cargarFontCustom(this.value,\''+_tg+'\')">';}
    else if(t==='k'){const _b=claveDe(l);   // antes usaba solo BIND: las casillas sin BIND no guardaban
      inp='<label class="chk"><input type="checkbox"'+(_b?(' onchange="setB(\''+_b+'\',this.checked)"'):'')+((_b&&D[_b])?' checked':'')+'> Activar</label>';}
    else if(t==='r'){const _v=(bind&&D[bind]!=null)?D[bind]:50;
      inp='<input type="range" min="0" max="100" value="'+_v+'"'+(bind?(' oninput="setB(\''+bind+'\',this.value)"'):'')+'>';}
    else if(t==='a')inp='<textarea id="'+id+'"'+oi+'>'+((bind&&D[bind]!=null)?D[bind]:'')+'</textarea>';
    else if(t==='d')inp='<input type="datetime-local" id="'+id+'"'+oi+(bind==='fecha'?' value="2026-11-28T12:00"':'')+'>';
    else if(t.startsWith('sel')){
      let o=[];
      if(t==='sel-font')o=FONTS.map(f=>'<option value="'+f[0]+'">'+f[1]+'</option>');
      else if(t==='sel-menu')o=['Prendido','Apagado'].map(x=>'<option>'+x+'</option>');
      else if(t==='sel-idioma'){const _ac=(D.idioma||'Español (México)');o=['Español (México)','Inglés','Portugués','Francés','Alemán','Italiano'].map(x=>'<option'+(x===_ac?' selected':'')+'>'+x+'</option>');}
      else if(t==='sel-user')o=['Otro','Jime','Vale','Aylen','Flor'].map(x=>'<option>'+x+'</option>');
      else if(t==='sel-tipo')o=['Otro','Boda','Cumple XV','InvitameKids','Empresarial'].map(x=>'<option>'+x+'</option>');
      else if(t==='sel-galeria')o=['Slider','Mosaico'].map(x=>'<option>'+x+'</option>');
      else o=['Abajo','Centrado','Arriba'].map(x=>'<option>'+x+'</option>');
      const _sv=(bind&&D[bind]!=null)?String(D[bind]):null;
      if(_sv!=null) o=o.map(function(op){
        const m=op.match(/>([^<]*)</); return (m&&m[1]===_sv)? op.replace('<option','<option selected') : op; });
      inp='<select id="'+id+'"'+oi+'>'+o.join('')+'</select>';
    }
    else {let _v=(bind&&D[bind]!=null)?D[bind]:(bind==='n1'?'María':bind==='n2'?'Diego':bind==='kick'?'Nuestra Boda':'');inp='<input type="text" id="'+id+'" value="'+String(_v).replace(/"/g,'&quot;')+'"'+oi+'>';}
    const _h=HINTS[l]?'<div class="hint">'+HINTS[l]+'</div>':'';
    return '<div class="grp"><label>'+l+'</label>'+inp+_h+'</div>';
  }
  // Ayudas cortas para las chicas — se muestran debajo del campo
  const HINTS={
    /* ---- TRIVIA: los 14 campos que hasta el 7/9/2026 no hacían nada ------
       Ahora cada uno cambia UN texto de la trivia. Se leen en i/index.html,
       en el bloque "los 14 textos y colores de la pestaña TRIVIA". */
    "Texto sobre título:":"El textito chico que va ARRIBA del título Trivia (ej: ¡Juega con nosotros!).",
    "Texto 'Puntos':":"Cómo se escribe la palabra de los puntos (ej: pts, puntos). Aparece en el marcador, en el resultado y en la tabla.",
    "Texto 'Pregunta':":"La palabra que va antes del número: «Pregunta 1 de 5». Sirve para traducirla.",
    "Texto del campo para ingresar el nombre:":"El texto gris que se ve DENTRO del casillero donde el invitado escribe su nombre (ej: Escribe tu nombre).",
    "Texto tabla de resultados:":"El rótulo que va arriba del puntaje al terminar (ej: Tu puntaje).",
    "Texto botón \"Iniciar Sesión\":":"Lo que dice el botón para entrar a jugar.",
    "Texto \"Hola\" antes del nombre:":"El saludo que aparece antes del nombre del invitado (ej: ¡Hola). El nombre lo agrega la invitación.",
    "Texto botón \"Comenzar trivia\":":"Lo que dice el botón que arranca las preguntas.",
    "Texto botón \"Cerrar sesion\":":"Lo que dice el link para salir y que juegue otra persona en el mismo celular.",
    "Texto \"No sos\" para cerrar sesión:":"La frase al lado de ese link (ej: ¿No eres tú?).",
    "Texto columna \"Nombre\" en tabla de resultados:":"El encabezado de la columna de nombres en la tabla.",
    "Texto \"tabla de posiciones\":":"El rótulo que va arriba de la tabla al terminar (ej: Tabla de posiciones).",
    "Color 1 titulo trivia:":"El color del título Trivia.",
    "Color 2 titulo trivia:":"El color del textito de arriba del título.",
    "IDIOMA de la invitación:":"El idioma con el que SIEMPRE abre la invitación. Por defecto Español (México). Es lo que ve el invitado si no activás nada más.",
    "Detectar el del celular del invitado:":"Si lo activás, la invitación se abre sola en el idioma del celular del invitado (si lo tenemos traducido). Si está apagado, siempre abre en el idioma de arriba.",
    "Mostrar botón para que el invitado elija:":"Si lo activás, aparece un botón 🌐 arriba a la izquierda para que el invitado cambie el idioma a mano.",
    "Pagina (minúsculas sin espacios ni símbolos):":"Es la dirección del link (ej: maria-y-diego). Cada pareja tiene que tener una distinta. Sin espacios, sin tildes, sin símbolos.",
    "Protagonista 1:":"Nombre de la primera persona (ej: María). Aparece en la portada.",
    "Protagonista 2:":"Nombre de la segunda persona (ej: Diego).",
    "Foto principal (JPG 2000x1200)":"Foto de fondo de la portada (la primera pantalla). Horizontal y de buena calidad.",
    "Imágen miniatura al compartir":"📲 MUY IMPORTANTE: es la foto que se ve cuando mandás el link por WhatsApp. Subí una foto linda y horizontal de la pareja. Si la dejás vacía, se usa la foto de portada.",
    "Titulo al compartir:":"El título que aparece en la vista previa de WhatsApp (ej: María & Diego — Nuestra Boda).",
    "Descripción al compartir:":"El textito que aparece debajo del título en la vista previa de WhatsApp.",
    "Fecha para Cuenta Regresiva":"Fecha y hora del evento. Con esto se arma la cuenta regresiva de la portada.",
    "Frase principal:":"El texto chiquito arriba de los nombres (ej: Nuestra Boda).",
    "Email para confirmaciones:":"Mail donde le llegan las confirmaciones de asistencia de los invitados.",
    "Número de whatsapp:":"WhatsApp del/de la protagonista 1 (con código de país, ej: 5219991234567). Arma el botón 'Escribir a…'. Dejalo vacío si no querés ese botón.",
    "Número de whatsapp 2:":"WhatsApp del/de la protagonista 2 (con código de país). Arma el segundo botón 'Escribir a…'. Dejalo vacío si no lo usás.",
    "Texto corto botón wsp:":"Texto del primer botón de contacto. Si lo dejás vacío, aparece 'Escribir a (nombre 1)'.",
    "Texto corto botón wsp 2:":"Texto del segundo botón de contacto. Si lo dejás vacío, aparece 'Escribir a (nombre 2)'.",
    "Mostrar sección de contacto:":"Prendé para mostrar la sección de contacto (necesita al menos un número de WhatsApp cargado).",
    "Itinerario descripción:":"Escribí UNA LÍNEA por momento, con este formato:  20:00 · Ceremonia | Recibimos a los invitados.  — En cuanto escribas acá, desaparecen los datos de ejemplo. Si preferís una imagen diseñada, subila abajo (reemplaza la lista).",
    "Itinerario imagen":"Si subís una imagen del itinerario, reemplaza la lista de texto. Para volver a la lista, borrá la imagen.",
    "Transparencia recuadros de texto:":"100 = recuadro opaco (blanco lleno). Bajalo para que se vea el fondo detrás de los recuadros de los eventos.",
    "Bajada sección eventos (arriba del título):":"El textito de arriba del título (ej: Dónde & Cuándo).",
    "Bajada dress code (arriba del título):":"El textito de arriba de 'Dress Code' (ej: Elegante, De gala, Formal).",
    "Bajada galería (arriba del título):":"El textito de arriba del título de la galería (ej: Recuerdos, Momentos).",
    "Fotos de inspiración dress code:":"Pegá los links de las fotos separados por coma. Si lo dejás vacío, NO se muestran fotos de ejemplo (se esconde el botón Ver inspiración).",
    "Contraseña para el evento:":"Si la ponés, la invitación pide esa clave antes de mostrarse. Dejala vacía para que sea pública.",
    "Deshabilitar invitación:":"Prendelo para cerrar la invitación: el invitado ve un aviso de que no está disponible.",
    "Deshabilitar publicidad de invitame:":"Prendelo para que NO aparezca «Invitación creada con InvitaME» en el pie.",
    "ES DEMO ?:":"Prendelo en las invitaciones de muestra: aparece un cartel arriba avisando que es un ejemplo.",
    "Estilo de la galería de fotos:":"Slider = una foto a la vez con flechas. Mosaico = todas en grilla.",
    "Bloquear control de accesos QR y mesas:":"Prendelo para que el escáner de puerta NO pueda cargar este evento.",
    "Imagen del logo - 150px ancho / 50px alto":"Si la subís, aparece en el pie de la invitación.",
    "Datos de hoteles recomendados:":"UNA LÍNEA por hotel, con este formato:  Hotel Los Robles | A 5 min del salón · desde $8.000 | https://link-de-reserva.com  — El link es opcional (si no lo ponés, busca el nombre en Google). En cuanto escribas acá, desaparecen los hoteles de ejemplo.",
    "Descripción hotel:":"El textito que va arriba del botón 'Ver hoteles'.",
    "Dresscode Texto:":"El texto que explica el código de vestimenta. Reemplaza el de ejemplo.",
    "Dresscode Imagen (aprox JPG 250x250)":"Si subís una imagen, reemplaza los dibujitos del traje y el vestido.",
    "vestimenta titulo 2:":"Opcional: un SEGUNDO bloque de dress code (ej: 'Para la fiesta'). Se muestra solo si lo llenás.",
    "Dresscode Texto 2:":"El texto del segundo bloque de dress code.",
    "Pedido especial del cliente:":"📝 Lo que el cliente escribió en el formulario. Es SOLO para ustedes: no se publica en la invitación. Se carga solo cuando traés una solicitud desde 📥 Solicitudes.",
    "Clave del panel de los novios:":"🔑 Con esto los novios entran a mi-panel.html y ven SOLO su lista de invitados y quién confirmó. No pueden tocar el diseño ni ver otros clientes. Poné algo fácil de dictar por teléfono (ej: sofia2027). Si lo dejás vacío, no tienen panel. Al publicar te muestro el link listo para pasarles.",
    "Fondo sección frase larga":"🖼️ Es una franja, no una pantalla entera: se ve una tira horizontal de la foto. Cargá una foto APAISADA (horizontal) y con el motivo al centro. Si subís una vertical, se recorta y queda un primerísimo plano.",
    "Habilitar aviso por mail:":"🔔 Apagado por defecto. Las confirmaciones SIEMPRE se guardan y se ven en la pestaña INVITADOS: esto es solo un extra. Prendelo únicamente si el cliente PIDE que le llegue un mail cada vez que alguien confirma. Cada mail que se manda le cuesta plata a Invítame, así que no lo dejes prendido \"por las dudas\".",
    "Email para confirmaciones:":"📩 A dónde va ese aviso. Solo se usa si arriba prendiste \"Habilitar aviso por mail\". Si está apagado o este campo vacío, no se manda nada — las confirmaciones se siguen viendo en la pestaña INVITADOS igual.",
    "TÍTULO DEL CORREO:":"El asunto del mail que te llega (ej: Confirmación de asistencia). Se le agrega el nombre del invitado.",
    "Frase para sección confirmación:":"El textito que ve el invitado arriba del formulario de confirmación."
  };
  /* ⚠️⚠️ LA TABLA DE CLAVES (BIND) SE MUDÓ A  /admin/0-claves.js  (7/9/2026)
     Creció de 54 a 157 entradas y este archivo ya no entraba en el límite
     de subida. Se declara allá, se lee acá con el nombre pelado (igual que D).
     ⚠️ Todo campo nuevo del panel se anota en 0-claves.js el mismo día. */

  function mejorasHtml(){
    /* ORDEN pedido por Jazmín: nombre de plantilla → número de orden → usuario asignado → protagonistas */
    var _usuarios=['Otro','Jime','Vale','Aylen','Flor'];
    return '<div class="mejoras"><div class="h">✨ Empezá por acá</div>'+
      /* "Nombre de esta plantilla" sacado a pedido de Jazmín (estaba DOS veces y no
         aporta nada a quien arma la invitación). El valor sigue existiendo en D.tpl
         para uso interno: lo fija la plantilla base que se elige más abajo. */
      '<div class="two"><div class="grp"><label>Número de orden para seguimiento</label><input type="text" value="'+String(D.orden||'').replace(/"/g,'&quot;')+'" oninput="setB(\'orden\',this.value)" placeholder="Ej: 128"></div>'+
      '<div class="grp"><label>Usuario asignado</label><select onchange="setB(\'c_usuario-asignado\',this.value)">'+_usuarios.map(function(u){return '<option'+((D['c_usuario-asignado']===u)?' selected':'')+'>'+u+'</option>';}).join('')+'</select></div></div>'+
      '<div class="two"><div class="grp"><label>Protagonista 1 (nombre)</label><input type="text" value="'+String(D.n1||'').replace(/"/g,'&quot;')+'" oninput="setB(\'n1\',this.value)" placeholder="María"></div>'+
      '<div class="grp"><label>Protagonista 2 (nombre)</label><input type="text" value="'+String(D.n2||'').replace(/"/g,'&quot;')+'" oninput="setB(\'n2\',this.value)" placeholder="Diego"></div></div>'+
      '<div class="grp"><label>Dirección del evento (la clave del link) — minúsculas, sin espacios</label><input type="text" value="'+D.slug+'" oninput="D.slug=this.value.toLowerCase().replace(/[^a-z0-9-]+/g,\'-\')" placeholder="maria-y-diego"><div class="hint">Link: invitame.littlemomentsok.com/i/?e='+D.slug+'&g=TOKEN</div></div>'+
      (D.ver && D.ver!==VERSION
        ? '<div class="grp" style="background:#fff6e5;border:1px solid #f0d9a8;border-radius:10px;padding:12px">'
          +'<label style="color:#8a6d3b">Esta invitación usa el diseño del '+D.ver+'</label>'
          +'<div class="hint" style="margin:4px 0 8px">Se mantiene tal cual la entregaste. Los cambios que hacemos en la plataforma NO la tocan.</div>'
          +'<button class="addbtn" style="background:#8a6d3b" onclick="actualizarVersion()">↑ Actualizar al diseño más nuevo</button></div>'
        : '')+
      '<div class="grp"><label>Orden de las secciones</label><button class="addbtn" style="background:var(--uva)" onclick="verOrden()">↕ Reordenar secciones</button></div>'+
      '<div class="grp"><label>Plantilla base</label><div class="temas" id="temas"></div></div>'+
      '<div class="two"><div class="grp"><label>Tipografía de los nombres</label><select id="mf-nfont" onchange="setB(\'nfont\',this.value)">'+FONTS.map(f=>'<option value="'+f[0]+'">'+f[1]+'</option>').join('')+'</select></div>'+
      /* el select ahora muestra lo que está guardado (antes volvía siempre a "apilados") */
      '<div class="grp"><label>Disposición nombres</label><select onchange="setB(\'layout\',this.value)">'+
      '<option value="apilados"'+((D.layout!=='juntos')?' selected':'')+'>Uno debajo del otro</option>'+
      '<option value="juntos"'+((D.layout==='juntos')?' selected':'')+'>Juntos (misma línea)</option>'+
      '</select><div class="hint">Con nombres largos, "juntos" achica la letra para que entren en una sola línea.</div></div></div>'+
      '<div class="two"><div class="grp"><label>Color nombres</label><input type="color" value="#fbf7ef" oninput="setB(\'ncolor\',this.value)"></div>'+
      '<div class="grp"><label>Tamaño nombres</label><input type="range" min="30" max="90" value="52" oninput="setB(\'nsize\',this.value)"></div></div>'+
      '<div class="grp"><label>Foto de portada</label><select onchange="setB(\'cover\',this.value)"><option value="https://images.unsplash.com/photo-1519741497674-611481863552?w=1000&q=80">Campo</option><option value="https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=1000&q=80">Elegante</option><option value="https://images.unsplash.com/photo-1502635385003-ee1e6a1a742d?w=1000&q=80">Rosas</option></select><div class="file" style="margin-top:6px" id="coverbtn" onclick="document.getElementById(\'coverfile\').click()">⬆ Subir tu propia foto</div><input type="file" id="coverfile" accept="image/*" style="display:none" onchange="subirFoto(this,\'cover\')"></div>'+
      '<div class="grp"><label>Acomodá la foto — arrastrala para centrar 👆</label>'+
      '<div id="imgedit" class="imgedit" onmousedown="edStart(event)" ontouchstart="edStart(event)"><span class="edtag">Arrastrá para mover</span></div>'+
      '<div class="zoomrow"><span>Zoom</span><input type="range" min="100" max="260" value="'+D.cz+'" oninput="setB(\'cz\',this.value)"></div></div>'+'<div class="grp"><label>Video de portada (opcional) — se reproduce al abrir</label>'+'<div class="file" id="vidbtn" onclick="document.getElementById(\'coverviddile\').click()">⬆ Subir video (.mp4)</div>'+'<input type="file" id="coverviddile" accept="video/*" style="display:none" onchange="subirVideo(this)">'+'<input type="text" value="'+(D.coverVideo||'')+'" oninput="setB(\'coverVideo\',this.value)" placeholder="…o pegá el link del video (.mp4)" style="margin-top:6px">'+'<div class="hint">Si tu Cloudinary no reproduce el video subido, pegá acá un link .mp4.</div>'+'<div class="aviso">⚠️ Dejá este campo <b>vacío</b> si no vas a poner video (queda solo la foto). <b>No dejes el video de ejemplo (la flor)</b>: subí el de la pareja o borralo.</div></div>'+'</div>';
  }
