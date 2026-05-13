import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  UserCircle, 
  Check, 
  X, 
  Clock, 
  ShieldAlert, 
  Mail, 
  Phone,
  ArrowRight
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const SolicitudesAdmin = ({ isDarkMode }) => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSolicitudes();
  }, []);

  const fetchSolicitudes = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_requests')
        .select(`
          *,
          profiles:user_id (full_name, email, phone)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSolicitudes(data || []);
    } catch (err) {
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const procesarSolicitud = async (solicitud, aprobado) => {
    try {
      // 1. Actualizar estado de la solicitud
      const { error: errStatus } = await supabase
        .from('profile_requests')
        .update({ status: aprobado ? 'approved' : 'rejected' })
        .eq('id', solicitud.id);

      if (errStatus) throw errStatus;

      // 2. Si es aprobado, actualizar el perfil del usuario
      if (aprobado) {
        const updateData = {};
        updateData[solicitud.field_name] = solicitud.new_value;
        
        const { error: errProfile } = await supabase
          .from('profiles')
          .update(updateData)
          .eq('id', solicitud.user_id);
        
        if (errProfile) throw errProfile;
      }

      // 3. Enviar notificación al usuario
      await supabase.from('notifications').insert({
        user_id: solicitud.user_id,
        title: aprobado ? "Solicitud Aprobada ✅" : "Solicitud Rechazada ❌",
        message: aprobado 
          ? `Tu solicitud para cambiar ${solicitud.field_name} a "${solicitud.new_value}" ha sido procesada.`
          : `Lamentamos informarte que tu solicitud de cambio de perfil no fue aprobada.`,
        type: 'profile_update'
      });

      alert(aprobado ? "Cambio realizado con éxito" : "Solicitud rechazada");
      fetchSolicitudes();
    } catch (err) {
      alert("Error al procesar: " + err.message);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className={`text-4xl font-black tracking-tighter italic uppercase mb-2 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Solicitudes de <span className="text-vinotinto-800">Cambio</span></h2>
        <p className="text-sm text-gray-400 font-medium">Revisa y aprueba las actualizaciones de datos sensibles de los usuarios.</p>
      </div>

      {loading ? (
        <div className="py-20 text-center flex flex-col items-center gap-4">
           <div className="w-10 h-10 border-4 border-vinotinto-500 border-t-transparent animate-spin rounded-full"></div>
           <p className="text-xs font-black uppercase tracking-widest text-gray-500">Cargando solicitudes...</p>
        </div>
      ) : solicitudes.length === 0 ? (
        <div className={`p-20 rounded-[3rem] border border-dashed text-center ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-xl'}`}>
           <ShieldAlert className="w-16 h-16 text-gray-200 mx-auto mb-4 opacity-20" />
           <p className="text-xl font-black text-gray-300 uppercase tracking-widest">No hay solicitudes pendientes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {solicitudes.map((sol) => (
             <Motion.div 
               key={sol.id}
               initial={{ opacity: 0, y: 20 }}
               animate={{ opacity: 1, y: 0 }}
               className={`p-8 rounded-[3rem] border relative overflow-hidden transition-all ${isDarkMode ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-gray-100 shadow-xl'}`}
             >
                <div className="flex items-start justify-between mb-6">
                   <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDarkMode ? 'bg-vinotinto-500/20 text-vinotinto-400' : 'bg-vinotinto-50 text-vinotinto-800'}`}>
                         <UserCircle size={24} />
                      </div>
                      <div>
                         <h4 className={`font-black uppercase italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{sol.profiles?.full_name}</h4>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                            <Clock size={10} /> {new Date(sol.created_at).toLocaleDateString()}
                         </p>
                      </div>
                   </div>
                </div>

                <div className={`p-6 rounded-3xl space-y-4 mb-8 ${isDarkMode ? 'bg-black/20' : 'bg-slate-50'}`}>
                   <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                         {sol.field_name === 'email' ? <Mail size={14} className="text-blue-500" /> : <Phone size={14} className="text-emerald-500" />}
                         <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Cambio de {sol.field_name}</span>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-4">
                      <div className="flex-1">
                         <p className="text-[8px] font-black text-gray-400 uppercase mb-1">Actual</p>
                         <p className="text-xs font-bold text-gray-400 truncate italic">{sol.profiles?.[sol.field_name] || 'N/A'}</p>
                      </div>
                      <ArrowRight className="text-vinotinto-300" size={16} />
                      <div className="flex-1">
                         <p className="text-[8px] font-black text-vinotinto-400 uppercase mb-1">Nuevo Valor</p>
                         <p className={`text-xs font-black truncate ${isDarkMode ? 'text-vinotinto-300' : 'text-vinotinto-800'}`}>{sol.new_value}</p>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                   <button 
                     onClick={() => procesarSolicitud(sol, false)}
                     className="flex-1 py-4 bg-red-500/10 text-red-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-2"
                   >
                      <X size={14} /> Rechazar
                   </button>
                   <button 
                     onClick={() => procesarSolicitud(sol, true)}
                     className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg flex items-center justify-center gap-2"
                   >
                      <Check size={14} /> Aprobar Cambio
                   </button>
                </div>
             </Motion.div>
           ))}
        </div>
      )}
    </div>
  );
};

export default SolicitudesAdmin;
