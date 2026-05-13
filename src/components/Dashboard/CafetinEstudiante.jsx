import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import QRCode from "react-qr-code";
import { supabase } from '../../lib/supabaseClient';
import { 
  Utensils, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  CheckCircle2, 
  QrCode, 
  Clock, 
  X, 
  ArrowRight,
  Smartphone,
  Info,
  ChevronRight,
  Search,
  Star,
  DollarSign,
  Upload,
  Loader2
} from 'lucide-react';

const CafetinEstudiante = () => {
  const [tabActiva, setTabActiva] = useState('menu'); // 'menu' | 'pedidos'
  const [carrito, setCarrito] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(1); // 1: Resumen, 2: Pago, 3: QR
  const [ordenActual, setOrdenActual] = useState(null);
  
  // Payment States
  const [metodoPago, setMetodoPago] = useState('pago_movil'); // 'pago_movil' | 'efectivo'
  const [referencia, setReferencia] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [subiendoCapture, setSubiendoCapture] = useState(false);
  
  // Tasa BCV State
  const [tasaBCV, setTasaBCV] = useState(40.00); // Fallback
  const [loadingTasa, setLoadingTasa] = useState(true);

  const [menuItems, setMenuItems] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);

  // Fetch Tasa BCV and Inventory
  useEffect(() => {
    const obtenerTasa = async () => {
      try {
        const res = await fetch('https://ve.dolarapi.com/v1/dolares');
        const data = await res.json();
        const oficial = data.find(d => d.fuente === 'oficial');
        if (oficial) setTasaBCV(oficial.promedio);
      } catch (error) {
        console.error("Error obteniendo tasa:", error);
      } finally {
        setLoadingTasa(false);
      }
    };

    const fetchInventory = async () => {
      setLoadingItems(true);
      try {
        const { data, error } = await supabase
          .from('cafeteria_inventory')
          .select('*')
          .eq('is_available', true)
          .order('name');
        
        if (error) throw error;
        setMenuItems(data || []);
      } catch (error) {
        console.error("Error fetching cafeteria inventory:", error);
      } finally {
        setLoadingItems(false);
      }
    };

    obtenerTasa();
    fetchInventory();
  }, []);

  const formatBs = (monto) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(monto * tasaBCV);
  };

  const agregarAlCarrito = (item) => {
    setCarrito(prev => {
      const existe = prev.find(i => i.id === item.id);
      if (existe) {
        return prev.map(i => i.id === item.id ? { ...i, cantidad: i.cantidad + 1 } : i);
      }
      return [...prev, { ...item, cantidad: 1 }];
    });
  };

  const quitarDelCarrito = (id) => {
    setCarrito(prev => prev.filter(i => i.id !== id));
  };

  const ajustarCantidad = (id, delta) => {
    setCarrito(prev => prev.map(i => {
      if (i.id === id) {
        const nuevaCant = Math.max(1, i.cantidad + delta);
        return { ...i, cantidad: nuevaCant };
      }
      return i;
    }));
  };

  const totalUSD = carrito.reduce((acc, i) => acc + (i.price_usd * i.cantidad), 0);

  const handleUploadCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSubiendoCapture(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `payments/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('materiales').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('materiales').getPublicUrl(filePath);
      setScreenshotUrl(publicUrl);
    } catch (error) {
      alert("Error al subir captura: " + error.message);
    } finally {
      setSubiendoCapture(false);
    }
  };

  const procesarPedido = async () => {
    if (metodoPago === 'pago_movil' && !referencia && !screenshotUrl) {
      alert('Por favor ingresa la referencia o sube una captura del pago');
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Debes iniciar sesión");

      const nuevaOrden = {
        student_id: user.id,
        items: [...carrito],
        total_usd: totalUSD,
        total_bs: totalUSD * tasaBCV,
        status: 'pending',
        payment_method: metodoPago,
        payment_reference: referencia,
        screenshot_url: screenshotUrl
      };

      const { data, error } = await supabase
        .from('cafeteria_orders')
        .insert([nuevaOrden])
        .select()
        .single();

      if (error) throw error;

      // Generamos un QR rico en información
      const qrPayload = JSON.stringify({
        id: data.id,
        items: carrito.map(i => ({ n: i.name, c: i.cantidad })),
        total: totalUSD.toFixed(2),
        pago: metodoPago === 'efectivo' ? 'EFECTIVO (POR COBRAR)' : (referencia ? `REF: ${referencia}` : 'PAGO MOVIL (CON CAPTURE)'),
        fecha: new Date().toISOString()
      });

      setOrdenActual({ ...data, qrCodeValue: qrPayload });
      setCheckoutStep(3);
      setCarrito([]);
      setReferencia('');
      setScreenshotUrl('');
    } catch (error) {
      console.error("Error al procesar pedido:", error);
      alert("Error al procesar el pedido: " + error.message);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* ═══ HEADER CAFETÍN ═══ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-[0.85] tracking-tighter italic mb-4">
            SMART <span className="text-vinotinto-800">CAFETÍN</span>
          </h2>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-400 font-medium max-w-md">Ordena tus meriendas favoritas y retira sin colas usando tu código QR.</p>
            {!loadingTasa && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-vinotinto-50 text-vinotinto-800 rounded-full text-[10px] font-black border border-vinotinto-100 shadow-sm">
                <span className="w-2 h-2 bg-vinotinto-600 rounded-full animate-pulse"></span>
                BCV: Bs. {tasaBCV.toFixed(2)}
              </div>
            )}
          </div>
        </div>

        <div className="flex bg-white p-1.5 rounded-[1.5rem] border border-gray-100 shadow-lg">
          <button 
            onClick={() => setTabActiva('menu')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tabActiva === 'menu' ? 'bg-vinotinto-800 text-white shadow-lg' : 'text-gray-400 hover:text-vinotinto-800'}`}
          >
            Menú del Día
          </button>
          <button 
            onClick={() => setTabActiva('pedidos')}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${tabActiva === 'pedidos' ? 'bg-vinotinto-800 text-white shadow-lg' : 'text-gray-400 hover:text-vinotinto-800'}`}
          >
            Mis Pedidos
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {tabActiva === 'menu' ? (
          <Motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 lg:grid-cols-4 gap-8"
          >
            {/* ── GALERÍA DE PRODUCTOS (3/4) ── */}
            <div className="lg:col-span-3 space-y-8">
              <div className="flex items-center gap-4 bg-white p-4 rounded-[2rem] border border-gray-100 shadow-sm mb-8">
                <Search className="w-5 h-5 text-gray-300 ml-2" />
                <input type="text" placeholder="¿Qué se te antoja hoy?" className="bg-transparent border-none outline-none text-sm font-medium w-full placeholder:text-gray-300" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {loadingItems ? (
                   <div className="col-span-full py-20 text-center"><Utensils className="animate-spin text-vinotinto-800 mx-auto" /></div>
                ) : menuItems.map((item) => (
                  <Motion.div 
                    key={item.id}
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/50 group overflow-hidden relative"
                  >
                    <div className="absolute top-4 right-4 bg-gray-50 px-3 py-1 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 text-gold fill-current" />
                      <span className="text-[10px] font-black text-gray-900">4.8</span>
                    </div>
                    
                    <div className="w-20 h-20 bg-gray-50 rounded-3xl overflow-hidden flex items-center justify-center text-4xl mb-6 group-hover:scale-110 transition-transform duration-500">
                      {item.image_url ? <img src={item.image_url} alt="" className="w-full h-full object-cover" /> : <Utensils className="text-gray-200" />}
                    </div>

                    <div className="absolute top-4 left-4 z-20">
                       <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg ${
                         (item.stock || 0) > 10 ? 'bg-emerald-600 text-white shadow-emerald-200' : 
                         (item.stock || 0) > 0 ? 'bg-amber-500 text-white shadow-amber-200' : 
                         'bg-red-600 text-white shadow-red-200'
                       }`}>
                         {(item.stock || 0) > 0 ? `${item.stock} en stock` : 'Agotado'}
                       </span>
                    </div>

                    <div className="mb-2">
                       <span className="text-[9px] font-black uppercase tracking-[0.2em] text-vinotinto-600">{item.category}</span>
                    </div>
                    <h4 className="text-lg font-black text-gray-900 mb-2 leading-tight uppercase italic">{item.name}</h4>
                    <p className="text-sm text-gray-500 font-semibold leading-relaxed mb-6 line-clamp-3">{item.description}</p>

                    <div className="flex items-center justify-between mt-auto">
                      <div>
                        <p className="text-lg font-black text-gray-900">{formatBs(item.price_usd)}</p>
                        <p className="text-[10px] font-bold text-gray-400">Ref: ${item.price_usd}</p>
                      </div>
                      <button 
                        onClick={() => agregarAlCarrito(item)}
                        disabled={item.stock === 0}
                        className="p-3 bg-vinotinto-800 text-white rounded-2xl hover:bg-gold hover:text-vinotinto-950 transition-all active:scale-90 shadow-lg shadow-vinotinto-100 disabled:opacity-30"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                  </Motion.div>
                ))}
              </div>
            </div>

            {/* ── CARRITO LATERAL (1/4) ── */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl sticky top-28">
                <div className="flex items-center gap-3 mb-8">
                  <ShoppingBag className="w-6 h-6 text-vinotinto-800" />
                  <h3 className="text-lg font-black text-gray-900 italic uppercase tracking-tighter">Tu Pedido</h3>
                </div>

                <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {carrito.length === 0 ? (
                    <div className="text-center py-10 opacity-30">
                      <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                      <p className="text-xs font-bold uppercase tracking-widest">Carrito vacío</p>
                    </div>
                  ) : (
                    carrito.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 group">
                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-xl shrink-0">
                          {item.img}
                        </div>
                        <div className="flex-1">
                          <p className="text-xs font-black text-gray-900 truncate">{item.name}</p>
                          <p className="text-[10px] font-bold text-vinotinto-600">{formatBs(item.price_usd)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <button onClick={() => ajustarCantidad(item.id, -1)} className="p-1 text-gray-300 hover:text-vinotinto-800"><Minus className="w-3.5 h-3.5" /></button>
                           <span className="text-xs font-black w-4 text-center">{item.cantidad}</span>
                           <button onClick={() => ajustarCantidad(item.id, 1)} className="p-1 text-gray-300 hover:text-vinotinto-800"><Plus className="w-3.5 h-3.5" /></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="mt-10 pt-8 border-t-2 border-dashed border-gray-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Estimado</span>
                    <span className="text-[10px] font-bold text-gray-400">Ref: ${totalUSD.toFixed(2)}</span>
                  </div>
                  <p className="text-3xl font-black text-gray-900 italic mb-8">{formatBs(totalUSD)}</p>
                  
                  <button 
                    disabled={carrito.length === 0}
                    onClick={() => setShowCheckout(true)}
                    className="w-full py-5 bg-vinotinto-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-vinotinto-100 hover:bg-vinotinto-900 transition-all active:scale-95 disabled:opacity-30"
                  >
                    Proceder al Pago <ArrowRight className="w-4 h-4 inline ml-2" />
                  </button>
                </div>
              </div>
            </div>
          </Motion.div>
        ) : (
          <Motion.div 
            key="pedidos"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {ordenActual ? (
               <div className="max-w-md mx-auto">
                  <Motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-[3rem] shadow-2xl overflow-hidden border border-gray-100 relative"
                  >
                    {/* Encabezado del Ticket */}
                    <div className="bg-vinotinto-800 p-8 text-white text-center relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                          <div className="absolute -top-10 -left-10 w-40 h-40 bg-white rounded-full blur-3xl"></div>
                          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-gold rounded-full blur-3xl"></div>
                       </div>
                       <Utensils className="w-12 h-12 text-gold mx-auto mb-4 relative z-10" />
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter relative z-10">Ticket de <span className="text-gold">Consumo</span></h3>
                       <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60 mt-1 relative z-10">Orden Confirmada</p>
                    </div>

                    {/* Cuerpo del Ticket */}
                    <div className="p-10 text-center">
                        <a 
                          href={`${window.location.origin}/validar/${ordenActual.id}`} 
                          target="_blank" 
                          rel="noreferrer"
                          className="bg-white p-6 rounded-[2.5rem] shadow-inner border border-gray-50 inline-block mb-8 hover:scale-105 transition-transform cursor-pointer"
                          title="Click para ver ticket digital"
                        >
                           <QRCode 
                             value={`${window.location.origin}/validar/${ordenActual.id}`} 
                             size={180} 
                             fgColor="#430d0d"
                             level="H"
                           />
                        </a>
                       
                       <div className="space-y-2 mb-8">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">ID del Pedido</p>
                          <p className="text-xs font-black text-vinotinto-800 break-all px-6">{ordenActual.id}</p>
                       </div>

                       <button 
                         onClick={() => window.open(`${window.location.origin}/validar/${ordenActual.id}`, '_blank')}
                         className="w-full py-4 bg-vinotinto-50 text-vinotinto-800 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-vinotinto-100 hover:bg-vinotinto-100 transition-all mb-4"
                       >
                         Ver Ticket Digital Premium
                       </button>

                       <div className="grid grid-cols-2 gap-4 border-t-2 border-dashed border-gray-100 pt-8 mt-4">
                          <div className="text-left">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                             <p className="text-xl font-black text-gray-900">{formatBs(ordenActual.total_usd)}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Método</p>
                             <p className="text-xs font-black text-vinotinto-800 uppercase bg-vinotinto-50 px-3 py-1 rounded-full inline-block">
                                {ordenActual.payment_method === 'efectivo' ? 'Efectivo' : 'Pago Móvil'}
                             </p>
                          </div>
                       </div>
                    </div>

                    {/* Estética de ticket */}
                    <div className="absolute bottom-24 -left-4 w-8 h-8 bg-slate-50 rounded-full shadow-inner"></div>
                    <div className="absolute bottom-24 -right-4 w-8 h-8 bg-slate-50 rounded-full shadow-inner"></div>
                  </Motion.div>

                  <p className="text-center text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8 flex items-center justify-center gap-2">
                    <Info size={14} /> Muestra este ticket en el mostrador del cafetín
                  </p>
               </div>
            ) : (
              <div className="bg-white rounded-[3rem] p-20 border border-gray-100 shadow-xl text-center">
                <Clock className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                <h3 className="text-xl font-black text-gray-400 italic">No tienes pedidos activos</h3>
                <p className="text-sm text-gray-300 font-medium mt-2">Tus compras con QR aparecerán aquí.</p>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>

      {/* ═══ MODAL CHECKOUT CAFETÍN ═══ */}
      <AnimatePresence>
        {showCheckout && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCheckout(false)}
              className="absolute inset-0 bg-vinotinto-950/60 backdrop-blur-md"
            />
            
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Sidebar Checkout */}
              <div className="md:w-64 bg-vinotinto-900 p-8 text-white flex flex-col justify-between">
                <div>
                   <Utensils className="w-10 h-10 text-gold mb-6" />
                   <h3 className="text-xl font-black italic mb-2 uppercase tracking-tighter">Checkout</h3>
                   <p className="text-xs text-white/50 font-medium">Finaliza tu compra en segundos.</p>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                        checkoutStep >= step ? 'bg-gold text-vinotinto-950 border-gold' : 'border-white/20 text-white/40'
                      }`}>
                        {checkoutStep > step ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${checkoutStep >= step ? 'text-white' : 'text-white/30'}`}>
                        {step === 1 ? 'Resumen' : step === 2 ? 'Pago' : 'QR'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contenido Checkout */}
              <div className="flex-1 p-8 md:p-12 bg-white relative">
                <button onClick={() => setShowCheckout(false)} className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-900 transition-all"><X className="w-6 h-6" /></button>

                {checkoutStep === 1 && (
                  <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <h4 className="text-2xl font-black text-gray-900 italic mb-6 uppercase tracking-tighter">Tu Pedido</h4>
                    <div className="space-y-4 max-h-48 overflow-y-auto pr-4">
                      {carrito.map(item => (
                        <div key={item.id} className="flex justify-between text-sm font-bold text-gray-600">
                          <span>{item.cantidad}x {item.name}</span>
                          <span>{formatBs(item.price_usd * item.cantidad)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-6 bg-gray-50 rounded-[2rem] border border-gray-100 flex justify-between items-end">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Total a Pagar</p>
                        <p className="text-2xl font-black text-gray-900 italic">{formatBs(totalUSD)}</p>
                      </div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Ref: ${totalUSD.toFixed(2)}</p>
                    </div>
                    <button onClick={() => setCheckoutStep(2)} className="w-full py-5 bg-vinotinto-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-vinotinto-900 transition-all">Siguiente <ArrowRight className="w-4 h-4 inline ml-2" /></button>
                  </Motion.div>
                )}

                {checkoutStep === 2 && (
                  <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
                    <h4 className="text-2xl font-black text-gray-900 italic mb-4 uppercase tracking-tighter">Método de <span className="text-vinotinto-800">Pago</span></h4>
                    
                    {/* Selector de Método */}
                    <div className="flex gap-4 mb-6">
                       <button 
                         onClick={() => setMetodoPago('pago_movil')}
                         className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${metodoPago === 'pago_movil' ? 'border-vinotinto-800 bg-vinotinto-50 text-vinotinto-800' : 'border-gray-100 text-gray-400'}`}
                       >
                         <Smartphone size={24} />
                         <span className="text-[9px] font-black uppercase">Pago Móvil</span>
                       </button>
                       <button 
                         onClick={() => setMetodoPago('efectivo')}
                         className={`flex-1 p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${metodoPago === 'efectivo' ? 'border-vinotinto-800 bg-vinotinto-50 text-vinotinto-800' : 'border-gray-100 text-gray-400'}`}
                       >
                         <DollarSign size={24} />
                         <span className="text-[9px] font-black uppercase">Efectivo</span>
                       </button>
                    </div>

                    {metodoPago === 'pago_movil' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Teléfono</p>
                              <p className="text-xs font-black text-gray-900">0412-555-9876</p>
                           </div>
                           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">RIF / Cédula</p>
                              <p className="text-xs font-black text-gray-900">J-40506070-0</p>
                           </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Referencia o Sube Capture</label>
                            <input 
                              value={referencia}
                              onChange={(e) => setReferencia(e.target.value)}
                              type="text" 
                              placeholder="Últimos 6 dígitos" 
                              className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black focus:border-vinotinto-300 outline-none transition-all mb-3" 
                            />
                            
                            <label className={`flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-2xl cursor-pointer transition-all hover:bg-gray-50 ${screenshotUrl ? 'border-emerald-500 bg-emerald-50 text-emerald-600' : 'border-gray-200 text-gray-400'}`}>
                               {subiendoCapture ? <Loader2 className="animate-spin" size={18} /> : screenshotUrl ? <CheckCircle2 size={18}/> : <Upload size={18}/>}
                               <span className="text-[10px] font-black uppercase tracking-widest">{subiendoCapture ? 'Subiendo...' : screenshotUrl ? 'Imagen Cargada' : 'Seleccionar Capture'}</span>
                               <input type="file" accept="image/*" onChange={handleUploadCapture} className="hidden" />
                            </label>
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 bg-amber-50 rounded-2xl border border-amber-100 flex gap-4 items-start">
                        <Info className="text-amber-600 shrink-0 mt-0.5" size={16} />
                        <p className="text-[11px] text-amber-900 font-medium leading-relaxed">
                          Has seleccionado pago en **Efectivo**. Por favor dirígete a la caja del cafetín con el monto exacto para validar tu orden y retirar tus productos.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-4 pt-4">
                      <button onClick={() => setCheckoutStep(1)} className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200">Atrás</button>
                      <button 
                        onClick={procesarPedido} 
                        className="flex-[2] py-5 bg-vinotinto-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-vinotinto-900 transition-all"
                      >
                        Finalizar Orden
                      </button>
                    </div>
                  </Motion.div>
                )}

                {checkoutStep === 3 && (
                  <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-6">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl inline-block mb-6">
                       <QRCode 
                          value={`${window.location.origin}/validar/${ordenActual.id}`} 
                          size={160} 
                          fgColor="#430d0d"
                       />
                    </div>
                    <h4 className="text-2xl font-black text-gray-900 italic mb-2 uppercase tracking-tighter leading-none">¡Pedido Listo!</h4>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] mb-6">Tu ticket ha sido generado</p>
                    
                    <div className="bg-slate-50 p-6 rounded-[2rem] border border-gray-100 w-full mb-8">
                       <div className="flex justify-between items-center text-xs font-black uppercase tracking-widest text-gray-400 mb-2">
                          <span>Total</span>
                          <span>Método</span>
                       </div>
                       <div className="flex justify-between items-end">
                          <span className="text-2xl font-black text-vinotinto-800">{formatBs(ordenActual.total_usd)}</span>
                          <span className="text-[10px] font-black text-vinotinto-600 bg-white px-3 py-1 rounded-full shadow-sm border border-gray-100 uppercase">
                             {ordenActual.payment_method === 'efectivo' ? 'Efectivo' : 'Pago Móvil'}
                          </span>
                       </div>
                    </div>

                    <button 
                      onClick={() => { setShowCheckout(false); setTabActiva('pedidos'); }}
                      className="w-full py-5 bg-vinotinto-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-vinotinto-100 hover:bg-vinotinto-900 transition-all"
                    >
                      Ir a Mis Pedidos <ArrowRight className="w-4 h-4 inline ml-2" />
                    </button>
                  </Motion.div>
                )}
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CafetinEstudiante;
