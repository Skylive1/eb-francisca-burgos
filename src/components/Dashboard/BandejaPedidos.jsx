import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Inbox, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  ChevronRight,
  User,
  ShoppingBag,
  DollarSign,
  QrCode,
  Loader2,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const BandejaPedidos = ({ isDarkMode = false }) => {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroStatus, setFiltroStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPedidos();
    // Suscripción en tiempo real
    const channel = supabase
      .channel('cafeteria_orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'cafeteria_orders' }, () => {
        fetchPedidos();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPedidos = async () => {
    setLoading(true);
    try {
      // Nota: Si la tabla no existe aún, esto fallará graciosamente con un catch
      const { data, error } = await supabase
        .from('cafeteria_orders')
        .select('*, profiles(full_name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPedidos(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      // Simulación de datos si falla (mientras se crea la tabla)
      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  const marcarEntregado = async (id, items) => {
    try {
      // 1. Actualizar estado del pedido
      const { error: errorPedido } = await supabase
        .from('cafeteria_orders')
        .update({ status: 'completed' })
        .eq('id', id);

      if (errorPedido) throw errorPedido;

      // 2. Descontar stock automáticamente
      if (items && Array.isArray(items)) {
        for (const item of items) {
          const itemName = item.name || item.n;
          const itemQty = item.cantidad || item.qty;

          // Buscamos el producto en el inventario
          const { data: invItem } = await supabase
            .from('cafeteria_inventory')
            .select('id, stock')
            .eq('name', itemName)
            .single();

          if (invItem) {
            const nuevoStock = Math.max(0, invItem.stock - itemQty);
            await supabase
              .from('cafeteria_inventory')
              .update({ stock: nuevoStock })
              .eq('id', invItem.id);
          }
        }
      }

      setPedidos(prev => prev.map(p => p.id === id ? { ...p, status: 'completed' } : p));
    } catch (error) {
      console.error("Error al entregar pedido:", error);
      alert("Error al procesar la entrega y el stock");
    }
  };

  const actualizarEstatus = async (id, nuevoStatus) => {
    try {
      const { error } = await supabase
        .from('cafeteria_orders')
        .update({ status: nuevoStatus })
        .eq('id', id);

      if (error) throw error;
      fetchPedidos();
    } catch (error) {
      alert('Error al actualizar: ' + error.message);
    }
  };

  const filtrarPedidos = pedidos.filter(p => {
    const matchesSearch = p.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm);
    const matchesStatus = filtroStatus === 'all' || p.status === filtroStatus;
    return matchesSearch && matchesStatus;
  });

  const formatBs = (monto) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(monto);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div>
          <h2 className={`text-4xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Bandeja de <span className="text-vinotinto-800">Pedidos</span>
          </h2>
          <p className="text-sm text-gray-500 font-medium mt-2">Gestiona las órdenes entrantes y valida los pagos con QR.</p>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Buscar pedido..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-12 pr-4 py-4 rounded-2xl border text-xs font-bold outline-none focus:border-vinotinto-300 transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}
            />
          </div>
          <select 
            value={filtroStatus}
            onChange={(e) => setFiltroStatus(e.target.value)}
            className={`px-6 py-4 rounded-2xl border text-xs font-black uppercase tracking-widest outline-none focus:border-vinotinto-300 transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800 shadow-sm'}`}
          >
            <option value="all" className="text-slate-900">Todos</option>
            <option value="pending" className="text-slate-900">Pendientes</option>
            <option value="completed" className="text-slate-900">Entregados</option>
            <option value="cancelled" className="text-slate-900">Cancelados</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="py-20 text-center"><Loader2 className="animate-spin text-vinotinto-800 mx-auto w-10 h-10" /></div>
        ) : filtrarPedidos.length === 0 ? (
          <div className={`py-20 text-center border-2 border-dashed rounded-[3rem] ${isDarkMode ? 'border-white/10' : 'border-slate-100'}`}>
            <Inbox className="w-16 h-16 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 font-black uppercase tracking-widest italic">No hay pedidos en esta sección</p>
          </div>
        ) : filtrarPedidos.map((pedido) => (
          <Motion.div 
            key={pedido.id}
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'} backdrop-blur-xl rounded-[2.5rem] border p-8 flex flex-col md:flex-row items-center gap-8`}
          >
            {/* Status Icon */}
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center shrink-0 ${
              pedido.status === 'pending' ? 'bg-amber-100 text-amber-600' : 
              pedido.status === 'completed' ? 'bg-emerald-100 text-emerald-600' : 
              'bg-red-100 text-red-600'
            }`}>
              {pedido.status === 'pending' ? <Clock /> : pedido.status === 'completed' ? <CheckCircle2 /> : <XCircle />}
            </div>

            {/* Info Pedido */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className={`text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-100 text-slate-900'}`}>
                  #{pedido.id.slice(-6)}
                </span>
                <span className="text-[10px] text-gray-400 font-bold">{new Date(pedido.created_at).toLocaleString()}</span>
              </div>
              <h4 className={`text-xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {pedido.profiles?.full_name || 'Estudiante'}
              </h4>
              <p className="text-xs text-gray-500 font-medium mt-1">
                {Array.isArray(pedido.items) ? pedido.items.map(i => `${i.cantidad}x ${i.name}`).join(', ') : 'Detalle no disponible'}
              </p>
            </div>

            {/* Totales */}
            <div className="text-right">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Pagado</p>
              <p className={`text-2xl font-black italic ${isDarkMode ? 'text-white' : 'text-vinotinto-800'}`}>
                {formatBs(pedido.total_bs)}
              </p>
              <div className="flex flex-col items-end gap-1 mt-1">
                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${pedido.payment_method === 'efectivo' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  {pedido.payment_method === 'efectivo' ? 'Efectivo' : 'Pago Móvil'}
                </span>
                {pedido.payment_reference && (
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref: {pedido.payment_reference}</p>
                )}
                <p className="text-[9px] font-bold text-gray-300 uppercase tracking-widest">${pedido.total_usd} USD</p>
              </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-3">
              {pedido.status === 'pending' && (
                <>
                  <button 
                    onClick={() => marcarEntregado(pedido.id, pedido.items)}
                    className="p-4 bg-emerald-100 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    title="Marcar como Entregado"
                  >
                    <CheckCircle2 size={20} />
                  </button>
                  <button 
                    onClick={() => actualizarEstatus(pedido.id, 'cancelled')}
                    className="p-4 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"
                    title="Cancelar pedido"
                  >
                    <XCircle size={20} />
                  </button>
                </>
              )}
              {pedido.screenshot_url && (
                <a 
                  href={pedido.screenshot_url} 
                  target="_blank" 
                  rel="noreferrer"
                  className={`p-4 rounded-2xl transition-all bg-vinotinto-50 text-vinotinto-800 hover:bg-vinotinto-800 hover:text-white shadow-sm`}
                  title="Ver Captura de Pago"
                >
                  <ImageIcon size={20} />
                </a>
              )}
              <button className={`p-4 rounded-2xl transition-all ${isDarkMode ? 'bg-white/10 text-white' : 'bg-slate-50 text-slate-400 hover:text-vinotinto-800'}`}>
                <QrCode size={20} />
              </button>
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  );
};

export default BandejaPedidos;
