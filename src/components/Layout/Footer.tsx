import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Camera, Globe, Video, Mail, MapPin, Phone, Award, Lock, Sparkles } from 'lucide-react';
import escudoLogo from '../../escudo.png';

const LOGO_URL = escudoLogo;

interface FooterListProps {
  title: string;
  items: string[];
}

const FooterList = ({ title, items }: FooterListProps) => (
  <div className="space-y-6">
    <h5 className="font-display font-black uppercase text-white text-xs tracking-[0.3em] italic">{title}</h5>
    <ul className="space-y-4">
      {items.map((item, i) => (
        <li key={i}>
          <a href="#" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-gold transition-colors block italic">
            {item}
          </a>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => (
  <footer className="relative bg-vinotinto-dark pt-32 pb-12 overflow-hidden">
    {/* Decorative Elements */}
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-vinotinto via-gold to-vinotinto shadow-[0_0_20px_rgba(184,134,11,0.5)]"></div>
    <div className="absolute inset-0 bg-gradient-to-b from-vinotinto/10 to-transparent"></div>
    <div className="absolute top-0 right-0 w-96 h-96 bg-vinotinto/10 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
    
    <div className="max-w-7xl mx-auto px-8 relative z-10">
      <div className="grid md:grid-cols-12 gap-16 border-b border-white/5 pb-24 mb-12">
        {/* Brand Column */}
        <div className="md:col-span-5 space-y-10">
          <div className="space-y-6">
            <div className="flex items-center gap-5">
              <img src={LOGO_URL} alt="Escudo" className="h-20 w-auto drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]" />
              <div>
                <h4 className="text-2xl font-display font-black text-white italic tracking-tighter">Francisca Elena</h4>
                <p className="text-gold text-[10px] font-black uppercase tracking-[0.4em]">Burgos Delmoral</p>
              </div>
            </div>
            <p className="text-white/40 text-sm font-medium leading-[1.8] max-w-sm italic pr-8 border-l-2 border-vinotinto pl-6">
              "Formando el futuro de una nación con excelencia y valores supremos, integrando la tecnología y el humanismo en cada paso."
            </p>
          </div>
          
          <div className="flex gap-4">
            {[Camera, Globe, Video, Mail].map((Icon, i) => (
              <motion.a
                key={i}
                href="#"
                whileHover={{ y: -5, backgroundColor: "rgba(184, 134, 11, 0.15)" }}
                className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-gold transition-colors"
              >
                <Icon size={20} />
              </motion.a>
            ))}
          </div>
        </div>

        {/* Links Columns */}
        <div className="md:col-span-4 grid grid-cols-2 gap-8">
          <div className="space-y-6">
            <h5 className="font-display font-black uppercase text-white text-xs tracking-[0.3em] italic">Academia</h5>
            <ul className="space-y-4">
              <li><Link to="/academia#inicial" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-gold transition-colors block italic">Inicial</Link></li>
              <li><Link to="/academia#primaria" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-gold transition-colors block italic">Primaria</Link></li>
              <li><Link to="/academia#media" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-gold transition-colors block italic">Media General</Link></li>
              <li><Link to="/portal" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-gold transition-colors block italic">Portal Web</Link></li>
            </ul>
          </div>
          <div className="space-y-6">
            <h5 className="font-display font-black uppercase text-white text-xs tracking-[0.3em] italic">Institución</h5>
            <ul className="space-y-4">
              <li><Link to="/nosotros" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-gold transition-colors block italic">Nosotros</Link></li>
              <li><Link to="/nosotros#historia" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-gold transition-colors block italic">Historia</Link></li>
              <li><Link to="/admisiones" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-gold transition-colors block italic">Admisiones</Link></li>
              <li><Link to="/contacto" className="text-white/40 text-[11px] font-black uppercase tracking-widest hover:text-gold transition-colors block italic">Contacto</Link></li>
            </ul>
          </div>
        </div>

        {/* Contact/Action Column */}
        <div className="md:col-span-3 space-y-10">
          <div className="space-y-8">
            <h5 className="font-display font-black uppercase text-gold text-sm tracking-[0.2em]">Contact Us</h5>
            <div className="space-y-6 text-sm text-white/40 font-medium">
              <a href="https://maps.app.goo.gl/..." target="_blank" rel="noreferrer" className="flex items-start gap-4 hover:text-gold transition-colors group">
                <MapPin size={22} className="text-gold shrink-0 mt-1" />
                <span>Municipio Dabajuro, Edo. Falcón. <br /> <span className="text-[11px] uppercase tracking-wider text-white/20">Sector La Gran Vía</span></span>
              </a>
              <a href="tel:+584245833511" className="flex items-center gap-4 hover:text-gold transition-colors">
                <Phone size={22} className="text-gold shrink-0" />
                <span>+58 424-5833511</span>
              </a>
            </div>
          </div>
          
          <button className="w-full py-4 bg-vinotinto/20 border border-vinotinto/30 rounded-xl text-white font-display font-black text-xs uppercase tracking-[0.3em] hover:bg-vinotinto/40 transition-all shadow-2xl hover:shadow-vinotinto/10">
            Admisiones 2026
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-8 px-4">
        <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.5em] text-center md:text-left flex items-center gap-3">
          <span className="w-4 h-[1px] bg-white/10"></span>
          © 2026 - Propiedad Intelectual U.E.P.F.E.B.D
        </p>
        <div className="flex gap-10 text-[9px] font-black uppercase tracking-widest text-white/30">
          <Link to="/terminos" className="hover:text-gold transition-colors flex items-center gap-2">
            <Award size={12} className="text-gold/30" /> Jurídico
          </Link>
          <Link to="/privacidad" className="hover:text-gold transition-colors flex items-center gap-2">
            <Lock size={12} className="text-gold/30" /> Privacidad
          </Link>
          <a href="#" className="hover:text-gold transition-colors flex items-center gap-2">
            <Sparkles size={12} className="text-gold/30" /> FLDSMDFR
          </a>
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
