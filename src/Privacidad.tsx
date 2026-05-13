import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, CheckCircle2, Mail } from 'lucide-react';

const Privacidad = () => {
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
              Seguridad de Datos
            </motion.span>
            <h2 className="text-5xl lg:text-7xl font-display font-black mb-6 leading-[0.95] tracking-tighter text-white drop-shadow-2xl italic">
              Política de <span className="text-gold">Privacidad</span>
            </h2>
            <p className="text-xl text-white/60 max-w-2xl mx-auto font-medium leading-relaxed">
              Cómo protegemos y gestionamos su información personal.
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
                <Shield className="text-vinotinto" size={32} />
                Protección de Datos Personales
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                En la U.E.P. Francisca Elena Burgos D., la privacidad de nuestros estudiantes y representantes es fundamental. Recopilamos información únicamente con fines académicos, administrativos y de comunicación institucional.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-4">
                <Eye className="text-gold" size={32} />
                Información Recopilada
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                A través de este portal, podemos recopilar:
              </p>
              <ul className="space-y-3">
                {[
                  'Datos de contacto (email, teléfono, dirección).',
                  'Información académica y boletines de calificaciones.',
                  'Registros de asistencia y participación en el portal.',
                  'Comprobantes de pago y datos de facturación.'
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-600 font-medium">
                    <CheckCircle2 size={18} className="text-vinotinto shrink-0 mt-0.5" />
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
                <Lock className="text-vinotinto" size={32} />
                Seguridad de la Información
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Utilizamos tecnologías de cifrado y protocolos de seguridad (SSL/Supabase Auth) para garantizar que sus datos estén protegidos contra accesos no autorizados, alteraciones o divulgación.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-4"
            >
              <h3 className="text-3xl font-display font-black text-slate-900 tracking-tight flex items-center gap-4">
                <Mail className="text-gold" size={32} />
                Contacto Legal
              </h3>
              <p className="text-slate-600 leading-relaxed font-medium">
                Si desea ejercer sus derechos de acceso, rectificación o supresión de sus datos personales, puede ponerse en contacto con nuestra coordinación administrativa a través de <span className="text-vinotinto font-bold">privacidad@febd.edu.ve</span>.
              </p>
            </motion.div>

            <div className="pt-12 border-t border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                Cumplimos con las regulaciones de protección de datos vigentes en la República Bolivariana de Venezuela.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Privacidad;
