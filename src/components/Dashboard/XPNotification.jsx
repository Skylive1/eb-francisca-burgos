import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star } from 'lucide-react';

const XPNotification = ({ message, amount, show, onComplete }) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onComplete();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onComplete]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, x: '-50%' }}
          animate={{ opacity: 1, y: 0, x: '-50%' }}
          exit={{ opacity: 0, scale: 0.8, x: '-50%' }}
          className="fixed bottom-10 left-1/2 z-[100] bg-gray-900 border border-white/20 text-white px-8 py-5 rounded-[2rem] shadow-2xl flex items-center gap-5 backdrop-blur-xl"
        >
          <div className="w-12 h-12 bg-gold rounded-2xl flex items-center justify-center text-vinotinto-900 shadow-lg shadow-gold/20">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-400 mb-1">¡Recompensa Obtenida!</p>
            <h5 className="text-sm font-black italic tracking-tight">{message}</h5>
          </div>
          <div className="ml-4 px-4 py-2 bg-white/10 rounded-xl border border-white/10 text-gold-500 font-black text-xs">
            +{amount} XP
          </div>
          <div className="absolute -top-2 -right-2">
            <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
               <Star className="text-gold fill-gold w-6 h-6 opacity-50" />
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPNotification;
