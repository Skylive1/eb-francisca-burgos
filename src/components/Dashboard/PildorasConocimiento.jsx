import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Lightbulb, Clock, ChevronRight, CheckCircle2, BookOpen, Code, Atom, History, RotateCcw, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useGamification } from '../../hooks/useGamification';

  // Las pildoras hardcoded se eliminan para usar las de la base de datos

const PildorasConocimiento = () => {
  const { addXp } = useGamification();
  const [flipped, setFlipped] = useState({});
  const [completadas, setCompletadas] = useState({});
  const [filtro, setFiltro] = useState("todas");
  const [pildoras, setPildoras] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPills = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('pills_knowledge')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        const transformed = (data || []).map(p => {
          return {
            ...p,
            titulo: p.title,
            materia: p.category || 'General',
            emoji: '💡',
            color: 'from-vinotinto-800 to-black',
            colorLight: 'bg-vinotinto-50 text-vinotinto-800 border-vinotinto-100',
            tiempo: '60s',
            frente: p.front_content || 'Sin descripción',
            puntos: p.back_content ? [p.back_content] : []
          };
        });
        setPildoras(transformed);
      } catch (error) {
        console.error("Error fetching pills:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPills();
  }, []);

  const toggleFlip = (id) => {
    setFlipped(prev => ({ ...prev, [id]: !prev[id] }));
    if (!completadas[id]) {
      setCompletadas(prev => ({ ...prev, [id]: true }));
      addXp(10);
    }
  };

  const totalCompletadas = Object.keys(completadas).length;
  const filtradas = filtro === "todas" ? pildoras : pildoras.filter(p => p.materia === filtro);
  const materias = ["todas", ...new Set(pildoras.map(p => p.materia))];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-violet-50 text-violet-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-violet-100">
              <Lightbulb className="w-3 h-3 inline mr-1" /> Micro-Learning
            </span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">Píldoras de Conocimiento</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Conceptos clave en 60 segundos. Toca una tarjeta para aprender.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs font-bold border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5 inline mr-1.5" />
            {totalCompletadas}/{pildoras.length} completadas
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {materias.map(m => (
          <button
            key={m}
            onClick={() => setFiltro(m)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              filtro === m ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {m === "todas" ? "Todas" : m}
          </button>
        ))}
      </div>

      {/* Grid de Píldoras */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
           <div className="col-span-full py-20 text-center"><Loader2 className="animate-spin text-vinotinto-800 mx-auto" /></div>
        ) : filtradas.length === 0 ? (
           <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No hay píldoras disponibles</div>
        ) : filtradas.map((p, i) => (
          <Motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="perspective-1000"
          >
            <div
              onClick={() => toggleFlip(p.id)}
              className={`relative w-full min-h-[260px] cursor-pointer transition-transform duration-500 transform-style-3d ${flipped[p.id] ? 'rotate-y-180' : ''}`}
              style={{ transformStyle: 'preserve-3d', transform: flipped[p.id] ? 'rotateY(180deg)' : 'rotateY(0deg)', transition: 'transform 0.5s' }}
              role="button"
              aria-label={`Píldora: ${p.titulo}. ${flipped[p.id] ? 'Mostrando detalle' : 'Toca para ver más'}`}
            >
              {/* FRENTE */}
              <div
                className={`absolute inset-0 rounded-2xl p-6 flex flex-col justify-between border shadow-lg overflow-hidden ${completadas[p.id] ? 'border-emerald-200' : 'border-gray-100'} bg-white`}
                style={{ backfaceVisibility: 'hidden' }}
              >
                {completadas[p.id] && (
                  <div className="absolute top-4 right-4">
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold border ${p.colorLight}`}>{p.materia}</span>
                    <span className="text-[10px] text-gray-300 font-bold flex items-center gap-1"><Clock className="w-3 h-3" /> {p.tiempo}</span>
                  </div>
                  <div className="text-3xl mb-3">{p.emoji}</div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight leading-tight mb-2">{p.titulo}</h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed">{p.frente}</p>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-vinotinto-800 uppercase tracking-widest mt-4">
                  <RotateCcw className="w-3 h-3" /> Toca para ver más
                </div>
              </div>

              {/* REVERSO */}
              <div
                className={`absolute inset-0 rounded-2xl p-6 flex flex-col justify-between bg-gradient-to-br ${p.color} text-white shadow-xl`}
                style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
              >
                <div className="flex-1 overflow-y-auto pr-2 scrollbar-hide">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl">{p.emoji}</span>
                    <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-bold backdrop-blur-sm">{p.materia}</span>
                  </div>
                  <h3 className="text-base font-black tracking-tight mb-4">{p.titulo}</h3>
                  <div className="space-y-3">
                    {p.puntos.length > 0 ? (
                      <ul className="space-y-2.5">
                        {p.puntos.map((punto, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] font-medium leading-relaxed text-white/90">
                            <Sparkles className="w-3 h-3 mt-0.5 shrink-0 text-white/60" />
                            {punto}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-[11px] font-medium leading-relaxed text-white/90 italic">Sin contenido definido</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-white/50 uppercase tracking-widest mt-4">
                  <RotateCcw className="w-3 h-3" /> Toca para volver
                </div>
              </div>
            </div>
          </Motion.div>
        ))}
      </div>
    </div>
  );
};

export default PildorasConocimiento;
