import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, X, Send, Sparkles, MessageCircle, User, Minimize2 } from 'lucide-react';
import { groqService } from '../../lib/groqService';
import { useGamification } from '../../hooks/useGamification';

const AIAssistantBubble = ({ rol }) => {
  if (rol !== 'student') return null;

  const [isOpen, setIsOpen] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [historia, setHistoria] = useState([]);
  const [ultimoXp, setUltimoXp] = useState(0);
  
  const scrollRef = useRef(null);
  const { addXp } = useGamification();

  // Auto-scroll al final del chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [historia, cargando]);

  const manejarEnvio = async (e) => {
    e.preventDefault();
    if (!mensaje.trim() || cargando) return;

    const userMessage = mensaje.trim();
    setMensaje('');
    setHistoria(prev => [...prev, { role: 'user', content: userMessage }]);
    setCargando(true);

    const botResponse = await groqService.getTutorResponse(userMessage, historia, rol);

    setHistoria(prev => [...prev, { role: 'assistant', content: botResponse }]);
    setCargando(false);
    
    // XP por curiosidad académica
    addXp(5);
  };

  return (
    <div className="fixed bottom-28 right-6 z-[100]">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 50, x: 20 }}
            className="absolute bottom-4 right-0 w-[350px] sm:w-[400px] h-[550px] bg-white rounded-[2.5rem] shadow-[0_30px_90px_-15px_rgba(0,0,0,0.3)] overflow-hidden border border-white flex flex-col"

          >
            {/* Cabecera Premium */}
            <div className="bg-vinotinto-800 p-6 flex items-center justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
              <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 bg-white/10 rounded-2xl backdrop-blur-md flex items-center justify-center border border-white/20">
                   <Bot className="text-white w-6 h-6" />
                </div>
                <div>
                  <h4 className="text-white text-sm font-black uppercase tracking-widest italic">
                    {rol === 'student' ? "Mentor Académico" : "Tutor de Guardia"}
                  </h4>
                  <p className="text-gold-400 text-[10px] font-bold flex items-center gap-1.5 uppercase">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span> Aula Virtual F.E.B.D.
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-xl text-white transition-all active:scale-90"
              >
                <Minimize2 className="w-5 h-5 opacity-60" />
              </button>
            </div>

            {/* Cuerpo del Chat */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 scroll-smooth"
            >
              {historia.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40 px-8">
                  <div className="w-16 h-16 bg-gray-200 rounded-full mb-4 flex items-center justify-center">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <p className="text-xs font-black uppercase tracking-widest text-gray-500">¿Tienes dudas con una materia o el calendario?</p>
                </div>
              )}

              {historia.map((msg, idx) => (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-4 rounded-3xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                      ? 'bg-vinotinto-800 text-white rounded-tr-none font-medium' 
                      : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none font-medium italic'
                  }`}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}

              {cargando && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-2">
                    <span className="w-2 h-2 bg-vinotinto-800 rounded-full animate-bounce"></span>
                    <span className="w-2 h-2 bg-vinotinto-800 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 bg-vinotinto-800 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                </div>
              )}
            </div>

            {/* Input Área */}
            <form onSubmit={manejarEnvio} className="p-6 bg-white border-t border-gray-100">
              <div className="flex gap-3 bg-slate-50 p-2 rounded-2xl border border-gray-100 ring-1 ring-inset ring-gray-100 focus-within:ring-vinotinto-500 transition-all">
                <input 
                  type="text"
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Haz una pregunta académica..."
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium px-2 py-2"
                />
                <button 
                  type="submit"
                  disabled={!mensaje.trim() || cargando}
                  className="bg-vinotinto-800 text-white p-3 rounded-xl hover:bg-black transition-all active:scale-90 disabled:opacity-30 shadow-lg shadow-vinotinto-100"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[9px] text-center mt-3 text-gray-400 font-bold uppercase tracking-widest opacity-60">
                 Potenciado por Llama 3.3 (Groq)
              </p>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Botón Burbuja */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-2xl relative transition-colors duration-500 ${isOpen ? 'bg-black' : 'bg-vinotinto-800'}`}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div key="close" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <X size={24} />
            </motion.div>
          ) : (
            <motion.div key="bot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative">
              <Bot size={28} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gold rounded-full border-2 border-vinotinto-800 flex items-center justify-center">
                 <Sparkles className="text-vinotinto-800 w-2 h-2" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Notificación Tooltip */}
        {!isOpen && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1 }}
            className="absolute right-20 bg-white border border-gray-100 px-4 py-2.5 rounded-2xl shadow-xl whitespace-nowrap text-[10px] font-black text-vinotinto-800 uppercase tracking-widest hidden lg:block"
          >
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-gray-100 rotate-[-45deg]"></div>
          </motion.div>
        )}
      </motion.button>
    </div>
  );
};

export default AIAssistantBubble;
