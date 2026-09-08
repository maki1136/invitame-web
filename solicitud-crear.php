<?php
/**
 * Invitame — LA INVITACIÓN SE CREA SOLA AL ENVIAR EL FORMULARIO.
 *
 * ⭐ ESTE ARCHIVO ES EL OBJETIVO DE MAKI, HECHO CÓDIGO.
 *   *«El objetivo de todo esto es que los novios completen el formulario y su
 *   panel y todo se guarde y la invitación se cree sola. El trabajo de Jazmín
 *   es verificar que la invitación esté ok y poder enviarla.»* (8/9/2026)
 *
 *   Antes, el formulario guardaba una SOLICITUD y ahí terminaba: la invitación
 *   no existía hasta que alguien la abría en el panel, tocaba «Cargar en el
 *   editor» y publicaba. Ahora nace armada.
 *
 * QUÉ CREA, DE UNA
 *   · `inv_eventos/{slug}`            → la invitación
 *   · `inv_invitados/{slug}__{token}` → un pase por invitado, con su QR
 *   · `inv_paneles/{slug}__{clave}`   → el panel de los novios
 *   · `inv_privado/{slug}`            → la clave del panel y el contacto
 *
 * ⚠️⚠️ EL MAPEO NO ESTÁ ACÁ, Y NO TIENE QUE ESTAR.
 *   Traducir el formulario a una invitación son 62 campos, y ya está escrito
 *   UNA vez en `/solicitud-a-evento.js`, que es el mismo que usa el panel. Si
 *   se copiara acá en PHP, el día que se agregue un campo en un solo lado el
 *   dato del cliente se perdería EN SILENCIO. Por eso el navegador manda el
 *   objeto ya mapeado y este archivo se ocupa de lo que el navegador NO puede
 *   decidir: la dirección, las claves, los tokens y el estado.
 *
 * ⚠️ ES UNA PUERTA PÚBLICA Y ANÓNIMA. Cualquiera puede llamarla. Por eso:
 *   1. La dirección tiene que estar LIBRE. Si ya existe, se corta. Sin esto,
 *      alguien podría pisarle la invitación a una pareja mandando su mismo
 *      slug. Es el control más importante de todo el archivo.
 *   2. Se comprueba que la solicitud EXISTA y que el nombre coincida: el
 *      pedido tiene que venir de un formulario de verdad, no de la nada.
 *   3. Freno por IP y global.
 *   4. Hay una lista de campos que el cliente NO puede mandar. Los pone el
 *      servidor, pase lo que pase (ver `PROHIBIDOS`).
 *
 * ⚠️ LOS TOKENS DE LOS INVITADOS SE GENERAN ACÁ, no se aceptan los del
 *    navegador. Un token es la llave del QR de esa persona: si lo eligiera
 *    quien pide, podría fabricarse pases adivinables.
 *
 * ⭐ EL INTERRUPTOR DE LOS DOS MODOS ESTÁ ABAJO, EN UNA SOLA LÍNEA.
 */

header('Content-Type: application/json; charset=utf-8');

/* ============================================================================
   ⭐⭐ EL INTERRUPTOR — los dos modos que pidió Maki

   false → MODO CONTROL DE CALIDAD  (el de hoy)
           La invitación nace «por-revisar»: existe y está armada, pero el link
           no muestra nada hasta que el equipo la aprueba. Jazmín la mira con su
           link de revisión y la entrega.

   true  → MODO AUTOMÁTICO  (el plan de Maki)
           Nace «entregada»: el cliente termina el formulario y ya tiene su
           invitación funcionando, con su link.

   Maki, 8/9/2026: «hoy es la 1, pero quiero dejar todo listo para que pueda
   verla en vivo... así que las dos opciones quiero ya tenerlas».
   Las dos ramas están escritas y probadas. Se cambia ESTA línea y nada más.
   ============================================================================ */
$ENTREGA_AUTOMATICA = false;

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(array('ok' => false, 'error' => 'metodo'));
  exit;
}

$PROJECT = 'invitame-9b51f';
$APIKEY  = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';
$FS      = 'https://firestore.googleapis.com/v1/projects/' . $PROJECT . '/databases/(default)/documents/';

