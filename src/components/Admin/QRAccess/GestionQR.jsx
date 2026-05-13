import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../../lib/supabaseClient';
import { 
  CreditCard, 
  Calendar, 
  Bell, 
  Search, 
  Download, 
  Users, 
  Clock, 
  ShieldCheck, 
  QrCode,
  User,
  Filter,
  CheckCircle2,
  XCircle,
  Loader2,
  ExternalLink,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const GestionQR = ({ isDarkMode, initialTab = 'generar' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'generar', 'historial', 'notificaciones'
  
  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const [students, setStudents] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStudents, setSelectedStudents] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({ parent_name: '', parent_phone: '' });

  useEffect(() => {
    fetchStudents();
    fetchLogs();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('full_name', { ascending: true });
      if (error) throw error;
      setStudents(data || []);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('qr_access_logs')
        .select(`
          *,
          profiles:student_id (full_name, id_card, grade)
        `)
        .order('created_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setLogs(data || []);
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  const handleEditRepresentative = (student) => {
    setEditingStudent(student);
    setEditForm({
      parent_name: student.parent_name || '',
      parent_phone: student.parent_phone || ''
    });
  };

  const saveRepresentative = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          parent_name: editForm.parent_name,
          parent_phone: editForm.parent_phone
        })
        .eq('id', editingStudent.id);
      
      if (error) throw error;
      alert('Datos del representante guardados correctamente.');
      setEditingStudent(null);
      fetchStudents();
    } catch (error) {
      console.error(error);
      alert('Error al guardar los datos.');
    } finally {
      setLoading(false);
    }
  };

  const syncRepresentatives = async () => {
    setLoading(true);
    try {
      const { data: enrollments } = await supabase.from('enrollments').select('*');
      if (!enrollments) return;

      for (const enr of enrollments) {
        if (enr.student_id_card && enr.student_id_card !== 'N/A') {
          await supabase
            .from('profiles')
            .update({ 
              parent_name: enr.representative_name,
              parent_phone: enr.representative_phone 
            })
            .eq('id_card', enr.student_id_card)
            .eq('role', 'student');
        }
      }
      alert('Sincronización Exitosa: Números de WhatsApp vinculados.');
      fetchStudents();
    } catch (error) {
      console.error(error);
      alert('Error al sincronizar.');
    } finally {
      setLoading(false);
    }
  };

  const toggleStudentSelection = (id) => {
    setSelectedStudents(prev => 
      prev.includes(id) ? prev.filter(sId => sId !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedStudents.length === filteredStudents.length) {
      setSelectedStudents([]);
    } else {
      setSelectedStudents(filteredStudents.map(s => s.id));
    }
  };

  const filteredStudents = students.filter(s => 
    s.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    s.id_card?.includes(search)
  );

  const downloadPDF = async () => {
    const element = document.getElementById('carnets-container');
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff'
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('Carnets_Estudiantes.pdf');
  };

  const renderGenerar = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 backdrop-blur-xl p-6 rounded-[2rem] border border-white/10">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input 
            type="text" 
            placeholder="Buscar estudiante..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-indigo-500 outline-none text-sm transition-all"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={syncRepresentatives}
            className="px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg flex-1 md:flex-none flex items-center justify-center gap-2"
          >
            <Users size={14} />
            Sincronizar Repres.
          </button>
          <button 
            onClick={selectAll}
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-xs font-bold hover:bg-white/10 transition-all flex-1 md:flex-none"
          >
            {selectedStudents.length === filteredStudents.length ? 'Desmarcar Todos' : 'Seleccionar Todos'}
          </button>
          <button 
            disabled={selectedStudents.length === 0}
            onClick={() => setGenerating(true)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-indigo-500/20 flex-1 md:flex-none"
          >
            Generar {selectedStudents.length} Carnets
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-20 text-center">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto" />
          </div>
        ) : filteredStudents.map(student => (
          <div 
            key={student.id}
            onClick={() => toggleStudentSelection(student.id)}
            className={`p-4 rounded-2xl border cursor-pointer transition-all ${
              selectedStudents.includes(student.id)
                ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/20'
                : 'bg-white/5 border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black">
                {student.full_name?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold truncate">{student.full_name}</h4>
                  <button 
                    onClick={(e) => { e.stopPropagation(); handleEditRepresentative(student); }}
                    className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-indigo-400 transition-all"
                  >
                    <User size={14} />
                  </button>
                </div>
                <p className="text-[10px] text-gray-400 font-medium">CI: {student.id_card || 'N/A'}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">{student.grade || 'Sin grado'}</p>
                  {student.parent_phone && <ShieldCheck size={12} className="text-emerald-500" />}
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                selectedStudents.includes(student.id) ? 'bg-indigo-500 border-indigo-500' : 'border-white/20'
              }`}>
                {selectedStudents.includes(student.id) && <CheckCircle2 className="w-3 h-3 text-white" />}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL EDICIÓN REPRESENTANTE */}
      <AnimatePresence>
        {editingStudent && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditingStudent(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border ${
                isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <h3 className={`text-xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Vincular Representante</h3>
              <p className="text-xs text-slate-500 mb-6 font-medium">Alumno: {editingStudent.full_name}</p>
              
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Nombre del Representante</label>
                  <input 
                    type="text" 
                    value={editForm.parent_name}
                    onChange={(e) => setEditForm({...editForm, parent_name: e.target.value})}
                    placeholder="Ej. Juan Pérez"
                    className={`w-full px-4 py-3 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none text-sm font-bold ${
                      isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">WhatsApp del Representante</label>
                  <input 
                    type="tel" 
                    value={editForm.parent_phone}
                    onChange={(e) => setEditForm({...editForm, parent_phone: e.target.value})}
                    placeholder="Ej. +584121234567"
                    className={`w-full px-4 py-3 rounded-xl focus:ring-2 ring-indigo-500/20 outline-none text-sm font-bold ${
                      isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                  <p className="text-[9px] text-indigo-400 mt-2 font-bold uppercase tracking-widest">Incluye el código de país (Ej: 58412...)</p>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setEditingStudent(null)}
                  className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  Cancelar
                </button>
                <button 
                  onClick={saveRepresentative}
                  className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-500/20"
                >
                  Guardar Datos
                </button>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL GENERADOR */}
      <AnimatePresence>
        {generating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setGenerating(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className={`relative w-full max-w-4xl rounded-[3rem] p-8 max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border ${
                isDarkMode ? 'bg-slate-900 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className={`text-2xl font-black italic uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Carnets Digitales</h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">Se han generado {selectedStudents.length} carnets listos para imprimir.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={downloadPDF} 
                    className="flex items-center gap-2 px-6 py-4 bg-emerald-600 text-white rounded-2xl hover:bg-emerald-700 transition-all shadow-lg"
                  >
                    <Download size={20} />
                    <span className="text-xs font-black uppercase tracking-widest">Descargar PDF</span>
                  </button>
                  <button onClick={() => window.print()} className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 transition-all shadow-lg">
                    <QrCode size={20} />
                  </button>
                  <button onClick={() => setGenerating(false)} className={`p-4 rounded-2xl transition-all ${
                    isDarkMode ? 'bg-white/5 text-gray-400 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}>
                    <XCircle size={20} />
                  </button>
                </div>
              </div>

              <div id="carnets-container" className={`grid grid-cols-1 md:grid-cols-2 gap-6 p-4 rounded-3xl ${
                isDarkMode ? 'bg-slate-800' : 'bg-white'
              }`}>
                {students.filter(s => selectedStudents.includes(s.id)).map(student => (
                  <div key={student.id} className={`p-6 border-2 rounded-3xl flex gap-6 relative overflow-hidden group ${
                    isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-indigo-100'
                  }`}>
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
                    <div className="w-32 h-32 bg-white p-3 rounded-2xl shadow-sm border border-indigo-50 relative z-10">
                      <QRCodeCanvas 
                        value={`QR_ACCESS_TOKEN:${student.id}:${student.id_card}`} 
                        size={120} 
                        level="H"
                        includeMargin={false}
                      />
                    </div>
                    <div className="flex-1 space-y-2 relative z-10">
                      <div className="flex items-center gap-2 mb-2">
                         <QrCode size={14} className="text-indigo-600" />
                         <span className="text-[9px] font-black uppercase tracking-widest text-indigo-400">ID Estudiantil</span>
                      </div>
                      <h4 className={`text-lg font-black uppercase leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{student.full_name}</h4>
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                          <span>Cédula:</span>
                          <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>{student.id_card || 'N/A'}</span>
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                          <span>Grado:</span>
                          <span className="text-indigo-600">{student.grade || 'S/N'}</span>
                        </p>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex justify-between">
                          <span>Institución:</span>
                          <span className={isDarkMode ? 'text-white' : 'text-slate-900'}>Francisca Elena</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <style>{`
                @media print {
                  body * { visibility: hidden; }
                  .fixed.inset-0, .fixed.inset-0 * { visibility: visible; }
                  .fixed.inset-0 { position: absolute; left: 0; top: 0; }
                  button, .bg-black/80 { display: none !important; }
                  .max-w-4xl { max-width: 100% !important; padding: 0 !important; }
                  .custom-scrollbar { overflow: visible !important; }
                }
              `}</style>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderHistorial = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white/5 p-6 rounded-[2rem] border border-white/10">
        <div>
          <h3 className="text-lg font-black italic uppercase">Registros de Acceso</h3>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Últimos 50 movimientos detectados</p>
        </div>
        <button onClick={fetchLogs} className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all">
          <Clock size={18} />
        </button>
      </div>

      <div className="bg-white/5 rounded-[2.5rem] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Estudiante</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Grado</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Fecha y Hora</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-right">Estatus</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-20 text-center text-gray-500 italic text-sm">No hay registros de acceso hoy</td>
                </tr>
              ) : logs.map(log => (
                <tr key={log.id} className="hover:bg-white/5 transition-all group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold">
                        {log.profiles?.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold">{log.profiles?.full_name}</p>
                        <p className="text-[10px] text-gray-500 font-medium">CI: {log.profiles?.id_card}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-xs font-bold text-gray-400 uppercase tracking-widest">
                    {log.profiles?.grade}
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold">{new Date(log.created_at).toLocaleDateString()}</p>
                    <p className="text-[10px] text-indigo-400 font-black uppercase">{new Date(log.created_at).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[9px] font-black uppercase tracking-widest border border-emerald-500/20">
                      Entrada Exitosa
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderNotificaciones = () => (
    <div className="py-20 text-center space-y-6 max-w-lg mx-auto">
      <div className="w-20 h-20 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-indigo-500/20">
        <Bell className="text-indigo-500 w-10 h-10 animate-bounce" />
      </div>
      <h3 className="text-2xl font-black italic uppercase">Sistema de Notificaciones</h3>
      <p className="text-sm text-gray-500 leading-relaxed">
        El sistema está configurado para enviar notificaciones automáticas al representante cada vez que el estudiante escanea su carnet en la puerta principal.
      </p>
      <div className="grid grid-cols-1 gap-4 text-left">
        <div className="p-6 bg-white/5 border border-white/10 rounded-3xl space-y-2">
          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Ejemplo de Alerta</p>
          <p className="text-sm font-bold text-gray-200">"Campus Digital: El estudiante Juan Pérez ha ingresado a la institución a las 07:15 AM"</p>
        </div>
      </div>
      <button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
        Configurar Destinatarios
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* TABS SELECTOR */}
      <div className="flex gap-1 bg-white/5 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10 mb-8 max-w-fit mx-auto md:mx-0">
        {[
          { id: 'generar', label: 'Generar Carnets', icon: <CreditCard size={14} /> },
          { id: 'historial', label: 'Historial', icon: <Calendar size={14} /> },
          { id: 'notificaciones', label: 'Notificaciones', icon: <Bell size={14} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-3 transition-all ${
              activeTab === tab.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      <Motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'generar' && renderGenerar()}
        {activeTab === 'historial' && renderHistorial()}
        {activeTab === 'notificaciones' && renderNotificaciones()}
      </Motion.div>
    </div>
  );
};

export default GestionQR;
