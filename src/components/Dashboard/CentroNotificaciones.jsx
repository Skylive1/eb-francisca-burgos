import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  X, 
  ShoppingBag, 
  UserCheck, 
  UserX, 
  Clock, 
  ChevronRight,
  Info
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CentroNotificaciones = ({ user, rol, alCerrar, alNavegar }) => {
  const [notificaciones, setNotificaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificaciones();
    
    // Suscripción Realtime para nuevas notificaciones
    const channel = supabase.channel('notificaciones-live')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${user.id}`
      }, payload => {
        setNotificaciones(prev => [payload.new, ...prev]);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [user.id]);

  const fetchNotificaciones = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      setNotificaciones(data || []);
    } catch (err) {
      console.error("Error fetching notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const marcarLeida = async (id) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotificaciones(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error("Error marking as read:", err);
    }
  };

  const manejarClick = (notif) => {
    marcarLeida(notif.id);
    if (notif.link) {
      alNavegar(notif.link);
    }
    alCerrar();
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-slate-50/50">
         <div>
            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-gray-900">Tus <span className="text-vinotinto-800">Notificaciones</span></h3>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Mantente al día con tu actividad escolar</p>
         </div>
         <button onClick={alCerrar} className="p-3 bg-white rounded-2xl text-gray-400 hover:text-red-500 shadow-sm transition-all">
            <X size={20} />
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
         {loading ? (
           <div className="py-20 text-center opacity-20"><Bell className="w-12 h-12 animate-bounce mx-auto" /></div>
         ) : notificaciones.length === 0 ? (
           <div className="py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-gray-50 rounded-[2rem] flex items-center justify-center mx-auto text-gray-200">
                 <Bell size={40} />
              </div>
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest">No tienes notificaciones</p>
           </div>
         ) : (
           notificaciones.map((n) => (
             <Motion.div
               key={n.id}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               onClick={() => manejarClick(n)}
               className={`p-6 rounded-[2.5rem] border cursor-pointer transition-all group relative overflow-hidden ${n.read ? 'bg-white border-gray-100 opacity-60' : 'bg-white border-vinotinto-100 shadow-lg shadow-vinotinto-50/50'}`}
             >
                {!n.read && <div className="absolute top-0 left-0 w-1.5 h-full bg-vinotinto-800" />}
                
                <div className="flex items-start gap-4">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                     n.type === 'profile_update' ? 'bg-blue-50 text-blue-600' :
                     n.type === 'order' ? 'bg-emerald-50 text-emerald-600' :
                     n.type === 'wellness' ? 'bg-green-50 text-green-600' :
                     'bg-gray-100 text-gray-400'
                   }`}>
                      {n.type === 'profile_update' ? <UserCheck size={24}/> :
                       n.type === 'order' ? <ShoppingBag size={24}/> :
                       n.type === 'wellness' ? <Bell size={24}/> :
                       <Info size={24}/>}
                   </div>

                   <div className="flex-1">
                      <div className="flex justify-between items-start mb-1">
                         <h4 className="text-xs font-black text-gray-900 uppercase tracking-tight">{n.title}</h4>
                         <span className="text-[8px] font-bold text-gray-400 uppercase flex items-center gap-1">
                            <Clock size={8}/> {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </span>
                      </div>
                      <p className="text-[11px] text-gray-500 font-medium leading-relaxed">{n.message}</p>
                   </div>
                   
                   <ChevronRight className="text-gray-200 group-hover:text-vinotinto-800 group-hover:translate-x-1 transition-all" size={16} />
                </div>
             </Motion.div>
           ))
         )}
      </div>

      <div className="p-6 border-t border-gray-50 text-center">
         <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">Francisca Elena Burgos D. • Sistema de Alertas</p>
      </div>
    </div>
  );
};

export default CentroNotificaciones;
