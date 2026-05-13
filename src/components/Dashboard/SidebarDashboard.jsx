import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  Sparkles, 
  LayoutGrid, 
  Bell, 
  LogOut, 
  ChevronRight,
  User,
  Settings,
  X,
  Trophy,
  Bot,
  CreditCard,
  Utensils,
  Inbox,
  Heart,
  GraduationCap,
  FileText,
  Calendar,
  ChevronDown,
  AlertTriangle,
  Shield,
  ClipboardList,
  Sun,
  Moon
} from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';

const SidebarDashboard = ({ 
  isOpen, onClose, activa, alCambiar, onLogout, 
  rol, infoUsuario, onOpenSettings,
  isDarkMode = true, onToggleTheme
}) => {
  const { info } = useGamification();
  const [academiaAbierta, setAcademiaAbierta] = React.useState(false);
  const [qrAccessAbierto, setQrAccessAbierto] = React.useState(false);
  const esProfesor = rol === 'profesor';
  const esAdmin = rol === 'admin';
  const esCafetin = rol === 'cafetin';
  
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutGrid className="w-6 h-6" />, soloAdmin: true },
    { id: 'vlog', label: 'Vlog Escolar', icon: <Sparkles className="w-6 h-6" /> },
    { id: 'aula', label: 'Aula Virtual', icon: <LayoutGrid className="w-6 h-6" />, soloEstudiante: true, soloProfesor: true },
    { id: 'clases', label: 'Materias', icon: <GraduationCap className="w-6 h-6" />, soloAdmin: true },
    { id: 'usuarios', label: 'Usuarios', icon: <User className="w-6 h-6" />, soloAdmin: true },
    { id: 'cafetin', label: rol === 'cafetin' ? 'Gestionar Cafetín' : 'Cafetín', icon: <Utensils className="w-6 h-6" /> },
    { id: 'bienestar', label: esAdmin ? 'Gestión Bienestar' : 'Bienestar', icon: <Heart className="w-6 h-6" /> },
    { id: 'aula-virtual', label: 'Mis Clases', icon: <LayoutGrid className="w-6 h-6" />, soloEstudiante: true },
    { id: 'ventas', label: 'Registro de Ventas', icon: <ClipboardList className="w-6 h-6" />, soloCafetin: true },
  ]
