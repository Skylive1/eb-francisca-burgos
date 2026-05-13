import React, { useState } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { Sparkles, HelpCircle, CheckCircle2, Loader2, Send, RotateCcw, Target, Brain, XCircle, ArrowRight, PenLine } from 'lucide-react';
import { groqService } from '../../lib/groqService';

const IAChallengeGenerator = () => {
  const [modo, setModo] = useState(null); // null = selección, 'ia', 'manual'
  const [tema, setTema] = useState("");
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [seleccionada, setSeleccionada] = useState(null);
  const [mostrarExplicacion, setMostrarExplicacion] = useState(false);

  // Manual mode state
  const [manualPregunta, setManualPregunta] = useState("");
  const [manualOpciones, setManualOpciones] = useState(["", "", "", ""]);
  const [manualCorrecta, setManualCorrecta] = useState(null);
  const [manualExplicacion, setManualExplicacion] = useState("");

  const generarReto = async (e) => {
    e?.preventDefault();
    if (!tema.trim()) return;
    setCargando(true);
    setResultado(null);
    setSeleccionada(null);
    setMostrarExplicacion(false);
    const data = await groqService.generateTeacherChallenge(tema);
    if (data) setResultado(data);
    setCargando(false);
  };

  const generarConTema = (t) => {
    setTema(t);
    setCargando(true);
    setResultado(null);
    setSeleccionada(null);
    setMostrarExplicacion(false);
    groqService.generateTeacherChallenge(t).then(data => {
      if (data) setResultado(data);
      setCargando(false);
    });
  };

  const publicarManual = (e) => {
    e.preventDefault();
    if (!manualPregunta.trim() || manualCorrecta === null || manualOpciones.some(o => !o.trim())) return;
    setResultado({
      pregunta: manualPregunta,
      opciones: manualOpciones,
      respuesta_correcta: manualCorrecta,
      explicacion: manualExplicacion || "Sin explicación proporcionada."
    });
  };

  const reiniciar = () => {
    setResultado(null);
    setSeleccionada(null);
    setMostrarExplicacion(false);
    setTema("");
    setManualPregunta("");
    setManualOpciones(["", "", "", ""]);
    setManualCorrecta(null);
    setManualExplicacion("");
  };

  const volverInicio = () => {
    reiniciar();
    setModo(null);
  };

  const seleccionarOpcion = (idx) => {
    if (seleccionada !== null) return;
    setSeleccionada(idx);
    setTimeout(() => setMostrarExplicacion(true), 500);
  };

  const esCorrecta = (idx) => idx === resultado?.respuesta_correcta;

  const updateOpcion = (idx, val) => {
    const copy = [...manualOpciones];
    copy[idx] = val;
    setManualOpciones(copy);
  };

  const sugerencias = [
    { label: "Leyes de Newton", emoji: "🍎", bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", hover: "hover:bg-blue-100" },
    { label: "Tabla Periódica", emoji: "⚗️", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700", hover: "hover:bg-emerald-100" },
    { label: "Historia de Venezuela", emoji: "🇻🇪", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", hover: "hover:bg-amber-100" },
    { label: "Ecuaciones", emoji: "📐", bg: "bg-rose-50", border: "border-rose-200", text: "text-rose-700", hover: "hover:bg-rose-100" },
    { label: "Programación", emoji: "💻", bg: "bg-violet-50", border: "border-violet-200", text: "text-violet-700", hover: "hover:bg-violet-100" },
  ];

  // ═══ SELECCIÓN DE MODO ═══
  if (modo === null && !resultado) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 -mt-8">
        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-medium mb-3">
            <span className="bg-gradient-to-r from-vinotinto-800 via-rose-500 to-gold bg-clip-text text-transparent">Hola, Profesor</span>
          </h1>
          <h2 className="text-3xl lg:text-4xl font-medium text-gray-500">
            ¿Qué reto creamos hoy?
          </h2>
        </Motion.div>

        <Motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl w-full"
        >
          {/* Card IA */}
          <button 
            onClick={() => setModo('ia')}
            className="group p-8 bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-lg hover:border-vinotinto-300 hover:shadow-2xl transition-all text-left active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-vinotinto-800 to-vinotinto-950 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <Brain className="w-7 h-7 text-gold" />
            </div>
            <h3 className="text-xl font-black text-gray-900 italic tracking-tight mb-2">Generar con IA</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Escribe un tema y la inteligencia artificial crea el reto automáticamente.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-vinotinto-800 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
              Comenzar <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>

          {/* Card Manual */}
          <button 
            onClick={() => setModo('manual')}
            className="group p-8 bg-white rounded-[2.5rem] border-2 border-gray-100 shadow-lg hover:border-gold-300 hover:shadow-2xl transition-all text-left active:scale-[0.98]"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-gold-500 to-amber-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform">
              <PenLine className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-black text-gray-900 italic tracking-tight mb-2">Escribir mi reto</h3>
            <p className="text-sm text-gray-400 font-medium leading-relaxed">
              Redacta tu propia pregunta, opciones y explicación directamente.
            </p>
            <div className="mt-4 flex items-center gap-2 text-[10px] font-black text-gold-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
              Comenzar <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        </Motion.div>
      </div>
    );
  }

  // ═══ MODO MANUAL (FORMULARIO) ═══
  if (modo === 'manual' && !resultado) {
    return (
      <div className="max-w-2xl mx-auto pb-20 pt-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-gold-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
              <PenLine className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Modo Manual</p>
              <p className="text-sm font-black text-gray-900 italic">Escribe tu propio reto</p>
            </div>
          </div>
          <button onClick={volverInicio} className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-vinotinto-50 hover:text-vinotinto-800 transition-all">
            <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Volver
          </button>
        </div>

        <form onSubmit={publicarManual} className="space-y-6">
          {/* Pregunta */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg">
            <label className="text-[10px] font-black text-vinotinto-800 uppercase tracking-widest mb-3 block">Pregunta del reto *</label>
            <textarea
              value={manualPregunta}
              onChange={e => setManualPregunta(e.target.value)}
              placeholder="Ej: ¿Cuál es la segunda ley de Newton?"
              rows={3}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none text-sm font-bold text-gray-800 focus:border-vinotinto-800 focus:bg-white transition-all placeholder:text-gray-300 resize-none"
            />
          </div>

          {/* Opciones */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg">
            <label className="text-[10px] font-black text-vinotinto-800 uppercase tracking-widest mb-4 block">Opciones de Respuesta *</label>
            <p className="text-[10px] text-gray-400 font-medium mb-4">Haz clic en el círculo para marcar la respuesta correcta.</p>
            <div className="space-y-3">
              {manualOpciones.map((op, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setManualCorrecta(idx)}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all border-2 ${
                      manualCorrecta === idx 
                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg' 
                        : 'bg-white border-gray-200 text-gray-400 hover:border-emerald-300'
                    }`}
                  >
                    {manualCorrecta === idx ? <CheckCircle2 className="w-5 h-5" /> : String.fromCharCode(65 + idx)}
                  </button>
                  <input
                    value={op}
                    onChange={e => updateOpcion(idx, e.target.value)}
                    placeholder={`Opción ${String.fromCharCode(65 + idx)}...`}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 outline-none text-sm font-bold text-gray-800 focus:border-vinotinto-800 focus:bg-white transition-all placeholder:text-gray-300"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Explicación */}
          <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-lg">
            <label className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3 block">Explicación (opcional)</label>
            <textarea
              value={manualExplicacion}
              onChange={e => setManualExplicacion(e.target.value)}
              placeholder="¿Por qué es esa la respuesta correcta?"
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-5 outline-none text-sm font-medium text-gray-700 focus:border-emerald-500 focus:bg-white transition-all placeholder:text-gray-300 resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={!manualPregunta.trim() || manualCorrecta === null || manualOpciones.some(o => !o.trim())}
            className="w-full py-5 bg-gradient-to-r from-vinotinto-800 to-vinotinto-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] hover:shadow-2xl disabled:opacity-40"
          >
            <CheckCircle2 className="w-4 h-4" /> Previsualizar Reto
          </button>
        </form>
      </div>
    );
  }

  // ═══ MODO IA (INPUT) ═══
  if (modo === 'ia' && !resultado && !cargando) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 -mt-8">
        <Motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
          <h1 className="text-5xl lg:text-6xl font-medium mb-3">
            <span className="bg-gradient-to-r from-vinotinto-800 via-rose-500 to-gold bg-clip-text text-transparent">Generador IA</span>
          </h1>
          <h2 className="text-3xl lg:text-4xl font-medium text-gray-500">
            Escribe un tema y la IA hará el resto
          </h2>
        </Motion.div>

        <Motion.form 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          onSubmit={generarReto}
          className="w-full max-w-2xl mb-8"
        >
          <div className="bg-white rounded-[2rem] border-2 border-gray-200 shadow-xl overflow-hidden hover:border-vinotinto-300 focus-within:border-vinotinto-800 focus-within:shadow-2xl transition-all">
            <input 
              type="text"
              value={tema}
              onChange={e => setTema(e.target.value)}
              placeholder="Escribe un tema para generar un reto..."
              className="w-full bg-transparent px-8 pt-6 pb-2 text-gray-900 text-base font-medium outline-none placeholder:text-gray-400"
            />
            <div className="flex items-center justify-between px-6 pb-4 pt-1">
              <button type="button" onClick={volverInicio} className="text-[11px] text-gray-400 font-bold uppercase tracking-widest hover:text-vinotinto-800 transition-colors">
                ← Volver
              </button>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">Llama 3.3</span>
                <button 
                  type="submit"
                  disabled={!tema.trim()}
                  className="p-2.5 bg-vinotinto-800 text-white rounded-full transition-all hover:bg-vinotinto-950 disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
                >
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </Motion.form>

        <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="flex flex-wrap justify-center gap-3">
          {sugerencias.map(s => (
            <button
              key={s.label}
              onClick={() => generarConTema(s.label)}
              className={`flex items-center gap-2.5 px-5 py-3 ${s.bg} ${s.border} border rounded-full text-sm font-bold ${s.text} ${s.hover} transition-all active:scale-95 shadow-sm`}
            >
              <span>{s.emoji}</span> {s.label}
            </button>
          ))}
        </Motion.div>
      </div>
    );
  }

  // ═══ LOADING ═══
  if (cargando) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center">
        <div className="relative w-20 h-20 mb-8">
          <div className="absolute inset-0 bg-vinotinto-500/20 rounded-full animate-ping"></div>
          <div className="relative w-20 h-20 bg-vinotinto-50 rounded-full flex items-center justify-center border border-vinotinto-100">
            <Brain className="w-10 h-10 text-vinotinto-800 animate-pulse" />
          </div>
        </div>
        <p className="text-lg font-medium text-gray-700 mb-2">Generando reto...</p>
        <p className="text-sm text-gray-400">Tema: <span className="text-vinotinto-800 font-semibold">{tema}</span></p>
      </div>
    );
  }

  // ═══ RESULTADO (PREVIEW) ═══
  return (
    <div className="max-w-3xl mx-auto pb-20 pt-4">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-vinotinto-800 to-vinotinto-950 rounded-xl flex items-center justify-center shadow-lg">
            <Target className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Vista previa del reto</p>
            <p className="text-sm font-bold text-gray-800 italic">{modo === 'ia' ? tema : 'Reto manual'}</p>
          </div>
        </div>
        <button 
          onClick={volverInicio}
          className="flex items-center gap-2 px-5 py-3 bg-gray-100 text-gray-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-vinotinto-50 hover:text-vinotinto-800 transition-all active:scale-95"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Nuevo Reto
        </button>
      </div>

      {/* Pregunta */}
      <Motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-xl mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-vinotinto-800 to-gold"></div>
        <p className="text-[10px] font-black text-vinotinto-800 uppercase tracking-widest mb-5 flex items-center gap-2">
          <HelpCircle className="w-4 h-4" /> Pregunta
        </p>
        <h3 className="text-2xl font-black text-gray-900 leading-snug tracking-tight">
          {resultado.pregunta}
        </h3>
      </Motion.div>

      {/* Opciones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {resultado.opciones?.map((op, idx) => {
          const selected = seleccionada === idx;
          const correct = esCorrecta(idx);
          const revealed = seleccionada !== null;
          
          let style = "bg-white border-gray-100 hover:border-vinotinto-300 hover:shadow-md cursor-pointer";
          let iconBg = "bg-gray-100 text-gray-500";
          let iconContent = String.fromCharCode(65 + idx);
          
          if (revealed) {
            if (correct) {
              style = "bg-emerald-50 border-emerald-300 ring-2 ring-emerald-200 shadow-lg";
              iconBg = "bg-emerald-500 text-white";
              iconContent = null;
            } else if (selected && !correct) {
              style = "bg-red-50 border-red-300 ring-2 ring-red-200";
              iconBg = "bg-red-500 text-white";
              iconContent = null;
            } else {
              style = "bg-gray-50/50 border-gray-100 opacity-50";
            }
          }

          return (
            <Motion.button
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.08 }}
              onClick={() => seleccionarOpcion(idx)}
              whileTap={seleccionada === null ? { scale: 0.97 } : {}}
              className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${style}`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0 transition-all ${iconBg}`}>
                  {iconContent || (correct ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />)}
                </div>
                <p className={`text-sm font-bold leading-relaxed pt-2 ${revealed && correct ? 'text-emerald-900' : revealed && selected && !correct ? 'text-red-900' : 'text-gray-700'}`}>{op}</p>
              </div>
            </Motion.button>
          );
        })}
      </div>

      {/* Explicación */}
      <AnimatePresence>
        {mostrarExplicacion && (
          <Motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl mb-6 relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-gold"></div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-4 h-4" /> Explicación
            </p>
            <p className="text-sm text-gray-700 font-medium leading-relaxed">
              {resultado.explicacion}
            </p>
          </Motion.div>
        )}
      </AnimatePresence>

      {/* Acciones */}
      <div className="flex gap-4">
        <button className="flex-1 py-5 bg-gradient-to-r from-vinotinto-800 to-vinotinto-950 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] hover:shadow-2xl">
          <Send className="w-4 h-4" /> Publicar en el Vlog
        </button>
        <button 
          onClick={volverInicio}
          className="py-5 px-6 bg-white border border-gray-200 text-gray-400 rounded-2xl hover:text-vinotinto-800 hover:border-vinotinto-200 transition-all active:scale-95"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default IAChallengeGenerator;
