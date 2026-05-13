import React, { useState, useRef } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  User, 
  Users, 
  FileText, 
  CreditCard, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  Upload,
  Smartphone,
  ShieldCheck,
  Info,
  Calendar,
  Sparkles,
  Download,
  Loader2,
  Printer
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from './lib/supabaseClient';
import escudoLogo from './escudo.png';

const FormularioInscripcion = () => {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [descargando, setDescargando] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const planillaRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    // Estudiante
    estudianteNombre: '',
    estudianteCedula: '',
    estudianteGrado: '',
    estudianteFechaNac: '',
    // Representante
    representanteNombre: '',
    representanteCedula: '',
    representanteTelefono: '',
    representanteEmail: '',
    // Pago
    pagoReferencia: '',
  });

  const [cupoFile, setCupoFile] = useState<File | null>(null);
  const [partidaFile, setPartidaFile] = useState<File | null>(null);
  const [pagoFile, setPagoFile] = useState<File | null>(null);

  const updateData = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const uploadFile = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error: uploadError, data } = await supabase.storage
      .from('enrollments')
      .upload(filePath, file);

    if (uploadError) {
      throw uploadError;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('enrollments')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // 1. Cargar Archivos
      let cupoUrl = '';
      let partidaUrl = '';
      let pagoUrl = '';

      if (cupoFile) cupoUrl = await uploadFile(cupoFile, 'cupos');
      setUploadProgress(30);
      if (partidaFile) partidaUrl = await uploadFile(partidaFile, 'partidas');
      setUploadProgress(60);
      if (pagoFile) pagoUrl = await uploadFile(pagoFile, 'pagos');
      setUploadProgress(80);

      // 2. Guardar en Base de Datos
      const { error } = await supabase
        .from('enrollments')
        .insert([{
          student_name: formData.estudianteNombre,
          student_id_card: formData.estudianteCedula,
          grade_to_enroll: formData.estudianteGrado,
          birth_date: formData.estudianteFechaNac,
          representative_name: formData.representanteNombre,
          representative_id_card: formData.representanteCedula,
          representative_phone: formData.representanteTelefono,
          representative_email: formData.representanteEmail,
          payment_reference: formData.pagoReferencia,
          cupo_file_url: cupoUrl,
          partida_file_url: partidaUrl,
          pago_file_url: pagoUrl,
          status: 'pending'
        }]);

      if (error) throw error;

      setUploadProgress(100);
      setSubmitted(true);
    } catch (error: any) {
      console.error('Error en la inscripción:', error);
      alert('Hubo un error al procesar su inscripción: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const generarPDF = async () => {
    if (!planillaRef.current) return;
    setDescargando(true);
    try {
      const canvas = await html2canvas(planillaRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Planilla_Inscripcion_${formData.estudianteNombre.replace(/ /g, '_')}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
    } finally {
      setDescargando(false);
    }
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between items-center max-w-xl mx-auto mb-16 px-4">
      {[1, 2, 3, 4].map((s) => (
        <div key={s} className="flex flex-col items-center gap-3 relative z-10">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 shadow-lg ${
            step >= s ? 'bg-vinotinto text-white shadow-vinotinto/30' : 'bg-white text-slate-300 border border-slate-100'
          }`}>
            {step > s ? <CheckCircle2 className="w-6 h-6 text-gold" /> : (
              s === 1 ? <User size={20} /> : 
              s === 2 ? <Users size={20} /> : 
              s === 3 ? <FileText size={20} /> : 
              <CreditCard size={20} />
            )}
          </div>
          <span className={`text-[10px] font-black uppercase tracking-widest ${step >= s ? 'text-vinotinto' : 'text-slate-400'}`}>
            {s === 1 ? 'Estudiante' : s === 2 ? 'Representante' : s === 3 ? 'Recaudos' : 'Pago'}
          </span>
        </div>
      ))}
      <div className="absolute top-6 left-0 w-full h-[2px] bg-slate-100 -z-0 max-w-xl mx-auto left-1/2 -translate-x-1/2"></div>
    </div>
  );

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full bg-white rounded-[3rem] p-16 text-center shadow-2xl border border-slate-100"
        >
          <div className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-4xl font-display font-black text-slate-900 tracking-tighter italic mb-6">¡Solicitud Registrada!</h2>
          <p className="text-slate-500 text-lg font-medium leading-relaxed mb-10">
            Hemos recibido los datos y recaudos para la inscripción de <strong>{formData.estudianteNombre}</strong>. Nuestro equipo administrativo validará la información y se contactará con usted en un lapso de 48 horas hábiles.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={generarPDF}
              disabled={descargando}
              className="px-10 py-5 bg-vinotinto text-white rounded-2xl font-display font-black uppercase tracking-widest text-xs shadow-xl hover:bg-vinotinto-dark transition-all flex items-center justify-center gap-3"
            >
              {descargando ? <Loader2 className="animate-spin" /> : <Printer size={18} />}
              Descargar Planilla
            </button>
            <button 
              onClick={() => window.location.href = '/'}
              className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-display font-black uppercase tracking-widest text-xs hover:bg-slate-200 transition-all flex items-center justify-center gap-3"
            >
              Volver al Inicio
            </button>
          </div>

          {/* PLANTILLA OCULTA PARA PDF */}
          <div className="fixed left-[-9999px] top-0">
            <div ref={planillaRef} className="w-[800px] p-16 bg-white text-slate-900 font-sans">
               {/* Header Planilla */}
               <div className="flex justify-between items-start border-b-4 border-vinotinto pb-10 mb-10">
                  <div>
                    <img src={escudoLogo} alt="Logo" className="h-24 mb-4" />
                    <h1 className="text-2xl font-black uppercase text-vinotinto">U.E.P. Francisca Elena Burgos Delmoral</h1>
                    <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">DABAJURO - EDO. FALCÓN</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-slate-50 p-4 border border-slate-200 rounded-2xl mb-2">
                       <p className="text-[10px] font-black uppercase text-slate-400">Año Escolar</p>
                       <p className="text-lg font-black text-vinotinto">2026 - 2027</p>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400">PLANILLA DE INSCRIPCIÓN NRO: 0026-{Math.floor(Math.random() * 10000)}</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-10">
                  {/* Sección Estudiante */}
                  <div className="space-y-6">
                    <h2 className="text-sm font-black uppercase bg-slate-100 p-3 rounded-lg border-l-4 border-vinotinto">Datos del Estudiante</h2>
                    <div className="grid grid-cols-2 gap-8 px-4">
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Nombre Completo</p>
                          <p className="text-sm font-bold border-b border-slate-100 pb-2">{formData.estudianteNombre}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Cédula de Identidad</p>
                          <p className="text-sm font-bold border-b border-slate-100 pb-2">{formData.estudianteCedula}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Grado a Cursar</p>
                          <p className="text-sm font-bold border-b border-slate-100 pb-2">{formData.estudianteGrado}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Fecha de Nacimiento</p>
                          <p className="text-sm font-bold border-b border-slate-100 pb-2">{formData.estudianteFechaNac}</p>
                       </div>
                    </div>
                  </div>

                  {/* Sección Representante */}
                  <div className="space-y-6">
                    <h2 className="text-sm font-black uppercase bg-slate-100 p-3 rounded-lg border-l-4 border-vinotinto">Datos del Representante</h2>
                    <div className="grid grid-cols-2 gap-8 px-4">
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Nombre del Representante</p>
                          <p className="text-sm font-bold border-b border-slate-100 pb-2">{formData.representanteNombre}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Cédula de Identidad</p>
                          <p className="text-sm font-bold border-b border-slate-100 pb-2">{formData.representanteCedula}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Teléfono de Contacto</p>
                          <p className="text-sm font-bold border-b border-slate-100 pb-2">{formData.representanteTelefono}</p>
                       </div>
                       <div>
                          <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Correo Electrónico</p>
                          <p className="text-sm font-bold border-b border-slate-100 pb-2">{formData.representanteEmail}</p>
                       </div>
                    </div>
                  </div>

                  {/* Sección Administrativa */}
                  <div className="mt-10 p-10 bg-slate-50 rounded-[2rem] border border-slate-200 relative">
                     <div className="absolute top-6 right-6 w-32 h-32 border-4 border-vinotinto/10 rounded-full flex items-center justify-center rotate-12">
                        <p className="text-[10px] font-black text-vinotinto/20 uppercase text-center">Validación<br/>En Proceso</p>
                     </div>
                     <h2 className="text-sm font-black uppercase mb-6">Detalles de la Operación</h2>
                     <div className="grid grid-cols-3 gap-8">
                        <div>
                           <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Referencia Bancaria</p>
                           <p className="text-sm font-bold">{formData.pagoReferencia}</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Estatus</p>
                           <p className="text-sm font-bold text-vinotinto uppercase tracking-widest">Pre-inscrito</p>
                        </div>
                        <div>
                           <p className="text-[9px] font-black uppercase text-slate-400 mb-1">Fecha de Registro</p>
                           <p className="text-sm font-bold">{new Date().toLocaleDateString()}</p>
                        </div>
                     </div>
                  </div>

                  <div className="mt-20 flex justify-between items-end">
                     <div className="w-64 border-t-2 border-slate-900 pt-4 text-center">
                        <p className="text-[10px] font-black uppercase">Firma del Representante</p>
                     </div>
                     <div className="w-64 border-t-2 border-slate-900 pt-4 text-center">
                        <p className="text-[10px] font-black uppercase">Sello de la Institución</p>
                     </div>
                  </div>
               </div>

               <div className="mt-16 text-center text-slate-300 text-[8px] font-bold uppercase tracking-[0.3em]">
                  Documento generado electrónicamente — Sistema de Control de Estudios UEPFEBD
               </div>
            </div>
          </div>
        </Motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fafafa] pt-32 pb-20 px-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-vinotinto/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gold/5 blur-[100px] rounded-full -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <Motion.img 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            src={escudoLogo} 
            alt="Logo" 
            className="h-24 mx-auto mb-8 drop-shadow-xl" 
          />
          <h1 className="text-5xl md:text-6xl font-display font-black text-slate-900 tracking-tighter italic leading-none mb-4">
            Inscripción <span className="text-vinotinto underline decoration-gold/30 underline-offset-8">2026-2027</span>
          </h1>
          <p className="text-slate-500 font-medium text-lg">Sistema de Registro de Nuevos Ingresos y Reingresos</p>
        </div>

        {renderStepIndicator()}

        {/* Form Container */}
        <div className="bg-white/80 backdrop-blur-2xl border border-white rounded-[3rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] overflow-hidden">
          <form onSubmit={handleSubmit} className="p-10 md:p-16">
            <AnimatePresence mode="wait">
              {/* STEP 1: DATOS DEL ESTUDIANTE */}
              {step === 1 && (
                <Motion.div 
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-vinotinto-50 rounded-2xl flex items-center justify-center">
                       <User className="text-vinotinto" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-800 tracking-tight uppercase">Datos del Alumno</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                      <input 
                        type="text" 
                        name="estudianteNombre"
                        value={formData.estudianteNombre}
                        onChange={updateData}
                        required
                        placeholder="Ej: Carlos Eduardo Pérez"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto/30 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cédula de Identidad</label>
                      <input 
                        type="text" 
                        name="estudianteCedula"
                        value={formData.estudianteCedula}
                        onChange={updateData}
                        required
                        placeholder="Ej: V-30.123.456"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto/30 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Grado a Cursar</label>
                      <select 
                        name="estudianteGrado"
                        value={formData.estudianteGrado}
                        onChange={updateData}
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto/30 outline-none transition-all shadow-inner appearance-none"
                      >
                        <option value="">Seleccione...</option>
                        <option value="1er-anio">1er Año</option>
                        <option value="2do-anio">2do Año</option>
                        <option value="3er-anio">3er Año</option>
                        <option value="4to-anio">4to Año</option>
                        <option value="5to-anio">5to Año</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fecha de Nacimiento</label>
                      <input 
                        type="date" 
                        name="estudianteFechaNac"
                        value={formData.estudianteFechaNac}
                        onChange={updateData}
                        required
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto/30 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="pt-10 flex justify-end">
                    <button 
                      type="button"
                      onClick={nextStep}
                      className="px-12 py-5 bg-vinotinto text-white rounded-2xl font-display font-black uppercase tracking-widest text-xs shadow-xl hover:bg-vinotinto-dark flex items-center gap-3 group"
                    >
                      Siguiente <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </Motion.div>
              )}

              {/* STEP 2: DATOS DEL REPRESENTANTE */}
              {step === 2 && (
                <Motion.div 
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-vinotinto-50 rounded-2xl flex items-center justify-center">
                       <Users className="text-vinotinto" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-800 tracking-tight uppercase">Datos del Representante</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                      <input 
                        type="text" 
                        name="representanteNombre"
                        value={formData.representanteNombre}
                        onChange={updateData}
                        required
                        placeholder="Ej: María Rodríguez"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto/30 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cédula de Identidad</label>
                      <input 
                        type="text" 
                        name="representanteCedula"
                        value={formData.representanteCedula}
                        onChange={updateData}
                        required
                        placeholder="Ej: V-12.345.678"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto/30 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                      <input 
                        type="tel" 
                        name="representanteTelefono"
                        value={formData.representanteTelefono}
                        onChange={updateData}
                        required
                        placeholder="Ej: 0412-5551234"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto/30 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        type="email" 
                        name="representanteEmail"
                        value={formData.representanteEmail}
                        onChange={updateData}
                        required
                        placeholder="maria@ejemplo.com"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto/30 outline-none transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  <div className="pt-10 flex justify-between">
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-display font-black uppercase tracking-widest text-xs hover:bg-slate-200 flex items-center gap-3"
                    >
                      <ArrowLeft size={18} /> Atrás
                    </button>
                    <button 
                      type="button"
                      onClick={nextStep}
                      className="px-12 py-5 bg-vinotinto text-white rounded-2xl font-display font-black uppercase tracking-widest text-xs shadow-xl hover:bg-vinotinto-dark flex items-center gap-3 group"
                    >
                      Siguiente <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </Motion.div>
              )}

              {/* STEP 3: RECAUDOS Y CONSTANCIA DE CUPO */}
              {step === 3 && (
                <Motion.div 
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-vinotinto-50 rounded-2xl flex items-center justify-center">
                       <FileText className="text-vinotinto" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-800 tracking-tight uppercase">Carga de Recaudos</h3>
                  </div>

                  <div className="p-8 bg-vinotinto-50 rounded-3xl border border-vinotinto-100 flex gap-5 mb-8">
                    <ShieldCheck className="w-6 h-6 text-vinotinto shrink-0" />
                    <p className="text-sm text-vinotinto-800 font-medium leading-relaxed">
                      La <strong>Constancia de Cupos</strong> es un requisito indispensable. Si ya la posee de forma digital, adjúntela a continuación para proceder.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-10">
                    {/* Columna 1: Carga de Archivos Críticos */}
                    <div className="space-y-8">
                       <div className="p-6 bg-vinotinto-50 rounded-3xl border border-vinotinto-100 flex gap-4">
                          <ShieldCheck className="w-5 h-5 text-vinotinto shrink-0" />
                          <p className="text-[11px] text-vinotinto-800 font-bold leading-relaxed">
                            Cargue los documentos fundamentales para iniciar el expediente digital.
                          </p>
                       </div>

                       {/* Constancia de Cupo */}
                       <div className="space-y-4">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                             Constancia de Cupos <span className="text-vinotinto-600 text-[8px] font-black tracking-widest bg-vinotinto-100 px-2 py-0.5 rounded-full ml-2">OBLIGATORIO</span>
                          </p>
                          <div className="relative">
                            <input 
                              type="file" 
                              id="cupo" 
                              className="hidden" 
                              onChange={(e) => setCupoFile(e.target.files ? e.target.files[0] : null)}
                            />
                            <label 
                              htmlFor="cupo" 
                              className={`w-full h-32 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all group ${
                                cupoFile ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200 hover:border-vinotinto-300 hover:bg-vinotinto-50'
                              }`}
                            >
                               {cupoFile ? (
                                 <span className="text-[10px] font-black text-emerald-700">{cupoFile.name}</span>
                               ) : (
                                 <Upload className="w-6 h-6 text-slate-300 group-hover:text-vinotinto transition-all" />
                               )}
                            </label>
                          </div>
                       </div>

                       {/* Partida de Nacimiento */}
                       <div className="space-y-4">
                          <p className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                             Partida de Nacimiento <span className="text-vinotinto-600 text-[8px] font-black tracking-widest bg-vinotinto-100 px-2 py-0.5 rounded-full ml-2">OBLIGATORIO</span>
                          </p>
                          <div className="relative">
                            <input 
                              type="file" 
                              id="partida" 
                              className="hidden" 
                              onChange={(e) => setPartidaFile(e.target.files ? e.target.files[0] : null)}
                            />
                            <label 
                              htmlFor="partida" 
                              className={`w-full h-32 border-2 border-dashed rounded-[2rem] flex flex-col items-center justify-center cursor-pointer transition-all group ${
                                partidaFile ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200 hover:border-vinotinto-300 hover:bg-vinotinto-50'
                              }`}
                            >
                               {partidaFile ? (
                                 <span className="text-[10px] font-black text-emerald-700">{partidaFile.name}</span>
                               ) : (
                                 <Upload className="w-6 h-6 text-slate-300 group-hover:text-vinotinto transition-all" />
                               )}
                            </label>
                          </div>
                       </div>
                    </div>

                    {/* Columna 2: Checklist de Requisitos Físicos */}
                    <div className="bg-slate-50/50 rounded-[2.5rem] p-8 border border-slate-100">
                       <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                          <FileText size={16} className="text-vinotinto" /> Expediente Físico (Checklist)
                       </h4>
                       <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                          {[
                            "Cédula del Estudiante (Copia ampliada)",
                            "2 a 4 Fotos tipo carnet del Alumno",
                            "Certificado de Promoción (Inicial/6to)",
                            "Notas Certificadas (Originales)",
                            "Constancia de Retiro del SIGE",
                            "Cédula del Representante (Copia)",
                            "RIF Vigente del Representante",
                            "Carta de Trabajo o Constancia de Ingresos",
                            "Certificado de Salud / Evaluación CV",
                            "Tarjeta de Vacunación",
                            "Carta de Buena Conducta",
                            "Constancia de Solvencia (Colegio anterior)"
                          ].map((item, idx) => (
                            <label key={idx} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 cursor-pointer hover:bg-slate-50 transition-all group">
                               <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-vinotinto focus:ring-vinotinto" />
                               <span className="text-[10px] font-bold text-slate-600 group-hover:text-slate-900">{item}</span>
                            </label>
                          ))}
                       </div>
                    </div>
                  </div>

                  <div className="pt-10 flex justify-between">
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-display font-black uppercase tracking-widest text-xs hover:bg-slate-200 flex items-center gap-3"
                    >
                      <ArrowLeft size={18} /> Atrás
                    </button>
                    <button 
                      type="button"
                      onClick={nextStep}
                      disabled={!cupoFile || !partidaFile}
                      className="px-12 py-5 bg-vinotinto text-white rounded-2xl font-display font-black uppercase tracking-widest text-xs shadow-xl hover:bg-vinotinto-dark flex items-center gap-3 group disabled:opacity-30 disabled:grayscale transition-all"
                    >
                      Siguiente <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  </div>
                </Motion.div>
              )}

              {/* STEP 4: PAGO */}
              {step === 4 && (
                <Motion.div 
                  key="step4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="flex items-center gap-4 mb-10">
                    <div className="w-12 h-12 bg-vinotinto-50 rounded-2xl flex items-center justify-center">
                       <CreditCard className="text-vinotinto" />
                    </div>
                    <h3 className="text-2xl font-display font-black text-slate-800 tracking-tight uppercase">Reporte de Pago</h3>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                     <div className="bg-vinotinto-900 rounded-3xl p-8 text-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                        <Smartphone className="w-10 h-10 text-gold mb-6" />
                        <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-4">Datos de Pago Móvil</p>
                        <div className="space-y-3">
                           <p className="text-sm font-bold">Banco Mercantil (0105)</p>
                           <p className="text-sm font-bold">0412-5551234</p>
                           <p className="text-sm font-bold">V-12345678</p>
                        </div>
                     </div>
                     <div className="bg-slate-50 rounded-3xl p-8 flex flex-col justify-center text-center border border-slate-100">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Arancel Único</p>
                        <p className="text-5xl font-black text-slate-900 italic tracking-tighter">$120.00</p>
                        <p className="text-[10px] font-bold text-vinotinto-600 mt-2 uppercase tracking-widest italic">A tasa BCV del día</p>
                     </div>
                  </div>

                  <div className="space-y-6 pt-6">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Referencia del Pago</label>
                      <input 
                        type="text" 
                        name="pagoReferencia"
                        value={formData.pagoReferencia}
                        onChange={updateData}
                        required
                        placeholder="Ej: 12345678"
                        className="w-full bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-sm font-bold focus:border-vinotinto/30 outline-none transition-all shadow-inner"
                      />
                    </div>
                    <div className="relative">
                        <input 
                          type="file" 
                          id="comprobante" 
                          className="hidden" 
                          onChange={(e) => setPagoFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <label 
                          htmlFor="comprobante" 
                          className={`w-full h-32 border-2 border-dashed rounded-3xl flex flex-col items-center justify-center cursor-pointer transition-all group ${
                            pagoFile ? 'bg-emerald-50 border-emerald-200' : 'border-slate-200 hover:border-vinotinto-300 hover:bg-slate-50'
                          }`}
                        >
                           {pagoFile ? (
                             <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">{pagoFile.name}</span>
                           ) : (
                             <>
                               <Upload className="w-6 h-6 text-slate-300 mb-2 group-hover:text-vinotinto transition-all" />
                               <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjuntar Captura de Pago</span>
                             </>
                           )}
                        </label>
                    </div>
                  </div>

                  <div className="pt-10 flex justify-between gap-4">
                    <button 
                      type="button"
                      onClick={prevStep}
                      className="px-10 py-5 bg-slate-100 text-slate-500 rounded-2xl font-display font-black uppercase tracking-widest text-xs hover:bg-slate-200 flex items-center gap-3"
                    >
                      <ArrowLeft size={18} /> Atrás
                    </button>
                    <button 
                      type="submit"
                      disabled={!pagoFile || !formData.pagoReferencia || isSubmitting}
                      className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-display font-black uppercase tracking-widest text-sm shadow-xl hover:bg-emerald-700 flex items-center justify-center gap-3 group disabled:opacity-30 disabled:grayscale transition-all relative overflow-hidden"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin" />
                          Procesando {uploadProgress}%
                          <div 
                            className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" 
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </>
                      ) : (
                        <>
                          Finalizar Proceso <ShieldCheck size={20} className="group-hover:scale-110 transition-transform" />
                        </>
                      )}
                    </button>
                  </div>
                </Motion.div>
              )}
            </AnimatePresence>
          </form>
        </div>

        <div className="mt-12 text-center">
           <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">
              © 2026 U.E.P. Francisca Elena Burgos Delmoral — Dabajuro, Falcón
           </p>
        </div>
      </div>
    </div>
  );
};

export default FormularioInscripcion;
