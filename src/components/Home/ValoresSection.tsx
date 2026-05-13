import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Sparkles, Compass, CheckCircle2 } from 'lucide-react';

const ValoresSection = () => {
  const values = [
    { 
      id: 0, 
      Icon: Shield, 
      title: "Integridad", 
      desc: "Actuamos con honestidad, ética y profunda transparencia en cada decisión que tomamos. Convertimos la sinceridad en la brújula principal de nuestra comunidad educativa.",
      color: "from-blue-600 to-indigo-600",
      delay: 0.1
    },
    { 
      id: 1, 
      Icon: Activity, 
      title: "Excelencia", 
      desc: "Buscamos incansablemente superar los más altos estándares vocacionales y académicos. Nos esforzamos por la grandeza tanto en el éxito profesional como en el desarrollo humano.",
      color: "from-vinotinto to-red-700",
      delay: 0.2
    },
    { 
      id: 2, 
      Icon: Sparkles, 
      title: "Innovación", 
      desc: "Abrazamos audazmente las mejores metodologías y tecnologías para fomentar una mente crítica. Adaptamos el aprendizaje para empoderar mentes brillantes preparadas para el futuro.",
      color: "from-gold to-yellow-600",
      delay: 0.3
    },
    { 
      id: 3, 
      Icon: Compass, 
      title: "Liderazgo", 
      desc: "Formamos individuos resilientes con el propósito de guiar con un impacto profundamente positivo. Impulsamos la capacidad de inspirar y generar verdaderos cambios en la sociedad.",
      color: "from-emerald-600 to-teal-600",
      delay: 0.4
    },
  ];

  return (
    <section className="py-24 md:py-32 px-4 md:px-8 bg-slate-50 relative overflow-hidden">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(184,134,11,0.05),transparent_50%)] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(122,0,38,0.05),transparent_50%)] pointer-events-none"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col lg:flex-row items-end justify-between mb-20 gap-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-1 bg-gold rounded-full"></div>
              <span className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm">
                Nuestra Identidad
              </span>
            </div>
            <h3 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-[0.95] tracking-tighter italic">
              Pilares de nuestra <br className="hidden md:block" />
              <span className="text-vinotinto underline decoration-gold/30 underline-offset-8">Institución</span>
            </h3>
          </motion.div>
          
          <motion.div
             initial={{ opacity: 0, x: 30 }}
             whileInView={{ opacity: 1, x: 0 }}
             viewport={{ once: true }}
             className="max-w-md text-slate-500 font-medium text-lg leading-relaxed border-l-2 border-gold/30 pl-6"
          >
            Nuestros valores no son solo palabras; son la base sobre la cual construimos el carácter, la inteligencia y el futuro de cada uno de nuestros estudiantes.
          </motion.div>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((val) => (
            <motion.div
              key={val.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: val.delay, duration: 0.6 }}
              whileHover={{ y: -10 }}
              className="group relative bg-white rounded-[2rem] p-8 md:p-10 border border-slate-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl hover:shadow-vinotinto/10 transition-all duration-500 overflow-hidden flex flex-col"
            >
              {/* Background gradient orb on hover */}
              <div className={`absolute -top-24 -right-24 w-48 h-48 bg-gradient-to-br ${val.color} rounded-full blur-[50px] opacity-0 group-hover:opacity-10 transition-opacity duration-700`}></div>
              
              <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-500 relative z-10 text-vinotinto">
                <val.Icon size={28} strokeWidth={1.5} />
              </div>

              <h4 className="text-2xl font-display font-black text-slate-900 tracking-tighter mb-4 group-hover:text-vinotinto transition-colors duration-300 relative z-10">
                {val.title}
              </h4>
              
              <p className="text-slate-500 font-medium leading-relaxed relative z-10 flex-grow">
                {val.desc}
              </p>

              <div className="mt-8 pt-6 border-t border-slate-100 flex items-center gap-3 text-sm font-bold text-slate-400 group-hover:text-gold transition-colors duration-300 relative z-10">
                <CheckCircle2 size={16} />
                <span className="uppercase tracking-widest text-[10px]">Pilar Fundamental</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValoresSection;
