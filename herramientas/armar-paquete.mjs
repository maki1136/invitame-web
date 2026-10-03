// ===== ARMA efectos/todo.min.js — EL PAQUETE LIVIANO (3/10/2026) ==============
// Lo corre SOLO la acción .github/workflows/paquete.yml. Se puede correr a mano:
//     node herramientas/armar-paquete.mjs
// 1. Pide a efectos/todo.php la salida CRUDA (por PHP de línea de comandos: es
//    exactamente lo que serviría el servidor, sin copiar la lista de módulos).
// 2. La pasa por terser SIN comprimir ni renombrar: sólo saca comentarios y
//    espacios. El código queda idéntico en lo que hace.
// 3. Escribe la huella en la primera línea. todo.php sólo usa este archivo si la
//    huella coincide con la de los archivos que tiene AHORA; si no, sirve el crudo.
// Si algo falla (un módulo con error de sintaxis, terser que no puede), sale con
// error y NO escribe nada: el servidor sigue con el crudo, que siempre funciona.
import { execFileSync } from 'node:child_process';
import { writeFileSync, readFileSync, existsSync } from 'node:fs';
import { minify } from 'terser';
import { gzipSync } from 'node:zlib';

const php = (args) => execFileSync('php', ['efectos/todo.php', ...args], { maxBuffer: 64 * 1024 * 1024 }).toString('utf8');
const huella = php(['--huella']).trim();
if (!/^[0-9a-f]{32}$/.test(huella)) { console.error('huella rara:', huella); process.exit(1); }

const destino = 'efectos/todo.min.js';
if (existsSync(destino) && readFileSync(destino, 'utf8').startsWith('/*huella:' + huella + '*/')) {
  console.log('ya estaba al día:', huella); process.exit(0);
}

const crudo = php([]);
if (!crudo.includes('window.INVEFECTOS_JUNTOS')) { console.error('el crudo vino incompleto'); process.exit(1); }

const r = await minify(crudo, {
  compress: false,
  mangle: false,
  format: { comments: false, ascii_only: false },
  ecma: 2020,
});
if (!r.code || !r.code.includes('INVEFECTOS_JUNTOS')) { console.error('terser no devolvió el paquete'); process.exit(1); }

const salida = '/*huella:' + huella + '*/\n' + r.code + '\n';
writeFileSync(destino, salida);
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
console.log('crudo', kb(Buffer.byteLength(crudo)), '→ liviano', kb(Buffer.byteLength(salida)),
  '· gzip', kb(gzipSync(Buffer.from(crudo), { level: 9 }).length), '→', kb(gzipSync(Buffer.from(salida), { level: 9 }).length));
