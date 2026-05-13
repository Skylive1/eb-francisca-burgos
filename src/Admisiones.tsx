import React from 'react';
import { motion, useInView } from 'framer-motion';
import emailjs from '@emailjs/browser';
import {
  FileText, ClipboardCheck, UserCheck, CreditCard,
  ArrowRight, CheckCircle2, ChevronRight, Calendar,
  Phone, Mail, MapPin, Upload, Clock, Shield,
  GraduationCap, Users, BookOpen, Sparkles, Heart, Globe
} from 'lucide-react';
import escudoLogo from './escudo.png';



interface TimelineStepProps {
  step: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  details: string[];
  isLast?: boolean;
  delay: number;
}

const TimelineStep = ({ step, icon, title, description, details, isLast = false, delay }: TimelineStepProps) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -40 }}
      animate={isInView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="relative flex gap-8 group"
    >
      {/* Line & Circle */}
      <div className="flex flex-col items-center shrink-0">
        <div className="w-16 h-16 bg-gradient-to-br from-vinotinto to-vinotinto-dark rounded-2xl flex items-center justify-center shadow-xl shadow-vinotinto/20 group-hover:scale-110 transition-transform duration-500 relative z-10">
          <div className="text-gold">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 28 })}
          </div>
        </div>
        {!isLast && (
          <div className="w-0.5 flex-1 bg-gradient-to-b from-vinotinto/30 to-transparent mt-4 min-h-[60px]"></div>
        )}
      </div>

      {/* Content */}
      <div className="pb-16 flex-1">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[10px] font-black text-gold uppercase tracking-[0.4em] bg-gold/10 px-3 py-1 rounded-full">
            Paso {step}
          </span>
        </div>
        <h4 className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tighter mb-3">
          {title}
        </h4>
        <p className="text-slate-500 text-base font-medium leading-relaxed mb-6 max-w-lg">
          {description}
        </p>
        <div className="space-y-3">
          {details.map((detail, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-slate-600 font-medium">
              <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
              <span>{detail}</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// --- Requirement Card ---

interface RequirementCardProps {
  icon: React.ReactNode;
  title: string;
  items: string[];
  accent: string;
  delay: number;
}

const RequirementCard = ({ icon, title, items, accent, delay }: RequirementCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, delay }}
    className="relative group h-full"
  >
    <div className={`absolute inset-0 ${accent} rounded-[2.5rem] transform group-hover:scale-105 transition-transform duration-500 -z-10 blur-xl opacity-0 group-hover:opacity-100`}></div>
    <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-8 md:p-10 rounded-[2.5rem] h-full shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] hover:shadow-xl transition-all duration-500">
      <div className="flex items-center gap-5 mb-8">
        <div className="w-14 h-14 bg-gradient-to-br from-vinotinto to-vinotinto-dark rounded-xl flex items-center justify-center shadow-lg">
          <div className="text-gold">
            {React.cloneElement(icon as React.ReactElement<any>, { size: 24 })}
          </div>
        </div>
        <h4 className="text-xl font-display font-black text-slate-800 tracking-tighter uppercase">{title}</h4>
      </div>
      <ul className="space-y-4">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-3 group/item">
            <div className="w-6 h-6 bg-gold/10 rounded-lg flex items-center justify-center shrink-0 mt-0.5 group-hover/item:bg-gold/20 transition-colors">
              <ChevronRight size={12} className="text-gold" />
            </div>
            <span className="text-sm text-slate-600 font-medium leading-relaxed">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);


// --- Admisiones Page Component ---

