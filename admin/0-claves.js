/* ===== ADMIN DE INVÍTAME · LAS CLAVES DE LOS CAMPOS ==========================

   QUÉ ES ESTO
   Cada campo del panel guarda su valor en un casillero de la base. Esta tabla
   dice, para cada rótulo, en QUÉ casillero guarda.

   ⚠️⚠️ POR QUÉ EXISTE, Y POR QUÉ AHORA ESTÁN TODOS  (7/9/2026)

   La regla del panel es:
       claveDe(rótulo) = BIND[rótulo]  ||  'c_' + slug(rótulo)

   O sea que un campo que NO estaba en esta tabla sacaba su clave del TEXTO de
   su propia etiqueta. Y eso quiere decir que **corregir una palabra, un acento
   o una coma de un rótulo cambiaba la clave y el dato viejo se perdía en
   silencio**: la invitación seguía leyendo el casillero viejo, que ahora estaba
   vacío, y nadie se enteraba hasta que un cliente veía su invitación a medias.

   Ya había pasado CUATRO veces. Quedaron cuatro parches escritos a mano en el
   motor, que leen las dos formas:
       c_descripci-n-hotel            ↔  c_descripcion-hotel
       c_frase-para-secci-n-de-contacto ↔ c_frase-para-seccion-contacto
       c_itinerario-descripci-n       ↔  c_itinerario-descripcion
       c_texto-bot-n-ver-v-deo        ↔  c_texto-boton-ver-video

   Maki: «hay que arreglar todo para siempre, no quiero parches».

   ★ CÓMO SE ARREGLÓ, SIN MOVER UN SOLO DATO
     A cada rótulo que no tenía clave propia se le puso ACÁ la clave que YA
     estaba produciendo. Misma clave, mismo casillero, cero migración: se
     verificó campo por campo que ninguno de los 153 cambia de clave.
     Lo que cambia es que de ahora en más la clave NO depende del rótulo.

   ★★ LA REGLA, DE ACÁ EN ADELANTE
     **Todo campo nuevo del panel entra en esta tabla el mismo día que se crea.**
     Si no está acá, su clave vuelve a depender de cómo esté escrita la etiqueta,
     y el problema vuelve.

   ⚠️ Y NUNCA se le cambia la clave a un campo que ya está en uso. El rótulo se
     puede corregir todo lo que haga falta —para eso está esta tabla—, pero la
     clave de la derecha es a dónde fueron a parar los datos de los clientes que
     ya cargaron algo. Si se cambia, esos datos quedan huérfanos.

   ⚠️ `Título hoteles:` estaba acá apuntando a `hotTitulo` y NO tenía ningún
     campo en el panel: era un casillero fantasma que el motor leía y nadie
     podía llenar. Se sacó. El título de Hospedaje se carga con
     «Titulo hoteles:» → `c_titulo-hoteles`, que sí tiene su campo.
   ============================================================================ */

  const BIND = {

    /* ---- LAS DE TODA LA VIDA ----------------------------------------------
       Claves cortas, heredadas del sistema original. No se tocan nunca: son
       las que leen el motor de la invitación y el servidor. */
    "Hashtag Instagram (Sin el #):": "igHashtag",
    "Datos bancarios para transferencias (Borrar texto en caso de no necesitar):": "regClabe",
    "URL Video:": "videoUrl",
    "Música de la web": "musicaUrl",
    "Titulo - Personas importantes:": "padresTitulo",
    "IDIOMA de la invitación:": "idioma",
    "Detectar el del celular del invitado:": "idiomaAuto",
    "Mostrar botón para que el invitado elija:": "idiomaSelector",
    "Protagonista 1:": "n1",
    "Protagonista 2:": "n2",
    "Frase principal:": "kick",
    "Fecha para Cuenta Regresiva": "fecha",
    "Tipografía protagonistas:": "nfont",
    "Tipografía principal:": "fTit",
    "Tipografía secundaria:": "fTit2",
    "Frase Larga:": "frase",
    "Color frase larga:": "fraseColor",
    "Tipografía frase larga:": "fraseFont",
    "Tamaño de la frase larga (por defecto automático):": "fraseSize",
    "Color de la frase principal:": "kickColor",
    "Número de orden para seguimiento:": "orden",
    "Titulo sección eventos:": "evTitulo",
    "Bajada sección eventos (arriba del título):": "evKicker",
    "Bajada dress code (arriba del título):": "dressKicker",
    "Bajada galería (arriba del título):": "galKicker",
    "Color sección eventos:": "evColor",
    "Color texto sección eventos:": "evTextColor",
    "Color botones sección eventos:": "evBtnColor",
    "Color texto botones sección eventos:": "evBtnTextColor",
    "Título itinerario:": "itTitulo",
    "vestimenta titulo:": "dressTitulo",
    "Titulo para fotos y menú:": "galTitulo",
    "Color - Personas importantes:": "padresColor",
    "Color de texto \"Galería\":": "galTextColor",
    "TITULO SECCIÓN \"REGALOS\" Y MENÚ:": "regTitulo",
    "COLOR SECCIÓN \"REGALOS\" Y MENÚ:": "regColor",
    "CONFIRMAR ASISTENCIA (MENÚ Y TITULOS):": "cfTitulo",
    "Color texto Confirmación:": "cfColor",
    "Frase final:": "fraseFinal",
    "Ceremonia 1 - Titulo:": "ev1t",
    "Ceremonia 1 - Descripción:": "ev1sub",
    "Ceremonia 1 - Fecha descripción:": "ev1fecha",
    "Ceremonia 1 - Dirección:": "ev1dir",
    "Ceremonia 1 - Coordenadas:": "ev1maps",
    "Ceremonia 2 - Titulo:": "ev2t",
    "Ceremonia 2 - Descripción:": "ev2sub",
    "Ceremonia 2 - Fecha descripción:": "ev2fecha",
    "Ceremonia 2 - Dirección:": "ev2dir",
    "Ceremonia 2 - Coordenadas:": "ev2maps",
    "Ceremonia 3 - Titulo:": "ev3t",
    "Ceremonia 3 - Descripción:": "ev3sub",
    "Ceremonia 3 - Fecha descripción:": "ev3fecha",
    "Ceremonia 3 - Dirección:": "ev3dir",
    "Ceremonia 3 - Coordenadas:": "ev3maps",

    /* ---- LAS QUE SE CLAVARON EL 7/9/2026 ----------------------------------
       Estas 103 sacaban su clave del texto del rótulo. Acá quedan fijadas a la
       MISMA clave que ya producían: ningún dato se movió. Ahora corregir una
       etiqueta es seguro. */
    "Tipografía cuenta regresiva:": "c_tipografia-cuenta-regresiva",
    "Posición cuentra regresiva y nombres:": "c_posicion-cuentra-regresiva-y-nombres",
    "Fondo sección frase larga": "c_fondo-seccion-frase-larga",
    "Texto final:": "c_texto-final",
    "Posición frase final:": "c_posicion-frase-final",
    "Color título y texto final:": "c_color-titulo-y-texto-final",
    "Foto para el fin de página": "c_foto-para-el-fin-de-pagina",
    "Tamaño de la seccion final (por defecto automático):": "c_tamano-de-la-seccion-final-por-defecto-a",
    "Deshabilitar sección frase final:": "c_deshabilitar-seccion-frase-final",
    "Imágen miniatura al compartir": "c_imagen-miniatura-al-compartir",
    "Titulo al compartir:": "c_titulo-al-compartir",
    "Descripción al compartir:": "c_descripcion-al-compartir",
    "Transparencia recuadros de texto:": "c_transparencia-recuadros-de-texto",
    "Ceremonia 1 - Imagen (JPG 480x320)": "c_ceremonia-1-imagen-jpg-480x320",
    "Ceremonia 1 - Fecha": "c_ceremonia-1-fecha",
    "Ceremonia 2 - Imagen (JPG 480x320)": "c_ceremonia-2-imagen-jpg-480x320",
    "Ceremonia 2 - Fecha": "c_ceremonia-2-fecha",
    "Ceremonia 3 - Imagen (JPG 480x320)": "c_ceremonia-3-imagen-jpg-480x320",
    "Ceremonia 3 - Fecha": "c_ceremonia-3-fecha",
    "Titulo hoteles:": "c_titulo-hoteles",
    "Imagen hoteles": "c_imagen-hoteles",
    "Descripción hotel:": "c_descripcion-hotel",
    "Datos de hoteles recomendados:": "c_datos-de-hoteles-recomendados",
    "vestimenta titulo 2:": "c_vestimenta-titulo-2",
    "Fotos de inspiración dress code:": "c_fotos-de-inspiracion-dress-code",
    "Vestimenta color:": "c_vestimenta-color",
    "Dresscode Texto:": "c_dresscode-texto",
    "Dresscode Imagen (aprox JPG 250x250)": "c_dresscode-imagen-aprox-jpg-250x250",
    "Dresscode Texto 2:": "c_dresscode-texto-2",
    "Dresscode Imagen 2 (aprox JPG 250x250)": "c_dresscode-imagen-2-aprox-jpg-250x250",
    "Color de fondo \"donde y cuando\":": "c_color-de-fondo-donde-y-cuando",
    "Imagen de fondo sección \"donde y cuando\"": "c_imagen-de-fondo-seccion-donde-y-cuando",
    "Color de fondo Dresscode:": "c_color-de-fondo-dresscode",
    "Imagen de fondo sección \"Desscode\"": "c_imagen-de-fondo-seccion-desscode",
    "Itinerario descripción:": "c_itinerario-descripcion",
    "Itinerario imagen": "c_itinerario-imagen",
    "Itinerario color de fondo:": "c_itinerario-color-de-fondo",
    "Imagen de fondo sección \"Itinerario\"": "c_imagen-de-fondo-seccion-itinerario",
    "Itinerario color de texto:": "c_itinerario-color-de-texto",
    "Color logo y texto seccion Instagram:": "c_color-logo-y-texto-seccion-instagram",
    "Usuario de instragram:": "c_usuario-de-instragram",
    "Frase sección instagram:": "c_frase-seccion-instagram",
    "Fondo sección instagram": "c_fondo-seccion-instagram",
    "Texto \"botón\" \"Ver vídeo\":": "c_texto-boton-ver-video",
    "Estilo de la galería de fotos:": "c_estilo-de-la-galeria-de-fotos",
    "Color de fondo \"Galería\":": "c_color-de-fondo-galeria",
    "Imagen de fondo sección \"Galería\"": "c_imagen-de-fondo-seccion-galeria",
    "Fondo color Personas:": "c_fondo-color-personas",
    "Imagen de fondo sección \"Personas\"": "c_imagen-de-fondo-seccion-personas",
    "Transparencia recuadros de personas:": "c_transparencia-recuadros-de-personas",
    "Frase para la sección personas:": "c_frase-para-la-seccion-personas",
    "Color para la sección personas:": "c_color-para-la-seccion-personas",
    "Color fondo \"Regalos\":": "c_color-fondo-regalos",
    "Imagen de fondo sección \"Regalos\"": "c_imagen-de-fondo-seccion-regalos",
    "Imagen decorativa (sobre o regalo)": "c_imagen-decorativa-sobre-o-regalo",
    "Frase para sección regalos (mesa):": "c_frase-para-seccion-regalos-mesa",
    "Color para sección regalos (mesa):": "c_color-para-seccion-regalos-mesa",
    "TEXTO BOTÓN \"Ver datos bancarios\":": "c_texto-boton-ver-datos-bancarios",
    "CONFIRMACIÓN": "c_confirmacion",
    "Color fondo Confirmación:": "c_color-fondo-confirmacion",
    "Imagen de fondo sección \"Confirmación\"": "c_imagen-de-fondo-seccion-confirmacion",
    "Habilitar aviso por mail:": "c_habilitar-aviso-por-mail",
    "Email para confirmaciones:": "c_email-para-confirmaciones",
    "TÍTULO DEL CORREO:": "c_titulo-del-correo",
    "Frase para sección confirmación:": "c_frase-para-seccion-confirmacion",
    "Ocultar Formulario:": "c_ocultar-formulario",
    "Color texto Contacto:": "c_color-texto-contacto",
    "Color fondo Contacto:": "c_color-fondo-contacto",
    "Imagen de fondo sección \"Contacto\"": "c_imagen-de-fondo-seccion-contacto",
    "Título Contacto:": "c_titulo-contacto",
    "Frase para sección contacto:": "c_frase-para-seccion-contacto",
    "Número de whatsapp:": "c_numero-de-whatsapp",
    "Número de whatsapp 2:": "c_numero-de-whatsapp-2",
    "Texto corto botón wsp:": "c_texto-corto-boton-wsp",
    "Texto corto botón wsp 2:": "c_texto-corto-boton-wsp-2",
    "Mostrar sección de contacto:": "c_mostrar-seccion-de-contacto",
    "Color de fondo sección QR:": "c_color-de-fondo-seccion-qr",
    "Imagen fondo QR": "c_imagen-fondo-qr",
    "Deshabilitar publicidad de invitame:": "c_deshabilitar-publicidad-de-invitame",
    "Deshabilitar invitación:": "c_deshabilitar-invitacion",
    "Contraseña para el evento:": "c_contrasena-para-el-evento",
    "Clave del panel de los novios:": "c_clave-del-panel-de-los-novios",
    "ES DEMO ?:": "c_es-demo",
    "NOMBRE DE LA DEMO:": "c_nombre-de-la-demo",
    /* ⚠️ ÚNICA clave que se cambió a mano (7/9/2026). El campo escribía en
       `c_tipo-de-evento`, un casillero que NO lee nadie, mientras la invitación,
       el panel de números y el formulario del cliente leen y escriben
       `tipoEvento`. Eran dos controles para lo mismo, y el del panel no hacía
       nada. Se pudo cambiar porque ese casillero estaba vacío en todas partes. */
    "Tipo de evento:": "tipoEvento",
    "Imagen del logo - 150px ancho / 50px alto": "c_imagen-del-logo-150px-ancho-50px-alto",
    "Bloquear control de accesos QR y mesas:": "c_bloquear-control-de-accesos-qr-y-mesas",
    "Habilitar trivia:": "c_habilitar-trivia",
    "Pedido especial del cliente:": "c_pedido-especial-del-cliente",
    "Texto sobre título:": "c_texto-sobre-titulo",
    "Texto 'Puntos':": "c_texto-puntos",
    "Texto 'Pregunta':": "c_texto-pregunta",
    "Texto del campo para ingresar el nombre:": "c_texto-del-campo-para-ingresar-el-nombre",
    "Texto tabla de resultados:": "c_texto-tabla-de-resultados",
    "Texto botón \"Iniciar Sesión\":": "c_texto-boton-iniciar-sesion",
    "Texto \"Hola\" antes del nombre:": "c_texto-hola-antes-del-nombre",
    "Texto botón \"Comenzar trivia\":": "c_texto-boton-comenzar-trivia",
    "Texto botón \"Cerrar sesion\":": "c_texto-boton-cerrar-sesion",
    "Texto \"No sos\" para cerrar sesión:": "c_texto-no-sos-para-cerrar-sesion",
    "Texto columna \"Nombre\" en tabla de resultados:": "c_texto-columna-nombre-en-tabla-de-resulta",
    "Texto \"tabla de posiciones\":": "c_texto-tabla-de-posiciones",
    "Color 1 titulo trivia:": "c_color-1-titulo-trivia",
    "Color 2 titulo trivia:": "c_color-2-titulo-trivia"
  };
