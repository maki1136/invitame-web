<?php
/**
 * Invitame — LAS MESAS QUE ARMAN LOS NOVIOS, aplicadas solas a la invitacion.
 *
 * QUE PROBLEMA RESUELVE
 *   Los novios acomodan las mesas desde su panel. Eso quedaba guardado en SU
 *   documento (`inv_paneles/{slug}__{clave}`), que la invitacion NO lee. Para
 *   que llegara a destino, alguien del equipo tenia que abrir el admin, tocar
 *   «Traer las mesas que armaron los novios» y despues «Guardar y publicar».
 *
 *   Si nadie se acordaba, el dano era concreto y silencioso: el pase de cada
 *   invitado MUESTRA el numero de mesa. La pareja movia a media familia, veia
 *   su tablero al dia, y los invitados llegaban a la fiesta con la mesa vieja.
 *
 *   Maki, 8/9/2026, textual: «si lo cambian ellos, Jazmin que tiene que ver?».
 *   Este archivo es esa frase hecha codigo.
 *
 * POR QUE NO LO ESCRIBE EL NAVEGADOR DE LOS NOVIOS
 *   Mismo motivo que `pase-nuevo.php`: las reglas de Firestore no los dejan
 *   tocar `inv_invitados`, y esta bien que asi sea. Si pudieran, cualquiera con
 *   el link de un panel podria reescribirle los pases a una fiesta entera.
 *   Entonces el pedido pasa por aca:
 *     1. Se comprueba que quien pide CONOCE la clave del panel de esa
 *        invitacion. La prueba es que exista `inv_paneles/{slug}__{clave}`.
 *     2. Recien entonces este archivo entra a Firebase como usuario del sistema
 *        y escribe, y escribe SOLO el campo `mesa` de cada invitado.
 *
 * ⚠️ EL NAVEGADOR NO MANDA LAS MESAS. Manda unicamente la direccion y la clave.
 *    El reparto se lee ACA, del mismo documento que sirvio para verificar la
 *    clave. Asi nadie puede inventarse un reparto en el camino, y da igual que
 *    la fiesta tenga 300 invitados: el pedido pesa lo mismo.
 *
 * ⚠️ SOLO SE TOCA A QUIEN LOS NOVIOS MOVIERON. Si un invitado no figura en
 *    `asig`, se lo deja como esta. Esta es la MISMA regla que tenia el boton
 *    viejo, y esta puesta a proposito: sin ella, la primera vez que la pareja
 *    arrastra a una sola persona, a todos los demas se les borraria la mesa que
 *    habia cargado el equipo. Es justo lo contrario de lo que uno espera.
 *
 * ⚠️ EL `updateMask` NO ES OPCIONAL. Un PATCH sin mascara REEMPLAZA el
 *    documento entero: le borraria al invitado su nombre, sus pases, su
 *    confirmacion y sus usos en la puerta. Con `mesa` se toca solo esa hoja.
 *
 * ⚠️ `currentDocument.exists = true` en cada escritura. Sin eso, un token que ya
 *    no existe (un invitado dado de baja) haria que Firestore CREE una ficha
 *    fantasma con una sola linea: mesa. Entraria en el panel de los novios como
 *    un invitado sin nombre y nadie entenderia de donde salio.
 *
 * ⚠️ SE ESCRIBE DE A TANDAS (`:batchWrite`). Una fiesta de 300 invitados serian
 *    300 pedidos sueltos: el navegador se cansa antes de terminar. Asi es UN
 *    pedido cada 400. `batchWrite` NO es todo-o-nada: devuelve el resultado de
 *    cada escritura por separado, que es lo que queremos (si un token quedo
 *    viejo, que no arrastre a los otros 299).
 *
 * El usuario y la contrasena viven FUERA del repositorio, en invitame-panel.php
 * (fuera del repo y fuera de public_html).
 */

header('Content-Type: application/json; charset=utf-8');

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
  http_response_code(405);
  echo json_encode(array('ok' => false, 'error' => 'metodo'));
  exit;
}

$PROJECT = 'invitame-9b51f';
$APIKEY  = 'AIzaSyBXWZc9xdpXx7HCkJfxcyofgI00buNlIXc';
$FS      = 'https://firestore.googleapis.com/v1/projects/' . $PROJECT . '/databases/(default)/documents/';

// ---------- entrada ----------
// Entra poquito a proposito: direccion y clave. Nada mas.
if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) { http_response_code(413); echo json_encode(array('ok'=>false,'error'=>'muy-grande')); exit; }
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

function limpio($v, $max = 200) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n", "\t"), ' ', $v);
  $v = preg_replace('/\s+/u', ' ', $v);
  return trim(mb_substr($v, 0, $max));
}

$slug  = preg_replace('/[^a-z0-9\-]/', '', strtolower(limpio($in['slug'] ?? '', 60)));
$clave = limpio($in['clave'] ?? '', 60);

if ($slug === '' || $clave === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}

// Freno anti-abuso. Los topes son altos porque esto se dispara cada vez que la
// pareja arrastra a UNA persona: acomodar un casamiento entero son cientos de
// movimientos en una tarde, y no la podemos frenar por eso.
$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('mg-ip-'  . iv_ip(), 600,  3600),
    array('mg-inv-' . $slug,   600,  3600),
    array('mg-glob',           5000, 3600),
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

