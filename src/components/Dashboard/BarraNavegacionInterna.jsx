import React from 'react';
import { motion as Motion } from 'framer-motion';
import { LayoutGrid, Sparkles, Calendar } from 'lucide-react';

const BarraNavegacionInterna = ({ activa, alCambiar }) => {
  const links = [
    { id: 'vlog', label: 'Vlog Escolar', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'aula', label: 'Aula Virtual', icon: <LayoutGrid className="w-4 h-4" /> },
  ];

  return (
    <nav className="w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-20 z-30 px-8 py-3 overflow-x-auto no-scrollbar shadow-sm">
      <div className="max-w-[1400px] mx-auto flex items-center gap-2">
        {links.map((link) => (
          <button
            key={link.id}
            onClick={() => alCambiar(link.id)}
            className={`
              relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl transition-all duration-300
              text-xs font-black uppercase tracking-widest group
              ${activa === link.id ? 'text-vinotinto-800 bg-white/50 shadow-sm' : 'text-gray-400 hover:text-gray-600 hover:bg-white/30'}
            `}
          >
            <span className={`transition-transform duration-300 ${activa === link.id ? 'scale-110' : 'group-hover:scale-110 opacity-70'}`}>
              {link.icon}
            </span>
            {link.label}
            
            {activa === link.id && (
              <Motion.div 
                layoutId="nav-glow" 
                className="absolute inset-0 bg-vinotinto-800/5 rounded-xl -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            
            {activa === link.id && (
              <Motion.div 
                layoutId="nav-active-line" 
                className="absolute bottom-0 left-6 right-6 h-0.5 bg-vinotinto-800 rounded-full"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default BarraNavegacionInterna;
