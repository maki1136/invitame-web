<?php
/**
 * Invitame — EL CARTEL DE «TODAVÍA NO».
 *
 * Lo muestra `i/index.php` cuando el evento tiene `estado = "por-revisar"` y
 * quien entra no trae el código de revisión. Ver la nota grande de allá.
 *
 * ⚠️ QUÉ TIENE QUE SENTIR QUIEN LO LEE.  (pedido de Maki, 8/9/2026)
 *    La primera versión decía «esta invitación se está preparando… quien la
 *    está armando te va a pasar el link». Sonaba a trámite, y encima a que
 *    faltaba algo. Este cartel lo ve el cliente que ACABA de comprar y entra
 *    ansioso a mirar: tiene que salir sintiendo que su invitación está en
 *    buenas manos, no que está en una fila.
 *    Maki: «que diga: ahora nuestro equipo de diseño se encargará de diseñar la
 *    invitación de tus sueños».
 *
 * ⚠️ ACÁ NO VA NINGÚN DATO DE LA FIESTA. Ni los nombres, ni la fecha, ni la
 *    foto. La dirección de una invitación se adivina (son los nombres de la
 *    pareja); si alguien acierta, no tiene que enterarse de nada más.
 *
 * ⚠️ ESPAÑOL DE MÉXICO, SIN VOSEO. Es el mercado.
 *
 * ⚠️ NO SE INDEXA. Lleva `noindex,nofollow`: una invitación a medio revisar no
 *    puede terminar en Google.
 *
 * Está aparte de `index.php` a propósito: así se le puede cambiar el texto o el
 * diseño sin tocar el archivo por el que pasan TODAS las invitaciones.
 */
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('X-Robots-Tag: noindex, nofollow');
?><!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>Tu invitación se está diseñando</title>
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600&family=Nunito:wght@400;600&display=swap">
<style>
  html,body{margin:0;height:100%}
  body{display:flex;align-items:center;justify-content:center;padding:26px;
       background:linear-gradient(160deg,#FFF8F4 0%,#FDF1EC 100%);
       color:#3A1B22;font-family:Nunito,system-ui,-apple-system,sans-serif;
       text-align:center;-webkit-font-smoothing:antialiased}
  .caja{max-width:440px}
  .sello{width:56px;height:56px;margin:0 auto 22px;border-radius:50%;
         border:1px solid #F8D3D6;display:flex;align-items:center;justify-content:center}
  .sello svg{width:25px;height:25px;stroke:#6D1233;fill:none;stroke-width:1.3;
             stroke-linecap:round;stroke-linejoin:round}
  h1{font-family:"Cormorant Garamond",Georgia,serif;font-weight:600;
     font-size:32px;line-height:1.2;margin:0 0 15px;color:#6D1233}
  p{font-size:15.5px;line-height:1.65;margin:0;opacity:.8}
  .chico{font-size:13.5px;margin-top:14px;opacity:.6}
  .linea{width:46px;height:1px;background:#F8D3D6;margin:28px auto 14px}
  .marca{font-size:12.5px;letter-spacing:.14em;text-transform:uppercase;opacity:.45}
</style>
</head>
<body>
  <div class="caja">
    <div class="sello">
      <!-- una aguja con hilo: se está confeccionando. Dibujado, sin emojis. -->
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M20 4L9.5 14.5"/>
        <path d="M6.5 17.5l1.6-1.6"/>
        <circle cx="5.4" cy="18.6" r="1.6"/>
        <path d="M20 4l-1.1 3.1"/>
      </svg>
    </div>
    <h1>Estamos diseñando<br>la invitación de tus sueños</h1>
    <p>Nuestro equipo de diseño ya está trabajando en ella, cuidando cada
       detalle. En cuanto esté lista te compartimos el enlace para que la veas
       y la presumas.</p>
    <p class="chico">Gracias por la paciencia: vale la pena.</p>
    <div class="linea"></div>
    <div class="marca">Invítame</div>
  </div>
</body>
</html>
