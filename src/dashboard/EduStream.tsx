import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, MessageCircle, Share2, Play, HeartPulse, Send, 
  X, CheckCircle2, AlertTriangle, ShieldCheck, Upload, Sparkles, Filter
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

const VLOGS_INITIAL = [
  {
    id: 1,
    author: 'Dirección F.E.B.D.',
    avatar: 'https://images.unsplash.com/photo-1544717305-27a0bf437021?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    title: 'Novedades para el Lapso',
    time: 'Hace 2 horas',
    views: '1.2k',
    thumbnail: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?ixlib=rb-1.2.1&auto=format&fit=crop&w=1000&q=80',
    likes: 342,
    comments: 45,
    featured: true,
    category: 'Oficial'
  },
  {
    id: 2,
    author: 'Centro de Estudiantes',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    title: 'Resumen Feria de Ciencias 2026',
    time: 'Ayer',
    views: '850',
    thumbnail: 'https://images.unsplash.com/photo-1564069114553-7215e1ff1890?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    likes: 210,
    comments: 18,
    featured: false,
    category: 'Eventos'
  },
  {
    id: 3,
    author: 'Deportes',
    avatar: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    title: 'Final de Intercursos: Resumen Deportivo',
    time: 'Hace 3 días',
    views: '2.1k',
    thumbnail: 'https://plus.unsplash.com/premium_photo-1661963056157-89196b1b51e6?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    likes: 543,
    comments: 89,
    featured: false,
    category: 'Deportes'
  },
  {
    id: 4,
    author: 'Club de Teatro',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=crop&w=100&q=80',
    title: 'Ensayo General: Obra Anual',
    time: 'Hace 1 semana',
    views: '654',
    thumbnail: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    likes: 120,
    comments: 12,
    featured: false,
    category: 'Cultura'
  }
];

