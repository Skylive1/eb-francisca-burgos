import React, { useState, useRef } from 'react';
import { Reorder } from 'framer-motion';

/**
 * COMPONENTE: GestorContenido (Modo Clases)
 * --------------------------------------------------------
 * Estructura: Lapso -> Clase (Sesión) -> Materiales.
 * Permite gestionar el contenido académico por sesiones.
 */
const GestorContenido = ({ clase, soloMateriales = true }) => {
  const [modalMaterialAbierto, setModalMaterialAbierto] = useState(false);
  const [modalClaseAbierto, setModalClaseAbierto] = useState(false);
  const [editandoMaterialID, setEditandoMaterialID] = useState(null);
  const [editandoClaseID, setEditandoClaseID] = useState(null);
  const [tipoNuevo, setTipoNuevo] = useState('guia');
  const [videoSource, setVideoSource] = useState('youtube'); 
  const [modoVistaPrevia, setModoVistaPrevia] = useState(false);
  const [claseExpandida, setClaseExpandida] = useState(null);
  const fileInputRef = useRef(null);
  
  // --- ESTADOS ---
  const [lecciones, setLecciones] = useState([
    { id: 101, lapso: '1', titulo: 'Introducción a la Lógica' },
    { id: 102, lapso: '1', titulo: 'Teoría de Conjuntos' },
  ]);

  const [materiales, setMateriales] = useState([
    { id: 1, leccionId: 101, tipo: 'guia', formato: 'pdf', titulo: 'Guía de Inicio.pdf', descripcion: 'Conceptos iniciales.', fecha: '05 Abr 2026', fuente: 'Ministerio' },
  ]);

  const [formMaterial, setFormMaterial] = useState({ titulo: '', descripcion: '', url: '', lapso: '1', leccionId: '', formato: 'pdf', fuente: '' });
  const [formLeccion, setFormLeccion] = useState({ lapso: '1', titulo: 'Clase - Autoria' });

  // --- CONFIGURACIONES ---
  const tipoConfig = {
    texto:   { icon: 'M4 6h16M4 12h16M4 18h7', bg: 'bg-amber-100', color: 'text-amber-600', label: 'Cuadro de Texto' },
    guia:    { icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', bg: 'bg-vinotinto-100', color: 'text-vinotinto-600', label: 'Guía / Material' },
    video:   { icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', bg: 'bg-blue-100', color: 'text-blue-600', label: 'Video Clase' },
    recurso: { icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1', bg: 'bg-orange-100', color: 'text-orange-600', label: 'Recurso Externo' },
  };

  const formatConfigs = {
    pdf:        { icon: 'M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'text-red-500', bg: 'bg-red-50', label: 'PDF' },
    word:       { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', color: 'text-blue-500', bg: 'bg-blue-50', label: 'Word' },
    excel:      { icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-green-500', bg: 'bg-green-50', label: 'Excel' },
    powerpoint: { icon: 'M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z', color: 'text-orange-500', bg: 'bg-orange-50', label: 'PowerPoint' },
    canva:      { icon: 'M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z', color: 'text-indigo-500', bg: 'bg-indigo-50', label: 'Canva' },
    img:        { icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'text-purple-500', bg: 'bg-purple-50', label: 'Imagen' },
  };

  const lapsos = ['1', '2', '3'];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const ext = file.name.split('.').pop().toLowerCase();
    let detectFormat = 'pdf';
    if (['doc', 'docx'].includes(ext)) detectFormat = 'word';
    else if (['xls', 'xlsx'].includes(ext)) detectFormat = 'excel';
    else if (['ppt', 'pptx'].includes(ext)) detectFormat = 'powerpoint';
    else if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) detectFormat = 'img';
    
    setFormMaterial(prev => ({ ...prev, titulo: file.name, formato: detectFormat }));
  };

  const handleReorder = (newOrder, leccionId) => {
    setMateriales(prev => {
      const filtered = prev.filter(m => m.leccionId !== leccionId);
      return [...filtered, ...newOrder];
    });
  };

  const abrirModalClase = (lec = null) => {
    if (lec) {
      setEditandoClaseID(lec.id);
      setFormLeccion({ lapso: lec.lapso, titulo: lec.titulo });
    } else {
      setEditandoClaseID(null);
      setFormLeccion({ lapso: '1', titulo: 'Clase - Autoria' });
    }
    setModalClaseAbierto(true);
  };

  const agregarLeccion = () => {
    if (!formLeccion.titulo.trim()) return;
    if (editandoClaseID) {
      setLecciones(prev => prev.map(l => l.id === editandoClaseID ? { ...l, ...formLeccion } : l));
    } else {
      setLecciones(prev => [...prev, { id: Date.now(), ...formLeccion }]);
    }
    setModalClaseAbierto(false);
    setFormLeccion({ lapso: '1', titulo: 'Clase - Autoria' });
  };

  const abrirModalMaterial = (mat = null, lessonId = null) => {
    if (mat) {
      setEditandoMaterialID(mat.id);
      setTipoNuevo(mat.tipo || 'guia');
      setFormMaterial({ ...mat });
    } else {
      setEditandoMaterialID(null);
      setFormMaterial({ titulo: '', descripcion: '', url: '', lapso: '1', leccionId: lessonId || '', formato: 'pdf', fuente: '' });
    }
    setModalMaterialAbierto(true);
  };

  const guardarMaterial = () => {
    if (!formMaterial.titulo.trim() || !formMaterial.leccionId) return alert('Selecciona una clase');
    if (editandoMaterialID) {
      setMateriales(prev => prev.map(m => m.id === editandoMaterialID ? { ...m, ...formMaterial, tipo: tipoNuevo } : m));
    } else {
      setMateriales(prev => [...prev, { id: Date.now(), tipo: tipoNuevo, ...formMaterial, fecha: new Date().toLocaleDateString('es-VE') }]);
    }
    setModalMaterialAbierto(false);
  };

  const eliminarMaterial = (id) => {
    if (window.confirm('¿Estás seguro de eliminar este contenido?')) {
      setMateriales(prev => prev.filter(m => m.id !== id));
      setModalMaterialAbierto(false);
    }
  };

  const eliminarClase = (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta clase?')) {
      setLecciones(prev => prev.filter(l => l.id !== id));
      setMateriales(prev => prev.filter(m => m.leccionId !== id));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in text-gray-800">
      
      {/* Cabecera Principal */}
      <div className="flex items-center justify-between bg-white p-7 rounded-3xl border border-gray-100 shadow-sm">
        <div>
          <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Centro de Planificación</p>
          <h2 className="text-2xl font-black text-vinotinto-800 italic uppercase tracking-tighter">Gestión de Clases</h2>
        </div>
        <div className="flex gap-4">
           {!modoVistaPrevia ? (
             <>
               <button onClick={() => setModoVistaPrevia(true)} className="px-6 py-3 bg-blue-50 text-blue-600 border border-blue-100 text-[10px] font-black rounded-xl hover:bg-blue-100 transition-all uppercase tracking-widest shadow-sm flex items-center gap-2">
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                 Vista Estudiante
               </button>
               <button onClick={() => abrirModalClase()} className="px-6 py-3 bg-white border-2 border-gray-50 text-gray-400 text-[10px] font-black rounded-[1.2rem] hover:bg-gray-50 transition-all uppercase tracking-widest shadow-sm">Nueva Clase</button>
               <button onClick={() => abrirModalMaterial()} className="px-6 py-3 bg-vinotinto-800 text-white text-[10px] font-black rounded-[1.2rem] hover:bg-vinotinto-900 shadow-2xl shadow-vinotinto-100 transition-all uppercase tracking-widest">Sube Contenido</button>
             </>
           ) : (
             <button onClick={() => setModoVistaPrevia(false)} className="px-6 py-3 bg-amber-50 text-amber-600 border border-amber-100 text-[10px] font-black rounded-xl hover:bg-amber-100 transition-all uppercase tracking-widest shadow-sm flex items-center gap-2">
               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
               Volver a Editar
             </button>
           )}
        </div>
      </div>

      {/* Lapsos */}
      <div className="space-y-10">
        {lapsos.map(lapso => {
          const clasesLapso = lecciones.filter(l => l.lapso === lapso);
          if (clasesLapso.length === 0) return null;
          return (
            <div key={lapso} className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                 <span className="px-5 py-2 bg-vinotinto-800 text-white text-[10px] font-black rounded-full uppercase tracking-widest italic shadow-lg shadow-vinotinto-100">Lapso {lapso} Académico</span>
                 <div className="flex-1 h-px bg-gray-200"></div>
              </div>

              <div className="grid gap-6">
                {clasesLapso.map((lec, idx) => {
                  const matLec = materiales.filter(m => m.leccionId === lec.id);
                  const isExpanded = claseExpandida === lec.id;

                  if (modoVistaPrevia) {
                    return (
                      <div key={lec.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group">
                        {/* Header Estudiante (Accordion) */}
                        <div 
                           onClick={() => setClaseExpandida(isExpanded ? null : lec.id)}
                           className="px-8 py-6 bg-white cursor-pointer hover:bg-gray-50 flex items-center justify-between transition-all"
                        >
                           <div className="flex items-center gap-5">
                              <div className="w-12 h-12 bg-vinotinto-800 text-white rounded-2xl flex items-center justify-center font-black shadow-md shrink-0">{idx+1}</div>
                              <h4 className="text-xl font-black text-gray-800 uppercase italic tracking-tighter">{lec.titulo}</h4>
                           </div>
                           <div className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                              <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7"/></svg>
                           </div>
                        </div>

                        {/* Contenido Estudiante */}
                        {isExpanded && (
                          <div className="px-8 pb-10 space-y-6 animate-fade-in border-t border-gray-50 bg-gray-50/20">
                             {matLec.length > 0 ? matLec.map(mat => {
                               const fCfg = mat.tipo === 'guia' ? formatConfigs[mat.formato] : null;
                               const cfg = mat.tipo === 'texto' ? tipoConfig.texto : mat.tipo === 'guia' ? { ...tipoConfig.guia, icon: fCfg.icon, color: fCfg.color, bg: fCfg.bg, label: fCfg.label } : (tipoConfig[mat.tipo] || tipoConfig.recurso);
                               return (
                                 <div key={mat.id} className="pt-8 first:pt-4 border-b border-gray-100/50 last:border-0 pb-6 last:pb-0">
                                    <div className="flex items-start gap-5">
                                       <div className={`w-12 h-12 ${cfg.bg} rounded-2xl flex items-center justify-center shadow-sm shrink-0`}><svg className={`w-6 h-6 ${cfg.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={cfg.icon}/></svg></div>
                                       <div className="flex-1 min-w-0">
                                          <p className="text-base font-black text-gray-900 uppercase italic mb-2 tracking-tight">{mat.titulo}</p>
                                          
                                          {mat.tipo === 'texto' ? (
                                            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-base text-gray-600 leading-relaxed font-medium whitespace-pre-wrap italic border-l-4 border-l-amber-400">
                                               {mat.descripcion}
                                            </div>
                                          ) : (
                                            <div className="flex flex-col gap-2">
                                               <p className="text-xs text-gray-400 font-medium italic">{mat.descripcion}</p>
                                               <div className="flex items-center gap-3 mt-2">
                                                  <button className={`px-5 py-2 ${cfg.bg} ${cfg.color} text-[10px] font-black rounded-xl uppercase tracking-widest border border-current/10 hover:brightness-95 transition-all`}>
                                                     {mat.tipo === 'video' ? 'Ver Video' : mat.tipo === 'guia' ? 'Descargar PDF' : 'Abrir Enlace'}
                                                  </button>
                                               </div>
                                            </div>
                                          )}
                                       </div>
                                    </div>
                                 </div>
                               );
                             }) : (
                               <div className="py-10 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest italic">Esta clase aún no tiene materiales asignados</div>
                             )}
                          </div>
                        )}
                      </div>
                    );
                  }

                  return (
                    <div key={lec.id} className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden group">
                      
                      {/* Header de la Clase */}
                      <div className="px-8 py-6 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-5">
                           <div className="w-14 h-14 bg-white rounded-3xl flex flex-col items-center justify-center shadow-sm border border-gray-100">
                              <span className="text-[8px] font-black text-vinotinto-800">CLASE</span>
                              <span className="text-xl font-black">{idx + 1}</span>
                           </div>
                           <div 
                              className={`${!modoVistaPrevia ? 'cursor-pointer group/title hover:translate-x-1' : ''} transition-transform`} 
                              onClick={() => !modoVistaPrevia && abrirModalClase(lec)}
                           >
                              <h4 className={`text-xl font-black uppercase italic tracking-tighter transition-colors ${!modoVistaPrevia ? 'text-gray-900 group-hover/title:text-vinotinto-800' : 'text-gray-900'}`}>{lec.titulo}</h4>
                           </div>
                        </div>
                        
                        {/* Botones de acción rápida */}
                        {!modoVistaPrevia && (
                          <button onClick={(e) => { e.stopPropagation(); eliminarClase(lec.id); }} className="p-3 hover:bg-red-50 text-red-300 hover:text-red-500 rounded-xl transition-all">
                             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>

                      {/* Lista de Materiales de la Clase */}
                      <Reorder.Group 
                         axis="y" 
                         values={matLec} 
                         onReorder={(newOrder) => handleReorder(newOrder, lec.id)}
                         className="divide-y divide-gray-50 border-t border-gray-100"
                      >
                         {matLec.map(mat => {
                           const fCfg = mat.tipo === 'guia' ? formatConfigs[mat.formato] : null;
                           const cfg = mat.tipo === 'texto' ? tipoConfig.texto : mat.tipo === 'guia' ? { ...tipoConfig.guia, icon: fCfg.icon, color: fCfg.color, bg: fCfg.bg, label: fCfg.label } : (tipoConfig[mat.tipo] || tipoConfig.recurso);
                           return (
                             <Reorder.Item 
                                key={mat.id} 
                                value={mat} 
                                drag={!modoVistaPrevia}
                                className={`flex items-center gap-6 px-10 py-6 transition-all group/item relative ${!modoVistaPrevia ? 'hover:bg-gray-50/50 cursor-grab active:cursor-grabbing' : 'bg-white'}`}
                             >
                                <div onClick={(e) => { e.stopPropagation(); !modoVistaPrevia && abrirModalMaterial(mat); }} className={`flex-1 flex items-center gap-6 ${!modoVistaPrevia ? 'cursor-pointer' : ''}`}>
                                   <div className={`w-12 h-12 ${cfg.bg} rounded-2xl flex items-center justify-center transition-transform ${!modoVistaPrevia ? 'group-hover/item:scale-110' : ''} shadow-sm`}><svg className={`w-6 h-6 ${cfg.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={cfg.icon}/></svg></div>
                                   <div className="flex-1 min-w-0">
                                      <p className={`text-base font-black leading-none uppercase italic tracking-tight transition-colors ${!modoVistaPrevia ? 'group-hover/item:text-vinotinto-800 text-gray-900' : 'text-gray-900'}`}>{mat.titulo}</p>
                                      <p className="text-xs text-gray-400 font-medium mt-1 truncate">{mat.descripcion}</p>
                                   </div>
                                   <div className="flex flex-col items-end">
                                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color} border border-current/20`}>{cfg.label}</span>
                                      <span className="text-[9px] text-gray-300 font-bold mt-1 uppercase italic">{mat.fecha}</span>
                                   </div>
                                </div>
                                {!modoVistaPrevia && (
                                  <div className="text-gray-200 group-hover/item:text-vinotinto-200 transition-colors">
                                     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M4 8h16M4 16h16"/></svg>
                                  </div>
                                )}
                             </Reorder.Item>
                           );
                         })}
                         {matLec.length === 0 && (
                           <div className="p-8 text-center text-[10px] font-black text-gray-300 uppercase italic">Usa el botón "Sube Contenido" en el menú superior para añadir material</div>
                         )}
                      </Reorder.Group>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL CLASE */}
      {modalClaseAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4" onClick={() => setModalClaseAbierto(false)}>
           <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-sm p-10 animate-scale-up" onClick={e => e.stopPropagation()}>
              <h3 className="text-2xl font-black italic uppercase italic mb-8 tracking-tighter">
                {editandoClaseID ? 'Editor de Referencia' : 'Nueva Sesión / Clase'}
              </h3>
              <div className="space-y-6 mb-10 text-gray-800">
                <div>
                  <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">Lapso</label>
                  <div className="flex gap-2">
                    {lapsos.map(l => (
                      <button key={l} onClick={() => setFormLeccion(prev => ({ ...prev, lapso: l }))} className={`flex-1 py-4 rounded-2xl font-black text-sm transition-all border-2 ${formLeccion.lapso === l ? 'bg-vinotinto-800 text-white border-vinotinto-800 shadow-xl shadow-vinotinto-200' : 'bg-gray-50 text-gray-400 border-transparent hover:bg-gray-100'}`}>{l}</button>
                    ))}
                  </div>
                </div>
                <input value={formLeccion.titulo} onChange={e => setFormLeccion(prev => ({ ...prev, titulo: e.target.value }))} className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl text-sm font-black tracking-tight text-gray-800 focus:outline-none focus:border-vinotinto-800 shadow-inner" placeholder="Título de la clase"/>
              </div>
              <div className="flex gap-4">
                 <button onClick={() => setModalClaseAbierto(false)} className="flex-1 py-4 bg-gray-50 text-gray-400 text-xs font-black rounded-2xl uppercase tracking-widest transition-all">Atrás</button>
                 {editandoClaseID && (
                    <button onClick={() => { eliminarClase(editandoClaseID); setModalClaseAbierto(false); }} className="flex-1 py-4 bg-red-50 text-red-500 text-xs font-black rounded-2xl uppercase tracking-widest border border-red-100">ELIMINAR</button>
                 )}
                 <button onClick={agregarLeccion} className="flex-1 py-4 bg-vinotinto-800 text-white text-xs font-black rounded-2xl uppercase tracking-widest shadow-xl transition-all active:scale-95">
                   {editandoClaseID ? 'GUARDAR' : 'Crear Clase'}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* MODAL MATERIAL */}
      {modalMaterialAbierto && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden" onClick={() => setModalMaterialAbierto(false)}>
           <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-lg border border-white flex flex-col max-h-[90vh] animate-scale-up text-gray-800" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/50 rounded-t-[3rem] flex-shrink-0">
                 <div>
                    <h3 className="text-2xl font-black italic tracking-tight uppercase">{editandoMaterialID ? 'Editar Contenido' : 'Cargar Contenido'}</h3>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Gestión académica de contenidos</p>
                 </div>
                 <button onClick={() => setModalMaterialAbierto(false)} className="p-3 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12"/></svg></button>
              </div>
              <div className="p-10 space-y-7 overflow-y-auto flex-1 custom-scrollbar">
                 <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Tipo de Material</label>
                    <div className="grid grid-cols-4 gap-2">
                       {Object.entries(tipoConfig).map(([key, cfg]) => (
                         <button key={key} onClick={() => setTipoNuevo(key)} className={`p-3 rounded-2xl flex flex-col items-center gap-2 text-[8px] font-black uppercase tracking-wider transition-all border-2 text-center ${tipoNuevo === key ? `${cfg.bg} ${cfg.color} border-current ring-1 ring-current` : 'border-transparent bg-gray-50 text-gray-400 hover:bg-gray-100'}`}><div className={`p-1.5 rounded-xl bg-white shadow-sm ${tipoNuevo === key ? cfg.color : 'text-gray-300'}`}><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={cfg.icon} /></svg></div>{cfg.label.split(' / ')[0]}</button>
                       ))}
                    </div>
                 </div>

                 {(tipoNuevo === 'guia' || (tipoNuevo === 'video' && videoSource === 'archivo')) && (
                    <div className="pt-2">
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Archivo de Contenido</label>
                       <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="p-8 border-2 border-dashed border-vinotinto-800/20 rounded-3xl bg-gray-50/50 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-vinotinto-800/40 transition-all cursor-pointer group"
                       >
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            onChange={handleFileChange}
                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg"
                          />
                          <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-vinotinto-800/10 flex items-center justify-center text-vinotinto-800 group-hover:scale-110 transition-transform">
                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/></svg>
                          </div>
                          <div className="text-center">
                             <p className="text-[9px] font-black uppercase text-gray-400 tracking-widest leading-none">
                                {formMaterial.titulo ? `Seleccionado: ${formMaterial.titulo}` : 'Haz clic para subir el archivo'}
                             </p>
                             {formMaterial.titulo && (
                                <div className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[8px] font-black uppercase ${formatConfigs[formMaterial.formato]?.bg} ${formatConfigs[formMaterial.formato]?.color}`}>
                                   <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={formatConfigs[formMaterial.formato]?.icon}/></svg>
                                   {formatConfigs[formMaterial.formato]?.label}
                                </div>
                             )}
                          </div>
                       </div>
                    </div>
                 )}

                 {(tipoNuevo === 'recurso' || tipoNuevo === 'video') && (
                    <div className="pt-2">
                       <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">Enlace / URL del Recurso o Video</label>
                       <input 
                          value={formMaterial.url} 
                          onChange={e => setFormMaterial({...formMaterial, url: e.target.value})} 
                          placeholder="https://ejemplo.com/recurso" 
                          className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl text-sm font-black tracking-tight text-gray-800 focus:outline-none focus:border-vinotinto-800 shadow-inner"
                       />
                    </div>
                 )}

                 {/* CONTENIDO DE TEXTO O DESCRIPCIÓN */}
                 <div>
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-widest mb-4 ml-1">
                        {tipoNuevo === 'texto' ? 'Cuerpo del Texto' : 'Descripción / Instrucciones'}
                    </label>
                    <textarea 
                        value={formMaterial.descripcion} 
                        onChange={e => setFormMaterial({...formMaterial, descripcion: e.target.value})} 
                        placeholder={tipoNuevo === 'texto' ? 'Escribe el contenido aquí...' : 'Detalla los puntos clave...'} 
                        rows={tipoNuevo === 'texto' ? 8 : 2} 
                        className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-3xl text-sm font-black tracking-tight text-gray-800 focus:outline-none focus:border-vinotinto-800 shadow-inner resize-none"
                    />
                 </div>
                 {/* Otros campos simplificados para velocidad de respuesta ... */}
                 <div className="flex gap-4">
                    <button onClick={() => setModalMaterialAbierto(false)} className="flex-1 py-5 bg-gray-50 text-gray-400 text-xs font-black rounded-2xl uppercase tracking-widest">Atrás</button>
                    {editandoMaterialID && (
                       <button onClick={() => eliminarMaterial(editandoMaterialID)} className="flex-1 py-5 bg-red-50 text-red-500 text-xs font-black rounded-2xl uppercase tracking-widest border border-red-100 hover:bg-red-100 transition-all">ELIMINAR</button>
                    )}
                    <button onClick={guardarMaterial} className="flex-1 py-5 bg-vinotinto-800 text-white text-xs font-black rounded-2xl uppercase tracking-widest shadow-xl transition-all active:scale-95">
                        {editandoMaterialID ? 'GUARDAR' : 'Cargar'}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default GestorContenido;
