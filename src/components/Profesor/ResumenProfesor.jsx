import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Calendar as CalendarIcon } from 'lucide-react';
import TarjetaClase from '../Dashboard/TarjetaClase';
import CalendarioEscolar from '../Dashboard/CalendarioEscolar';
import { supabase } from '../../lib/supabaseClient';

/**
 * COMPONENTE: ResumenProfesor (Modernizado)
 * --------------------------------------------------------
 * Vista de inicio del profesor con estética unificada.
 */
const ResumenProfesor = ({ misClases, onIrAClase, nombreProfesor }) => {
  const [pendingCount, setPendingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { count: pending } = await supabase
          .from('enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending');
        setPendingCount(pending || 0);

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [misClases]);

  const [calendarioAbierto, setCalendarioAbierto] = useState(false);

  return (
    <div className="space-y-8 animate-fade-in relative z-10">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* COLUMNA IZQUIERDA: MATERIAS */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center gap-4">
            <h3 className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">Mis Materias</h3>
            <div className="flex-1 h-px bg-gradient-to-r from-gray-200 to-transparent"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {misClases.map(clase => (
              <TarjetaClase 
                key={clase.id}
                title={clase.titulo}
                instructor="Tú eres el docente"
                imageColor={clase.colorFondo}
                alHacerClic={() => onIrAClase(clase, 'materiales')}
                esProfesor={true}
                alumnos={clase.alumnos}
              />
            ))}
          </div>
        </div>

        {/* COLUMNA DERECHA: CALENDARIO DINÁMICO */}
        <div className="lg:col-span-4 sticky top-8">
          <div className={`transition-all duration-500 ease-in-out bg-white/40 backdrop-blur-3xl rounded-[2rem] border border-white/50 shadow-xl overflow-hidden`}>
            <button 
                onClick={() => setCalendarioAbierto(!calendarioAbierto)}
                className={`w-full p-4 flex items-center justify-between transition-colors group ${calendarioAbierto ? 'bg-vinotinto-800 text-white' : 'hover:bg-vinotinto-50 text-gray-700'}`}
            >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-all ${calendarioAbierto ? 'bg-white/10' : 'bg-vinotinto-100 text-vinotinto-800 group-hover:scale-110'}`}>
                    <CalendarIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-black uppercase tracking-widest italic">Calendario</span>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform duration-500 ${calendarioAbierto ? 'rotate-180 bg-white/10' : 'bg-gray-100 text-gray-400'}`}>
                  <ChevronDown className="w-3 h-3" />
                </div>
            </button>

            <AnimatePresence>
              {calendarioAbierto && (
                <Motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="p-4 border-t border-gray-100 bg-white/80">
                      <CalendarioEscolar />
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ResumenProfesor;
