import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  X, Calendar, Clock, UploadCloud, ChevronDown, ChevronUp, User, 
  CheckCircle2, AlertCircle, Play, FileText, DownloadCloud, Link, 
  Video, ArrowDownUp, GripVertical, Check, AlertTriangle,
  HelpCircle, ChevronLeft, ChevronRight, Trash2
} from 'lucide-react';

const ModalVistaContenido = ({ isOpen, onClose, isDarkMode, item, claseId, professorId, isStudentView = false }) => {
  const [showStudents, setShowStudents] = useState(false);
  const [students, setStudents] = useState([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [sortByMissing, setSortByMissing] = useState(false);
  const [selectedStudentResult, setSelectedStudentResult] = useState(null);

  // Estados para el Cuestionario (Estudiante)
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionIdx: answerIdx }
  const [timeLeft, setTimeLeft] = useState(0);
  const [quizResults, setQuizResults] = useState(null);

  // Estados para Entrega de Tareas
  const [studentSubmission, setStudentSubmission] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Estados para Reportes de Problemas
  const [reportIssue, setReportIssue] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [isSendingReport, setIsSendingReport] = useState(false);
  const [showReport, setShowReport] = useState(false);

  const handleSendReport = async () => {
    setIsSendingReport(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const { error } = await supabase.from('classroom_reports').insert({
        student_id: user.id,
        professor_id: professorId,
        class_id: claseId,
        item_id: item.id,
        item_title: item.title,
        issue_type: reportIssue,
        description: reportDescription,
        status: 'pending'
      });

      if (error) throw error;
      alert("Reporte enviado con éxito. El profesor lo revisará pronto.");
      setReportIssue('');
      setReportDescription('');
      setShowReport(false); 
    } catch (error) {
      console.error("Error al enviar reporte:", error);
      alert("Hubo un error al enviar el reporte.");
    } finally {
      setIsSendingReport(false);
    }
  };

  useEffect(() => {
    if (isOpen && item) {
      // Si es vista de profesor, siempre cargar lista real de estudiantes
      if (!isStudentView) {
        setStudents([]); // Limpiar lista anterior
        fetchStudents();
      }
      
      if (isStudentView) {
        checkStudentStatus();
      }
      
      // Inicializar cuestionario si es el caso
      if (item.type === 'cuestionario') {
        setQuizStarted(false);
        setQuizFinished(false);
        setTimeLeft((item.data?.duracion || 60) * 60);
        setUserAnswers({});
        setStudentSubmission(null);
      }
    } else {
      setShowStudents(false);
      setSelectedStudentResult(null);
      setStudentSubmission(null);
      setUploadError('');
    }
  }, [isOpen, item]);

  const checkStudentStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      if (item?.type === 'cuestionario') {
        const { data, error } = await supabase.from('quiz_attempts').select('*').eq('quiz_id', item.id).eq('student_id', user.id).maybeSingle();
        if (data) {
          setQuizFinished(true);
          setQuizResults({ 
            score: data.score, 
            correctas: data.correct_answers, 
            total: item.data?.preguntas?.length || 0, 
            detalles: data.answers_data 
          });
        }
      } else if (item?.itemType === 'tarea') {
        const { data, error } = await supabase.from('task_submissions').select('*').eq('task_id', item.id).eq('student_id', user.id).maybeSingle();
        if (data) {
          setStudentSubmission(data);
        }
      }
    } catch (err) {
      console.error("Error checking student status:", err);
    }
  };

  // Timer Effect
  useEffect(() => {
    let timer;
    if (quizStarted && !quizFinished && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFinishQuiz();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [quizStarted, quizFinished, timeLeft]);

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

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
    setCurrentQuestionIdx(0);
  };

  const handleFinishQuiz = async () => {
    setQuizFinished(true);
    const preguntas = item.data?.preguntas || [];
    let correctas = 0;
    const detalles = preguntas.map((p, idx) => {
      const isCorrect = userAnswers[idx] === p.correcta;
      if (isCorrect) correctas++;
      return { ...p, userChoice: userAnswers[idx], isCorrect };
    });
    
    const score = Math.round((correctas / preguntas.length) * 100);
    setQuizResults({ score, correctas, total: preguntas.length, detalles });

    if (isStudentView) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('quiz_attempts').insert({
            quiz_id: item.id,
            student_id: user.id,
            score,
            correct_answers: correctas,
            answers_data: detalles
          });
        }
      } catch (error) {
        console.error("Error saving quiz attempt:", error);
      }
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSubmitting(true);
    setUploadError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No autenticado");

      const fileExt = file.name.split('.').pop();
      const fileName = `${item.id}/${user.id}_${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('task-submissions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('task-submissions')
        .getPublicUrl(fileName);

      const submissionData = {
        task_id: item.id,
        student_id: user.id,
        file_url: publicUrlData.publicUrl,
        file_name: file.name
      };

      const { error: insertError } = await supabase
        .from('task_submissions')
        .insert(submissionData);

      if (insertError) throw insertError;

      setStudentSubmission(submissionData);
    } catch (error) {
      console.error("Error al subir:", error);
      setUploadError('Error al subir el archivo. Revisa tu conexión.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          submissionData: submission // Guardamos todo por si acaso
        };
      });

      setStudents(studentList);
    } catch (err) {
      console.error("Error al cargar estudiantes:", err);
    } finally {
      setLoadingStudents(false);
    }
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (sortByMissing) {
      if (a.hasSubmitted === b.hasSubmitted) return a.name.localeCompare(b.name);
      return a.hasSubmitted ? 1 : -1;
    } else {
      if (a.hasSubmitted === b.hasSubmitted) return a.name.localeCompare(b.name);
      return a.hasSubmitted ? -1 : 1;
    }
  });

  if (!isOpen || !item) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} 
          className={`relative w-full max-w-4xl rounded-[3rem] border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
        >
           {/* Header Flotante */}
           <div className={`absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b ${isDarkMode ? 'from-slate-900 to-transparent' : 'from-white to-transparent'}`}>
              <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
                 <div className={`w-2 h-2 rounded-full animate-pulse ${item.itemType === 'tarea' ? 'bg-rose-500' : 'bg-emerald-500'}`}></div>
                 <span className="text-[10px] font-black uppercase tracking-widest text-white">
                    {isStudentView ? 'Visor de Contenido' : 'Vista Previa Estudiante'}
                 </span>
              </div>
              <button onClick={onClose} className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-lg hover:scale-105 active:scale-95">
                <X size={20} />
              </button>
           </div>

           <div className="overflow-y-auto custom-scrollbar flex-1 relative">
              {/* Cover Background */}
              <div className={`h-64 relative flex items-end p-10 ${item.type === 'cuestionario' ? 'bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950' : item.itemType === 'tarea' ? 'bg-gradient-to-br from-rose-900 via-rose-800 to-rose-950' : 'bg-gradient-to-br from-vinotinto-800 via-vinotinto-900 to-slate-900'}`}>
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 mix-blend-overlay"></div>
                 <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/2"></div>
                 
                 <div className="relative z-10 w-full">
                    <div className="flex items-center gap-4 mb-4">
                       <span className="px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest shadow-xl">
                         {item.type === 'cuestionario' ? 'Cuestionario' : item.itemType === 'tarea' ? 'Asignación' : item.type || 'Material'}
                       </span>
                       {item.itemType === 'tarea' && (
                         <span className="px-4 py-1.5 rounded-full bg-amber-500/90 text-slate-900 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">
                           {item.points || 20} Puntos
                         </span>
                       )}
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white italic tracking-tighter uppercase leading-tight drop-shadow-2xl">
                      {item.title}
                    </h1>
                 </div>
              </div>

              {/* Contenido Principal */}
              <div className="p-10 space-y-10">
                 {/* Descripción */}
                 {item.description && (
                   <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-800/50 border-slate-700/50' : 'bg-slate-50 border-slate-100'}`}>
                      <h4 className={`text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                         <FileText size={16} className={item.itemType === 'tarea' ? 'text-rose-500' : 'text-vinotinto-500'} /> Descripción y Detalles
                      </h4>
                      <p className={`text-base md:text-lg leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                        {item.description}
                      </p>
                   </div>
                 )}

                 {/* Fuentes Bibliográficas */}
                 {item.source && item.source !== 'youtube' && item.source !== 'upload' && item.source !== 'other' && (
                   <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-800/30 border-slate-700' : 'bg-slate-50 border-slate-100 shadow-sm'}`}>
                      <h4 className={`text-[11px] font-black uppercase tracking-widest mb-4 flex items-center gap-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                         <Link size={16} className="text-vinotinto-500" /> Fuentes Bibliográficas
                      </h4>
                      <p className={`text-base md:text-lg leading-relaxed whitespace-pre-wrap ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {item.source}
                      </p>
                   </div>
                 )}

                 {/* Archivo o Video (Si es Material) */}
                 {item.itemType === 'material' && item.type === 'video' && item.url && (
                   <div className="aspect-video w-full rounded-[3rem] overflow-hidden shadow-2xl border-4 border-slate-800 relative bg-black group">
                      {item.url.includes('youtube') || item.url.includes('youtu.be') ? (
                         <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${item.url.split('v=')[1]?.split('&')[0] || item.url.split('/').pop()}`} frameBorder="0" allowFullScreen></iframe>
                      ) : (
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <Play size={80} className="text-white/20 mb-4" />
                            <a href={item.url} target="_blank" rel="noreferrer" className="px-8 py-3 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-full hover:scale-105 transition-transform">Abrir Video Externo</a>
                         </div>
                      )}
                   </div>
                 )}

                 {/* Entrega del Estudiante (Si es Tarea) */}
                 {item.itemType === 'tarea' && (
                   <div className="space-y-6">
                      <div className="flex items-center gap-4">
                         <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                         <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">Área de Estudiantes</p>
                         <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
                      </div>

                      {/* ZONA DE CUESTIONARIO INTERACTIVO O ENTREGA DE TAREA */}
                      {item.type === 'cuestionario' && (
                        <div className={`p-10 rounded-[3rem] border-4 border-dashed transition-all relative overflow-hidden ${isDarkMode ? 'bg-slate-900 border-indigo-900/30' : 'bg-indigo-50 border-indigo-100 shadow-inner'}`}>
                          
                          {/* 1. PANTALLA DE BIENVENIDA */}
                          {!quizStarted && !quizFinished && (
                            <div className="flex flex-col items-center text-center space-y-6 animate-scale-up">
                               <div className="w-20 h-20 bg-indigo-500 text-white rounded-[2rem] flex items-center justify-center shadow-2xl shadow-indigo-500/20 mb-2">
                                  <HelpCircle size={40} />
                               </div>
                               <h3 className="text-3xl font-black text-indigo-900 dark:text-indigo-400 italic tracking-tighter uppercase">¿Listo para el Cuestionario?</h3>
                               <div className="max-w-md space-y-4">
                                   <p className="text-slate-500 font-bold leading-relaxed italic whitespace-pre-wrap">{item.description || "Este cuestionario evalúa tus conocimientos sobre el tema actual. Lee bien cada pregunta antes de responder."}</p>
                                  <div className={`p-6 rounded-2xl border-l-8 border-rose-500 flex items-start gap-4 text-left ${isDarkMode ? 'bg-rose-500/10 border-rose-900' : 'bg-rose-50 border-rose-100'}`}>
                                     <AlertTriangle className="text-rose-600 shrink-0" size={24} />
                                     <div>
                                        <p className="text-rose-700 font-black text-xs uppercase tracking-widest">Advertencia Importante</p>
                                        <p className="text-rose-600/80 text-[10px] font-bold mt-1">Una vez que comiences, no podrás repetir el cuestionario ni volver atrás. Solo tienes una oportunidad.</p>
                                     </div>
                                  </div>
                               </div>
                               <div className="flex items-center gap-8 py-4">
                                  <div className="text-center">
                                     <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Duración</p>
                                     <p className="text-xl font-black text-indigo-600 italic">{item.data?.duracion || 60} Min</p>
                                  </div>
                                  <div className="w-px h-10 bg-slate-200 dark:bg-slate-800"></div>
                                  <div className="text-center">
                                     <p className="text-[10px] font-black uppercase text-slate-400 mb-1">Preguntas</p>
                                     <p className="text-xl font-black text-indigo-600 italic">{item.data?.preguntas?.length || 0}</p>
                                  </div>
                                  <button 
                                   onClick={handleStartQuiz}
                                   className="px-12 py-5 bg-indigo-600 text-white text-sm font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-900/20"
                                 >
                                   Empezar Cuestionario Ahora
                                 </button>

                               </div>
                            </div>
                          )}

                          {/* 2. CUESTIONARIO EN CURSO */}
                          {quizStarted && !quizFinished && (
                            <div className="space-y-8 animate-fade-in">
                               {/* Header del Quiz */}
                               <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-4">
                                     <div className="w-12 h-12 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black italic">
                                        {currentQuestionIdx + 1}/{item.data.preguntas.length}
                                     </div>
                                     <div>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Pregunta Actual</p>
                                        <div className="w-32 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full mt-1 overflow-hidden">
                                           <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${((currentQuestionIdx + 1) / (item.data.preguntas.length || 1)) * 100}%` }}></div>
                                        </div>
                                     </div>
                                     <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                                       <Clock size={18} className="text-indigo-500 animate-pulse" />
                                       <p className="text-lg font-black text-slate-900 dark:text-white italic">{formatTime(timeLeft)}</p>
                                     </div>
                                  </div>
                             </div>

                               {/* Pregunta */}
                               <div className="py-6">
                                  <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100 italic leading-tight tracking-tighter">
                                    {item.data.preguntas[currentQuestionIdx].texto}
                                  </h4>
                               </div>

                               {/* Opciones */}
                               <div className="grid grid-cols-1 gap-4">
                                  {item.data.preguntas[currentQuestionIdx].respuestas.map((resp, rIdx) => (
                                     <button 
                                       key={rIdx}
                                       type="button"
                                       onClick={() => setUserAnswers({...userAnswers, [currentQuestionIdx]: rIdx})}
                                       className={`p-6 rounded-2xl border-4 text-left transition-all flex items-center justify-between group ${userAnswers[currentQuestionIdx] === rIdx 
                                         ? 'bg-indigo-600 border-indigo-400 text-white shadow-xl shadow-indigo-900/30' 
                                         : 'bg-white dark:bg-slate-800 border-transparent hover:border-indigo-300 dark:hover:border-indigo-700 text-slate-600 dark:text-slate-300 hover:scale-[1.01]'}`}
                                     >
                                        <div className="flex items-center gap-4">
                                           <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs ${userAnswers[currentQuestionIdx] === rIdx ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-700'}`}>
                                              {String.fromCharCode(65 + rIdx)}
                                           </div>
                                           <span className="font-bold">{resp}</span>
                                        </div>
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${userAnswers[currentQuestionIdx] === rIdx ? 'bg-white border-white' : 'border-slate-200 dark:border-slate-700'}`}>
                                           {userAnswers[currentQuestionIdx] === rIdx && <Check size={14} className="text-indigo-600" />}
                                        </div>
                                     </button>
                                  ))}
                               </div>

                               {/* Navegación */}
                               <div className="flex items-center justify-between pt-8 border-t border-slate-200 dark:border-slate-800">
                                  <button 
                                    type="button"
                                    disabled={currentQuestionIdx === 0}
                                    onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all ${currentQuestionIdx === 0 ? 'opacity-30 grayscale' : 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600'}`}
                                  >
                                     <ChevronLeft size={16} /> Anterior
                                  </button>

                                  {currentQuestionIdx < item.data.preguntas.length - 1 ? (
                                    <button 
                                      type="button"
                                      disabled={userAnswers[currentQuestionIdx] === undefined}
                                      onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                                      className={`flex items-center gap-2 px-8 py-4 bg-indigo-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-indigo-900/20 hover:scale-105 active:scale-95 transition-all ${userAnswers[currentQuestionIdx] === undefined ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                    >
                                       Siguiente Pregunta <ChevronRight size={16} />
                                    </button>
                                  ) : (
                                    <button 
                                      type="button"
                                      disabled={userAnswers[currentQuestionIdx] === undefined}
                                      onClick={() => {
                                        if (window.confirm("¿Estás seguro de que quieres enviar el cuestionario? No podrás cambiar tus respuestas después.")) {
                                          handleFinishQuiz();
                                        }
                                      }}
                                      className={`flex items-center gap-2 px-10 py-4 bg-emerald-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-900/20 hover:scale-105 active:scale-95 transition-all ${userAnswers[currentQuestionIdx] === undefined ? 'opacity-50 grayscale cursor-not-allowed' : ''}`}
                                    >
                                       Finalizar Cuestionario <CheckCircle2 size={16} />
                                    </button>
                                  )}
                               </div>
                            </div>
                          )}

                          {/* 3. RESULTADOS FINALES */}
                          {quizFinished && quizResults && (
                            <div className="flex flex-col items-center text-center space-y-8 animate-scale-up py-4">
                               <div className="relative">
                                  <div className={`w-32 h-32 rounded-full flex items-center justify-center text-white shadow-2xl relative z-10 ${quizResults.score >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}>
                                     <CheckCircle2 size={60} />
                                  </div>
                                  <div className={`absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse ${quizResults.score >= 50 ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                               </div>
                               
                               <div>
                                  <h3 className="text-4xl font-black italic tracking-tighter uppercase mb-2">¡Cuestionario Completado!</h3>
                                  <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.3em]">Resultados de tu Evaluación</p>
                               </div>

                               <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                                  <div className={`p-6 rounded-3xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                     <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Puntuación</p>
                                     <p className={`text-4xl font-black italic ${quizResults.score >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>{quizResults.score}%</p>
                                  </div>
                                  <div className={`p-6 rounded-3xl border-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
                                     <p className="text-[9px] font-black uppercase text-slate-400 mb-2">Correctas</p>
                                     <p className="text-4xl font-black text-indigo-600 italic">{quizResults.correctas}/{quizResults.total}</p>
                                  </div>
                               </div>

                               <div className="w-full space-y-4 text-left">
                                  <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-4">Revisión de Preguntas</h4>
                                  <div className="space-y-2">
                                     {quizResults.detalles.map((p, idx) => (
                                        <div key={idx} className={`p-4 rounded-2xl flex items-center justify-between ${isDarkMode ? 'bg-slate-800/50' : 'bg-white shadow-sm'}`}>
                                           <div className="flex items-center gap-3">
                                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black ${p.isCorrect ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                 {idx + 1}
                                              </div>
                                              <p className="text-xs font-bold truncate max-w-[200px]">{p.texto}</p>
                                           </div>
                                           {p.isCorrect ? <CheckCircle2 className="text-emerald-500" size={18} /> : <AlertCircle className="text-rose-500" size={18} />}
                                        </div>
                                     ))}
                                  </div>
                               </div>
                               <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest italic animate-pulse">Este resultado ha sido registrado permanentemente.</p>
                               
                            </div>
                          )}
                        </div>
                      )}

                      {/* ZONA DE ENTREGA PARA EL ESTUDIANTE */}
                      {isStudentView && item.itemType === 'tarea' && item.type !== 'cuestionario' && (
                        <>
                          {studentSubmission ? (
                            <div className={`p-8 rounded-[3rem] border-2 flex flex-col items-center justify-center text-center transition-all ${isDarkMode ? 'bg-emerald-900/20 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
                               <div className="w-20 h-20 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center mb-6 shadow-xl shadow-emerald-500/20 animate-scale-up">
                                  <CheckCircle2 size={40} />
                               </div>
                               <h4 className={`text-2xl font-black italic tracking-tighter uppercase mb-2 ${isDarkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>¡Entrega Exitosa!</h4>
                               <p className="text-sm font-bold text-slate-500 mb-6">Tu archivo <span className="italic text-emerald-600 font-black">{studentSubmission.file_name}</span> fue enviado correctamente.</p>
                               
                               <div className="flex flex-wrap items-center justify-center gap-4">
                                 <a 
                                   href={studentSubmission.file_url} 
                                   target="_blank" 
                                   rel="noreferrer" 
                                   className="px-8 py-4 bg-white text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-sm border border-emerald-100 hover:scale-105 transition-all"
                                 >
                                   🔍 Ver Entrega
                                 </a>
                                 <button
                                   onClick={async () => {
                                     if (window.confirm("¿Deseas eliminar esta entrega para subir otra?")) {
                                       try {
                                         const { data: { user } } = await supabase.auth.getUser();
                                         if (!user) return;
                                         await supabase.from('task_submissions').delete().eq('task_id', item.id).eq('student_id', user.id);
                                         setStudentSubmission(null);
                                       } catch (e) { console.error(e); }
                                     }
                                   }}
                                   className="px-8 py-4 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-rose-500/20 hover:bg-rose-600 hover:scale-105 transition-all"
                                 >
                                   🗑️ Eliminar y Reenviar
                                 </button>
                               </div>
                            </div>
                          ) : (

                            <label className={`border-2 border-dashed rounded-[3rem] p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer relative overflow-hidden group ${isDarkMode ? 'bg-slate-900 border-slate-700 hover:border-indigo-500 hover:bg-slate-800' : 'bg-slate-50 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50'}`}>
                               <input type="file" className="hidden" onChange={handleFileUpload} disabled={isSubmitting} />
                               
                               {isSubmitting ? (
                                  <div className="flex flex-col items-center">
                                     <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                     <p className="text-[12px] font-black text-indigo-500 uppercase tracking-widest animate-pulse">Subiendo Archivo...</p>
                                  </div>
                               ) : (
                                  <>
                                     <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4 transition-all group-hover:bg-indigo-500 group-hover:text-white group-hover:shadow-xl shadow-indigo-500/20">
                                        <UploadCloud size={32} className="text-slate-400 group-hover:text-white transition-colors" />
                                     </div>
                                     <h4 className="font-black text-sm uppercase tracking-widest text-slate-500 mb-2">Haz clic o arrastra aquí tu archivo</h4>
                                     <p className="text-[10px] text-slate-400 font-bold max-w-sm">PDF, DOCX, Imágenes o Videos (Max 50MB).</p>
                                     <div className="mt-6 px-8 py-3 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-600/20 group-hover:scale-105 transition-all">
                                       Seleccionar Archivo
                                     </div>
                                  </>
                               )}
                            </label>
                          )}
                          {uploadError && (
                             <p className="text-center text-xs font-bold text-rose-500 mt-4">{uploadError}</p>
                          )}
                        </>
                      )}


                      {/* ZONA DE VISTA PREVIA (PROFESOR) */}
                      {!isStudentView && item.itemType === 'tarea' && item.type !== 'cuestionario' && (
                        <div className={`border-2 border-dashed rounded-[3rem] p-10 flex flex-col items-center justify-center text-center opacity-60 grayscale cursor-not-allowed ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                           <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                              <UploadCloud size={32} className="text-slate-400" />
                           </div>
                           <h4 className="font-black text-sm uppercase tracking-widest text-slate-500 mb-2">Área de Entrega (Vista Estudiante)</h4>
                           <p className="text-[10px] text-slate-400 font-bold max-w-sm">Aquí es donde los estudiantes arrastran y sueltan sus archivos para completar la asignación.</p>
                        </div>
                      )}

                      {/* BARRA DE ESTUDIANTES PARA EL PROFESOR */}
                      {!isStudentView && (
                        <div className={`mt-10 rounded-[3rem] border shadow-xl overflow-hidden transition-all duration-500 ${isDarkMode ? 'bg-slate-800 border-slate-700 shadow-black/50' : 'bg-white border-slate-100 shadow-slate-200/50'}`}>
                         <button 
                           onClick={() => setShowStudents(!showStudents)} 
                           className={`w-full p-8 flex items-center justify-between transition-colors ${showStudents ? (isDarkMode ? 'bg-slate-800' : 'bg-slate-50') : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                         >
                            <div className="flex items-center gap-6">
                               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${isDarkMode ? 'bg-indigo-600' : 'bg-indigo-500'}`}>
                                  <User size={24} />
                               </div>
                               <div className="text-left">
                                  <h3 className={`text-xl font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {item.type === 'cuestionario' ? 'Resultados' : 'Estudiantes'}
                                  </h3>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {item.type === 'cuestionario' ? 'Ver resultados de evaluación' : 'Ver estado de entregas'} ({students.filter(s => s.hasSubmitted).length}/{students.length})
                                  </p>
                               </div>
                            </div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-transform duration-500 ${showStudents ? 'rotate-180 border-indigo-500 text-indigo-500' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
                               <ChevronDown size={24} />
                            </div>
                         </button>

                         <AnimatePresence>
                            {showStudents && (
                               <motion.div 
                                 initial={{ height: 0, opacity: 0 }} 
                                 animate={{ height: 'auto', opacity: 1 }} 
                                 exit={{ height: 0, opacity: 0 }}
                                 className="border-t dark:border-slate-700"
                               >
                                  <div className="p-8">
                                     {/* Controles de Filtro/Orden */}
                                     <div className="flex justify-between items-center mb-6">
                                        <h4 className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lista de la Clase</h4>
                                        <button 
                                          onClick={() => setSortByMissing(!sortByMissing)}
                                          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isDarkMode ? 'bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm'}`}
                                        >
                                           <ArrowDownUp size={14} /> 
                                           {sortByMissing ? 'Mostrar Entregados Primero' : 'Mostrar Faltantes Primero'}
                                        </button>
                                     </div>

                                     {/* Lista */}
                                     {loadingStudents ? (
                                        <div className="py-10 text-center flex flex-col items-center">
                                           <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cargando registros...</p>
                                        </div>
                                     ) : (
                                        <div className="space-y-3">
                                           {sortedStudents.map(student => (
                                              <div key={student.id} className={`flex items-center justify-between p-5 pl-8 rounded-[2rem] border transition-all hover:-translate-y-1 ${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-800 hover:shadow-2xl shadow-black/20' : 'bg-white border-slate-100 hover:shadow-2xl shadow-slate-200/50'}`}>
                                                 <div className="flex items-center gap-6">
                                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black text-white shadow-xl ${student.hasSubmitted ? 'bg-gradient-to-br from-indigo-500 to-indigo-700 shadow-indigo-500/20' : 'bg-slate-200 dark:bg-slate-700 text-slate-400'}`}>
                                                       {student.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                       <h5 className={`font-black text-lg uppercase tracking-tighter ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{student.name}</h5>
                                                       {student.hasSubmitted ? (
                                                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{student.date} • {student.time}</p>
                                                       ) : (
                                                          <p className="text-[10px] font-black text-rose-500/60 uppercase tracking-widest mt-1 italic">Sin actividad registrada</p>
                                                       )}
                                                    </div>
                                                 </div>
                                                 <div className="flex items-center gap-5">
                                                    {item.type === 'cuestionario' && student.score !== null && (
                                                      <div className={`px-6 py-2.5 rounded-2xl text-sm font-black shadow-lg ${student.score >= 50 ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-rose-500 text-white shadow-rose-500/20'}`}>
                                                         {student.score}%
                                                      </div>
                                                    )}
                                                    <div className={`hidden md:flex items-center gap-2 px-4 py-2.5 rounded-xl border ${student.statusColor}`}>
                                                       {student.statusIcon}
                                                       <span className="text-[10px] font-black uppercase tracking-widest">{student.statusText}</span>
                                                    </div>
                                                    {item.type === 'cuestionario' && student.hasSubmitted && (
                                                      <div className="flex gap-2">
                                                        <button 
                                                          onClick={() => setSelectedStudentResult(student)}
                                                          className="w-14 h-14 rounded-2xl flex items-center justify-center bg-indigo-50 dark:bg-indigo-900/30 text-indigo-500 hover:bg-indigo-500 hover:text-white transition-all shadow-sm group" 
                                                          title="Ver detalle de respuestas"
                                                        >
                                                           <CheckCircle2 size={24} className="group-hover:rotate-12 transition-transform" />
                                                        </button>
                                                        
                                                        <button 
                                                          onClick={async () => {
                                                            if (window.confirm(`¿Estás seguro de eliminar el intento de ${student.name}? Esto le permitirá volver a realizar el cuestionario.`)) {
                                                              try {
                                                                const { error } = await supabase
                                                                  .from('quiz_attempts')
                                                                  .delete()
                                                                  .eq('quiz_id', item.id)
                                                                  .eq('student_id', student.id);
                                                                
                                                                if (error) throw error;
                                                                fetchStudents(); // Recargar lista
                                                              } catch (err) {
                                                                console.error("Error al borrar intento:", err);
                                                                alert("No se pudo eliminar el registro.");
                                                              }
                                                            }
                                                          }}
                                                          className="w-14 h-14 rounded-2xl flex items-center justify-center bg-rose-50 dark:bg-rose-900/30 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm group" 
                                                          title="Eliminar intento y dar otra oportunidad"
                                                        >
                                                           <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                                                        </button>
                                                      </div>
                                                    )}
                                                 </div>
                                              </div>
                                           ))}
                                           {sortedStudents.length === 0 && (
                                              <div className="py-10 text-center">
                                                 <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No hay estudiantes en esta clase.</p>
                                              </div>
                                           )}
                                        </div>
                                     )}
                                  </div>
                               </motion.div>
                            )}
                          </AnimatePresence>
                       </div>
                      )}
                    </div>
                  )}

                  {/* SISTEMA DE REPORTES PARA EL ESTUDIANTE - GLOBAL Y UNIFICADO */}
                  {isStudentView && (
                    <div id="report-section" className="mt-12 border-t border-slate-100 dark:border-slate-800 pt-10 flex justify-center">
                      {!showReport ? (
                        <button 
                          onClick={() => setShowReport(true)}
                          className={`group flex items-center gap-3 px-8 py-4 rounded-2xl border-2 transition-all shadow-sm ${isDarkMode ? 'bg-rose-500/5 border-rose-500/20 text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/40' : 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100 hover:border-rose-200'}`}
                        >
                          <AlertTriangle size={18} className="group-hover:rotate-12 transition-transform" /> 
                          <span className="text-[11px] font-black uppercase tracking-widest">¿Tienes problemas técnicos? Reportar fallo aquí</span>
                        </button>
                      ) : (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`w-full max-w-2xl p-8 rounded-[2.5rem] border-2 ${isDarkMode ? 'bg-slate-800/80 border-rose-500/30 backdrop-blur-md' : 'bg-rose-50 border-rose-200 shadow-xl shadow-rose-200/50'}`}>
                          <div className="flex justify-between items-center mb-6">
                            <h5 className="text-sm font-black uppercase tracking-widest text-rose-600 flex items-center gap-3">
                              <div className="w-10 h-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-rose-600/20">
                                <AlertTriangle size={20} />
                              </div>
                              Centro de Reportes Estudiantil
                            </h5>
                            <button onClick={() => setShowReport(false)} className="p-2 rounded-xl hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-all"><X size={20}/></button>
                          </div>
                          
                          <div className="space-y-6">
                            <div className="flex flex-wrap gap-2">
                              {['Error de enviado', 'Tuve problemas al entregar', 'Archivo no carga', 'Error en cuestionario'].map(prob => (
                                <button 
                                  key={prob}
                                  onClick={() => setReportIssue(prob)}
                                  className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${reportIssue === prob ? 'bg-rose-500 border-rose-500 text-white shadow-lg' : 'bg-white border-slate-200 text-slate-500 hover:border-rose-300'}`}
                                >
                                  {prob}
                                </button>
                              ))}
                            </div>
                            
                            <textarea 
                              value={reportDescription}
                              onChange={(e) => setReportDescription(e.target.value)}
                              placeholder="Describe tu problema con más detalle aquí..."
                              className={`w-full p-6 rounded-2xl border text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-rose-500/10 ${isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-rose-500' : 'bg-white border-slate-200 text-slate-700 focus:border-rose-500'}`}
                              rows={3}
                            />
                            
                            <button 
                              onClick={handleSendReport}
                              disabled={!reportIssue && !reportDescription}
                              className="w-full py-4 bg-rose-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-rose-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                              {isSendingReport ? 'Enviando Reporte...' : 'Enviar Reporte al Profesor'}
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )}

              </div>
           </div>
        </motion.div>
        <AnimatePresence>
          {selectedStudentResult && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-md"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 50 }}
                className={`w-full max-w-3xl rounded-[3.5rem] shadow-2xl overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-white'}`}
              >
                <div className={`p-10 flex items-center justify-between border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-indigo-600 text-white rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-600/30">
                      <CheckCircle2 size={32} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black uppercase italic leading-none tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Reporte de Evaluación</h3>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-2">{selectedStudentResult.name} • {item.title}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStudentResult(null)} className={`p-4 rounded-2xl transition-all ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-200 text-slate-400'}`}>
                    <X size={24} />
                  </button>
                </div>
                <div className="p-10 space-y-10 max-h-[65vh] overflow-y-auto custom-scrollbar">
                  <div className="grid grid-cols-3 gap-6">
                    <div className={`p-6 rounded-[2.5rem] text-center border-2 transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-800 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 shadow-inner'}`}>
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Puntuación Final</p>
                       <p className={`text-5xl font-black italic tracking-tighter ${selectedStudentResult.score >= 50 ? 'text-emerald-500' : 'text-rose-500'}`}>{selectedStudentResult.score}%</p>
                    </div>
                    <div className={`p-6 rounded-[2.5rem] text-center border-2 transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-800 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 shadow-inner'}`}>
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Tiempo Total</p>
                       <p className="text-5xl font-black text-indigo-600 italic tracking-tighter">08:24</p>
                    </div>
                    <div className={`p-6 rounded-[2.5rem] text-center border-2 transition-all ${isDarkMode ? 'bg-slate-800/50 border-slate-800 hover:border-indigo-500/50' : 'bg-slate-50 border-slate-100 hover:border-indigo-200 shadow-inner'}`}>
                       <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Preguntas</p>
                       <p className="text-5xl font-black text-amber-500 italic tracking-tighter">{item.data?.preguntas?.length || 0}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                      <h4 className="text-[12px] font-black uppercase tracking-widest text-slate-400">Revisión de Respuestas</h4>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-emerald-500"><CheckCircle2 size={12}/> Correctas</div>
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-rose-500"><AlertTriangle size={12}/> Errores</div>
                      </div>
                    </div>
                    <div className="grid gap-4">
                      {selectedStudentResult.submissionData?.answers_data?.map((p, idx) => (
                        <div key={idx} className={`p-6 rounded-[2.5rem] border-2 transition-all ${isDarkMode ? 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/50' : 'bg-white border-slate-100 hover:shadow-xl shadow-slate-200/20'}`}>
                          <div className="flex items-start justify-between gap-6">
                            <div className="flex items-start gap-5">
                              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-lg ${p.isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                                {idx + 1}
                              </div>
                              <div className="space-y-3">
                                <p className={`text-base font-bold leading-tight ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{p.texto}</p>
                                <div className="flex flex-wrap gap-2">
                                  <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${p.isCorrect ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-rose-500/10 border-rose-500/20 text-rose-500'}`}>
                                    {p.isCorrect ? '✓ Correcta: ' : '✗ Marcó: '} {p.respuestas[p.userChoice] || 'Sin respuesta'}
                                  </span>
                                  {!p.isCorrect && (
                                    <span className="px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                                      ✓ Respuesta Correcta: {p.respuestas[p.correcta]}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {p.isCorrect ? <CheckCircle2 className="text-emerald-500 shrink-0" size={24} /> : <AlertTriangle className="text-rose-500 shrink-0" size={24} />}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="p-10 border-t dark:border-slate-800 flex justify-center bg-slate-50 dark:bg-slate-800/30">
                  <button 
                    onClick={() => setSelectedStudentResult(null)} 
                    className="px-12 py-5 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[12px] shadow-2xl shadow-indigo-600/20 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all"
                  >
                    Cerrar Reporte Detallado
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>,
    document.body
  );
};
export default ModalVistaContenido;
