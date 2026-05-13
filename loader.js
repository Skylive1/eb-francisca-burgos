const steps = 20;
let current = 0;

process.stdout.write('\x1b[2J\x1b[0f'); // Limpiar terminal
console.log('\x1b[33m%s\x1b[0m', '>> [ FLDSMFR ] — INICIANDO PROTOCOLO ACADÉMICO');
console.log('\x1b[90m%s\x1b[0m', '---------------------------------------------------');

const interval = setInterval(() => {
  current++;
  const progress = Math.min(Math.round((current / steps) * 100), 100);
  const bar = "█".repeat(current) + "░".repeat(steps - current);
  
  process.stdout.write(`\r\x1b[31m[${bar}]\x1b[0m \x1b[1m${progress}%\x1b[0m | CARGANDO MÓDULOS DEL AULA...`);
  
  if (current >= steps) {
    clearInterval(interval);
    console.log('\n\x1b[32m%s\x1b[0m', '\n>> [ SISTEMA CARGADO ] — Francisca Elena Burgos.');
    console.log('\x1b[90m%s\x1b[0m', '---------------------------------------------------\n');
  }
}, 100);
