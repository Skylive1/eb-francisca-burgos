import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, Shield, Search, Filter, Loader2, MessageCircle, 
  Clock, CheckCircle, AlertCircle, User, Info, MoreVertical,
  Flag, ArrowRight, Save, Send, X, FileText
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const GestionBienestar = ({ isDarkMode }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [showFollowUp, setShowFollowUp] = useState(false);
  const [followUpNote, setFollowUpNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  useEffect(() => {
    fetchReports();

    // SUSCRIPCIÓN EN TIEMPO REAL
    const channel = supabase
      .channel('wellness-updates')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'wellness_reports' 
      }, (payload) => {
        console.log('Nuevo reporte recibido!', payload);
        fetchReports(); // Recargamos para traer el perfil completo
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Unimos con profiles para obtener el nombre del estudiante
      const { data, error } = await supabase
        .from('wellness_reports')
        .select(`
          *,
          profiles:student_id (full_name, avatar_url, grade)
        `)
        .order('created_at', { ascending: false });

      console.log("📋 Wellness Reports - Data:", data, "Error:", error);
      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('❌ Error fetching wellness reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('wellness_reports')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) throw error;
      fetchReports();
      if (selectedReport?.id === id) {
        setSelectedReport(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const getStatusInfo = (status) => {
    switch(status) {
      case 'pending': return { color: 'bg-amber-500', text: 'Pendiente', icon: <Clock size={12} /> };
      case 'reviewed': return { color: 'bg-blue-500', text: 'Revisado', icon: <Info size={12} /> };
      case 'in_progress': return { color: 'bg-indigo-500', text: 'En Atención', icon: <Loader2 size={12} className="animate-spin" /> };
      case 'resolved': return { color: 'bg-emerald-500', text: 'Resuelto', icon: <CheckCircle size={12} /> };
      default: return { color: 'bg-gray-500', text: status, icon: null };
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'urgent': return 'bg-red-500/10 text-red-500 border-red-500/20';
      case 'high': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
      case 'normal': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const filteredReports = reports.filter(r => {
    const matchesSearch = 
      (r.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
       r.topic?.toLowerCase().includes(searchTerm.toLowerCase()) ||
       r.message?.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-8 pb-20">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center">
              <Heart size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Total Reportes</p>
              <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{reports.length}</p>
            </div>
          </div>
        </div>
        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-500 rounded-2xl flex items-center justify-center">
              <Clock size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Pendientes</p>
              <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{reports.filter(r => r.status === 'pending').length}</p>
            </div>
          </div>
        </div>
        <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/40'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center">
              <Shield size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Resueltos</p>
              <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{reports.filter(r => r.status === 'resolved').length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Buscar por estudiante o tema..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            className={`w-full border-2 rounded-2xl pl-12 pr-6 py-4 text-sm outline-none transition-all focus:border-rose-500 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          {['all', 'pending', 'in_progress', 'resolved'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${statusFilter === status ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30' : isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white border-2 border-slate-100 text-slate-500 hover:bg-slate-50'}`}
            >
              {status === 'all' ? 'Todos' : status === 'in_progress' ? 'Atención' : status === 'resolved' ? 'Listos' : 'Nuevos'}
            </button>
          ))}
        </div>
      </div>

      {/* Main List & Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* List */}
        <div className="lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 animate-spin text-rose-500" />
            </div>
          ) : filteredReports.length === 0 ? (
            <div className="text-center py-20 opacity-40 italic text-sm">No se encontraron reportes</div>
          ) : filteredReports.map(report => (
            <Motion.div
              key={report.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              onClick={() => setSelectedReport(report)}
              className={`p-6 rounded-[2rem] border cursor-pointer transition-all ${selectedReport?.id === report.id ? 'ring-2 ring-rose-500 border-transparent bg-rose-500/5' : isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-100 hover:border-rose-200'}`}
            >
              <div className="flex gap-4 items-start">
                <div className="relative">
                  <img 
                    src={report.is_anonymous ? '/anonymous-avatar.png' : report.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(report.profiles?.full_name || 'U')}&background=random`} 
                    alt="" 
                    className="w-12 h-12 rounded-xl object-cover"
                  />
                  {report.priority === 'urgent' && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-black truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {report.is_anonymous ? 'Estudiante Anónimo' : report.profiles?.full_name}
                    </h4>
                    <span className="text-[9px] text-gray-500 font-bold whitespace-nowrap">
                      {new Date(report.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[10px] text-rose-500 font-black uppercase tracking-widest mb-3 truncate">
                    Tema: {report.topic || 'General'}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[8px] font-black uppercase ${getStatusInfo(report.status).color} text-white`}>
                      {getStatusInfo(report.status).icon}
                      {getStatusInfo(report.status).text}
                    </span>
                  </div>
                </div>
              </div>
            </Motion.div>
          ))}
        </div>

        {/* Detail */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            {selectedReport ? (
              <Motion.div
                key={selectedReport.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`p-10 rounded-[3rem] border sticky top-10 ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-2xl'}`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg border-2 border-white">
                      <img 
                        src={selectedReport.is_anonymous ? '/anonymous-avatar.png' : selectedReport.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedReport.profiles?.full_name || 'U')}&background=random`} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {selectedReport.is_anonymous ? 'Estudiante Anónimo' : selectedReport.profiles?.full_name}
                      </h3>
                      <p className="text-xs text-gray-500 font-bold">{selectedReport.profiles?.grade || 'Información no disponible'}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                     <span className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase border ${getPriorityBadge(selectedReport.priority)}`}>
                        Prioridad {selectedReport.priority}
                     </span>
                  </div>
                </div>

                <div className={`p-8 rounded-3xl mb-8 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-2 mb-4">
                    <Flag size={14} className="text-rose-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-rose-500">Motivo del Reporte</span>
                  </div>
                  <h4 className={`text-lg font-bold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedReport.topic}</h4>
                  <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-400' : 'text-slate-600'}`}>
                    {selectedReport.message}
                  </p>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-2">Actualizar Estado</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {['pending', 'reviewed', 'in_progress', 'resolved'].map(st => (
                      <button
                        key={st}
                        onClick={() => updateStatus(selectedReport.id, st)}
                        className={`py-3 rounded-xl text-[8px] font-black uppercase tracking-widest border transition-all ${selectedReport.status === st ? 'bg-slate-900 text-white border-transparent' : isDarkMode ? 'bg-white/5 border-white/10 text-gray-500 hover:bg-white/10' : 'bg-white border-slate-100 text-gray-500 hover:bg-slate-50'}`}
                      >
                        {st === 'in_progress' ? 'Atendiendo' : st === 'resolved' ? 'Resuelto' : st === 'reviewed' ? 'Visto' : 'Pendiente'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* NOTAS EXISTENTES */}
                {selectedReport.admin_notes && (
                  <div className={`mt-8 p-6 rounded-2xl border-l-4 border-vinotinto-500 ${isDarkMode ? 'bg-vinotinto-500/10' : 'bg-vinotinto-50'}`}>
                    <div className="flex items-center gap-2 mb-3">
                      <FileText size={14} className="text-vinotinto-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-vinotinto-500">Nota de Seguimiento</span>
                    </div>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                      {selectedReport.admin_notes}
                    </p>
                  </div>
                )}

                {/* SECCIÓN DE SEGUIMIENTO */}
                <div className="mt-10 pt-10 border-t border-gray-500/10">
                  {!showFollowUp ? (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="flex items-center gap-2">
                        <MessageCircle size={16} className="text-vinotinto-500" />
                        <span className="text-xs font-bold text-gray-500">¿Necesitas contactar al estudiante?</span>
                      </div>
                      <div className="flex gap-3">
                        <button 
                          onClick={() => {
                            setShowFollowUp(true);
                            setFollowUpNote(selectedReport.admin_notes || '');
                          }}
                          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10 border border-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-slate-200'}`}
                        >
                          <FileText size={12} />
                          {selectedReport.admin_notes ? 'Editar Nota' : 'Nota Interna'}
                        </button>
                        <button 
                          onClick={() => {
                            setShowFollowUp(true);
                            setFollowUpNote('');
                          }}
                          className="flex items-center gap-2 px-5 py-2.5 bg-vinotinto-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-vinotinto-700 active:scale-95 transition-all"
                        >
                          <Send size={12} />
                          Contactar Estudiante
                        </button>
                      </div>
                    </div>
                  ) : (
                    <Motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Send size={14} className="text-vinotinto-500" />
                          <span className="text-[10px] font-black uppercase tracking-widest text-vinotinto-500">Escribir Mensaje</span>
                        </div>
                        <button onClick={() => setShowFollowUp(false)} className="text-gray-400 hover:text-red-500 transition-colors">
                          <X size={18} />
                        </button>
                      </div>
                      <textarea
                        value={followUpNote}
                        onChange={e => setFollowUpNote(e.target.value)}
                        placeholder="Escribe tu mensaje para el estudiante o una nota interna para el equipo de orientación..."
                        rows={4}
                        className={`w-full rounded-2xl p-5 text-sm font-medium outline-none resize-none border-2 transition-all focus:border-vinotinto-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-gray-600' : 'bg-slate-50 border-slate-100 text-slate-900 placeholder:text-slate-400'}`}
                      />
                      <div className="flex gap-3">
                        <button
                          onClick={() => setShowFollowUp(false)}
                          className={`py-3 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={async () => {
                            if (!followUpNote.trim()) return;
                            setSavingNote(true);
                            try {
                              const { error } = await supabase
                                .from('wellness_reports')
                                .update({ 
                                  admin_notes: followUpNote,
                                  status: selectedReport.status === 'pending' ? 'in_progress' : selectedReport.status
                                })
                                .eq('id', selectedReport.id);
                              
                              if (error) throw error;
                              
                              setSelectedReport(prev => ({ ...prev, admin_notes: followUpNote, status: prev.status === 'pending' ? 'in_progress' : prev.status }));
                              setShowFollowUp(false);
                              fetchReports();
                              alert('✅ Nota interna guardada');
                            } catch (err) {
                              alert('❌ Error: ' + err.message);
                            } finally {
                              setSavingNote(false);
                            }
                          }}
                          disabled={savingNote || !followUpNote.trim()}
                          className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 disabled:opacity-40 ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          {savingNote ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                          Solo Nota
                        </button>
                        <button
                          onClick={async () => {
                            if (!followUpNote.trim()) return;
                            if (selectedReport.is_anonymous) {
                              alert('⚠️ Este reporte es anónimo. No se puede enviar una notificación directa al estudiante.');
                              return;
                            }
                            setSavingNote(true);
                            try {
                              // 1. Guardar nota en el reporte
                              const { error: noteError } = await supabase
                                .from('wellness_reports')
                                .update({ 
                                  admin_notes: followUpNote,
                                  status: 'in_progress'
                                })
                                .eq('id', selectedReport.id);
                              
                              if (noteError) throw noteError;

                              // 2. Enviar notificación al estudiante
                              const { error: notifError } = await supabase
                                .from('notifications')
                                .insert({
                                  user_id: selectedReport.student_id,
                                  title: '💚 Mensaje del Equipo de Bienestar',
                                  message: followUpNote,
                                  type: 'wellness'
                                });
                              
                              if (notifError) throw notifError;

                              setSelectedReport(prev => ({ ...prev, admin_notes: followUpNote, status: 'in_progress' }));
                              setShowFollowUp(false);
                              fetchReports();
                              alert('✅ Mensaje enviado al estudiante y nota guardada');
                            } catch (err) {
                              console.error('Error:', err);
                              alert('❌ Error: ' + err.message);
                            } finally {
                              setSavingNote(false);
                            }
                          }}
                          disabled={savingNote || !followUpNote.trim() || selectedReport.is_anonymous}
                          className="flex-[2] py-3 bg-vinotinto-800 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-vinotinto-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-40"
                        >
                          {savingNote ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                          Enviar al Estudiante
                        </button>
                      </div>
                      {selectedReport.is_anonymous && (
                        <p className="text-[10px] text-amber-500 font-bold flex items-center gap-1.5 mt-2">
                          <AlertCircle size={12} /> Este reporte es anónimo. Solo puedes guardar notas internas.
                        </p>
                      )}
                    </Motion.div>
                  )}
                </div>
              </Motion.div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                <Heart size={80} className="mb-6" />
                <p className="text-sm font-black uppercase tracking-[0.2em]">Selecciona un reporte para ver los detalles</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default GestionBienestar;