/* Una invitación con galería y personas pesa; 400 KB es holgado y corta el abuso. */
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 400000) {
  http_response_code(413);
  echo json_encode(array('ok' => false, 'error' => 'muy-grande'));
  exit;
}
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

$ev      = isset($in['evento']) && is_array($in['evento']) ? $in['evento'] : null;
$solicId = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)($in['solicId'] ?? ''));

if (!$ev || $solicId === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}

/* ---------------------------------------------------------------------------
   LO QUE EL CLIENTE NO PUEDE MANDAR, PASE LO QUE PASE.
   Se borra de lo que llegó y lo pone el servidor más abajo.
   ⚠️ `paquete` está en la lista a propósito: si el cliente pudiera elegir su
      propio plan, se regalaría el Platinum solo.
   --------------------------------------------------------------------------- */
$PROHIBIDOS = array(
  'estado', 'revision', 'ver', 'nEvento', 'orden', 'privado',
  'creadoPor', 'creadoEl', 'guardadoPor', 'guardadoEl', '_solicId',
  'c_clave-del-panel-de-los-novios', 'c_contrasena-para-el-evento',
);
foreach ($PROHIBIDOS as $k) { unset($ev[$k]); }
if (isset($ev['fx']) && is_array($ev['fx'])) {
  /* los interruptores de VENTA de las muestras: los teléfonos de Invítame y el
     llamado «¿quieres la tuya?». En la invitación de un cliente no van nunca. */
  unset($ev['fx']['muestra']);
  unset($ev['fx']['paquete']);
}

$slug = preg_replace('/[^a-z0-9\-]/', '', strtolower((string)($ev['slug'] ?? '')));
if ($slug === '' || strlen($slug) < 3) {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'direccion'));
  exit;
}
$ev['slug'] = $slug;

/* Freno anti-abuso. Bajo a propósito: una persona crea UNA invitación. */
$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('sc-ip-' . iv_ip(), 6,   3600),
    array('sc-glob',          150, 3600),
  ));
}

// ---------- helper HTTP ----------
function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array()) {
  $ch = curl_init($url);
  $opt = array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $metodo,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT        => 20,
    CURLOPT_SSL_VERIFYPEER => true,
  );
  if ($cuerpo !== null) {
    $opt[CURLOPT_POSTFIELDS] = $cuerpo;
    $headers[] = 'Content-Type: application/json';
  }
  if ($headers) $opt[CURLOPT_HTTPHEADER] = $headers;
  curl_setopt_array($ch, $opt);
  $r = curl_exec($ch);
  $c = curl_getinfo($ch, CURLINFO_HTTP_CODE);
  curl_close($ch);
  return array($r, $c);
}

/* ---------------------------------------------------------------------------
   De un valor de PHP al formato de Firestore.
   ⚠️ Una lista vacía y un objeto vacío se ven IGUAL en PHP (array()). Se
      resuelve mirando si las claves son 0,1,2…: si lo son, es lista.
   --------------------------------------------------------------------------- */
function aFirestore($v) {
  if (is_null($v))  return array('nullValue' => null);
  if (is_bool($v))  return array('booleanValue' => $v);
  if (is_int($v))   return array('integerValue' => (string)$v);
  if (is_float($v)) return array('doubleValue' => $v);
  if (is_string($v)) return array('stringValue' => $v);
  if (is_array($v)) {
    $esLista = ($v === array()) || (array_keys($v) === range(0, count($v) - 1));
    if ($esLista) {
      $vals = array();
      foreach ($v as $x) $vals[] = aFirestore($x);
      return array('arrayValue' => array('values' => $vals));
    }
    $campos = array();
    foreach ($v as $k => $x) $campos[$k] = aFirestore($x);
    return array('mapValue' => array('fields' => $campos));
  }
  return array('stringValue' => (string)$v);
}
function docDe($arr) {
  $campos = array();
  foreach ($arr as $k => $v) $campos[$k] = aFirestore($v);
  return array('fields' => $campos);
}

/* Sin `l`, `o`, `0` ni `1`: se confunden al dictarlas por teléfono. */
function codigo($largo) {
  $abc = 'abcdefghijkmnpqrstuvwxyz23456789';
  $s = '';
  for ($i = 0; $i < $largo; $i++) $s .= $abc[random_int(0, strlen($abc) - 1)];
  return $s;
}

