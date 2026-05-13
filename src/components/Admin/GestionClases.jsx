import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Plus, Trash2, Edit2, User, Users, Save, X, Loader2, 
  Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const GestionClases = ({ isDarkMode }) => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [expandedStudents, setExpandedStudents] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    instructor_id: '',
    description: '',
    color_bg: 'bg-blue-200',
    selectedStudents: []
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: classesData } = await supabase.from('classes').select('*, profiles(full_name)');
      const { data: teachersData } = await supabase.from('profiles').select('id, full_name').eq('role', 'teacher');
      const { data: studentsData } = await supabase.from('profiles').select('id, full_name, id_card, grade').eq('role', 'student');
      const { data: enrollmentsData } = await supabase.from('subject_enrollments').select('class_id, student_id, profiles(full_name, grade)');

      const classesWithStudents = classesData?.map(cls => ({
        ...cls,
        enrolledStudents: enrollmentsData?.filter(e => e.class_id === cls.id).map(e => ({
          id: e.student_id,
          full_name: e.profiles?.full_name,
          grade: e.profiles?.grade
        })) || []
      }));

      setClasses(classesWithStudents || []);
      setTeachers(teachersData || []);
      setStudents(studentsData || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleEdit = (cls) => {
    setEditingClass(cls);
    setFormData({
      title: cls.title,
      instructor_id: cls.instructor_id,
      description: cls.description || '',
      color_bg: cls.color_bg,
      selectedStudents: cls.enrolledStudents.map(s => s.id)
    });
    setShowModal(true);
  };

  const toggleStudent = (studentId) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.instructor_id) return alert("Debes seleccionar un docente");
    
    setSaving(true);
    try {
      let classId = editingClass?.id;
      const classPayload = { 
        title: formData.title, 
        instructor_id: formData.instructor_id, 
        description: formData.description, 
        color_bg: formData.color_bg 
      };

      if (editingClass) {
        // 1. Actualizar datos de la materia
        const { error: updateError } = await supabase.from('classes').update(classPayload).eq('id', classId);
        if (updateError) throw updateError;

        // 2. Limpiar inscripciones previas para re-inscribir (Wipe and Replace)
        const { error: deleteError } = await supabase.from('subject_enrollments').delete().eq('class_id', classId);
        if (deleteError) throw deleteError;
      } else {
        // 1. Crear nueva materia
        const { data: newClass, error: insertError } = await supabase.from('classes').insert([classPayload]).select().single();
        if (insertError) throw insertError;
        if (!newClass) throw new Error("No se pudo crear la materia");
        classId = newClass.id;
      }
      
      // 3. Registrar nuevas inscripciones si hay estudiantes seleccionados
      if (formData.selectedStudents.length > 0) {
        const enrollments = formData.selectedStudents.map(sId => ({ 
          student_id: sId, 
          class_id: classId 
        }));
        
        const { error: enrollError } = await supabase.from('subject_enrollments').insert(enrollments);
        if (enrollError) throw enrollError;
      }

      setShowModal(false);
      // Limpiar filtros al cerrar
      setSearchTerm('');
      setGradeFilter('');
      fetchData();
      alert(editingClass ? "Materia actualizada con éxito" : "Materia registrada con éxito");
    } catch (error) { 
      console.error("Error en handleSubmit:", error);
      alert("Error: " + (error.message || "Ocurrió un error inesperado al guardar")); 
    } finally { 
      setSaving(false); 
    }
  };

  return (
    <div className="space-y-10">
      {/* HEADER REFINADO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className={`text-3xl font-black italic uppercase tracking-tighter transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>
            Configuración Académica
          </h3>
          <p className={`text-xs font-bold uppercase tracking-[0.2em] mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
            Gestión centralizada de materias e inscripciones
          </p>
        </div>
        <button 
          onClick={() => { setEditingClass(null); setFormData({ title: '', instructor_id: '', description: '', color_bg: 'bg-blue-200', selectedStudents: [] }); setShowModal(true); }}
          className="px-10 py-5 bg-vinotinto-600 text-white rounded-[2rem] font-black uppercase tracking-widest text-[11px] hover:bg-vinotinto-700 transition-all shadow-2xl shadow-vinotinto-900/20 active:scale-95 flex items-center gap-3"
        >
          <Plus size={20} /> Crear Materia
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {loading ? (
          <div className="col-span-full py-40 flex flex-col items-center">
            <Loader2 className="w-12 h-12 animate-spin text-gold mb-4" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Sincronizando Aula...</span>
          </div>
        ) : classes.map(cls => (
          <Motion.div 
            key={cls.id} layout
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            className={`group relative overflow-hidden rounded-[3.5rem] border p-10 transition-all duration-500 ${isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-gold/30 hover:bg-slate-900' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl'}`}
          >
            <div className="flex justify-between items-start mb-8">
              <div className={`w-16 h-16 ${cls.color_bg} rounded-[1.5rem] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                 <BookOpen className="text-slate-900 w-8 h-8" />
              </div>
              <div className="flex gap-2">
                 <button onClick={() => handleEdit(cls)} className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-gold hover:text-slate-900' : 'bg-slate-50 text-slate-500 hover:bg-gold hover:text-white'}`}><Edit2 size={16} /></button>
                 <button onClick={() => { if(window.confirm('¿Eliminar?')) supabase.from('classes').delete().eq('id', cls.id).then(fetchData) }} className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'}`}><Trash2 size={16} /></button>
              </div>
            </div>

            <h4 className={`text-2xl font-black uppercase mb-6 tracking-tighter italic leading-tight transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{cls.title}</h4>
            
            <div className="space-y-4">
              <div className={`flex items-center gap-5 p-5 rounded-[2rem] transition-colors ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                 <div className="w-10 h-10 rounded-full bg-vinotinto-500/10 flex items-center justify-center text-vinotinto-500"><User size={20} /></div>
                 <div>
                    <p className={`text-[9px] font-black uppercase tracking-widest leading-none mb-1.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Docente Titular</p>
                    <p className={`text-sm font-bold leading-none ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>{cls.profiles?.full_name}</p>
                 </div>
              </div>

              <button 
                onClick={() => setExpandedStudents(expandedStudents === cls.id ? null : cls.id)}
                className={`w-full flex items-center justify-between p-6 rounded-[2rem] border transition-all duration-300 ${expandedStudents === cls.id ? 'bg-gold text-slate-950 border-gold shadow-lg shadow-gold/20' : isDarkMode ? 'bg-slate-800/30 border-slate-700 text-slate-400 hover:border-slate-500' : 'bg-white border-slate-100 text-slate-500 hover:border-slate-300'}`}
              >
                 <div className="flex items-center gap-3">
                    <Users size={18} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Alumnos ({cls.enrolledStudents?.length})</span>
                 </div>
                 {expandedStudents === cls.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>

              <AnimatePresence>
                {expandedStudents === cls.id && (
                  <Motion.div 
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden space-y-2 pt-2"
                  >
                    {cls.enrolledStudents?.map(student => (
                      <div key={student.id} className={`flex items-center justify-between p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/80 border border-slate-700' : 'bg-slate-50 border border-slate-100'}`}>
                         <div className="flex flex-col">
                            <span className={`text-[11px] font-bold uppercase ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{student.full_name}</span>
                            <span className="text-[8px] font-black opacity-50 uppercase tracking-widest">C.I: {students.find(s => s.id === student.id)?.id_card || '---'}</span>
                         </div>
                         <span className="text-[9px] font-black px-3 py-1 bg-vinotinto-500/10 text-vinotinto-500 rounded-lg uppercase tracking-widest">{student.grade ? `${student.grade}° AÑO` : 'S/G'}</span>
                      </div>
                    ))}
                  </Motion.div>
                )}
              </AnimatePresence>
            </div>
          </Motion.div>
        ))}
      </div>

      {/* MODAL REFINADO */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => !saving && setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
            <Motion.div 
              initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
              className={`relative w-full max-w-4xl rounded-[3.5rem] border p-8 md:p-14 shadow-[0_0_80px_-20px_rgba(0,0,0,0.5)] flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
               <form onSubmit={handleSubmit} className="space-y-10 flex flex-col h-full overflow-hidden">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className={`text-4xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{editingClass ? 'Editor' : 'Nueva'} Materia</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Configuración de docentes y alumnos</p>
                    </div>
                    <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-red-500 transition-colors bg-slate-100 dark:bg-slate-800 p-3 rounded-full"><X size={28} /></button>
                  </div>

                  <div className="space-y-10 overflow-y-auto pr-4 custom-scrollbar flex-1">
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                          <div className="space-y-8">
                            <div>
                              <label className={`text-[11px] font-black uppercase tracking-widest ml-2 mb-4 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Nombre de la Materia</label>
                              <input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="Ej: Física Cuántica" className={`w-full rounded-2xl px-8 py-6 text-base font-bold transition-all outline-none border-2 focus:border-gold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900 shadow-sm'}`} />
                            </div>
                            <div>
                              <label className={`text-[11px] font-black uppercase tracking-widest ml-2 mb-4 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Docente Titular Asignado</label>
                              <select required value={formData.instructor_id} onChange={e => setFormData({...formData, instructor_id: e.target.value})} className={`w-full rounded-2xl px-8 py-6 text-base font-bold transition-all outline-none border-2 focus:border-gold appearance-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900 shadow-sm'}`}>
                                <option value="">Seleccionar Docente...</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                              </select>
                            </div>
                            
                            <div className={`p-8 rounded-[2.5rem] border-2 border-dashed ${isDarkMode ? 'border-slate-800 bg-slate-800/20' : 'border-slate-100 bg-slate-50/50'}`}>
                              <h5 className={`text-[11px] font-black uppercase tracking-widest mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Resumen de Inscripción</h5>
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-gold rounded-2xl flex items-center justify-center text-slate-900 shadow-lg shadow-gold/20">
                                  <Users size={28} />
                                </div>
                                <div>
                                  <p className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{formData.selectedStudents.length}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase">Estudiantes seleccionados</p>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col h-[500px] overflow-hidden">
                            <label className={`text-[11px] font-black uppercase tracking-widest ml-2 mb-4 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Panel de Inscripción de Estudiantes</label>
                            
                            {/* Filtros de Búsqueda Mejorados */}
                            <div className="flex gap-3 mb-6">
                              <input 
                                placeholder="Nombre o Cédula..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className={`flex-1 rounded-2xl px-6 py-4 text-xs font-bold outline-none border-2 focus:border-gold transition-all ${isDarkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'}`}
                              />
                              <select 
                                value={gradeFilter}
                                onChange={e => setGradeFilter(e.target.value)}
                                className={`w-40 rounded-2xl px-5 py-4 text-xs font-black uppercase tracking-tight outline-none border-2 focus:border-gold transition-all ${isDarkMode ? 'bg-slate-950/50 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900 shadow-sm'}`}
                              >
                                <option value="">Todos</option>
                                <option value="1">1er Año</option>
                                <option value="2">2do Año</option>
                                <option value="3">3er Año</option>
                                <option value="4">4to Año</option>
                                <option value="5">5to Año</option>
                              </select>
                            </div>

                            <div className={`flex-1 rounded-[2.5rem] p-6 overflow-y-auto space-y-3 border-2 ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-white border-slate-100 shadow-inner'}`}>
                               {students
                                .filter(s => {
                                  const matchSearch = !searchTerm || s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.id_card?.includes(searchTerm);
                                  // Mejora lógica de filtro de año: busca el número dentro del string del grado
                                  const matchGrade = !gradeFilter || s.grade?.toString().includes(gradeFilter);
                                  return matchSearch && matchGrade;
                                })
                                .map(s => (
                                 <div 
                                   key={s.id} onClick={() => toggleStudent(s.id)}
                                   className={`flex items-center justify-between p-5 rounded-2xl cursor-pointer transition-all border ${formData.selectedStudents.includes(s.id) ? 'bg-gold border-gold text-slate-950 font-black shadow-xl shadow-gold/20 scale-[1.02]' : isDarkMode ? 'bg-slate-900/50 border-slate-800 text-slate-300 hover:border-slate-600' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-slate-200 hover:shadow-md'}`}
                                 >
                                    <div className="flex flex-col">
                                       <span className="text-sm uppercase font-black tracking-tight">{s.full_name}</span>
                                       <div className="flex items-center gap-2 mt-1 opacity-70">
                                          <span className="text-[9px] font-black uppercase tracking-widest">{s.grade || 'Sin Año'}</span>
                                          <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                                          <span className="text-[9px] font-black uppercase tracking-widest">C.I: {s.id_card || '---'}</span>
                                       </div>
                                    </div>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${formData.selectedStudents.includes(s.id) ? 'bg-slate-900 text-gold' : 'bg-slate-200 dark:bg-slate-800 text-transparent'}`}>
                                      <Check size={16} />
                                    </div>
                                 </div>
                               ))}
                               {students.filter(s => {
                                  const matchSearch = !searchTerm || s.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || s.id_card?.includes(searchTerm);
                                  const matchGrade = !gradeFilter || s.grade?.toString().includes(gradeFilter);
                                  return matchSearch && matchGrade;
                               }).length === 0 && (
                                 <div className="py-20 text-center opacity-30">
                                   <Users size={48} className="mx-auto mb-4" />
                                   <p className="text-xs font-black uppercase tracking-widest">No hay resultados</p>
                                 </div>
                               )}
                            </div>
                          </div>
                        </div>
                    </div>
                  </div>

                  <div className="pt-6 border-t dark:border-slate-800">
                    <button type="submit" disabled={saving} className="w-full py-7 bg-vinotinto-600 text-white rounded-[2.5rem] font-black uppercase tracking-widest text-[13px] shadow-[0_20px_50px_-15px_rgba(59,9,20,0.6)] hover:bg-vinotinto-700 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-4">
                      {saving ? <Loader2 className="animate-spin" /> : <Save size={24} />}
                      {editingClass ? 'Actualizar Información de Materia' : 'Finalizar Registro de Materia'}
                    </button>
                  </div>
               </form>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestionClases;
