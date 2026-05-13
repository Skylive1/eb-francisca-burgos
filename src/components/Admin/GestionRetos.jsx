import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  Plus, 
  Trash2, 
  Calendar, 
  Target,
  Save,
  Loader2,
  Users
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const GestionRetos = () => {
  const [challenges, setChallenges] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    month_year: '',
    ends_at: '',
    is_active: true
  });

  const [participants, setParticipants] = useState({}); // Mapeo de retoId -> lista de participantes
  const [loadingParticipants, setLoadingParticipants] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: challengesData } = await supabase
        .from('challenges')
        .select('*')
        .order('created_at', { ascending: false });
      
      const { data: studentsData } = await supabase
        .from('profiles')
        .select('id, full_name, role')
        .eq('role', 'student');

      setChallenges(challengesData || []);
      setStudents(studentsData || []);
      
      // Intentar cargar participaciones si existe la tabla
      const { data: submissions } = await supabase.from('challenge_submissions').select('*, profiles(full_name)');
      if (submissions) {
        const grouped = submissions.reduce((acc, curr) => {
          if (!acc[curr.challenge_id]) acc[curr.challenge_id] = [];
          acc[curr.challenge_id].push(curr);
          return acc;
        }, {});
        setParticipants(grouped);
      }
    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let error;
      const dataToSave = {
        ...formData,
        winner_1: formData.winner_1 || null,
        winner_2: formData.winner_2 || null,
        winner_3: formData.winner_3 || null,
      };

      if (editingChallenge) {
        ({ error } = await supabase.from('challenges').update(dataToSave).eq('id', editingChallenge.id));
      } else {
        ({ error } = await supabase.from('challenges').insert([dataToSave]));
      }

      if (error) throw error;
      setShowModal(false);
      setEditingChallenge(null);
      setFormData({ title: '', description: '', month_year: '', ends_at: '', is_active: true, winner_1: '', winner_2: '', winner_3: '' });
      fetchData();
      alert('Reto guardado con éxito');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este reto permanentemente?')) return;
    await supabase.from('challenges').delete().eq('id', id);
    fetchData();
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Gestión de Retos Institucionales</h3>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">Gamificación, Desafíos y Menciones Especiales</p>
        </div>
        <button 
          onClick={() => { setEditingChallenge(null); setFormData({ title: '', description: '', month_year: '', ends_at: '', is_active: true, winner_1: '', winner_2: '', winner_3: '' }); setShowModal(true); }}
          className="px-8 py-5 bg-gold text-vinotinto-950 rounded-2xl font-black uppercase tracking-widest text-[11px] hover:scale-105 transition-all shadow-xl shadow-gold/20 flex items-center gap-3"
        >
          <Plus size={20} /> Crear Nuevo Desafío
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="w-12 h-12 animate-spin text-gold mx-auto" /></div>
        ) : challenges.length === 0 ? (
          <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem]">
            <Trophy className="w-16 h-16 text-white/5 mx-auto mb-4" />
            <p className="text-white/20 font-black uppercase tracking-widest text-sm">No hay retos registrados</p>
          </div>
        ) : challenges.map(challenge => (
          <Motion.div 
            key={challenge.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur-xl rounded-[3rem] border border-white/10 p-10 flex flex-col xl:flex-row justify-between items-center gap-8 group hover:bg-white/[0.07] transition-all"
          >
            <div className="flex items-center gap-8 w-full xl:w-auto">
              <div className="w-20 h-20 bg-gold/10 rounded-[2rem] flex items-center justify-center text-gold shadow-inner group-hover:scale-110 transition-transform">
                <Trophy size={40} />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-[10px] font-black uppercase tracking-widest border border-gold/30">{challenge.month_year}</span>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${challenge.is_active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}`}>
                    {challenge.is_active ? '● Activo' : '○ Finalizado'}
                  </span>
                </div>
                <h4 className="text-2xl font-black text-white uppercase tracking-tight italic">{challenge.title}</h4>
                <p className="text-xs text-gray-500 font-bold mt-1 line-clamp-1 max-w-xl">"{challenge.description}"</p>
                
                {/* Visualización de Ganadores en la lista */}
                {(challenge.winner_1 || challenge.winner_2 || challenge.winner_3) && (
                  <div className="flex gap-4 mt-4 pt-4 border-t border-white/5">
                    {[
                      { id: challenge.winner_1, label: '1er', color: 'text-gold' },
                      { id: challenge.winner_2, label: '2do', color: 'text-slate-300' },
                      { id: challenge.winner_3, label: '3er', color: 'text-amber-600' }
                    ].map((w, idx) => w.id && (
                      <div key={idx} className="flex items-center gap-2">
                        <span className={`text-[9px] font-black ${w.color} uppercase`}>{w.label}:</span>
                        <span className="text-[10px] text-white/60 font-bold">{students.find(s => s.id === w.id)?.full_name || 'Cargando...'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 w-full xl:w-auto justify-end">
               <div className="hidden sm:flex flex-col items-end mr-4">
                 <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Participantes</p>
                 <p className="text-xl font-black text-white">{(participants[challenge.id] || []).length}</p>
               </div>
               <button 
                onClick={() => { setEditingChallenge(challenge); setFormData({ ...challenge, winner_1: challenge.winner_1 || '', winner_2: challenge.winner_2 || '', winner_3: challenge.winner_3 || '' }); setShowModal(true); }}
                className="px-8 py-4 bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gold hover:text-vinotinto-950 transition-all shadow-lg"
              >
                Configurar y Ganadores
              </button>
               <button 
                onClick={() => handleDelete(challenge.id)}
                className="p-4 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-lg"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </Motion.div>
        ))}
      </div>

      {/* MODAL DE EDICIÓN / CREACIÓN */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/90 backdrop-blur-xl" />
            <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative w-full max-w-4xl bg-[#0f1115] rounded-[4rem] border border-white/10 p-12 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl">
               <form onSubmit={handleSubmit} className="space-y-10">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gold/20 rounded-2xl flex items-center justify-center text-gold">
                        <Target size={24} />
                      </div>
                      <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">{editingChallenge ? 'Editar' : 'Nuevo'} Reto del Mes</h3>
                    </div>
                    <button type="button" onClick={() => setShowModal(false)} className="text-slate-500 hover:text-white"><X size={32} /></button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gold uppercase tracking-[0.3em] border-b border-gold/20 pb-2">Información Básica</h4>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Título del Reto</label>
                        <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-gold outline-none transition-all" placeholder="Ej: Desafío de Lógica Matemática" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Mes / Período</label>
                          <input required value={formData.month_year} onChange={(e) => setFormData({...formData, month_year: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-gold outline-none transition-all" placeholder="Junio 2026" />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Fecha de Cierre</label>
                          <input type="datetime-local" required value={formData.ends_at} onChange={(e) => setFormData({...formData, ends_at: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-gold outline-none transition-all" />
                        </div>
                      </div>
                      <div>
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block">Descripción Detallada</label>
                        <textarea required value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white h-40 resize-none focus:border-gold outline-none transition-all" placeholder="Escribe el problema o instrucciones aquí..." />
                      </div>
                      <div className="flex items-center gap-4 p-6 bg-white/5 rounded-3xl border border-white/10">
                        <input type="checkbox" id="is_active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-6 h-6 accent-gold cursor-pointer" />
                        <label htmlFor="is_active" className="text-xs font-black text-white uppercase cursor-pointer">Reto Visible para Estudiantes</label>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <h4 className="text-[10px] font-black text-gold uppercase tracking-[0.3em] border-b border-gold/20 pb-2">Selección de Ganadores (Mención Especial)</h4>
                      
                      {[
                        { key: 'winner_1', label: '1er Lugar (Oro)', icon: <Trophy className="text-gold" /> },
                        { key: 'winner_2', label: '2do Lugar (Plata)', icon: <Trophy className="text-slate-400" /> },
                        { key: 'winner_3', label: '3er Lugar (Bronce)', icon: <Trophy className="text-amber-700" /> }
                      ].map((winner, idx) => (
                        <div key={idx}>
                          <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1 mb-2 block flex items-center gap-2">
                            {winner.icon} {winner.label}
                          </label>
                          <select 
                            value={formData[winner.key] || ''} 
                            onChange={(e) => setFormData({...formData, [winner.key]: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm text-white focus:border-gold outline-none transition-all appearance-none"
                          >
                            <option value="">-- Sin asignar --</option>
                            {students.map(s => (
                              <option key={s.id} value={s.id}>{s.full_name}</option>
                            ))}
                          </select>
                        </div>
                      ))}

                      <div className="mt-8 p-6 bg-vinotinto-900/20 rounded-3xl border border-vinotinto-500/20">
                         <p className="text-[10px] text-vinotinto-400 font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Users size={14} /> Nota para el Admin
                         </p>
                         <p className="text-[11px] text-slate-400 leading-relaxed font-medium italic">
                           Al asignar un ganador, su nombre aparecerá automáticamente en el "Podio de Honor" de los estudiantes, otorgándoles la mención especial del mes.
                         </p>
                      </div>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="w-full py-6 bg-gold text-vinotinto-950 rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {editingChallenge ? 'Guardar Cambios del Reto' : 'Publicar Reto Institucional'}
                  </button>
               </form>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestionRetos;