const Admisiones = () => {
  const [formData, setFormData] = React.useState({
    parentName: '',
    email: '',
    phone: '',
    studentName: '',
    grade: '',
    message: ''
  });
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const serviceId = 'service_mer5y18';
      const templateId = 'template_q76xiya';
      const publicKey = '8hwM5ErrYtzPhV_Wa';

      await emailjs.send(
        serviceId, 
        templateId, 
        {
          parentName: formData.parentName,
          email: formData.email,
          phone: formData.phone,
          studentName: formData.studentName,
          grade: formData.grade,
          message: formData.message || 'Sin mensaje',
        }, 
        publicKey
      );

      setIsSubmitted(true);
      setFormData({ parentName: '', email: '', phone: '', studentName: '', grade: '', message: '' });
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error: any) {
      console.error('Error al enviar admisión:', error);
      setSubmitError(`Error técnico: ${error?.text || error?.message || 'Revisa la consola'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ===== Hero Section ===== */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-vinotinto-dark pt-[16vh] pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-vinotinto-dark via-vinotinto to-vinotinto-dark opacity-95"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(184,134,11,0.15),transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(184,134,11,0.08),transparent_50%)]"></div>
          {/* Geometric decorations */}
          <div className="absolute top-20 right-10 w-64 h-64 border border-gold/10 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-40 h-40 border border-white/5 rounded-full"></div>
          <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-gold/5 blur-[150px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md text-gold border border-white/10 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl"
              >
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_10px_#b8860b]"></span>
                Período Escolar 2026 – 2027
              </motion.span>

              <h2 className="text-5xl lg:text-7xl font-display font-black mb-6 leading-[0.95] tracking-tighter text-white drop-shadow-2xl">
                Proceso de <br />
                <span className="text-gold italic">Admisión</span>
              </h2>

              <p className="text-xl text-white/60 mb-10 max-w-xl font-medium leading-relaxed">
                Inicia el camino hacia una educación de excelencia. Te guiamos paso a paso en el proceso de ingreso para nuevos estudiantes.
              </p>

              <div className="flex flex-wrap gap-4">
                <motion.a
                  href="#proceso"
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(184, 134, 11, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-gold to-[#966b07] text-vinotinto-dark px-10 py-5 font-display font-black rounded-xl transition-all shadow-2xl flex items-center gap-4 group relative overflow-hidden"
                >
                  <span className="relative z-10 uppercase tracking-[0.2em] text-sm">Iniciar Proceso</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </motion.a>
                <motion.a
                  href="/inscripcion"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-white/10 backdrop-blur-md text-white border border-white/20 px-10 py-5 font-display font-black rounded-xl transition-all hover:bg-white/20 flex items-center gap-4 uppercase tracking-[0.2em] text-sm"
                >
                  <ClipboardCheck size={20} className="text-gold" /> Inscripción en Línea
                </motion.a>
              </div>
            </motion.div>

            {/* Decorative illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="hidden lg:flex justify-center items-center relative"
            >
              <div className="absolute inset-0 bg-gold/5 blur-[100px] rounded-full scale-150"></div>
              <div className="relative">
                <div className="w-72 h-72 bg-white/5 backdrop-blur-sm border border-white/10 rounded-[3rem] flex items-center justify-center rotate-6 shadow-2xl">
                  <img src={escudoLogo} alt="Escudo" className="w-48 h-48 object-contain drop-shadow-[0_0_40px_rgba(184,134,11,0.3)] -rotate-6" />
                </div>
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [-5, 5, -5] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -top-8 -right-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl"
                >
                  <GraduationCap size={20} className="text-gold" />
                  <span className="text-white font-bold text-xs">Cupos Disponibles</span>
                </motion.div>
                <motion.div
                  animate={{ y: [5, -5, 5] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -bottom-6 -left-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 flex items-center gap-3 shadow-xl"
                >
                  <Shield size={20} className="text-gold" />
                  <span className="text-white font-bold text-xs">Educación Premium</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== AVISO IMPORTANTE: CONSTANCIA DE CUPOS ===== */}
      <section className="relative z-20 -mt-12 mb-12 px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto bg-white rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden"
        >
          <div className="flex flex-col md:flex-row items-stretch">
            <div className="md:w-1/3 bg-gradient-to-br from-vinotinto to-vinotinto-dark p-10 flex flex-col items-center justify-center text-center text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full blur-2xl"></div>
              <Sparkles className="w-16 h-16 text-gold mb-6 animate-pulse" />
              <h3 className="text-xl font-black uppercase tracking-[0.2em] italic font-display">Paso Vital</h3>
              <p className="text-white/40 text-[9px] font-bold uppercase tracking-[0.3em] mt-2">Requisito Nro. 1</p>
            </div>
            <div className="flex-1 p-10 md:p-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-1 bg-gold rounded-full"></div>
                <span className="text-gold font-black text-[11px] uppercase tracking-[0.4em]">Aviso de Admisión</span>
              </div>
              <h4 className="text-3xl md:text-4xl font-display font-black text-slate-900 tracking-tighter italic mb-4">
                Constancia de <span className="text-vinotinto">Cupos</span>
              </h4>
              <p className="text-slate-600 text-lg font-medium leading-relaxed mb-8">
                Para iniciar cualquier proceso de inscripción o admisión, el representante debe consignar la <span className="text-vinotinto font-black uppercase italic tracking-tight">Constancia de Cupos</span>. Este documento puede solicitarse de manera <span className="text-gold font-bold">DIGITAL</span> a través de nuestros canales oficiales o retirarse de forma presencial en la dirección del plantel.
              </p>
              <div className="flex flex-wrap gap-6 items-center">
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <Globe className="w-4 h-4 text-gold" />
                   Trámite Digital o Presencial
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   <FileText className="w-4 h-4 text-gold" />
                   Documento Válido
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ===== Key Differences Banner ===== */}
      <section className="py-16 px-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-vinotinto to-vinotinto-dark p-8 md:p-10 rounded-[2rem] text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-gold/10 blur-[80px] rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <Users size={24} className="text-gold" />
                  <span className="text-gold font-black text-[10px] uppercase tracking-[0.3em]">Alumnos Nuevos</span>
                </div>
                <h4 className="text-2xl font-display font-black tracking-tighter mb-3">Admisión</h4>
                <p className="text-white/60 text-sm font-medium leading-relaxed">
                  Proceso destinado a estudiantes que provienen de otras instituciones educativas y desean ingresar por primera vez a nuestra comunidad escolar.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="bg-slate-50 p-8 md:p-10 rounded-[2rem] relative overflow-hidden group border border-slate-100"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-vinotinto/5 blur-[80px] rounded-full"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <BookOpen size={24} className="text-vinotinto" />
                  <span className="text-vinotinto font-black text-[10px] uppercase tracking-[0.3em]">Alumnos Activos</span>
                </div>
                <h4 className="text-2xl font-display font-black tracking-tighter text-slate-900 mb-3">Inscripción / Reinscripción</h4>
                <p className="text-slate-500 text-sm font-medium leading-relaxed">
                  Proceso para los alumnos que ya forman parte de la institución y van a pasar al siguiente grado, o para aquellos que ya fueron aceptados tras su proceso de admisión.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Process Timeline ===== */}
      <section id="proceso" className="py-32 px-8 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-vinotinto/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gold/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-4xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block"
            >
              Embudo de Captación
            </motion.span>
            <h3 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-none tracking-tighter italic">
              Proceso de <span className="text-vinotinto underline decoration-gold/30 underline-offset-8">Ingreso</span>
            </h3>
            <p className="text-slate-500 mt-6 text-lg font-medium max-w-2xl mx-auto">
              Conoce cada etapa del proceso de admisión. Te acompañamos desde la solicitud hasta la inscripción formal.
            </p>
            <div className="h-1.5 bg-gold mx-auto mt-8 rounded-full w-[100px]"></div>
          </div>

          <div className="relative">
            <TimelineStep
              step={1}
              icon={<FileText />}
              title="Postulación"
              description="El padre o representante llena el formulario de solicitud de información con los datos del estudiante."
              details={[
                "Complete el formulario en línea con datos del estudiante",
                "Indique el grado al que desea ingresar",
                "Nuestro equipo se pondrá en contacto para coordinar la siguiente etapa"
              ]}
              delay={0.1}
            />
            <TimelineStep
              step={2}
              icon={<Calendar />}
              title="Entrevista y Evaluación"
              description="Se asigna una fecha para conocer al estudiante y a su familia. Incluye entrevista con la dirección y/o psicólogo."
              details={[
                "Agende una cita para visitar nuestras instalaciones",
                "Entrevista con el director y equipo psicopedagógico",
                "Evaluación diagnóstica del estudiante"
              ]}
              delay={0.2}
            />
            <TimelineStep
              step={3}
              icon={<UserCheck />}
              title="Aceptación"
              description="El colegio confirma la disponibilidad de cupo y comunica la decisión de admisión a la familia."
              details={[
                "Revisión del expediente y resultados de evaluación",
                "Confirmación de cupo disponible para el grado solicitado",
                "Notificación formal de aceptación al representante"
              ]}
              delay={0.3}
            />
            <TimelineStep
              step={4}
              icon={<CreditCard />}
              title="Inscripción Formal"
              description="Proceso administrativo de pago de matrícula y consignación de documentos para formalizar el ingreso."
              details={[
                "Pago de matrícula y aranceles correspondientes",
                "Entrega de documentos físicos requeridos",
                "Recepción de kit de información institucional"
              ]}
              isLast
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* ===== Requirements Section ===== */}
      <section id="requisitos" className="py-32 px-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_70%_20%,#7a002605,transparent)]"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block"
            >
              Documentación
            </motion.span>
            <h3 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-none tracking-tighter italic">
              Requisitos de <span className="text-vinotinto">Admisión</span>
            </h3>
            <p className="text-slate-500 mt-6 text-lg font-medium max-w-2xl mx-auto">
              Reúna los siguientes documentos para agilizar el proceso de inscripción de su representado.
            </p>
            <div className="h-1.5 bg-gold mx-auto mt-8 rounded-full w-[100px]"></div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <RequirementCard
              icon={<GraduationCap />}
              title="Del Estudiante"
              accent="bg-gradient-to-br from-vinotinto/5 to-gold/5"
              delay={0.1}
              items={[
                "Partida de Nacimiento: Original y copia legible",
                "Cédula de Identidad: Copia ampliada (mayor de 9 años)",
                "Fotos: 2 a 4 fotos tipo carnet, fondo blanco",
                "Certificado de Promoción: De Educación Inicial o 6to grado",
                "Notas Certificadas: Originales del plantel anterior (bachillerato)",
                "Boleta de Calificaciones: Del año inmediatamente anterior",
                "Constancia de Retiro del SIGE: Indispensable para nuevos ingresos"
              ]}
            />
            <RequirementCard
              icon={<Users />}
              title="Del Representante"
              accent="bg-gradient-to-br from-gold/5 to-vinotinto/5"
              delay={0.2}
              items={[
                "Cédula de Identidad: Copia ampliada",
                "Fotos: 1 a 2 fotos tipo carnet",
                "RIF Vigente: Copia para facturación y datos legales",
                "Carta de Trabajo o Constancia de Ingresos"
              ]}
            />
            <RequirementCard
              icon={<Heart />}
              title="Documentos Adicionales"
              accent="bg-gradient-to-br from-vinotinto/5 to-gold/5"
              delay={0.3}
              items={[
                "Certificado de Salud o Evaluación Cardiovascular vigente",
                "Copia de la Tarjeta de Vacunación (primaria e inicial)",
                "Informe Médico: Solo si existe condición especial o alergia",
                "Carta de Buena Conducta del colegio anterior",
                "Constancia de Solvencia si viene de colegio privado",
                "Planilla de Inscripción completada"
              ]}
            />
          </div>

          {/* Important note */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-16 bg-gradient-to-r from-gold/5 via-gold/10 to-gold/5 border border-gold/20 rounded-2xl p-8 flex items-start gap-5"
          >
            <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center shrink-0 mt-1">
              <Sparkles size={20} className="text-gold" />
            </div>
            <div>
              <h5 className="font-display font-black text-slate-800 text-sm uppercase tracking-wider mb-2">Nota Importante</h5>
              <p className="text-slate-600 text-sm font-medium leading-relaxed">
                Todos los documentos deben ser presentados en original y copia. La institución se reserva el derecho de solicitar documentación adicional según el caso. Para más información sobre los requisitos específicos para cada nivel educativo, comuníquese con nuestra oficina de admisiones.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ===== Contact / Information Request Form ===== */}
      <section id="formulario" className="py-32 px-8 bg-vinotinto-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(184,134,11,0.1),transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(184,134,11,0.06),transparent_50%)]"></div>
          <div className="absolute top-20 left-10 w-64 h-64 border border-white/5 rounded-full"></div>
          <div className="absolute bottom-20 right-20 w-48 h-48 border border-gold/10 rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-start">
            {/* Left Info */}
            <div className="space-y-10">
              <div>
                <motion.span
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block"
                >
                  Contáctanos
                </motion.span>
                <h3 className="text-5xl md:text-6xl font-display font-black text-white leading-tight tracking-tighter italic">
                  Solicita <span className="text-gold">Información</span>
                </h3>
                <p className="text-white/50 mt-6 text-lg font-medium leading-relaxed max-w-lg">
                  Completa el formulario y nuestro equipo de admisiones se pondrá en contacto contigo para coordinar una visita a nuestras instalaciones.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                    <Phone size={22} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Teléfono</p>
                    <p className="text-white font-bold text-lg">+58 (261) 743.05.62</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                    <Mail size={22} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Correo</p>
                    <p className="text-white font-bold text-lg">admisiones@febd.edu.ve</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                    <MapPin size={22} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Dirección</p>
                    <p className="text-white font-bold text-lg">San Francisco, Edo. Zulia</p>
                  </div>
                </div>
                <div className="flex items-center gap-5 group">
                  <div className="w-14 h-14 bg-white/5 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10 group-hover:bg-white/10 transition-all">
                    <Clock size={22} className="text-gold" />
                  </div>
                  <div>
                    <p className="text-white/40 text-[10px] font-black uppercase tracking-widest">Horario de Atención</p>
                    <p className="text-white font-bold text-lg">Lunes a Viernes, 7:00 AM – 4:00 PM</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-gold/10 to-vinotinto/10 blur-3xl rounded-[3rem] opacity-30"></div>
              <div className="relative bg-white/10 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl">
                {isSubmitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-16 space-y-6"
                  >
                    <div className="w-20 h-20 bg-gold/20 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 size={40} className="text-gold" />
                    </div>
                    <h4 className="text-3xl font-display font-black text-white tracking-tighter">¡Solicitud Enviada!</h4>
                    <p className="text-white/50 font-medium max-w-md mx-auto">
                      Hemos recibido sus datos correctamente. Nuestro equipo de admisiones se pondrá en contacto con usted en las próximas 24 horas hábiles.
                    </p>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <h4 className="text-xl font-display font-black text-white uppercase tracking-[0.15em] mb-8">
                      Formulario de Solicitud
                    </h4>

                    {submitError && (
                      <p className="text-sm text-red-200 bg-red-900/30 border border-red-500/30 rounded-2xl p-4 font-medium">
                        {submitError}
                      </p>
                    )}

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Nombre del Representante</label>
                        <input
                          type="text"
                          name="parentName"
                          value={formData.parentName}
                          onChange={handleChange}
                          required
                          placeholder="Ej: María González"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-gold/50 focus:bg-white/10 outline-none transition-all font-medium text-sm focus:ring-2 focus:ring-gold/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Teléfono de Contacto</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          placeholder="Ej: +58 424-1234567"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-gold/50 focus:bg-white/10 outline-none transition-all font-medium text-sm focus:ring-2 focus:ring-gold/10"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Correo Electrónico</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="representante@correo.com"
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-gold/50 focus:bg-white/10 outline-none transition-all font-medium text-sm focus:ring-2 focus:ring-gold/10"
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Nombre del Estudiante</label>
                        <input
                          type="text"
                          name="studentName"
                          value={formData.studentName}
                          onChange={handleChange}
                          required
                          placeholder="Ej: Carlos González"
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-gold/50 focus:bg-white/10 outline-none transition-all font-medium text-sm focus:ring-2 focus:ring-gold/10"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Grado a Ingresar</label>
                        <select
                          name="grade"
                          value={formData.grade}
                          onChange={handleChange}
                          required
                          className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-gold/50 focus:bg-white/10 outline-none transition-all font-medium text-sm focus:ring-2 focus:ring-gold/10 appearance-none cursor-pointer"
                          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='rgba(184,134,11,0.6)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                        >
                          <option value="" className="bg-vinotinto-dark text-white/50">Seleccione un grado</option>
                          <optgroup label="Educación Inicial" className="bg-vinotinto-dark text-white">
                            <option value="maternal" className="bg-vinotinto-dark">Maternal</option>
                            <option value="preescolar" className="bg-vinotinto-dark">Preescolar</option>
                          </optgroup>
                          <optgroup label="Educación Primaria" className="bg-vinotinto-dark text-white">
                            <option value="1er-grado" className="bg-vinotinto-dark">1er Grado</option>
                            <option value="2do-grado" className="bg-vinotinto-dark">2do Grado</option>
                            <option value="3er-grado" className="bg-vinotinto-dark">3er Grado</option>
                            <option value="4to-grado" className="bg-vinotinto-dark">4to Grado</option>
                            <option value="5to-grado" className="bg-vinotinto-dark">5to Grado</option>
                            <option value="6to-grado" className="bg-vinotinto-dark">6to Grado</option>
                          </optgroup>
                          <optgroup label="Media General" className="bg-vinotinto-dark text-white">
                            <option value="1er-anio" className="bg-vinotinto-dark">1er Año</option>
                            <option value="2do-anio" className="bg-vinotinto-dark">2do Año</option>
                            <option value="3er-anio" className="bg-vinotinto-dark">3er Año</option>
                            <option value="4to-anio" className="bg-vinotinto-dark">4to Año</option>
                            <option value="5to-anio" className="bg-vinotinto-dark">5to Año</option>
                          </optgroup>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-white/40 uppercase tracking-widest ml-1">Mensaje Adicional <span className="text-white/20">(Opcional)</span></label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="¿Tiene alguna pregunta o comentario adicional?"
                        className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-white/20 focus:border-gold/50 focus:bg-white/10 outline-none transition-all font-medium text-sm resize-none focus:ring-2 focus:ring-gold/10"
                      ></textarea>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: isSubmitting ? 1 : 1.02, boxShadow: isSubmitting ? 'none' : '0 20px 40px -10px rgba(184, 134, 11, 0.3)' }}
                      whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                      disabled={isSubmitting}
                      className="w-full bg-gradient-to-br from-gold to-[#966b07] text-vinotinto-dark py-5 rounded-xl font-display font-black uppercase tracking-widest text-sm shadow-2xl flex items-center justify-center gap-3 group relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      <span className="relative z-10">{isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}</span>
                      <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </motion.button>

                    <p className="text-white/20 text-[10px] font-bold text-center mt-4 uppercase tracking-wider">
                      Al enviar acepta nuestros términos y política de privacidad
                    </p>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Schedule a Visit CTA ===== */}
      <section className="py-24 px-8 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#7a002605,transparent)]"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm block">Agenda tu Visita</span>
            <h3 className="text-4xl md:text-6xl font-display font-black text-slate-900 leading-tight tracking-tighter italic">
              Ven a <span className="text-vinotinto">conocer</span> nuestras instalaciones
            </h3>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Te invitamos a recorrer nuestra institución y conocer de primera mano nuestros espacios académicos, deportivos y recreativos. Coordina tu visita con nuestro equipo de admisiones.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <motion.a
                href="#formulario"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-vinotinto text-white px-10 py-5 font-display font-black rounded-xl transition-all shadow-xl hover:bg-vinotinto-dark uppercase tracking-widest text-sm flex items-center gap-3"
              >
                <Calendar size={18} /> Agendar Cita
              </motion.a>
              <motion.a
                href="tel:+582617430562"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-slate-100 text-slate-800 px-10 py-5 font-display font-black rounded-xl transition-all hover:bg-slate-200 uppercase tracking-widest text-sm flex items-center gap-3 border border-slate-200"
              >
                <Phone size={18} /> Llamar Ahora
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Admisiones;
