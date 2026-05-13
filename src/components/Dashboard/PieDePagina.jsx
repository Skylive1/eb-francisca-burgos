import React from 'react';

/**
 * COMPONENTE: PieDePagina (Footer)
 * --------------------------------------------------------
 * Footer institucional oscuro y dinámico.
 * Incluye una barra de estado en vivo y navegación interna.
 */
const PieDePagina = () => {
  // Función para desplazamiento suave a secciones


  // Función para desplazamiento suave a secciones
  const navegarA = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-gradient-to-r from-vinotinto-900 via-vinotinto-800 to-vinotinto-900 text-white w-full border-t-2 border-gold/40 mt-auto">
      
      {/* ── CONTENIDO PRINCIPAL ── */}
      <div className="max-w-[1400px] mx-auto px-10 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 border-b border-white/10 pb-10 items-center">

          {/* Columna 1: Identidad institucional */}
          <div className="space-y-6 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-5">
                     <div className="w-12 h-12 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                        <img src="/Fondo-Nuevo.png" alt="Logo" className="w-full h-full object-contain" />
                     </div>
              <div>
                <p className="text-xl font-black italic tracking-tighter text-white font-display leading-none">Francisca Elena</p>
                <p className="text-[10px] text-gold font-black uppercase tracking-[0.2em] mt-1">Burgos D.</p>
              </div>
            </div>
            <p className="text-white/80 text-lg font-bold leading-relaxed max-w-xl mx-auto md:mx-0">
              Francisca Elena Burgos D. — Institución dedicada a la formación de líderes con excelencia académica y valores humanos fundamentales.
            </p>
            <div className="flex items-center justify-center md:justify-start gap-4">
              <span className="w-3 h-3 rounded-full bg-gold animate-pulse shadow-[0_0_10px_#b8860b]"></span>
              <p className="text-sm font-black text-gold uppercase tracking-[0.3em]">San Francisco, Edo. Zulia, Venezuela</p>
            </div>
          </div>

          {/* Columna 2: Contacto Directo */}
          <div className="bg-white/5 p-10 rounded-[3rem] border border-white/10 backdrop-blur-sm shadow-2xl">
            <h4 className="text-sm font-black text-gold uppercase tracking-[0.4em] mb-8 text-center md:text-left">Canales Institucionales</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {[
                { icon: '📞', label: 'Línea Directa',  val: '(+58) 424-5833511' },
                { icon: '✉️', label: 'Correo Soporte',      val: 'info@Francisca Elena.edu.ve' },
              ].map((c, i) => (
                <div key={i} className="flex flex-col gap-2 group">
                  <p className="text-[11px] font-black text-gold/80 uppercase tracking-[0.2em] flex items-center gap-2">
                    <span className="text-base">{c.icon}</span> {c.label}
                  </p>
                  <p className="text-lg font-black text-white group-hover:text-gold transition-colors">{c.val}</p>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
               <p className="text-xs font-black text-white/50 text-center md:text-left leading-relaxed uppercase tracking-wider">
                 Para soporte técnico inmediato operacional, contacte a través de los canales oficiales en horario administrativo.
               </p>
            </div>
          </div>

        </div>

        {/* ── FRANJA INFERIOR CENTRADA ── */}
        <div className="pt-10 flex flex-col items-center gap-8">
          <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold/30 to-transparent"></div>
          <p className="text-xs font-black text-white/60 uppercase tracking-[0.5em] text-center italic">
            © {new Date().getFullYear()} U.E.P. FRANCISCA ELENA BURGOS D. · TODOS LOS DERECHOS RESERVADOS
          </p>
          <div className="flex gap-12 text-[11px] font-black uppercase tracking-[0.3em] text-white/40">
            <a href="#" className="hover:text-gold hover:scale-110 transition-all">Privacidad</a>
            <a href="#" className="hover:text-gold hover:scale-110 transition-all">Normativa</a>
            <a href="#" className="hover:text-gold hover:scale-110 transition-all">Ayuda Digital</a>
          </div>
        </div>
      </div>

    </footer>
  );
};

export default PieDePagina;
