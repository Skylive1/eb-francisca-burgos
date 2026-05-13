import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { X, AlertTriangle, Clock, User, CheckCircle2, MessageSquare, Trash2 } from 'lucide-react';

const ModalBuzonReportes = ({ isOpen, onClose, isDarkMode, claseId }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && claseId) {
      fetchReports();
    }
  }, [isOpen, claseId]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      // Paso 1: Obtener todos los reportes de esta clase
      const { data: reportsData, error: reportsError } = await supabase
        .from('classroom_reports')
        .select('*')
        .eq('class_id', claseId)
        .order('created_at', { ascending: false });

      if (reportsError) {
        console.error('❌ Error RLS/DB al obtener reportes:', reportsError);
        setReports([]);
        return;
      }

      if (!reportsData || reportsData.length === 0) {
        console.log('ℹ️ No hay reportes para class_id:', claseId);
        setReports([]);
        return;
      }

      // Paso 2: Enriquecer con nombres de estudiantes por separado
      const studentIds = [...new Set(reportsData.map(r => r.student_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name')
        .in('id', studentIds);

      const profilesMap = {};
      (profilesData || []).forEach(p => { profilesMap[p.id] = p.full_name; });

      const enriched = reportsData.map(r => ({
        ...r,
        studentName: profilesMap[r.student_id] || 'Alumno'
      }));

      console.log('✅ Reportes cargados:', enriched.length, enriched);
      setReports(enriched);
    } catch (err) {
      console.error('❌ Error inesperado:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    try {
      const { error } = await supabase
        .from('classroom_reports')
        .update({ status: 'resolved' })
        .eq('id', id);

      if (error) throw error;
      fetchReports();
    } catch (err) {
      console.error("Error resolving report:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este reporte definitivamente?")) return;
    try {
      const { error } = await supabase
        .from('classroom_reports')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchReports();
    } catch (err) {
      console.error("Error deleting report:", err);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 md:p-10">
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
          onClick={onClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
        />
        
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} 
          className={`relative w-full max-w-4xl rounded-[3rem] border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
        >
          {/* Header */}
          <div className={`p-8 border-b flex justify-between items-center ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-100 bg-slate-50'}`}>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-rose-500/20">
                <MessageSquare size={24} />
              </div>
              <div>
                <h3 className={`text-2xl font-black uppercase italic tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Buzón de Reportes</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Incidencias técnicas reportadas por alumnos</p>
              </div>
            </div>
            <button onClick={onClose} className={`p-4 rounded-2xl transition-all ${isDarkMode ? 'hover:bg-slate-800 text-slate-500' : 'hover:bg-slate-200 text-slate-400'}`}>
              <X size={24} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-10 h-10 border-4 border-rose-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sincronizando incidencias...</p>
              </div>
            ) : reports.length === 0 ? (
              <div className="text-center py-20 space-y-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <CheckCircle2 size={40} />
                </div>
                <h4 className="text-xl font-black text-slate-300 uppercase italic">¡Todo en orden!</h4>
                <p className="text-sm font-bold text-slate-400">No hay reportes técnicos pendientes en esta clase.</p>
              </div>
            ) : (
              <div className="grid gap-6">
                {reports.map((report) => (
                  <div key={report.id} className={`p-6 rounded-[2.5rem] border-2 transition-all ${report.status === 'resolved' ? 'opacity-60 grayscale' : ''} ${isDarkMode ? 'bg-slate-800/30 border-slate-800' : 'bg-white border-slate-100 shadow-sm'}`}>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="flex items-start gap-5">
                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${report.status === 'resolved' ? 'bg-slate-500' : 'bg-rose-500'} text-white`}>
                          <AlertTriangle size={24} />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-lg bg-rose-500/10 text-rose-500 text-[9px] font-black uppercase tracking-widest border border-rose-500/20">
                              {report.issue_type}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                              <Clock size={12} /> {new Date(report.created_at).toLocaleString()}
                            </span>
                          </div>
                          <h4 className={`text-lg font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                            Actividad: {report.item_title}
                          </h4>
                          <p className="text-sm font-bold text-slate-500 flex items-center gap-2 italic">
                            <User size={14} className="text-slate-400" /> {report.profiles?.full_name || 'Alumno'}
                          </p>
                          {report.description && (
                            <div className={`mt-4 p-4 rounded-2xl text-sm italic font-medium ${isDarkMode ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-50 text-slate-600 border border-slate-100'}`}>
                              "{report.description}"
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        {report.status !== 'resolved' && (
                          <button 
                            onClick={() => handleResolve(report.id)}
                            className="px-6 py-3 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
                          >
                            <CheckCircle2 size={16} /> Marcar Solucionado
                          </button>
                        )}
                        <button 
                          onClick={() => handleDelete(report.id)}
                          className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${isDarkMode ? 'bg-slate-800 text-slate-500 hover:text-rose-500' : 'bg-slate-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500'}`}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ModalBuzonReportes;
