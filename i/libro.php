<?php
/* ===== FORMATO «LIBRO» (19/11/2026) ===========================================
   Lo incluye i/index.php DESPUÉS de los portones (por revisar, sólo con pase)
   cuando el evento tiene fx.libro.on === true. Es OPT-IN: una invitación sin
   esa marca —todas las entregadas— nunca pasa por acá.
   Sirve /libro/index.html con los datos del evento ya puestos (window.__LIBRO),
   así no hace falta otra lectura de Firestore ni el motor de /i/.
   ============================================================================ */
if (!function_exists('iv_libro_plano')) {
  function iv_libro_plano($v) {
    if (!is_array($v)) return $v;
    if (array_key_exists('stringValue', $v))  return (string)$v['stringValue'];
    if (array_key_exists('booleanValue', $v)) return (bool)$v['booleanValue'];
    if (array_key_exists('integerValue', $v)) return (int)$v['integerValue'];
    if (array_key_exists('doubleValue', $v))  return (float)$v['doubleValue'];
    if (array_key_exists('nullValue', $v))    return null;
    if (array_key_exists('timestampValue', $v)) return (string)$v['timestampValue'];
    if (array_key_exists('arrayValue', $v)) {
      $o = array(); $vs = isset($v['arrayValue']['values']) ? $v['arrayValue']['values'] : array();
      foreach ($vs as $x) { $o[] = iv_libro_plano($x); } return $o;
    }
    if (array_key_exists('mapValue', $v)) {
      $o = array(); $fs = isset($v['mapValue']['fields']) ? $v['mapValue']['fields'] : array();
      foreach ($fs as $k => $x) { $o[$k] = iv_libro_plano($x); } return (object)$o;
    }
    return null;
  }
}
$lbF = isset($data['fields']) ? $data['fields'] : array();
/* sólo lo que el libro usa (la ficha entera es pública igual, pero no hace falta mandarla) */
$lbClaves = array('n1','n2','fecha','tipoEvento','tema','slug',
  'ev1t','ev1sub','ev1dir','ev1maps','ev2t','ev2sub','ev2dir','ev2maps',
  'c_ceremonia-1-fecha','c_ceremonia-2-fecha','c_dresscode-texto',
  'reg_liverpool','regClabe','regTitular','regBanco','regEtqCuenta',
  'c_numero-de-whatsapp','c_numero-de-whatsapp-2','c_texto-corto-boton-wsp','c_texto-corto-boton-wsp-2','musicaUrl');
$lbEv = array();
foreach ($lbClaves as $k) { if (isset($lbF[$k])) $lbEv[$k] = iv_libro_plano($lbF[$k]); }
$lbFx = array();
if (isset($lbF['fx']['mapValue']['fields']['libro'])) $lbFx['libro'] = iv_libro_plano($lbF['fx']['mapValue']['fields']['libro']);
if (isset($lbF['fx']['mapValue']['fields']['rsvp'])) $lbFx['rsvp'] = iv_libro_plano($lbF['fx']['mapValue']['fields']['rsvp']);
$lbEv['fx'] = (object)$lbFx;

$lbTpl = @file_get_contents(dirname(__DIR__) . '/libro/index.html');
if ($lbTpl === false) { http_response_code(500); echo 'Error'; exit; }

$lbE = function ($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); };
$lbN1 = isset($lbEv['n1']) ? $lbEv['n1'] : ''; $lbN2 = isset($lbEv['n2']) ? $lbEv['n2'] : '';
$lbTit = trim($lbN1 . ' & ' . $lbN2, ' &') . ' · Nuestra historia';
$lbImg = '';
if (isset($lbFx['libro']->portada->foto)) $lbImg = (string)$lbFx['libro']->portada->foto;
if ($lbImg !== '') $lbImg = preg_replace('#(res\.cloudinary\.com/[^/]+/image/upload/)#', '$1c_fill,g_auto,w_1200,h_630,f_jpg,q_auto/', $lbImg, 1);
$lbDesc = 'Te invitamos a leer nuestra historia y a escribir con nosotros el último capítulo.';
$lbMeta = '<meta property="og:type" content="website">' .
  '<meta property="og:title" content="' . $lbE($lbTit) . '">' .
  '<meta property="og:description" content="' . $lbE($lbDesc) . '">' .
  ($lbImg !== '' ? '<meta property="og:image" content="' . $lbE($lbImg) . '"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">' : '') .
  '<meta name="twitter:card" content="summary_large_image">' .
  '<script>window.__LIBRO=' . json_encode($lbEv, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) . ';</script>';
$lbTpl = str_replace('<title>Nuestra historia</title>', '<title>' . $lbE($lbTit) . '</title>', $lbTpl);
$lbTpl = str_replace('<!--LIBRO-META-->', $lbMeta, $lbTpl);

header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('X-Invitame-Formato: libro');
echo $lbTpl;
exit;
