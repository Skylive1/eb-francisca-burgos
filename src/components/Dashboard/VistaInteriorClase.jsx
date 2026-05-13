import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  FileText, Video, Link, Type, Play, DownloadCloud, 
  ClipboardCheck, HelpCircle, Calendar, Clock, ChevronDown, ChevronRight,
  User, BookOpen, CheckCircle2, Award
} from 'lucide-react';
import ModalVistaContenido from '../Profesor/ModalVistaContenido';

const tipoConfig = {
  texto: { icon: <Type size={20} />, label: 'Lectura', bg: 'bg-amber-500/10', color: 'text-amber-600' },
  guia: { icon: <FileText size={20} />, label: 'Archivo', bg: 'bg-emerald-500/10', color: 'text-emerald-600' },
  video: { icon: <Video size={20} />, label: 'Video Clase', bg: 'bg-blue-500/10', color: 'text-blue-600' },
  link: { icon: <Link size={20} />, label: 'Enlace', bg: 'bg-purple-500/10', color: 'text-purple-600' },
  tarea: { icon: <ClipboardCheck size={20} />, label: 'Tarea', bg: 'bg-rose-500/10', color: 'text-rose-600' },
  cuestionario: { icon: <HelpCircle size={20} />, label: 'Cuestionario', bg: 'bg-indigo-500/10', color: 'text-indigo-600' }
};

