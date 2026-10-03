<?php
/**
 * Invítame — LOS MÓDULOS DEL FRONT, EN UN SOLO PEDIDO.
 *
 * ⭐ POR QUÉ EXISTE
 *   Maki, 8/9/2026: *«con wifi y todo no carga, tarda muchísimo»*.
 *
 *   Medido en vivo antes de esto: abrir una invitación eran **129 pedidos**, y
 *   56 de ellos eran los módulos de `/efectos/`, uno por uno. Cada archivo es
 *   chico, pero cada uno paga su propio viaje al servidor: la espera media en
 *   la cola era de **618 ms por archivo**, y el último terminaba de llegar a
 *   los 3,2 segundos. No era el peso: era la cantidad.
 *
 *   Este archivo los sirve **todos juntos, en el mismo orden**, en una sola
 *   respuesta. Un pedido en vez de sesenta.
 *
 * ⚠️⚠️ LA LISTA NO ESTÁ ACÁ. Se lee de `efectos/index.js`, que sigue siendo el
 *   único lugar donde se agrega o se saca un módulo. Este archivo sólo los pega.
 *   Copiar la lista sería repetir el error que costó tres intentos con el iPad:
 *   dos copias del mismo dato y una de ellas vieja.
 *
 * ⚠️ SIGUE VALIENDO «SE ARREGLA EN EL ORIGEN». Cada módulo sigue siendo su
 *   propio archivo, se edita solo, y no hay ningún paso de compilación que
 *   alguien se pueda olvidar de correr: el pegado se hace acá, en cada pedido.
 *
 * ⚠️ EL ORDEN ES EL DE LA LISTA, y eso importa: hay módulos que cuentan con que
 *   otro ya corrió. Se respeta exactamente el mismo orden que tenían como
 *   etiquetas sueltas.
 *
 * ⚠️ SI ESTO FALLA, LA INVITACIÓN NO SE QUEDA SIN MÓDULOS. `efectos/index.js`
 *   pide este archivo y, si no llega, vuelve solo al camino viejo de cargarlos
 *   de a uno. Ver el `onerror` de allá.
 *
 * ⚠️ NO SE CACHEA. Mismo criterio que los `.js` sueltos: un arreglo tiene que
 *   llegarle hoy a la pareja que se casa el sábado. Lo que se ahorra acá son los
 *   viajes, no las descargas.
 */

header('Content-Type: application/javascript; charset=utf-8');
header('Cache-Control: no-cache, must-revalidate');
header('X-Content-Type-Options: nosniff');

$dirEfectos = __DIR__;
$raiz       = dirname(__DIR__);

$indice = @file_get_contents($dirEfectos . '/index.js');
if ($indice === false) {
  /* Sin la lista no hay nada que pegar. Se avisa y se deja que el navegador
     siga por el camino viejo (index.js no llegó a correr, así que no hay nada
     que romper). */
  echo "/* no se pudo leer efectos/index.js */\n";
  exit;
}

if (!preg_match_all("~'(/(?:efectos|muestras|colecciones)/[A-Za-z0-9._-]+\.js)'~", $indice, $mm)) {
  echo "/* la lista de modulos vino vacia */\n";
  exit;
}

/* ═══ ETAG (1/10/2026) — «salir a vender»: 100 invitaciones nuevas por mes.
   Sigue SIN cachearse a ciegas (no-cache = el navegador pregunta SIEMPRE), pero
   si nada cambió el servidor contesta «304, el que tenés sirve» en vez de
   mandar los 850 KB de nuevo. Un invitado que abre la invitación 4 veces baja
   el paquete una sola vez. Un arreglo subido hoy cambia la fecha del archivo →
   cambia la etiqueta → llega en la próxima apertura, igual que antes.
   La etiqueta se arma con la fecha y el tamaño de cada módulo + este archivo. */
$lista = array();
$puestos = array();
foreach ($mm[1] as $url) {
  if (isset($puestos[$url])) continue;
  $puestos[$url] = 1;

  /* ⚠️ Sólo de adentro de estas tres carpetas. La expresión de arriba ya no
     deja pasar ni `..` ni barras de más, pero el control se hace igual: es el
     que impide que este archivo sirva cualquier cosa del disco. */
  $ruta = $raiz . $url;
  $real = realpath($ruta);
  $ok = false;
  foreach (array('/efectos', '/muestras', '/colecciones') as $carpeta) {
    $base = realpath($raiz . $carpeta);
    if ($base !== false && $real !== false && strpos($real, $base . DIRECTORY_SEPARATOR) === 0) { $ok = true; break; }
  }
  $lista[] = array($url, ($ok && is_readable($real)) ? $real : false);
}

