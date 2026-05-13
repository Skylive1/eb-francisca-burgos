import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Trophy, MessageCircle, Zap, Shield, Eye, EyeOff } from 'lucide-react';

const SettingsPanel = ({ isOpen, onClose }) => {
  const [pref, setPref] = useState({
    xp: true,
    challenges: true,
    community: true,
    system: false
  });

  const toggle = (key) => setPref(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-[100]"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-[3rem] shadow-2xl z-[101] overflow-hidden border border-gray-100"
          >
            <div className="p-10">
              <div className="flex items-center justify-between mb-10">
                <div>
                  <h3 className="text-3xl font-black text-gray-900 italic tracking-tighter leading-none mb-2">AJUSTES</h3>
                  <p className="text-[10px] font-black uppercase tracking-widest text-vinotinto-600">Preferencias del Sistema</p>
                </div>
                <button onClick={onClose} className="p-3 bg-gray-50 rounded-2xl text-gray-400 hover:text-vinotinto-800 transition-all">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gold-100 text-gold-700 rounded-2xl flex items-center justify-center">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-gray-900 uppercase tracking-tight">Progreso & XP</h5>
                      <p className="text-[10px] font-bold text-gray-400">Avisos de nivel y recompensas</p>
                    </div>
                  </div>
                  <button onClick={() => toggle('xp')} className={`p-2 rounded-xl transition-all ${pref.xp ? 'bg-vinotinto-800 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {pref.xp ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center">
                      <Zap className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-gray-900 uppercase tracking-tight">Retos Flash</h5>
                      <p className="text-[10px] font-bold text-gray-400">Nuevos desafíos semanales</p>
                    </div>
                  </div>
                  <button onClick={() => toggle('challenges')} className={`p-2 rounded-xl transition-all ${pref.challenges ? 'bg-vinotinto-800 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {pref.challenges ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-sm font-black text-gray-900 uppercase tracking-tight">Comunidad</h5>
                      <p className="text-[10px] font-bold text-gray-400">Likes y respuestas en el foro</p>
                    </div>
                  </div>
                  <button onClick={() => toggle('community')} className={`p-2 rounded-xl transition-all ${pref.community ? 'bg-vinotinto-800 text-white' : 'bg-gray-200 text-gray-400'}`}>
                    {pref.community ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="mt-10 pt-8 border-t border-gray-100 flex gap-4">
                <button onClick={onClose} className="flex-1 py-5 bg-gray-900 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl shadow-gray-200">
                  Guardar Cambios
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsPanel;
