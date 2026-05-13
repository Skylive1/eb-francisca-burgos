import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { OPPORTUNITY_IMAGES } from '../../constants';

const OpportunitySection = () => {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % OPPORTUNITY_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-24 px-8 bg-slate-50 relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
        <div className="w-full lg:w-1/2 space-y-8">
          <h3 className="text-4xl md:text-6xl font-display font-black text-slate-900 leading-tight tracking-tighter italic">
            Esta es tu oportunidad para <span className="text-vinotinto">ser parte</span> de la institución
          </h3>
          <p className="text-slate-600 text-lg font-medium leading-relaxed">
            Únete a una comunidad comprometida con la excelencia y el futuro. Brindamos las herramientas necesarias para que nuestros estudiantes lideren con valores y conocimiento. Descubre un mundo de posibilidades académicas y humanas diseñado para potenciar tu talento único.
          </p>
          <Link to="/admisiones">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className="bg-vinotinto text-white px-10 py-5 font-display font-black rounded-xl transition-all shadow-xl hover:bg-vinotinto-dark uppercase tracking-widest text-sm cursor-pointer inline-block"
            >
              Solicitar Información
            </motion.div>
          </Link>
        </div>

        <div className="w-full lg:w-1/2">
          <div className="relative aspect-square w-full max-w-[500px] mx-auto group">
            <div className="absolute -inset-6 bg-gradient-to-tr from-vinotinto/10 to-gold/10 blur-3xl rounded-[3rem] opacity-50 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-full h-full rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl shadow-black/10">
              <AnimatePresence mode="wait">
                <motion.img
                  key={current}
                  src={OPPORTUNITY_IMAGES[current]}
                  initial={{ opacity: 0, scale: 1.1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 1 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-20">
                {OPPORTUNITY_IMAGES.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={
                      "w-12 h-1 rounded-full transition-all duration-500 " +
                      (i === current ? "bg-white" : "bg-white/30 hover:bg-white/50")
                    }
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OpportunitySection;
