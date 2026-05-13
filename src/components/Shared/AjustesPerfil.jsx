import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Copy, Link as LinkIcon, Camera, Save, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

export default function AjustesPerfil({ isDarkMode }) {
  const [profile, setProfile] = useState({ full_name: '', avatar_url: '', id_card: '', email: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) setProfile(data);
    }
    setLoading(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          full_name: profile.full_name, 
          avatar_url: profile.avatar_url 
        })
        .eq('id', user.id);
      
      if (!error) {
        alert('✅ Perfil actualizado correctamente. Los cambios se verán reflejados al recargar o cambiar de sección.');
      } else {
        alert('Error al guardar: ' + error.message);
      }
    }
    setSaving(false);
  };

  if (loading) {
    return <div className="text-white p-8">Cargando perfil...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-10 rounded-[3rem] border ${isDarkMode ? 'bg-white/5 border-white/10 backdrop-blur-xl' : 'bg-white border-gray-100 shadow-2xl'}`}
      >
        <div className="flex items-center gap-4 mb-10 pb-6 border-b border-gray-500/20">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-gold-500 to-gold-300 flex items-center justify-center text-vinotinto-900 shadow-lg shadow-gold-500/30">
            <User size={32} />
          </div>
          <div>
            <h2 className={`text-3xl font-black italic tracking-tighter uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Mi Perfil Personal
            </h2>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-widest mt-1">
              Ajustes de Cuenta y Apariencia
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          {/* FOTO DE PERFIL */}
          <div className="space-y-6">
            <h3 className={`text-lg font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              <Camera className="w-5 h-5 text-vinotinto-500" /> Foto de Perfil
            </h3>
            
            <div className="flex items-center gap-6">
              <div className="w-32 h-32 rounded-[2rem] bg-gray-800 flex-shrink-0 overflow-hidden border-4 border-white/10 shadow-2xl relative group">
                <img 
                  src={profile.avatar_url || '/Fondo-Nuevo.png'} 
                  alt="Avatar" 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => { e.target.src = '/Fondo-Nuevo.png' }}
                />
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Enlace de la imagen (URL)</label>
                <div className="relative">
                  <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                  <input 
                    type="url"
                    value={profile.avatar_url || ''}
                    onChange={(e) => setProfile({...profile, avatar_url: e.target.value})}
                    placeholder="https://ejemplo.com/mifoto.jpg"
                    className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-gold-500 transition-colors"
                  />
                </div>
                <p className="text-[10px] text-gray-400 font-medium">Pega el link de cualquier imagen de internet para usarla como foto de perfil.</p>
              </div>
            </div>
          </div>

          {/* DATOS PERSONALES */}
          <div className="space-y-6">
            <h3 className={`text-lg font-black uppercase tracking-widest flex items-center gap-2 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
              <Copy className="w-5 h-5 text-gold-500" /> Datos Personales
            </h3>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Nombre Completo</label>
                <input 
                  type="text"
                  required
                  value={profile.full_name || ''}
                  onChange={(e) => setProfile({...profile, full_name: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 text-white text-sm rounded-2xl px-5 py-4 outline-none focus:border-vinotinto-500 mt-1"
                />
              </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Cédula</label>
                   <input 
                     type="text"
                     disabled
                     value={profile.id_card || 'N/A'}
                     className="w-full bg-black/40 border border-white/5 text-gray-400 text-sm rounded-2xl px-5 py-4 outline-none mt-1 cursor-not-allowed"
                   />
                 </div>
                 <div>
                   <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Expediente (Rol)</label>
                   <input 
                     type="text"
                     disabled
                     value={profile.role?.toUpperCase() || ''}
                     className="w-full bg-black/40 border border-white/5 text-gray-400 text-[10px] font-black tracking-widest rounded-2xl px-5 py-4 outline-none mt-1 cursor-not-allowed"
                   />
                 </div>
               </div>
            </div>
          </div>

          <div className="md:col-span-2 mt-6 pt-8 border-t border-gray-500/20 flex justify-end">
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-3 bg-gradient-to-r from-vinotinto-600 to-vinotinto-800 hover:from-vinotinto-500 hover:to-vinotinto-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl shadow-vinotinto-900/50 hover:scale-105"
            >
               {saving ? 'Guardando cambios...' : 'Confirmar Cambios'} <Save className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
