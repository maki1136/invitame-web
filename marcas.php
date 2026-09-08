<?php
/**
 * Invítame — LAS MARCAS Y SU MODO DE ENTREGA.
 *
 * ⭐ POR QUÉ EXISTE
 *   Maki, 8/9/2026: *«por ahora quiero que Jazmín haga el control de calidad,
 *   pero el otro sistema seguro lo use con otra marca o quizás después con
 *   Invítame»*.
 *
 *   O sea: el modo de entrega NO puede seguir siendo una línea de código que
 *   cambio yo. Tiene que ser un ajuste que ella prende y apaga, y tiene que
 *   poder valer distinto para cada marca AL MISMO TIEMPO:
 *
 *     inv_marcas/invitame   → entregaAutomatica: false  (Jazmín revisa)
 *     inv_marcas/laotra     → entregaAutomatica: true   (sale sola)
 *
 *   `solicitud-crear.php` lee ese documento y decide. Si la marca no existe,
 *   cae en control de calidad: **el modo seguro es el que revisa**.
 *
 * ⚠️ POR QUÉ UN PORTERO Y NO FIRESTORE DIRECTO
 *   `inv_marcas` es una colección nueva y las reglas de Firestore la niegan por
 *   defecto. Cambiar una regla es de las poquísimas cosas que se le preguntan a
 *   Maki antes de hacer, y no hace falta: este archivo entra con el usuario del
 *   sistema, igual que los demás porteros.
 *
 * ⚠️ QUIÉN PUEDE
 *   Sólo el equipo, y se comprueba de verdad: el navegador manda el token de su
 *   sesión de Firebase, se lo damos a Google para que diga de quién es, y recién
 *   si ese mail está en la lista sigue. Mismo criterio que `galeria-alta.php`.
 *
 * ⚠️ ACÁ NO SE ENTREGA NINGUNA INVITACIÓN. Esto sólo guarda el ajuste de la
 *    marca. Cambiar el estado de UNA invitación lo hace el panel, con la sesión
 *    de la diseñadora, sobre `inv_eventos`.
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

/* Quiénes pueden tocar las marcas. No es un secreto: sin la sesión de esa
   persona, saber el mail no sirve para nada. */
$EQUIPO = array(
  'littlemomentsok@gmail.com',
  'info@invitameok.com',
);

if ((int)($_SERVER['CONTENT_LENGTH'] ?? 0) > 8192) {
  http_response_code(413);
  echo json_encode(array('ok' => false, 'error' => 'muy-grande'));
  exit;
}
$in = json_decode(file_get_contents('php://input'), true);
if (!is_array($in)) $in = array();

$idToken = is_string($in['idToken'] ?? null) ? trim($in['idToken']) : '';
$accion  = (string)($in['accion'] ?? 'listar');
if ($idToken === '') {
  http_response_code(400);
  echo json_encode(array('ok' => false, 'error' => 'faltan-datos'));
  exit;
}

