import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  Search, 
  Download, 
  Filter, 
  Calendar, 
  DollarSign, 
  CreditCard, 
  User,
  CheckCircle2,
  TrendingUp,
  Package,
  Eye,
  ExternalLink,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const RegistroVentas = () => {
  const [ventas, setVentas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroMetodo, setFiltroMetodo] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [orden, setOrden] = useState('desc'); 
  const [comprobanteSeleccionado, setComprobanteSeleccionado] = useState(null);

  useEffect(() => {
    fetchVentas();
  }, [orden]);

  const fetchVentas = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cafeteria_orders')
        .select(`
          *,
          profiles:student_id (full_name)
        `)
        .eq('status', 'completed')
        .order('created_at', { ascending: orden === 'asc' });

      if (error) throw error;
      setVentas(data || []);
    } catch (error) {
      console.error("Error fetching sales history:", error);
    } finally {
      setLoading(false);
    }
  };

  const ventasFiltradas = (ventas || []).filter(v => {
    if (!v) return false;
    const cumpleMetodo = filtroMetodo === 'todos' || v.payment_method === filtroMetodo;
    const nombreEstudiante = v.profiles?.full_name || '';
    const idVenta = v.id || '';
    const cumpleBusqueda = nombreEstudiante.toLowerCase().includes(busqueda.toLowerCase()) || 
                          idVenta.toLowerCase().includes(busqueda.toLowerCase());
    
    let cumpleFecha = true;
    if (fechaSeleccionada && v.created_at) {
      try {
        const fechaVenta = new Date(v.created_at).toISOString().split('T')[0];
        cumpleFecha = fechaVenta === fechaSeleccionada;
      } catch (e) { cumpleFecha = false; }
    }
    
    return cumpleMetodo && cumpleBusqueda && cumpleFecha;
  });

  const totalUSD = ventasFiltradas.reduce((acc, v) => acc + (Number(v.total_usd) || 0), 0);
  const totalBs = ventasFiltradas.reduce((acc, v) => acc + (Number(v.total_bs) || 0), 0);

  const formatFecha = (fecha) => {
    if (!fecha) return "S/F";
    try {
      return new Date(fecha).toLocaleDateString('es-VE', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (e) { return "Fecha Inválida"; }
  };

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 print:hidden">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter italic uppercase mb-2">Registro de <span className="text-vinotinto-800">Ventas</span></h2>
          <p className="text-sm text-gray-400 font-medium">Historial completo de pedidos entregados y pagos validados.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-auto">
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col items-center justify-center text-center">
             <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-2"><TrendingUp size={20}/></div>
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total USD</p>
             <p className="text-xl font-black text-emerald-600">${(totalUSD || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col items-center justify-center text-center">
             <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-2"><TrendingUp size={20}/></div>
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Total BS</p>
             <p className="text-xl font-black text-blue-600">Bs. {(totalBs || 0).toLocaleString()}</p>
          </div>
          <div className="hidden md:flex bg-white p-6 rounded-[2rem] border border-gray-100 shadow-xl flex flex-col items-center justify-center text-center">
             <div className="w-10 h-10 bg-vinotinto-50 text-vinotinto-800 rounded-xl flex items-center justify-center mb-2"><Package size={20}/></div>
             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Entregas</p>
             <p className="text-xl font-black text-vinotinto-800">{ventasFiltradas.length}</p>
          </div>
        </div>
      </div>

      {/* FILTROS */}
      <div className="bg-white p-4 rounded-[2.5rem] border border-gray-100 shadow-lg flex flex-wrap gap-4 items-center print:hidden">
        <div className="flex-1 min-w-[200px] flex items-center gap-3 px-6 py-2 bg-gray-50 rounded-2xl">
          <Search className="w-5 h-5 text-gray-300" />
          <input 
            type="text" 
            placeholder="Buscar por alumno o ID..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="bg-transparent border-none outline-none text-sm font-medium w-full"
          />
        </div>
        
        <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl">
          <Calendar className="w-4 h-4 text-gray-400" />
          <input 
            type="date" 
            value={fechaSeleccionada}
            onChange={(e) => setFechaSeleccionada(e.target.value)}
            className="bg-transparent border-none outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer"
          />
        </div>

        <select 
          value={orden}
          onChange={(e) => setOrden(e.target.value)}
          className="bg-gray-50 border-none outline-none text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-2xl cursor-pointer hover:bg-gray-100 transition-all"
        >
          <option value="desc">Más Recientes</option>
          <option value="asc">Más Antiguos</option>
        </select>

        <button 
          onClick={() => window.print()}
          className="px-8 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center gap-2"
        >
          <Download size={14} /> Exportar
        </button>
      </div>

      {/* TABLA DE REGISTROS */}
      <div className="bg-white rounded-[3rem] border border-gray-100 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100">
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Fecha e ID</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest">Estudiante</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Pago</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Detalle</th>
                <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr><td colSpan="5" className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">Cargando...</td></tr>
              ) : ventasFiltradas.length === 0 ? (
                <tr><td colSpan="5" className="py-20 text-center text-gray-300 font-bold uppercase tracking-widest">No hay registros</td></tr>
              ) : ventasFiltradas.map((venta) => (
                <tr key={venta.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-8 py-6">
                    <p className="text-sm font-black text-gray-900 flex items-center gap-2">
                       <Calendar size={14} className="text-vinotinto-800"/> {formatFecha(venta.created_at)}
                    </p>
                    <p className="text-[10px] font-bold text-gray-400 mt-1">#{String(venta.id).substring(0,8)}</p>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-vinotinto-50 rounded-xl flex items-center justify-center text-vinotinto-800 font-black text-xs">
                         {String(venta.profiles?.full_name || 'U').charAt(0)}
                      </div>
                      <span className="text-sm font-black text-gray-700">{venta.profiles?.full_name || 'Estudiante'}</span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                      <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                        venta.payment_method === 'efectivo' ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'
                      }`}>
                        {venta.payment_method === 'efectivo' ? 'Efectivo' : 'P. Móvil'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <div className="flex justify-center">
                       <button 
                         onClick={() => setComprobanteSeleccionado(venta)}
                         className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-[9px] font-black uppercase hover:bg-vinotinto-800 hover:text-white transition-all"
                       >
                         Ver Comprobante
                       </button>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className="text-base font-black text-gray-900">${(Number(venta?.total_usd) || 0).toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-gray-400">Bs. {(Number(venta?.total_bs) || 0).toLocaleString()}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE COMPROBANTE */}
      <AnimatePresence>
        {comprobanteSeleccionado && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
             <Motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               onClick={() => setComprobanteSeleccionado(null)}
               className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
             />
             <Motion.div 
               initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
               className="relative bg-white rounded-[3rem] p-10 w-full max-w-lg shadow-2xl"
             >
                <button onClick={() => setComprobanteSeleccionado(null)} className="absolute top-6 right-6 p-2 bg-gray-100 rounded-xl"><X size={20} /></button>
                <h3 className="text-2xl font-black italic uppercase mb-6">Detalle de <span className="text-vinotinto-800">Pago</span></h3>
                
                <div className="space-y-6">
                   <div className="p-6 bg-gray-50 rounded-3xl border border-gray-100 flex justify-between items-center">
                      <div>
                         <p className="text-[10px] font-black text-gray-400 uppercase">Estudiante</p>
                         <p className="text-sm font-black">{comprobanteSeleccionado.profiles?.full_name}</p>
                      </div>
                      <div className="text-right">
                         <p className="text-[10px] font-black text-gray-400 uppercase">Total</p>
                         <p className="text-xl font-black text-emerald-600">${(Number(comprobanteSeleccionado?.total_usd) || 0).toFixed(2)}</p>
                      </div>
                   </div>

                   {comprobanteSeleccionado.screenshot_url ? (
                      <div className="text-center space-y-4">
                         <p className="text-[10px] font-black text-gray-400 uppercase">Capture de Pago</p>
                         <img src={comprobanteSeleccionado.screenshot_url} className="w-full max-h-[300px] object-contain rounded-2xl border shadow-sm" />
                         <a href={comprobanteSeleccionado.screenshot_url} target="_blank" className="text-blue-500 font-black text-[10px] uppercase underline">Ver en tamaño completo</a>
                      </div>
                   ) : (
                      <div className="p-8 bg-blue-600 rounded-[2.5rem] text-center text-white">
                         <p className="text-[10px] font-black uppercase opacity-60 mb-2">Referencia / Observación</p>
                         <p className="text-2xl font-black">{comprobanteSeleccionado.payment_reference || 'SIN REFERENCIA'}</p>
                         <p className="text-[10px] font-black uppercase opacity-60 mt-4 italic">{comprobanteSeleccionado.payment_method === 'efectivo' ? 'Pago en Efectivo' : 'Pago Móvil'}</p>
                      </div>
                   )}
                </div>
             </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegistroVentas;
