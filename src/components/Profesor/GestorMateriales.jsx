import React, { useState, useEffect, useRef } from 'react';
import { motion as Motion, AnimatePresence, Reorder } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  FileText, Video, Link, Type, Plus, Edit2, Trash2, ChevronDown, 
  ChevronUp, Eye, Save, X, Loader2, DownloadCloud, Play, 
  ClipboardCheck, HelpCircle, Calendar, Clock, Award, GripVertical
} from 'lucide-react';
import ModalClase from './ModalClase';
import ModalItem from './ModalItem';
import ModalVistaContenido from './ModalVistaContenido';
import ItemContenidoInline from './ItemContenidoInline';
import ModalBuzonReportes from './ModalBuzonReportes';

const GestorMateriales = ({ clase, isDarkMode }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [modalClaseAbierto, setModalClaseAbierto] = useState(false);
  const [modalBuzonAbierto, setModalBuzonAbierto] = useState(false);
  const [editandoID, setEditandoID] = useState(null);
  const [editandoClaseID, setEditandoClaseID] = useState(null);
  const [visualizandoItem, setVisualizandoItem] = useState(null);
  const [modoVistaPrevia, setModoVistaPrevia] = useState(false);
  const [tipoNuevo, setTipoNuevo] = useState('guia');
  const [loading, setLoading] = useState(true);
  const [lecciones, setLecciones] = useState([]);
  const [contenidosUnificados, setContenidosUnificados] = useState([]);
  const [clasesExpandidas, setClasesExpandidas] = useState({});
  const [nuevaClase, setNuevaClase] = useState({ lapso: '1', titulo: '' });

  const toggleClase = (id) => {
    setClasesExpandidas(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  const [form, setForm] = useState({ 
    titulo: '', descripcion: '', url: '', lapso: '1', leccionId: '',
    formato: 'pdf', puntos: 20, fecha_entrega: '', fuentes: '',
    videoSource: 'youtube', textType: 'simple', preguntas: [], duracion: 60
  });
  const [archivoArrastrando, setArchivoArrastrando] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const fileInputRef = useRef(null);
  const lapsos = ['1', '2', '3'];

  useEffect(() => { if (clase?.id) cargarDatos(); }, [clase]);

  const cargarDatos = async () => {
    try {
      const { data: leccionesData } = await supabase.from('lessons').select('*').eq('class_id', clase.id).order('created_at', { ascending: true });
      if (!leccionesData) return;
      setLecciones(leccionesData);
      const lessonIds = leccionesData.map(l => l.id);
      if (lessonIds.length === 0) { setContenidosUnificados([]); setLoading(false); return; }
      const [materialsRes, tasksRes] = await Promise.all([
        supabase.from('materials').select('*').in('lesson_id', lessonIds),
        supabase.from('tasks').select('*').in('lesson_id', lessonIds)
      ]);
      const unificados = [
        ...(materialsRes.data || []).map(m => ({ ...m, itemType: 'material' })),
        ...(tasksRes.data || []).map(t => ({ ...t, itemType: 'tarea', type: t.type || 'tarea' }))
      ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setContenidosUnificados(unificados);
      const expandidas = {};
      leccionesData.forEach(l => expandidas[l.id] = true);
      setClasesExpandidas(expandidas);
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const reordenarItems = (nuevaLista, leccionId) => {
    const otrosItems = contenidosUnificados.filter(item => item.lesson_id !== leccionId);
    const resultadoFinal = [];
    let insertado = false;
    contenidosUnificados.forEach(item => {
      if (item.lesson_id === leccionId) {
        if (!insertado) {
          resultadoFinal.push(...nuevaLista);
          insertado = true;
        }
      } else {
        resultadoFinal.push(item);
      }
    });
    setContenidosUnificados(resultadoFinal);
  };

  const tipoConfig = {
    texto: { icon: <Type size={20} />, label: 'Texto', bg: 'bg-amber-500/10', color: 'text-amber-600' },
    guia: { icon: <FileText size={20} />, label: 'Archivo', bg: 'bg-emerald-500/10', color: 'text-emerald-600' },
    video: { icon: <Video size={20} />, label: 'Video', bg: 'bg-blue-500/10', color: 'text-blue-600' },
    link: { icon: <Link size={20} />, label: 'Enlace', bg: 'bg-purple-500/10', color: 'text-purple-600' },
    tarea: { icon: <ClipboardCheck size={20} />, label: 'Tarea', bg: 'bg-rose-500/10', color: 'text-rose-600' },
    cuestionario: { icon: <HelpCircle size={20} />, label: 'Cuestionario', bg: 'bg-indigo-500/10', color: 'text-indigo-600' }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setArchivoArrastrando(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const processFile = (file) => {
    const type = file.type.split('/')[1] || 'archivo';
    setFileToUpload(file);
    setFilePreview({ name: file.name, size: (file.size / 1024).toFixed(2) + ' KB', type });
    setForm({ ...form, titulo: file.name.split('.')[0], formato: type });
  };

  const guardarClase = async () => {
    if (!nuevaClase.titulo.trim()) return;
    try {
      const payload = { class_id: clase.id, title: nuevaClase.titulo, lapso: nuevaClase.lapso };
      let result;
      if (editandoClaseID) {
        result = await supabase.from('lessons').update({ title: nuevaClase.titulo, lapso: nuevaClase.lapso }).eq('id', editandoClaseID).select();
      } else {
        result = await supabase.from('lessons').insert([payload]).select();
      }
      if (result.error) throw result.error;
      setModalClaseAbierto(false);
      cargarDatos();
    } catch (error) { alert("Error en clase: " + error.message); }
  };

  const guardarItem = async () => {
    if (!form.titulo.trim() || !form.leccionId) return alert('Datos incompletos');
    setIsSaving(true);
    try {
      let finalUrl = form.url;
      if (fileToUpload) {
        const fileExt = fileToUpload.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}.${fileExt}`;
        const filePath = `${clase.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('materiales').upload(filePath, fileToUpload);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('materiales').getPublicUrl(filePath);
        finalUrl = publicUrl;
      }
      let table, payload;
      if (tipoNuevo === 'tarea' || tipoNuevo === 'cuestionario') {
        table = 'tasks';
        payload = { 
          lesson_id: form.leccionId, class_id: clase.id, title: form.titulo, 
          description: form.descripcion, points: form.puntos, due_date: form.fecha_entrega || null, 
          source: form.fuentes, type: tipoNuevo,
          data: tipoNuevo === 'cuestionario' ? { preguntas: form.preguntas, duracion: form.duracion } : null
        };
      } else {
        table = 'materials';
        payload = { 
          lesson_id: form.leccionId, title: form.titulo, description: form.descripcion, 
          type: tipoNuevo, format: form.formato || 'texto', url: finalUrl, 
          source: form.fuentes || form.videoSource || '' 
        };
      }
      const { error: dbError } = await supabase.from(table).insert([payload]);
      if (dbError) throw dbError;
      setModalAbierto(false);
      setFilePreview(null);
      setFileToUpload(null);
      cargarDatos();
    } catch (error) { alert("Error al guardar: " + error.message); } finally { setIsSaving(false); }
  };

  const eliminarItem = async (item) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta asignación?')) return;
    try {
      const table = item.itemType === 'tarea' ? 'tasks' : 'materials';
      if (item.itemType === 'tarea') await supabase.from('task_submissions').delete().eq('task_id', item.id);
      const result = await supabase.from(table).delete().eq('id', item.id);
      if (result.error) throw result.error;
      cargarDatos();
    } catch (error) { alert("Error al eliminar: " + error.message); }
  };

  const eliminarClase = async (id) => {
    if (!window.confirm('¿⚠️ Seguro que deseas eliminar toda la clase?')) return;
    try {
      const result = await supabase.from('lessons').delete().eq('id', id);
      if (result.error) throw result.error;
      setModalClaseAbierto(false);
      cargarDatos();
    } catch (error) { alert("No se pudo eliminar la clase. Borra su contenido primero."); }
  };

  const abrirEdicion = (item, lapNum) => {
    setEditandoID(item.id);
    setTipoNuevo(item.type || item.itemType);
    setForm({
      titulo: item.title, descripcion: item.description || '', url: item.url || '',
      lapso: lapNum, leccionId: item.lesson_id, puntos: item.points || 20,
      fecha_entrega: item.due_date || '', fuentes: item.source || '',
      textType: item.text_type || 'simple', videoSource: item.source || 'youtube',
      preguntas: item.data?.preguntas || [], duracion: item.data?.duracion || 60
    });
    setModalAbierto(true);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-32">
      <Loader2 className="w-12 h-12 animate-spin text-vinotinto-800 mb-4" />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sincronizando Aula...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Cabecera */}
      <div className={`flex flex-col md:flex-row items-center justify-between p-8 rounded-[3rem] border transition-all ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
        <div>
          <p className={`text-[10px] font-black uppercase tracking-[0.2em] mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Arquitectura Académica</p>
          <h2 className={`text-3xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-slate-100' : 'text-vinotinto-800'}`}>Gestión de Aula</h2>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0">
          <button
            onClick={() => setModoVistaPrevia(!modoVistaPrevia)}
            className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${modoVistaPrevia ? 'bg-amber-500 text-white shadow-lg' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-50 text-slate-600'}`}
          >
            <Eye size={16} /> {modoVistaPrevia ? 'Modo Edición' : 'Vista Estudiante'}
          </button>
          {!modoVistaPrevia && (
            <>
              <button
                onClick={() => setModalBuzonAbierto(true)}
                className={`px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isDarkMode ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}
              >
                📬 Reportes
              </button>
              <button
                onClick={() => { setEditandoClaseID(null); setNuevaClase({ lapso: '1', titulo: '' }); setModalClaseAbierto(true); }}
                className={`px-8 py-5 rounded-3xl text-[12px] font-black uppercase tracking-[0.15em] italic transition-all border-4 ${isDarkMode ? 'border-slate-700 text-slate-100 hover:bg-slate-800' : 'border-vinotinto-800/10 text-vinotinto-800 hover:bg-vinotinto-50'} active:scale-95 shadow-lg`}
              >
                Clases
              </button>
              <button
                onClick={() => { setEditandoID(null); setTipoNuevo('guia'); setForm({ titulo: '', descripcion: '', url: '', lapso: '1', leccionId: '', formato: 'pdf', puntos: 20, fecha_entrega: '', fuentes: '', videoSource: 'youtube', textType: 'simple', preguntas: [], duracion: 60 }); setModalAbierto(true); }}
                className="px-10 py-5 bg-vinotinto-800 text-white rounded-3xl text-[12px] font-black uppercase tracking-[0.15em] italic shadow-2xl shadow-vinotinto-900/40 hover:scale-105 active:scale-95 transition-all"
              >
                Nuevo Contenido
              </button>
            </>
          )}
        </div>
      </div>

      {/* Lapsos */}
      {lapsos.map(lapNum => {
        const clasesDelLapso = lecciones.filter(l => l.lapso === lapNum);
        if (clasesDelLapso.length === 0) return null;
        return (
          <div key={lapNum} className="space-y-10 mb-20">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t-4 ${isDarkMode ? 'border-slate-800' : 'border-vinotinto-800/20'}`}></div>
              </div>
              <div className={`relative px-10 py-3 rounded-full border-4 shadow-xl flex items-center gap-4 ${isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-vinotinto-800 shadow-vinotinto-800/10'}`}>
                <div className="w-10 h-10 bg-vinotinto-800 rounded-full flex items-center justify-center text-white shadow-lg">
                  <span className="text-lg font-black italic">{lapNum}</span>
                </div>
                <h2 className={`text-xl font-black uppercase tracking-[0.3em] italic ${isDarkMode ? 'text-slate-100' : 'text-vinotinto-800'}`}>LAPSO {lapNum}</h2>
              </div>
            </div>

            <div className="grid gap-4 px-2">
              {clasesDelLapso.map((lec, idx) => {
                const itemsLec = contenidosUnificados.filter(m => m.lesson_id === lec.id);
                const estaExpandida = clasesExpandidas[lec.id];
                return (
                  <div key={lec.id} className={`group rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${estaExpandida ? (isDarkMode ? 'bg-slate-900/60 border-vinotinto-800 shadow-2xl shadow-vinotinto-800/10' : 'bg-white border-vinotinto-800 shadow-xl shadow-vinotinto-800/5') : (isDarkMode ? 'bg-slate-900/40 border-slate-800' : 'bg-white border-slate-100 hover:border-vinotinto-800/40 shadow-sm')}`}>
                    <div className={`flex items-center justify-between p-5 md:p-6 transition-colors ${estaExpandida && (isDarkMode ? 'bg-vinotinto-800/5' : 'bg-vinotinto-50/30')}`}>
                      <button onClick={() => toggleClase(lec.id)} className="flex-1 flex items-center gap-6 text-left">
                        <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black transition-all ${estaExpandida ? 'bg-vinotinto-800 text-white rotate-3 scale-110 shadow-lg' : isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400 border border-slate-100'}`}>
                          <span className="text-[8px] opacity-60">TEMA</span>
                          <span className="text-xl">{idx + 1}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className={`text-xl font-black uppercase italic tracking-tighter leading-none ${estaExpandida ? (isDarkMode ? 'text-white' : 'text-vinotinto-800') : (isDarkMode ? 'text-slate-200' : 'text-slate-800')}`}>{lec.title}</h4>
                            {!modoVistaPrevia && (
                              <button onClick={(e) => { e.stopPropagation(); setEditandoClaseID(lec.id); setNuevaClase({ lapso: lec.lapso, titulo: lec.title }); setModalClaseAbierto(true); }} className="p-3 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 text-slate-400 hover:text-vinotinto-800 hover:border-vinotinto-800 hover:shadow-lg rounded-2xl transition-all group/edit"><Edit2 size={20} /></button>
                            )}
                          </div>
                        </div>
                      </button>
                      <button onClick={() => toggleClase(lec.id)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${estaExpandida ? 'rotate-180 bg-vinotinto-800 text-white shadow-lg' : 'bg-slate-50 text-slate-300 border border-slate-100'}`}><ChevronDown size={20} /></button>
                    </div>
                    <AnimatePresence>
                      {estaExpandida && (
                        <Motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ type: 'spring', duration: 0.6, bounce: 0.1 }}>
                          <div className={`p-4 md:p-8 pt-0 border-t ${isDarkMode ? 'border-slate-800/50' : 'border-slate-100'}`}>
                            {itemsLec.length === 0 ? (
                              <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-[1.5rem] bg-slate-50/20 mb-4 mt-4"><p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-300 italic">Sin material publicado</p></div>
                            ) : modoVistaPrevia ? (
                              <div className="flex flex-col gap-4 mt-6">{itemsLec.map(item => (<ItemContenidoInline key={item.id} item={item} isDarkMode={isDarkMode} claseId={clase.id} onEdit={null} onDelete={null} />))}</div>
                            ) : (
                              <Reorder.Group axis="y" values={itemsLec} onReorder={(newList) => reordenarItems(newList, lec.id)} className="flex flex-col gap-3 mb-10">
                                {itemsLec.map(item => {
                                  const config = tipoConfig[item.type] || tipoConfig.texto;
                                  return (
                                    <Reorder.Item key={item.id} value={item} className={`group/item relative p-4 pr-4 pl-12 rounded-[1.5rem] border transition-all cursor-pointer flex items-center justify-between overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-100 hover:border-vinotinto-800/30 hover:shadow-lg hover:-translate-y-0.5'}`} onClick={() => abrirEdicion(item, lapNum)}>
                                      <div className={`absolute left-0 top-0 bottom-0 w-2 ${config.color.replace('text-', 'bg-')}`} />
                                      <div className="flex items-center gap-5 flex-1 min-w-0 pr-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${config.bg} ${config.color}`}>{React.cloneElement(config.icon, { size: 20 })}</div>
                                        <div className="flex flex-col truncate">
                                          <h5 className={`text-[13px] font-black uppercase tracking-tight truncate ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>{item.title}</h5>
                                          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest truncate">{config.label}</p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-4 flex-shrink-0">
                                        <div className={`flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all p-1 rounded-xl shadow-sm border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white/80 border-slate-100'}`}>
                                          <button onClick={(e) => { e.stopPropagation(); eliminarItem(item); }} className={`p-2 hover:text-red-500 rounded-lg transition-all ${isDarkMode ? 'text-slate-400 hover:bg-red-500/20' : 'text-slate-400 hover:bg-red-50'}`}><Trash2 size={16} /></button>
                                          <div className={`p-2 cursor-grab active:cursor-grabbing rounded-lg transition-all ${isDarkMode ? 'text-slate-500 hover:bg-slate-700' : 'text-slate-300 hover:bg-slate-50'}`}><GripVertical size={16} /></div>
                                        </div>
                                      </div>
                                    </Reorder.Item>
                                  );
                                })}
                              </Reorder.Group>
                            )}
                            {!modoVistaPrevia && (
                              <button onClick={() => { setEditandoID(null); setTipoNuevo('guia'); setForm({ titulo: '', descripcion: '', url: '', lapso: lapNum, leccionId: lec.id, formato: 'pdf', puntos: 20, fecha_entrega: '', fuentes: '', videoSource: 'youtube', textType: 'simple', preguntas: [], duracion: 60 }); setModalAbierto(true); }} className="w-full py-6 rounded-[2.2rem] border-4 border-dashed border-slate-100 flex items-center justify-center gap-5 text-[13px] font-black uppercase tracking-widest text-slate-300 hover:border-vinotinto-800 hover:text-vinotinto-800 hover:bg-vinotinto-50/50 transition-all group/btn"><Plus size={20} /> Publicar nuevo contenido en {lec.title}</button>
                            )}
                          </div>
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <ModalBuzonReportes 
        isOpen={modalBuzonAbierto} 
        onClose={() => setModalBuzonAbierto(false)} 
        isDarkMode={isDarkMode} 
        claseId={clase.id} 
      />

      <ModalItem
        isOpen={modalAbierto} onClose={() => setModalAbierto(false)} isDarkMode={isDarkMode}
        editandoID={editandoID} guardarItem={guardarItem} tipoNuevo={tipoNuevo}
        setTipoNuevo={setTipoNuevo} tipoConfig={tipoConfig} setFilePreview={setFilePreview}
        lapsos={lapsos} form={form} setForm={setForm} lecciones={lecciones}
        archivoArrastrando={archivoArrastrando} setArchivoArrastrando={setArchivoArrastrando}
        handleFileDrop={handleFileDrop} fileInputRef={fileInputRef}
        filePreview={filePreview} processFile={processFile} isSaving={isSaving}
      />

      <ModalClase
        isOpen={modalClaseAbierto} onClose={() => setModalClaseAbierto(false)} isDarkMode={isDarkMode}
        editandoClaseID={editandoClaseID} nuevaClase={nuevaClase} setNuevaClase={setNuevaClase}
        lapsos={lapsos} guardarClase={guardarClase} eliminarClase={() => eliminarClase(editandoClaseID)}
      />

      <ModalVistaContenido
        isOpen={!!visualizandoItem} onClose={() => setVisualizandoItem(null)}
        isDarkMode={isDarkMode} item={visualizandoItem} claseId={clase.id}
      />
    </div>
  );
};

export default GestorMateriales;
