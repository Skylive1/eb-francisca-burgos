import React from 'react';
import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';
import { DIRECTOR_CARD_IMG, LOGO_URL } from '../../constants';

const DirectorSection = () => (
  <section className="py-24 px-8 bg-white relative overflow-hidden">
    <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24 relative z-10">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="w-full lg:w-1/2">
        <div className="relative group perspective-1000">
          <div className="absolute -inset-4 bg-gradient-to-tr from-vinotinto/20 to-gold/20 blur-3xl opacity-20 group-hover:opacity-40 transition-opacity rounded-[3rem]"></div>
          <img src={DIRECTOR_CARD_IMG} alt="Edgar Delmoral - Institución" className="w-full h-auto rounded-[2.5rem] shadow-[0_30px_70px_-15px_rgba(0,0,0,0.3)] border border-white/20 transition-all duration-700 block" />
        </div>
      </motion.div>
      <div className="w-full lg:w-1/2 space-y-10">
        <Quote size={80} className="text-vinotinto/5 absolute -top-10 -left-10 -z-10" />
        <h3 className="text-3xl md:text-5xl font-display font-black text-slate-900 leading-tight tracking-tighter italic">"La educación no es solo transmitir conocimientos, sino <span className="text-gold">encender una chispa</span> que dure toda la vida."</h3>
        <div className="space-y-6 text-slate-600 text-lg font-medium leading-relaxed">
          <p>
            Bienvenidos a <span className="text-vinotinto font-bold">Francisca Elena Burgos D.</span> Este proyecto nació hace un año con un propósito claro: crear un espacio donde la excelencia académica y el desarrollo humano caminen de la mano.
          </p>
          <p>
            Como fundador, mi compromiso ha sido diseñar una institución que se adapte a los retos del siglo XXI, ofreciendo a nuestros estudiantes las herramientas tecnológicas y los valores éticos necesarios para liderar el futuro. Tras años de experiencia en el sector educativo, entendí que las familias buscan más que un aula; buscan una comunidad que cuide y potencie el talento único de cada joven.
          </p>
          <p>
            En este primer aniversario, reafirmamos nuestra promesa de seguir creciendo junto a sus hijos, manteniendo siempre las puertas abiertas para construir, juntos, el camino hacia sus sueños.
          </p>
        </div>
        <div className="pt-8 border-t border-slate-100 flex items-center gap-6">
          <div className="w-16 h-16 bg-vinotinto/5 rounded-full flex items-center justify-center">
            <img src={LOGO_URL} alt="Seal" className="w-10 h-10 object-contain opacity-40" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gold mb-1">Firma Institucional</p>
            <p className="font-display text-2xl text-vinotinto italic font-black">Edgar Delmoral</p>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default DirectorSection;
