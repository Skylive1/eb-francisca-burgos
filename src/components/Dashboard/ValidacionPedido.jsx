import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion as Motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Utensils, 
  User, 
  CreditCard, 
  DollarSign, 
  ArrowLeft,
  Image as ImageIcon
} from 'lucide-react';

const ValidacionPedido = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    const fetchPedido = async () => {
      try {
        const { data, error } = await supabase
          .from('cafeteria_orders')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setPedido(data);

        // Fetch student profile
        const { data: prof } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', data.student_id)
          .single();
        
        setPerfil(prof);
      } catch (err) {
        console.error("Error validando pedido:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPedido();
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center">
      <Motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
        <Utensils className="w-12 h-12 text-vinotinto-800" />
      </Motion.div>
    </div>
  );

  if (!pedido) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8 text-center">
      <div className="max-w-md">
        <XCircle className="w-20 h-20 text-red-500 mx-auto mb-6" />
        <h2 className="text-3xl font-black text-slate-900 uppercase italic">Pedido no encontrado</h2>
        <p className="text-slate-500 mt-4">El código QR que has escaneado no es válido o ha expirado.</p>
        <button onClick={() => navigate('/')} className="mt-8 px-8 py-4 bg-vinotinto-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">Volver al Inicio</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 md:p-10 font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
         <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-vinotinto-800/10 blur-[120px] rounded-full"></div>
         <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-gold/10 blur-[120px] rounded-full"></div>
      </div>

      <Motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[4rem] shadow-2xl border border-gray-100 overflow-hidden relative z-10"
      >
        {/* Header Status */}
        <div className={`p-10 text-center text-white ${
          pedido.status === 'completed' ? 'bg-emerald-500' : 
          pedido.status === 'cancelled' ? 'bg-red-500' : 'bg-vinotinto-800'
        }`}>
           <div className="w-24 h-24 bg-white/20 backdrop-blur-xl rounded-full flex items-center justify-center mx-auto mb-6 border border-white/30">
              {pedido.status === 'completed' ? <CheckCircle2 size={48} /> : 
               pedido.status === 'cancelled' ? <XCircle size={48} /> : <Clock size={48} className="animate-pulse" />}
           </div>
           <h1 className="text-4xl font-black italic uppercase tracking-tighter">
             {pedido.status === 'completed' ? 'Pedido Entregado' : 
              pedido.status === 'cancelled' ? 'Pedido Cancelado' : 'Validación Pendiente'}
           </h1>
           <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mt-2">Sistema de Gestión de Cafetín</p>
        </div>

        {/* Info Box */}
        <div className="p-10 md:p-16">
           <div className="flex flex-col md:flex-row gap-10">
              {/* Lado Izquierdo: Datos */}
              <div className="flex-1 space-y-8">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500"><User /></div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Estudiante</p>
                       <p className="text-lg font-black text-slate-900">{perfil?.full_name || 'Estudiante'}</p>
                    </div>
                 </div>

                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-500">
                      {pedido.payment_method === 'efectivo' ? <DollarSign /> : <CreditCard />}
                    </div>
                    <div>
                       <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Método de Pago</p>
                       <p className="text-lg font-black text-slate-900 uppercase">{pedido.payment_method || 'No definido'}</p>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gray-100">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Artículos del Pedido</p>
                    <div className="space-y-3">
                       {Array.isArray(pedido?.items) ? pedido.items.map((item, idx) => (
                         <div key={idx} className="flex justify-between items-center bg-slate-50 px-4 py-3 rounded-xl border border-slate-100">
                            <span className="text-xs font-bold text-slate-700">{(item.cantidad || item.qty || 1)}x {(item.name || item.n || 'Producto')}</span>
                            <span className="text-xs font-black text-vinotinto-800">${((item.price_usd || 0) * (item.cantidad || item.qty || 1)).toFixed(2)}</span>
                         </div>
                       )) : (
                         <p className="text-xs text-gray-400 italic">No hay detalles de artículos</p>
                       )}
                    </div>
                 </div>
              </div>

              {/* Lado Derecho: Captura / Monto */}
              <div className="md:w-64 space-y-6">
                 <div className="bg-slate-900 rounded-[2.5rem] p-8 text-center text-white shadow-xl">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total a Cobrar</p>
                    <p className="text-4xl font-black italic text-gold">${(pedido?.total_usd || 0).toFixed(2)}</p>
                    <p className="text-[10px] font-bold text-slate-400 mt-2">Bs. {(pedido?.total_bs || 0).toFixed(2)}</p>
                 </div>

                 {pedido.screenshot_url ? (
                   <div className="space-y-3">
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Capture de Pago</p>
                      <a href={pedido.screenshot_url} target="_blank" rel="noreferrer" className="block relative group overflow-hidden rounded-3xl border-4 border-slate-100 shadow-lg">
                        <img src={pedido.screenshot_url} alt="Pago" className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ImageIcon className="text-white" />
                        </div>
                      </a>
                   </div>
                 ) : (
                    <div className="space-y-3">
                       <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Referencia de Pago</p>
                       <div className="p-8 bg-blue-600 rounded-[2.5rem] text-center text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform"><CreditCard size={48}/></div>
                          <p className="text-3xl font-black tracking-widest relative z-10">{pedido.payment_reference || 'S/N'}</p>
                          <p className="text-[9px] font-black uppercase opacity-60 mt-1 relative z-10">Validar en Portal Bancario</p>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>
      </Motion.div>
    </div>
  );
};

export default ValidacionPedido;
