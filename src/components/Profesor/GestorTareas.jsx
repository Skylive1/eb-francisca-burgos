import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Loader2, Plus, Save, Trash2, Edit2, Calendar, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';

/**
 * COMPONENTE: GestorTareas (Versión Supabase Real)
 * --------------------------------------------------------
 */
const GestorTareas = ({ clase }) => {
  const [modalAbierto, setModalAbierto] = useState(false);
  const [editandoID, setEditandoID] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [form, setForm] = useState({ 
    titulo: '', 
    descripcion: '', 
    fecha: '', 
    puntaje: '20' 
  });
  
  const [tareas, setTareas] = useState([]);

  useEffect(() => {
    if (clase?.id) {
      cargarTareas();
    }
  }, [clase]);

  const cargarTareas = async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('tasks')
        .select('*')
        .eq('class_id', clase.id)
        .order('due_date', { ascending: true });
      
      setTareas(data || []);
    } catch (error) {
      console.error("Error cargando tareas:", error);
    } finally {
      setLoading(false);
    }
  };

  const estadoTarea = (tarea) => {
    const hoy = new Date();
    hoy.setHours(0,0,0,0);
    const entrega = new Date(tarea.due_date + 'T23:59:59');
    
    if (entrega < hoy) return { label: 'Vencida', color: 'bg-red-100 text-red-700', icon: <AlertTriangle size={12} /> };
    return { label: 'Activa', color: 'bg-vinotinto-100 text-vinotinto-700', icon: <Clock size={12} /> };
  };

  const abrirModal = (tarea = null) => {
    if (tarea) {
      setEditandoID(tarea.id);
      setForm({ 
        titulo: tarea.title, 
        descripcion: tarea.description || '', 
        fecha: tarea.due_date, 
        puntaje: tarea.points.toString() 
      });
    } else {
      setEditandoID(null);
      setForm({ titulo: '', descripcion: '', fecha: '', puntaje: '20' });
    }
    setModalAbierto(true);
  };

  const guardar = async () => {
    if (!form.titulo.trim() || !form.fecha) return alert("Completa los campos obligatorios");
    
    setSaving(true);
    const dataTarea = {
      class_id: clase.id,
      title: form.titulo,
      description: form.descripcion,
      due_date: form.fecha,
      points: parseInt(form.puntaje)
    };

    try {
      if (editandoID) {
        await supabase.from('tasks').update(dataTarea).eq('id', editandoID);
      } else {
        await supabase.from('tasks').insert([dataTarea]);
      }
      setModalAbierto(false);
      cargarTareas();
    } catch (error) {
      alert("Error al guardar tarea: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const eliminar = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      await supabase.from('tasks').delete().eq('id', id);
      cargarTareas();
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="w-10 h-10 animate-spin text-vinotinto-800 mb-4" />
        <p className="text-xs font-black uppercase tracking-widest italic">Sincronizando Banco de Tareas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Cabecera */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">{tareas.length} Tareas Programadas</p>
        <button
          onClick={() => abrirModal()}
          className="flex items-center gap-2 px-6 py-3 bg-vinotinto-800 text-white text-[10px] font-black rounded-xl hover:bg-vinotinto-900 shadow-xl shadow-vinotinto-900/10 transition-all active:scale-95 uppercase tracking-widest"
        >
          <Plus size={16} />
          Nueva Tarea
        </button>
      </div>

      {/* Lista de tareas */}
      {tareas.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-100 rounded-[2.5rem] bg-white/30 backdrop-blur-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
             <Calendar className="text-gray-200 w-8 h-8" />
          </div>
          <p className="text-gray-400 font-black text-sm uppercase tracking-widest">No hay tareas asignadas</p>
          <p className="text-gray-300 text-[10px] font-bold mt-1 uppercase tracking-tighter">Haz clic en "Nueva Tarea" para comenzar el ciclo académico.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tareas.map(tarea => {
            const estado = estadoTarea(tarea);
            const fechaFormato = new Date(tarea.due_date + 'T12:00:00').toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' });
            return (
              <div 
                key={tarea.id} 
                className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 hover:shadow-xl transition-all group cursor-pointer relative overflow-hidden border-l-[10px] border-l-vinotinto-800"
                onClick={() => abrirModal(tarea)}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 ${estado.color}`}>
                        {estado.icon}
                        {estado.label}
                      </span>
                      <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full bg-gold/10 text-vinotinto-900 border border-gold/20">
                        Valor: {tarea.points} pts
                      </span>
                    </div>
                    <h4 className="font-black text-gray-900 text-xl tracking-tighter group-hover:text-vinotinto-800 transition-colors uppercase italic">{tarea.title}</h4>
                    <p className="text-sm text-gray-500 font-medium mt-2 line-clamp-2 italic">{tarea.description || 'Sin instrucciones adicionales.'}</p>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => { e.stopPropagation(); abrirModal(tarea); }}
                      className="p-3 bg-gray-50 text-gray-400 hover:text-vinotinto-800 rounded-xl transition-all"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); eliminar(tarea.id); }}
                      className="p-3 bg-red-50 text-red-300 hover:text-red-600 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-6 border-t border-gray-50">
                   <Calendar className="w-4 h-4 text-vinotinto-800" />
                   <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Entrega: <span className="text-gray-900 italic">{fechaFormato}</span></span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL DE GESTIÓN */}
      {modalAbierto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[150] flex items-center justify-center p-4" onClick={() => !saving && setModalAbierto(false)}>
          <div className="bg-white rounded-[3rem] shadow-2xl w-full max-w-md border-4 border-white animate-scale-up" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-10 py-8 border-b border-gray-50 bg-gray-50/50 rounded-t-[3rem]">
              <div>
                <h3 className="text-2xl font-black text-gray-900 italic tracking-tighter uppercase">
                  {editandoID ? 'Editar Tarea' : 'Nueva Tarea'}
                </h3>
                <p className="text-[10px] font-bold text-vinotinto-800 uppercase tracking-widest">Asignación Académica</p>
              </div>
              <button onClick={() => setModalAbierto(false)} className="p-2 text-gray-300 hover:text-red-500 transition-all">
                 <Trash2 size={20} />
              </button>
            </div>

            <div className="p-10 space-y-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Título de la Tarea</label>
                <input
                  value={form.titulo}
                  onChange={e => setForm(f => ({ ...f, titulo: e.target.value }))}
                  placeholder="Ej: Ensayo sobre el Ciclo del Agua"
                  className="w-full px-6 py-4 bg-[#f8f9fa] border-2 border-vinotinto-800/10 rounded-2xl text-sm font-black text-gray-800 outline-none focus:border-vinotinto-800/30 transition-all shadow-inner"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Instrucciones</label>
                <textarea
                  value={form.descripcion}
                  onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                  placeholder="Describe los requisitos y pasos a seguir..."
                  rows={3}
                  className="w-full px-6 py-4 bg-[#f8f9fa] border-2 border-vinotinto-800/10 rounded-2xl text-sm font-medium text-gray-800 outline-none focus:border-vinotinto-800/30 transition-all resize-none shadow-inner"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Fecha de Entrega</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={e => setForm(f => ({ ...f, fecha: e.target.value }))}
                    className="w-full px-6 py-4 bg-[#f8f9fa] border-2 border-vinotinto-800/10 rounded-2xl text-sm font-black text-gray-800 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Puntos</label>
                  <input
                    type="number"
                    value={form.puntaje}
                    onChange={e => setForm(f => ({ ...f, puntaje: e.target.value }))}
                    className="w-full px-6 py-4 bg-[#f8f9fa] border-2 border-vinotinto-800/10 rounded-2xl text-sm font-black text-gray-800 outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 px-10 pb-10">
              <button onClick={() => setModalAbierto(false)} className="flex-1 py-5 bg-gray-100 text-gray-400 text-[10px] font-black rounded-2xl uppercase tracking-widest hover:bg-gray-200 transition-all">
                Atrás
              </button>
              <button 
                onClick={guardar} 
                disabled={saving}
                className="flex-1 py-5 bg-vinotinto-800 text-white text-[10px] font-black rounded-2xl hover:bg-vinotinto-900 shadow-2xl shadow-vinotinto-900/20 transition-all flex items-center justify-center gap-3 uppercase tracking-widest"
              >
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                {editandoID ? 'Actualizar' : 'Publicar'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default GestorTareas;
