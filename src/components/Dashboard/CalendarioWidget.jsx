import React, { useState, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

const CalendarioWidget = ({ onSelectTarea, usuario }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [fechaActual, setFechaActual] = useState(new Date()); 
  const [selectorAbierto, setSelectorAbierto] = useState(false);
  const [tareasMes, setTareasMes] = useState([]);
  const menuRef = useRef(null);

  useEffect(() => {
    const fetchTareasMes = async () => {
      if (!usuario?.id) return;
      try {
        const firstDay = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).toISOString().split('T')[0];
        const lastDay = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).toISOString().split('T')[0];

        const { data: enrollments } = await supabase
          .from('subject_enrollments')
          .select('class_id')
          .eq('student_id', usuario.id);
        
        const classIds = enrollments?.map(e => e.class_id) || [];

        if (classIds.length > 0) {
          const { data } = await supabase
            .from('tasks')
            .select('*')
            .in('class_id', classIds)
            .gte('due_date', firstDay)
            .lte('due_date', lastDay);
          
          setTareasMes(data || []);
        }
      } catch (err) {
        console.error(err);
      }
    };
    if (isOpen) fetchTareasMes();
  }, [fechaActual, isOpen]);

  const meses = [
    "enero", "febrero", "marzo", "abril", "mayo", "junio",
    "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
  ];

  const años = [2024, 2025, 2026, 2027];

  const cambiarMes = (direccion) => {
    const nuevaFecha = new Date(fechaActual);
    nuevaFecha.setMonth(nuevaFecha.getMonth() + direccion);
    setFechaActual(nuevaFecha);
  };

  const saltarAFecha = (mes, año) => {
    setFechaActual(new Date(año, mes, 1));
    setSelectorAbierto(false);
  };

  const irAHoy = () => {
    setFechaActual(new Date());
    setSelectorAbierto(false);
  };

  const primerDiaMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth(), 1).getDay();
  const diasEnMes = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + 1, 0).getDate();
  
  const dias = [];
  const offset = primerDiaMes === 0 ? 6 : primerDiaMes - 1;
  for (let i = 0; i < offset; i++) dias.push({ num: '', tipo: 'vacio' });
  
  const [diaHover, setDiaHover] = useState(null);

  for (let i = 1; i <= diasEnMes; i++) {
    let tipo = 'normal';
    const tareasDelDia = tareasMes.filter(t => {
      const fechaT = new Date(t.due_date + 'T12:00:00');
      return fechaT.getDate() === i;
    });

    if (tareasDelDia.length > 0) tipo = 'evento';
    const hoyReal = new Date();
    if (i === hoyReal.getDate() && fechaActual.getMonth() === hoyReal.getMonth() && fechaActual.getFullYear() === hoyReal.getFullYear()) {
      tipo = 'actual';
    }
    
    dias.push({ num: i, tipo, tareas: tareasDelDia.map(t => ({ ...t, titulo: t.title })) });
  }

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
          <div className="w-10 h-10 rounded-xl bg-gold/5 border border-gold/10 flex items-center justify-center transition-colors group-hover:bg-gold/10">
             <svg className="w-5 h-5 text-gold-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
             </svg>
          </div>
          <div className="text-left">
            <span className="block text-gray-800 font-extrabold text-[13px] uppercase tracking-tight leading-none mb-1">
              Calendario Académico
            </span>
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Actividades</span>
          </div>
        </div>
        
        <svg
          className={`w-4 h-4 text-gray-300 transition-transform duration-500 ease-out ${isOpen ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
        </svg>
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
            className="w-full bg-white/70 backdrop-blur-3xl rounded-b-2xl border-x border-b border-white/50 overflow-hidden shadow-xl"
          >
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.1, duration: 0.4 } }}
              className="p-6"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest italic font-display">Visor de Fechas</span>
                
                {/* BOTÓN DE OPCIONES (3 PUNTOS) */}
                <div className="relative">
                  <button 
                    onClick={() => setSelectorAbierto(!selectorAbierto)}
                    className="p-1.5 text-gray-300 hover:text-vinotinto-700 hover:bg-vinotinto-50 rounded-xl transition-all"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                  </button>

                  {/* MENÚ SELECTOR RÁPIDO */}
                  <AnimatePresence>
                    {selectorAbierto && (
                      <Motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 shadow-2xl rounded-2xl z-[90] overflow-hidden"
                      >
                         <div className="p-3 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none">Ajustes</p>
                            <button onClick={irAHoy} className="text-[9px] font-black text-white bg-vinotinto-600 px-3 py-1.5 rounded-lg hover:bg-vinotinto-800 transition-colors shadow-md">
                              HOY
                            </button>
                         </div>
                         <div className="max-h-64 overflow-y-auto py-2 px-1">
                            {años.map(año => (
                              <div key={año} className="mb-2">
                                <p className="text-[9px] font-black text-gold px-3 uppercase mb-1 tracking-widest">{año}</p>
                                {meses.map((m, idx) => (
                                  <button 
                                    key={idx}
                                    onClick={() => saltarAFecha(idx, año)}
                                    className="w-full text-left px-4 py-2 text-[11px] font-bold text-gray-500 hover:bg-vinotinto-600 hover:text-white transition-all capitalize rounded-lg"
                                  >
                                    {m}
                                  </button>
                                ))}
                              </div>
                            ))}
                         </div>
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* CONTROLES MENSUALES */}
              <div className="flex justify-between items-center mb-8 px-1">
                 <button onClick={() => cambiarMes(-1)} className="p-2.5 hover:bg-vinotinto-50 rounded-full transition-all text-vinotinto-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                 </button>
                 <span className="font-black text-gray-800 text-sm uppercase tracking-widest italic font-display">
                   {meses[fechaActual.getMonth()]} <span className="text-vinotinto-600">{fechaActual.getFullYear()}</span>
                 </span>
                 <button onClick={() => cambiarMes(1)} className="p-2.5 hover:bg-vinotinto-50 rounded-full transition-all text-vinotinto-700">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                 </button>
              </div>

              {/* DÍAS SEMANA */}
              <div className="grid grid-cols-7 text-center text-[9px] font-black text-gray-300 mb-5 uppercase tracking-widest">
                {['Lu','Ma','Mi','Ju','Vi','Sá','Do'].map(d => <div key={d}>{d}</div>)}
              </div>

              {/* CUADRÍCULA DÍAS */}
              <div className="grid grid-cols-7 text-center text-xs gap-2">
                {dias.map((dia, idx) => {
                  const tieneEvento = dia.tipo === 'evento';
                  let clasesFondo = "w-8 h-8 mx-auto flex items-center justify-center rounded-xl transition-all select-none relative ";
                  
                  if (tieneEvento) {
                    clasesFondo += "bg-vinotinto-700 text-white font-black shadow-[0_5px_15px_-5px_rgba(153,0,0,0.5)] cursor-pointer hover:scale-110 active:scale-95";
                  } else if (dia.tipo === 'actual') {
                    clasesFondo += "bg-gold text-white font-black shadow-lg scale-105 border-2 border-white ring-2 ring-gold/20";
                  } else {
                    clasesFondo += dia.num ? "text-gray-500 font-bold hover:bg-gray-50 hover:text-vinotinto-600" : "opacity-0 pointer-events-none";
                  }

                  return (
                    <div 
                      key={idx} 
                      className="relative"
                      onMouseEnter={() => tieneEvento && setDiaHover(dia.num)}
                      onMouseLeave={() => setDiaHover(null)}
                      onClick={() => tieneEvento && onSelectTarea(dia.tareas[0])}
                    >
                      <div className={clasesFondo}>
                        {dia.num}
                        {diaHover === dia.num && tieneEvento && (
                          <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 w-48 bg-gray-900/95 backdrop-blur-md text-white p-3.5 rounded-2xl shadow-2xl z-[90] pointer-events-none border border-white/10 animate-fade-in">
                            <div className="text-[7px] font-black text-gold uppercase tracking-[0.2em] mb-1.5 flex items-center gap-1.5">
                               <span className="w-1.5 h-1.5 bg-gold rounded-full animate-pulse"></span>
                               Recordatorio
                            </div>
                            {dia.tareas.map((t, i) => (
                              <p key={i} className="font-black text-[9px] leading-snug mb-1 last:mb-0 uppercase italic">{t.titulo}</p>
                            ))}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-[6px] border-transparent border-t-gray-900/95"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Motion.div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>

  );
};

export default CalendarioWidget;