// ---------- 1. ¿conoce la clave del panel? ----------
$idPanel = $slug . '__' . $clave;
list($rp, $cp) = pedir($FS . 'inv_paneles/' . rawurlencode($idPanel) . '?key=' . $APIKEY);
if ($cp != 200) {
  http_response_code(403);
  echo json_encode(array('ok' => false, 'error' => 'clave'));
  exit;
}
$panel  = json_decode($rp, true);
$campos = isset($panel['fields']) ? $panel['fields'] : array();

// ---------- 2. leer el reparto DEL DOCUMENTO, no del navegador ----------
// `mesas` = [{id, nombre}]  ·  `asig` = {token: idDeMesa}  ·  vacio = sin mesa.
$nombreDe = array();
if (isset($campos['mesas']['arrayValue']['values'])) {
  foreach ($campos['mesas']['arrayValue']['values'] as $v) {
    $f = isset($v['mapValue']['fields']) ? $v['mapValue']['fields'] : array();
    $id  = isset($f['id']['stringValue'])     ? $f['id']['stringValue']     : '';
    $nom = isset($f['nombre']['stringValue']) ? $f['nombre']['stringValue'] : '';
    if ($id !== '') $nombreDe[$id] = $nom;
  }
}
$asig = array();
if (isset($campos['asig']['mapValue']['fields'])) {
  foreach ($campos['asig']['mapValue']['fields'] as $tok => $v) {
    $asig[$tok] = isset($v['stringValue']) ? $v['stringValue'] : '';
  }
}
if (!count($asig)) {
  // Todavia no movieron a nadie. No es un error: no hay nada que aplicar.
  echo json_encode(array('ok' => true, 'tocados' => 0, 'nada' => true));
  exit;
}

// ---------- 3. credenciales del sistema ----------
$PANEL_USER = ''; $PANEL_PASS = '';
// Se busca hacia ARRIBA desde esta carpeta. El archivo vive fuera de public_html.
// OJO: en public_html hay OTRO invitame-config.php (el de Cloudinary). Por eso el
// del panel se llama distinto y solo cortamos cuando de verdad quedaron cargadas
// las dos variables.
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
if ($ca != 200) {
  echo json_encode(array('ok' => false, 'error' => 'login', 'detalle' => 'http' . $ca));
  exit;
}
$sesion  = json_decode($ra, true);
$idToken = isset($sesion['idToken']) ? $sesion['idToken'] : '';
if ($idToken === '') { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$auth = array('Authorization: Bearer ' . $idToken);

// ---------- 4. armar las escrituras ----------
$prefijo = 'projects/' . $PROJECT . '/databases/(default)/documents/inv_invitados/';
$writes  = array();
$saltados = 0;
foreach ($asig as $tok => $idMesa) {
  // El token viene de una CLAVE de mapa de Firestore, asi que ya es texto sano;
  // igual se filtra, porque va a formar parte del nombre de un documento.
  $tok = preg_replace('/[^A-Za-z0-9_\-]/', '', (string)$tok);
  if ($tok === '') continue;
  if ($idMesa !== '' && !isset($nombreDe[$idMesa])) { $saltados++; continue; }  // mesa que no conozco: no piso nada
  $nuevo = ($idMesa === '') ? '-' : $nombreDe[$idMesa];
  if ($nuevo === '') $nuevo = '-';
  $writes[] = array(
    'update' => array(
      'name'   => $prefijo . $slug . '__' . $tok,
      'fields' => array('mesa' => array('stringValue' => $nuevo)),
    ),
    'updateMask'      => array('fieldPaths' => array('mesa')),
    'currentDocument' => array('exists' => true),
  );
}
if (!count($writes)) {
  echo json_encode(array('ok' => true, 'tocados' => 0, 'nada' => true, 'saltados' => $saltados));
  exit;
}

// ---------- 5. escribir, de a tandas ----------
$urlLote = rtrim($FS, '/') . ':batchWrite';
$tocados = 0;
$fallados = 0;
foreach (array_chunk($writes, 400) as $tanda) {
  list($rl, $cl) = pedir($urlLote, 'POST', json_encode(array('writes' => $tanda)), $auth);
  if ($cl < 200 || $cl >= 300) {
    echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cl . ' ' . substr((string)$rl, 0, 200)));
    exit;
  }
  // `batchWrite` no corta: contesta el resultado de cada escritura por separado.
  // Un `status` con codigo distinto de 0 es una ficha que ya no existe (invitado
  // dado de baja). No es un error del pedido: se cuenta y se sigue.
  $res = json_decode($rl, true);
  if (isset($res['status']) && is_array($res['status'])) {
    foreach ($res['status'] as $st) {
      if (empty($st['code'])) $tocados++; else $fallados++;
    }
  } else {
    $tocados += count($tanda);
  }
}

echo json_encode(array(
  'ok'       => true,
  'tocados'  => $tocados,
  'saltados' => $saltados,
  'viejos'   => $fallados,
));
