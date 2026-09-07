/* ===== LA MÚSICA DE LA FIESTA ================================================

   QUÉ HACE HOY
   Le agrega a la sección «Playlist del evento» —la que ya trae el motor— las
   dos cosas que le faltan: el texto que escriben los novios (`ev.musica`) y un
   botón para sugerir una canción por WhatsApp.

   ⚠️⚠️ POR QUÉ YA NO ARMA SU PROPIA SECCIÓN  (6/9/2026)
   Antes este módulo insertaba una sección entera «La música» leyendo
   `ev.musicaUrl`. El motor ya tiene la suya (`#spotify-sec`, línea 716 de
   i/index.html) leyendo `ev.spotifyUrl`. Eran DOS secciones de playlist, y si
   alguien llenaba los dos campos aparecían las dos, una arriba de la otra.
   Hoy no pasa en ninguna invitación —los campos nunca se llenaron juntos—
   pero era cuestión de tiempo: los dos campos están en el panel, uno al lado
   del otro. Ahora hay UNA sola sección y este módulo la completa.

   ⚠️ LOS DOS CAMPOS NO SON LO MISMO — ES EL ERROR QUE MÁS CONFUNDIÓ:
     · `musicaUrl`  = la música de FONDO. Tiene que ser un archivo de audio
       (.mp3/.m4a/.aac/.ogg/.wav). El motor descarta cualquier otra cosa EN
       SILENCIO y esconde el botón de la bocina: se carga un link de Spotify
       ahí y no suena nada, sin ningún aviso.
     · `spotifyUrl` = la PLAYLIST que se muestra para escuchar y sugerir.
   Acá se usa `spotifyUrl`. `musicaUrl` sólo se mira como salvavidas, y sólo
   si NO es un archivo de audio (ver `rescate()`): es para las invitaciones
   viejas que tienen el link de Spotify guardado en el campo equivocado.

   ⚠️ Y SI EL MOTOR NO LLEGA A MOSTRAR LA SECCIÓN, LA MUESTRA ESTE MÓDULO.
   El motor sólo mira `spotifyUrl`. `regina-y-santiago` tiene su playlist en
   `musicaUrl` (el campo equivocado), así que el motor deja la sección oculta.
   Antes la salvaba la sección propia de este módulo; ahora que esa sección no
   existe más, si nadie encendiera la del motor esa invitación se quedaría sin
   música. Por eso `encenderSeccion()` arma el reproductor y la muestra.

   ⚠️ SI NO HAY PLAYLIST NO APARECE NADA. Es opcional, como el calendario.

   ⚠️ LA CLASE QUE HACE APARECER UN `.reveal` ES `in`, NO `on`.
   Esto costó un rato: el bloque se insertaba bien, tenía el texto adentro… y
   en pantalla no se veía nada, porque quedaba en `opacity:0`. En el HTML del
   motor conviven las dos palabras. La correcta es `in`.

   ⚠️ EL TEXTO DE ACÁ NO PASA POR `i/textos-es-mx.php`. Ese archivo cambia el
   HTML en el servidor, antes de mandarlo; lo que escribe un módulo en vivo no
   lo toca. Por eso todo lo que se escriba acá va YA en español de México.
   ============================================================================ */
