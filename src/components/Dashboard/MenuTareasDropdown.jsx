import React, { useState, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

const MenuTareasDropdown = ({ onSelectTarea, usuario }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tareasPendientes, setTareasPendientes] = useState([]);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchTareas = async () => {
      if (!usuario?.id) return;
      setLoading(true);
      try {

        // Buscamos las clases donde está inscrito el alumno
        const { data: enrollments } = await supabase
          .from('subject_enrollments')
          .select('class_id')
          .eq('student_id', usuario.id);
        
        const classIds = enrollments?.map(e => e.class_id) || [];

        if (classIds.length > 0) {
          const { data: tasksData } = await supabase
            .from('tasks')
            .select('*, classes(title)')
            .in('class_id', classIds)
            .gte('due_date', new Date().toISOString().split('T')[0])
            .order('due_date', { ascending: true });
          
          setTareasPendientes(tasksData?.map(t => ({
            ...t,
            titulo: t.title,
            materia: t.classes?.title,
            vencimiento: t.due_date,
            entregada: false // Podríamos verificar esto con una tabla de entregas luego
          })) || []);
        }
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) fetchTareas();
  }, [isOpen]);

  const formatFecha = (fechaStr) => {
    const opciones = { day: 'numeric', month: 'long' };
    return new Date(fechaStr + 'T00:00:00').toLocaleDateString('es-ES', opciones);
  };

  return (
    <div className="relative" ref={menuRef}>
      <Motion.button
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center gap-4 bg-white/60 backdrop-blur-3xl px-6 py-4 w-full justify-between transition-all duration-300
          border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.05)]
          hover:shadow-[0_20px_40px_rgba(96,0,16,0.15),0_8px_16px_rgba(0,0,0,0.08)]
          hover:border-gold/50 group transform hover:-translate-y-1
          ${isOpen ? 'rounded-t-2xl border-b-0 shadow-none' : 'rounded-2xl'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-vinotinto-50 border border-vinotinto-100 flex items-center justify-center transition-colors group-hover:bg-vinotinto-100">
             <svg className="w-5 h-5 text-vinotinto-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
             </svg>
          </div>
          <div className="text-left">
            <span className="block text-gray-800 font-extrabold text-[13px] uppercase tracking-tight leading-none mb-1">
              Próximas Tareas
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Gestión Académica</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="bg-vinotinto-600 text-white text-[10px] px-2.5 py-1 rounded-lg font-black shadow-lg shadow-vinotinto-200">
            {tareasPendientes.length}
          </div>
          <svg
            className={`w-4 h-4 text-gray-300 transition-transform duration-500 ease-out ${isOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </Motion.button>

      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ 
              opacity: 1, height: 'auto',
              transition: { type: 'spring', damping: 20, stiffness: 200 }
            }}
            exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
            className="w-full bg-white/70 backdrop-blur-3xl rounded-b-2xl border-x border-b border-white/50 shadow-xl overflow-hidden"
          >
            <div className="p-5 bg-white/30 border-b border-white/40 flex justify-between items-center">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic">Pendientes Actuales</span>
              <span className="text-[10px] font-black text-vinotinto-600 uppercase cursor-pointer hover:tracking-[0.2em] transition-all">Explorar Todo</span>
            </div>

            <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
              {tareasPendientes.length > 0 ? (
                tareasPendientes.map((tarea, idx) => (
                  <Motion.div
                    key={tarea.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ 
                      opacity: 1, y: 0, 
                      transition: { delay: 0.1 + (idx * 0.08), ease: 'easeOut' } 
                    }}
                    onClick={() => {
                      onSelectTarea(tarea);
                      setIsOpen(false);
                    }}
                    className="p-5 border-b border-gray-50 hover:bg-vinotinto-50/50 transition-colors cursor-pointer group/item"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-[9px] font-black text-gold uppercase tracking-[0.2em]">{tarea.materia}</span>
                      <div className="bg-white px-2 py-0.5 rounded-md border border-gray-100 shadow-sm">
                        <span className="text-[9px] font-bold text-vinotinto-400 uppercase">Faltan {tarea.dia - 15} días</span>
                      </div>
                    </div>
                    <p className="text-sm font-black text-gray-800 leading-snug group-hover/item:text-vinotinto-700 transition-colors">
                      {tarea.titulo}
                    </p>
                    <p className="text-[9px] font-bold text-gray-400 mt-2 uppercase">Límite: {formatFecha(tarea.vencimiento)}</p>
                  </Motion.div>
                ))
              ) : (
                <div className="p-10 text-center">
                   <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                   </div>
                  <p className="text-sm text-gray-400 font-bold italic">¡Todo al día por ahora!</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-white/40 border-t border-white/50">
               <button className="w-full py-3 bg-vinotinto-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-vinotinto-800 transition-all hover:shadow-lg active:scale-95 shadow-md">
                 Ver Reporte de Calificaciones
               </button>
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default MenuTareasDropdown;
