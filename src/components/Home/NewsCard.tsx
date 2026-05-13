import React from 'react';
import { motion } from 'framer-motion';
import { NewsItem, NEWS_IMAGE_MAP, LOGO_URL } from '../../constants';
import noticiaPromo from '../../imagenes/noticias/promo1.jpg';

const NewsCard = ({ news, onClick }: { news: NewsItem, onClick: () => void }) => {
  const imageSrc = news.image || NEWS_IMAGE_MAP[news.imageKey || ''] || noticiaPromo;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onClick={onClick}
      className="bg-white rounded-[2rem] overflow-hidden shadow-[0_15px_40px_-15px_rgba(0,0,0,0.1)] border border-slate-100 group cursor-pointer h-full flex flex-col"
    >
      <div className="p-4 flex-shrink-0">
        <div className="relative h-56 rounded-2xl overflow-hidden">
          <img
            src={imageSrc}
            alt={news.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className="absolute top-4 left-4">
          <span className="bg-vinotinto text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-lg">
            {news.category}
          </span>
        </div>
      </div>

      <div className="px-8 pb-8 flex flex-col flex-grow">
      <h4 className="text-xl font-display font-black text-slate-800 mb-4 leading-tight group-hover:text-vinotinto transition-colors">
        {news.title}
      </h4>
      <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-3 mb-8">
        {news.desc}
      </p>

      <div className="mt-auto flex justify-between items-center pt-6 border-t border-slate-50">
        <span className="text-[11px] font-bold text-slate-400">
          {news.date === "15 ABR" ? "15 de Abril, 2026" :
            news.date === "22 MAR" ? "22 de Marzo, 2026" :
              news.date === "28 MAR" ? "28 de Marzo, 2026" : news.date}
        </span>
        {news.link_url ? (
          <a href={news.link_url} target="_blank" rel="noopener noreferrer">
            <button className="bg-vinotinto text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-vinotinto-dark transition-all transform hover:scale-105 active:scale-95">
              Ir al Sitio
            </button>
          </a>
        ) : (
          <button className="bg-vinotinto text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg hover:bg-vinotinto-dark transition-all transform hover:scale-105 active:scale-95">
            Leer Más
          </button>
        )}
      </div>
    </div>
  </motion.div>
  );
};

export default NewsCard;
