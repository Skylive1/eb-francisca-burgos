import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  Users, 
  LayoutDashboard, 
  Newspaper, 
  ShoppingCart, 
  HeartHandshake, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  Video,
  CheckCircle2,
  Save
} from 'lucide-react';
import SidebarDashboard from '../Dashboard/SidebarDashboard';
import PieDePagina from '../Dashboard/PieDePagina';
import Cabecera from '../Dashboard/Cabecera';
import AIAssistantBubble from '../Dashboard/AIAssistantBubble';

import GestionUsuarios from './GestionUsuarios';
import GestionContenido from './GestionContenido';
import InventarioCafetin from './InventarioCafetin';
import CentroMensajes from './CentroMensajes';
import GestionClases from './GestionClases';
import GestionRetos from './GestionRetos';
import GestorInscripciones from '../Profesor/GestorInscripciones';
import GestionPerfil from '../Dashboard/GestionPerfil';
import EduStream from '../../dashboard/EduStream';
import CentroNotificaciones from '../Dashboard/CentroNotificaciones';
import VlogEscolar from '../Dashboard/VlogEscolar';
import GestionBienestar from './GestionBienestar';
import GestionQR from './QRAccess/GestionQR';
import { Heart as HeartIcon } from 'lucide-react';



const PanelAdmin = ({ onLogout, rol }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [counts, setCounts] = useState({ students: 0, enrollments: 0, mailbox: 0, totalUsers: 0 });
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [recentActivity, setRecentActivity] = useState([]);

  React.useEffect(() => {
    const verificarSesion = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const isDemo = localStorage.getItem('demo_session');
      if (!user && !isDemo) {
        onLogout(); 
      }
    };
    verificarSesion();
  }, [onLogout]);

  React.useEffect(() => {
    const fetchCounts = async () => {
      // Usuarios por Rol
      const { count: students } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'student');
      const { count: teachers } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'teacher');
      const { count: admins } = await supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'admin');
      const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
      
      // Buzón e Inscripciones
      const { count: enrollmentsCount } = await supabase.from('enrollments').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      const { count: wellnessCount } = await supabase.from('wellness_reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');
      
      // Finanzas Reales
      const { data: transData } = await supabase.from('transactions').select('amount, status, created_at');
      const totalIncome = transData?.filter(t => t.status === 'paid').reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      
      const startOfToday = new Date();
      startOfToday.setHours(0, 0, 0, 0);
      const todayIncome = transData?.filter(t => t.status === 'paid' && new Date(t.created_at) >= startOfToday).reduce((sum, t) => sum + (t.amount || 0), 0) || 0;

      // Solvencia (Porcentaje de alumnos sin deudas pendientes)
      const studentIds = (await supabase.from('profiles').select('id').eq('role', 'student')).data?.map(s => s.id) || [];
      const pendingTrans = transData?.filter(t => t.status === 'pending' || t.status === 'overdue').map(t => t.student_id);
      const solventStudents = studentIds.filter(id => !pendingTrans?.includes(id)).length;
      const solvencyRate = studentIds.length > 0 ? (solventStudents / studentIds.length) * 100 : 100;

      // Actividad de los últimos 7 días (Registros)
      const activityData = [0, 0, 0, 0, 0, 0, 0];
      const today = new Date();
      const last7Days = (await supabase.from('profiles').select('created_at')).data || [];
      
      last7Days.forEach(p => {
        const pDate = new Date(p.created_at);
        const diffDays = Math.floor((today.getTime() - pDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays < 7) {
          activityData[6 - diffDays]++;
        }
      });

      // --- FETCH RECENT ACTIVITY DATA ---
      const { data: recentEnrollments } = await supabase.from('enrollments').select('student_name, created_at').order('created_at', { ascending: false }).limit(3);
      const { data: recentWellness } = await supabase.from('wellness_reports').select('topic, created_at, is_anonymous').order('created_at', { ascending: false }).limit(3);
      const { data: recentUsers } = await supabase.from('profiles').select('full_name, created_at').order('created_at', { ascending: false }).limit(3);

      const formattedActivity = [
        ...(recentEnrollments?.map(e => ({ 
          title: 'Nueva inscripción pendiente', 
          time: e.created_at, 
          user: e.student_name, 
          color: 'bg-emerald-500',
          type: 'enrollment' 
        })) || []),
        ...(recentWellness?.map(w => ({ 
          title: `Reporte: ${w.topic}`, 
          time: w.created_at, 
          user: w.is_anonymous ? 'Anónimo' : 'Estudiante', 
          color: 'bg-rose-500',
          type: 'wellness' 
        })) || []),
        ...(recentUsers?.map(u => ({ 
          title: 'Nuevo usuario registrado', 
          time: u.created_at, 
          user: u.full_name, 
          color: 'bg-blue-500',
          type: 'user' 
        })) || [])
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      setRecentActivity(formattedActivity);
      setCounts({
        students: students || 0,
        teachers: teachers || 0,
        admins: admins || 0,
        enrollments: enrollmentsCount || 0,
        mailbox: wellnessCount || 0,
        totalUsers: totalUsers || 0,
        totalIncome: totalIncome,
        todayIncome: todayIncome,
        solvencyRate: solvencyRate.toFixed(1),
        activity: activityData
      });
    };
    if (seccionActiva === 'dashboard') fetchCounts();
  }, [seccionActiva]);

  const [infoUsuario, setInfoUsuario] = useState({ 
    nombre: 'Admin Principal', 
    cargo: 'Director de Sistemas', 
    img: '/Fondo-Nuevo.png',
    email: 'admin@Francisca Elena.edu.ve',
    cedula: 'V-10.234.567',
    telefono: '(+58) 212-9999999'
  });

  const stats = [
    { label: 'Estudiantes', valor: counts.students, icon: <Users />, color: 'bg-blue-500' },
    { label: 'Inscripciones', valor: counts.enrollments, icon: <FileText />, color: 'bg-emerald-500' },
    { label: 'Reportes Bienestar', valor: counts.mailbox, icon: <HeartHandshake />, color: 'bg-rose-500' },
    { label: 'Ingresos Hoy', valor: `$${(counts.todayIncome || 0).toLocaleString()}`, icon: <TrendingUp />, color: 'bg-amber-500' },
  ];

  const handleGenerateReport = async () => {
    setIsGeneratingReport(true);
    // Simulamos una generación de reporte premium
    setTimeout(() => {
      setShowReportModal(true);
      setIsGeneratingReport(false);
    }, 1500);
  };

  const exportToCSV = async () => {
    const { data: users, error } = await supabase.from('profiles').select('full_name, role, id_card, email, updated_at');
    if (error) {
      alert('Error al exportar: ' + error.message);
      return;
    }

    const headers = ['Nombre', 'Rol', 'Cédula/ID', 'Email', 'Fecha Actividad'];
    const csvContent = [
      headers.join(','),
      ...users.map(u => [
        `"${u.full_name}"`,
        `"${u.role}"`,
        `"${u.id_card || 'S/N'}"`,
        `"${u.email || ''}"`,
        `"${new Date(u.updated_at || Date.now()).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Reporte_Global_Usuarios_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans relative z-0 theme-transition ${isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* FONDO ADMIN - DINÁMICO */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-vinotinto/30 blur-[150px] rounded-full mix-blend-screen opacity-40"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-slate-800/20 blur-[150px] rounded-full mix-blend-screen opacity-70"></div>
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-vinotinto/10 blur-[120px] rounded-full mix-blend-multiply opacity-50"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-slate-200/50 blur-[130px] rounded-full mix-blend-multiply opacity-70"></div>
          </>
        )}
      </div>

      {/* REUTILIZAMOS SIDEBAR CON ADAPTACIÓN ADMIN */}
      <SidebarDashboard 
        isOpen={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        activa={seccionActiva} 
        alCambiar={setSeccionActiva} 
        onLogout={onLogout}
        rol="admin"
        infoUsuario={infoUsuario}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Cabecera 
          toggleSidebar={() => setMenuAbierto(true)} 
          onLogout={onLogout} 
          rol="admin" 
          isDarkMode={isDarkMode}
          usuario={infoUsuario}
          onNavigate={(seccion) => setSeccionActiva(seccion)}
        />
        
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <div className="max-w-[1400px] mx-auto min-h-screen p-8">
            
            {/* HEADER ADMIN DINÁMICO */}
            <div className={`flex flex-col md:flex-row justify-between items-start md:items-end mb-12 pb-6 border-b transition-colors ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
               <div>
                 <Motion.span 
                   initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                   key={seccionActiva + '-span'}
                   className={`inline-block px-4 py-1.5 mb-4 rounded-full text-[10px] font-black uppercase tracking-[0.2em] ${isDarkMode ? 'bg-vinotinto-500/20 text-vinotinto-400' : 'bg-vinotinto-500/10 text-vinotinto-500'}`}
                 >
                   {seccionActiva === 'dashboard' ? 'Centro de Operaciones' : 'Módulo Institucional'}
                 </Motion.span>
                 <Motion.h2 
                   initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                   key={seccionActiva + '-h2'}
                   className={`text-5xl md:text-6xl font-black tracking-tighter uppercase italic font-display transition-colors flex items-center gap-3 ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}
                 >
                   {seccionActiva === 'dashboard' && <>Panel <span className="text-vinotinto-500">Ejecutivo</span></>}
                   {seccionActiva === 'usuarios' && <>Gestión de <span className="text-vinotinto-500">Usuarios</span></>}
                   {(seccionActiva === 'blog' || seccionActiva === 'noticias') && <>Control de <span className="text-vinotinto-500">Contenido</span></>}
                   {seccionActiva === 'cafetin' && <>Inventario <span className="text-vinotinto-500">Cafetín</span></>}
                   {seccionActiva === 'apoyo' && <>Centro de <span className="text-vinotinto-500">Mensajes</span></>}
                   {seccionActiva === 'inscripciones' && <>Gestor de <span className="text-vinotinto-500">Inscripciones</span></>}
                   {seccionActiva === 'clases' && <>Control de <span className="text-vinotinto-500">Clases</span></>}
                   {seccionActiva === 'vlog' && <>Vlog <span className="text-vinotinto-500">Escolar</span></>}
                   {seccionActiva === 'perfil' && <>Mi <span className="text-vinotinto-500">Perfil</span></>}
                   {seccionActiva === 'bienestar' && <>Gestión de <span className="text-vinotinto-500">Bienestar</span></>}
                 </Motion.h2>
               </div>
               <div className="flex gap-4 mt-6 md:mt-0">
                 <button 
                   onClick={handleGenerateReport}
                   disabled={isGeneratingReport}
                   className={`flex items-center gap-2 px-6 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl hover:scale-105 active:scale-95 ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border border-white/10 text-white' : 'bg-white hover:bg-gray-50 border border-gray-200 text-slate-800'}`}
                 >
                   {isGeneratingReport ? <div className="w-4 h-4 border-2 border-vinotinto-500 border-t-transparent animate-spin rounded-full"></div> : <FileText size={14} />}
                   {isGeneratingReport ? 'Generando...' : 'Reporte Global'}
                 </button>
               </div>
             </div>

            {/* CONTENIDO DINÁMICO */}
            <AnimatePresence mode="wait">
              {seccionActiva === 'dashboard' && (
                <Motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-10"
                >
                  {/* STATS GRID MEJORADO */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, i) => (
                      <Motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        key={i} 
                        className={`relative overflow-hidden p-8 rounded-[2.5rem] border shadow-2xl group transition-all duration-500 cursor-default ${isDarkMode ? 'bg-white/5 backdrop-blur-xl border-white/10 hover:border-white/30 hover:bg-white/10' : 'bg-white border-gray-100 hover:border-vinotinto-300 hover:shadow-vinotinto-500/10'}`}
                      >
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                        <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-${stat.color.split('-')[1]}-500/30 group-hover:rotate-6 transition-transform duration-300`}>
                          {React.cloneElement(stat.icon, { size: 24 })}
                        </div>
                        <p className={`text-4xl lg:text-5xl font-black mb-1 tracking-tighter transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.valor}</p>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{stat.label}</p>
                        <div className="mt-5 h-1 w-full bg-gray-500/10 rounded-full overflow-hidden">
                           <div className={`h-full ${stat.color} rounded-full`} style={{ width: `${Math.random() * 60 + 40}%` }}></div>
                        </div>
                      </Motion.div>
                    ))}
                  </div>

                  {/* ZONA DE ACCIÓN Y ACTIVIDAD */}
                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    {/* ATAJOS */}
                    <div className={`xl:col-span-2 backdrop-blur-xl p-10 rounded-[3rem] border transition-colors ${isDarkMode ? 'bg-gradient-to-br from-vinotinto-900/40 to-transparent border-white/10' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'}`}>
                       <h3 className={`text-2xl font-black italic mb-8 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Accesos Rápidos</h3>
                       <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          {[
                            { label: 'Gestionar Usuarios', icon: <Users />, color: 'bg-indigo-600', link: 'usuarios' },
                            { label: 'Publicar Píldora Vlog', icon: <Video />, color: 'bg-rose-600', link: 'noticias' },
                            { label: 'Revisar Inscripciones', icon: <FileText />, color: 'bg-emerald-600', link: 'inscripciones' },
                            { label: 'Actualizar Cafetín', icon: <ShoppingCart />, color: 'bg-amber-600', link: 'cafetin' },
                          ].map((action, i) => (
                            <button 
                               key={i} 
                               onClick={() => setSeccionActiva(action.link)}
                               className={`flex items-center gap-5 p-6 rounded-[2rem] border transition-all text-left group ${isDarkMode ? 'bg-white/5 hover:bg-white/10 border-white/5 hover:border-white/20' : 'bg-gray-50 hover:bg-gray-100 border-gray-100'}`}
                            >
                               <div className={`w-12 h-12 ${action.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                 {action.icon}
                               </div>
                               <div>
                                 <span className={`block text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{action.label}</span>
                                 <span className="block text-[10px] text-gray-500 font-medium mt-1">Acción del sistema</span>
                               </div>
                               <ArrowRight className="ml-auto w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 transition-all" />
                            </button>
                          ))}
                       </div>
                    </div>

                    {/* FEED DE ACTIVIDAD */}
                    <div className={`backdrop-blur-xl p-10 rounded-[3rem] border transition-colors flex flex-col ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-2xl shadow-gray-200/50'}`}>
                       <div className="flex justify-between items-center mb-8">
                         <h3 className={`text-2xl font-black italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Actividad Reciente</h3>
                         <span className="flex items-center justify-center w-8 h-8 rounded-full bg-vinotinto-500/20 text-vinotinto-600">
                           <TrendingUp size={14} />
                         </span>
                       </div>
                       
                       <div className="space-y-8 flex-1">
                          {recentActivity.length === 0 ? (
                            <div className="py-10 text-center opacity-40">
                              <p className="text-[10px] font-black uppercase tracking-widest">Sin actividad reciente</p>
                            </div>
                          ) : (
                            recentActivity.map((item, i) => {
                              const formatRelativeTime = (dateStr) => {
                                const now = new Date();
                                const past = new Date(dateStr);
                                const diffMs = now - past;
                                const diffMin = Math.floor(diffMs / 60000);
                                const diffHr = Math.floor(diffMin / 60) ;
                                const diffDays = Math.floor(diffHr / 24);

                                if (diffMin < 1) return 'Hace un momento';
                                if (diffMin < 60) return `Hace ${diffMin} min`;
                                if (diffHr < 24) return `Hace ${diffHr} ${diffHr === 1 ? 'hora' : 'horas'}`;
                                return `Hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
                              };

                              return (
                                <div key={i} className="flex gap-5 items-start group">
                                   <div className="relative">
                                     <div className={`w-3 h-3 rounded-full ${item.color} mt-1.5 shadow-[0_0_10px_rgba(0,0,0,0.2)]`}></div>
                                     {i < recentActivity.length - 1 && <div className="absolute top-4 left-1.5 w-0.5 h-10 bg-gray-500/20"></div>}
                                   </div>
                                   <div>
                                      <p className={`text-sm font-bold transition-colors ${isDarkMode ? 'text-gray-200' : 'text-slate-800'}`}>{item.title}</p>
                                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">{formatRelativeTime(item.time)} • {item.user}</p>
                                   </div>
                                </div>
                              );
                            })
                          )}
                       </div>
                       <button className="w-full py-4 mt-6 border-t border-gray-500/20 text-[10px] font-black uppercase tracking-widest text-vinotinto-500 hover:text-vinotinto-400 transition-colors">
                         Ver Todo el Historial
                       </button>
                    </div>
                  </div>
                </Motion.div>
              )}

              {seccionActiva === 'usuarios' && (
                <Motion.div key="usuarios" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <GestionUsuarios isDarkMode={isDarkMode} />
                </Motion.div>
              )}

              {(seccionActiva === 'blog' || seccionActiva === 'noticias') && (
                <Motion.div key="contenido" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <GestionContenido initialTab="news" tabsFilter="news" isDarkMode={isDarkMode} />
                </Motion.div>
              )}

              {seccionActiva === 'cafetin' && (
                <Motion.div key="cafetin" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <InventarioCafetin isDarkMode={isDarkMode} />
                </Motion.div>
              )}

              {seccionActiva === 'apoyo' && (
                <Motion.div key="apoyo" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <CentroMensajes isDarkMode={isDarkMode} />
                </Motion.div>
              )}

              {seccionActiva === 'inscripciones' && (
                <Motion.div key="inscripciones" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <GestorInscripciones isDarkMode={isDarkMode} />
                </Motion.div>
              )}

              {seccionActiva === 'clases' && (
                <Motion.div key="clases" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <GestionClases isDarkMode={isDarkMode} />
                </Motion.div>
              )}

              {seccionActiva === 'bienestar' && (
                <Motion.div key="bienestar" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <GestionBienestar isDarkMode={isDarkMode} />
                </Motion.div>
              )}


              {(seccionActiva === 'qr-generar' || seccionActiva === 'qr-historial' || seccionActiva === 'qr-notificaciones') && (
                <Motion.div key="qr-access" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <GestionQR 
                    isDarkMode={isDarkMode} 
                    initialTab={seccionActiva.replace('qr-', '')} 
                   />
                </Motion.div>
              )}

              {seccionActiva === 'vlog' && (
                <Motion.div key="vlog" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <GestionContenido initialTab="vlog" tabsFilter="vlog" isDarkMode={isDarkMode} />
                </Motion.div>
              )}

              {seccionActiva === 'perfil' && (
                <Motion.div key="perfil" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                   <GestionPerfil 
                     infoUsuario={infoUsuario} 
                     rol={rol}
                     alActualizar={(nuevosDatos) => setInfoUsuario(prev => ({ ...prev, ...nuevosDatos }))} 
                   />
                </Motion.div>
              )}

              

              {!['dashboard', 'usuarios', 'blog', 'noticias', 'cafetin', 'apoyo', 'inscripciones', 'clases', 'perfil', 'vlog', 'bienestar'].includes(seccionActiva) && (

                <Motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-40 bg-white/5 rounded-[3rem] border border-dashed border-white/10"
                >
                   <Settings className="w-16 h-16 text-white/20 animate-spin-slow mb-6" />
                   <h4 className="text-xl font-black uppercase tracking-widest text-white/40">Módulo en Configuración</h4>
                   <p className="text-sm text-white/20 font-medium mt-2">Estamos ajustando los últimos detalles de este módulo institucional.</p>
                </Motion.div>
              )}
            </AnimatePresence>
          </div>
          <PieDePagina />
        </main>
      </div>

      {/* MODAL DE REPORTE */}
      <AnimatePresence>
        {showReportModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 print:p-0 print:static print:block">
            <Motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowReportModal(false)} 
              className="absolute inset-0 bg-black/90 backdrop-blur-xl no-print" 
            />
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className={`relative w-full max-w-xl rounded-[3rem] border p-8 overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] modal-report ${isDarkMode ? 'bg-[#0f1115] border-white/10' : 'bg-white border-gray-200'} print:max-w-full print:rounded-none print:border-none print:shadow-none print:p-0 print:m-0`}
            >
              {/* DECORACIÓN FONDO */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-vinotinto-500/10 blur-[80px] rounded-full -mr-16 -mt-16 no-print"></div>
              
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-vinotinto-600 rounded-2xl flex items-center justify-center text-white shadow-lg print:border print:border-slate-300">
                       <FileText size={24} />
                    </div>
                    <div>
                      <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'} print:text-black`}>Reporte <span className="text-vinotinto-500">Ejecutivo</span></h3>
                      <p className="text-[8px] text-gray-500 font-black uppercase tracking-[0.2em] mt-0.5 print:text-slate-600">Snapshot • {new Date().toLocaleDateString()}</p>
                    </div>
                  </div>
                  <button onClick={() => setShowReportModal(false)} className={`p-4 rounded-2xl transition-all no-print ${isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-gray-100 hover:bg-gray-200 text-slate-800'}`}>
                    <X size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 print:grid-cols-2">
                  {[
                    { label: 'Usuarios', val: counts.totalUsers, icon: <Users size={16} />, color: 'text-blue-500' },
                    { label: 'Asistencia', val: '98.5%', icon: <CheckCircle2 size={16} />, color: 'text-emerald-500' },
                    { label: 'Ingresos', val: `$${counts.totalIncome.toLocaleString()}`, icon: <TrendingUp size={16} />, color: 'text-amber-500' },
                    { label: 'Solvencia', val: `${counts.solvencyRate}%`, icon: <FileText size={16} />, color: 'text-rose-500' }
                  ].map((item, i) => (
                    <div key={i} className={`p-5 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-200'} print:border-slate-300 print:bg-white`}>
                      <div className={`w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center mb-3 ${item.color} print:bg-slate-100`}>
                        {item.icon}
                      </div>
                      <p className={`text-2xl font-black tracking-tighter mb-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'} print:text-black`}>{item.val}</p>
                      <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest print:text-slate-600">{item.label}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 print:gap-12">
                  <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} print:border-slate-300 print:bg-white`}>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2 print:text-black">
                      <Users size={12} /> Distribución
                    </h4>
                    <div className="space-y-3">
                      {[
                        { label: 'Estudiantes', count: counts.students, color: 'bg-vinotinto-500' },
                        { label: 'Docentes', count: counts.teachers, color: 'bg-gold' },
                        { label: 'Admin', count: counts.admins, color: 'bg-slate-500' }
                      ].map((role, idx) => (
                        <div key={idx} className="space-y-1.5">
                          <div className="flex justify-between text-[8px] font-black uppercase">
                            <span className={isDarkMode ? 'text-white/70' : 'text-slate-600'}>{role.label}</span>
                            <span className="text-vinotinto-500">{role.count}</span>
                          </div>
                          <div className="w-full h-1.5 bg-gray-500/10 rounded-full overflow-hidden print:bg-slate-200">
                            <Motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${(role.count / (counts.totalUsers || 1)) * 100}%` }}
                              className={`h-full ${role.color} rounded-full`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-gray-50 border-gray-100'} print:border-slate-300 print:bg-white`}>
                    <h4 className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2 print:text-black">
                      <TrendingUp size={12} /> Actividad
                    </h4>
                    <div className="flex items-end justify-between h-20 gap-1.5 print:h-32">
                       {(counts.activity || [10, 20, 15, 30, 25, 40, 50]).map((count, i) => {
                         const max = Math.max(...(counts.activity || [1]), 1);
                         const h = (count / max) * 100;
                         return (
                           <Motion.div 
                             key={i}
                             initial={{ height: 0 }}
                             animate={{ height: `${h || 5}%` }}
                             className={`flex-1 rounded-t-md ${i === 6 ? 'bg-vinotinto-500' : 'bg-gray-500/20'} print:bg-slate-400`}
                           />
                         );
                       })}
                    </div>
                    <div className="flex justify-between mt-3 text-[7px] font-black text-gray-400 uppercase tracking-widest print:text-slate-600">
                       <span>Lun</span><span>Mar</span><span>Mié</span><span>Jue</span><span>Vie</span><span>Sáb</span><span className="text-vinotinto-500">Hoy</span>
                    </div>
                  </div>
                </div>

                <style>{`
                  @media print {
                    /* Ocultar TODO el dashboard y elementos de UI */
                    aside, header, nav, footer, .no-print, button { display: none !important; }
                    
                    /* Limpiar el body */
                    body, html { 
                      background: white !important; 
                      color: black !important; 
                      margin: 0 !important; 
                      padding: 0 !important;
                      overflow: visible !important;
                    }

                    /* Reset del contenedor del portal para que no interfiera */
                    #root > div, main { 
                      display: block !important; 
                      position: static !important; 
                      padding: 0 !important; 
                      margin: 0 !important;
                    }

                    .modal-report { 
                      position: absolute !important;
                      top: 0 !important;
                      left: 0 !important;
                      width: 100% !important;
                      height: auto !important;
                      display: block !important;
                      background: white !important;
                    }

                    /* Asegurar que las barras de progreso se vean al imprimir */
                    .bg-vinotinto-500, .bg-gold, .bg-slate-500 {
                      -webkit-print-color-adjust: exact !important;
                      print-color-adjust: exact !important;
                    }
                  }
                `}</style>

                <div className={`p-6 rounded-[2rem] border mb-8 flex items-center justify-between transition-colors no-print ${isDarkMode ? 'bg-vinotinto-950/20 border-vinotinto-900/30' : 'bg-vinotinto-50 border-vinotinto-100'}`}>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-vinotinto-600 rounded-xl flex items-center justify-center text-white">
                        <Save size={18} />
                      </div>
                      <div>
                        <p className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-vinotinto-900'}`}>Exportación</p>
                        <p className="text-[9px] text-gray-500 font-medium">Formato CSV compatible.</p>
                      </div>
                   </div>
                   <button 
                    onClick={exportToCSV}
                    className="px-6 py-3 bg-vinotinto-600 hover:bg-vinotinto-700 text-white rounded-xl font-black uppercase tracking-widest text-[9px] shadow-lg transition-all"
                  >
                    CSV
                  </button>
                </div>

                <div className="flex gap-4 no-print">
                  <button 
                    onClick={() => window.print()}
                    className={`flex-1 py-5 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all ${isDarkMode ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-white border-2 border-gray-100 text-slate-800 hover:border-gray-200'}`}
                  >
                    <FileText size={18} /> Vista de Impresión
                  </button>
                  <button 
                    onClick={() => setShowReportModal(false)}
                    className="flex-1 py-5 bg-gold text-vinotinto-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] transition-all"
                  >
                    Cerrar Reporte
                  </button>
                </div>

                <p className="text-[9px] text-gray-500 font-medium text-center mt-10 uppercase tracking-[0.3em] opacity-50 print:text-black">
                  Documento generado por el sistema de auditoría interna de Francisca Elena
                </p>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PanelAdmin;