(function () {
  'use strict';

  var MARCA  = 'inv-musica-extra';   /* para no agregar lo mismo dos veces */
  var VIEJA  = 'inv-musica';         /* la sección que este módulo armaba antes */
  var VISIBLE = 'in';                /* ⚠️ no es 'on'. Ver la nota de arriba. */

  function ev() { return window.INVEV || {}; }

  function limpio(s) { return String(s == null ? '' : s).trim(); }

  function esc(s) {
    return limpio(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function esAudio(u) {
    return /^https?:\/\//i.test(u) && /\.(mp3|m4a|aac|ogg|wav)(\?|$)/i.test(u);
  }

  /* Salvavidas para las invitaciones viejas: el link de la playlist guardado
     en `musicaUrl`. Nunca devuelve un archivo de audio: ése es la música de
     fondo y robarlo apagaría la bocina. */
  function rescate() {
    var u = limpio(ev().musicaUrl);
    return (u && !esAudio(u)) ? u : '';
  }

  function playlist() { return limpio(ev().spotifyUrl) || rescate(); }

  function telefono() {
    var e = ev();
    var t = limpio(e['c_numero-de-whatsapp'] || e['c_numero-de-whatsapp-2'] || '');
    return t.replace(/[^0-9]/g, '');
  }

  /* La sección del motor. Está oculta hasta que el motor le encuentra playlist. */
  function seccion() { return document.getElementById('spotify-sec'); }

  function estaVisible(s) {
    return !!s && s.style.display !== 'none' &&
           getComputedStyle(s).display !== 'none';
  }

  /* Arma el reproductor y muestra la sección del motor. Mismo criterio que el
     motor (i/index.html, línea 1897): un track mide 152 px, todo lo demás 352. */
  function encenderSeccion(s, url) {
    var m = String(url).match(/(playlist|album|track|artist)\/([A-Za-z0-9]+)/);
    if (!m) return false;
    var caja = document.getElementById('spotify-embed');
    if (caja && !caja.innerHTML.trim()) {
      caja.innerHTML =
        '<iframe style="border-radius:12px;width:100%;height:' +
        (m[1] === 'track' ? 152 : 352) + 'px" frameborder="0" loading="lazy" ' +
        'src="https://open.spotify.com/embed/' + m[1] + '/' + m[2] + '" ' +
        'allow="autoplay;clipboard-write;encrypted-media;fullscreen;picture-in-picture"></iframe>';
    }
    s.style.display = '';
    encender(s);
    return true;
  }

  function bloque() {
    var e = ev();
    var texto = limpio(e.musica);
    var tel   = telefono();
    if (!texto && !tel) return null;      /* nada que agregar */

    var nombres = [limpio(e.n1), limpio(e.n2)].filter(Boolean).join(' y ');
    var d = document.createElement('div');
    d.id = MARCA;

    var html = '';
    if (texto) {
      html += '<p class="reveal" style="max-width:34em;margin:14px auto 0;line-height:1.6">' +
              esc(texto) + '</p>';
    }
    if (tel) {
      var msg = 'Hola! Para la boda' + (nombres ? ' de ' + nombres : '') +
                ' quiero sugerir una canción: ';
      html += '<div class="reveal" style="margin-top:18px">' +
              '<a class="btn" target="_blank" rel="noopener" href="https://wa.me/' + tel +
              '?text=' + encodeURIComponent(msg) + '">Sugerir una canción</a></div>';
    }
    d.innerHTML = html;
    return d;
  }

  function encender(n) {
    [].forEach.call(n.querySelectorAll('.reveal'), function (e) {
      e.classList.add(VISIBLE);
    });
  }

  function poner() {
    /* si quedó dando vueltas la sección vieja de una carga anterior, se va */
    var v = document.getElementById(VIEJA);
    if (v && v.parentNode) v.parentNode.removeChild(v);

    if (document.getElementById(MARCA)) return true;

    /* ⚠️⚠️ ACÁ SÓLO SE DEVUELVE `true` CUANDO EL TRABAJO YA ESTÁ HECHO.
       `true` significa «listo, no me llames más» y apaga el reintento. La
       primera versión contestaba `true` también cuando no encontraba
       playlist, y así se apagaba ANTES de que llegaran los datos del evento:
       probándolo a mano andaba (los datos ya estaban) y en la carga real no
       aparecía nunca. Mientras falte algo se devuelve `false` y se sigue
       mirando, igual que hacía la versión vieja de este módulo. */
    if (!playlist()) return false;         /* todavía no hay datos, o no hay lista */

    var s = seccion();
    if (!s) return false;                  /* motor viejo, sin la sección */
    /* el motor sólo mira `spotifyUrl`: si la playlist vino del campo viejo,
       la sección sigue oculta y la encendemos nosotros */
    if (!estaVisible(s) && !encenderSeccion(s, playlist())) return false;

    var b = bloque();
    if (!b) return true;
    s.appendChild(b);
    setTimeout(function () { encender(b); }, 120);
    setTimeout(function () { encender(b); }, 900);
    return true;
  }

  function arrancar() {
    /* El reintento y el oyente se arman SIEMPRE, pase lo que pase en el
       primer intento: los datos del evento llegan después, y en el panel la
       vista previa se redibuja con `message`. 50 vueltas de 320 ms = 16 s. */
    poner();
    var n = 0, t = setInterval(function () {
      if (poner() || ++n > 50) clearInterval(t);
    }, 320);
    addEventListener('message', function () { setTimeout(poner, 120); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', arrancar);
  else arrancar();
})();
