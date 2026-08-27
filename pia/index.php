<?php
/* ============================================================
   PANEL DE PÍA — encender / apagar el bot por línea
   Vive en: public_html/invitame/pia/index.php
   URL:     https://invitame.littlemomentsok.com/pia/

   - Sin ?api  -> devuelve la pantalla (HTML)
   - ?api=estado -> devuelve JSON con el estado YA CALCULADO
                    (esto es lo que consulta n8n antes de contestar)
   - POST      -> guarda un cambio (necesita la clave)

   EL ESTADO NO SE GUARDA ACÁ ADENTRO.
   Vive arriba de public_html, fuera del repo, porque el auto-deploy
   borra todo archivo que no esté en el repositorio.
   ============================================================ */

date_default_timezone_set('America/Mexico_City');

$BASE        = __DIR__ . '/../../../';              // …/domains/littlemomentsok.com/
$ARCH_ESTADO = $BASE . 'invitame-pia-estado.json';  // el estado
$ARCH_CONFIG = $BASE . 'invitame-pia.php';          // la clave (la pone Maki al final)

$CLAVE = null;
if (file_exists($ARCH_CONFIG)) { include $ARCH_CONFIG; if (isset($PIA_PASS) && $PIA_PASS !== '') $CLAVE = $PIA_PASS; }
$CONFIGURADO = ($CLAVE !== null);

/* ---------- las líneas que maneja el panel ---------- */
$LINEAS = array(
  '2' => array('nom' => 'Ventas',            'tel' => '+52 999 416 0750'),
  '5' => array('nom' => 'Ventas Oficial',    'tel' => '+52 1 999 296 3119'),
  '4' => array('nom' => 'Diseño / Posventa', 'tel' => '+52 1 999 436 5592'),
);

/* ---------- estado por defecto: TODO EN MANUAL ---------- */
function estado_default($LINEAS) {
  $l = array();
  foreach ($LINEAS as $id => $x) { $l[$id] = 'manual'; }
  return array(
    'global'  => 'ok',                 // 'ok' | 'off'  (off = botón de pánico)
    'lineas'  => $l,                   // 'manual' | 'bot' | 'auto'
    'horario' => array('desde' => '09:00', 'hasta' => '21:00', 'finde' => true),
    'actualizado' => '',
  );
}

function leer_estado($arch, $LINEAS) {
  $e = estado_default($LINEAS);
  if (file_exists($arch)) {
    $j = json_decode(file_get_contents($arch), true);
    if (is_array($j)) {
      if (isset($j['global']))  $e['global']  = ($j['global'] === 'off') ? 'off' : 'ok';
      if (isset($j['horario']) && is_array($j['horario'])) $e['horario'] = array_merge($e['horario'], $j['horario']);
      if (isset($j['lineas']) && is_array($j['lineas'])) {
        foreach ($LINEAS as $id => $x) {
          if (isset($j['lineas'][$id]) && in_array($j['lineas'][$id], array('manual','bot','auto'), true)) {
            $e['lineas'][$id] = $j['lineas'][$id];
          }
        }
      }
      if (isset($j['actualizado'])) $e['actualizado'] = $j['actualizado'];
    }
  }
  return $e;
}

/* ---------- ¿está Pía activa AHORA en esta línea? ----------
   auto = Pía contesta FUERA del horario de atención de las chicas   */
function calcular_activa($e, $LINEAS) {
  $out = array();
  $ahora   = (int)date('H') * 60 + (int)date('i');
  $esFinde = in_array((int)date('N'), array(6, 7), true);   // 6=sáb 7=dom

  $p = explode(':', $e['horario']['desde']);  $desde = ((int)$p[0]) * 60 + (int)(isset($p[1]) ? $p[1] : 0);
  $p = explode(':', $e['horario']['hasta']);  $hasta = ((int)$p[0]) * 60 + (int)(isset($p[1]) ? $p[1] : 0);

  // ¿estamos dentro del horario en que atienden las personas?
  if ($desde <= $hasta) { $enHorario = ($ahora >= $desde && $ahora < $hasta); }
  else                  { $enHorario = ($ahora >= $desde || $ahora < $hasta); } // cruza medianoche
  if ($esFinde && !empty($e['horario']['finde'])) $enHorario = false;           // finde = no atienden

  foreach ($LINEAS as $id => $x) {
    $modo = $e['lineas'][$id];
    if     ($e['global'] === 'off') $act = false;
    elseif ($modo === 'manual')     $act = false;
    elseif ($modo === 'bot')        $act = true;
    else                            $act = !$enHorario;    // auto
    $out[$id] = $act;
  }
  return array('activa' => $out, 'enHorario' => $enHorario, 'esFinde' => $esFinde);
}