// ---------- 1. ⚠️ ¿la dirección está libre? EL CONTROL MÁS IMPORTANTE ----------
list($re, $ce) = pedir($FS . 'inv_eventos/' . rawurlencode($slug) . '?key=' . $APIKEY);
if ($ce == 200) {
  /* Ya hay una invitación con esa dirección. NO se pisa jamás: se avisa y el
     equipo decide. Dos «Camila y Tomás» en el mismo año es de lo más normal. */
  http_response_code(409);
  echo json_encode(array('ok' => false, 'error' => 'direccion-ocupada', 'slug' => $slug));
  exit;
}

// ---------- 2. ¿la solicitud existe y es ésta? ----------
list($rs, $cs) = pedir($FS . 'inv_solicitudes/' . rawurlencode($solicId) . '?key=' . $APIKEY);
if ($cs != 200) {
  http_response_code(404);
  echo json_encode(array('ok' => false, 'error' => 'sin-solicitud'));
  exit;
}
$sol = json_decode($rs, true);
$campos = isset($sol['fields']) ? $sol['fields'] : array();
$n1Sol = isset($campos['n1']['stringValue']) ? trim($campos['n1']['stringValue']) : '';
$n1Ev  = trim((string)($ev['n1'] ?? ''));
if ($n1Sol === '' || mb_strtolower($n1Sol) !== mb_strtolower($n1Ev)) {
  /* Lo que llegó no se corresponde con la solicitud que dice ser. */
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'no-coincide'));
  exit;
}

