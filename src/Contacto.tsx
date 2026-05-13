import React from 'react';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  MessageSquare,
  Globe,
  Camera,
  ArrowRight
} from 'lucide-react';

const Contacto = () => {
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Mensaje enviado (Simulado)');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[50vh] flex items-center overflow-hidden bg-vinotinto-dark pt-[16vh] pb-16">
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
              Canales de Comunicación
            </motion.span>
            <h2 className="text-5xl lg:text-8xl font-display font-black mb-6 leading-[0.95] tracking-tighter text-white drop-shadow-2xl italic">
              Contáctanos <span className="text-gold">Hoy</span>
            </h2>
            <p className="text-xl text-white/60 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
              Estamos aquí para atender sus dudas, sugerencias y brindarle toda la información que necesite sobre nuestra institución.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-32 px-8 bg-white relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-16">
            {/* Contact Info Column */}
            <div className="lg:col-span-5 space-y-12">
              <div>
                <span className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block">Información Directa</span>
                <h3 className="text-4xl md:text-5xl font-display font-black text-slate-900 leading-none tracking-tighter italic mb-8">
                  Nuestras <span className="text-vinotinto">Oficinas</span>
                </h3>
              </div>

              <div className="grid gap-6">
                {[
                  {
                    Icon: Phone,
                    iconColor: "text-gold",
                    label: "Llámanos",
                    value: "+58 424-5833511",
                    sub: "Atención Lunes a Viernes"
                  },
                  {
                    Icon: Mail,
                    iconColor: "text-vinotinto",
                    label: "Correo Electrónico",
                    value: "contacto@febd.edu.ve",
                    sub: "Respondemos en menos de 24h"
                  },
                  {
                    Icon: MapPin,
                    iconColor: "text-gold",
                    label: "Ubicación",
                    value: "Municipio Dabajuro, Edo. Falcón",
                    sub: "Sector La Gran Vía"
                  },
                  {
                    Icon: Clock,
                    iconColor: "text-vinotinto",
                    label: "Horario Escolar",
                    value: "7:00 AM – 4:00 PM",
                    sub: "Horario Corrido"
                  }
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-start gap-6 p-8 bg-slate-50 rounded-[2rem] border border-slate-100 hover:bg-white hover:shadow-2xl hover:border-vinotinto/10 transition-all duration-500 group"
                  >
                    <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500 shrink-0">
                      <item.Icon size={24} className={item.iconColor} />
                    </div>
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</p>
                      <p className="text-lg font-display font-black text-slate-900 tracking-tight">{item.value}</p>
                      <p className="text-slate-500 text-xs font-medium mt-1">{item.sub}</p>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="pt-8">
                <p className="text-[10px] font-black text-gold uppercase tracking-[0.4em] mb-6">Síguenos en Redes</p>
                <div className="flex gap-4">
                  {[Camera, Globe, MessageSquare].map((Icon, i) => (
                    <motion.a
                      key={i}
                      href="#"
                      whileHover={{ y: -5, backgroundColor: "#7a0026", color: "#fff" }}
                      className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-slate-400 transition-all shadow-sm"
                    >
                      <Icon size={24} />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            {/* Form Column */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute -inset-4 bg-vinotinto/5 blur-3xl rounded-[3rem]"></div>
                <div className="relative bg-white border border-slate-100 p-8 md:p-12 rounded-[3rem] shadow-2xl">
                  <h4 className="text-2xl font-display font-black text-slate-900 uppercase tracking-tight mb-8 italic">
                    Envíanos un <span className="text-vinotinto">Mensaje</span>
                  </h4>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Completo</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          placeholder="Ej: Juan Pérez"
                          className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-gold focus:bg-white outline-none transition-all font-medium text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          placeholder="juan@correo.com"
                          className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-gold focus:bg-white outline-none transition-all font-medium text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asunto</label>
                      <select
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 outline-none transition-all font-medium text-sm appearance-none cursor-pointer focus:border-gold focus:bg-white"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23b8860b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 24px center' }}
                      >
                        <option value="">Seleccione un motivo</option>
                        <option value="admisiones">Admisiones</option>
                        <option value="administrativo">Administrativo</option>
                        <option value="academico">Académico</option>
                        <option value="otro">Otro</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mensaje</label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={6}
                        placeholder="¿Cómo podemos ayudarle?"
                        className="w-full px-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-300 focus:border-gold focus:bg-white outline-none transition-all font-medium text-sm resize-none"
                      ></textarea>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(122, 0, 38, 0.2)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-vinotinto text-white py-6 rounded-2xl font-display font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 group relative overflow-hidden"
                    >
                      <span className="relative z-10">Enviar Mensaje</span>
                      <Send size={18} className="relative z-10 group-hover:translate-x-2 group-hover:-translate-y-1 transition-transform" />
                      <div className="absolute inset-0 bg-gold translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                    </motion.button>
                  </form>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[500px] w-full bg-slate-100 grayscale hover:grayscale-0 transition-all duration-1000 overflow-hidden">
        {/* Placeholder for map - in a real app use an iframe or map library */}
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-200 gap-4">
          <MapPin size={48} className="text-vinotinto animate-bounce" />
          <p className="text-slate-500 font-display font-black uppercase tracking-widest text-sm">Municipio Dabajuro, Edo. Falcón</p>
        </div>
      </section>
    </>
  );
};

export default Contacto;
