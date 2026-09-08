<?php
/**
 * Invítame — LAS MARCAS Y SU MODO DE ENTREGA.
 *
 * ⭐ POR QUÉ EXISTE
 *   Maki, 8/9/2026: *«por ahora quiero que Jazmín haga el control de calidad,
 *   pero el otro sistema seguro lo use con otra marca o quizás después con
 *   Invítame»*.
 *
 *   O sea: el modo de entrega NO puede ser una línea de código que cambia el
 *   programador. Tiene que ser un ajuste que ella prende y apaga desde el panel,
 *   y tiene que poder valer distinto para cada marca AL MISMO TIEMPO:
 *
 *     invitame → entregaAutomatica: false  (Jazmín revisa)
 *     laotra   → entregaAutomatica: true   (sale sola)
 *
 *   `solicitud-crear.php` lee esto y decide. Si la marca no figura, cae en
 *   control de calidad: **el modo seguro es siempre el que revisa**.
 *
 * ⚠️⚠️ DÓNDE SE GUARDA, Y POR QUÉ NO DONDE PARECÍA
 *   La primera versión usaba una colección nueva, `inv_marcas`. **No se puede:
 *   medido en vivo, `permission-denied`.** Las reglas de Firestore sólo conocen
 *   las colecciones que ya existen, y crear una regla nueva es de las poquísimas
 *   cosas que se le preguntan a Maki antes de hacer.
 *
 *   Así que las marcas viven en **`inv_privado/__marcas`**, en un solo documento
 *   y en un solo campo `json`. `inv_privado` ya es la colección de lo que no se
 *   muestra: se escribe con la sesión del sistema y no se lee sin login. Es
 *   exactamente lo que hace falta para un ajuste del negocio.
 *
 *   El campo es un JSON de una línea a propósito: son cuatro datos por marca y
 *   los toca una sola persona. No hace falta un documento por marca ni parsear
 *   los `mapValue` de Firestore.
 *
 *   ⚠️ Ese documento aparece en la lista de `inv_privado` con el id `__marcas`.
 *      No es una invitación y nada lo trata como tal (el panel busca por slug).
 *
 * ⚠️ QUIÉN PUEDE
 *   Sólo el equipo, y se comprueba de verdad: el navegador manda el token de su
 *   sesión de Firebase, se lo damos a Google para que diga de quién es, y recién
 *   si ese mail está en la lista sigue. Mismo criterio que `galeria-alta.php`.
 *
 * ⚠️ ACÁ NO SE ENTREGA NINGUNA INVITACIÓN. Esto guarda el ajuste de la marca.
 *    Cambiar el estado de UNA invitación lo hace el panel (`admin/5-entrega.js`)
 *    con la sesión de la diseñadora, sobre `inv_eventos`.
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
$DOC     = 'inv_privado/__marcas';

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

// ---------- 3. lo que hay hoy ----------
$marcas = array();
list($rl, $cl) = pedir($FS . $DOC, 'GET', null, $auth);
if ($cl == 200) {
  $d = json_decode($rl, true);
  if (isset($d['fields']['json']['stringValue'])) {
    $tmp = json_decode($d['fields']['json']['stringValue'], true);
    if (is_array($tmp)) $marcas = $tmp;
  }
}

/* La primera vez no hay nada. Invítame nace en control de calidad, que es el
   modo seguro y el que Maki quiere hoy. Así el ajuste queda ESCRITO y no
   supuesto, y la pantalla nunca aparece vacía. */
$hay = false;
foreach ($marcas as $m) { if (($m['id'] ?? '') === 'invitame') { $hay = true; break; } }
if (!$hay) {
  array_unshift($marcas, array('id' => 'invitame', 'nombre' => 'Invítame', 'entregaAutomatica' => false));
}

// ---------- 4. guardar ----------
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

  $encontrada = false;
  foreach ($marcas as $k => $m) {
    if (($m['id'] ?? '') === $id) {
      $marcas[$k] = array('id' => $id, 'nombre' => $nombre, 'entregaAutomatica' => $auto);
      $encontrada = true;
      break;
    }
  }
  if (!$encontrada) $marcas[] = array('id' => $id, 'nombre' => $nombre, 'entregaAutomatica' => $auto);
  if (count($marcas) > 30) { http_response_code(400); echo json_encode(array('ok' => false, 'error' => 'demasiadas')); exit; }
  $marcas = array_values($marcas);
}

// ---------- 5. escribir ----------
/* ⚠️ CON MÁSCARA. `inv_privado/__marcas` es un documento nuestro y hoy sólo
   tiene estos campos, pero un PATCH sin máscara reemplaza el documento ENTERO:
   si mañana alguien le suma algo, se lo llevaría puesto. */
$cuerpo = json_encode(array('fields' => array(
  'json'           => array('stringValue' => json_encode(array_values($marcas))),
  'actualizadoEl'  => array('stringValue' => $ahora),
  'actualizadoPor' => array('stringValue' => $mail),
)));
list($rg, $cg) = pedir(
  $FS . $DOC . '?updateMask.fieldPaths=json'
      . '&updateMask.fieldPaths=actualizadoEl'
      . '&updateMask.fieldPaths=actualizadoPor',
  'PATCH', $cuerpo, $auth
);
if ($cg < 200 || $cg >= 300) {
  echo json_encode(array('ok' => false, 'error' => 'guardar', 'detalle' => 'http' . $cg, 'marcas' => array_values($marcas)));
  exit;
}

echo json_encode(array('ok' => true, 'marcas' => array_values($marcas), 'por' => $mail));
