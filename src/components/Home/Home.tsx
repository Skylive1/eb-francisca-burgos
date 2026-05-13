import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { 
  LOGO_URL, 
  HERO_IMAGES, 
  NEWS_DATA, 
  NewsItem 
} from '../../constants';

// Sub-components
import NewsCard from './NewsCard';
import NewsModal from './NewsModal';
import StatsSection from './StatsSection';
import ValoresSection from './ValoresSection';
import DirectorSection from './DirectorSection';
import OpportunitySection from './OpportunitySection';
import WhyChooseUs from './WhyChooseUs';

const Home = ({ isScrolled, showIntro }: { isScrolled: boolean; showIntro: boolean }) => {
  const [currentSlide, setCurrentSlide] = React.useState(0);
  const [newsData, setNewsData] = React.useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = React.useState<NewsItem | null>(null);

  React.useEffect(() => {
    const fetchNews = async () => {
      try {
        const [newsRes, eventsRes] = await Promise.all([
          supabase.from('school_news').select('*').order('created_at', { ascending: false }).limit(3),
          supabase.from('school_events').select('*').order('event_date', { ascending: false }).limit(3)
        ]);

        if (newsRes.error) throw newsRes.error;
        if (eventsRes.error) throw eventsRes.error;

        const combinedData = [
          ...(newsRes.data || []).map((item: any) => ({ ...item, type: 'news' })),
          ...(eventsRes.data || []).map((item: any) => ({ ...item, type: 'events' }))
        ];
        
        if (combinedData.length > 0) {
          const transformedNews: NewsItem[] = combinedData
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .map((item: any) => ({
              id: item.id,
              image: item.image_url,
              category: item.type === 'news' ? 'Institucional' : 'Evento',
              date: new Date(item.event_date || item.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }).toUpperCase(),
              title: item.title,
              desc: (item.content || item.description)?.substring(0, 100) + '...',
              fullDesc: item.content || item.description || ''
            }));
          setNewsData(transformedNews);
        } else {
          setNewsData(NEWS_DATA);
        }
      } catch (error) {
        console.error("Error fetching news:", error);
        setNewsData(NEWS_DATA);
      }
    };
    fetchNews();
  }, []);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev: number) => (prev + 1) % HERO_IMAGES.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <NewsModal news={selectedNews} onClose={() => setSelectedNews(null)} />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-start overflow-hidden bg-vinotinto-dark pt-[18vh]">
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentSlide}
              src={HERO_IMAGES[currentSlide]}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 0.6, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="w-full h-full object-cover mix-blend-overlay"
              alt="Campus Gallery"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-vinotinto-dark via-transparent to-vinotinto-dark/20 opacity-90"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-vinotinto-dark/80 via-transparent to-transparent"></div>
          <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.8)]"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <motion.div
              initial={showIntro ? { opacity: 0, y: 30 } : false}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: showIntro ? 3.2 : 0 }}
              className="pt-10"
            >

            <h2 className="text-5xl lg:text-7xl xl:text-8xl font-display font-black mb-6 leading-[0.95] tracking-tighter text-white drop-shadow-2xl">
              Forjando <span className="text-gold italic block md:inline">Líderes</span> <br />
              en <span className="relative inline-block">
                Excelencia
                <motion.span
                  initial={showIntro ? { width: 0 } : { width: "100%" }}
                  animate={{ width: "100%" }}
                  transition={{ delay: showIntro ? 4.2 : 1, duration: 1, ease: "circOut" }}
                  className="absolute -bottom-2 left-0 h-4 bg-gold/20 -z-10 blur-[1px]"
                ></motion.span>
              </span>
            </h2>

            <p className="text-xl text-white/60 mb-8 max-w-xl font-medium leading-relaxed drop-shadow-md">
              Descubra un entorno educativo innovador donde el compromiso académico y los valores humanos se encuentran para formar el futuro.
            </p>

            <div className="flex flex-wrap gap-6 mt-4">
              <Link to="/admisiones">
                <motion.div
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(184, 134, 11, 0.4)" }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-br from-gold to-[#966b07] text-vinotinto-dark px-10 py-5 font-display font-black rounded-xl transition-all shadow-2xl flex items-center gap-4 group relative overflow-hidden cursor-pointer"
                >
                  <span className="relative z-10 uppercase tracking-[0.2em] text-sm whitespace-nowrap">INICIAR PROCESO</span>
                  <ArrowRight size={20} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                </motion.div>
              </Link>
            </div>
          </motion.div>

          <div className="hidden lg:flex flex-col gap-12 items-end pt-12">
            <div className="flex flex-col gap-5">
              {HERO_IMAGES.map((_, i) => (
                <button key={i} onClick={() => setCurrentSlide(i)} className={`w-2.5 h-2.5 rounded-full transition-all duration-500 ${i === currentSlide ? "bg-gold scale-125 shadow-[0_0_15px_#b8860b]" : "bg-white/20 hover:bg-white/40"}`} />
              ))}
            </div>
            <motion.div 
              initial={showIntro ? { opacity: 0, scale: 0.8, rotate: -5 } : false} 
              animate={{ opacity: 1, scale: 1, rotate: 0 }} 
              transition={{ duration: 1.2, ease: "easeOut", delay: showIntro ? 3.7 : 0.5 }} 
              whileHover={{ scale: 1.05 }} 
              className="relative -mt-24 mr-0"
            >
              <div className="absolute inset-0 bg-gold/10 blur-[120px] rounded-full scale-150 animate-pulse"></div>
              <img src={LOGO_URL} alt="Escudo Institucional Grande" className="w-[380px] h-auto object-contain drop-shadow-[0_0_50px_rgba(184,134,11,0.4)] relative z-10 animate-float" />
              <p className="text-[10px] font-black text-gold uppercase tracking-[0.5em] text-center mt-12 opacity-40">Fundada en la Excelencia</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* News Section */}
      <section className="py-32 px-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#7a002605,transparent)]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl">
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block"
              >
                Crónicas de la Institución
              </motion.span>
              <h3 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-none tracking-tighter italic">
                Últimas <span className="text-vinotinto underline decoration-gold/30 underline-offset-8">Noticias</span>
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {newsData.map((news) => (
              <NewsCard
                key={news.id}
                news={news}
                onClick={() => setSelectedNews(news)}
              />
            ))}
          </div>
        </div>
      </section>

      <StatsSection />
      
      <WhyChooseUs />

      <ValoresSection />

      <DirectorSection />

      <OpportunitySection />
    </>
  );
};

export default Home;
