import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardCheck, 
  Smartphone, 
  Upload, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Info,
  ArrowRight,
  ShieldCheck,
  FileText,
  Search,
  Key
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const Inscripciones = () => {
  const [step, setStep] = useState(1); // 1: Constancia, 2: Pago, 3: Comprobante, 4: Éxito
  const [cupoFile, setCupoFile] = useState(null);
  const [pagoFile, setPagoFile] = useState(null);
  const [referencia, setReferencia] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleNext = () => {
    setStep(prev => prev + 1);
  };

  const uploadFile = async (file, folder) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('enrollments')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('enrollments')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleFinalize = async () => {
    setUploading(true);
    setUploadProgress(10);
    
    try {
      // 1. Obtener usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No se encontró sesión de usuario');

      // 2. Obtener perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setUploadProgress(30);

      // 3. Cargar archivos
      let cupoUrl = '';
      let pagoUrl = '';

      if (cupoFile) cupoUrl = await uploadFile(cupoFile, 'cupos');
      setUploadProgress(60);
      if (pagoFile) pagoUrl = await uploadFile(pagoFile, 'pagos');
      setUploadProgress(80);

      // 4. Guardar Inscripción
      const { error } = await supabase
        .from('enrollments')
        .insert([{
          student_name: profile?.full_name || user.email,
          student_id_card: profile?.id_card || 'N/A', // Asumiendo que existe o se puede extraer
          grade_to_enroll: profile?.grade_level || 'Pendiente',
          representative_name: 'Desde Portal Estudiantil',
          representative_id_card: 'N/A',
          payment_reference: referencia,
          cupo_file_url: cupoUrl,
          pago_file_url: pagoUrl,
          status: 'pending'
        }]);

      if (error) throw error;

      setUploadProgress(100);
      setStep(4);
    } catch (error) {
      console.error('Error al inscribir:', error);
      alert('Error: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const pasos = [
    { id: 1, label: 'Cupo', icon: <Key className="w-4 h-4" /> },
    { id: 2, label: 'Pago', icon: <Smartphone className="w-4 h-4" /> },
    { id: 3, label: 'Validar', icon: <Upload className="w-4 h-4" /> },
  ];

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-8 pb-20"
    >
      {/* HEADER PREMIUM */}
      <div className="bg-gradient-to-br from-[#4a0a10] via-[#630d16] to-[#300008] rounded-[3rem] p-12 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gold/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-center md:text-left">
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-2 rounded-full border border-white/20 mb-6">
               <span className="w-2 h-2 rounded-full bg-gold animate-pulse"></span>
               <span className="text-[10px] font-black uppercase tracking-[0.3em] text-gold">Admisiones 2026</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-display font-black italic tracking-tighter leading-[0.9] mb-6">
              Portal de <br />
              <span className="text-gold">Inscripción</span>
            </h2>
            <p className="text-white/50 text-sm font-medium max-w-md leading-relaxed">
              Formaliza tu ingreso cargando los documentos requeridos. El primer paso es validar tu Constancia de Cupos.
            </p>
          </div>
          <div className="bg-white/5 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white/10 shadow-2xl">
            <ClipboardCheck className="w-24 h-24 text-gold/40" />
          </div>
        </div>
      </div>

      {/* INDICADOR DE PASOS ESTILO APPLE */}
      <div className="flex justify-center items-center gap-4">
        {pasos.map((p, i) => (
          <React.Fragment key={p.id}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                step >= p.id ? 'bg-vinotinto-800 text-white shadow-xl' : 'bg-white text-gray-300 border border-gray-100'
              }`}>
                {step > p.id ? <CheckCircle2 className="w-5 h-5 text-gold" /> : p.icon}
              </div>
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${step >= p.id ? 'text-vinotinto-900' : 'text-gray-400'}`}>
                {p.label}
              </span>
            </div>
            {i < pasos.length - 1 && (
              <div className="w-12 h-[2px] bg-gray-100 rounded-full overflow-hidden">
                 <Motion.div 
                   animate={{ width: step > p.id ? '100%' : '0%' }}
                   className="h-full bg-gold"
                 />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* CONTENEDOR PRINCIPAL */}
      <div className="bg-white/60 backdrop-blur-xl rounded-[3rem] border border-white shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          {/* PASO 1: CONSTANCIA DE CUPOS */}
          {step === 1 && (
            <Motion.div 
              key="cupo"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="p-10 md:p-16 space-y-10"
            >
              <div className="flex flex-col md:flex-row gap-10 items-start">
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-1 bg-amber-50 rounded-full border border-amber-100">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Requisito Obligatorio</span>
                  </div>
                  <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight italic uppercase">
                    1. Constancia de <span className="text-vinotinto">Cupo</span>
                  </h3>
                  <p className="text-slate-500 font-medium leading-relaxed">
                    Antes de proceder al pago, debe adjuntar la Constancia de Cupos emitida por la dirección (Digital o Escaneada). Sin este documento, la inscripción no podrá ser validada.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                       <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Formato PDF, JPG o PNG aceptado</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                       <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                       <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">Debe ser legible y vigente (2026)</span>
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-[400px]">
                  <input 
                    type="file" 
                    id="cupo-upload" 
                    className="hidden" 
                    onChange={(e) => setCupoFile(e.target.files[0])}
                  />
                  <label 
                    htmlFor="cupo-upload"
                    className={`group w-full h-[300px] border-2 border-dashed rounded-[2.5rem] flex flex-col items-center justify-center cursor-pointer transition-all ${
                      cupoFile ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-vinotinto-300 hover:bg-vinotinto-50'
                    }`}
                  >
                    {cupoFile ? (
                      <>
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-4 border border-emerald-100">
                           <FileText className="w-10 h-10 text-emerald-500" />
                        </div>
                        <p className="text-xs font-black text-emerald-700 tracking-tight">{cupoFile.name}</p>
                        <p className="text-[10px] font-bold text-emerald-400 mt-2">Documento listo para procesar</p>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform">
                           <Upload className="w-8 h-8 text-slate-300 group-hover:text-vinotinto-500" />
                        </div>
                        <p className="text-sm font-black text-slate-500">Subir Constancia</p>
                        <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase tracking-widest">Haz clic o arrastra</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="pt-10 border-t border-slate-100">
                <button 
                  onClick={handleNext}
                  disabled={!cupoFile}
                  className="w-full py-6 bg-vinotinto-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-vinotinto-200 hover:bg-vinotinto-950 transition-all disabled:opacity-30 disabled:grayscale flex items-center justify-center gap-4 group"
                >
                  Confirmar y Continuar <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </button>
              </div>
            </Motion.div>
          )}

          {/* PASO 2: PAGO MÓVIL */}
          {step === 2 && (
            <Motion.div 
              key="pago"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 md:p-16 space-y-10"
            >
              <div className="max-w-2xl">
                <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight italic uppercase mb-4">
                  2. Método de <span className="text-gold">Pago</span>
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Realice el pago de la matrícula a través de los canales institucionales. Recuerde que el monto está sujeto a la tasa BCV del día.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-br from-vinotinto-900 to-vinotinto-950 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                   <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                   <Smartphone className="w-10 h-10 text-gold mb-6" />
                   <h4 className="text-xs font-black uppercase tracking-widest text-gold/60 mb-4">Pago Móvil Mercantil</h4>
                   <div className="space-y-4">
                      <div>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">RIF</p>
                        <p className="text-lg font-black tracking-tight">J-12345678-0</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Teléfono</p>
                        <p className="text-lg font-black tracking-tight">0412-555-1234</p>
                      </div>
                   </div>
                </div>

                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 flex flex-col justify-center text-center">
                   <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Arancel de Matrícula</p>
                   <p className="text-5xl font-black text-slate-900 italic tracking-tighter">$120.00</p>
                   <p className="text-xs font-bold text-vinotinto-600 mt-2 uppercase tracking-widest">Referencia USD</p>
                </div>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Atrás
                </button>
                <button 
                  onClick={handleNext}
                  className="flex-1 py-5 bg-vinotinto-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-vinotinto-950 transition-all"
                >
                  Ya realicé el pago
                </button>
              </div>
            </Motion.div>
          )}

          {/* PASO 3: COMPROBANTE DE PAGO */}
          {step === 3 && (
            <Motion.div 
              key="comprobante"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="p-10 md:p-16 space-y-10"
            >
              <div className="max-w-2xl">
                <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight italic uppercase mb-4">
                  3. Registro de <span className="text-vinotinto">Pago</span>
                </h3>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Finalice el proceso cargando el comprobante de pago y el número de referencia bancaria.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-2">Número de Referencia</label>
                  <input 
                    type="text" 
                    value={referencia}
                    onChange={(e) => setReferencia(e.target.value)}
                    placeholder="Ej: 12345678"
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-5 text-sm font-black focus:border-vinotinto-300 outline-none transition-all shadow-inner"
                  />
                </div>
                
                <div className="relative">
                  <input 
                    type="file" 
                    id="pago-upload" 
                    className="hidden" 
                    onChange={(e) => setPagoFile(e.target.files[0])}
                  />
                  <label 
                    htmlFor="pago-upload"
                    className={`w-full h-40 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all ${
                      pagoFile ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200 hover:border-vinotinto-300 hover:bg-vinotinto-50'
                    }`}
                  >
                    {pagoFile ? (
                      <span className="text-xs font-black text-emerald-700">{pagoFile.name}</span>
                    ) : (
                      <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Subir Comprobante de Pago</span>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-4 pt-10 border-t border-slate-100">
                <button 
                  onClick={() => setStep(2)}
                  className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                >
                  Atrás
                </button>
                <button 
                  onClick={handleFinalize}
                  disabled={!pagoFile || uploading || !referencia}
                  className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:bg-emerald-700 transition-all disabled:opacity-30"
                >
                  {uploading ? `Procesando ${uploadProgress}%...` : 'Finalizar Inscripción'}
                </button>
              </div>
            </Motion.div>
          )}

          {/* PASO 4: ÉXITO */}
          {step === 4 && (
            <Motion.div 
              key="exito"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-16 flex flex-col items-center text-center space-y-8"
            >
              <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <div className="space-y-4">
                <h3 className="text-4xl font-display font-black text-slate-900 tracking-tight italic uppercase leading-none">
                  ¡Inscripción en <span className="text-vinotinto">Revisión</span>!
                </h3>
                <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                  Tus documentos (Constancia de Cupo y Comprobante de Pago) han sido recibidos. Recibirás una notificación en las próximas 48 horas.
                </p>
              </div>
              
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-center gap-4 max-w-xs">
                 <ShieldCheck className="w-6 h-6 text-emerald-500" />
                 <p className="text-[10px] font-bold text-slate-600 uppercase tracking-tight text-left">
                    Tu cupo está reservado temporalmente mientras validamos los recaudos.
                 </p>
              </div>

              <button 
                onClick={() => setStep(1)}
                className="px-16 py-6 bg-vinotinto-800 text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-vinotinto-200 hover:bg-vinotinto-950 transition-all"
              >
                Volver al Panel
              </button>
            </Motion.div>
          )}
        </AnimatePresence>
      </div>
    </Motion.div>
  );
};

export default Inscripciones;
