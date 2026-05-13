import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Download, FileText, CheckCircle2, AlertCircle, Clock, Search, ExternalLink, ChevronRight, X } from 'lucide-react';

const TRANSACTIONS = [
  { id: 'REC-2026-001', concept: 'Inscripción Año Escolar 2026-2027', amount: 150.00, date: '15 Ago 2026', status: 'Pagado' },
  { id: 'REC-2026-002', concept: 'Mensualidad Septiembre', amount: 50.00, date: '01 Sep 2026', status: 'Pagado' },
  { id: 'REC-2026-003', concept: 'Mensualidad Octubre', amount: 50.00, date: '01 Oct 2026', status: 'Pagado' },
  { id: 'REC-2026-004', concept: 'Mensualidad Noviembre', amount: 50.00, date: '01 Nov 2026', status: 'Pendiente' },
  { id: 'REC-2026-005', concept: 'Cuota Especial Mantenimiento', amount: 25.00, date: '15 Nov 2026', status: 'Pendiente' }
];

const Finanzas = () => {
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [selectedTx, setSelectedTx] = useState<any>(null);

  const pendingAmount = TRANSACTIONS.filter(t => t.status === 'Pendiente').reduce((acc, t) => acc + t.amount, 0);

  const handlePay = (tx: any) => {
    setSelectedTx(tx);
    setIsPaymentOpen(true);
  };

  const handleSimulatePayment = () => {
    setTimeout(() => {
      setIsPaymentOpen(false);
      alert('¡Pago procesado con éxito! (Simulación)');
    }, 1500);
  };

  return (
    <div className="p-4 md:p-10 max-w-[1600px] mx-auto">
      
      <div className="mb-10">
        <h1 className="text-4xl md:text-5xl font-display font-black text-slate-800 tracking-tighter mb-2">Administración Financiera</h1>
        <p className="text-slate-500 text-lg">Consulta de estados de cuenta, facturas y pagos en línea.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-10">
        
        {/* Panel Izquierdo: Resumen y Tarjeta */}
        <div className="lg:col-span-1 space-y-8">
          
          <div className="bg-gradient-to-br from-slate-900 to-[#1a1c23] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-[250px] flex flex-col justify-between group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            
            <div className="relative z-10 flex justify-between items-start">
              <div>
                <p className="text-white/60 font-bold uppercase tracking-widest text-xs mb-1">Total Pendiente</p>
                <h2 className="text-5xl font-display font-black text-gold">${pendingAmount.toFixed(2)}</h2>
              </div>
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md">
                <AlertCircle size={24} className={pendingAmount > 0 ? "text-amber-400" : "text-green-400"} />
              </div>
            </div>

            <div className="relative z-10 pt-6 border-t border-white/10 flex justify-between items-end">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-widest font-bold mb-1">Titular de Cuenta</p>
                <p className="font-display font-black text-xl tracking-wide">Familia Martínez</p>
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Mastercard-logo.png" className="h-8 opacity-50 grayscale group-hover:grayscale-0 transition-all duration-500" alt="Mastercard" />
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl border border-slate-100">
            <h3 className="font-display font-black text-xl text-slate-800 mb-6">Métodos Rápidos</h3>
            <div className="space-y-4">
              <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-4 px-6 rounded-2xl font-bold flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <CreditCard size={20} className="text-slate-400" />
                  Pagar Todo el Saldo
                </div>
                <ChevronRight size={16} className="text-slate-400" />
              </button>
              <button className="w-full bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 py-4 px-6 rounded-2xl font-bold flex items-center justify-between transition-colors">
                <div className="flex items-center gap-3">
                  <FileText size={20} className="text-slate-400" />
                  Descargar Estado de Cuenta
                </div>
                <Download size={16} className="text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Panel Derecho: Historial de Transacciones */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-[2.5rem] p-6 md:p-10 shadow-xl border border-slate-100 min-h-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
              <h2 className="text-2xl font-display font-black text-slate-800">Historial de Recibos</h2>
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Buscar recibo..." 
                  className="pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-vinotinto focus:ring-2 ring-vinotinto/10 outline-none w-full sm:w-64"
                />
              </div>
            </div>

            <div className="space-y-4">
              {TRANSACTIONS.map(tx => (
                <div key={tx.id} className="flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border border-slate-100 hover:border-slate-300 transition-colors gap-4">
                  
                  <div className="flex items-center gap-5 w-full sm:w-auto">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                      tx.status === 'Pagado' ? 'bg-green-50 text-green-500' : 'bg-amber-50 text-amber-500'
                    }`}>
                      {tx.status === 'Pagado' ? <CheckCircle2 size={24} /> : <Clock size={24} />}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 leading-tight mb-1">{tx.concept}</h4>
                      <p className="text-xs text-slate-400 font-bold tracking-widest uppercase">{tx.id} • {tx.date}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full sm:w-auto gap-8 sm:gap-12 mt-4 sm:mt-0 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                    <span className="text-xl font-display font-black text-slate-800">${tx.amount.toFixed(2)}</span>
                    
                    {tx.status === 'Pagado' ? (
                      <button className="flex items-center gap-2 text-slate-400 hover:text-vinotinto font-bold text-xs uppercase tracking-widest transition-colors">
                        PDF <Download size={16} />
                      </button>
                    ) : (
                      <button 
                        onClick={() => handlePay(tx)}
                        className="bg-vinotinto hover:bg-vinotinto-dark text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-lg shadow-vinotinto/20"
                      >
                        Pagar
                      </button>
                    )}
                  </div>

                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal de Pago */}
      <AnimatePresence>
        {isPaymentOpen && selectedTx && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-10 max-w-md w-full relative shadow-2xl"
            >
              <button onClick={() => setIsPaymentOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-800">
                <X size={24} />
              </button>
              
              <div className="w-16 h-16 bg-vinotinto/10 text-vinotinto rounded-full flex items-center justify-center mb-6">
                <CreditCard size={32} />
              </div>
              
              <h2 className="text-2xl font-display font-black text-slate-800 mb-2">Procesar Pago</h2>
              <p className="text-slate-500 text-sm mb-6">Estás a punto de abonar el siguiente concepto a la cuenta de la institución.</p>
              
              <div className="bg-slate-50 rounded-2xl p-5 mb-8 border border-slate-100">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-1">{selectedTx.id}</p>
                <h4 className="font-bold text-slate-800 mb-4 leading-tight">{selectedTx.concept}</h4>
                <div className="flex justify-between items-end border-t border-slate-200 pt-4">
                  <span className="text-slate-500 font-bold text-sm">TOTAL</span>
                  <span className="text-3xl font-display font-black text-vinotinto">${selectedTx.amount.toFixed(2)}</span>
                </div>
              </div>

              <button 
                onClick={handleSimulatePayment}
                className="w-full py-4 bg-vinotinto hover:bg-vinotinto-dark text-white font-display font-black uppercase tracking-widest text-sm rounded-2xl transition-all shadow-xl shadow-vinotinto/20 mb-4"
              >
                Confirmar Transacción
              </button>
              <p className="text-center text-xs text-slate-400 flex items-center justify-center gap-1">
                <ExternalLink size={12} /> Serás redirigido a la pasarela segura.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Finanzas;
