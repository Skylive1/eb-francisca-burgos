import React from 'react';
import { motion } from 'framer-motion';
import { LOGO_URL } from '../../constants';

const SplashScreen = ({ onFinish }: { onFinish: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 2.5, duration: 1, ease: "easeInOut" }}
      onAnimationComplete={onFinish}
      className="fixed inset-0 z-[200] bg-[#4a0a10] flex flex-col items-center justify-center"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
        animate={{ opacity: 1, scale: 1, rotate: 0 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="relative"
      >
        <div className="absolute inset-0 bg-gold/20 blur-[100px] rounded-full animate-pulse"></div>
        <img src={LOGO_URL} alt="Logo" className="w-48 h-auto relative z-10" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 1 }}
        className="text-center mt-12"
      >
        <div className="w-12 h-1 bg-gold mx-auto mt-4 rounded-full"></div>
      </motion.div>
    </motion.div>
  );
};

export default SplashScreen;
