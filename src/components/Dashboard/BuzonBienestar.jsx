import React, { useState, useRef, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Heart, 
  Send, 
  User, 
  ShieldCheck, 
  MessageSquare, 
  AlertTriangle, 
  Info, 
  Sparkles,
  Wind,
  Smile,
  X,
  EyeOff,
  Bot
} from 'lucide-react';

import Groq from "groq-sdk";
import { supabase } from '../../lib/supabaseClient';

const BuzonBienestar = () => {
  const [mensajes, setMensajes] = useState([
    { 
      id: 1, 
      remitente: 'ai', 
      texto: 'Hola, soy tu Asistente de Apoyo Psicológico. Este es un espacio seguro para ti. ¿Cómo te sientes hoy? Puedes hablar conmigo de forma anónima si lo prefieres.', 
      tiempo: 'Ahora' 
    }
  ]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [esAnonimo, setEsAnonimo] = useState(false);
  const [estaEscribiendo, setEstaEscribiendo] = useState(false);
  const scrollRef = useRef(null);

  // Inicializar Groq
  const groq = new Groq({
    apiKey: import.meta.env.VITE_GROQ_API_KEY,
    dangerouslyAllowBrowser: true // Solo para propósitos de desarrollo/demo
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, estaEscribiendo]);

  // Generación de respuesta Real con Llama 3.3 (Groq)
  const generarRespuestaIA = async (mensajeUsuario) => {
    setEstaEscribiendo(true);
    
    try {
      const chatCompletion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: `Actúa como un Asistente de Apoyo Psicológico y Convivencia para el Colegio. Tu función es recibir mensajes del 'Buzón de Bienestar' y responder de forma empática, segura y profesional.
            
            Tus reglas de oro son:
            1. Validación Emocional: Siempre comienza validando los sentimientos del estudiante.
            2. Detección de Riesgo: Si el mensaje contiene indicios de violencia física, acoso (bullying) grave o pensamientos de autolesión, tu respuesta debe ser breve y asegurar que un especialista humano intervendrá de inmediato.
            3. Confidencialidad: Recuérdale al estudiante que este es un canal seguro. Si eligió el modo anónimo, asegúrale que su identidad está protegida.
            4. No Diagnosticar: No des diagnósticos médicos. Da consejos de respiración, calma o escucha activa, y motiva siempre a hablar con el orientador del plantel.
            5. Tono: Usa un lenguaje cercano (tú), pero mantén la autoridad moral de un mentor académico.
            
            Estructura de respuesta esperada:
            1. Saludo cálido.
            2. Reflexión breve sobre lo que el estudiante escribió.
            3. Un pequeño consejo de bienestar o paso a seguir.
            4. Cierre recordando que el equipo de psicología ya tiene el reporte.`
          },
          {
            role: "user",
            content: mensajeUsuario
          }
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.7,
        max_tokens: 500,
      });

      const respuesta = chatCompletion.choices[0]?.message?.content || "Lo siento, tuve un problema al procesar tu mensaje. Por favor, intenta de nuevo.";
      setMensajes(prev => [...prev, { id: Date.now(), remitente: 'ai', texto: respuesta, tiempo: 'Hace un momento' }]);
    } catch (error) {
      console.error("Error con Groq:", error);
      setMensajes(prev => [...prev, { id: Date.now(), remitente: 'ai', texto: "Hola. Parece que tengo problemas técnicos para responderte ahora, pero no te preocupes, el equipo de psicología ya ha recibido tu mensaje y se pondrá en contacto contigo pronto.", tiempo: 'Ahora' }]);
    } finally {
      setEstaEscribiendo(false);
    }
  };

  const enviarMensaje = async (e) => {
    e.preventDefault();
    if (!nuevoMensaje.trim()) return;

    const textoParaIA = nuevoMensaje;
    const esAnon = esAnonimo;
    
    // 1. Mostrar localmente de inmediato
    const msg = { id: Date.now(), remitente: 'usuario', texto: nuevoMensaje, tiempo: 'Ahora', anonimo: esAnon };
    setMensajes(prev => [...prev, msg]);
    setNuevoMensaje("");

    // 2. GUARDAR EN BASE DE DATOS PARA EL ADMIN
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log("🔍 Usuario autenticado:", user?.id);
      if (user) {
        const { data: insertData, error: insertError } = await supabase.from('wellness_reports').insert({
          student_id: user.id,
          topic: textoParaIA.length > 50 ? textoParaIA.substring(0, 47) + '...' : textoParaIA,
          message: textoParaIA,
          is_anonymous: esAnon,
          priority: 'normal',
          status: 'pending'
        }).select();
        
        if (insertError) {
          console.error("❌ ERROR guardando reporte:", insertError.message, insertError.details, insertError.hint);
          alert("⚠️ No se pudo guardar el reporte: " + insertError.message);
        } else {
          console.log("✅ Reporte guardado exitosamente:", insertData);
        }
      } else {
        console.warn("⚠️ No hay usuario autenticado - el reporte NO se guardó");
      }
    } catch (err) {
      console.error("💥 Error inesperado:", err);
    }

    // 3. Obtener respuesta de la IA
    generarRespuestaIA(textoParaIA);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      
      {/* ═══ HEADER BIENESTAR ═══ */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-gradient-to-r from-emerald-600 to-teal-700 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-[1.5rem] flex items-center justify-center border border-white/30 shadow-xl">
             <Heart className="w-8 h-8 text-white fill-current" />
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black italic tracking-tighter leading-none mb-2 uppercase">Buzón de Bienestar</h2>
            <p className="text-emerald-50/70 text-sm font-medium">Un espacio seguro, empático y profesional para escucharte.</p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
           <ShieldCheck className="w-5 h-5 text-emerald-300" />
           <span className="text-[10px] font-black uppercase tracking-widest">Canal 100% Seguro</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* ── CHAT INTERFACE (2/3) ── */}
        <div className="lg:col-span-2 flex flex-col h-[600px] bg-white rounded-[3rem] shadow-2xl border border-gray-100 overflow-hidden">
          
          {/* Top Bar Chat */}
          <div className="px-8 py-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                 <Bot className="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                 <h4 className="text-sm font-black text-gray-900 tracking-tight">Asistente de Apoyo</h4>
                 <div className="flex items-center gap-1.5">
                   <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                   <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">En línea</span>
                 </div>
              </div>
            </div>
            
            <button 
              onClick={() => setEsAnonimo(!esAnonimo)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${esAnonimo ? 'bg-vinotinto-800 text-white border-vinotinto-900 shadow-lg shadow-vinotinto-200' : 'bg-white text-gray-400 border-gray-100 hover:border-vinotinto-200 hover:text-vinotinto-800'}`}
            >
              <EyeOff className="w-4 h-4" />
              <span className="text-[9px] font-black uppercase tracking-widest">{esAnonimo ? 'Modo Anónimo: ON' : 'Modo Anónimo: OFF'}</span>
            </button>
          </div>

          {/* Area de Mensajes */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
            {mensajes.map((m, i) => (
              <Motion.div 
                key={m.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${m.remitente === 'usuario' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[85%] rounded-[2rem] p-6 shadow-sm ${
                  m.remitente === 'usuario' 
                    ? 'bg-vinotinto-800 text-white rounded-tr-none' 
                    : 'bg-emerald-50 text-gray-700 border border-emerald-100 rounded-tl-none'
                }`}>
                  {m.remitente === 'usuario' && m.anonimo && (
                    <div className="flex items-center gap-1.5 mb-2 opacity-50">
                      <EyeOff className="w-3 h-3" />
                      <span className="text-[8px] font-black uppercase tracking-widest">Enviado de forma anónima</span>
                    </div>
                  )}
                  <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{m.texto}</p>
                  <span className={`text-[9px] font-bold uppercase mt-3 block ${m.remitente === 'usuario' ? 'text-white/40' : 'text-gray-300'}`}>
                    {m.tiempo}
                  </span>
                </div>
              </Motion.div>
            ))}
            
            {estaEscribiendo && (
              <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                 <div className="bg-emerald-50 border border-emerald-100 rounded-[2rem] rounded-tl-none p-6 flex gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                 </div>
              </Motion.div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-8 bg-gray-50/50 border-t border-gray-100">
            <form onSubmit={enviarMensaje} className="flex gap-4">
              <input 
                type="text"
                value={nuevoMensaje}
                onChange={(e) => setNuevoMensaje(e.target.value)}
                placeholder="Escribe lo que sientes o lo que quieras compartir..."
                className="flex-1 bg-white border border-gray-100 rounded-[2rem] px-8 py-4 text-sm font-medium outline-none focus:border-emerald-300 focus:shadow-xl focus:shadow-emerald-100 transition-all"
              />
              <button 
                type="submit"
                disabled={!nuevoMensaje.trim() || estaEscribiendo}
                className="p-4 bg-emerald-600 text-white rounded-2xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all disabled:opacity-30"
              >
                <Send className="w-6 h-6" />
              </button>
            </form>
          </div>
        </div>

        {/* ── SIDEBAR WIDGETS (1/3) ── */}
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-xl shadow-gray-200/50">
             <div className="flex items-center gap-3 mb-6 text-vinotinto-800">
                <Info className="w-5 h-5" />
                <h4 className="text-xs font-black uppercase tracking-widest">Nuestras Reglas</h4>
             </div>
             <ul className="space-y-4">
               {[
                 { icon: <ShieldCheck className="w-4 h-4" />, text: "Confidencialidad absoluta." },
                 { icon: <Wind className="w-4 h-4" />, text: "Espacio de calma y desahogo." },
                 { icon: <Smile className="w-4 h-4" />, text: "Sin juicios ni prejuicios." },
                 { icon: <AlertTriangle className="w-4 h-4" />, text: "Intervención inmediata en casos de riesgo." }
               ].map((r, i) => (
                 <li key={i} className="flex items-start gap-3 text-[11px] font-semibold text-gray-500 leading-relaxed group">
                    <div className="mt-0.5 p-1 bg-emerald-50 text-emerald-600 rounded-lg group-hover:bg-emerald-100 transition-colors">
                      {r.icon}
                    </div>
                    {r.text}
                 </li>
               ))}
             </ul>
          </div>

          <div className="bg-emerald-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700">
               <Sparkles className="w-20 h-20" />
            </div>
            <div className="relative z-10">
              <h4 className="text-sm font-black italic mb-4 uppercase tracking-tighter">Consejo del Día</h4>
              <p className="text-xs text-emerald-100/70 font-medium leading-relaxed italic mb-6">
                "No tienes que poder con todo hoy. Respira y recuerda que pedir ayuda es el mayor acto de valentía."
              </p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">
                Explorar Píldoras de Bienestar
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default BuzonBienestar;
