<?php
/**
 * galeria-novios.php — LOS NOVIOS MODERAN SU GALERÍA (Invítame Live) DESDE SU PANEL
 * 23/10/2026 · Maki: «el cliente y Jazmín también… agregarle el acceso».
 *
 * Los novios no tienen usuario de Firebase: entran a mi-panel.html con su slug y
 * su clave. Este archivo comprueba esa clave (que exista `inv_paneles/{slug}__{clave}`,
 * igual que mesas-guardar.php), busca el código de SU galería en SU invitación
 * (`fx.galeria.gid`, nunca uno que mande el navegador) y recién ahí lista o
 * cambia el estado de una foto/mensaje con la cuenta del sistema
 * (panel@invitame.local), a la que las reglas de Firestore dejan moderar
 * (esEquipo() en puedeModerar(), desde el 23/10/2026).
 *
 * Entra:  { slug, clave, accion: 'listar' }
 *         { slug, clave, accion: 'estado', col: 'fotos'|'firmas', fid, estado }
 * ⚠️ Sólo se toca el campo `estado`, con updateMask: un PATCH sin máscara
 *    reemplaza el documento entero.
 * La clave viaja en el CUERPO del pedido, nunca en la dirección.
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

if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 4096) { http_response_code(413); echo json_encode(array('ok'=>false,'error'=>'muy-grande')); exit; }
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

function limpio($v, $max = 200) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = preg_replace('/\s+/u', ' ', $v);
  return trim(mb_substr($v, 0, $max));
}
function fuera($codigo, $error) {
  http_response_code($codigo);
  echo json_encode(array('ok' => false, 'error' => $error));
  exit;
}

$slug   = preg_replace('/[^a-z0-9\-]/', '', strtolower(limpio($in['slug'] ?? '', 60)));
$clave  = limpio($in['clave'] ?? '', 60);
$accion = limpio($in['accion'] ?? '', 20);
if ($slug === '' || $clave === '') fuera(400, 'faltan-datos');
if ($accion !== 'listar' && $accion !== 'estado') fuera(400, 'accion');

$rutaLim = __DIR__ . '/invitame-limite.php';
if (is_readable($rutaLim)) {
  include_once $rutaLim;
  iv_frenar(array(
    array('gn-ip-'  . iv_ip(), 900,  3600),
    array('gn-inv-' . $slug,   900,  3600),
    array('gn-glob',           8000, 3600),
  ));
}

function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array()) {
  $ch = curl_init($url);
  $opt = array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $metodo,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT        => 12,
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
list($rp, $cp) = pedir($FS . 'inv_paneles/' . rawurlencode($slug . '__' . $clave) . '?key=' . $APIKEY);
if ($cp != 200) fuera(403, 'clave');

// ---------- 2. la galería de SU invitación ----------
list($re, $ce) = pedir($FS . 'inv_eventos/' . rawurlencode($slug) . '?key=' . $APIKEY);
if ($ce != 200) fuera(404, 'evento');
$ev  = json_decode($re, true);
$gid = $ev['fields']['fx']['mapValue']['fields']['galeria']['mapValue']['fields']['gid']['stringValue'] ?? '';
if (!preg_match('/^[A-Za-z0-9_-]{16,64}$/', $gid)) {
  echo json_encode(array('ok' => true, 'sinGaleria' => true));
  exit;
}

// ---------- 3. la cuenta del sistema ----------
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
if ($PANEL_USER === '' || $PANEL_PASS === '') fuera(500, 'sin-config');

list($ra, $ca) = pedir(
  'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=' . $APIKEY,
  'POST',
  json_encode(array('email' => $PANEL_USER, 'password' => $PANEL_PASS, 'returnSecureToken' => true))
);
if ($ca != 200) fuera(500, 'login');
$sesion  = json_decode($ra, true);
$idToken = $sesion['idToken'] ?? '';
if ($idToken === '') fuera(500, 'login');
$auth = array('Authorization: Bearer ' . $idToken);

// ---------- 4a. listar ----------
function valor($v) {
  if (!is_array($v)) return null;
  if (isset($v['stringValue']))  return $v['stringValue'];
  if (isset($v['integerValue'])) return (int)$v['integerValue'];
  if (isset($v['doubleValue']))  return (float)$v['doubleValue'];
  if (isset($v['booleanValue'])) return (bool)$v['booleanValue'];
  if (isset($v['mapValue'])) {
    $o = array();
    foreach (($v['mapValue']['fields'] ?? array()) as $k => $x) $o[$k] = valor($x);
    return $o;
  }
  return null;
}

if ($accion === 'listar') {
  $out = array();
  foreach (array('fotos' => 'gal_fotos', 'firmas' => 'gal_firmas') as $corto => $col) {
    $token = '';
    for ($pag = 0; $pag < 6; $pag++) {
      $url = $FS . $col . '/' . rawurlencode($gid) . '/items?pageSize=300' . ($token !== '' ? '&pageToken=' . rawurlencode($token) : '');
      list($rl, $cl) = pedir($url, 'GET', null, $auth);
      if ($cl != 200) { echo json_encode(array('ok' => false, 'error' => 'leer', 'detalle' => 'http' . $cl)); exit; }
      $j = json_decode($rl, true);
      foreach (($j['documents'] ?? array()) as $d) {
        $f = array();
        foreach (($d['fields'] ?? array()) as $k => $x) $f[$k] = valor($x);
        $estado = $f['estado'] ?? '';
        if ($estado === 'borrada') continue;
        $r2 = is_array($f['r2'] ?? null) ? $f['r2'] : array();
        $out[] = array(
          'col'    => $corto,
          'fid'    => basename($d['name']),
          'estado' => $estado,
          'tipo'   => $corto === 'fotos' ? 'foto' : (($f['tipo'] ?? '') === 'audio' ? 'audio' : 'texto'),
          'autor'  => is_array($f['autor'] ?? null) ? (string)($f['autor']['nombre'] ?? '') : '',
          'texto'  => (string)($f['texto'] ?? ''),
          'key'    => (string)($r2['key'] ?? ''),
          'thumb'  => (string)($r2['thumb'] ?? ''),
          'tsms'   => (int)($f['tsms'] ?? 0),
        );
      }
      $token = $j['nextPageToken'] ?? '';
      if ($token === '') break;
    }
  }
  usort($out, function ($a, $b) { return $b['tsms'] - $a['tsms']; });
  echo json_encode(array('ok' => true, 'gid' => $gid, 'items' => $out));
  exit;
}

// ---------- 4b. cambiar el estado ----------
$colIn  = limpio($in['col'] ?? '', 10);
$fid    = preg_replace('/[^A-Za-z0-9_-]/', '', limpio($in['fid'] ?? '', 80));
$estado = limpio($in['estado'] ?? '', 20);
$cols = array('fotos' => 'gal_fotos', 'firmas' => 'gal_firmas');
if (!isset($cols[$colIn]) || $fid === '') fuera(400, 'item');
if (!in_array($estado, array('aprobada', 'rechazada', 'pendiente'), true)) fuera(400, 'estado');

$url = $FS . $cols[$colIn] . '/' . rawurlencode($gid) . '/items/' . rawurlencode($fid)
     . '?updateMask.fieldPaths=estado&currentDocument.exists=true';
list($rc, $cc) = pedir($url, 'PATCH', json_encode(array('fields' => array('estado' => array('stringValue' => $estado)))), $auth);
if ($cc < 200 || $cc >= 300) {
  echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cc));
  exit;
}
echo json_encode(array('ok' => true, 'estado' => $estado));
