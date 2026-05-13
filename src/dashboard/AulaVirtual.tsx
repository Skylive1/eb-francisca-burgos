import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, FileText, Calendar as CalendarIcon, ChevronRight,
  Search, Video, DownloadCloud, MessageCircle, 
  Play, BookOpen, Clock, CheckCircle2, ChevronLeft, UploadCloud,
  Loader2, AlertCircle, User
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

interface AulaVirtualProps {
  isDarkMode?: boolean;
}

// --- COMPONENTE DE DETALLE DEL CURSO ---
const CourseDetail = ({ course, onBack, isDarkMode }: any) => {
  const [isUploaded, setIsUploaded] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchCourseContent(); }, [course.id]);

  const fetchCourseContent = async () => {
    setLoading(true);
    try {
      const { data: lessonsData } = await supabase.from('lessons').select('*').eq('class_id', course.id).order('created_at', { ascending: true });
      setLessons(lessonsData || []);
      if (lessonsData && lessonsData.length > 0) {
        const { data: materialsData } = await supabase.from('materials').select('*').in('lesson_id', lessonsData.map((l: any) => l.id));
        setMaterials(materialsData || []);
      }
      const { data: tasksData } = await supabase.from('tasks').select('*').eq('class_id', course.id).order('due_date', { ascending: true });
      setTasks(tasksData || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96">
      <Loader2 className={`w-12 h-12 animate-spin mb-4 ${isDarkMode ? 'text-gold' : 'text-vinotinto'}`} />
      <p className={`text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Sincronizando contenido...</p>
    </div>
  );

  if (selectedVideo) return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 animate-in slide-in-from-right duration-500">
      <button onClick={() => setSelectedVideo(null)} className={`flex items-center gap-2 font-black text-[10px] tracking-widest uppercase mb-8 transition-colors group ${isDarkMode ? 'text-slate-400 hover:text-gold' : 'text-slate-500 hover:text-vinotinto'}`}>
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver al Curso
      </button>
      <div className={`rounded-[3rem] overflow-hidden shadow-2xl aspect-video relative flex items-center justify-center group border-4 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-slate-100 border-white'}`}>
        {selectedVideo.url?.includes('youtube.com') || selectedVideo.url?.includes('youtu.be') ? (
           <iframe className="w-full h-full" src={`https://www.youtube.com/embed/${selectedVideo.url.split('v=')[1]?.split('&')[0] || selectedVideo.url.split('/').pop()}`} frameBorder="0" allowFullScreen></iframe>
        ) : (
          <div className="text-center">
             <Play size={80} className={`opacity-20 mb-4 mx-auto ${isDarkMode ? 'text-white' : 'text-vinotinto'}`} />
             <a href={selectedVideo.url} target="_blank" rel="noopener noreferrer" className="bg-gold text-slate-950 px-8 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl">Ver Video Externo</a>
          </div>
        )}
      </div>
      <div className="mt-10">
        <h2 className={`text-3xl font-black italic uppercase tracking-tighter mb-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{selectedVideo.title}</h2>
        <p className={`text-sm leading-relaxed max-w-3xl ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{selectedVideo.description || 'Sin descripción adicional.'}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-10 animate-in fade-in zoom-in duration-500">
      <button onClick={onBack} className={`flex items-center gap-2 font-black text-[10px] tracking-widest uppercase mb-8 transition-colors group ${isDarkMode ? 'text-slate-400 hover:text-gold' : 'text-slate-500 hover:text-vinotinto'}`}>
        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Volver a Mi Aula
      </button>

      <div className={`rounded-[3.5rem] shadow-2xl overflow-hidden mb-10 border transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className={`p-12 md:p-20 text-white relative overflow-hidden ${course.color_bg || 'bg-vinotinto'}`}>
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
          <h1 className="text-5xl md:text-6xl font-display font-black leading-tight tracking-tighter mb-4 relative z-10 uppercase italic">
            {course.title}
          </h1>
          <div className="flex items-center gap-4 relative z-10">
             <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center border border-white/20"><User size={18} /></div>
             <p className="text-white/80 font-black tracking-[0.2em] uppercase text-[10px]">Prof. {course.instructor_name}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-12 p-10 md:p-16">
          <div className="md:col-span-2 space-y-16">
            <div>
              <h3 className={`text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                <FileText className="text-vinotinto-500" size={28}/> Plan de Evaluación
              </h3>
              <div className="space-y-6">
                {tasks.length > 0 ? tasks.map((task: any) => (
                  <div key={task.id} className={`rounded-[2.5rem] p-8 border transition-all ${isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h4 className={`font-black text-xl uppercase italic tracking-tighter ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{task.title}</h4>
                        <p className="text-vinotinto-500 text-[10px] font-black uppercase tracking-widest mt-2">Vence: {new Date(task.due_date + 'T12:00:00').toLocaleDateString()}</p>
                      </div>
                      <span className="bg-gold text-slate-950 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-gold/20">{task.points} pts</span>
                    </div>
                    <p className={`text-sm mb-8 leading-relaxed ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>{task.description}</p>
                    <div className={`border-2 border-dashed rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gold transition-all group ${isDarkMode ? 'bg-slate-900/50 border-slate-700' : 'bg-white border-slate-200'}`}>
                      <UploadCloud size={32} className={`mb-3 group-hover:scale-110 transition-transform ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`} />
                      <h4 className={`font-black text-[10px] uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Entregar Asignación</h4>
                    </div>
                  </div>
                )) : (
                  <div className={`py-16 text-center border-2 border-dashed rounded-[3rem] ${isDarkMode ? 'border-slate-800 text-slate-700' : 'border-slate-100 text-slate-300'}`}>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">No hay tareas pendientes</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className={`text-2xl font-black italic uppercase tracking-tighter mb-8 flex items-center gap-4 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                <Video className="text-vinotinto-500" size={28}/> Material Académico
              </h3>
              <div className="space-y-12">
                {lessons.map((lesson: any) => (
                  <div key={lesson.id} className="relative pl-8 border-l-2 border-vinotinto-500/20">
                    <div className="absolute top-0 left-[-9px] w-4 h-4 rounded-full bg-vinotinto-500 shadow-lg shadow-vinotinto-500/40"></div>
                    <div className="flex items-center gap-4 mb-6">
                       <span className="bg-vinotinto-600 text-white px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest italic shadow-lg shadow-vinotinto-900/20">Lapso {lesson.lapso}</span>
                       <h4 className={`font-black text-sm uppercase tracking-widest ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{lesson.title}</h4>
                    </div>
                    <div className="grid gap-4">
                      {materials.filter(m => m.lesson_id === lesson.id).map(mat => (
                        <div key={mat.id} onClick={() => mat.type === 'video' ? setSelectedVideo(mat) : window.open(mat.url, '_blank')} className={`flex items-center justify-between p-6 rounded-3xl border transition-all cursor-pointer group ${isDarkMode ? 'bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-gold/30' : 'bg-white border-slate-100 shadow-sm hover:shadow-xl hover:border-vinotinto-200'}`}>
                          <div className="flex items-center gap-5">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-900 text-slate-500 group-hover:text-gold' : 'bg-slate-50 text-slate-400 group-hover:text-vinotinto'}`}>
                              {mat.type === 'video' ? <Play size={20} /> : <DownloadCloud size={20} />}
                            </div>
                            <div>
                               <h5 className={`font-black text-sm uppercase tracking-tight ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{mat.title}</h5>
                               <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">{mat.type}</p>
                            </div>
                          </div>
                          <ChevronRight size={20} className={`transition-all group-hover:translate-x-2 ${isDarkMode ? 'text-slate-700 group-hover:text-gold' : 'text-slate-300 group-hover:text-vinotinto'}`} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className={`p-10 rounded-[3rem] border shadow-2xl sticky top-10 transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-black/40' : 'bg-white border-slate-100'}`}>
              <div className="w-16 h-16 bg-gold rounded-3xl flex items-center justify-center text-slate-950 shadow-xl shadow-gold/20 mb-8"><Award size={32} /></div>
              <h4 className={`text-xl font-black uppercase tracking-tighter italic mb-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Rendimiento</h4>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-10 italic">Snapshot Institucional</p>
              
              <div className="space-y-6">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
                  <span className={isDarkMode ? 'text-slate-400' : 'text-slate-500'}>Asistencia</span>
                  <span className="text-emerald-500">100%</span>
                </div>
                <div className={`h-2.5 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <div className="h-full bg-emerald-500 rounded-full w-full shadow-lg shadow-emerald-500/20"></div>
                </div>
              </div>
              <p className={`text-[10px] mt-12 leading-relaxed font-bold italic uppercase tracking-widest text-center py-6 border-t ${isDarkMode ? 'text-slate-500 border-slate-800' : 'text-slate-400 border-slate-100'}`}>
                "Honor a quien honor merece."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const AulaVirtual = ({ isDarkMode }: AulaVirtualProps) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => { fetchEnrolledCourses(); }, []);

  const fetchEnrolledCourses = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: enrollmentData } = await supabase.from('subject_enrollments').select('class_id, classes(id, title, description, color_bg, instructor_id, profiles(full_name))').eq('student_id', user.id);
      const formattedCourses = enrollmentData?.map((item: any) => ({
        id: item.classes.id, title: item.classes.title, description: item.classes.description, color_bg: item.classes.color_bg, instructor_name: item.classes.profiles?.full_name || 'Por asignar'
      })) || [];
      setCourses(formattedCourses);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  if (selectedCourse) return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} isDarkMode={isDarkMode} />;

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto animate-in fade-in duration-500">
      <div className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`inline-block px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-4 ${isDarkMode ? 'bg-gold/10 text-gold' : 'bg-vinotinto/10 text-vinotinto'}`}>Portal del Estudiante</motion.span>
          <h1 className={`text-5xl md:text-6xl font-display font-black tracking-tighter italic uppercase transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>Aula Virtual</h1>
          <p className={`text-lg italic mt-2 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Tu centro académico de alto nivel.</p>
        </div>
        <div className="relative group">
           <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
           <input type="text" placeholder="Buscar materia..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className={`border-2 rounded-3xl py-5 pl-16 pr-8 text-sm font-black italic outline-none w-full md:w-96 transition-all focus:border-gold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 shadow-xl'}`} />
        </div>
      </div>

      {loading ? (
        <div className="py-40 text-center"><Loader2 className="w-16 h-16 animate-spin text-gold mx-auto mb-6" /><p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400">Sincronizando portal...</p></div>
      ) : courses.length === 0 ? (
        <div className={`py-32 rounded-[4rem] border-4 border-dashed text-center ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100'}`}>
           <AlertCircle className="w-20 h-20 text-slate-200 mx-auto mb-8 opacity-20" />
           <h4 className="text-2xl font-black text-slate-400 uppercase italic tracking-widest">Sin asignaturas activas</h4>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
           {courses.filter(c => c.title.toLowerCase().includes(searchTerm.toLowerCase())).map(course => (
             <motion.div key={course.id} whileHover={{ y: -15 }} onClick={() => setSelectedCourse(course)} className={`rounded-[3.5rem] p-12 transition-all cursor-pointer group relative overflow-hidden border shadow-2xl ${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-gold/30' : 'bg-white border-slate-100 shadow-slate-200/50 hover:shadow-slate-300'}`}>
                <div className={`absolute top-0 right-0 w-40 h-40 ${course.color_bg || 'bg-vinotinto'} opacity-10 blur-[80px] rounded-full translate-x-1/2 -translate-y-1/2`}></div>
                <div className={`w-16 h-16 ${course.color_bg || 'bg-vinotinto'} rounded-2xl flex items-center justify-center mb-10 shadow-xl shadow-vinotinto-900/20 group-hover:rotate-6 transition-transform`}><BookOpen size={32} className="text-white" /></div>
                <h3 className={`text-2xl font-black uppercase italic tracking-tighter mb-2 transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{course.title}</h3>
                <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-10 transition-colors ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Prof. {course.instructor_name}</p>
                <div className={`pt-8 border-t flex items-center justify-between ${isDarkMode ? 'border-slate-800' : 'border-slate-50'}`}>
                   <span className="text-[10px] font-black text-vinotinto-500 uppercase tracking-widest italic group-hover:tracking-[0.2em] transition-all">Acceder al Aula</span>
                   <ChevronRight className="text-vinotinto-500 group-hover:translate-x-3 transition-transform" />
                </div>
             </motion.div>
           ))}
        </div>
      )}
    </div>
  );
};

export default AulaVirtual;
