import React from 'react';
import { motion } from 'framer-motion';
import { Shield, BookOpen, Users, Sparkles, GraduationCap, Heart } from 'lucide-react';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <GraduationCap />,
      title: "Excelencia Académica",
      desc: "Programas diseñados para el éxito universitario y profesional con altos estándares internacionales."
    },
    {
      icon: <Heart />,
      title: "Formación en Valores",
      desc: "Cultivamos la integridad, el respeto y la responsabilidad como base del carácter de nuestros líderes."
    },
    {
      icon: <Sparkles />,
      title: "Innovación Constante",
      desc: "Tecnología de vanguardia y metodologías activas que preparan para los retos del siglo XXI."
    }
  ];

  return (
    <section className="py-32 px-8 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#7a002605,transparent)]"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block"
          >
            Nuestra Diferencia
          </motion.span>
          <h3 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-none tracking-tighter italic">
            ¿Por qué <span className="text-vinotinto">Elegirnos</span>?
          </h3>
          <p className="text-slate-500 mt-6 text-lg font-medium max-w-2xl mx-auto">
            Brindamos una experiencia educativa transformadora que trasciende el aula de clases.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-10">
          {reasons.map((reason, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-white p-10 rounded-[3rem] shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-100 group"
            >
              <div className="w-16 h-16 bg-vinotinto/5 rounded-2xl flex items-center justify-center text-vinotinto mb-8 group-hover:bg-vinotinto group-hover:text-white transition-all duration-500">
                {React.cloneElement(reason.icon as React.ReactElement, { size: 32 })}
              </div>
              <h4 className="text-2xl font-display font-black text-slate-800 tracking-tighter mb-4 uppercase italic">
                {reason.title}
              </h4>
              <p className="text-slate-500 font-medium leading-relaxed">
                {reason.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
