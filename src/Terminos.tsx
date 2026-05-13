import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Lock, Globe, ArrowRight, CheckCircle2 } from 'lucide-react';

const Terminos = () => {
  return (
    <>
      <section className="relative min-h-[40vh] flex items-center overflow-hidden bg-vinotinto-dark pt-[16vh] pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-vinotinto-dark via-vinotinto to-vinotinto-dark opacity-95"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(184,134,11,0.15),transparent_60%)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md text-gold border border-white/10 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl"
            >
              Marco Legal
            </motion.span>
            <h2 className="text-5xl lg:text-7xl font-display font-black mb-6 leading-[0.95] tracking-tighter text-white drop-shadow-2xl italic">
              Términos y <span className="text-gold">Condiciones</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed">
              Regulaciones para el uso de nuestra plataforma digital y servicios educativos.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-24 px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-slate max-w-none space-y-12">
            
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-4">
                <span className="w-10 h-10 bg-vinotinto/5 rounded-xl flex items-center justify-center text-vinotinto">1</span>
                Aceptación de los Términos
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Al acceder y utilizar el portal web de la U.E.P. Francisca Elena Burgos D., usted acepta estar sujeto a los presentes términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, le recomendamos no utilizar nuestros servicios digitales.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-4">
                <span className="w-10 h-10 bg-vinotinto/5 rounded-xl flex items-center justify-center text-vinotinto">2</span>
                Uso del Portal Educativo
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                El portal está diseñado exclusivamente para fines académicos e informativos. Los usuarios (estudiantes, representantes y docentes) se comprometen a:
              </p>
              <ul className="space-y-3">
                {[
                  'Mantener la confidencialidad de sus credenciales de acceso.',
                  'No utilizar el portal para fines ilícitos o difamatorios.',
                  'Respetar los derechos de autor del contenido académico publicado.',
                  'Interactuar de manera respetuosa en los foros y secciones de comunicación.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                    <CheckCircle2 size={18} className="text-gold shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-4">
                <span className="w-10 h-10 bg-vinotinto/5 rounded-xl flex items-center justify-center text-vinotinto">3</span>
                Propiedad Intelectual
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Todo el contenido presente en este sitio, incluyendo textos, gráficos, logotipos, iconos, imágenes y software, es propiedad de la U.E.P. Francisca Elena Burgos D. o de sus proveedores de contenido y está protegido por las leyes internacionales de derechos de autor.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-4">
                <span className="w-10 h-10 bg-vinotinto/5 rounded-xl flex items-center justify-center text-vinotinto">4</span>
                Limitación de Responsabilidad
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                La institución no garantiza que el sitio web esté libre de errores o interrupciones. No nos hacemos responsables de daños directos o indirectos derivados del uso o la imposibilidad de uso del portal.
              </p>
            </motion.div>

            <div className="pt-12 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Última actualización: 13 de Mayo, 2026
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Terminos;
