import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Coffee, ShoppingBag, Plus, Minus, CreditCard, QrCode, X, AlertCircle, Flame, Leaf, Star, Loader2, DollarSign, Upload, CheckCircle2 } from 'lucide-react';
import QRCode from 'react-qr-code';
import { supabase } from '../lib/supabaseClient';

const TagIcon = ({ tag }: { tag: string }) => {
  if (tag === 'Popular' || tag === 'comida') return <Flame size={10} />;
  if (tag === 'Saludable' || tag === 'bebida') return <Leaf size={10} />;
  if (tag === 'Especial') return <Star size={10} />;
  return null;
};

const Cafeteria = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState<{product: any, qty: number}[]>([]);
  const [isCheckout, setIsCheckout] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [tasaBCV, setTasaBCV] = useState(50); // Fallback
  
  // Payment States
  const [paymentMethod, setPaymentMethod] = useState<'pago_movil' | 'efectivo'>('pago_movil');
  const [paymentRef, setPaymentRef] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState('');
  const [uploadingScreenshot, setUploadingScreenshot] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchTasa();
  }, []);

  const fetchTasa = async () => {
    try {
      const res = await fetch('https://ve.dolarapi.com/v1/dolares/oficial');
      const data = await res.json();
      if (data.promedio) setTasaBCV(data.promedio);
    } catch (e) { console.error(e); }
  };

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cafeteria_inventory')
        .select('*')
        .eq('is_available', true)
        .order('name');
      
      if (error) throw error;
      setMenuItems(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item => item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const updateQty = (productId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  const total = cart.reduce((acc, item) => acc + (item.product.price_usd * item.qty), 0);

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingScreenshot(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `payments/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('materiales')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('materiales')
        .getPublicUrl(filePath);

      setScreenshotUrl(publicUrl);
    } catch (error: any) {
      alert("Error al subir captura: " + error.message);
    } finally {
      setUploadingScreenshot(false);
    }
  };

  const handleCheckout = async () => {
    if (paymentMethod === 'pago_movil' && !paymentRef && !screenshotUrl) {
      alert("Por favor ingresa la referencia o sube una captura del pago.");
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Sesión no encontrada");

      const nuevaOrden = {
        student_id: user.id,
        items: cart.map(i => ({ name: i.product.name, qty: i.qty, price: i.product.price_usd })),
        total_usd: total,
        total_bs: total * tasaBCV,
        status: 'pending',
        payment_method: paymentMethod,
        payment_reference: paymentRef,
        screenshot_url: screenshotUrl
      };

      const { data, error } = await supabase
        .from('cafeteria_orders')
        .insert([nuevaOrden])
        .select()
        .single();

      if (error) throw error;

      const qrData = JSON.stringify({ 
        orderId: data.id, 
        total: total.toFixed(2), 
        items: cart.map(i => ({ name: i.product.name, qty: i.qty })), 
        date: new Date().toISOString() 
      });
      setQrCodeData(qrData);
      setIsCheckout(true);
    } catch (error: any) {
      alert("Error al procesar pedido: " + error.message);
    }
  };

  const handleReset = () => {
    setCart([]);
    setIsCheckout(false);
    setQrCodeData(null);
  };

  const [showPaymentModal, setShowPaymentModal] = useState(false);

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
      
      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* Menú Principal */}
        <div className="flex-1 space-y-10">
          <div>
            <h1 className="text-3xl md:text-5xl font-display font-black text-slate-800 tracking-tighter mb-2">Smart Cafetería</h1>
            <p className="text-slate-500 text-lg">Ordena desde tu salón y retira con tu Código QR en el mostrador.</p>
          </div>

          {/* Menú del Día */}
          <div>
            <h2 className="text-2xl font-display font-black text-slate-800 mb-6 flex items-center gap-3">
              <Coffee className="text-vinotinto"/> Menú del Día
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {loading ? (
                <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin text-vinotinto mx-auto w-10 h-10" /></div>
              ) : menuItems.length === 0 ? (
                <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-200 rounded-3xl">
                  <p className="text-slate-400 font-bold uppercase tracking-widest">No hay productos disponibles</p>
                </div>
              ) : menuItems.map(product => (
                <div 
                  key={product.id} 
                  className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 hover:border-vinotinto/20 transition-all group cursor-pointer flex gap-5"
                >
                  <div className={`w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform overflow-hidden`}>
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl">🥐</span>
                    )}
                  </div>
                  
                  <div className="flex flex-col flex-1 py-0.5">
                    <div className="flex gap-2 mb-1.5">
                      <span className="text-[9px] font-black uppercase tracking-widest text-vinotinto bg-vinotinto/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                        <TagIcon tag={product.category} />
                        {product.category}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-800 leading-tight mb-0.5">{product.name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mb-auto">{product.description}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-black text-lg text-slate-800">${product.price_usd}</span>
                      <button 
                        onClick={() => addToCart(product)}
                        className="bg-slate-100 hover:bg-vinotinto hover:text-white text-slate-600 p-2.5 rounded-xl transition-all active:scale-90 shadow-sm"
                      >
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Aviso Parental */}
          <div className="bg-vinotinto/5 border border-vinotinto/20 rounded-3xl p-6 flex gap-4 items-start">
            <AlertCircle className="text-vinotinto shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-vinotinto mb-1">Aviso de Restricción Dietética</h4>
              <p className="text-sm text-vinotinto/70">Tus representantes han bloqueado la compra de "Bebidas Gaseosas" y "Golosinas Altas en Azúcar" de tu catálogo.</p>
            </div>
          </div>
        </div>

        {/* Carrito Lateral */}
        <div className="w-full lg:w-[380px] shrink-0">
          <div className="bg-white rounded-[2.5rem] p-8 shadow-xl border border-slate-100 sticky top-10">
            <h2 className="text-2xl font-display font-black text-slate-800 mb-2">Tu Pedido</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-8">{cart.length} artículos</p>
            
            {cart.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag size={32} className="text-slate-300" />
                </div>
                <p className="font-bold text-slate-400 text-sm">Tu bandeja está vacía</p>
                <p className="text-xs text-slate-300 mt-1">Agrega algo delicioso del menú</p>
              </div>
            ) : (
              <div className="space-y-5 mb-8 max-h-[45vh] overflow-y-auto pr-2">
                {cart.map(item => (
                  <div key={item.product.id} className="flex gap-4 items-center">
                    <div className={`w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 shadow-sm overflow-hidden`}>
                      {item.product.image_url ? (
                        <img src={item.product.image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl">🥐</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm text-slate-800 leading-tight truncate">{item.product.name}</h4>
                      <span className="text-vinotinto font-black text-sm">${(item.product.price_usd * item.qty).toFixed(2)}</span>
                    </div>
                    
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => updateQty(item.product.id, -1)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                        <Minus size={12} />
                      </button>
                      <span className="font-bold text-sm w-5 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.product.id, 1)} className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                        <Plus size={12} />
                      </button>
                    </div>
                    
                    <button onClick={() => removeFromCart(item.product.id)} className="text-[10px] uppercase font-bold text-red-400 hover:text-red-500 shrink-0">
                      <X size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-100 pt-6">
              <div className="flex justify-between items-center mb-6">
                <span className="text-slate-500 font-bold">Total</span>
                <span className="text-3xl font-display font-black text-slate-800">${total.toFixed(2)}</span>
              </div>
              
              <button 
                onClick={() => setShowPaymentModal(true)}
                disabled={cart.length === 0}
                className="w-full bg-vinotinto text-white rounded-2xl py-4 font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-2 hover:bg-vinotinto-dark transition-colors shadow-xl shadow-vinotinto/20 disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none"
              >
                <CreditCard size={18} /> Pagar Pedido
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Selección de Pago */}
      <AnimatePresence>
        {showPaymentModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setShowPaymentModal(false)}></div>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 md:p-12 max-w-xl w-full relative z-10 shadow-2xl"
            >
              <h2 className="text-3xl font-display font-black text-slate-800 mb-2 tracking-tighter uppercase italic">Selecciona tu <span className="text-vinotinto">Pago</span></h2>
              <p className="text-slate-500 mb-8 font-medium">Elige el método que prefieras para completar tu orden.</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setPaymentMethod('pago_movil')}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'pago_movil' ? 'border-vinotinto bg-vinotinto/5 text-vinotinto shadow-lg' : 'border-slate-100 text-slate-400'}`}
                >
                  <CreditCard size={32} />
                  <span className="font-black uppercase tracking-widest text-xs">Pago Móvil</span>
                </button>
                <button 
                  onClick={() => setPaymentMethod('efectivo')}
                  className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${paymentMethod === 'efectivo' ? 'border-vinotinto bg-vinotinto/5 text-vinotinto shadow-lg' : 'border-slate-100 text-slate-400'}`}
                >
                  <DollarSign size={32} />
                  <span className="font-black uppercase tracking-widest text-xs">Efectivo</span>
                </button>
              </div>

              {paymentMethod === 'pago_movil' && (
                <div className="space-y-6 mb-8 p-6 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Referencia Bancaria</label>
                    <input 
                      type="text" 
                      value={paymentRef}
                      onChange={(e) => setPaymentRef(e.target.value)}
                      placeholder="Últimos 6 dígitos" 
                      className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto outline-none transition-all"
                    />
                  </div>
                  
                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">O Sube tu Captura</label>
                    <label className={`flex flex-col items-center justify-center gap-2 p-6 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all hover:border-vinotinto ${screenshotUrl ? 'border-green-500 bg-green-50' : 'border-slate-200 text-slate-400'}`}>
                      {uploadingScreenshot ? <Loader2 className="animate-spin text-vinotinto" /> : screenshotUrl ? <CheckCircle2 className="text-green-500" /> : <Upload />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{uploadingScreenshot ? 'Subiendo...' : screenshotUrl ? 'Captura Cargada' : 'Seleccionar Imagen'}</span>
                      <input type="file" accept="image/*" onChange={handleScreenshotUpload} className="hidden" />
                    </label>
                    {screenshotUrl && (
                      <button onClick={() => setScreenshotUrl('')} className="absolute top-8 right-2 p-1 bg-red-500 text-white rounded-full"><X size={12}/></button>
                    )}
                  </div>
                </div>
              )}

              {paymentMethod === 'efectivo' && (
                <div className="p-6 bg-amber-50 rounded-[2.5rem] border border-amber-100 mb-8 flex gap-4 items-start">
                  <AlertCircle className="text-amber-600 shrink-0 mt-1" />
                  <p className="text-xs text-amber-900 font-medium leading-relaxed">
                    Recuerda que si pagas en efectivo, deberás cancelar el monto exacto en caja antes de retirar tu pedido. El QR se generará como <span className="font-black uppercase">Pendiente de Cobro</span>.
                  </p>
                </div>
              )}

              <button 
                onClick={() => { handleCheckout(); setShowPaymentModal(false); }}
                className="w-full bg-vinotinto text-white rounded-2xl py-5 font-display font-black uppercase tracking-widest text-sm shadow-xl shadow-vinotinto/20 hover:bg-vinotinto-dark transition-all"
              >
                Finalizar Pedido
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal QR de Pago */}
      <AnimatePresence>
        {isCheckout && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={() => setIsCheckout(false)}></div>
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-10 md:p-16 max-w-lg w-full relative z-10 text-center shadow-2xl"
            >
              <button onClick={() => setIsCheckout(false)} className="absolute top-8 right-8 text-slate-400 hover:text-slate-800">
                <X size={24} />
              </button>
              
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <QrCode size={40} />
              </div>
              
              <h2 className="text-3xl font-display font-black text-slate-800 mb-2">¡Pedido Confirmado!</h2>
              <p className="text-slate-500 mb-8">Escanea este código en el mostrador principal para retirar tu pedido.</p>
              
              <div className="bg-white p-6 rounded-3xl inline-block shadow-lg border border-slate-100 mb-8">
                {qrCodeData && (
                  <QRCode value={qrCodeData} size={200} fgColor="#1a1c23" />
                )}
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-5 flex justify-between items-center text-sm font-bold mb-8">
                <span className="text-slate-500">Monto Total:</span>
                <span className="text-2xl font-display font-black text-vinotinto">${total.toFixed(2)}</span>
              </div>

              <button 
                onClick={handleReset}
                className="w-full py-4 text-vinotinto bg-vinotinto/10 hover:bg-vinotinto/20 font-display font-black uppercase tracking-widest text-sm rounded-2xl transition-colors"
              >
                Volver a la Cafetería
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Cafeteria;