$estado = leer_estado($ARCH_ESTADO, $LINEAS);
$calc   = calcular_activa($estado, $LINEAS);

/* ================= API que consulta n8n ================= */
if (isset($_GET['api']) && $_GET['api'] === 'estado') {
  header('Content-Type: application/json; charset=utf-8');
  header('Cache-Control: no-store');
  echo json_encode(array(
    'ok'          => true,
    'global'      => $estado['global'],
    'lineas'      => $estado['lineas'],
    'activa'      => $calc['activa'],
    'enHorario'   => $calc['enHorario'],
    'esFinde'     => $calc['esFinde'],
    'horario'     => $estado['horario'],
    'actualizado' => $estado['actualizado'],
    'hora'        => date('Y-m-d H:i'),
  ));
  exit;
}

/* ================= guardar un cambio ================= */
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
  header('Content-Type: application/json; charset=utf-8');

  if (!$CONFIGURADO) { echo json_encode(array('ok'=>false,'error'=>'sin-clave')); exit; }

  $body = json_decode(file_get_contents('php://input'), true);
  if (!is_array($body)) $body = array();

  $pass = isset($body['pass']) ? (string)$body['pass'] : '';
  if (!hash_equals((string)$CLAVE, $pass)) { echo json_encode(array('ok'=>false,'error'=>'clave')); exit; }

  $nuevo = $estado;

  if (isset($body['global']))  $nuevo['global'] = ($body['global'] === 'off') ? 'off' : 'ok';

  if (isset($body['linea']) && isset($body['modo'])) {
    $id = (string)$body['linea'];
    if (isset($LINEAS[$id]) && in_array($body['modo'], array('manual','bot','auto'), true)) {
      $nuevo['lineas'][$id] = $body['modo'];
    }
  }

  if (isset($body['horario']) && is_array($body['horario'])) {
    foreach (array('desde','hasta') as $k) {
      if (isset($body['horario'][$k]) && preg_match('/^\d{2}:\d{2}$/', $body['horario'][$k])) {
        $nuevo['horario'][$k] = $body['horario'][$k];
      }
    }
    if (isset($body['horario']['finde'])) $nuevo['horario']['finde'] = !empty($body['horario']['finde']);
  }

  $nuevo['actualizado'] = date('Y-m-d H:i');

  $tmp = $ARCH_ESTADO . '.tmp';
  $bytes = @file_put_contents($tmp, json_encode($nuevo));
  if ($bytes === false) { echo json_encode(array('ok'=>false,'error'=>'no-escribe')); exit; }
  @rename($tmp, $ARCH_ESTADO);

  $calc2 = calcular_activa($nuevo, $LINEAS);
  echo json_encode(array('ok'=>true,'estado'=>$nuevo,'activa'=>$calc2['activa'],'enHorario'=>$calc2['enHorario']));
  exit;
}
?>
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Pía — encendido</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet">
<style>
  :root{
    --uva:#b06a7e; --lino:#f4efe6; --tinta:#2b2430; --suave:#7a6f78;
    --linea:#e6ddd0; --verde:#3f9d6d; --ambar:#c9922f; --rojo:#c0504d; --blanco:#fffdfa;
  }
  *{box-sizing:border-box}
  body{margin:0;background:var(--lino);color:var(--tinta);font-family:Nunito,system-ui,sans-serif;
       -webkit-font-smoothing:antialiased;padding:18px 14px 60px}
  .wrap{max-width:560px;margin:0 auto}
  h1{font-family:'Cormorant Garamond',serif;font-weight:600;font-size:34px;margin:6px 0 2px;letter-spacing:.2px}
  .sub{color:var(--suave);font-size:14px;margin-bottom:18px}
  .card{background:var(--blanco);border:1px solid var(--linea);border-radius:16px;padding:16px;margin-bottom:14px}
  .fila{display:flex;justify-content:space-between;align-items:baseline;gap:10px;margin-bottom:12px}
  .nom{font-weight:700;font-size:17px}
  .tel{color:var(--suave);font-size:13px;font-variant-numeric:tabular-nums}
  .pill{font-size:12px;font-weight:700;padding:4px 10px;border-radius:999px;white-space:nowrap}
  .on{background:rgba(63,157,109,.14);color:var(--verde)}
  .off{background:rgba(192,80,77,.13);color:var(--rojo)}
  .btns{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  button{font-family:inherit;font-size:15px;font-weight:700;padding:13px 6px;border-radius:11px;
         border:1.5px solid var(--linea);background:#fff;color:var(--suave);cursor:pointer;
         transition:.15s;-webkit-tap-highlight-color:transparent}
  button:active{transform:scale(.97)}
  button.sel[data-m="manual"]{background:var(--rojo);border-color:var(--rojo);color:#fff}
  button.sel[data-m="bot"]{background:var(--verde);border-color:var(--verde);color:#fff}
  button.sel[data-m="auto"]{background:var(--ambar);border-color:var(--ambar);color:#fff}
  .panico{width:100%;padding:16px;font-size:16px;border:none;border-radius:14px;
          background:var(--rojo);color:#fff;letter-spacing:.3px}
  .panico.activo{background:var(--verde)}
  .aviso{background:#fff6e2;border:1px solid #e8d5a6;color:#7a5c14;border-radius:12px;
         padding:12px 14px;font-size:13.5px;line-height:1.5;margin-bottom:14px}
  .hora{color:var(--suave);font-size:12.5px;text-align:center;margin-top:16px;line-height:1.6}
  .horario{display:flex;align-items:center;gap:8px;flex-wrap:wrap;font-size:14px;color:var(--suave)}
  .horario input[type=time]{font-family:inherit;font-size:15px;padding:7px 9px;border:1.5px solid var(--linea);
                            border-radius:9px;background:#fff;color:var(--tinta)}
  .horario label{display:flex;align-items:center;gap:6px}
  h2{font-size:13px;text-transform:uppercase;letter-spacing:1.2px;color:var(--suave);margin:0 0 12px}
  .ok{position:fixed;left:50%;bottom:22px;transform:translateX(-50%) translateY(80px);background:var(--tinta);
      color:#fff;padding:11px 20px;border-radius:999px;font-size:14px;font-weight:600;
      transition:.25s;pointer-events:none;opacity:0}
  .ok.ver{transform:translateX(-50%) translateY(0);opacity:1}
</style>
</head>
<body>
<div class="wrap">

  <h1>Pía</h1>
  <div class="sub">Encendido del bot por línea</div>

  <?php if (!$CONFIGURADO): ?>
  <div class="aviso">
    <b>Panel en solo lectura.</b><br>
    Todavía no tiene clave puesta, así que se ve el estado pero no se puede cambiar nada.
    Es a propósito: hasta que la clave esté, nadie de afuera puede tocar el bot.
  </div>
  <?php endif; ?>

  <div class="card">
    <button id="panico" class="panico"></button>
  </div>

  <?php foreach ($LINEAS as $id => $l): $modo = $estado['lineas'][$id]; $act = $calc['activa'][$id]; ?>
  <div class="card" data-linea="<?php echo $id; ?>">
    <div class="fila">
      <div>
        <div class="nom"><?php echo htmlspecialchars($l['nom']); ?></div>
        <div class="tel"><?php echo htmlspecialchars($l['tel']); ?></div>
      </div>
      <div class="pill <?php echo $act ? 'on' : 'off'; ?>" data-pill>
        <?php echo $act ? 'Pía contestando' : 'Pía apagada'; ?>
      </div>
    </div>
    <div class="btns">
      <button data-m="manual" class="<?php echo $modo==='manual'?'sel':''; ?>">Manual</button>
      <button data-m="bot"    class="<?php echo $modo==='bot'   ?'sel':''; ?>">Bot</button>
      <button data-m="auto"   class="<?php echo $modo==='auto'  ?'sel':''; ?>">Auto</button>
    </div>
  </div>
  <?php endforeach; ?>

  <div class="card">
    <h2>Horario de atención de ustedes</h2>
    <div class="horario">
      <span>De</span>
      <input type="time" id="h-desde" value="<?php echo htmlspecialchars($estado['horario']['desde']); ?>">
      <span>a</span>
      <input type="time" id="h-hasta" value="<?php echo htmlspecialchars($estado['horario']['hasta']); ?>">
      <label><input type="checkbox" id="h-finde" <?php echo !empty($estado['horario']['finde'])?'checked':''; ?>> Fines de semana libres</label>
    </div>
    <div class="sub" style="margin:12px 0 0;font-size:13px">
      En <b>Auto</b>, Pía contesta sola fuera de este horario y se calla cuando ustedes entran.
    </div>
  </div>

  <div class="hora">
    Ahora son las <?php echo date('H:i'); ?> (hora de México)<br>
    <?php echo $calc['enHorario'] ? 'Están en horario de atención' : 'Fuera del horario de atención'; ?>
    <?php if ($estado['actualizado']): ?><br>Último cambio: <?php echo htmlspecialchars($estado['actualizado']); ?><?php endif; ?>
  </div>

</div>

<div class="ok" id="ok"></div>

<script>
(function(){
  var CONFIGURADO = <?php echo $CONFIGURADO ? 'true' : 'false'; ?>;
  var GLOBAL      = <?php echo json_encode($estado['global']); ?>;
  var clave       = null;

  var okBox = document.getElementById('ok');
  function avisar(t){ okBox.textContent = t; okBox.classList.add('ver');
                      setTimeout(function(){ okBox.classList.remove('ver'); }, 2200); }

  function pintarPanico(){
    var b = document.getElementById('panico');
    if (GLOBAL === 'off') { b.textContent = 'PRENDER TODO'; b.classList.add('activo'); }
    else                  { b.textContent = 'APAGAR TODO';  b.classList.remove('activo'); }
  }
  pintarPanico();

  function pedirClave(){
    if (clave) return clave;
    var c = window.prompt('Clave del panel');
    if (c) clave = c;
    return clave;
  }

  function guardar(payload, alOk){
    if (!CONFIGURADO) { avisar('Panel en solo lectura'); return; }
    var c = pedirClave(); if (!c) return;
    payload.pass = c;
    fetch(location.pathname, {
      method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload)
    }).then(function(r){ return r.json(); }).then(function(j){
      if (!j.ok) { clave = null; avisar(j.error === 'clave' ? 'Clave incorrecta' : 'No se pudo guardar'); return; }
      alOk(j); avisar('Guardado');
    }).catch(function(){ avisar('Sin conexión'); });
  }

  function refrescarPills(j){
    document.querySelectorAll('[data-linea]').forEach(function(card){
      var id = card.getAttribute('data-linea');
      var p  = card.querySelector('[data-pill]');
      var on = !!(j.activa && j.activa[id]);
      p.textContent = on ? 'Pía contestando' : 'Pía apagada';
      p.className = 'pill ' + (on ? 'on' : 'off');
    });
  }

  document.getElementById('panico').addEventListener('click', function(){
    var nuevo = (GLOBAL === 'off') ? 'ok' : 'off';
    if (nuevo === 'off' && !window.confirm('Apagar Pía en TODAS las líneas?')) return;
    guardar({ global: nuevo }, function(j){ GLOBAL = nuevo; pintarPanico(); refrescarPills(j); });
  });

  document.querySelectorAll('[data-linea] button').forEach(function(b){
    b.addEventListener('click', function(){
      var card = b.closest('[data-linea]');
      var id   = card.getAttribute('data-linea');
      var modo = b.getAttribute('data-m');
      guardar({ linea: id, modo: modo }, function(j){
        card.querySelectorAll('button').forEach(function(x){ x.classList.remove('sel'); });
        b.classList.add('sel');
        refrescarPills(j);
      });
    });
  });

  function guardarHorario(){
    guardar({ horario: {
      desde: document.getElementById('h-desde').value,
      hasta: document.getElementById('h-hasta').value,
      finde: document.getElementById('h-finde').checked
    }}, function(j){ refrescarPills(j); });
  }
  ['h-desde','h-hasta','h-finde'].forEach(function(id){
    document.getElementById(id).addEventListener('change', guardarHorario);
  });
})();
</script>
</body>
</html>