// ---------- helper HTTP ----------
function pedir($url, $metodo = 'GET', $cuerpo = null, $headers = array()) {
  $ch = curl_init($url);
  $opt = array(
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST  => $metodo,
    CURLOPT_CONNECTTIMEOUT => 5,
    CURLOPT_TIMEOUT        => 15,
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

function limpio($v, $max = 60) {
  $v = is_string($v) ? $v : '';
  $v = strip_tags($v);
  $v = str_replace(array("\r", "\n", "\t"), ' ', $v);
  $v = preg_replace('/\s+/u', ' ', $v);
  return trim(mb_substr($v, 0, $max));
}

// ---------- 1. ¿quién es? Se lo preguntamos a Google ----------
list($ru, $cu) = pedir(
  'https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=' . $APIKEY,
  'POST', json_encode(array('idToken' => $idToken))
);
if ($cu != 200) {
  http_response_code(401);
  echo json_encode(array('ok' => false, 'error' => 'sesion'));
  exit;
}
$u = json_decode($ru, true);
$mail = isset($u['users'][0]['email']) ? strtolower(trim($u['users'][0]['email'])) : '';
$permitido = false;
foreach ($EQUIPO as $e) { if ($mail !== '' && $mail === strtolower($e)) { $permitido = true; break; } }
if (!$permitido) {
  http_response_code(403);
  echo json_encode(array('ok' => false, 'error' => 'no-sos-del-equipo'));
  exit;
}

// ---------- 2. entrar como el usuario del sistema ----------
$PANEL_USER = ''; $PANEL_PASS = '';
$candidatos = array();
$dir = __DIR__;
for ($i = 0; $i < 6; $i++) {
  $candidatos[] = $dir . '/invitame-panel.php';
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
$ses = json_decode($ra, true);
$tok = isset($ses['idToken']) ? $ses['idToken'] : '';
if ($tok === '') { echo json_encode(array('ok' => false, 'error' => 'login')); exit; }
$auth = array('Authorization: Bearer ' . $tok);

$ahora = gmdate('Y-m-d\TH:i:s\Z');

// ---------- 3. guardar ----------
if ($accion === 'guardar') {
  $id = preg_replace('/[^a-z0-9\-]/', '', strtolower((string)($in['id'] ?? '')));
  if (strlen($id) < 2 || strlen($id) > 40) {
    http_response_code(400);
    echo json_encode(array('ok' => false, 'error' => 'id'));
    exit;
  }
  $nombre = limpio($in['nombre'] ?? '', 60);
  if ($nombre === '') $nombre = $id;
  $auto = !empty($in['entregaAutomatica']);

  $cuerpo = json_encode(array('fields' => array(
    'nombre'            => array('stringValue'  => $nombre),
    'entregaAutomatica' => array('booleanValue' => $auto),
    'actualizadoEl'     => array('stringValue'  => $ahora),
    'actualizadoPor'    => array('stringValue'  => $mail),
  )));
  /* Con máscara: así, si mañana la marca guarda algo más (un teléfono, un
     logo), esto no se lo lleva puesto. */
  $url = $FS . 'inv_marcas/' . rawurlencode($id)
       . '?updateMask.fieldPaths=nombre'
       . '&updateMask.fieldPaths=entregaAutomatica'
       . '&updateMask.fieldPaths=actualizadoEl'
       . '&updateMask.fieldPaths=actualizadoPor';
  list($rg, $cg) = pedir($url, 'PATCH', $cuerpo, $auth);
  if ($cg < 200 || $cg >= 300) {
    echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cg));
    exit;
  }
  echo json_encode(array('ok' => true, 'id' => $id, 'entregaAutomatica' => $auto));
  exit;
}

// ---------- 4. listar ----------
list($rl, $cl) = pedir($FS . 'inv_marcas?pageSize=100', 'GET', null, $auth);
$marcas = array();
if ($cl == 200) {
  $d = json_decode($rl, true);
  if (isset($d['documents']) && is_array($d['documents'])) {
    foreach ($d['documents'] as $doc) {
      $partes = explode('/', (string)($doc['name'] ?? ''));
      $id = end($partes);
      $f  = isset($doc['fields']) ? $doc['fields'] : array();
      $marcas[] = array(
        'id'                => $id,
        'nombre'            => isset($f['nombre']['stringValue']) ? $f['nombre']['stringValue'] : $id,
        'entregaAutomatica' => !empty($f['entregaAutomatica']['booleanValue']),
      );
    }
  }
}

/* La primera vez no hay nada. Se crea Invítame en control de calidad, que es el
   modo seguro y el que Maki quiere hoy. Así la pantalla nunca aparece vacía y el
   ajuste queda escrito, no supuesto. */
$hayInvitame = false;
foreach ($marcas as $m) { if ($m['id'] === 'invitame') { $hayInvitame = true; break; } }
if (!$hayInvitame) {
  pedir($FS . 'inv_marcas/invitame'
        . '?updateMask.fieldPaths=nombre'
        . '&updateMask.fieldPaths=entregaAutomatica'
        . '&updateMask.fieldPaths=actualizadoEl'
        . '&updateMask.fieldPaths=actualizadoPor',
    'PATCH', json_encode(array('fields' => array(
      'nombre'            => array('stringValue'  => 'Invítame'),
      'entregaAutomatica' => array('booleanValue' => false),
      'actualizadoEl'     => array('stringValue'  => $ahora),
      'actualizadoPor'    => array('stringValue'  => 'sistema'),
    ))), $auth);
  array_unshift($marcas, array('id' => 'invitame', 'nombre' => 'Invítame', 'entregaAutomatica' => false));
}

echo json_encode(array('ok' => true, 'marcas' => $marcas, 'por' => $mail));
