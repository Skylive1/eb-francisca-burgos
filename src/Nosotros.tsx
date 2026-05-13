import React from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, 
  Target, 
  Award, 
  Users, 
  Clock, 
  Globe, 
  BookOpen,
  Sparkles,
  ChevronRight,
  ArrowRight
} from 'lucide-react';
import franciscaImg from './imagenes/francisca_delmoral.png';

const Nosotros = () => {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center overflow-hidden bg-vinotinto-dark pt-[16vh] pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-vinotinto-dark via-vinotinto to-vinotinto-dark opacity-95"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(184,134,11,0.12),transparent_60%)]"></div>
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gold/5 blur-[150px] rounded-full"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md text-gold border border-white/10 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl"
            >
              Nuestra Identidad
            </motion.span>

            <h2 className="text-5xl lg:text-8xl font-display font-black mb-6 leading-[0.95] tracking-tighter text-white drop-shadow-2xl italic">
              Nuestra <span className="text-gold italic">Institución</span>
            </h2>

            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Conozca la historia, los valores y el proyecto educativo que nos define como referentes de excelencia en la región.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Historia Section */}
      <section className="py-32 px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <span className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block">Legado y Tradición</span>
              <h3 className="text-5xl md:text-6xl font-display font-black text-slate-900 leading-none tracking-tighter italic mb-8">
                Nuestra <span className="text-vinotinto underline decoration-gold/30 underline-offset-8">Historia</span>
              </h3>
              <div className="space-y-6 text-slate-600 font-medium leading-relaxed">
                <p>
                  La U.E.P. Francisca Elena Burgos Delmoral nació de un sueño profundo: brindar una educación de calidad superior que integrara los valores humanos con la excelencia académica en el Municipio Dabajuro.
                </p>
                <p>
                  Desde nuestra fundación, nos hemos dedicado a formar líderes íntegros, capaces de transformar su entorno a través del conocimiento y la ética. Lo que comenzó como un pequeño proyecto educativo se ha convertido hoy en una institución de referencia regional.
                </p>
                <p>
                  Nuestra fundadora, cuyo nombre honra nuestra institución, visionó un espacio donde cada niño y joven pudiera descubrir su máximo potencial en un ambiente seguro, innovador y profundamente humano.
                </p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-vinotinto/5 blur-3xl rounded-[3rem]"></div>
              <div className="relative bg-slate-50 border border-slate-100 p-4 rounded-[3rem] shadow-2xl">
                <img 
                  src={franciscaImg} 
                  alt="Francisca de Delmoral - Propietaria" 
                  className="w-full h-auto rounded-[2.5rem] transition-all duration-700"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Filosofía / Misión / Visión */}
      <section className="py-32 px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                Icon: Shield,
                iconColor: "text-gold",
                title: "Misión",
                desc: "Formar integralmente a niños, niñas y adolescentes, basándonos en principios éticos, pedagógicos e innovadores, para desarrollar ciudadanos comprometidos con el progreso de la nación."
              },
              {
                Icon: Target,
                iconColor: "text-vinotinto",
                title: "Visión",
                desc: "Ser la institución educativa líder y de vanguardia en la región, reconocida por su excelencia académica, formación en valores y la integración tecnológica en sus procesos de aprendizaje."
              },
              {
                Icon: Award,
                iconColor: "text-gold",
                title: "Valores",
                desc: "Nuestros pilares son la Disciplina, la Responsabilidad, el Respeto, la Honestidad y la Solidaridad, cimientos sobre los cuales construimos el carácter de nuestros estudiantes."
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.05)] group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
              >
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500">
                  <item.Icon size={32} className={item.iconColor} />
                </div>
                <h4 className="text-2xl font-display font-black text-slate-900 tracking-tighter mb-4 uppercase italic">{item.title}</h4>
                <p className="text-slate-500 font-medium leading-relaxed italic">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* PEIC Section */}
      <section className="py-32 px-8 bg-vinotinto-dark relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,rgba(184,134,11,0.05),transparent_60%)]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-2 lg:order-1"
            >
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-10 rounded-[3rem] shadow-2xl">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-1 bg-gold rounded-full"></div>
                  <span className="text-gold font-black text-xs uppercase tracking-[0.4em]">Proyecto Educativo</span>
                </div>
                <h3 className="text-4xl md:text-5xl font-display font-black text-white leading-tight tracking-tighter italic mb-8">
                  ¿Qué es el <span className="text-gold">PEIC</span>?
                </h3>
                <p className="text-white/60 font-medium leading-relaxed mb-10">
                  El Proyecto Educativo Integral Comunitario (PEIC) es nuestro instrumento de gestión que define las estrategias para el mejoramiento de la calidad educativa, integrando a la escuela con su comunidad.
                </p>
                <div className="space-y-4">
                  {[
                    "Participación activa de la tríada: Escuela, Familia y Comunidad.",
                    "Fomento de la identidad local y nacional.",
                    "Integración de proyectos socio-productivos.",
                    "Desarrollo de competencias para la vida."
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/80 font-medium">
                      <Sparkles size={16} className="text-gold shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 lg:order-2"
            >
              <span className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block">Innovación y Comunidad</span>
              <h3 className="text-5xl md:text-6xl font-display font-black text-white leading-none tracking-tighter italic mb-8">
                Proyecto <span className="text-gold">Institucional</span>
              </h3>
              <p className="text-white/40 text-lg font-medium leading-relaxed mb-8">
                Nuestro PEIC se enfoca en el fortalecimiento de la lectura y escritura como herramientas fundamentales para el pensamiento crítico, articulado con el desarrollo sustentable del Municipio Dabajuro.
              </p>
              <button className="flex items-center gap-4 text-gold font-black uppercase tracking-[0.2em] text-sm group">
                Descargar Documento PEIC <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Galería / Campus Preview */}
      <section className="py-32 px-8 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <span className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block">Espacios de Crecimiento</span>
            <h3 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-none tracking-tighter italic">
              Nuestro <span className="text-vinotinto underline decoration-gold/30 underline-offset-8">Campus</span>
            </h3>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:h-[600px]">
            <div className="col-span-2 row-span-2 relative group overflow-hidden rounded-[2.5rem]">
              <div className="absolute inset-0 bg-vinotinto/20 group-hover:bg-transparent transition-all duration-700 z-10"></div>
              <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-300">
                <Globe size={80} />
              </div>
              <div className="absolute bottom-10 left-10 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-white font-display font-black text-2xl tracking-tighter italic">Áreas Deportivas</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-[2.5rem]">
               <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                <BookOpen size={40} />
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-[2.5rem]">
               <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                <Users size={40} />
              </div>
            </div>
            <div className="col-span-2 relative group overflow-hidden rounded-[2.5rem]">
               <div className="w-full h-full bg-slate-50 flex items-center justify-center text-slate-200">
                <Globe size={40} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 px-8 bg-slate-50 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-4xl md:text-6xl font-display font-black text-slate-900 leading-tight tracking-tighter italic">
              Sea parte de nuestra <span className="text-vinotinto">familia</span>
            </h3>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Descubra por qué somos la elección preferida de las familias que buscan lo mejor para sus hijos.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <a href="/admisiones" className="bg-gold text-vinotinto-dark px-10 py-5 font-display font-black rounded-xl transition-all shadow-2xl hover:scale-105 uppercase tracking-widest text-sm flex items-center gap-3">
                Admisiones 2026 <ArrowRight size={18} />
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Nosotros;
