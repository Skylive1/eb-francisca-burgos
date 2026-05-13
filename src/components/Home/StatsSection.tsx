import React from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, X, Target, BookOpen, Users, GraduationCap, Award } from 'lucide-react';

const StatCard = ({ icon: Icon, target, label, suffix = "", delay = 0 }: { icon: any, target: number, label: string, suffix?: string, delay: number }) => {
  const [count, setCount] = React.useState(0);
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  React.useEffect(() => {
    if (!isInView) return;

    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    const increment = target / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(suffix === "%" ? parseFloat(current.toFixed(1)) : Math.floor(current));
      }
    }, interval);

    return () => clearInterval(timer);
  }, [isInView, target, suffix]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay }}
      className="flex flex-col items-center text-center p-8 group"
    >
      <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-[2rem] flex items-center justify-center mb-8 border border-white/10 group-hover:scale-110 group-hover:bg-white/20 transition-all duration-500 shadow-xl shadow-black/10">
        <div className="text-white transform group-hover:rotate-12 transition-transform duration-500">
          <Icon size={36} />
        </div>
      </div>
      <div className="flex flex-col">
        <span className="text-5xl md:text-7xl font-display font-black text-white mb-2 tracking-tighter drop-shadow-2xl">
          {suffix === "%" ? count.toFixed(1) : count}{suffix}
        </span>
        <span className="text-gold font-display font-black uppercase tracking-[0.3em] text-[10px] md:text-xs italic opacity-80 decoration-white/20 underline underline-offset-4">
          {label}
        </span>
      </div>
    </motion.div>
  );
};

const StatsSection = () => (
  <section className="py-32 px-8 bg-vinotinto relative overflow-hidden">
    <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
      <div className="absolute top-10 left-10 text-white"><Sparkles size={40} /></div>
      <div className="absolute bottom-20 right-20 text-white rotate-45"><X size={60} /></div>
      <div className="absolute top-1/2 left-1/4 text-white opacity-40"><Target size={120} /></div>
      <div className="absolute bg-gradient-to-br from-white/20 to-transparent w-96 h-96 rounded-full -top-48 -right-48 blur-3xl"></div>
    </div>
    <div className="max-w-7xl mx-auto relative z-10">
      <div className="text-center mb-24">
        <motion.span
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          className="text-white/60 font-display font-black uppercase tracking-[0.5em] text-sm mb-4 block"
        >
          Creciendo con Excelencia
        </motion.span>
        <h3 className="text-4xl md:text-6xl font-display font-black text-white leading-none tracking-tighter italic">
          Estadísticas <span className="text-gold">Institucionales</span>
        </h3>
        <p className="text-white/40 mt-6 text-lg font-medium max-w-2xl mx-auto">Nuestro compromiso se refleja en cada estudiante que confía en nuestra visión educativa.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
        <StatCard icon={BookOpen} target={34} label="Educación Inicial" delay={0.1} />
        <StatCard icon={Users} target={158} label="Primaria Básica" delay={0.2} />
        <StatCard icon={GraduationCap} target={243} label="Media General" delay={0.3} />
        <StatCard icon={Award} target={99.7} label="Éxito Académico" suffix="%" delay={0.4} />
      </div>
    </div>
  </section>
);

export default StatsSection;
