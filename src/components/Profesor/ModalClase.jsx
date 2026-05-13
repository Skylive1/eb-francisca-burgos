import React from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Save, X, Trash2 } from 'lucide-react';

const ModalClase = ({ 
  isOpen, 
  onClose, 
  isDarkMode, 
  editandoClaseID, 
  nuevaClase, 
  setNuevaClase, 
  lapsos, 
  guardarClase,
  eliminarClase 
}) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
        {/* Overlay con Blur */}
        <Motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md" 
        />
        
        {/* Contenido del Modal */}
        <Motion.div 
          initial={{ y: 20, opacity: 0, scale: 0.95 }} 
          animate={{ y: 0, opacity: 1, scale: 1 }} 
          exit={{ y: 20, opacity: 0, scale: 0.95 }} 
          className={`relative w-full max-w-lg rounded-[3rem] p-10 border shadow-2xl overflow-hidden ${isDarkMode ? 'bg-[#0f1115] border-white/10' : 'bg-white border-slate-100'}`}
        >
           <div className="flex justify-between items-start mb-8">
             <div>
               <h3 className={`text-3xl font-black uppercase tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-vinotinto-900'}`}>
                 {editandoClaseID ? 'Editar' : 'Nueva'} <span className="text-vinotinto-500">Clase</span>
               </h3>
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">Configuración de Lapso</p>
             </div>
             <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all">
               <X size={20} />
             </button>
           </div>

             <div className="space-y-10">
               <div>
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ml-4 mb-4 block ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>Nombre de la Clase / Tema</label>
                  <input 
                    value={nuevaClase.titulo} 
                    onChange={e => setNuevaClase({...nuevaClase, titulo: e.target.value})} 
                    placeholder="Ej: Álgebra Superior, Historia Universal..." 
                    className={`w-full rounded-[2rem] px-8 py-6 text-xl font-black uppercase italic tracking-tighter border-4 focus:border-vinotinto-500 outline-none transition-all shadow-inner ${isDarkMode ? 'bg-white/5 border-white/5 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`} 
                  />
               </div>

               <div>
                  <label className={`text-[11px] font-black uppercase tracking-[0.2em] ml-4 mb-4 block ${isDarkMode ? 'text-white/60' : 'text-slate-500'}`}>Asignar a Lapso</label>
                  <div className="grid grid-cols-3 gap-4">
                    {lapsos.map(l => (
                      <button
                        key={l}
                        onClick={() => setNuevaClase({...nuevaClase, lapso: l})}
                        className={`py-6 rounded-[1.5rem] text-sm font-black uppercase tracking-widest transition-all border-4 ${
                          nuevaClase.lapso === l 
                            ? 'bg-vinotinto-800 border-vinotinto-500 text-white shadow-xl shadow-vinotinto-900/30 scale-105' 
                            : isDarkMode ? 'bg-white/5 border-white/5 text-gray-500' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        Lapso {l}
                      </button>
                    ))}
                  </div>
               </div>

               <div className="flex gap-4">
                 {editandoClaseID && (
                   <button 
                    onClick={eliminarClase} 
                    className="py-7 px-8 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-[2.5rem] shadow-sm hover:scale-[1.02] active:scale-95 transition-all group flex items-center justify-center"
                    title="Eliminar Clase Entera"
                   >
                     <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                   </button>
                 )}
                 <button 
                  onClick={guardarClase} 
                  className="flex-1 py-7 bg-vinotinto-800 text-white rounded-[2.5rem] font-black uppercase tracking-[0.2em] text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all group flex items-center justify-center gap-4"
                 >
                   <Save size={20} className="group-hover:rotate-12 transition-transform" />
                   {editandoClaseID ? 'Actualizar Información' : 'Registrar Clase'}
                 </button>
               </div>
             </div>
          </Motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
};

export default ModalClase;
