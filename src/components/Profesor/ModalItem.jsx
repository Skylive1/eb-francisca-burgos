import React from 'react';
import { createPortal } from 'react-dom';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { X, FileText, DownloadCloud, Play, Link, Calendar, Clock, Award, Save, Video, Loader2, Plus, HelpCircle, Trash2 } from 'lucide-react';

const ModalItem = ({
  isOpen, onClose, isDarkMode, editandoID, guardarItem,
  tipoNuevo, setTipoNuevo, tipoConfig, setFilePreview,
  lapsos, form, setForm, lecciones, archivoArrastrando, setArchivoArrastrando,
  handleFileDrop, fileInputRef, filePreview, processFile, isSaving
}) => {
  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 md:p-10">
        {/* Overlay con Blur y Scroll */}
        <Motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }} 
          onClick={onClose} 
          className="absolute inset-0 bg-slate-950/60 backdrop-blur-md"
        />
        
        {/* Contenedor del Modal */}
        <Motion.div 
          initial={{ scale: 0.9, opacity: 0, y: 20 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.9, opacity: 0, y: 20 }} 
          className={`relative w-full max-w-2xl rounded-[3rem] border shadow-2xl flex flex-col max-h-[85vh] overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-100'}`}
        >
           {/* Header Fijo */}
           <div className="flex justify-between items-center p-8 border-b border-slate-100/10">
              <div>
                <h3 className={`text-2xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{editandoID ? 'Editar' : 'Nuevo'} Contenido</h3>
                <p className="text-[10px] font-bold text-vinotinto-800 uppercase tracking-widest mt-1">Configuración Académica</p>
              </div>
              <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:bg-red-500 hover:text-white transition-all"><X size={20} /></button>
           </div>

           <form onSubmit={e => { e.preventDefault(); guardarItem(); }} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
              {/* PASO 1: TIPO */}
              <div className="space-y-4">
                <p className={`text-[11px] font-black uppercase tracking-widest ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>1. Tipo de Contenido</p>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                  {Object.entries(tipoConfig).map(([key, cfg]) => (
                    <button key={key} type="button" onClick={() => { setTipoNuevo(key); setFilePreview(null); }} className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-2 border-2 transition-all ${tipoNuevo === key ? `${cfg.bg} ${cfg.color} border-current scale-105` : isDarkMode ? 'bg-slate-800/40 border-transparent text-slate-600' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-white hover:border-slate-200'}`}>
                      {React.cloneElement(cfg.icon, { size: 18 })}
                      <span className="text-[8px] font-black uppercase">{cfg.label}</span>
                    </button>
                  ))}
                </div>
              </div>

                  {/* PASO 2: UBICACIÓN Y CLASE */}
                  <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-slate-800/20 border-white/5' : 'bg-slate-50/50 border-slate-100 shadow-inner'}`}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                      <div className="md:col-span-4 space-y-3">
                        <label className={`text-[11px] font-black uppercase tracking-widest ml-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Lapso</label>
                        <div className="flex bg-white/10 p-1 rounded-xl border border-white/5 gap-1">
                          {lapsos.map(l => (
                            <button key={l} type="button" onClick={() => setForm({...form, lapso: l, leccionId: ''})} className={`flex-1 py-3 rounded-lg text-[11px] font-black uppercase transition-all ${form.lapso === l ? 'bg-vinotinto-800 text-white shadow-md' : 'text-slate-500 hover:bg-white/5'}`}>
                              {l}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="md:col-span-8 space-y-3">
                        <label className={`text-[11px] font-black uppercase tracking-widest ml-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Asignar a Clase</label>
                        <select required value={form.leccionId} onChange={e => setForm({...form, leccionId: e.target.value})} className={`w-full rounded-xl px-6 py-4 text-sm font-bold border-2 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-vinotinto-500' : 'bg-white border-slate-100 text-slate-900 focus:border-vinotinto-800 shadow-sm'}`}>
                          <option value="">Elegir clase...</option>
                          {lecciones.filter(l => l.lapso === form.lapso).map((l, i) => <option key={l.id} value={l.id}>TEMA {i+1}: {l.title}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                               {/* PASO 3: CONFIGURACIÓN ESPECÍFICA */}
                  <div className="space-y-6">
                    {/* TEXTO */}
                    {tipoNuevo === 'texto' && (
                      <div className="flex bg-slate-100 p-1 rounded-[1.5rem] gap-1 max-w-sm mx-auto">
                         <button type="button" onClick={() => setForm({...form, textType: 'title'})} className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${form.textType === 'title' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Título</button>
                         <button type="button" onClick={() => setForm({...form, textType: 'simple'})} className={`flex-1 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${form.textType === 'simple' ? 'bg-amber-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}>Cuerpo de Texto</button>
                      </div>
                    )}

                    {/* ARCHIVO (GUIAS) */}
                    {tipoNuevo === 'guia' && (
                      <div 
                        onDragOver={(e) => { e.preventDefault(); setArchivoArrastrando(true); }}
                        onDragLeave={() => setArchivoArrastrando(false)}
                        onDrop={handleFileDrop}
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative border-2 border-dashed rounded-[2.5rem] p-10 flex flex-col items-center justify-center transition-all cursor-pointer group ${archivoArrastrando ? 'bg-emerald-500/10 border-emerald-500 scale-[1.01]' : isDarkMode ? 'bg-slate-900/50 border-slate-800 hover:border-emerald-500/50' : 'bg-white border-slate-100 hover:border-emerald-500/50 shadow-md'}`}
                      >
                        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} />
                        {filePreview ? (
                          <div className="text-center animate-scale-up">
                            <div className="w-16 h-16 bg-emerald-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                              <FileText size={32} />
                            </div>
                            <h4 className="text-sm font-black uppercase italic tracking-tighter text-emerald-600">{filePreview.name}</h4>
                            <p className="text-[10px] font-black text-slate-400 mt-1 uppercase">{filePreview.type} • {filePreview.size}</p>
                          </div>
                        ) : (
                          <>
                            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:rotate-6 transition-transform">
                              <DownloadCloud size={28} />
                            </div>
                            <h4 className={`text-xs font-black uppercase tracking-[0.2em] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Subir Guía Académica</h4>
                            <p className="text-[10px] text-slate-400 font-bold mt-2 uppercase tracking-widest text-center max-w-[250px]">PDF, Word o material de apoyo</p>
                          </>
                        )}
                      </div>
                    )}

                    {/* TAREA (NUEVO: FECHA LÍMITE + PREVIEW DE ENTREGA) */}
                    {tipoNuevo === 'tarea' && (
                      <div className="space-y-6 animate-fade-in">
                        <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-rose-500/5 border-rose-500/10' : 'bg-rose-50 border-rose-100 shadow-inner'}`}>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                                  <Calendar size={14} /> Fecha Límite de Entrega
                                </label>
                                <input 
                                  type="date" 
                                  value={form.fecha_entrega} 
                                  onChange={e => setForm({...form, fecha_entrega: e.target.value})}
                                  className={`w-full rounded-xl px-5 py-4 text-xs font-black border-2 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-rose-500' : 'bg-white border-white text-slate-900 focus:border-rose-500 shadow-sm'}`}
                                />
                              </div>
                              <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-rose-600 flex items-center gap-2">
                                  <Clock size={14} /> Hora Máxima (Opcional)
                                </label>
                                <input type="time" className={`w-full rounded-xl px-5 py-4 text-xs font-black border-2 outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white focus:border-rose-500' : 'bg-white border-white text-slate-900 focus:border-rose-500 shadow-sm'}`} />
                              </div>
                           </div>
                        </div>

                        <div className="space-y-3">
                           <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 text-center">Así verán los alumnos el área de entrega:</p>
                           <div className={`border-2 border-dashed border-slate-300 rounded-[2rem] p-8 flex flex-col items-center justify-center opacity-60 grayscale`}>
                              <div className="w-10 h-10 bg-slate-100 text-slate-400 rounded-lg flex items-center justify-center mb-3">
                                <DownloadCloud size={20} />
                              </div>
                              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Entrega tus archivos aquí</p>
                           </div>
                        </div>
                      </div>
                    )}

                     {/* CUESTIONARIO (NUEVO: Generador de Preguntas y Respuestas) */}
                     {tipoNuevo === 'cuestionario' && (
                       <div className="space-y-6 animate-fade-in">
                          <div className={`p-6 md:p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-indigo-500/5 border-indigo-500/10' : 'bg-indigo-50 border-indigo-100 shadow-inner'}`}>
                             <div className="flex items-center justify-between mb-8">
                                <div>
                                   <h4 className="text-[11px] font-black uppercase tracking-widest text-indigo-600 flex items-center gap-2">
                                     <HelpCircle size={16} /> Generador de Preguntas
                                   </h4>
                                   <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Crea evaluaciones interactivas</p>
                                </div>
                                <div className="flex items-center gap-3">
                                   <div className="text-right mr-4">
                                      <p className="text-[10px] font-black uppercase text-slate-400">Tiempo Límite</p>
                                      <div className="flex items-center gap-2 mt-1">
                                         <Clock size={14} className="text-indigo-500" />
                                         <input 
                                           type="number" 
                                           placeholder="Minutos"
                                           value={form.duracion || 60}
                                           onChange={e => setForm({...form, duracion: parseInt(e.target.value)})}
                                           className={`w-20 bg-transparent border-b-2 text-center text-sm font-black outline-none focus:border-indigo-500 ${isDarkMode ? 'text-white border-slate-700' : 'text-slate-900 border-indigo-100'}`}
                                         />
                                         <span className="text-[10px] font-bold text-slate-400 uppercase">Min</span>
                                      </div>
                                   </div>
                                   <div className="px-4 py-1.5 rounded-full bg-indigo-500 text-white text-[10px] font-black uppercase shadow-lg shadow-indigo-500/20">
                                      {form.preguntas.length} Preguntas
                                   </div>
                                </div>
                             </div>

                             <div className="space-y-6">
                                {form.preguntas.map((pregunta, pIdx) => (
                                  <div key={pIdx} className={`p-6 rounded-[2rem] border-2 transition-all relative group ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-white shadow-sm'}`}>
                                     {/* Botón Eliminar Pregunta */}
                                     <button 
                                       type="button" 
                                       onClick={() => {
                                         const nuevas = [...form.preguntas];
                                         nuevas.splice(pIdx, 1);
                                         setForm({...form, preguntas: nuevas});
                                       }}
                                       className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95"
                                     >
                                       <X size={14} />
                                     </button>

                                     <div className="space-y-5">
                                        <div className="flex items-center gap-4">
                                           <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black text-sm shrink-0">
                                              {pIdx + 1}
                                           </div>
                                           <div className="flex-1 relative">
                                              <input 
                                                required
                                                placeholder="Escribe el enunciado de la pregunta aquí..."
                                                value={pregunta.texto}
                                                onChange={e => {
                                                   const nuevas = [...form.preguntas];
                                                   nuevas[pIdx].texto = e.target.value;
                                                   setForm({...form, preguntas: nuevas});
                                                }}
                                                className={`w-full bg-transparent border-b-2 py-2 text-sm font-black outline-none transition-all ${isDarkMode ? 'border-slate-800 focus:border-indigo-500 text-white' : 'border-slate-100 focus:border-indigo-500 text-slate-900'}`}
                                              />
                                              <span className="absolute right-0 top-1/2 -translate-y-1/2 text-[9px] font-black text-indigo-400 uppercase">
                                                Valor: {Math.round(100 / (form.preguntas.length || 1))}%
                                              </span>
                                           </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-14">
                                           {pregunta.respuestas.map((resp, rIdx) => (
                                              <div key={rIdx} className="flex items-center gap-3 animate-slide-in">
                                                 <button 
                                                   type="button"
                                                   onClick={() => {
                                                      const nuevas = [...form.preguntas];
                                                      nuevas[pIdx].correcta = rIdx;
                                                      setForm({...form, preguntas: nuevas});
                                                   }}
                                                   className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${pregunta.correcta === rIdx ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'}`}
                                                 >
                                                   {pregunta.correcta === rIdx && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                                                 </button>
                                                 <div className="flex-1 relative group/opt">
                                                    <input 
                                                      required
                                                      placeholder={`Opción ${rIdx + 1}`}
                                                      value={resp}
                                                      onChange={e => {
                                                         const nuevas = [...form.preguntas];
                                                         nuevas[pIdx].respuestas[rIdx] = e.target.value;
                                                         setForm({...form, preguntas: nuevas});
                                                      }}
                                                      className={`w-full bg-transparent border-b py-1 text-xs font-bold outline-none transition-all ${isDarkMode ? 'border-slate-800 focus:border-emerald-500 text-slate-400' : 'border-slate-50 focus:border-emerald-500 text-slate-600'}`}
                                                    />
                                                    {pregunta.respuestas.length > 2 && (
                                                      <button 
                                                        type="button"
                                                        onClick={() => {
                                                           const nuevas = [...form.preguntas];
                                                           nuevas[pIdx].respuestas.splice(rIdx, 1);
                                                           if (nuevas[pIdx].correcta === rIdx) nuevas[pIdx].correcta = 0;
                                                           setForm({...form, preguntas: nuevas});
                                                        }}
                                                        className="absolute right-0 top-1/2 -translate-y-1/2 opacity-0 group-hover/opt:opacity-100 text-slate-300 hover:text-rose-500 transition-all"
                                                      >
                                                        <Trash2 size={12} />
                                                      </button>
                                                    )}
                                                 </div>
                                              </div>
                                           ))}
                                           
                                           <button 
                                             type="button"
                                             onClick={() => {
                                                const nuevas = [...form.preguntas];
                                                nuevas[pIdx].respuestas.push('');
                                                setForm({...form, preguntas: nuevas});
                                             }}
                                             className="flex items-center gap-2 text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-600 transition-all py-2"
                                           >
                                              <div className="w-5 h-5 rounded-lg bg-indigo-100 flex items-center justify-center">
                                                <Plus size={12} />
                                              </div>
                                              Añadir Opción
                                           </button>
                                        </div>
                                     </div>
                                  </div>
                                ))}
                             </div>

                             <button 
                               type="button"
                               onClick={() => {
                                  setForm({
                                     ...form,
                                     preguntas: [
                                        ...form.preguntas,
                                        { texto: '', respuestas: ['', ''], correcta: 0 }
                                     ]
                                  });
                               }}
                               className="w-full mt-8 py-5 rounded-2xl border-4 border-dashed border-indigo-200 dark:border-indigo-900/20 flex items-center justify-center gap-4 text-[11px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500 transition-all group/add"
                             >
                                <div className="w-8 h-8 rounded-full bg-indigo-500 text-white flex items-center justify-center shadow-lg group-hover:rotate-90 transition-transform">
                                   <Plus size={20} />
                                </div>
                                Añadir Nueva Pregunta al Cuestionario
                             </button>
                          </div>
                       </div>
                     )}

                    {/* VIDEO */}
                    {tipoNuevo === 'video' && (
                      <div className="space-y-4 animate-fade-in">
                         <div className="flex bg-blue-50/50 p-1 rounded-2xl gap-1 border border-blue-100/50 max-w-md mx-auto">
                            {[
                              { id: 'upload', label: 'Archivo', icon: <DownloadCloud size={14} /> },
                              { id: 'youtube', label: 'YouTube', icon: <Play size={14} /> },
                              { id: 'other', label: 'Enlace', icon: <Link size={14} /> }
                            ].map(v => (
                              <button key={v.id} type="button" onClick={() => { setForm({...form, videoSource: v.id}); setFilePreview(null); }} className={`flex-1 py-3 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all ${form.videoSource === v.id ? 'bg-blue-600 text-white shadow-lg' : 'text-blue-400 hover:bg-blue-100/50'}`}>
                                {v.icon} {v.label}
                              </button>
                            ))}
                         </div>

                         <div className={`p-8 rounded-[2.5rem] border-2 border-dashed transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-blue-100 shadow-sm'}`}>
                            {form.videoSource === 'upload' ? (
                              <div 
                                onDragOver={(e) => { e.preventDefault(); setArchivoArrastrando(true); }}
                                onDragLeave={() => setArchivoArrastrando(false)}
                                onDrop={handleFileDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`flex flex-col items-center justify-center py-6 cursor-pointer group ${archivoArrastrando ? 'scale-105' : ''}`}
                              >
                                <input type="file" ref={fileInputRef} className="hidden" accept="video/*" onChange={(e) => e.target.files[0] && processFile(e.target.files[0])} />
                                {filePreview ? (
                                  <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-4 shadow-lg">
                                      <Video size={32} />
                                    </div>
                                    <h4 className="text-sm font-black uppercase text-blue-600">{filePreview.name}</h4>
                                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase">Listo para subir</p>
                                  </div>
                                ) : (
                                  <>
                                    <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                      <Video size={32} />
                                    </div>
                                    <h4 className={`text-xs font-black uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Arrastra tu video aquí</h4>
                                    <p className="text-[9px] text-slate-400 font-bold mt-2 uppercase tracking-widest text-center">O haz clic para buscar en tus archivos</p>
                                  </>
                                )}
                              </div>
                            ) : (
                              <div className="space-y-3 text-center">
                                <Play size={32} className="mx-auto text-blue-500 mb-2 opacity-50" />
                                <input 
                                  required
                                  value={form.url} 
                                  onChange={e => setForm({...form, url: e.target.value})} 
                                  placeholder={form.videoSource === 'youtube' ? "https://www.youtube.com/watch?v=..." : "https://sitio.com/video.mp4"} 
                                  className={`w-full rounded-xl px-8 py-5 text-sm font-bold border-2 focus:border-blue-500 outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`} 
                                />
                                <p className="text-[9px] font-bold text-slate-400 uppercase">Pega el link para que se muestre en el aula</p>
                              </div>
                            )}
                         </div>
                      </div>
                    )}

                    {/* ENLACES (Links externos) */}
                    {tipoNuevo === 'link' && (
                      <div className="space-y-4 animate-fade-in">
                        <div className={`p-8 rounded-[2.5rem] border-2 border-dashed transition-all ${isDarkMode ? 'bg-slate-900 border-indigo-900/30' : 'bg-indigo-50 border-indigo-100 shadow-inner'}`}>
                           <div className="flex flex-col items-center text-center space-y-4">
                              <div className="w-16 h-16 bg-indigo-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <Link size={32} />
                              </div>
                              <div className="w-full space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Dirección URL del Enlace</label>
                                <input 
                                  required
                                  value={form.url} 
                                  onChange={e => setForm({...form, url: e.target.value})} 
                                  placeholder="https://paginaweb.com/recurso" 
                                  className={`w-full rounded-2xl px-8 py-5 text-sm font-bold border-2 focus:border-indigo-500 outline-none transition-all ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-transparent text-slate-900 shadow-sm'}`} 
                                />
                                <p className="text-[9px] font-medium text-slate-400 italic">Los estudiantes podrán hacer clic para abrir este sitio en una nueva pestaña</p>
                              </div>
                           </div>
                        </div>
                      </div>
                    )}

                    {/* PASO 4: INFORMACIÓN GENERAL */}
                    <div className="space-y-6 pt-6 border-t border-slate-100/10">
                      <div className="space-y-3">
                        <label className={`text-[11px] font-black uppercase tracking-widest ml-4 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Nombre del Contenido</label>
                        <input 
                          required 
                          value={form.titulo} 
                          onChange={e => setForm({...form, titulo: e.target.value})} 
                          placeholder="Escribe el nombre aquí..." 
                          className={`w-full rounded-[1.8rem] px-8 py-6 italic tracking-tighter border-4 focus:border-vinotinto-800 outline-none transition-all ${
                            tipoNuevo === 'texto' && form.textType === 'title' 
                              ? 'text-3xl font-black uppercase' 
                              : 'text-xl font-bold'
                          } ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white shadow-inner' : 'bg-slate-50 border-transparent text-slate-900 shadow-inner'}`} 
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <label className={`text-[12px] font-black uppercase tracking-widest ml-4 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Fuentes Bibliográficas</label>
                          <div className="relative">
                            <Link size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input value={form.fuentes} onChange={e => setForm({...form, fuentes: e.target.value})} placeholder="Libros, autores, sitios web..." className={`w-full rounded-2xl pl-14 pr-8 py-5 text-sm font-bold border-2 outline-none ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-100 border-transparent text-slate-700 shadow-sm'}`} />
                          </div>
                        </div>

                        {(tipoNuevo === 'tarea' || tipoNuevo === 'cuestionario') && (
                          <div className="space-y-3 animate-fade-in">
                            <label className={`text-[12px] font-black uppercase tracking-widest ml-4 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Puntaje Máximo</label>
                            <div className="relative">
                              <Award size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-amber-500" />
                              <input type="number" value={form.puntos} onChange={e => setForm({...form, puntos: parseInt(e.target.value)})} className={`w-full rounded-xl pl-14 pr-8 py-5 text-sm font-black border-2 border-amber-500/20 outline-none ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-amber-50/50 text-slate-700 shadow-sm'}`} />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <label className={`text-[11px] font-black uppercase tracking-widest ml-4 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Instrucciones Detalladas</label>
                        <textarea value={form.descripcion} onChange={e => setForm({...form, descripcion: e.target.value})} rows={3} placeholder="Explica a tus alumnos de qué trata este contenido..." className={`w-full rounded-[2rem] px-8 py-6 text-sm font-bold border-2 focus:border-vinotinto-800 outline-none transition-all shadow-inner ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`} />
                      </div>
                    </div>
                  </div>
                <button type="submit" disabled={isSaving} className={`w-full py-6 text-white rounded-[2rem] font-black uppercase tracking-widest text-[13px] shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 ${isSaving ? 'bg-slate-400 cursor-wait' : 'bg-vinotinto-800'}`}>
                  {isSaving ? <Loader2 className="animate-spin" /> : <Save size={22} />}
                  {isSaving ? 'Subiendo archivo...' : (editandoID ? 'Actualizar Elemento' : 'Publicar en el Aula')}
                </button>
             </form>
          </Motion.div>
        </div>
    </AnimatePresence>,
    document.body
  );
};

export default ModalItem;