const BuzonConvivencia = ({ isOpen, onClose, userName }: any) => {
  const [messages, setMessages] = useState<{text: string, isBot: boolean}[]>([
    { text: `Hola ${userName || 'estudiante'}. Este es un espacio seguro y 100% anónimo para ti. Soy el asistente del Dpto. de Psicología. ¿Hay algo que te esté preocupando en el colegio o con algún compañero?`, isBot: true }
  ]);
  const [inputValue, setInputValue] = useState("");

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if(!inputValue.trim()) return;

    setMessages([...messages, { text: inputValue, isBot: false }]);
    setInputValue("");

    setTimeout(() => {
      setMessages(prev => [...prev, { text: 'Gracias por confiar en nosotros. He registrado tu mensaje de forma totalmente anónima. Una orientadora de guardia lo revisará. ¿Te gustaría agendar una charla privada hoy?', isBot: true }]);
    }, 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className="fixed bottom-6 right-6 w-96 h-[550px] bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] flex flex-col z-[200] overflow-hidden border border-slate-100"
        >
          <div className="bg-gradient-to-br from-vinotinto-800 to-vinotinto-950 p-8 text-white flex justify-between items-center z-10 shrink-0">
            <div>
              <h3 className="font-black font-display text-xl tracking-tight flex items-center gap-2">
                <ShieldCheck size={24} className="text-gold" /> Canal Seguro
              </h3>
              <p className="text-[10px] text-white/60 uppercase tracking-[0.2em] font-black mt-1">Privacidad Garantizada</p>
            </div>
            <button onClick={onClose} className="hover:bg-white/20 p-2 rounded-xl transition-all active:scale-90">
              <X size={20} />
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-4 custom-scrollbar">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, x: msg.isBot ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
              >
                <div className={`max-w-[85%] rounded-[1.5rem] p-4 text-sm font-medium shadow-sm ${msg.isBot ? 'bg-white text-slate-700 border border-slate-100' : 'bg-vinotinto-800 text-white'}`}>
                  {msg.text}
                </div>
              </motion.div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="p-6 bg-white border-t border-slate-100 flex gap-3 shrink-0">
            <input 
              type="text" 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Escribe tu mensaje anónimo..." 
              className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 text-sm focus:outline-none focus:ring-4 focus:ring-vinotinto-800/10 focus:border-vinotinto-800 transition-all"
            />
            <button type="submit" className="bg-vinotinto-800 text-white p-4 rounded-2xl hover:bg-vinotinto-950 transition-all shadow-lg active:scale-95 shrink-0">
              <Send size={20} />
            </button>
          </form>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const EduStream = () => {
  const [isBuzonOpen, setIsBuzonOpen] = useState(false);
  const [perfil, setPerfil] = useState<any>(null);
  const [activeCategory, setActiveCategory] = useState('Todos');

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
        setPerfil(profile);
      }
    };
    fetchUser();
  }, []);

  const featured = VLOGS_INITIAL.find(v => v.featured);
  const filteredVlogs = activeCategory === 'Todos' 
    ? VLOGS_INITIAL.filter(v => !v.featured)
    : VLOGS_INITIAL.filter(v => !v.featured && v.category === activeCategory);

  const categories = ['Todos', 'Oficial', 'Eventos', 'Deportes', 'Cultura'];

  return (
    <div className="p-0 md:p-4 max-w-[1600px] mx-auto min-h-full pb-32 animate-fade-in">
      
      {/* Cabecera Dinámica */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="text-vinotinto-800 w-6 h-6" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-vinotinto-800">Plataforma Multimedia</span>
          </div>
          <h1 className="text-5xl font-black text-slate-900 tracking-tighter italic font-display">Vlog Escolar</h1>
          <p className="text-slate-500 font-medium mt-1">Conecta con la vida estudiantil y las novedades institucionales.</p>
        </div>

        {perfil?.role === 'profesor' || perfil?.role === 'admin' ? (
          <button className="flex items-center gap-3 px-8 py-4 bg-vinotinto-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-vinotinto-950 transition-all shadow-xl shadow-vinotinto-100 active:scale-95 group">
            <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" />
            Subir Nuevo Vlog
          </button>
        ) : null}
      </div>

      {/* Banner de Bienestar - Diseño Modernizado */}
      <motion.div 
        whileHover={{ scale: 1.01 }}
        onClick={() => setIsBuzonOpen(true)}
        className="w-full bg-gradient-to-br from-red-600 to-red-800 rounded-[2.5rem] p-8 md:p-12 text-white mb-12 cursor-pointer shadow-2xl relative overflow-hidden group border border-white/10"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-8 text-center md:text-left">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-xl rounded-3xl flex items-center justify-center shrink-0 shadow-inner group-hover:rotate-12 transition-transform duration-500">
              <HeartPulse size={40} className="text-white" />
            </div>
            <div>
              <h3 className="text-3xl font-black tracking-tight mb-2 italic">Buzón de Convivencia</h3>
              <p className="text-red-50/80 font-medium max-w-2xl leading-relaxed">
                ¿Necesitas hablar? Este es un espacio de escucha segura, privada y totalmente anónima. Estamos aquí para apoyarte en cualquier situación personal o escolar.
              </p>
            </div>
          </div>
          <button className="bg-white text-red-700 font-black uppercase tracking-[0.2em] text-[10px] px-10 py-5 rounded-2xl shadow-xl hover:bg-red-50 transition-all flex items-center gap-3 shrink-0 active:scale-95">
            <ShieldCheck size={18}/> Iniciar Chat Anónimo
          </button>
        </div>
      </motion.div>

      {/* Filtros de Categoría */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-4 no-scrollbar">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeCategory === cat 
                ? 'bg-slate-900 text-white shadow-lg' 
                : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Cuadrícula de Contenidos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Video Destacado */}
        {featured && activeCategory === 'Todos' && (
          <div className="lg:col-span-2 relative rounded-[3rem] overflow-hidden group cursor-pointer shadow-2xl bg-slate-950 aspect-video lg:aspect-[21/9] border-4 border-white">
            <img src={featured.thumbnail} alt={featured.title} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 group-hover:scale-105 transition-all duration-1000" />
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent flex flex-col justify-end p-10 md:p-14">
              <div className="w-24 h-24 bg-vinotinto-800/90 backdrop-blur-md rounded-full flex items-center justify-center mb-6 pl-2 shadow-2xl opacity-0 group-hover:opacity-100 transition-all absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 hover:scale-110 active:scale-90">
                <Play size={40} className="text-white fill-white" />
              </div>
              
              <div className="relative z-10 max-w-3xl">
                <div className="flex items-center gap-2 mb-4">
                  <span className="bg-red-500 text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">Estreno</span>
                  <span className="bg-white/20 backdrop-blur-md text-white text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full border border-white/20">{featured.category}</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4 leading-[0.9] tracking-tighter italic">{featured.title}</h2>
                <div className="flex items-center gap-6 text-white/60 text-[10px] font-black uppercase tracking-widest">
                  <span className="flex items-center gap-2"><img src={featured.avatar} className="w-6 h-6 rounded-full object-cover" /> {featured.author}</span>
                  <span className="flex items-center gap-2">{featured.views} Vistas</span>
                  <span>{featured.time}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Videos Regulares */}
        {filteredVlogs.map((video, i) => (
          <motion.div 
            key={video.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="group cursor-pointer flex flex-col"
          >
            <div className="relative rounded-[2.5rem] overflow-hidden w-full aspect-video bg-slate-200 mb-6 shadow-lg group-hover:shadow-vinotinto-800/10 transition-all border-4 border-white">
              <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute top-4 left-4">
                <span className="bg-white/90 backdrop-blur-md text-vinotinto-800 text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-lg shadow-sm">{video.category}</span>
              </div>
              <div className="absolute inset-0 bg-black/0 group-hover:bg-vinotinto-950/20 transition-colors flex items-center justify-center">
                <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center pl-1 shadow-2xl opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
                  <Play size={24} className="text-vinotinto-800 fill-vinotinto-800" />
                </div>
              </div>
            </div>
            
            <div className="flex gap-5 px-2">
              <img src={video.avatar} alt="avatar" className="w-12 h-12 rounded-2xl border-2 border-white shadow-md object-cover shrink-0 mt-1 group-hover:rotate-6 transition-transform" />
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-slate-900 leading-tight mb-2 group-hover:text-vinotinto-800 transition-colors line-clamp-2 uppercase italic tracking-tighter text-lg">
                  {video.title}
                </h3>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{video.author}</p>
                <div className="flex items-center gap-3 text-[9px] text-slate-400 font-black uppercase tracking-widest mt-2 border-t border-slate-100 pt-2">
                  <span className="flex items-center gap-1.5"><MessageCircle size={12} /> {video.comments} Comentarios</span>
                  <span className="flex items-center gap-1.5"><Heart size={12} /> {video.likes} Likes</span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <BuzonConvivencia isOpen={isBuzonOpen} onClose={() => setIsBuzonOpen(false)} userName={perfil?.full_name} />
    </div>
  );
};

export default EduStream;
