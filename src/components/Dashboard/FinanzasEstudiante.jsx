import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Download, 
  Upload, 
  ChevronRight, 
  Smartphone, 
  Info,
  Calendar,
  DollarSign,
  ArrowRight,
  FileText,
  X
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const FinanzasEstudiante = () => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [paymentStep, setPaymentStep] = useState(1); // 1: Info, 2: Form, 3: Success
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [referencia, setReferencia] = useState('');
  const [montoPagar, setMontoPagar] = useState('45.00');
  const [mesPagar, setMesPagar] = useState('');
  
  // Tasa BCV State
  const [tasaBCV, setTasaBCV] = useState(40.00); // Fallback por defecto
  const [loadingTasa, setLoadingTasa] = useState(true);
  const [fechaTasa, setFechaTasa] = useState("");

  // Fetch Data from Supabase
  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. Tasa BCV
        const resTasa = await fetch('https://ve.dolarapi.com/v1/dolares');
        const dataTasa = await resTasa.json();
        const oficial = dataTasa.find(d => d.fuente === 'oficial');
        if (oficial) {
          setTasaBCV(oficial.promedio);
          setFechaTasa(new Date(oficial.fechaActualizacion).toLocaleDateString('es-VE'));
        }

        // 2. Transacciones Reales
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: trans, error } = await supabase
            .from('transactions')
            .select('*')
            .eq('student_id', user.id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setTransactions(trans || []);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
        setLoadingTasa(false);
      }
    };
    fetchData();
  }, []);

  const formatBs = (monto) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency: 'VES' }).format(monto * tasaBCV);
  };

  const esSolvente = transactions.length > 0 && transactions.filter(m => m.status === 'pending' || m.status === 'overdue').length === 0;

  const uploadFile = async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `payments/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('enrollments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('enrollments')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleEnviarPago = async (e) => {
    e.preventDefault();
    setUploadProgress(10);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let fileUrl = '';
      if (selectedFile) {
        fileUrl = await uploadFile(selectedFile);
      }
      setUploadProgress(70);

      const { error } = await supabase
        .from('transactions')
        .insert([{
          student_id: user.id,
          amount: parseFloat(montoPagar),
          concept: `Pago Mensualidad: ${mesPagar || 'Mes Actual'}`,
          status: 'pending',
          payment_reference: referencia, // Asumiendo que agregamos esta columna o usamos concept
          due_date: new Date().toISOString().split('T')[0]
        }]);

      if (error) throw error;
      setUploadProgress(100);
      setPaymentStep(3);
      
      // Refresh transactions
      const { data: trans } = await supabase
        .from('transactions')
        .select('*')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });
      setTransactions(trans || []);

    } catch (error) {
      console.error('Error enviando pago:', error);
      alert('Error al procesar el pago: ' + error.message);
    }
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* ═══ HEADER DE ESTADO ═══ */}
      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative overflow-hidden rounded-[3rem] p-10 text-white shadow-2xl ${
          esSolvente 
            ? 'bg-gradient-to-br from-emerald-600 to-teal-900 shadow-emerald-200/50' 
            : 'bg-gradient-to-br from-[#630d16] via-[#4a0a10] to-[#300008] shadow-vinotinto-200/50'
        }`}
      >
        {/* Decoración */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                {esSolvente ? <CheckCircle2 className="w-8 h-8 text-white" /> : <AlertCircle className="w-8 h-8 text-amber-400" />}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/10 px-4 py-1 rounded-full border border-white/20 w-fit">
                  Estado de Cuenta
                </span>
                {!loadingTasa && (
                  <span className="text-[9px] font-bold text-white/50 mt-2 ml-1">
                    Tasa BCV: <span className="text-gold">Bs. {tasaBCV.toFixed(2)}</span> ({fechaTasa})
                  </span>
                )}
              </div>
            </div>
            <h2 className="text-4xl lg:text-5xl font-black italic tracking-tighter leading-none mb-4">
              {esSolvente ? 'ESTÁS AL DÍA' : 'PAGOS PENDIENTES'}
            </h2>
            <p className="text-white/70 text-sm font-medium max-w-md">
              {esSolvente 
                ? '¡Felicidades! Te encuentras solvente con la institución. Gracias por tu responsabilidad.' 
                : 'Tienes mensualidades pendientes por reportar. Recuerda que la solvencia es necesaria para tus evaluaciones.'}
            </p>
          </div>

          <div className="flex gap-4">
            {!esSolvente && (
              <button 
                onClick={() => setShowPaymentForm(true)}
                className="px-8 py-5 bg-amber-500 text-vinotinto-950 rounded-[2rem] text-xs font-black uppercase tracking-widest shadow-xl hover:bg-white hover:scale-105 active:scale-95 transition-all"
              >
                Pagar Ahora <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
            )}
            <button className="px-8 py-5 bg-white/10 backdrop-blur-md text-white border border-white/20 rounded-[2rem] text-xs font-black uppercase tracking-widest hover:bg-white/20 transition-all">
              <Download className="w-4 h-4 inline mr-2" /> Estado PDF
            </button>
          </div>
        </div>
      </Motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ── COLUMNA IZQUIERDA: LISTA DE MESES ── */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">Mensualidades 2025-2026</h3>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pagado</span>
              <span className="w-3 h-3 bg-red-500 rounded-full ml-2"></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Pendiente</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {loading ? (
              <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-400">
                <Loader2 className="w-10 h-10 animate-spin mb-4" />
                <p className="text-sm font-bold uppercase tracking-widest">Cargando transacciones...</p>
              </div>
            ) : transactions.length === 0 ? (
              <div className="col-span-2 py-20 flex flex-col items-center justify-center text-gray-400 bg-white rounded-[2rem] border-2 border-dashed border-gray-100">
                <Info className="w-10 h-10 mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-widest">No hay transacciones registradas</p>
              </div>
            ) : transactions.map((m, i) => (
              <Motion.div 
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-xl shadow-gray-200/40 group hover:shadow-2xl transition-all"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl ${m.status === 'paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      <Calendar className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-black text-gray-900">{m.concept}</span>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                    m.status === 'paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700 animate-pulse'
                  }`}>
                    {m.status === 'paid' ? 'Pagado' : m.status === 'pending' ? 'Pendiente' : 'Vencido'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Monto</p>
                    <div className="flex flex-col">
                      <p className="text-lg font-black text-gray-900">{formatBs(m.amount)}</p>
                      <p className="text-[10px] font-bold text-vinotinto-600 italic">Ref: ${m.amount} USD</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Fecha</p>
                    <p className="text-xs font-black text-gray-600">{new Date(m.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </Motion.div>
            ))}
          </div>
        </div>

        {/* ── COLUMNA DERECHA: PAGO MÓVIL INFO ── */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-gray-900 tracking-tight italic px-2">Datos de Pago</h3>
          
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-2xl relative overflow-hidden">
             {/* Decoración fondo */}
             <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-vinotinto-50 rounded-full blur-3xl opacity-50"></div>
             
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 bg-vinotinto-800 rounded-2xl flex items-center justify-center shadow-lg shadow-vinotinto-200">
                    <Smartphone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 uppercase tracking-tighter">Pago Móvil</h4>
                    <p className="text-[9px] font-bold text-vinotinto-600 uppercase tracking-widest">Único método disponible</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-vinotinto-200 transition-all">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Banco</p>
                    <p className="text-sm font-black text-gray-900">BANCO MERCANTIL (0105)</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-vinotinto-200 transition-all">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Teléfono</p>
                    <p className="text-sm font-black text-gray-900">0412-555-1234</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 group hover:border-vinotinto-200 transition-all">
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">Cédula / RIF</p>
                    <p className="text-sm font-black text-gray-900">V-12.345.678</p>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                  <Info className="w-5 h-5 text-amber-600 shrink-0" />
                  <p className="text-[10px] font-medium text-amber-800 leading-relaxed">
                    Asegúrate de guardar el comprobante para subirlo al sistema y validar tu pago.
                  </p>
                </div>
             </div>
          </div>
        </div>

      </div>

      {/* ═══ MODAL DE PAGO ═══ */}
      <AnimatePresence>
        {showPaymentForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <Motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPaymentForm(false)}
              className="absolute inset-0 bg-[#300008]/60 backdrop-blur-md"
            />
            
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
              {/* Sidebar del Modal */}
              <div className="md:w-64 bg-vinotinto-900 p-8 text-white flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/20">
                    <DollarSign className="w-6 h-6 text-amber-400" />
                  </div>
                  <h3 className="text-xl font-black italic mb-2 leading-tight">Reportar Pago</h3>
                  <p className="text-xs text-white/50 font-medium leading-relaxed">Completa el formulario para validar tu mensualidad.</p>
                </div>

                <div className="relative z-10 space-y-4">
                  {[1, 2, 3].map(step => (
                    <div key={step} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border ${
                        paymentStep >= step ? 'bg-amber-500 text-vinotinto-950 border-amber-500' : 'border-white/20 text-white/40'
                      }`}>
                        {paymentStep > step ? <CheckCircle2 className="w-3.5 h-3.5" /> : step}
                      </div>
                      <span className={`text-[10px] font-black uppercase tracking-widest ${paymentStep >= step ? 'text-white' : 'text-white/30'}`}>
                        {step === 1 ? 'Información' : step === 2 ? 'Subir' : 'Éxito'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Contenido del Modal */}
              <div className="flex-1 p-8 md:p-12 bg-white relative">
                <button 
                  onClick={() => setShowPaymentForm(false)}
                  className="absolute top-6 right-6 p-2 text-gray-300 hover:text-gray-900 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>

                {paymentStep === 1 && (
                  <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight italic mb-2">Paso 1: Datos del Pago</h4>
                      <p className="text-sm text-gray-500 font-medium">Introduce la referencia bancaria.</p>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Referencia Bancaria</label>
                        <input 
                          type="text" 
                          required
                          value={referencia}
                          onChange={(e) => setReferencia(e.target.value)}
                          placeholder="Ej: 123456"
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black focus:border-vinotinto-300 outline-none transition-all shadow-inner"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">Mes a Cancelar</label>
                        <select 
                          value={mesPagar}
                          onChange={(e) => setMesPagar(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black focus:border-vinotinto-300 outline-none transition-all shadow-inner appearance-none"
                        >
                          <option value="">Seleccione mes...</option>
                          <option value="Diciembre">Diciembre - $45</option>
                          <option value="Enero">Enero - $50</option>
                          <option value="Febrero">Febrero - $50</option>
                          <option value="Marzo">Marzo - $50</option>
                        </select>
                      </div>
                    </div>

                    <div className="p-6 bg-vinotinto-50 rounded-[2rem] border border-vinotinto-100">
                      <p className="text-[10px] font-black text-vinotinto-800 uppercase tracking-widest mb-2">Total a Transferir (BCV)</p>
                      <p className="text-3xl font-black text-vinotinto-900 italic">{formatBs(45)}</p>
                      <div className="flex justify-between items-center mt-2 pt-2 border-t border-vinotinto-100">
                        <p className="text-[9px] font-bold text-vinotinto-400 uppercase">Ref: $45.00 USD</p>
                        <p className="text-[9px] font-black text-vinotinto-600 uppercase">Tasa BCV: Bs. {tasaBCV.toFixed(2)}</p>
                      </div>
                    </div>

                    <button 
                      onClick={() => setPaymentStep(2)}
                      className="w-full py-5 bg-vinotinto-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-vinotinto-900 transition-all active:scale-95"
                    >
                      Siguiente Paso <ArrowRight className="w-4 h-4 inline ml-2" />
                    </button>
                  </Motion.div>
                )}

                {paymentStep === 2 && (
                  <Motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                    <div>
                      <h4 className="text-2xl font-black text-gray-900 tracking-tight italic mb-2">Paso 2: Comprobante</h4>
                      <p className="text-sm text-gray-500 font-medium">Adjunta la captura de pantalla de tu Pago Móvil.</p>
                    </div>

                    <div className="relative">
                      <input 
                        type="file" 
                        onChange={handleFileChange}
                        className="hidden" 
                        id="receipt-upload" 
                        accept="image/*"
                      />
                      <label 
                        htmlFor="receipt-upload"
                        className={`w-full h-48 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${
                          selectedFile ? 'border-emerald-200 bg-emerald-50' : 'border-gray-200 hover:border-vinotinto-300 hover:bg-vinotinto-50'
                        }`}
                      >
                        {selectedFile ? (
                          <>
                            <FileText className="w-10 h-10 text-emerald-500 mb-3" />
                            <p className="text-xs font-black text-emerald-700">{selectedFile.name}</p>
                            <p className="text-[10px] text-emerald-500/60 font-bold mt-1">Archivo seleccionado</p>
                          </>
                        ) : (
                          <>
                            <Upload className="w-10 h-10 text-gray-300 mb-3 group-hover:text-vinotinto-400" />
                            <p className="text-xs font-black text-gray-500">Haz clic para subir o arrastra</p>
                            <p className="text-[10px] text-gray-300 font-bold mt-1 uppercase tracking-widest">JPG, PNG hasta 5MB</p>
                          </>
                        )}
                      </label>
                      
                      {uploadProgress > 0 && uploadProgress < 100 && (
                        <div className="absolute bottom-0 left-0 h-1 bg-vinotinto-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
                      )}
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => setPaymentStep(1)}
                        className="flex-1 py-5 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-gray-200 transition-all"
                      >
                        Atrás
                      </button>
                      <button 
                        onClick={handleEnviarPago}
                        disabled={!selectedFile}
                        className="flex-[2] py-5 bg-vinotinto-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-vinotinto-900 transition-all disabled:opacity-30"
                      >
                        Validar Pago <CheckCircle2 className="w-4 h-4 inline ml-2" />
                      </button>
                    </div>
                  </Motion.div>
                )}

                {paymentStep === 3 && (
                  <Motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center py-10">
                    <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-6">
                      <CheckCircle2 className="w-10 h-10" />
                    </div>
                    <h4 className="text-3xl font-black text-gray-900 tracking-tight italic mb-4 leading-none">¡Recibido con éxito!</h4>
                    <p className="text-sm text-gray-500 font-medium max-w-xs mb-10 leading-relaxed">
                      Tu reporte de pago ha sido enviado al departamento administrativo. Se validará en las próximas 24-48 horas hábiles.
                    </p>
                    <button 
                      onClick={() => setShowPaymentForm(false)}
                      className="px-12 py-5 bg-vinotinto-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-vinotinto-900 transition-all"
                    >
                      Entendido
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

export default FinanzasEstudiante;
