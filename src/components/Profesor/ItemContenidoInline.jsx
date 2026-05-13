import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, UploadCloud, ChevronDown, User, 
  CheckCircle2, AlertCircle, Play, FileText, Link, ClipboardCheck,
  Video, ArrowDownUp, GripVertical, Check, AlertTriangle, Edit2, Trash2,
  ExternalLink, Info, Download, Sparkles, BookOpen, HelpCircle
} from 'lucide-react';

const ItemContenidoInline = ({ item, isDarkMode, claseId, onEdit, onDelete }) => {
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [sortByMissing, setSortByMissing] = useState(false);
  const [selectedStudentResult, setSelectedStudentResult] = useState(null);

  useEffect(() => {
    if (item?.itemType === 'tarea') {
      fetchStudents();
    }
  }, [item]);

  // Bloquear scroll del body cuando el modal de resultados está abierto
  useEffect(() => {
    if (selectedStudentResult) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [selectedStudentResult]);

  const fetchStudents = async () => {
    setLoadingStudents(true);
    try {
      // 1. Obtener todos los estudiantes inscritos en esta clase
      const { data: enrollments, error: enrollError } = await supabase
        .from('subject_enrollments')
        .select('student_id, profiles(full_name, email)')
        .eq('class_id', claseId);

      if (enrollError) throw enrollError;

      // 2. Obtener todas las entregas/intentos para este contenido específico
      const table = item.type === 'cuestionario' ? 'quiz_attempts' : 'task_submissions';
      const idColumn = item.type === 'cuestionario' ? 'quiz_id' : 'task_id';

      const { data: submissions, error: subError } = await supabase
        .from(table)
        .select('*')
        .eq(idColumn, item.id);

      if (subError) throw subError;

      // 3. Cruzar los datos para armar la lista final
      const studentList = (enrollments || []).map(en => {
        const submission = (submissions || []).find(s => s.student_id === en.student_id);
        const hasSubmitted = !!submission;
        
        let statusText = '';
        let statusColor = '';
        let statusIcon = null;

        if (hasSubmitted) {
          statusText = item.type === 'cuestionario' ? 'Completado' : 'Entregado';
          statusColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
          statusIcon = <CheckCircle2 size={14} className="text-emerald-500" />;
        } else {
          statusText = item.type === 'cuestionario' ? 'Sin realizar' : 'Falta por entregar';
          statusColor = 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700';
          statusIcon = <Clock size={14} className="text-slate-500" />;
        }

        return {
          id: en.student_id,
          name: en.profiles?.full_name || 'Estudiante Desconocido',
          hasSubmitted,
          statusText,
          statusColor,
          statusIcon,
          date: hasSubmitted ? new Date(submission.created_at).toLocaleDateString() : '--/--/----',
          time: hasSubmitted ? new Date(submission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--',
          score: hasSubmitted ? (submission.score || 0) : null,
          submissionData: submission
        };
      });

      setStudents(studentList);
    } catch (err) {
      console.error("Error al cargar estudiantes inline:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleDeleteSubmission = async (studentId) => {
    if (!window.confirm("¿Estás seguro de eliminar este registro? El estudiante podrá volver a realizar la actividad.")) return;
    
    try {
      const table = item.type === 'cuestionario' ? 'quiz_attempts' : 'task_submissions';
      const idColumn = item.type === 'cuestionario' ? 'quiz_id' : 'task_id';

      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idColumn, item.id)
        .eq('student_id', studentId);

      if (error) throw error;
      fetchStudents(); // Recargar lista
    } catch (err) {
      console.error("Error al eliminar registro:", err);
      alert("No se pudo eliminar el registro.");
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortByMissing) return a.hasSubmitted ? 1 : -1;
    return a.hasSubmitted ? -1 : 1;
  });

  const getIcon = () => {
    if (item.type === 'cuestionario') return <HelpCircle size={18} />;
    if (item.itemType === 'tarea') return <ClipboardCheck size={18} />;
    if (item.type === 'video') return <Play size={18} />;
    if (item.type === 'link') return <Link size={18} />;
    return <FileText size={18} />;
  };

  const getColorClass = () => {
    if (item.type === 'cuestionario') return 'text-indigo-500 bg-indigo-500/10';
    if (item.itemType === 'tarea') return 'text-rose-500 bg-rose-500/10';
    if (item.type === 'video') return 'text-blue-500 bg-blue-500/10';
    if (item.type === 'link') return 'text-indigo-500 bg-indigo-500/10';
    return 'text-emerald-500 bg-emerald-500/10';
  };

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`w-full rounded-[1.8rem] overflow-hidden border transition-all mb-6 ${isDarkMode ? 'bg-slate-900/80 border-slate-800/60 backdrop-blur-md' : 'bg-white/90 border-slate-200/60 backdrop-blur-md shadow-lg shadow-slate-200/30'}`}
    >
      {/* Header Compacto y Dinámico */}
      <div className={`p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${isDarkMode ? 'border-slate-800/50 bg-slate-800/30' : 'border-slate-100 bg-slate-50/40'}`}>
        <div className="flex items-center gap-4">
          <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner ${getColorClass()}`}>
            {getIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-[0.1em] ${getColorClass()}`}>
                {item.type === 'cuestionario' ? 'Cuestionario' : item.itemType === 'tarea' ? 'Asignación' : item.type || 'Recurso'}
              </span>
              {item.itemType === 'tarea' && (
                <span className="text-amber-600 text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                  <Sparkles size={10} /> {item.points || 20} PTS
                </span>
              )}
            </div>
            <h3 className={`text-lg md:text-xl font-black uppercase tracking-tight leading-none ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
              {item.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {item.due_date && (
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${isDarkMode ? 'bg-slate-900/50 border-slate-700 text-rose-400' : 'bg-white border-slate-100 text-rose-500 shadow-sm'}`}>
              <Calendar size={12} />
              <span className="text-[9px] font-black uppercase">{new Date(item.due_date).toLocaleDateString()}</span>
            </div>
          )}
          
          {onEdit && (
            <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800/50 border dark:border-slate-700">
              <button onClick={onEdit} className="p-2 hover:bg-white dark:hover:bg-slate-700 text-slate-400 hover:text-slate-900 dark:hover:text-white rounded-lg transition-all"><Edit2 size={14} /></button>
              <button onClick={onDelete} className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 rounded-lg transition-all"><Trash2 size={14} /></button>
              <div className="p-2 text-slate-300 dark:text-slate-600 cursor-grab active:cursor-grabbing"><GripVertical size={14} /></div>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 md:p-7">
        <div className="grid md:grid-cols-12 gap-8 items-start">
          
          {/* Lado Izquierdo: Descripción y Contenido */}
          <div className={`${item.itemType === 'tarea' ? 'md:col-span-7' : 'md:col-span-12'} space-y-6`}>
            {item.description && (
              <div className="space-y-4">
                <div className="relative pl-5">
                  <div className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-full ${item.itemType === 'tarea' ? 'bg-rose-500/40' : 'bg-vinotinto-800/40'}`} />
                  <p className={`text-base md:text-lg leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {item.description}
                  </p>
                </div>

                {/* Sección de Fuentes Bibliográficas */}
                {item.source && item.source !== 'youtube' && item.source !== 'upload' && item.source !== 'other' && (
                  <div className={`flex items-start gap-3 p-4 rounded-2xl border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                    <BookOpen size={16} className="text-vinotinto-800 mt-0.5" />
                    <div>
                      <h5 className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Fuentes Bibliográficas</h5>
                      <p className={`text-xs font-bold italic ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{item.source}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Multimedia Compacta */}
            {item.itemType === 'material' && item.type === 'video' && item.url && (
              <div className="aspect-video w-full rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-900/10 dark:border-slate-800 relative bg-black max-w-3xl mx-auto group/video">
                {item.url.includes('youtube') || item.url.includes('youtu.be') ? (
                  <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${item.url.split('v=')[1]?.split('&')[0] || item.url.split('/').pop()}`} frameBorder="0" allowFullScreen></iframe>
                ) : item.url.match(/\.(mp4|webm|ogg)$/i) || item.url.includes('drive.google') ? (
                  <video controls className="w-full h-full object-cover">
                    <source src={item.url} type="video/mp4" />
                    Tu navegador no soporta el video.
                  </video>
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-slate-900 to-slate-800">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-6 group-hover/video:scale-110 transition-all">
                      <Play size={40} className="text-blue-400" />
                    </div>
                    <h3 className="text-lg font-black uppercase text-white mb-4 italic tracking-widest">Video Externo</h3>
                    <a href={item.url} target="_blank" rel="noreferrer" className="flex items-center gap-3 px-8 py-4 bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] rounded-full hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-600/20 transition-all">
                      <ExternalLink size={16} /> Reproducir en nueva pestaña
                    </a>
                  </div>
                )}
              </div>
            )}

            {item.itemType === 'material' && item.type === 'link' && item.url && (
              <div className={`p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center text-center transition-all ${isDarkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-indigo-50/50 border-indigo-100 shadow-inner'}`}>
                <div className="w-16 h-16 bg-indigo-500 text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20">
                  <Link size={32} />
                </div>
                <h4 className={`text-xl font-black uppercase italic mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Recurso de Consulta</h4>
                <p className="text-xs text-slate-400 font-bold mb-8 max-w-sm">Haz clic en el botón de abajo para acceder al material externo proporcionado por el docente.</p>
                <a 
                  href={item.url.startsWith('http') ? item.url : `https://${item.url}`} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-4 px-10 py-5 bg-indigo-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:bg-indigo-700 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-600/30 transition-all active:scale-95"
                >
                  <ExternalLink size={18} /> Abrir Enlace de Referencia
                </a>
              </div>
            )}

            {item.itemType === 'material' && item.type === 'guia' && (
              <div className={`p-8 rounded-[2.5rem] border-2 border-dashed flex flex-col items-center text-center transition-all ${isDarkMode ? 'bg-slate-800/20 border-emerald-900/30' : 'bg-emerald-50 border-emerald-100 shadow-inner'}`}>
                <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                  <FileText size={32} />
                </div>
                <h4 className={`text-xl font-black uppercase italic mb-2 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.title}</h4>
                <p className="text-xs text-slate-400 font-bold mb-8 max-w-sm">Este es un material de apoyo descargable (Guía, PDF o Documento).</p>
                <a 
                  href={item.url} 
                  download 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-4 px-10 py-5 bg-emerald-600 text-white font-black uppercase tracking-[0.2em] text-[11px] rounded-2xl hover:bg-emerald-700 hover:scale-105 hover:shadow-2xl hover:shadow-emerald-600/30 transition-all active:scale-95"
                >
                  <Download size={18} /> Descargar Material de Apoyo
                </a>
              </div>
            )}
          </div>

          {/* Lado Derecho: Zona de Tarea o Cuestionario */}
          {item.itemType === 'tarea' && (
            <div className="md:col-span-5 space-y-4">
              {item.type === 'cuestionario' ? (
                <div className={`p-6 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center text-center transition-all ${isDarkMode ? 'bg-indigo-900/20 border-indigo-800/30' : 'bg-indigo-50 border-indigo-100'}`}>
                   <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-indigo-500/20">
                      <HelpCircle size={20} />
                   </div>
                   <h4 className="font-black text-[10px] uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-1">Cuestionario Interactivo</h4>
                   <p className="text-[9px] text-slate-400 font-bold mb-4">
                     {item.data?.preguntas?.length || 0} Preguntas • {item.data?.duracion || 60} Minutos
                   </p>
                   <div className="w-full py-2.5 bg-indigo-600 text-white font-black uppercase tracking-widest text-[9px] rounded-lg opacity-80 text-center">
                     Disponible para Estudiantes
                   </div>
                </div>
              ) : (
                <div className={`p-6 rounded-[1.5rem] border-2 border-dashed flex flex-col items-center text-center transition-all ${isDarkMode ? 'bg-slate-800/20 border-slate-700' : 'bg-slate-50 border-slate-200 hover:bg-slate-100/50'}`}>
                  <div className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center mb-3 shadow-sm border dark:border-slate-700">
                    <UploadCloud size={20} className="text-slate-400" />
                  </div>
                  <h4 className="font-black text-[10px] uppercase tracking-widest text-slate-500 mb-1">Entregar Asignación</h4>
                  <p className="text-[9px] text-slate-400 font-bold mb-4">Máx. 25MB por archivo</p>
                  <button disabled className="w-full py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-400 font-black uppercase tracking-widest text-[9px] rounded-lg cursor-not-allowed">Subir Entrega</button>
                </div>
              )}

              <div className={`p-5 rounded-[1.5rem] border ${isDarkMode ? 'bg-rose-950/10 border-rose-900/20' : 'bg-rose-50/30 border-rose-100'}`}>
                 <div className="flex items-center justify-between mb-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-rose-500">Valoración</span>
                    <span className={`text-[10px] font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{item.points || 20} pts</span>
                 </div>
                 <div className="h-1 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} className="h-full bg-rose-500" />
                 </div>
              </div>
            </div>
          )}
        </div>

        {/* Panel de Seguimiento (Expandible, más discreto) */}
        {item.itemType === 'tarea' && (
          <div className="mt-8">
            <button 
              onClick={() => setShowStudents(!showStudents)} 
              className={`flex items-center gap-3 px-4 py-2 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${showStudents ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-400 border-transparent'}`}
            >
              <User size={12} />
              {item.type === 'cuestionario' ? 'Resultados de Alumnos' : 'Seguimiento de Alumnos'} ({students.filter(s => s.hasSubmitted).length}/{students.length})
              <ChevronDown size={12} className={`transition-transform duration-300 ${showStudents ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {showStudents && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} 
                  animate={{ height: 'auto', opacity: 1 }} 
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <div className={`p-4 rounded-[1.5rem] border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50/50 border-slate-100'}`}>
                    <div className="space-y-2 mt-4">
                      {students.map(student => (
                        <div key={student.id} className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'} transition-all`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-black text-white ${student.hasSubmitted ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-700'}`}>
                              {student.name.charAt(0)}
                            </div>
                            <div>
                              <h6 className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>{student.name}</h6>
                              {student.hasSubmitted ? (
                                <p className="text-[9px] font-bold text-slate-400">{student.date} • {student.time}</p>
                              ) : (
                                <p className="text-[9px] font-black text-slate-400/60 uppercase tracking-widest italic">Sin actividad registrada</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            {student.hasSubmitted && student.score !== null && (
                              <span className={`text-[10px] font-black px-2 py-1 rounded-md ${student.score >= 50 ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                {student.score}%
                              </span>
                            )}
                            <div className="flex items-center gap-3">
                              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${student.hasSubmitted ? student.statusColor : 'bg-slate-100 text-slate-400 border-slate-200'}`}>
                                {student.hasSubmitted ? student.statusIcon : <Clock size={10} />}
                                {student.hasSubmitted ? student.statusText : 'Pendiente'}
                              </div>

                              <div className="flex gap-2">
                                {student.hasSubmitted && (
                                  <button 
                                    onClick={() => handleDeleteSubmission(student.id)}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shadow-sm ${isDarkMode ? 'bg-rose-900/30 text-rose-400 hover:bg-rose-500 hover:text-white' : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'}`}
                                    title="Eliminar registro y dar otra oportunidad"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                )}
                                {item.type === 'cuestionario' && student.hasSubmitted && (
                                  <button 
                                    onClick={() => setSelectedStudentResult(student)}
                                    className="w-8 h-8 rounded-lg flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm group" 
                                    title="Ver reporte detallado"
                                  >
                                    <CheckCircle2 size={22} className="group-hover:rotate-12 transition-transform" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {/* Modal de Detalle de Cuestionario para el Profesor */}
        <AnimatePresence>
          {selectedStudentResult && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                className={`w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-white'}`}
              >
                {/* Header del Reporte */}
                <div className={`p-8 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20">
                      <CheckCircle2 size={28} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black uppercase italic leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reporte de Evaluación</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedStudentResult.name} • {item.title}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStudentResult(null)} className="p-3 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-2xl transition-all">
                    <Trash2 size={20} className="text-slate-400" />
                  </button>
                </div>

                <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                  {/* Resumen de Métricas */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className={`p-5 rounded-3xl text-center border-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                       <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Puntuación</p>
                       <p className={`text-3xl font-black italic ${selectedStudentResult.score >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>{selectedStudentResult.score}%</p>
                    </div>
                    <div className={`p-5 rounded-3xl text-center border-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                       <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Tiempo</p>
                       <p className="text-3xl font-black text-indigo-600 italic">12:45</p>
                    </div>
                    <div className={`p-5 rounded-3xl text-center border-2 ${isDarkMode ? 'bg-slate-800/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                       <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Preguntas</p>
                       <p className="text-3xl font-black text-amber-500 italic">{item.data?.preguntas?.length || 0}</p>
                    </div>
                  </div>

                  {/* Detalle de Respuestas (Mock) */}
                  <div className="space-y-4">
                    <h4 className="text-[11px] font-black uppercase tracking-widest text-slate-400 px-2">Respuestas Seleccionadas</h4>
                    <div className="space-y-3">
                      {item.data?.preguntas?.map((p, idx) => (
                        <div key={idx} className={`p-5 rounded-[1.5rem] border ${isDarkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-slate-50/50 border-slate-100'}`}>
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-4">
                              <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 flex items-center justify-center font-black text-xs shrink-0">
                                {idx + 1}
                              </div>
                              <div>
                                <p className={`text-sm font-bold mb-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{p.texto}</p>
                                <p className={`text-[11px] font-bold p-2 px-4 rounded-lg inline-block ${idx % 2 === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                  {idx % 2 === 0 ? '✓ Respuesta Correcta: ' : '✗ Respuesta Incorrecta: '} {p.respuestas[0]}
                                </p>
                              </div>
                            </div>
                            {idx % 2 === 0 ? <CheckCircle2 className="text-emerald-500 shrink-0" size={20} /> : <AlertTriangle className="text-rose-500 shrink-0" size={20} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-8 border-t dark:border-slate-800 flex justify-end">
                  <button onClick={() => setSelectedStudentResult(null)} className="px-8 py-4 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[11px]">Cerrar Reporte</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
        )}
      </div>
    </motion.div>
  );
};

export default ItemContenidoInline;
