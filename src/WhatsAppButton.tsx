import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronRight } from 'lucide-react';

// WhatsApp number (without + or spaces)
const WHATSAPP_NUMBER = '584242712305';

const GRADES = [
  { label: 'Educación Inicial', options: ['Preescolar I (3 años)', 'Preescolar II (4 años)', 'Preescolar III (5 años)'] },
  { label: 'Educación Primaria', options: ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'] },
  { label: 'Media General', options: ['1er Año', '2do Año', '3er Año', '4to Año', '5to Año'] },
];

const WhatsAppIcon = ({ size = 28 }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
);

type Step = 'welcome' | 'select' | 'confirm';

const WhatsAppButton = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [step, setStep] = React.useState<Step>('welcome');
  const [selectedGrade, setSelectedGrade] = React.useState('');
  const [parentName, setParentName] = React.useState('');
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Close on outside click
  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleOpen = () => {
    setIsOpen(true);
    setStep('welcome');
    setSelectedGrade('');
    setParentName('');
  };

  const handleSelectGrade = (grade: string) => {
    setSelectedGrade(grade);
    setStep('confirm');
  };

  const handleSend = () => {
    const name = parentName.trim() || 'Padre/Representante';
    const message = encodeURIComponent(
      `¡Hola! 👋 Soy ${name}. Deseo información para inscribir a mi hijo/a en *${selectedGrade}* en la U.E.P. Francisca Elena Burgos D. para el período 2026-2027. ¿Me podrían orientar con el proceso de admisión? Gracias.`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-[90]" ref={panelRef}>
      {/* Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="absolute bottom-20 right-0 w-[340px] sm:w-[370px] bg-white rounded-[1.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.25)] overflow-hidden border border-slate-100"
          >
            {/* Header */}
            <div className="bg-[#075E54] p-5 flex items-center gap-4 relative">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIj48cGF0aCBkPSJNMCAyMGgyME0yMCAwdjIwIiBzdHJva2U9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9InVybCgjYSkiLz48L3N2Zz4=')] opacity-30"></div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 relative z-10">
                <WhatsAppIcon size={24} />
              </div>
              <div className="flex-1 relative z-10">
                <h4 className="text-white font-bold text-sm">U.E.P. Francisca Elena Burgos D.</h4>
                <p className="text-white/60 text-[11px] font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-[#25D366] rounded-full inline-block"></span>
                  En línea · Responde en minutos
                </p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors relative z-10"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="bg-[#ECE5DD] p-4 min-h-[280px] max-h-[400px] overflow-y-auto">
              <AnimatePresence mode="wait">
                {/* Step 1: Welcome */}
                {step === 'welcome' && (
                  <motion.div
                    key="welcome"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {/* Bot message */}
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] shadow-sm">
                        <p className="text-[13px] text-slate-800 leading-relaxed">
                          ¡Hola! 👋 Bienvenido/a a la <strong>U.E.P. Francisca Elena Burgos D.</strong>
                        </p>
                        <p className="text-[10px] text-slate-400 text-right mt-1">ahora</p>
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] shadow-sm">
                        <p className="text-[13px] text-slate-800 leading-relaxed">
                          Estoy aquí para ayudarte con el proceso de <strong>admisión 2026-2027</strong>. ¿Deseas solicitar información?
                        </p>
                        <p className="text-[10px] text-slate-400 text-right mt-1">ahora</p>
                      </div>
                    </div>

                    {/* Quick replies */}
                    <div className="flex flex-wrap gap-2 pt-2 justify-end">
                      <button
                        onClick={() => setStep('select')}
                        className="bg-white text-[#075E54] border border-[#25D366]/30 px-4 py-2 rounded-full text-xs font-bold hover:bg-[#25D366]/10 transition-colors shadow-sm"
                      >
                        ✅ Sí, quiero información
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Select Grade */}
                {step === 'select' && (
                  <motion.div
                    key="select"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {/* User reply bubble */}
                    <div className="flex justify-end">
                      <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-sm">
                        <p className="text-[13px] text-slate-800">Sí, quiero información ✅</p>
                        <p className="text-[10px] text-slate-400 text-right mt-1">ahora</p>
                      </div>
                    </div>

                    {/* Bot reply */}
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] shadow-sm">
                        <p className="text-[13px] text-slate-800 leading-relaxed">
                          ¡Perfecto! 🎓 Selecciona el <strong>grado</strong> de interés para tu hijo/a:
                        </p>
                        <p className="text-[10px] text-slate-400 text-right mt-1">ahora</p>
                      </div>
                    </div>

                    {/* Grade selector */}
                    <div className="space-y-3 pt-1">
                      {GRADES.map((group) => (
                        <div key={group.label}>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 px-1">{group.label}</p>
                          <div className="flex flex-wrap gap-1.5">
                            {group.options.map((grade) => (
                              <button
                                key={grade}
                                onClick={() => handleSelectGrade(grade)}
                                className="bg-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-full text-[11px] font-semibold hover:border-[#25D366] hover:bg-[#25D366]/5 hover:text-[#075E54] transition-all shadow-sm flex items-center gap-1"
                              >
                                {grade}
                                <ChevronRight size={10} className="opacity-40" />
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Confirm & Send */}
                {step === 'confirm' && (
                  <motion.div
                    key="confirm"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-3"
                  >
                    {/* User reply */}
                    <div className="flex justify-end">
                      <div className="bg-[#DCF8C6] rounded-2xl rounded-tr-md px-4 py-3 max-w-[85%] shadow-sm">
                        <p className="text-[13px] text-slate-800">{selectedGrade} 📚</p>
                        <p className="text-[10px] text-slate-400 text-right mt-1">ahora</p>
                      </div>
                    </div>

                    {/* Bot confirm */}
                    <div className="flex justify-start">
                      <div className="bg-white rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%] shadow-sm">
                        <p className="text-[13px] text-slate-800 leading-relaxed">
                          ¡Excelente elección! 🌟 Escribe tu nombre y te redirigiremos a WhatsApp con un mensaje listo para enviar a nuestro equipo de admisiones.
                        </p>
                        <p className="text-[10px] text-slate-400 text-right mt-1">ahora</p>
                      </div>
                    </div>

                    {/* Name input + send */}
                    <div className="pt-2 space-y-3">
                      <input
                        type="text"
                        value={parentName}
                        onChange={(e) => setParentName(e.target.value)}
                        placeholder="Tu nombre (opcional)"
                        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium placeholder:text-slate-300 focus:border-[#25D366] focus:ring-2 focus:ring-[#25D366]/20 outline-none transition-all shadow-sm"
                      />

                      {/* Preview */}
                      <div className="bg-white/80 border border-dashed border-slate-200 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Vista previa del mensaje:</p>
                        <p className="text-[12px] text-slate-600 leading-relaxed italic">
                          "¡Hola! 👋 Soy {parentName.trim() || 'Padre/Representante'}. Deseo información para inscribir a mi hijo/a en <strong>{selectedGrade}</strong>..."
                        </p>
                      </div>

                      <button
                        onClick={handleSend}
                        className="w-full bg-[#25D366] hover:bg-[#1da851] text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/20 transition-all active:scale-[0.98]"
                      >
                        <WhatsAppIcon size={18} />
                        Enviar por WhatsApp
                        <Send size={14} />
                      </button>

                      <button
                        onClick={() => setStep('select')}
                        className="w-full text-slate-400 text-[11px] font-semibold hover:text-slate-600 transition-colors py-1"
                      >
                        ← Cambiar grado
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="bg-white border-t border-slate-100 px-4 py-3 flex items-center justify-center gap-2">
              <span className="w-2 h-2 bg-[#25D366] rounded-full animate-pulse"></span>
              <p className="text-[10px] text-slate-400 font-medium">
                Atención de Lunes a Viernes · 7:00 AM – 4:00 PM
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button */}
      <motion.button
        onClick={isOpen ? () => setIsOpen(false) : handleOpen}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        className="relative w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center text-white shadow-[0_8px_25px_-5px_rgba(37,211,102,0.5)] hover:shadow-[0_12px_35px_-5px_rgba(37,211,102,0.6)] transition-shadow"
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="close"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <X size={26} />
            </motion.div>
          ) : (
            <motion.div
              key="wa"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <WhatsAppIcon size={30} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pulse ring */}
        {!isOpen && (
          <span className="absolute inset-0 rounded-full bg-[#25D366] animate-ping opacity-20"></span>
        )}
      </motion.button>

      {/* Tooltip */}
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: 2 }}
            className="absolute bottom-5 right-20 bg-white px-4 py-2 rounded-xl shadow-lg text-[11px] font-bold text-slate-700 whitespace-nowrap border border-slate-100 hidden sm:block"
          >
            💬 ¿Necesitas información?
            <div className="absolute top-1/2 -right-1.5 -translate-y-1/2 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-[-45deg]"></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WhatsAppButton;
