import React from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';

/**
 * COMPONENTE: MenuLateral (Sidebar) Premium
 * --------------------------------------------------------
 * Menú lateral animado con Framer Motion. 
 * Incluye navegación refinada y limpieza de elementos.
 */
const MenuLateral = ({ isOpen, closeSidebar, onInicio, onLogout, haciaSeccion }) => {
  // Variantes para la animación del panel
  const sidebarVariants = {
    closed: { x: '100%', opacity: 0.8 },
    open: { 
      x: 0, 
      opacity: 1,
      transition: { 
        type: 'spring', 
        stiffness: 300, 
        damping: 30,
        staggerChildren: 0.1,
        delayChildren: 0.2
      } 
    }
  };

  // Variantes para los ítems del menú (efecto stagger)
  const itemVariants = {
    closed: { x: 20, opacity: 0 },
    open: { x: 0, opacity: 1 }
  };

  const menuItems = [
    { name: 'Mis Clases', id: 'seccion-clases', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253', color: 'text-vinotinto-600' },
    { name: 'Información de Acoso', id: 'seccion-acoso', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z', color: 'text-red-500' },
    { name: 'Prevención de Bullying', id: 'seccion-bullying', icon: 'M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0112 3v1', color: 'text-orange-500' },
    { name: 'Guía del Aula Virtual', id: 'seccion-guia', icon: 'M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z', color: 'text-blue-500' }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay Animado */}
          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-vinotinto-900/60 backdrop-blur-sm z-40 transition-opacity"
            onClick={closeSidebar}
          ></Motion.div>

          {/* Panel Lateral Animado */}
          <Motion.aside
            initial="closed"
            animate="open"
            exit="closed"
            variants={sidebarVariants}
            className="fixed top-0 right-0 h-screen w-80 bg-white/70 backdrop-blur-3xl text-gray-800 flex flex-col shadow-[-10px_0_40px_rgba(0,0,0,0.1)] border-l border-white/50 z-50"
          >
            {/* CABECERA */}
            <div className="w-full p-6 bg-gradient-to-br from-vinotinto-800 to-vinotinto-900 relative overflow-hidden border-b-2 border-gold/40">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
              
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-4">
                   <div className="relative group cursor-pointer" onClick={onLogout}>
                     <div className="w-12 h-12 flex items-center justify-center transform group-hover:scale-105 transition-transform duration-300 overflow-hidden">
                        <img src="/Fondo-Nuevo.png" alt="Logo" className="w-full h-full object-contain" />
                     </div>
                   </div>
                   <div className="cursor-pointer" onClick={onInicio}>
                      <h2 className="text-xl font-black text-white italic tracking-tighter leading-none hover:text-gold transition-colors uppercase font-display">Menú</h2>
                      <p className="text-[10px] font-bold text-gold/60 uppercase tracking-widest mt-1">Navegación Aula</p>
                   </div>
                </div>

                <button
                  onClick={closeSidebar}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all active:scale-90"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* NAVEGACIÓN REFINADA */}
            <nav className="flex-1 overflow-y-auto py-8 px-5 custom-scrollbar">
              <ul className="space-y-3">
                {menuItems.map((item, index) => (
                  <Motion.li key={index} variants={itemVariants}>
                    <button
                      onClick={() => haciaSeccion(item.id)}
                      className="group w-full flex items-center p-3.5 rounded-2xl transition-all duration-300 hover:bg-vinotinto-50 border border-transparent hover:border-vinotinto-100"
                    >
                      <div className="p-2 rounded-xl transition-all duration-300 bg-gray-100 group-hover:bg-vinotinto-100 mr-4 shadow-sm group-hover:scale-110">
                        <svg className={`w-5 h-5 text-gray-400 group-hover:${item.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d={item.icon} />
                        </svg>
                      </div>
                      <span className="font-bold text-[13px] tracking-tight text-gray-600 group-hover:text-vinotinto-900 transition-colors">
                        {item.name}
                      </span>
                    </button>
                  </Motion.li>
                ))}
              </ul>

              {/* OPCIÓN DE SALIR EXPLÍCITA */}
              <div className="mt-10 pt-6 border-t border-gray-100">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center p-4 rounded-2xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-300 group shadow-sm hover:shadow-lg hover:shadow-red-200"
                >
                  <div className="p-2 rounded-xl bg-white group-hover:bg-red-500 mr-4 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <span className="font-black text-xs uppercase tracking-widest">Salir del Aula Virtual</span>
                </button>
              </div>
            </nav>

            {/* PIE DE PÁGINA */}
            <div className="p-8 bg-gray-50 border-t border-gray-100 flex flex-col items-center">
                <p className="text-[10px] font-black text-gray-900 uppercase tracking-widest text-center">
                  Francisca Elena Burgos D.
                </p>
                <div className="mt-1">
                   <span className="text-[9px] font-bold text-vinotinto-600 uppercase tracking-tighter">Innovación y Bienestar</span>
                </div>
            </div>
          </Motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default MenuLateral;
