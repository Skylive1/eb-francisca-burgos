import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Search, 
  Filter, 
  Clock, 
  Download,
  FileText,
  User,
  Phone,
  Mail,
  ShieldCheck,
  Loader2,
  ExternalLink,
  GraduationCap,
  Users,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const GestorInscripciones = ({ isDarkMode }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('enrollments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setEnrollments(data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('enrollments')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setEnrollments(enrollments.map(e => e.id === id ? { ...e, status: newStatus } : e));
      if (selectedEnrollment?.id === id) {
        setSelectedEnrollment({ ...selectedEnrollment, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Error al actualizar estado: ' + error.message);
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = enrollments.filter(e => {
    const matchesSearch = e.student_name?.toLowerCase().includes(search.toLowerCase()) || 
      e.student_id_card?.includes(search);
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: enrollments.length,
    pending: enrollments.filter(e => e.status === 'pending').length,
    approved: enrollments.filter(e => e.status === 'approved').length,
    rejected: enrollments.filter(e => e.status === 'rejected').length,
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'rejected': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'approved': return 'Aprobado';
      case 'rejected': return 'Rechazado';
      default: return 'Pendiente';
    }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total', value: stats.total, icon: <Users size={22} />, color: 'from-vinotinto-800 to-vinotinto-900', shadow: 'shadow-vinotinto-500/20' },
          { label: 'Pendientes', value: stats.pending, icon: <Clock size={22} />, color: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
          { label: 'Aprobados', value: stats.approved, icon: <CheckCircle2 size={22} />, color: 'from-emerald-500 to-green-600', shadow: 'shadow-emerald-500/20' },
          { label: 'Rechazados', value: stats.rejected, icon: <XCircle size={22} />, color: 'from-red-500 to-rose-600', shadow: 'shadow-red-500/20' },
        ].map((stat, i) => (
          <Motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`p-6 rounded-[2rem] border relative overflow-hidden group ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-xl'} ${stat.shadow}`}
          >
            <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${stat.color} opacity-5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4 group-hover:opacity-10 transition-opacity`}></div>
            <div className="relative z-10">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center text-white mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                {stat.icon}
              </div>
              <p className={`text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</p>
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.15em] mt-1">{stat.label}</p>
            </div>
          </Motion.div>
        ))}
      </div>

      {/* SEARCH & FILTERS */}
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o cédula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={`w-full pl-14 pr-6 py-4 rounded-2xl border-2 text-sm font-bold outline-none transition-all focus:border-vinotinto-500 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder:text-slate-600' : 'bg-white border-slate-100 text-slate-900 placeholder:text-slate-400'}`}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'pending', label: 'Pendientes' },
            { id: 'approved', label: 'Aprobados' },
            { id: 'rejected', label: 'Rechazados' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                statusFilter === f.id 
                  ? 'bg-vinotinto-800 text-white shadow-lg shadow-vinotinto-500/20' 
                  : isDarkMode 
                    ? 'bg-slate-800 text-slate-500 hover:bg-slate-700' 
                    : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'
              }`}
            >
              {f.label}
            </button>
          ))}
          <button 
            onClick={fetchEnrollments}
            className={`p-3 rounded-xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-50'}`}
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="w-12 h-12 animate-spin text-vinotinto-500 mx-auto mb-4" />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cargando solicitudes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="col-span-full py-20 text-center">
            <GraduationCap className={`w-16 h-16 mx-auto mb-4 ${isDarkMode ? 'text-slate-700' : 'text-slate-200'}`} />
            <p className={`text-sm font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-600' : 'text-slate-300'}`}>
              No hay solicitudes {statusFilter !== 'all' ? getStatusText(statusFilter).toLowerCase() + 's' : ''}
            </p>
          </div>
        ) : filtered.map((e, i) => (
          <Motion.div
            key={e.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedEnrollment(e)}
            className={`p-6 rounded-[2rem] border cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl group ${
              isDarkMode 
                ? 'bg-slate-900/50 border-slate-800 hover:border-vinotinto-500/30' 
                : 'bg-white border-slate-100 hover:border-vinotinto-200 shadow-lg shadow-slate-100/50'
            }`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-vinotinto-800 to-vinotinto-950 rounded-2xl flex items-center justify-center text-white font-black text-sm shadow-lg group-hover:scale-110 transition-transform">
                  {e.student_name?.charAt(0) || '?'}
                </div>
                <div>
                  <h4 className={`text-sm font-black tracking-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {e.student_name}
                  </h4>
                  <p className="text-[10px] font-bold text-gray-500">CI: {e.student_id_card}</p>
                </div>
              </div>
              <span className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${getStatusStyle(e.status)}`}>
                {getStatusText(e.status)}
              </span>
            </div>

            {/* Details */}
            <div className={`p-4 rounded-xl mb-4 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Grado</p>
                  <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{e.grade_to_enroll}</p>
                </div>
                <div>
                  <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">Fecha</p>
                  <p className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                    {new Date(e.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">{e.representative_phone || 'Sin tel.'}</span>
              </div>
              <button className={`p-2 rounded-xl transition-all group-hover:scale-110 ${isDarkMode ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-vinotinto-50 hover:text-vinotinto-800'}`}>
                <Eye size={16} />
              </button>
            </div>
          </Motion.div>
        ))}
      </div>

      {/* MODAL DE DETALLE */}
      <AnimatePresence>
        {selectedEnrollment && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEnrollment(null)}
              className="absolute inset-0 bg-black/70 backdrop-blur-md"
            />
            
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className={`relative w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}
            >
              {/* Sidebar Info */}
              <div className="md:w-80 bg-gradient-to-b from-vinotinto-800 to-vinotinto-950 p-10 text-white relative overflow-hidden">
                <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full blur-[80px] -translate-x-1/2 -translate-y-1/2"></div>
                
                <div className="relative z-10 space-y-8">
                  <div className="w-16 h-16 bg-white/10 rounded-[1.5rem] flex items-center justify-center border border-white/20">
                    <GraduationCap className="text-gold" size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black italic leading-tight uppercase mb-2">Expediente</h3>
                    <p className="text-[10px] text-white/50 font-black uppercase tracking-widest">Revisión Detallada</p>
                  </div>

                  <div className="space-y-4 pt-6 border-t border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Phone size={14} className="text-gold/60" />
                      </div>
                      <span className="text-[11px] font-bold">{selectedEnrollment.representative_phone || 'No registra'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <Mail size={14} className="text-gold/60" />
                      </div>
                      <span className="text-[11px] font-bold lowercase">{selectedEnrollment.representative_email || 'No registra'}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                        <GraduationCap size={14} className="text-gold/60" />
                      </div>
                      <span className="text-[11px] font-bold uppercase">{selectedEnrollment.grade_to_enroll}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contenido Principal */}
              <div className={`flex-1 p-10 md:p-14 relative max-h-[80vh] overflow-y-auto custom-scrollbar ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
                <div className="flex justify-between items-start mb-10">
                  <div>
                    <h4 className={`text-3xl font-black italic tracking-tighter uppercase mb-3 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {selectedEnrollment.student_name}
                    </h4>
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${getStatusStyle(selectedEnrollment.status)}`}>
                      {selectedEnrollment.status === 'pending' ? 'Pendiente por Validar' : selectedEnrollment.status === 'approved' ? 'Inscripción Aprobada' : 'Solicitud Rechazada'}
                    </span>
                  </div>
                  <button 
                    onClick={() => setSelectedEnrollment(null)}
                    className="p-3 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <XCircle size={28} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-vinotinto-500 uppercase tracking-widest border-l-4 border-vinotinto-500 pl-3">Representante Legal</h5>
                    <div className="space-y-4">
                      <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Nombre Completo</p>
                        <p className={`text-xs font-black uppercase ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEnrollment.representative_name}</p>
                      </div>
                      <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
                        <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">Cédula de Identidad</p>
                        <p className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{selectedEnrollment.representative_id_card}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <h5 className="text-[10px] font-black text-emerald-500 uppercase tracking-widest border-l-4 border-emerald-500 pl-3">Información de Pago</h5>
                    <div className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-emerald-50 border-emerald-100'}`}>
                      <p className="text-[9px] text-emerald-600 font-black uppercase tracking-widest mb-1">Referencia Bancaria</p>
                      <p className={`text-lg font-black italic tracking-tight ${isDarkMode ? 'text-emerald-400' : 'text-emerald-900'}`}>{selectedEnrollment.payment_reference || 'N/A'}</p>
                    </div>
                  </div>
                </div>

                {/* Documentos */}
                <div className="mt-12 space-y-6">
                  <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-l-4 border-gray-300 pl-3">Expediente Digital</h5>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { label: 'Constancia Cupo', url: selectedEnrollment.cupo_file_url },
                      { label: 'Partida Nac.', url: selectedEnrollment.partida_file_url },
                      { label: 'Comprobante Pago', url: selectedEnrollment.pago_file_url }
                    ].map((doc, idx) => (
                      <a 
                        key={idx}
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className={`p-5 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 group transition-all ${
                          doc.url 
                            ? isDarkMode 
                              ? 'border-vinotinto-500/30 bg-vinotinto-500/5 hover:bg-vinotinto-500/10' 
                              : 'border-vinotinto-200 bg-vinotinto-50 hover:bg-vinotinto-100' 
                            : isDarkMode
                              ? 'border-slate-800 bg-slate-800/50 opacity-40 pointer-events-none'
                              : 'border-gray-100 bg-gray-50 opacity-40 pointer-events-none'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isDarkMode ? 'bg-slate-800 text-vinotinto-400' : 'bg-white text-vinotinto-800'}`}>
                          {doc.url ? <FileText size={20} /> : <Clock size={20} />}
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-center">{doc.label}</span>
                        {doc.url && <ExternalLink size={12} className="text-vinotinto-400" />}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Acciones */}
                <div className="mt-12 pt-8 border-t border-gray-500/10 flex flex-col sm:flex-row gap-4">
                  <button 
                    disabled={actionLoading || selectedEnrollment.status === 'approved'}
                    onClick={() => handleUpdateStatus(selectedEnrollment.id, 'approved')}
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={18} />}
                    Aprobar Inscripción
                  </button>
                  <button 
                    disabled={actionLoading || selectedEnrollment.status === 'rejected'}
                    onClick={() => handleUpdateStatus(selectedEnrollment.id, 'rejected')}
                    className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-xs transition-all flex items-center justify-center gap-3 disabled:opacity-30 active:scale-95 ${isDarkMode ? 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20' : 'bg-white border-2 border-red-100 text-red-600 hover:bg-red-50'}`}
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : <XCircle size={18} />}
                    Rechazar Solicitud
                  </button>
                </div>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestorInscripciones;