/* ★ 3/10/2026 — la huella sale del CONTENIDO (md5 de cada archivo), no de la
   fecha: así la máquina que arma el paquete liviano (GitHub) y el servidor
   (Hostinger) calculan exactamente la misma, aunque cada uno tenga sus fechas. */
$huella = md5_file(__FILE__) . ':' . md5($indice);
foreach ($lista as $par) {
  $huella .= '|' . $par[0] . ':' . ($par[1] ? md5_file($par[1]) : 'falta');
}
$CLI = (PHP_SAPI === 'cli');
if ($CLI && isset($argv) && in_array('--huella', $argv, true)) { echo md5($huella); exit; }
$etag = 'W/"' . md5($huella) . '"';
header('ETag: ' . $etag);
$pregunta = isset($_SERVER['HTTP_IF_NONE_MATCH']) ? $_SERVER['HTTP_IF_NONE_MATCH'] : '';
/* LiteSpeed a veces le agrega «-br»/«-gzip» o «;;;» a la etiqueta: se compara
   sólo el código del medio. */
if ($pregunta !== '' && preg_match('~[0-9a-f]{32}~', $pregunta, $pm) && $pm[0] === md5($huella)) {
  http_response_code(304);
  exit;
}

/* ═══ EL PAQUETE LIVIANO (3/10/2026) ══════════════════════════════════════════
   Maki: «achicá todo lo que puedas sin perder calidad y que cargue lo más rápido
   posible». Medido en un 4G: este paquete eran 2 MB (856 KB por la red) y el
   sobre recién estaba listo a los 8,3 s. El 42 % eran comentarios como éste.

   `efectos/todo.min.js` es ESTA MISMA salida, sin comentarios ni espacios (terser,
   sin cambiar ni renombrar nada del código). La arma SOLA una acción de GitHub
   (`.github/workflows/paquete.yml`) cada vez que se sube algo a efectos/,
   colecciones/ o muestras/. Nadie tiene que acordarse de correr nada.

   ⚠️ LA RED DE SEGURIDAD: su primera línea trae la huella de los archivos con los
      que se armó. Si no coincide con la de AHORA (alguien subió un arreglo y la
      acción todavía no rearmó), se sirve el paquete crudo de siempre. Nunca se
      sirve un paquete viejo: en el peor caso, uno más pesado.
   ⚠️ `?crudo=1` fuerza el crudo (para probar archivos locales con Playwright y
      para buscar marcas de un cambio: el liviano no tiene comentarios).
   ⚠️ Se manda YA comprimido con gzip nivel 9: la compresión automática del
      servidor (LiteSpeed) daba 856 KB; ésta, ~245 KB. */
$LIVIANO_POR_DEFECTO = true;    /* prendido el 3/10/2026, probado en vivo en las 51 con ?liviano=1 */
if (!$CLI && !isset($_GET['crudo']) && ($LIVIANO_POR_DEFECTO || isset($_GET['liviano']))) {
  $min = __DIR__ . '/todo.min.js';
  $fh = @fopen($min, 'rb');
  if ($fh) {
    $primera = fgets($fh);
    fclose($fh);
    if (trim((string)$primera) === '/*huella:' . md5($huella) . '*/') {
      header('X-Invitame-Paquete: liviano');
      header('Vary: Accept-Encoding');
      $acepta = isset($_SERVER['HTTP_ACCEPT_ENCODING']) ? $_SERVER['HTTP_ACCEPT_ENCODING'] : '';
      if (stripos($acepta, 'gzip') !== false && function_exists('gzencode')) {
        $guardado = rtrim(sys_get_temp_dir(), '/\\') . '/invitame-todo-' . md5($huella) . '.gz';
        $gz = @file_get_contents($guardado);
        if ($gz === false || $gz === '') {
          $gz = gzencode(file_get_contents($min), 9);
          @file_put_contents($guardado, $gz, LOCK_EX);
        }
        if (function_exists('apache_setenv')) { @apache_setenv('no-gzip', '1'); }
        @ini_set('zlib.output_compression', '0');
        header('Content-Encoding: gzip');
        header('Content-Length: ' . strlen($gz));
        echo $gz;
        exit;
      }
      readfile($min);
      exit;
    }
  }
}
header('X-Invitame-Paquete: crudo');

echo "/* Invitame - los modulos del front, pegados en el servidor. La lista vive en efectos/index.js */\n";