const VistaInteriorClase = ({ curso, volver, isDarkMode }) => {
  const [lecciones, setLecciones] = useState([]);
  const [contenidosUnificados, setContenidosUnificados] = useState([]);
  const [statusMap, setStatusMap] = useState({}); 
  const [clasesExpandidas, setClasesExpandidas] = useState({});
  const [loading, setLoading] = useState(true);
  const [itemSeleccionado, setItemSeleccionado] = useState(null);

  useEffect(() => {
    if (curso?.id) {
      cargarContenido();
    }
  }, [curso]);

  const toggleClase = (id) => {
    setClasesExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const cargarContenido = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('class_id', curso.id)
        .order('created_at', { ascending: true });
      
      setLecciones(lessonsData || []);

      if (lessonsData?.length > 0) {
        const lessonIds = lessonsData.map(l => l.id);

        const [materialsRes, tasksRes] = await Promise.all([
          supabase.from('materials').select('*').in('lesson_id', lessonIds),
          supabase.from('tasks').select('*').in('lesson_id', lessonIds)
        ]);

        const unificados = [
          ...(materialsRes.data || []).map(m => ({ ...m, itemType: 'material' })),
          ...(tasksRes.data || []).map(t => ({ ...t, itemType: 'tarea', type: t.type || 'tarea' }))
        ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

        setContenidosUnificados(unificados);

        const expandidas = {};
        lessonsData.forEach(l => expandidas[l.id] = true);
        setClasesExpandidas(expandidas);

        if (user) {
          const [taskSubs, quizAtts] = await Promise.all([
            supabase.from('task_submissions').select('task_id, score, status, created_at').eq('student_id', user.id),
            supabase.from('quiz_attempts').select('quiz_id, score, created_at').eq('student_id', user.id)
          ]);

          const newStatusMap = {};
          taskSubs.data?.forEach(s => { 
            newStatusMap[s.task_id] = { 
              submitted: true, 
              score: s.score, 
              status: s.status,
              date: new Date(s.created_at).toLocaleDateString()
            }; 
          });
          quizAtts.data?.forEach(a => { 
            newStatusMap[a.quiz_id] = { 
              submitted: true, 
              score: a.score,
              date: new Date(a.created_at).toLocaleDateString()
            }; 
          });
          setStatusMap(newStatusMap);
        }
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const lapsos = ['1', '2', '3'];

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <div className="w-12 h-12 border-4 border-vinotinto-800 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Aula Virtual...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      
      {/* CABECERA */}
      <div className={`flex flex-col md:flex-row items-center justify-between p-8 rounded-[3rem] border transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
        <div>
          <button 
            onClick={volver}
            className={`text-[12px] font-black uppercase tracking-[0.2em] mb-3 flex items-center gap-2 hover:translate-x-2 transition-all ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}
          >
            <ChevronRight size={16} className="rotate-180" /> Volver a mis materias
          </button>
          <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-slate-100' : 'text-vinotinto-800'}`}>
            {curso.titulo}
          </h2>
          <div className="flex items-center gap-3 mt-2">
             <p className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
               Prof. <span className="text-vinotinto-800 dark:text-gold italic">{curso.instructor}</span>
             </p>
          </div>

        </div>
        <div className="flex gap-4 mt-6 md:mt-0">
          {/* Botón Clase en Vivo eliminado */}
        </div>

      </div>

      {lapsos.map(lapNum => {
        const clasesDelLapso = lecciones.filter(l => l.lapso === lapNum);
        if (clasesDelLapso.length === 0) return null;

        return (
          <div key={lapNum} className="space-y-10 mb-20">
            {/* SEPARADOR LAPSO */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t-4 ${isDarkMode ? 'border-slate-800' : 'border-vinotinto-800/20'}`}></div>
              </div>
              <div className={`relative px-10 py-3 rounded-full border-4 shadow-xl flex items-center gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-vinotinto-800 shadow-vinotinto-800/10'}`}>
                <div className="w-10 h-10 bg-vinotinto-800 rounded-full flex items-center justify-center text-white shadow-lg">
                  <span className="text-lg font-black italic">{lapNum}</span>
                </div>
                <h2 className={`text-xl font-black uppercase tracking-[0.3em] italic ${isDarkMode ? 'text-slate-100' : 'text-vinotinto-800'}`}>LAPSO {lapNum}</h2>
              </div>
            </div>

            <div className="grid gap-6 px-2">
              {clasesDelLapso.map((lec, idx) => {
                const itemsLec = contenidosUnificados.filter(m => m.lesson_id === lec.id);
                const estaExpandida = clasesExpandidas[lec.id];

                return (
                  <div key={lec.id} className={`group rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden ${estaExpandida ? (isDarkMode ? 'bg-slate-900/60 border-vinotinto-800 shadow-2xl shadow-vinotinto-800/10' : 'bg-white border-vinotinto-800 shadow-xl shadow-vinotinto-800/5') : (isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 hover:border-vinotinto-800/40 shadow-sm')}`}>
                    
                    <div onClick={() => toggleClase(lec.id)} className={`flex items-center justify-between p-6 cursor-pointer transition-colors ${estaExpandida && (isDarkMode ? 'bg-vinotinto-800/5' : 'bg-vinotinto-50/30')}`}>
                      <div className="flex items-center gap-6">
                        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${estaExpandida ? 'bg-vinotinto-800 text-white rotate-3 scale-110 shadow-lg' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                          <span className="text-[8px] opacity-60">TEMA</span>
                          <span className="text-xl">{idx + 1}</span>
                        </div>
                        <div>
                          <h4 className={`text-xl font-black uppercase italic tracking-tighter leading-none ${estaExpandida ? (isDarkMode ? 'text-white' : 'text-vinotinto-800') : (isDarkMode ? 'text-slate-200' : 'text-slate-800')}`}>
                            {lec.title}
                          </h4>
                          <p className="text-[9px] font-black uppercase text-slate-400 tracking-widest mt-1.5 italic">
                            {itemsLec.length} Recursos y Actividades Disponibles
                          </p>
                        </div>
                      </div>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${estaExpandida ? 'rotate-180 bg-vinotinto-800 text-white shadow-lg' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}>
                        <ChevronDown size={20} />
                      </div>
                    </div>

                    <AnimatePresence>
                      {estaExpandida && (
                        <Motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className={`p-6 md:p-10 pt-0 space-y-4 border-t ${isDarkMode ? 'border-slate-800/50' : 'border-slate-100'}`}>
                            {itemsLec.length > 0 ? itemsLec.map(item => {
                              const config = tipoConfig[item.type] || tipoConfig.texto;
                              const status = statusMap[item.id];
                              
                              return (
                                <div key={item.id} className="space-y-2 mb-8 last:mb-0">
                                  {/* CABECERA ITEM */}
                                  <div className={`group/item relative p-6 pr-8 pl-12 rounded-[2rem] border transition-all flex items-center justify-between overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                                    <div className={`absolute left-0 top-0 bottom-0 w-2 ${config.color.replace('text-', 'bg-')}`} />
                                    
                                    <div className="flex items-center gap-6 flex-1 min-w-0 pr-4">
                                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color} shadow-inner`}>
                                        {React.cloneElement(config.icon, { size: 24 })}
                                      </div>
                                      <div className="flex flex-col truncate">
                                        <div className="flex items-center gap-3 mb-1">
                                          <span className={`text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest ${config.bg} ${config.color}`}>
                                            {config.label}
                                          </span>
                                          {item.points && <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">• {item.points} PTS</span>}
                                        </div>
                                        <h5 className={`text-xl font-black uppercase italic tracking-tighter truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                                          {item.title}
                                        </h5>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-6 flex-shrink-0">
                                      {status?.submitted && (
                                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100 shadow-sm">
                                          <CheckCircle2 size={14} />
                                          <span className="text-[9px] font-black uppercase tracking-widest">Entregado</span>
                                          {status?.score !== null && <span className="ml-2 px-2 py-0.5 bg-emerald-500 text-white rounded-md text-[10px]">{status.score}%</span>}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* CONTENIDO DESPLEGADO */}
                                  <div className="px-12 pb-8 pt-2">
                                    {item.type === 'texto' ? (
                                      <div className={`p-10 rounded-[2.5rem] border-l-[8px] text-lg leading-relaxed font-medium italic shadow-inner ${isDarkMode ? 'bg-slate-800/40 border-l-amber-500 text-slate-300' : 'bg-slate-50 border-l-vinotinto-800 text-slate-600'}`}>
                                        <div className="whitespace-pre-wrap">{item.description}</div>
                                        {item.source && (
                                          <div className={`mt-8 pt-4 border-t ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                              <Link size={12} /> Fuente de la Lectura: <span className="italic font-bold text-vinotinto-800">{item.source}</span>
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ) : item.type === 'video' ? (
                                      <div className="space-y-6">
                                        <div className="flex flex-col lg:flex-row gap-8 items-start">
                                          <div className="flex-1 space-y-4">
                                            {item.description && (
                                              <div className={`text-lg font-medium italic leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                                <div className="whitespace-pre-wrap">{item.description}</div>
                                              </div>
                                            )}
                                          </div>
                                          <div className={`w-full lg:w-[400px] aspect-video rounded-[2rem] overflow-hidden border-4 flex-shrink-0 ${isDarkMode ? 'border-slate-800 shadow-2xl shadow-blue-900/20' : 'border-white shadow-2xl shadow-slate-200'}`}>
                                            {item.url?.includes('youtube.com') || item.url?.includes('youtu.be') ? (
                                              <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${item.url.includes('v=') ? item.url.split('v=')[1].split('&')[0] : item.url.split('/').pop()}`} title={item.title} frameBorder="0" allowFullScreen></iframe>
                                            ) : (
                                              <video src={item.url} controls className="w-full h-full object-cover" />
                                            )}
                                          </div>
                                        </div>
                                        {item.source && (
                                          <div className={`mt-4 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                              <Link size={12} /> Fuente del Recurso: <span className="italic font-bold text-vinotinto-800">{item.source}</span>
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    ) : (
                                      <div className="space-y-8">
                                        {item.description && (
                                          <div className={`text-lg font-medium italic leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                                            <div className="whitespace-pre-wrap">{item.description}</div>
                                          </div>
                                        )}
                                        <div className="flex flex-wrap items-center gap-6">
                                          {item.type === 'guia' || item.type === 'link' ? (
                                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="px-12 py-5 bg-vinotinto-800 text-white rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-vinotinto-900/40 hover:scale-105 active:scale-95 flex items-center gap-4 group/btn">
                                              {item.type === 'guia' ? <DownloadCloud size={20} className="group-hover/btn:animate-bounce" /> : <Link size={20} />}
                                              {item.type === 'guia' ? 'Descargar Material' : 'Abrir Enlace Externo'}
                                            </a>
                                          ) : (
                                            <button onClick={() => setItemSeleccionado(item)} className={`px-12 py-5 rounded-[2rem] text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-2xl active:scale-95 ${status?.submitted ? 'bg-white text-slate-400 border-4 border-slate-100' : 'bg-vinotinto-800 text-white shadow-vinotinto-900/40 hover:scale-105'}`}>
                                              {item.type === 'tarea' ? (status?.submitted ? '✅ Revisar Entrega' : '🚀 Realizar Entrega') : (status?.submitted ? '📊 Ver Resultados' : '📝 Iniciar Examen')}
                                            </button>
                                          )}
                                          {item.due_date && (
                                            <div className="flex items-center gap-3 text-[10px] font-black text-rose-500 uppercase tracking-widest bg-rose-50 px-6 py-3 rounded-2xl border-2 border-rose-100 shadow-sm">
                                              <Clock size={16} /> Fecha Límite: {item.due_date}
                                            </div>
                                          )}
                                        </div>
                                        {item.source && (
                                          <div className={`mt-6 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                              <Link size={12} /> Referencia: <span className="italic font-bold text-vinotinto-800">{item.source}</span>
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            }) : (
                              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[1.5rem] bg-slate-50/20 mt-6">
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 italic">Sin material publicado en este tema</p>
                              </div>
                            )}
                          </div>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <ModalVistaContenido 
        isOpen={!!itemSeleccionado}
        onClose={() => setItemSeleccionado(null)}
        isDarkMode={isDarkMode}
        item={itemSeleccionado}
        claseId={curso?.id}
        professorId={curso?.professor_id}
        isStudentView={true}
      />
    </div>
  );
};

export default VistaInteriorClase;