// ---------- 3. credenciales del sistema ----------
$PANEL_USER = ''; $PANEL_PASS = '';
$candidatos = array();
$dir = __DIR__;
for ($i = 0; $i < 6; $i++) {
  $candidatos[] = $dir . '/invitame-panel.php';
  $candidatos[] = $dir . '/invitame-config.php';
  $padre = dirname($dir);
  if ($padre === $dir) break;
  $dir = $padre;
}
if (isset($_SERVER['DOCUMENT_ROOT'])) {
  $candidatos[] = dirname($_SERVER['DOCUMENT_ROOT']) . '/invitame-panel.php';
  $candidatos[] = dirname(dirname($_SERVER['DOCUMENT_ROOT'])) . '/invitame-panel.php';
}
foreach (array_unique($candidatos) as $ruta) {
  if (!is_readable($ruta)) continue;
  include $ruta;
  if ($PANEL_USER !== '' && $PANEL_PASS !== '') break;
}
if ($PANEL_USER === '' || $PANEL_PASS === '') {
  echo json_encode(array('ok' => false, 'error' => 'sin-config'));
  exit;
}
list($ra, $ca) = pedir(
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $APIKEY,
  'POST',
  json_encode(array('email' => $PANEL_USER, 'password' => $PANEL_PASS, 'returnSecureToken' => true))
);
if ($ca != 200) { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$sesion  = json_decode($ra, true);
$idToken = isset($sesion['idToken']) ? $sesion['idToken'] : '';
if ($idToken === '') { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$auth = array('Authorization: Bearer ' . $idToken);

// ---------- 4. lo que pone el SERVIDOR, no el cliente ----------
$ahora    = gmdate('Y-m-d\TH:i:s\Z');
$clave    = codigo(8);          // la del panel de los novios
$revision = codigo(14);         // el código del link de revisión
$estado   = $ENTREGA_AUTOMATICA ? 'entregada' : 'por-revisar';

$ev['estado']   = $estado;
$ev['revision'] = $revision;
$ev['privado']  = false;

/* Los invitados salen del evento: van a su propia colección. */
$invitados = array();
if (isset($ev['invitados']) && is_array($ev['invitados'])) $invitados = $ev['invitados'];
unset($ev['invitados']);
if (count($invitados) > 300) $invitados = array_slice($invitados, 0, 300);

// ---------- 5. la invitación ----------
list($rc, $cc) = pedir($FS . 'inv_eventos/' . rawurlencode($slug), 'PATCH', json_encode(docDe($ev)), $auth);
if ($cc < 200 || $cc >= 300) {
  echo json_encode(array('ok' => false, 'error' => 'crear-evento', 'detalle' => 'http' . $cc . ' ' . substr((string)$rc, 0, 200)));
  exit;
}

// ---------- 6. un pase por invitado ----------
/* ⚠️ El token lo genera ESTE archivo. Ver la nota de arriba. */
$tokens = array();
$fallados = 0;
foreach ($invitados as $g) {
  if (!is_array($g)) continue;
  $nombre = trim((string)($g['n'] ?? ''));
  if ($nombre === '') continue;
  $tok  = codigo(10);
  $per  = (int)($g['p'] ?? 1); if ($per < 1 || $per > 30) $per = 1;
  $mesa = trim((string)($g['m'] ?? '-')); if ($mesa === '') $mesa = '-';
  $doc = docDe(array(
    'slug'         => $slug,
    'token'        => $tok,
    'nombre'       => mb_substr($nombre, 0, 120),
    'pases'        => $per,
    'mesa'         => mb_substr($mesa, 0, 20),
    'usosMax'      => $per,
    'usos'         => $per,
    'rsvp'         => 'pendiente',
    'restriccion'  => mb_substr(trim((string)($g['restriccion'] ?? '')), 0, 200),
    'updatedAt'    => $ahora,
  ));
  list($ri, $ci) = pedir($FS . 'inv_invitados/' . rawurlencode($slug . '__' . $tok), 'PATCH', json_encode($doc), $auth);
  if ($ci >= 200 && $ci < 300) $tokens[] = $tok; else $fallados++;
}

// ---------- 7. el panel de los novios ----------
$nombres = trim(trim((string)($ev['n1'] ?? '')) . (isset($ev['n2']) && $ev['n2'] !== '' ? ' & ' . $ev['n2'] : ''));
if ($nombres === '') $nombres = $slug;
pedir($FS . 'inv_paneles/' . rawurlencode($slug . '__' . $clave), 'PATCH', json_encode(docDe(array(
  'slug'        => $slug,
  'nombres'     => $nombres,
  'tokens'      => $tokens,
  'fechaTexto'  => (string)($ev['c_ceremonia-1-fecha-descripcion'] ?? ($ev['ev1fecha'] ?? '')),
  'actualizado' => $ahora,
))), $auth);

// ---------- 8. lo privado ----------
/* ⚠️ La clave del panel, el mail y el teléfono NO van en el documento del
   evento: ése lo lee cualquiera que tenga el link de la invitación. */
$contacto = array();
foreach (array('contactoNombre', 'contactoEmail', 'contactoWsp') as $k) {
  if (isset($campos[$k]['stringValue'])) $contacto[$k] = $campos[$k]['stringValue'];
}
pedir($FS . 'inv_privado/' . rawurlencode($slug), 'PATCH', json_encode(docDe(array_merge($contacto, array(
  'c_clave-del-panel-de-los-novios' => $clave,
  'solicitud'                       => $solicId,
  'creadoPor'                       => 'formulario-cliente',
  'creadoEl'                        => $ahora,
)))), $auth);

// ---------- 9. dejar anotado en la solicitud que ya se creó ----------
pedir($FS . 'inv_solicitudes/' . rawurlencode($solicId) .
      '?updateMask.fieldPaths=slugCreado&updateMask.fieldPaths=creadaEl',
      'PATCH', json_encode(docDe(array('slugCreado' => $slug, 'creadaEl' => $ahora))), $auth);

echo json_encode(array(
  'ok'        => true,
  'slug'      => $slug,
  'estado'    => $estado,
  'invitados' => count($tokens),
  'fallados'  => $fallados,
  /* El link para ver la invitación. En modo control de calidad lleva el código
     de revisión: es el que usa el equipo para mirarla antes de entregarla. */
  'link'      => 'https://invitame.littlemomentsok.com/i/?e=' . rawurlencode($slug) .
                 ($estado === 'por-revisar' ? '&rev=' . $revision : ''),
  /* La clave del panel SÓLO se devuelve en modo automático, que es cuando el
     cliente se lleva todo de una. En modo control de calidad se la pasa el
     equipo al entregar. */
  'panel'     => $ENTREGA_AUTOMATICA
                   ? array('url' => 'https://invitame.littlemomentsok.com/mi-panel.html?e=' . rawurlencode($slug),
                           'clave' => $clave)
                   : null,
));
