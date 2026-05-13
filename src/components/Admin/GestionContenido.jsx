import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Newspaper, 
  Calendar, 
  Video, 
  Plus, 
  Trash2, 
  Edit2, 
  Image as ImageIcon, 
  Save,
  X,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Trophy
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import VlogEscolar from '../Dashboard/VlogEscolar';
import NewsCard from '../Home/NewsCard';
import { Eye, Settings as SettingsIcon, Calendar as CalendarIcon, LayoutDashboard, Lightbulb } from 'lucide-react';

const GestionContenido = ({ initialTab = 'news', isDarkMode, tabsFilter = 'all' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [vistaEstudiante, setVistaEstudiante] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    description: '',
    image_url: '',
    thumbnail_url: '',
    type: 'news',
    event_date: '',
    video_url: '',
    category: '',
    month_year: '',
    ends_at: ''
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setItems([]); // Limpiar lista al cambiar de pestaña
    setFormData(prev => ({
      ...prev,
      title: '',
      content: '',
      description: '',
      image_url: '',
      thumbnail_url: '',
      video_url: '',
      type: activeTab
    }));
    fetchContent();
  }, [activeTab]);

  const tabs = [
    { id: 'news', label: 'Noticias', icon: <Newspaper size={16} />, group: 'news' },
    { id: 'events', label: 'Eventos', icon: <CalendarIcon size={16} />, group: 'news' },
    { id: 'vlog', label: 'Vlog', icon: <Video size={16} />, group: 'vlog' },
    { id: 'challenges', label: 'Retos', icon: <Trophy size={16} />, group: 'vlog' },
    { id: 'pills', label: 'Píldoras', icon: <Lightbulb size={16} />, group: 'vlog' }
  ].filter(tab => tabsFilter === 'all' || tab.group === tabsFilter);

  const fetchContent = async () => {
    setLoading(true);
    try {
      let query;
      if (activeTab === 'news') {
        query = supabase.from('school_news').select('*');
      } else if (activeTab === 'events') {
        query = supabase.from('school_events').select('*');
      } else if (activeTab === 'challenges') {
        query = supabase.from('challenges').select('*');
      } else if (activeTab === 'vlog') {
        query = supabase.from('vlog_posts').select('*');
      } else if (activeTab === 'pills') {
        query = supabase.from('pills_knowledge').select('*');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

    const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      let payload = {};
      let table = '';

      if (activeTab === 'news') {
        table = 'school_news';
        payload = {
          title: formData.title,
          content: formData.content || formData.description || '',
          image_url: formData.image_url || formData.thumbnail_url || ''
        };
      } else if (activeTab === 'events') {
        table = 'school_events';
        payload = {
          title: formData.title,
          description: formData.description || formData.content || '',
          image_url: formData.image_url || formData.thumbnail_url || '',
          event_date: formData.event_date || null
        };
      } else if (activeTab === 'challenges') {
        table = 'challenges';
        payload = {
          title: formData.title,
          description: formData.description || formData.content,
          month_year: formData.month_year || 'Mes Actual',
          ends_at: formData.ends_at || null,
          is_active: true
        };
      } else if (activeTab === 'vlog') {
        table = 'vlog_posts';
        payload = {
          title: formData.title,
          description: formData.description || formData.content || '',
          thumbnail_url: formData.thumbnail_url || formData.image_url || '',
          video_url: formData.video_url || '',
          category: formData.category || 'todos'
        };
      } else if (activeTab === 'pills') {
        table = 'pills_knowledge';
        payload = {
          title: formData.title,
          front_content: formData.description || '',
          back_content: formData.content || '',
          category: formData.category || 'todos'
        };
      }
      
      // Enriquecer payload con link si aplica
      if (activeTab !== 'pills') {
        payload.link_url = formData.link_url || '';
      }
      
      let error;
      if (editingItem) {
        ({ error } = await supabase.from(table).update(payload).eq('id', editingItem.id));
      } else {
        ({ error } = await supabase.from(table).insert([payload]));
      }
      if (error) throw error;
      
      alert('¡Contenido guardado con éxito!');
      setShowModal(false);
      setEditingItem(null);
      setFormData({ 
        title: '', 
        content: '', 
        description: '', 
        image_url: '', 
        thumbnail_url: '', 
        type: activeTab, 
        event_date: '', 
        video_url: '', 
        category: 'todos',
        month_year: '',
        ends_at: ''
      });
      fetchContent();
    } catch (error) {
      console.error('Error saving content:', error);
      alert('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${activeTab}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('imagenes-contenido')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('imagenes-contenido')
        .getPublicUrl(filePath);

      setFormData({ 
        ...formData, 
        image_url: publicUrl, 
        thumbnail_url: publicUrl 
      });
      alert('¡Imagen subida con éxito!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir imagen: Asegúrate de haber creado el bucket "imagenes-contenido" en Supabase Storage y que sea público.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este contenido?')) return;
    try {
      const table = activeTab === 'news' ? 'school_news' : 
                   activeTab === 'events' ? 'school_events' :
                   activeTab === 'challenges' ? 'challenges' : 
                   activeTab === 'vlog' ? 'vlog_posts' : 'pills_knowledge';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      fetchContent();
    } catch (error) {
      console.error('Error deleting content:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* TABS CMS */}
      <div className="bg-white/5 backdrop-blur-xl p-2 rounded-[2rem] border border-white/10 flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-3 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id ? 'bg-vinotinto-800 text-white shadow-xl' : 'text-gray-500 hover:text-white'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">
            Gestión de {activeTab === 'news' ? 'Noticias' : activeTab === 'events' ? 'Eventos' : activeTab === 'vlog' ? 'Vlog' : activeTab === 'challenges' ? 'Retos' : 'Píldoras'}
          </h3>
          <button 
            onClick={() => setVistaEstudiante(!vistaEstudiante)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${vistaEstudiante ? 'bg-gold text-vinotinto-950 shadow-lg' : 'bg-white/10 text-white hover:bg-white/20 border border-white/10'}`}
          >
            {vistaEstudiante ? <SettingsIcon size={14} /> : <Eye size={14} />}
            {vistaEstudiante ? 'Volver a Edición' : 'Vista Estudiante'}
          </button>
        </div>
        
        {!vistaEstudiante && (
          <button 
            onClick={() => { setEditingItem(null); setFormData({...formData, type: activeTab}); setShowModal(true); }}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg flex items-center gap-3"
          >
            <Plus size={18} /> Nuevo Registro
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {vistaEstudiante ? (
          <Motion.div 
            key="preview"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-[3rem] p-10 border border-white shadow-2xl overflow-hidden"
          >
            <div className="mb-8 p-4 bg-vinotinto-50 rounded-2xl border border-vinotinto-100 flex items-center gap-4">
              <div className="w-10 h-10 bg-vinotinto-800 text-white rounded-xl flex items-center justify-center">
                <Eye size={20} />
              </div>
              <div>
                <p className="text-xs font-black text-vinotinto-900 uppercase">Previsualización Real</p>
                <p className="text-[10px] text-vinotinto-800/60 font-medium">Así se verá este contenido en la {activeTab === 'news' || activeTab === 'events' ? 'Página Principal' : 'Plataforma del Estudiante'}.</p>
              </div>
            </div>
            
            {activeTab === 'news' || activeTab === 'events' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 p-4">
                {items.map(item => (
                  <NewsCard 
                    key={item.id}
                    news={{
                      id: item.id,
                      image: item.image_url,
                      category: activeTab === 'news' ? 'Institucional' : 'Evento',
                      date: new Date(item.event_date || item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase(),
                      title: item.title,
                      desc: (item.content || item.description || '').substring(0, 100) + '...',
                      fullDesc: item.content || item.description || ''
                    }}
                    onClick={() => {}}
                  />
                ))}
                {items.length === 0 && (
                  <div className="col-span-full py-20 text-center text-gray-400 uppercase font-black text-[10px] tracking-widest">
                    No hay {activeTab} para previsualizar
                  </div>
                )}
              </div>
            ) : (
              <VlogEscolar rol="student" />
            )}
          </Motion.div>
        ) : (
          <Motion.div 
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? (
              <div className="col-span-full py-20 text-center">
                <Loader2 className="w-10 h-10 animate-spin text-vinotinto-500 mx-auto" />
              </div>
            ) : items.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white/5 rounded-[3rem] border border-dashed border-white/10">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Sin contenido registrado</p>
              </div>
            ) : items.filter(item => {
              // Filtro de seguridad extra en el renderizado: 
              // Las nuevas tablas (news, events, vlog, pills, challenges) no usan columna 'type'
              return true;
            }).map(item => {
              if (activeTab === 'challenges') {
                return (
                  <Motion.div 
                    layout
                    key={item.id}
                    className="group relative bg-[#1a1d23] rounded-[2.5rem] border border-white/5 overflow-hidden hover:border-white/20 transition-all shadow-xl"
                  >
                    <div className="aspect-video bg-gradient-to-br from-vinotinto-900 to-black p-6 flex flex-col justify-between">
                       <div className="flex justify-between items-start">
                          <span className="px-3 py-1 bg-white/10 text-white/50 rounded-full text-[8px] font-black uppercase tracking-widest">{item.month_year}</span>
                          <Trophy className="text-gold w-6 h-6" />
                       </div>
                       <h4 className="text-lg font-black text-white italic uppercase leading-none">{item.title}</h4>
                    </div>
                    <div className="p-6">
                      <p className="text-[10px] text-gray-400 line-clamp-2 mb-6 font-medium">{item.description}</p>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingItem(item); setFormData({ title: item.title, description: item.description, month_year: item.month_year, ends_at: item.ends_at }); setShowModal(true); }} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded-xl transition-all">Editar</button>
                        <button onClick={() => handleDelete(item.id)} className="p-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"><Trash2 size={14} /></button>
                      </div>
                    </div>
                  </Motion.div>
                );
              }

              if (activeTab === 'pills') {
                return (
                  <Motion.div 
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative perspective-1000 group"
                  >
                    <div className="absolute top-4 right-4 z-20 flex gap-2">
                       <button 
                        onClick={(e) => { e.stopPropagation(); setEditingItem(item); setFormData({ title: item.title, description: item.front_content, content: item.back_content }); setShowModal(true); }}
                        className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:bg-vinotinto-600 transition-all shadow-lg"
                      >
                        <Edit2 size={12} />
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                        className="p-2 bg-black/40 backdrop-blur-md rounded-lg text-white hover:bg-red-600 transition-all shadow-lg"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>

                    <div className="w-full min-h-[220px] bg-white rounded-3xl border border-gray-100 shadow-xl p-6 flex flex-col justify-between overflow-hidden relative">
                      <div className="absolute -top-10 -right-10 w-24 h-24 bg-vinotinto-50 rounded-full blur-3xl opacity-50" />
                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-[8px] font-black uppercase tracking-widest border border-violet-100">💡 Píldora</span>
                        </div>
                        <h4 className="text-sm font-black text-gray-900 leading-tight uppercase mb-2">{item.title}</h4>
                        <p className="text-[10px] text-gray-400 font-medium leading-relaxed italic line-clamp-3">"{item.front_content}"</p>
                      </div>
                      
                      <div className="mt-4 pt-4 border-t border-gray-50">
                        <p className="text-[9px] font-black text-vinotinto-800 uppercase tracking-widest flex items-center gap-2">
                          <CheckCircle2 size={10} /> Reverso:
                        </p>
                        <p className="text-[10px] text-gray-500 mt-1 line-clamp-2">{item.back_content || 'Sin respuesta definida'}</p>
                      </div>
                    </div>
                  </Motion.div>
                );
              }

              return (
                <Motion.div 
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10 overflow-hidden group"
                >
                  <div className="h-48 bg-gray-800 relative">
                    {item.image_url || item.thumbnail_url ? (
                      <img src={item.image_url || item.thumbnail_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/10">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 flex gap-2">
                       <button 
                        onClick={() => { setEditingItem(item); setFormData(item); setShowModal(true); }}
                        className="p-3 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-vinotinto-600 transition-all"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-3 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-red-600 transition-all"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="p-8 space-y-4">
                    <div className="flex justify-between items-start">
                      <h4 className="text-lg font-black text-white leading-tight uppercase line-clamp-2">{item.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed font-medium">
                      {item.content || item.description}
                    </p>
                    <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                       <span className="text-[9px] font-black text-vinotinto-500 uppercase tracking-widest">
                          {new Date(item.created_at).toLocaleDateString()}
                       </span>
                       {(item.video_url || item.image_url) && (
                         <ExternalLink size={12} className="text-gray-600" />
                       )}
                    </div>
                  </div>
                </Motion.div>
              );
            })}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* MODAL FORMULARIO */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-[#1a1d23] rounded-[3rem] border border-white/10 shadow-2xl overflow-hidden"
            >
               <form onSubmit={handleSubmit} className="p-10 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-white italic uppercase">
                      {editingItem ? 'Editar' : 'Nuevo'} {activeTab}
                    </h3>
                    <button type="button" onClick={() => setShowModal(false)} className="p-2 text-gray-500 hover:text-white"><X /></button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Título</label>
                      <input 
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500" 
                      />
                    </div>

                    {(activeTab === 'news' || activeTab === 'events' || activeTab === 'vlog' || activeTab === 'challenges') && (
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                          {activeTab === 'challenges' ? 'Instrucciones del Reto' : 'Contenido / Descripción'}
                        </label>
                        <textarea 
                          rows={4}
                          value={formData.content || formData.description}
                          onChange={(e) => setFormData({...formData, content: e.target.value, description: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500" 
                        />
                      </div>
                    )}

                    {(activeTab !== 'pills' && activeTab !== 'challenges') && (
                      <div className="space-y-2">
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Imagen Principal</label>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <input 
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                              id="image-upload"
                            />
                            <label 
                              htmlFor="image-upload"
                              className={`w-full flex items-center justify-center gap-3 px-6 py-4 bg-white/5 border border-dashed border-white/20 rounded-2xl cursor-pointer hover:bg-white/10 transition-all ${uploading ? 'opacity-50 cursor-wait' : ''}`}
                            >
                              {uploading ? <Loader2 className="animate-spin text-gold" size={18} /> : <ImageIcon className="text-gray-400" size={18} />}
                              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                                {uploading ? 'Subiendo...' : formData.image_url ? 'Cambiar Imagen' : 'Seleccionar desde PC'}
                              </span>
                            </label>
                          </div>
                          {formData.image_url && (
                            <div className="w-14 h-14 rounded-xl overflow-hidden border border-white/10">
                              <img src={formData.image_url} alt="Preview" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                        {formData.image_url && (
                          <p className="text-[8px] text-emerald-500 font-bold uppercase tracking-widest mt-1">✓ Imagen cargada correctamente</p>
                        )}
                      </div>
                    )}

                    {(activeTab === 'news' || activeTab === 'events') && (
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Fecha del Evento</label>
                        <input 
                          type="date"
                          value={formData.event_date}
                          onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500" 
                        />
                      </div>
                    )}

                    {activeTab === 'pills' && (
                      <>
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Frente (Concepto/Pregunta)</label>
                          <textarea 
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500" 
                            placeholder="Ej: ¿Qué es un algoritmo?"
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Reverso (Respuesta/Detalle)</label>
                          <textarea 
                            rows={4}
                            value={formData.content}
                            onChange={(e) => setFormData({...formData, content: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500" 
                            placeholder="Escribe la respuesta o puntos clave aquí..."
                          />
                        </div>
                      </>
                    )}

                    {activeTab === 'challenges' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Mes / Año</label>
                          <input 
                            value={formData.month_year}
                            onChange={(e) => setFormData({...formData, month_year: e.target.value})}
                            placeholder="Ej: Mayo 2026"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500" 
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Fecha de Cierre</label>
                          <input 
                            type="datetime-local"
                            value={formData.ends_at}
                            onChange={(e) => setFormData({...formData, ends_at: e.target.value})}
                            className="initial-date-picker w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500" 
                          />
                        </div>
                      </div>
                    )}

                    {activeTab === 'vlog' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">URL de Video (TikTok/YouTube)</label>
                          <input 
                            value={formData.video_url}
                            onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500" 
                            placeholder="https://www.tiktok.com/..."
                          />
                        </div>
                        <div>
                          <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoría</label>
                          <select 
                            value={formData.category}
                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500 appearance-none"
                          >
                            <option value="todos" className="bg-gray-900">General</option>
                            <option value="robotica" className="bg-gray-900">Robótica</option>
                            <option value="arte" className="bg-gray-900">Arte</option>
                            <option value="literatura" className="bg-gray-900">Literatura</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-5 bg-vinotinto-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-vinotinto-950 transition-all flex items-center justify-center gap-3"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {editingItem ? 'Actualizar Contenido' : 'Publicar Ahora'}
                  </button>
               </form>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestionContenido;
