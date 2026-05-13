import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar } from 'lucide-react';
import { NewsItem, LOGO_URL } from '../../constants';

const NewsModal = ({ news, onClose }: { news: NewsItem | null, onClose: () => void }) => (
  <AnimatePresence>
    {news && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-vinotinto-dark/80 backdrop-blur-xl"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] overflow-hidden shadow-2xl overflow-y-auto no-scrollbar"
        >
          <button
            onClick={onClose}
            className="absolute top-6 right-6 z-10 w-12 h-12 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 shadow-xl hover:scale-110 active:scale-95 transition-all"
          >
            <X size={24} />
          </button>

          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-1/2 h-[300px] md:h-auto sticky top-0 md:relative">
              <img src={news.image} alt={news.title} className="w-full h-full object-cover" />
              <div className="absolute top-6 left-6">
                <span className="bg-vinotinto text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl">
                  {news.category}
                </span>
              </div>
            </div>

            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
              <div className="mb-6 flex items-center gap-4 text-gold font-black text-xs uppercase tracking-widest">
                <Calendar size={16} /> {news.date} - Institucional
              </div>
              <h3 className="text-3xl md:text-5xl font-display font-black text-slate-900 leading-tight tracking-tighter italic mb-8">
                {news.title}
              </h3>
              <p className="text-slate-600 text-lg font-medium leading-relaxed mb-10">
                {news.fullDesc}
              </p>

              <div className="mt-auto pt-8 border-t border-slate-100 flex items-center gap-5">
                <div className="w-12 h-12 bg-vinotinto/5 rounded-full flex items-center justify-center p-2">
                  <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain opacity-50" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Publicado por</p>
                  <p className="text-sm font-bold text-vinotinto">Dirección Académica</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

export default NewsModal;
