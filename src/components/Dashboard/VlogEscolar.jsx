import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  Play, 
  ImageIcon, 
  Sparkles, 
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Users,
  BookOpen,
  Compass,
  Atom,
  Palette,
  CheckCircle2,
  GraduationCap,
  Clock,
  Eye,
  TrendingUp,
  Flame,
  Send,
  ChevronRight,
  MoreHorizontal,
  ThumbsUp,
  Zap,
  LayoutDashboard,
  Video,
  Trophy,
  Lightbulb,
  ArrowRight,
  Plus,
  Trash2,
  Edit2,
  Save,
  Loader2,
  X as CloseIcon
} from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';
import XPNotification from './XPNotification';

// Import sub-components
import PildorasConocimiento from './PildorasConocimiento';
import RetosMensuales from './RetosMensuales';
import VideotecaWebinars from './VideotecaWebinars';

const VlogEscolar = ({ rol }) => {
  const { addXp } = useGamification();
  
  // Navigation State
  const [seccionActiva, setSeccionActiva] = useState("feed");
  const [feedVideos, setFeedVideos] = useState([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  
  // States for Feed (Tab 1)
  const [retoRespuesta, setRetoRespuesta] = useState("");
  const [retoResuelto, setRetoResuelto] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [toast, setToast] = useState({ show: false, message: "", amount: 0 });

  // Utility to extract video embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    
    // YouTube
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:.*v\/|.*u\/\w\/|embed\/|.*v=))([\w-]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}`;
    
    // Vimeo
    const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)(?:$|\/|\?)/);
    if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    
    // TikTok
    const tiktokMatch = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
    if (tiktokMatch) return `https://www.tiktok.com/embed/v2/${tiktokMatch[1]}`;
    
    return null;
  };
  const [feedTab, setFeedTab] = useState("todos");

  // Admin CMS States
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    thumbnail_url: '',
    video_url: '',
    type: 'vlog',
    tag: 'Institucional',
    duration: '5:00'
  });

  const fetchVideos = async () => {
    setLoadingVideos(true);
    try {
      const { data, error } = await supabase
        .from('vlog_posts')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setFeedVideos(data || []);
    } catch (error) {
      console.error("Error fetching vlog videos:", error);
    } finally {
      setLoadingVideos(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);
  
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(124);
  const [saved, setSaved] = useState(false);
  const [comentarios, setComentarios] = useState([
    { id: 1, usuario: "Mateo Pérez", texto: "¡Increíble el motor JS! ¿Subirán el código a GitHub?", tiempo: "hace 2h", inicial: "M", color: "bg-blue-500" },
    { id: 2, usuario: "Profe Elena", texto: "Excelente iniciativa de 5to año. Muy claro el video.", tiempo: "hace 1h", inicial: "E", color: "bg-vinotinto-800" }
  ]);
  const [nuevoComentario, setNuevoComentario] = useState("");
  const [showComments, setShowComments] = useState(false);

  // Constants
  const tabsPrincipales = [
    { id: "feed", label: "Comunidad", icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: "pildoras", label: "Píldoras", icon: <Lightbulb className="w-4 h-4" /> },
    { id: "retos", label: "Retos", icon: <Trophy className="w-4 h-4" /> },
    { id: "videoteca", label: "Videoteca", icon: <Video className="w-4 h-4" /> },
  ];

  const feedTabs = [
    { id: "todos", label: "Para ti" },
    { id: "trending", label: "Trending" },
    { id: "retos", label: "Retos" },
    { id: "robotica", label: "Robótica" },
    { id: "arte", label: "Arte" },
    { id: "literatura", label: "Literatura" },
  ];

  // Las constantes feedVideos iniciales se eliminan porque ahora vienen de Supabase

  // Handlers
  const manejarLike = () => {
    setLiked(!liked);
    setLikesCount(prev => liked ? prev - 1 : prev + 1);
    if (!liked) { addXp(5); }
  };

  const agregarComentario = (e) => {
    e.preventDefault();
    if (!nuevoComentario.trim()) return;
    const comment = { id: Date.now(), usuario: "Tú", texto: nuevoComentario, tiempo: "ahora", inicial: "T", color: "bg-gold-600" };
    setComentarios([comment, ...comentarios]);
    setNuevoComentario("");
    addXp(20);
    setToast({ show: true, message: "¡Aporte valioso!", amount: 20 });
  };

  const handleSubmitAdmin = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { 
        title: formData.title, 
        description: formData.description, 
        thumbnail_url: formData.thumbnail_url, 
        video_url: formData.video_url,
        category: formData.tag || 'todos'
      };
      let error;
      if (editingItem) {
        ({ error } = await supabase.from('vlog_posts').update(payload).eq('id', editingItem.id));
      } else {
        ({ error } = await supabase.from('vlog_posts').insert([payload]));
      }
      if (error) throw error;
      setShowModal(false);
      setEditingItem(null);
      setFormData({ title: '', description: '', thumbnail_url: '', video_url: '', type: 'vlog', tag: 'Institucional', duration: '5:00' });
      fetchVideos();
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const eliminarVideo = async (id) => {
    if (!window.confirm("¿Eliminar este video del Vlog?")) return;
    try {
      const { error } = await supabase.from('vlog_posts').delete().eq('id', id);
      if (error) throw error;
      fetchVideos();
    } catch (error) {
      alert("Error: " + error.message);
    }
  };
  // ═══ CUADRO DE HONOR - DATOS REALES ═══
  const CuadroDeHonor = () => {
    const [topStudents, setTopStudents] = useState([]);
    const [loadingHonor, setLoadingHonor] = useState(true);

    useEffect(() => {
      const fetchTopStudents = async () => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, xp, level, grade')
            .eq('role', 'student')
            .gt('xp', 0)
            .order('xp', { ascending: false })
            .limit(5);
          
          if (error) throw error;
          setTopStudents(data || []);
        } catch (err) {
          console.error('Error fetching honor board:', err);
        } finally {
          setLoadingHonor(false);
        }
      };
      fetchTopStudents();
    }, []);

    const getMedal = (i) => ['🥇', '🥈', '🥉'][i] || `#${i + 1}`;
    const getGradient = (i) => [
      'from-amber-400 to-yellow-500',
      'from-gray-300 to-gray-400', 
      'from-orange-400 to-amber-600'
    ][i] || 'from-slate-400 to-slate-500';

    return (
      <div className="bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 rounded-[2.5rem] p-8 border-2 border-amber-200/50 shadow-xl shadow-amber-100/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-gold/20 to-transparent rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-amber-200/30 to-transparent rounded-full blur-2xl translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="relative z-10">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200/50 rotate-3">
              <Trophy className="w-7 h-7 text-white drop-shadow-sm" />
            </div>
            <h4 className="text-sm font-black text-amber-900 uppercase tracking-[0.15em]">Cuadro de Honor</h4>
            <p className="text-[9px] font-bold text-amber-600/60 uppercase tracking-widest mt-1">Estudiantes Destacados</p>
          </div>
          
          <div className="space-y-3">
            {loadingHonor ? (
              <div className="py-10 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-amber-400 mx-auto" />
              </div>
            ) : topStudents.length === 0 ? (
              <div className="py-8 text-center">
                <Trophy className="w-10 h-10 text-amber-200 mx-auto mb-3" />
                <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">¡Sé el primero en ganar XP!</p>
                <p className="text-[9px] text-amber-400/60 mt-1">Completa píldoras y retos para aparecer aquí</p>
              </div>
            ) : topStudents.map((student, i) => (
              <div 
                key={student.id}
                className={`backdrop-blur-sm rounded-2xl border group hover:shadow-md transition-all ${
                  i === 0 
                    ? 'bg-white/80 p-5 border-amber-200/50 shadow-sm relative overflow-hidden' 
                    : 'bg-white/60 p-4 border-gray-200/30'
                }`}
              >
                {i === 0 && <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl from-gold/10 to-transparent"></div>}
                <div className="flex items-center gap-4 relative z-10">
                  <div className="relative">
                    {student.avatar_url ? (
                      <img 
                        src={student.avatar_url} 
                        alt="" 
                        className={`${i === 0 ? 'w-12 h-12' : 'w-10 h-10'} rounded-xl object-cover shadow-md group-hover:scale-110 transition-transform`} 
                      />
                    ) : (
                      <div className={`${i === 0 ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs'} bg-gradient-to-br ${getGradient(i)} rounded-xl flex items-center justify-center text-white font-black shadow-md group-hover:scale-110 transition-transform`}>
                        {student.full_name?.charAt(0) || '?'}
                      </div>
                    )}
                    {i === 0 && <span className="absolute -top-2 -right-2 text-lg">👑</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-black tracking-tight truncate ${i === 0 ? 'text-sm text-amber-900' : 'text-xs text-gray-800'}`}>
                      {student.full_name || 'Estudiante'}
                    </p>
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${i === 0 ? 'text-amber-600/70' : 'text-gray-400'}`}>
                      {(student.xp || 0).toLocaleString()} XP {i === 0 ? '• 1er Lugar' : `• Nivel ${student.level || 1}`}
                    </p>
                  </div>
                  <span className={i < 3 ? 'text-xl' : 'text-xs font-black text-gray-300'}>{getMedal(i)}</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-5 border-t border-amber-200/50 text-center">
            <p className="text-[8px] font-black text-amber-600/40 uppercase tracking-[0.2em]">Ranking en tiempo real</p>
          </div>
        </div>
      </div>
    );
  };

  // Render Sub-sections
  const renderFeed = () => (
    <div className="flex flex-col lg:flex-row gap-8">
      {/* ── COLUMNA PRINCIPAL (FEED) ── */}
      <div className="flex-1 space-y-8">
        {/* Mini Feed Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
          {feedTabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setFeedTab(tab.id)}
              className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                feedTab === tab.id 
                  ? 'bg-gray-900 text-white shadow-xl translate-y-[-2px]' 
                  : 'bg-white text-gray-400 border border-gray-100 hover:border-vinotinto-200 hover:text-vinotinto-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8">
          {loadingVideos ? (
             <div className="py-20 text-center"><Video className="animate-spin text-vinotinto-800 mx-auto" /></div>
          ) : feedVideos.length === 0 ? (
             <div className="py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No hay videos disponibles en el Vlog</div>
          ) : feedVideos.map((video, i) => (
            <Motion.article
              key={video.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: "easeOut" }}
              className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 overflow-hidden group"
            >
              {/* Header con glassmorphism sutil */}
              <div className="flex items-center justify-between px-7 py-5">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className={`w-12 h-12 ${video.authorColor} rounded-2xl flex items-center justify-center text-white text-xs font-black shadow-lg shadow-gray-200 transform group-hover:rotate-6 transition-transform`}>
                      {video.authorInitial}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 tracking-tight">Institución</h4>
                    <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                      <span>Vlog Oficial</span>
                      <span className="w-1 h-1 bg-gray-200 rounded-full"></span>
                      <span>{new Date(video.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                   {rol === 'admin' && (
                     <div className="flex gap-2">
                        <button 
                          onClick={() => { setEditingItem(video); setFormData(video); setShowModal(true); }}
                          className="p-2 bg-gray-50 text-gray-400 hover:text-vinotinto-800 hover:bg-vinotinto-50 rounded-xl transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => eliminarVideo(video.id)}
                          className="p-2 bg-gray-50 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                     </div>
                   )}
                   <button className="p-2 text-gray-300 hover:text-vinotinto-800 hover:bg-vinotinto-50 rounded-xl transition-all">
                    <MoreHorizontal className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Media Container (Video, Photo or Empty for text-only) */}
              {(video.video_url || video.thumbnail_url) && (
                <div className="relative mx-4 rounded-[2rem] overflow-hidden aspect-video bg-gray-900 group/video">
                  {video.thumbnail_url && (
                    <img src={video.thumbnail_url} alt="" className={`absolute inset-0 w-full h-full object-cover ${video.video_url ? 'opacity-60' : 'opacity-100'} group-hover:scale-105 transition-transform duration-700`} />
                  )}
                  
                  {!video.thumbnail_url && video.video_url && (
                    <div className="absolute inset-0 bg-gradient-to-br from-vinotinto-900 to-black opacity-80 mix-blend-multiply transition-transform duration-700"></div>
                  )}

                  {video.video_url && (
                    <div className="absolute inset-0">
                      {getEmbedUrl(video.video_url) ? (
                        <iframe 
                          src={getEmbedUrl(video.video_url)}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          title={video.title}
                        ></iframe>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <a href={video.video_url} target="_blank" rel="noopener noreferrer" className="w-20 h-20 bg-white/10 backdrop-blur-2xl rounded-full flex items-center justify-center border border-white/20 shadow-2xl group-hover/video:scale-110 group-hover/video:bg-white/20 transition-all duration-500">
                            <Play className="w-8 h-8 text-white ml-1 filter drop-shadow-md" fill="white" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="absolute top-4 left-4">
                    <span className="px-4 py-2 bg-white/10 backdrop-blur-md text-white rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/20">
                      {video.video_url ? (video.tag || 'Video') : (video.thumbnail_url ? 'Foto' : 'Info')}
                    </span>
                  </div>

                  {video.video_url && (
                    <div className="absolute bottom-4 right-4">
                      <div className="px-3 py-1.5 bg-black/40 backdrop-blur-md text-white rounded-xl text-[10px] font-bold flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {video.duration || '5:00'}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Contenido descriptivo */}
              <div className="px-7 pt-6 pb-2">
                <h3 className="text-xl font-black text-gray-900 leading-tight mb-2 group-hover:text-vinotinto-800 transition-colors">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-4">
                  {video.description}
                </p>
              </div>
              
              <div className="flex items-center justify-between px-7 py-5 mt-2">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={video.id === 1 ? manejarLike : undefined} 
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black transition-all active:scale-95 ${
                      video.id === 1 && liked ? 'text-rose-600 bg-rose-50 border border-rose-100 shadow-sm' : 'text-gray-400 hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <Heart className={`w-4.5 h-4.5 ${video.id === 1 && liked ? 'fill-current' : ''}`} /> 
                    {video.id === 1 ? likesCount : video.likes}
                  </button>
                  <button 
                    onClick={() => setShowComments(!showComments)} 
                    className="flex items-center gap-2 px-5 py-2.5 text-gray-400 hover:bg-gray-50 rounded-2xl text-xs font-black transition-all active:scale-95"
                  >
                    <MessageCircle className="w-4.5 h-4.5" /> 
                    {video.id === 1 ? comentarios.length : video.comments}
                  </button>
                  <button className="flex items-center gap-2 px-5 py-2.5 text-gray-400 hover:bg-gray-50 rounded-2xl text-xs font-black transition-all active:scale-95">
                    <Share2 className="w-4.5 h-4.5" />
                  </button>
                </div>
                <button 
                  onClick={() => setSaved(!saved)}
                  className={`p-3 rounded-2xl transition-all active:scale-95 ${
                    saved ? 'text-vinotinto-800 bg-vinotinto-50 border border-vinotinto-100' : 'text-gray-300 hover:text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${saved ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Sección de Comentarios Expandible */}
              <AnimatePresence>
                {video.id === 1 && showComments && (
                  <Motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-gray-50 bg-gray-50/30"
                  >
                    <div className="px-7 py-8 space-y-6">
                      <form onSubmit={agregarComentario} className="flex gap-4">
                        <div className="w-10 h-10 bg-gold-500 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-lg shadow-gold-200">T</div>
                        <div className="flex-1 relative">
                          <input 
                            type="text" value={nuevoComentario} onChange={e => setNuevoComentario(e.target.value)}
                            placeholder="Añade un comentario constructivo..." 
                            className="w-full bg-white border border-gray-100 px-6 py-3 rounded-2xl text-sm font-medium outline-none focus:border-vinotinto-300 focus:shadow-lg focus:shadow-vinotinto-100 transition-all placeholder:text-gray-300"
                          />
                          <button type="submit" disabled={!nuevoComentario.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-vinotinto-800 text-white rounded-xl disabled:opacity-30 active:scale-95 transition-all">
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </form>
                      
                      <div className="space-y-5 pl-4 border-l-2 border-gray-100">
                        {comentarios.map(c => (
                          <div key={c.id} className="flex gap-4">
                            <div className={`w-9 h-9 rounded-xl ${c.color} text-white flex items-center justify-center text-[10px] font-black shrink-0`}>{c.inicial}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-[11px] font-black text-gray-900">{c.usuario}</span>
                                <span className="text-[9px] text-gray-300 font-bold uppercase">{c.tiempo}</span>
                              </div>
                              <p className="text-xs text-gray-600 font-medium bg-white p-3 rounded-2xl rounded-tl-none border border-gray-50 shadow-sm leading-relaxed">{c.texto}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Motion.div>
                )}
              </AnimatePresence>
            </Motion.article>
          ))}
        </div>
      </div>

      {/* ── BARRA LATERAL (WIDGETS) ── */}
      <aside className="w-full lg:w-[340px] space-y-8">
        
        {/* Widget: Cuadro de Honor - DATOS REALES */}
        <CuadroDeHonor />

        {/* Widget: Sugerencia Píldora */}
        <div className="bg-vinotinto-50 rounded-[2.5rem] p-8 border border-vinotinto-100">
          <div className="flex items-center gap-2 mb-4">
             <Lightbulb className="w-5 h-5 text-vinotinto-800" />
             <h4 className="text-xs font-black text-vinotinto-900 uppercase tracking-widest">¿Sabías qué?</h4>
          </div>
          <p className="text-xs text-vinotinto-800/70 font-medium leading-relaxed mb-6">
            "Las variables en JavaScript se pueden declarar con 'let' o 'const'. ¿Sabes cuál usar por defecto?"
          </p>
          <button 
            onClick={() => setSeccionActiva("pildoras")}
            className="flex items-center gap-2 text-[10px] font-black text-vinotinto-800 uppercase tracking-widest group"
          >
            Aprender más <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-all" />
          </button>
        </div>

      </aside>
    </div>
  );

  return (
    <div className="w-full relative z-10 pb-20">
      
      {/* ═══ HEADER CABECERA (Solo se muestra fuera del Admin) ═══ */}
      {rol !== 'admin' && (
        <div className="mb-10">
          <h2 className="text-4xl lg:text-5xl font-black text-gray-900 leading-[0.85] tracking-tighter italic mb-4">
             VLOG <span className="text-vinotinto-800">&</span><br />
             <span className="text-vinotinto-800 uppercase">Academia Digital</span>
          </h2>
          <p className="text-sm text-gray-400 font-medium max-w-md">Tu espacio interactivo de aprendizaje y comunidad en la F.E.B.D.</p>
        </div>
      )}

      {rol === 'admin' && (
        <div className="flex justify-end mb-8">
           <button 
              onClick={() => { setEditingItem(null); setFormData({ title: '', description: '', thumbnail_url: '', video_url: '', type: 'vlog', tag: 'Aviso', duration: '' }); setShowModal(true); }}
              className="flex items-center gap-3 px-8 py-4 bg-vinotinto-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-vinotinto-950 transition-all shadow-xl shadow-vinotinto-100 active:scale-95 group"
            >
              <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
              Nueva Publicación (Vlog/Foto/Texto)
            </button>
        </div>
      )}

      {/* ═══ NAVIGATION TABS (INTEGRATED) ═══ */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide mb-12 border-b border-gray-100 pb-4">
        {tabsPrincipales.map(tab => (
          <button
            key={tab.id}
            onClick={() => setSeccionActiva(tab.id)}
            aria-label={`Ir a sección ${tab.label}`}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition-all whitespace-nowrap active:scale-95 ${
              seccionActiva === tab.id 
                ? 'bg-vinotinto-800 text-gold shadow-lg shadow-vinotinto-900/20' 
                : 'bg-white text-gray-400 hover:text-vinotinto-800 hover:bg-vinotinto-50 border border-gray-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ═══ MAIN CONTENT RENDER ═══ */}
      <AnimatePresence mode="wait">
        <Motion.div
          key={seccionActiva}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          {seccionActiva === "feed" && renderFeed()}
          {seccionActiva === "pildoras" && <PildorasConocimiento />}
          {seccionActiva === "retos" && <RetosMensuales />}
          {seccionActiva === "videoteca" && <VideotecaWebinars />}
        </Motion.div>
      </AnimatePresence>

      <XPNotification {...toast} onComplete={() => setToast({ ...toast, show: false })} />

      {/* ═══ MODAL ADMINISTRATIVO ═══ */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <Motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
               <form onSubmit={handleSubmitAdmin} className="p-10 space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-black text-gray-900 italic uppercase">
                      {editingItem ? 'Editar' : 'Nuevo'} Vlog
                    </h3>
                    <button type="button" onClick={() => setShowModal(false)} className="p-2 text-gray-400 hover:text-gray-900"><CloseIcon /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Título del Video</label>
                      <input 
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        placeholder="Ej: Gran Final de Robótica"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm text-gray-900 outline-none focus:border-vinotinto-300 focus:bg-white transition-all" 
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Descripción</label>
                      <textarea 
                        rows={3}
                        required
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="Describe de qué trata este video..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm text-gray-900 outline-none focus:border-vinotinto-300 focus:bg-white transition-all resize-none" 
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Miniatura (URL)</label>
                      <input 
                        value={formData.thumbnail_url}
                        onChange={(e) => setFormData({...formData, thumbnail_url: e.target.value})}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm text-gray-900 outline-none focus:border-vinotinto-300 focus:bg-white transition-all" 
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Video URL (Opcional)</label>
                      <input 
                        value={formData.video_url}
                        onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                        placeholder="Solo si es video (YouTube/Vimeo)"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm text-gray-900 outline-none focus:border-vinotinto-300 focus:bg-white transition-all" 
                      />
                    </div>

                       {activeTab === 'vlog' && (
                      <div>
                        <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">Categoría</label>
                        <select 
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm text-white outline-none focus:border-vinotinto-500"
                        >
                          <option value="todos" className="bg-gray-900">General</option>
                          <option value="robotica" className="bg-gray-900">Robótica</option>
                          <option value="arte" className="bg-gray-900">Arte</option>
                          <option value="literatura" className="bg-gray-900">Literatura</option>
                        </select>
                      </div>
                    )}

                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Etiqueta (Tag)</label>
                      <input 
                        value={formData.tag}
                        onChange={(e) => setFormData({...formData, tag: e.target.value})}
                        placeholder="Ej: Robótica"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm text-gray-900 outline-none focus:border-vinotinto-300 focus:bg-white transition-all" 
                      />
                    </div>

                    <div>
                      <label className="text-[9px] font-black text-gray-400 uppercase tracking-widest ml-1">Duración</label>
                      <input 
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        placeholder="Ej: 3:45"
                        className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm text-gray-900 outline-none focus:border-vinotinto-300 focus:bg-white transition-all" 
                      />
                    </div>
                  </div>

                  <button 
                    type="submit" 
                    disabled={submitting}
                    className="w-full py-5 bg-vinotinto-800 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:bg-vinotinto-950 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <Save size={18} />}
                    {editingItem ? 'Guardar Cambios' : 'Publicar en el Vlog'}
                  </button>
               </form>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VlogEscolar;