$cuantos = 0;
foreach ($lista as $par) {
  $url = $par[0]; $real = $par[1];
  if (!$real) {
    echo "\n/* falta: " . str_replace('*/', '', $url) . " */\n";
    continue;
  }

  echo "\n/* ===================== " . str_replace('*/', '', $url) . " ===================== */\n";
  readfile($real);
  /* El punto y coma suelto entre archivo y archivo: sin él, un archivo que
     termina sin `;` se pega con la primera línea del siguiente. */
  echo "\n;\n";
  $cuantos++;
}

/* La marca de que llegó completo. `efectos/index.js` la mira para saber que no
   tiene que cargar nada más. */
echo "\nwindow.INVEFECTOS_JUNTOS = " . $cuantos . ";\n";

/* ═════════════════════════════════════════════════════════════════════════════
   LA MARCA DE QUE EL SOBRE YA ESTÁ DECIDIDO  (8/9/2026)

   Va acompañada de una regla en `i/estilos-servidor.css` que APAGA todo lo que
   cuelga de `#env` mientras no exista la clase `inv-sobre-listo`. Las dos
   cosas son una sola: si se toca una, se toca la otra.

   POR QUÉ HACE FALTA UNA MARCA PROPIA — el cuarto intento del bug del sobre.
   El motor, en su script de arranque, hace:

       if (CONFIG.sobreTriangulos) { initEnvTri(); } else { initEnvVideo(); }

   …y eso pone `tri-mode` (o `video-mode`) EN EL ACTO, antes de saber qué sobre
   compró esta pareja. `#env.tri-mode .triflap{display:block}` prende las cuatro
   solapas del sobre viejo a pantalla completa, y recién después —cuando llegan
   los datos y corre `sobre-catalogo.js`— se cambia al sobre de verdad.

   ⚠️ POR ESO NINGUNA CLASE DE MODO SIRVE COMO SEÑAL. En el intento anterior
      excluí `tri-mode` y `video-mode` creyendo que significaban «ya está
      decidido». Significan lo contrario: son la conjetura del motor. Medido en
      los cuatro navegadores: seguían apareciendo las cuatro solapas
      (.tri-t, .tri-r, .tri-b, .tri-l), a 1440x900 en la compu y a 834x1194 en
      el iPad.

   LO QUE SÍ SIGNIFICA «DECIDIDO»: que el módulo del catálogo haya hablado, o
   sea que `#env` gane una clase que NO sea una de las tres tempranas. Por eso
   acá se mira, y si todavía no pasó se espera con un observador — la decisión
   puede ser asíncrona, porque depende de que lleguen los datos de la fiesta.

   ⚠️ ESTO VA AL FINAL DEL PAQUETE A PROPÓSITO: para cuando corre, ya corrieron
      todos los módulos, incluido `sobre-catalogo.js`.

   ⚠️ Y SI ESTE ARCHIVO NO LLEGA (se cae, o se cargan los módulos de a uno por
      el camino viejo), la marca nunca se pone y NO PASA NADA GRAVE: el CSS
      tiene un rescate por animación que enciende igual a los 1,5 s. Prefiero un
      sobre viejo a los 1,5 segundos que una pantalla muerta.
   ═════════════════════════════════════════════════════════════════════════════ */
?>
;(function () {
  try {
    /* las tres que pone el motor de arranque, antes de saber nada */
    var TEMPRANAS = { 'tri-mode': 1, 'video-mode': 1, 'sello-video': 1 };

    function yaDecidio(env) {
      var c = (env.className || '').split(/\s+/);
      for (var i = 0; i < c.length; i++) {
        if (c[i] && c[i] !== 'inv-sobre-listo' && !TEMPRANAS[c[i]]) return true;
      }
      return false;
    }

    function encender(env) { env.classList.add('inv-sobre-listo'); }

    function enganchar() {
      var env = document.getElementById('env');
      if (!env) return false;
      if (yaDecidio(env)) { encender(env); return true; }
      if (window.MutationObserver) {
        var obs = new MutationObserver(function () {
          if (yaDecidio(env)) { encender(env); obs.disconnect(); }
        });
        obs.observe(env, { attributes: true, attributeFilter: ['class'] });
      } else {
        encender(env);   /* navegador viejo: mejor encender que dejarlo apagado */
      }
      return true;
    }

    if (!enganchar()) {
      document.addEventListener('DOMContentLoaded', enganchar);
    }
  } catch (e) { /* jamás dejar la invitación a oscuras por esto */
    try { var e2 = document.getElementById('env'); if (e2) e2.classList.add('inv-sobre-listo'); } catch (x) {}
  }
})();
