import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import CentroNotificaciones from './CentroNotificaciones';
import { Bell } from 'lucide-react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

const Cabecera = ({ toggleSidebar, onLogout, rol, isDarkMode, onNavigate, usuario }) => {
  const [notificacionesAbiertas, setNotificacionesAbiertas] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (usuario && usuario.email) {
      // Contar notificaciones no leídas inicialmente
      const inicializarNotificaciones = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return;

        const userId = session.user.id;
        
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('read', false);
        
        setUnreadCount(count || 0);

        // Suscripción Realtime para actualizar el contador
        const channel = supabase.channel('header-notifications')
          .on('postgres_changes', { 
            event: '*', 
            schema: 'public', 
            table: 'notifications',
            filter: `user_id=eq.${userId}`
          }, () => {
            actualizarContador(userId);
          })
          .subscribe();

        return () => supabase.removeChannel(channel);
      };
      
      inicializarNotificaciones();
    }
  }, [usuario, rol]);

  const actualizarContador = async (userId) => {
    const { count } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false);
    setUnreadCount(count || 0);
  };

  const referenciaNotificaciones = useRef(null);

  useEffect(() => {
    const manejarClicAfuera = (evento) => {
      if (referenciaNotificaciones.current && !referenciaNotificaciones.current.contains(evento.target)) {
        setNotificacionesAbiertas(false);
      }
    };
    document.addEventListener("mousedown", manejarClicAfuera);
    return () => document.removeEventListener("mousedown", manejarClicAfuera);
  }, []);

  return (
    <header className="bg-gradient-to-r from-vinotinto-800/90 to-vinotinto-900/90 backdrop-blur-2xl text-white h-20 w-full flex items-center justify-between px-6 shadow-[0_10px_40px_rgba(96,0,16,0.3)] border-b border-white/20 sticky top-0 z-40">

      {/* LADO IZQUIERDO */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-3 bg-white/10 rounded-2xl text-white hover:bg-gold hover:text-vinotinto-900 border border-white/20 transition-all transform active:scale-90 mr-2 group"
        >
          <svg className="w-7 h-7 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>

        <div className="w-12 h-12 flex items-center justify-center overflow-hidden">
          <img src="/Fondo-Nuevo.png" alt="Insignia" className="w-full h-full object-contain" />
        </div>
        
        <div className="hidden sm:block">
          <h2 className="text-2xl font-display font-black leading-none tracking-tighter italic text-white drop-shadow-md">Francisca Elena</h2>
          <div className="text-[10px] font-bold text-white/90 tracking-[0.2em] uppercase mt-0.5">Burgos D.</div>
        </div>
      </div>

      {/* LADO DERECHO */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={referenciaNotificaciones}>
          <div
            onClick={() => setNotificacionesAbiertas(!notificacionesAbiertas)}
            className={`p-2.5 rounded-full transition-all border cursor-pointer transform active:scale-95 group ${notificacionesAbiertas ? 'bg-gold border-white' : 'bg-white/10 border-white/20 hover:bg-white/20'}`}
          >
            <Bell className={`w-6 h-6 ${notificacionesAbiertas ? 'text-vinotinto-900' : 'text-white'}`} />
          </div>

          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-red-600 border-2 border-white shadow-lg text-[8px] font-black flex items-center justify-center">
                {unreadCount > 9 ? '+9' : unreadCount}
              </span>
            </div>
          )}

          <AnimatePresence>
            {notificacionesAbiertas && usuario && (
              <Motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 mt-5 w-96 rounded-[3rem] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.4)] border overflow-hidden z-50 bg-white"
              >
                 <CentroNotificaciones 
                   user={usuario} 
                   rol={rol} 
                   alCerrar={() => setNotificacionesAbiertas(false)}
                   alNavegar={onNavigate}
                 />
              </Motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};

export default Cabecera;
