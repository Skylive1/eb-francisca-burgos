import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Phone, ArrowRight, Menu, X, ChevronDown, BookOpen, FileText, ChevronRight } from 'lucide-react';
import escudoLogo from '../../escudo.png';

const LOGO_URL = escudoLogo;

const Navbar = ({ isScrolled }: { isScrolled: boolean }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isPortal = pathname === '/portal';
  const showScrolledState = isScrolled || isPortal;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  return (
    <>
      <div className={`bg-vinotinto-dark/95 backdrop-blur-md text-white/90 py-2.5 px-8 hidden md:flex justify-between items-center text-[11px] font-black tracking-[0.15em] uppercase border-b border-white/5 transition-all duration-700 fixed top-0 w-full z-[60] ${isScrolled ? "-translate-y-full opacity-0" : "translate-y-0 opacity-100"
        }`}>
        <div className="flex gap-8">
          <span className="flex items-center gap-2 hover:text-gold transition-colors cursor-default">
            <MapPin size={14} className="text-gold" /> Municipio Dabajuro, Edo. Falcón
          </span>
          <span className="flex items-center gap-2 hover:text-gold transition-colors cursor-default">
            <Phone size={14} className="text-gold" /> +58 424-5833511
          </span>
        </div>
        <div className="flex gap-6">
          <a href="#" className="hover:text-gold transition-all flex items-center gap-1 group">
            Correo Institucional <ArrowRight size={10} className="opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
          </a>
        </div>
      </div>

      <nav className={`fixed left-0 w-full z-50 transition-all duration-700 ease-in-out px-4 md:px-8 ${isScrolled ? "top-0 py-3" : "top-0 md:top-10"
        }`}>
        <div className={`max-w-7xl mx-auto rounded-2xl px-6 lg:px-8 py-3 flex justify-between items-center transition-all duration-500 ${showScrolledState
            ? "bg-white/90 backdrop-blur-xl shadow-2xl shadow-vinotinto/10 ring-1 ring-black/5"
            : "bg-transparent ring-0"
          }`}>
          <div className="flex items-center gap-5">
            <Link to="/" className="flex items-center gap-4">
              <AnimatePresence>
                {showScrolledState && (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    src={LOGO_URL}
                    alt="Escudo F.E.B.D"
                    className="h-10 md:h-12 w-auto object-contain"
                  />
                )}
              </AnimatePresence>
              <div>
                <p className={`text-[10px] md:text-[12px] font-bold tracking-[0.2em] uppercase transition-colors duration-500 ${showScrolledState ? "text-vinotinto" : "text-gold"
                  }`}>Francisca Elena Burgos D.</p>
              </div>
            </Link>
          </div>

          <div className={`hidden lg:flex items-center gap-10 text-[12px] font-bold uppercase tracking-wider transition-colors duration-500 ${showScrolledState ? "text-slate-700" : "text-white/90"
            }`}>
            <Link to="/" className="hover:text-gold transition-colors">Inicio</Link>
            <Link to="/nosotros" className="hover:text-gold transition-colors">Nosotros</Link>
            <Link to="/academia" className="hover:text-gold transition-colors">Academia</Link>
            <Link to="/admisiones" className="hover:text-gold transition-colors">Admisiones</Link>
            <Link to="/contacto" className="hover:text-gold transition-colors">Contacto</Link>
            <button
              onClick={() => navigate('/portal')}
              className={`px-8 py-3.5 rounded-xl font-display font-bold transition-all shadow-xl active:scale-95 ${showScrolledState
                  ? "bg-vinotinto text-white hover:bg-vinotinto-dark shadow-vinotinto/20"
                  : "bg-gold text-vinotinto-dark hover:bg-gold-urbe shadow-gold/20"
                }`}>
              PORTAL WEB
            </button>
          </div>
          
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className={`lg:hidden p-2 rounded-xl transition-colors ${showScrolledState ? "text-vinotinto bg-vinotinto/5" : "text-white bg-white/10"}`}
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-white flex flex-col pt-24 px-8"
          >
            <button 
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-8 right-8 w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-800 hover:bg-slate-200"
            >
              <X size={24} />
            </button>
            <div className="flex flex-col gap-6 text-3xl font-display font-black tracking-tighter text-slate-800">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)}>Inicio</Link>
              <Link to="/nosotros" onClick={() => setIsMobileMenuOpen(false)}>Nosotros</Link>
              <Link to="/academia" onClick={() => setIsMobileMenuOpen(false)}>Academia</Link>
              <Link to="/admisiones" onClick={() => setIsMobileMenuOpen(false)}>Admisiones</Link>
              <Link to="/contacto" onClick={() => setIsMobileMenuOpen(false)}>Contacto</Link>
            </div>
            <div className="mt-auto mb-16">
              <button 
                onClick={() => { navigate('/portal'); setIsMobileMenuOpen(false); }}
                className="w-full py-5 bg-vinotinto text-white rounded-2xl font-display font-black text-sm uppercase tracking-widest shadow-xl shadow-vinotinto/20"
              >
                Ir al Portal Web
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