.filter(item => {
    if (esAdmin) return item.soloAdmin || (!item.soloEstudiante && !item.soloProfesor) || item.id === 'cafetin';
    if (esCafetin) return item.id === 'cafetin' || item.id === 'ventas';
    if (esProfesor) return item.id === 'aula' || item.id === 'vlog' || item.id === 'cafetin';
    return !item.soloAdmin && !item.soloProfesor && !item.soloCafetin;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* ── OVERLAY (FONDO OSCURO MÁS SUAVE) ── */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/20 backdrop-blur-[2px] z-[60]"
          />

          {/* ── BARRA LATERAL (AMPLIA Y LEGIBLE) ── */}
          <Motion.aside 
            initial={{ x: '-110%' }}
            animate={{ x: 0 }}
            exit={{ x: '-110%' }}
            transition={{ type: 'tween', duration: 0.25, ease: 'circOut' }}
            className={`fixed top-4 left-4 w-[300px] h-[calc(100vh-2rem)] backdrop-blur-2xl border rounded-[3rem] flex flex-col z-[70] shadow-[40px_0_100px_rgba(0,0,0,0.1)] overflow-hidden transition-all ${isDarkMode ? 'bg-slate-900/98 border-slate-800 text-slate-100 shadow-[40px_0_100px_rgba(0,0,0,0.5)]' : 'bg-white/98 border-white text-slate-900'}`}
          >
            {/* BOTÓN CERRAR (X) */}
            <button 
              onClick={onClose}
              className={`absolute top-6 right-6 p-2 rounded-xl transition-all active:scale-90 ${isDarkMode ? 'bg-slate-800 hover:bg-vinotinto-900/50 text-slate-400 hover:text-vinotinto-400' : 'bg-gray-100 hover:bg-vinotinto-100 text-gray-500 hover:text-vinotinto-800'}`}
            >
              <X className="w-5 h-5" />
            </button>

            {/* LA SECCIÓN USUARIO / LOGO HA SIDO ELIMINADA POR PETICIÓN */}
            <div className="pt-8"></div>

            {/* ── SECCIÓN PERFIL ── */}
            <div className="mx-6 mb-8 p-6 bg-gradient-to-br from-vinotinto-800 to-vinotinto-950 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
                 <User className="w-16 h-16" />
              </div>
              <div className="relative z-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/30 p-1 mb-4 shadow-2xl">
                   <img src={infoUsuario?.img || '/Fondo-Nuevo.png'} alt="Perfil" className="w-full h-full object-cover rounded-full shadow-inner bg-white/5" />
                </div>
                <h4 className="text-sm font-black uppercase tracking-tight italic leading-none truncate w-full">{infoUsuario?.nombre || 'Usuario'}</h4>
                <p className="text-[9px] font-bold text-slate-300/80 uppercase tracking-widest mt-2 px-4 py-1 bg-white/10 rounded-full">
                  {infoUsuario?.cargo || 'Estudiante'}
                </p>
                
                {(rol === 'student' || rol === 'estudiante') && (
                  <div className="w-full mt-5 space-y-2">
                    <div className="flex justify-between items-end px-1">
                      <span className="text-[9px] font-black uppercase tracking-widest text-gold flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5" /> NV. {info.level}
                      </span>
                      <span className="text-[8px] font-bold text-white/60">{Math.floor(info.xpInLevel)} / {info.nextThreshold} XP</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/5 p-0.5">
                      <Motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${info.progress}%` }}
                        className="h-full bg-gradient-to-r from-gold via-yellow-400 to-gold rounded-full"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── NAVEGACIÓN ── */}
            <nav className="flex-1 px-6 space-y-3 overflow-y-auto custom-scrollbar">
              <p className="px-6 text-[11px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4">Menú Principal</p>
              
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => { alCambiar(item.id); onClose(); }}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-[1.5rem] transition-all duration-300 group
                    ${activa === item.id 
                      ? 'bg-vinotinto-800 text-white shadow-xl shadow-vinotinto-100' 
                      : 'text-slate-700 hover:bg-vinotinto-50 hover:text-vinotinto-900'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className={`transition-transform duration-300 ${activa === item.id ? 'scale-110' : 'group-hover:scale-110'}`}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-black uppercase tracking-tight italic">{item.label}</span>
                  </div>
                  {activa === item.id && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              ))}

              {/* SECCIÓN ACADEMIA CON SUBMENÚ */}
              {!esCafetin && (
                <div className="space-y-2">
                <button
                  onClick={() => setAcademiaAbierta(!academiaAbierta)}
                  className={`
                    w-full flex items-center justify-between p-5 rounded-[1.8rem] transition-all duration-300 group
                    ${academiaAbierta ? 'bg-vinotinto-50 text-vinotinto-900' : 'text-gray-500 hover:bg-vinotinto-50 hover:text-vinotinto-900'}
                  `}
                >
                  <div className="flex items-center gap-5">
                    <GraduationCap className={`w-6 h-6 transition-transform duration-300 ${academiaAbierta ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="text-base font-black uppercase tracking-tight italic">Academia</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${academiaAbierta ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {academiaAbierta && (
                    <Motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pl-6 space-y-2"
                    >
                      {[
                        { id: 'boletin', label: 'Calificaciones', icon: <FileText className="w-5 h-5" /> },
                        { id: 'inscripciones', label: 'Inscripciones', icon: <ClipboardList className="w-5 h-5" />, soloAdmin: true },
                        { id: 'noticias', label: 'Noticias/Blog', icon: <FileText className="w-5 h-5" />, soloAdmin: true }
                      ].filter(sub => {
                        if (sub === false) return false;
                        if (esAdmin) return sub.id !== 'finanzas';
                        if (esProfesor) return sub.id === 'boletin';
                        return !sub.soloAdmin;
                      }).map((sub) => (
                        <button
                          key={sub.id}
                          onClick={() => { alCambiar(sub.id); onClose(); }}
                          className={`
                            w-full flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 group
                            ${activa === sub.id 
                              ? 'text-vinotinto-800 bg-vinotinto-100/50' 
                              : 'text-gray-400 hover:text-vinotinto-600 hover:bg-gray-50'}
                          `}
                        >
                          <span className="transition-transform group-hover:scale-110">{sub.icon}</span>
                          <span className="text-xs font-black uppercase tracking-widest">{sub.label}</span>
                        </button>
                      ))}
                    </Motion.div>
                  )}
                </AnimatePresence>
              </div>
              )}

              {/* SECCIÓN QR ACCESS - NUEVA */}
              {esAdmin && (
                <div className="space-y-2">
                  <button
                    onClick={() => setQrAccessAbierto(!qrAccessAbierto)}
                    className={`
                      w-full flex items-center justify-between p-5 rounded-[1.8rem] transition-all duration-300 group
                      ${qrAccessAbierto ? 'bg-indigo-50 text-indigo-900' : 'text-gray-500 hover:bg-indigo-50 hover:text-indigo-900'}
                    `}
                  >
                    <div className="flex items-center gap-5">
                      <Shield className={`w-6 h-6 transition-transform duration-300 ${qrAccessAbierto ? 'scale-110' : 'group-hover:scale-110'}`} />
                      <span className="text-base font-black uppercase tracking-tight italic">QR Access</span>
                    </div>
                    <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${qrAccessAbierto ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {qrAccessAbierto && (
                      <Motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden pl-6 space-y-2"
                      >
                        {[
                          { id: 'qr-generar', label: 'Generar Carnets', icon: <CreditCard className="w-5 h-5" /> },
                          { id: 'qr-historial', label: 'Historial', icon: <Calendar className="w-5 h-5" /> },
                          { id: 'qr-notificaciones', label: 'Notificaciones', icon: <Bell className="w-5 h-5" /> }
                        ].map((sub) => (
                          <button
                            key={sub.id}
                            onClick={() => { alCambiar(sub.id); onClose(); }}
                            className={`
                              w-full flex items-center gap-5 p-4 rounded-2xl transition-all duration-300 group
                              ${activa === sub.id 
                                ? 'text-indigo-800 bg-indigo-100/50' 
                                : 'text-gray-400 hover:text-indigo-600 hover:bg-gray-50'}
                            `}
                          >
                            <span className="transition-transform group-hover:scale-110">{sub.icon}</span>
                            <span className="text-xs font-black uppercase tracking-widest">{sub.label}</span>
                          </button>
                        ))}
                      </Motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* BOTÓN RETOS IA - OCULTO SEGÚN REQUERIMIENTO */}
              {/* 
              {esProfesor && (
                <button
                  onClick={() => { alCambiar('retos'); onClose(); }}
                  className={`
                    w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 group
                    ${activa === 'retos' 
                      ? 'bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-lg shadow-gold-100' 
                      : 'text-gold-700 bg-gold-50 hover:bg-gold-100 border border-gold-200'}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <Bot className={`w-5 h-5 transition-transform duration-300 ${activa === 'retos' ? 'scale-110' : 'group-hover:scale-110'}`} />
                    <span className="text-xs font-black uppercase tracking-widest">Retos Flash</span>
                  </div>
                  {activa === 'retos' && <ChevronRight className="w-4 h-4 opacity-50" />}
                </button>
              )}
              */}

              <div className="pt-8 space-y-2">
                <p className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4">Sistema</p>
                
                <button 
                  onClick={() => { alCambiar('perfil'); onClose(); }}
                  className={`w-full flex items-center justify-between p-5 rounded-[1.8rem] transition-all duration-300 group ${activa === 'perfil' ? 'bg-vinotinto-800 text-white shadow-xl shadow-vinotinto-100' : 'text-slate-700 hover:bg-vinotinto-50 hover:text-vinotinto-900'}`}
                >
                  <div className="flex items-center gap-5">
                    <User className={`w-6 h-6 transition-transform duration-300 ${activa === 'perfil' ? 'scale-110 text-white' : 'group-hover:scale-110 text-gray-500 group-hover:text-vinotinto-800'}`} />
                    <span className="text-base font-black uppercase tracking-tight italic">Mi Perfil</span>
                  </div>
                  {activa === 'perfil' && <ChevronRight className="w-5 h-5 opacity-50" />}
                </button>

                {/* TOGGLE MODO OSCURO */}
                {(rol === 'admin' || rol === 'teacher' || rol === 'profesor') && (
                  <button 
                    onClick={onToggleTheme}
                    className="w-full flex items-center justify-between p-5 rounded-[1.8rem] transition-all duration-300 group text-slate-700 hover:bg-vinotinto-50 hover:text-vinotinto-900"
                  >
                    <div className="flex items-center gap-5">
                      {isDarkMode ? (
                        <Sun className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 text-gold group-hover:text-gold" />
                      ) : (
                        <Moon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110 text-indigo-600 group-hover:text-indigo-800" />
                      )}
                      <span className="text-base font-black uppercase tracking-tight italic">
                        {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
                      </span>
                    </div>
                  </button>
                )}

              </div>
            </nav>

            {/* ── PIE / CERRAR SESIÓN ── */}
            <div className="p-6">
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-4 rounded-[1.5rem] bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 group shadow-sm"
              >
                <LogOut className="w-5 h-5" />
                <span className="text-xs font-black uppercase tracking-widest leading-none mt-0.5">Cerrar Sesión</span>
              </button>
            </div>
          </Motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default SidebarDashboard;
