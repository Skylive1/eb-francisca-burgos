import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { Users, Search, Loader2, Hash, GraduationCap, UserCircle } from 'lucide-react';

const GestorEstudiantes = ({ clase, isDarkMode }) => {
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('');

  useEffect(() => {
    const fetchEstudiantes = async () => {
      if (!clase?.id) return;
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('subject_enrollments')
          .select(`
            student_id,
            profiles:student_id (
              id,
              full_name,
              id_card,
              grade,
              avatar_url
            )
          `)
          .eq('class_id', clase.id);

        if (error) throw error;
        
        // Formatear datos
        const lista = data.map(item => item.profiles).filter(p => p !== null);
        setEstudiantes(lista);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEstudiantes();
  }, [clase]);

  const filtrados = estudiantes.filter(e => 
    e.full_name?.toLowerCase().includes(filtro.toLowerCase()) || 
    e.id_card?.includes(filtro)
  );

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-vinotinto-800 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900 uppercase italic tracking-tighter leading-none">Estudiantes Inscritos</h3>
            <p className="text-[10px] font-bold text-vinotinto-600 uppercase tracking-widest mt-1">
              Total: {estudiantes.length} alumnos en esta materia
            </p>
          </div>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..." 
            value={filtro} 
            onChange={e => setFiltro(e.target.value)}
            className={`w-full pl-12 pr-6 py-4 rounded-2xl border-2 outline-none transition-all focus:border-vinotinto-800 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-gray-100 text-gray-900'}`}
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-vinotinto-800" />
        </div>
      ) : filtrados.length === 0 ? (
        <div className="py-20 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border-2 border-dashed border-gray-200">
          <p className="text-gray-400 font-bold italic">No se encontraron estudiantes para los criterios de búsqueda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtrados.map((estudiante, i) => (
            <Motion.div
              key={estudiante.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className={`p-6 rounded-[2.5rem] border transition-all hover:shadow-2xl hover:-translate-y-1 group ${isDarkMode ? 'bg-slate-900/80 border-slate-800 hover:bg-slate-800' : 'bg-white border-gray-100 hover:border-vinotinto-100'}`}
            >
              <div className="flex items-center gap-5">
                <div className="relative">
                  <img 
                    src={estudiante.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(estudiante.full_name)}&background=random`} 
                    alt={estudiante.full_name} 
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md group-hover:scale-110 transition-transform"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-[10px] text-white font-black">
                    ✓
                  </div>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className={`text-lg font-black uppercase italic tracking-tighter truncate leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                    {estudiante.full_name}
                  </h4>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-[9px] font-black text-gray-400 uppercase tracking-widest">
                      <Hash className="w-3 h-3" /> {estudiante.id_card || 'S/N'}
                    </span>
                    <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                    <span className="flex items-center gap-1 text-[9px] font-black text-vinotinto-600 uppercase tracking-widest">
                      <GraduationCap className="w-3 h-3" /> {estudiante.grade || 'S/N'}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-50 flex justify-between items-center">
                <button className="flex items-center gap-2 text-[10px] font-black text-gray-400 hover:text-vinotinto-800 transition-colors uppercase tracking-widest">
                  <UserCircle className="w-4 h-4" /> Perfil Completo
                </button>
                <div className="w-8 h-8 rounded-full bg-vinotinto-50 flex items-center justify-center text-vinotinto-800 opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </Motion.div>
          ))}
        </div>
      )}
    </Motion.div>
  );
};

export default GestorEstudiantes;
