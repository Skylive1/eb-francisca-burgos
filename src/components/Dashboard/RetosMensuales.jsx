import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';
import { 
  Trophy, 
  Target, 
  Calendar, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Medal, 
  Star, 
  Award,
  ArrowRight,
  Flame,
  Zap,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useGamification } from '../../hooks/useGamification';

const RetosMensuales = () => {
  const { addXp } = useGamification();
  const [showReglas, setShowReglas] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 12, hours: 5, mins: 45, secs: 10 });
  const [respuesta, setRespuesta] = useState("");
  const [enviado, setEnviado] = useState(false);

  const [ganadores, setGanadores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [challenge, setChallenge] = useState(null);
  const [loadingWinners, setLoadingWinners] = useState(false);
  const [reglas] = useState([
    "Solo se permite una entrega por estudiante.",
    "La solución debe ser original.",
    "Se valorará la eficiencia y la lógica del código.",
    "El plazo cierra automáticamente en la fecha indicada."
  ]);

  useEffect(() => {
    const fetchChallenge = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('challenges')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (error) throw error;
        setChallenge(data);
        
        if (data && data.ends_at) {
          calcularTiempoRestante(data.ends_at);
        }

        // Si hay ganadores en el reto, traer sus perfiles
        if (data && (data.winner_1 || data.winner_2 || data.winner_3)) {
          fetchWinnersData(data);
        }
      } catch (error) {
        console.error("Error fetching challenge:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChallenge();
  }, []);

  const fetchWinnersData = async (ch) => {
    setLoadingWinners(true);
    try {
      const winnerIds = [ch.winner_1, ch.winner_2, ch.winner_3].filter(Boolean);
      if (winnerIds.length === 0) return;

      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, grade, avatar_url')
        .in('id', winnerIds);

      if (profiles) {
        const podium = [
          { rank: 1, id: ch.winner_1, label: "1er Lugar", color: "text-amber-500", icon: <Trophy className="w-8 h-8" />, xp: "500 XP", bg: "bg-amber-50/50", border: "border-amber-200" },
          { rank: 2, id: ch.winner_2, label: "2do Lugar", color: "text-slate-500", icon: <Medal className="w-6 h-6" />, xp: "300 XP", bg: "bg-slate-50/50", border: "border-slate-200" },
          { rank: 3, id: ch.winner_3, label: "3er Lugar", color: "text-orange-500", icon: <Award className="w-6 h-6" />, xp: "150 XP", bg: "bg-orange-50/50", border: "border-orange-200" }
        ].map(pos => {
          const profile = profiles.find(p => p.id === pos.id);
          return profile ? { ...pos, nombre: profile.full_name, curso: profile.grade || 'Grado S/N', avatar: profile.full_name[0] } : null;
        }).filter(Boolean);
        
        setGanadores(podium.sort((a, b) => a.rank - b.rank));
      }
    } catch (err) {
      console.error("Error fetching winners:", err);
    } finally {
      setLoadingWinners(false);
    }
  };

  const calcularTiempoRestante = (endsAt) => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = new Date(endsAt).getTime() - now;
      if (distance < 0) {
        clearInterval(timer);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(distance / (1000 * 60 * 60 * 24)),
        hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        mins: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        secs: Math.floor((distance % (1000 * 60)) / 1000)
      });
    }, 1000);
    return () => clearInterval(timer);
  };

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!respuesta.trim()) return;
    setEnviado(true);
    addXp(50); // XP por participar
  };

  return (
    <div className="space-y-10 pb-20">
      
      {/* ═══ RETO ACTIVO HERO ═══ */}
      {loading ? (
        <div className="py-20 text-center"><Loader2 className="animate-spin text-vinotinto-800 mx-auto" /></div>
      ) : !challenge ? (
        <div className="bg-white rounded-[3rem] p-20 text-center border border-gray-100 shadow-xl">
           <Trophy className="w-16 h-16 text-gray-200 mx-auto mb-6" />
           <h3 className="text-xl font-black text-gray-400 uppercase tracking-widest">No hay retos activos</h3>
           <p className="text-sm text-gray-300 mt-2">Vuelve pronto para nuevos desafíos.</p>
        </div>
      ) : (
        <Motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-[#630d16] via-[#4a0a10] to-[#300008] rounded-[3rem] p-10 overflow-hidden shadow-[0_20px_50px_rgba(99,13,22,0.3)] text-white border border-white/5"
        >
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4"></div>
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] translate-y-1/4 -translate-x-1/4"></div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="px-3 py-1 bg-gold/20 text-gold rounded-full text-[10px] font-black uppercase tracking-widest border border-gold/30">
                  <Zap className="w-3.5 h-3.5 inline mr-1" /> Reto del Mes
                </span>
                <span className="px-3 py-1 bg-white/10 text-white/70 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                  {challenge.month_year}
                </span>
              </div>
              
              <h2 className="text-4xl font-black italic tracking-tight leading-none mb-4 uppercase">
                {challenge.title}
              </h2>
              
              <p className="text-white/60 text-sm font-medium leading-relaxed mb-8 max-w-md whitespace-pre-wrap">
                {challenge.description}
              </p>

              {/* Timer */}
              <div className="grid grid-cols-4 gap-4 mb-8 max-w-sm">
                {[
                  { val: timeLeft.days, unit: "DÍAS", color: "text-amber-400", bg: "bg-amber-400/10", border: "border-amber-400/20" },
                  { val: timeLeft.hours, unit: "HRS", color: "text-sky-400", bg: "bg-sky-400/10", border: "border-sky-400/20" },
                  { val: timeLeft.mins, unit: "MINS", color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
                  { val: timeLeft.secs, unit: "SECS", color: "text-rose-400", bg: "bg-rose-400/10", border: "border-rose-400/20" }
                ].map((t, i) => (
                  <div key={i} className="text-center group">
                    <div className={`backdrop-blur-md rounded-2xl p-4 border ${t.bg} ${t.border} mb-2 shadow-lg transition-transform group-hover:scale-105 duration-300`}>
                      <span className={`text-2xl font-black tabular-nums ${t.color}`}>{t.val.toString().padStart(2, '0')}</span>
                    </div>
                    <span className="text-[9px] font-black text-white/40 tracking-widest">{t.unit}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-center">
              {!enviado ? (
                <form onSubmit={manejarEnvio} className="space-y-4 bg-white/5 backdrop-blur-lg p-8 rounded-[2rem] border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-4 h-4 text-gold" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/70">Tu Propuesta</span>
                  </div>
                  <textarea 
                    value={respuesta}
                    onChange={(e) => setRespuesta(e.target.value)}
                    placeholder="Escribe tu lógica o pega tu código aquí..."
                    className="w-full bg-white/10 border border-white/20 rounded-2xl p-5 text-sm text-white placeholder:text-white/30 outline-none focus:border-gold/50 focus:ring-4 focus:ring-gold/10 h-32 resize-none transition-all shadow-inner"
                  />
                  <button 
                    type="submit"
                    disabled={!respuesta.trim() || (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.mins === 0 && timeLeft.secs === 0)}
                    className="w-full py-4 bg-gradient-to-r from-amber-400 to-amber-600 text-vinotinto-950 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-30 disabled:pointer-events-none"
                  >
                    Enviar Solución <ArrowRight className="w-4 h-4 inline ml-2" />
                  </button>
                </form>
              ) : (
                <div className="bg-emerald-500/10 backdrop-blur-lg p-10 rounded-[2rem] border border-emerald-500/20 text-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                  <h3 className="text-xl font-black italic mb-2 text-emerald-300">¡Recibido con éxito!</h3>
                  <p className="text-sm text-white/60 font-medium">Tu respuesta está siendo evaluada por el comité académico. +50 XP por participar.</p>
                </div>
              )}
            </div>
          </div>
        </Motion.div>
      )}

      {/* ═══ MENCIÓN ESPECIAL (PODIUM) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-black text-gray-900 tracking-tight italic">Mención Especial</h3>
              <p className="text-sm text-gray-400 font-medium italic">Ganadores del mes pasado: "Desafío Newton"</p>
            </div>
            <Flame className="w-8 h-8 text-gold" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ganadores.map((g, i) => (
              <Motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className={`relative ${g.bg} rounded-3xl p-6 border-2 ${g.border} flex flex-col items-center text-center shadow-lg transition-all hover:shadow-2xl hover:-translate-y-1 ${
                  g.rank === 1 ? 'p-8 -mt-4 ring-8 ring-amber-500/5' : ''
                }`}
              >
                {g.rank === 1 && (
                  <div className="absolute -top-3 -right-3 bg-amber-500 text-white p-2.5 rounded-xl shadow-[0_5px_15px_rgba(245,158,11,0.4)]">
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black mb-4 shadow-inner ${
                  g.rank === 1 ? 'bg-amber-500 text-white shadow-amber-200' : 'bg-white text-gray-400 border border-gray-100'
                }`}>
                  {g.avatar}
                </div>
                
                <div className={`mb-3 ${g.color}`}>{g.icon}</div>
                <p className="text-sm font-black text-gray-900 leading-tight mb-1">{g.nombre}</p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">{g.curso}</p>
                <span className={`px-4 py-1.5 rounded-full text-[10px] font-black ${
                  g.rank === 1 ? 'bg-amber-500 text-white' : 'bg-white text-gray-500 border border-gray-100'
                }`}>
                  {g.xp}
                </span>
              </Motion.div>
            ))}
          </div>
        </div>

        {/* ── REGLAS ── */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-vinotinto-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <button 
            onClick={() => setShowReglas(!showReglas)}
            className="w-full flex items-center justify-between mb-4 group"
          >
            <h4 className="text-xs font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-vinotinto-800" /> Reglas del Concurso
            </h4>
            {showReglas ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          
          <AnimatePresence>
            {(showReglas || true) && ( // Mantenemos visibles pero colapsables si queremos
              <Motion.ul 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4"
              >
                {reglas.map((r, i) => (
                  <li key={i} className="flex items-start gap-3 text-[11px] font-semibold text-gray-600 leading-relaxed group">
                    <div className="mt-0.5 p-1 bg-vinotinto-50 rounded-lg group-hover:bg-vinotinto-100 transition-colors">
                      <CheckCircle2 className="w-3.5 h-3.5 text-vinotinto-600" />
                    </div>
                    {r}
                  </li>
                ))}
              </Motion.ul>
            )}
          </AnimatePresence>
        </div>
      </div>

    </div>
  );
};

export default RetosMensuales;
