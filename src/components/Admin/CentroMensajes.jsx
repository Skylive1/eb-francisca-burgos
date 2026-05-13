import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  HeartHandshake, 
  Mail, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  User, 
  ShieldAlert,
  Search,
  Filter,
  Loader2,
  X,
  MessageCircle
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const CentroMensajes = ({ isDarkMode }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('mailbox_messages')
        .select('*, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('mailbox_messages')
        .update({ status })
        .eq('id', id);
      if (error) throw error;
      
      setMessages(messages.map(m => m.id === id ? { ...m, status } : m));
      if (selectedMessage?.id === id) setSelectedMessage({ ...selectedMessage, status });
    } catch (error) {
      console.error('Error updating message status:', error);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 h-full">
      <div className={`flex justify-between items-center p-8 rounded-[2.5rem] border transition-colors ${isDarkMode ? 'bg-white/5 backdrop-blur-xl border-white/10' : 'bg-white border-gray-100 shadow-xl'}`}>
        <div>
          <h3 className={`text-2xl font-black italic uppercase tracking-tighter flex items-center gap-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            <HeartHandshake className="text-vinotinto-500" /> Buzón de Bienestar
          </h3>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mt-1">Gestión de convivencia escolar</p>
        </div>
        <div className="flex gap-4">
           <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
              {['all', 'pending', 'read'].map(filter => (
                <button key={filter} className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all">
                  {filter}
                </button>
              ))}
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LISTA DE MENSAJES */}
        <div className="lg:col-span-4 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
          {loading ? (
            <div className="py-20 text-center"><Loader2 className="animate-spin text-vinotinto-500 mx-auto" /></div>
          ) : messages.length === 0 ? (
            <div className="p-10 text-center bg-white/5 rounded-[2rem] border border-dashed border-white/10">
               <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Buzón vacío</p>
            </div>
          ) : messages.map(msg => (
            <Motion.div 
              key={msg.id}
              onClick={() => setSelectedMessage(msg)}
              className={`p-6 rounded-[2rem] border cursor-pointer transition-all ${
                selectedMessage?.id === msg.id 
                  ? 'bg-vinotinto-800 border-vinotinto-600 shadow-xl' 
                  : isDarkMode ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-white border-gray-100 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                 <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
                   msg.status === 'pending' ? 'bg-amber-500 text-black' : 'bg-white/10 text-gray-400'
                 }`}>
                   {msg.status}
                 </span>
                 <span className="text-[9px] font-bold text-gray-500">{new Date(msg.created_at).toLocaleDateString()}</span>
              </div>
              <h4 className={`text-sm font-black uppercase line-clamp-1 mb-1 ${selectedMessage?.id === msg.id ? 'text-white' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>{msg.subject}</h4>
              <p className={`text-[10px] line-clamp-2 font-medium ${selectedMessage?.id === msg.id ? 'text-white/60' : 'text-gray-400'}`}>
                {msg.is_anonymous ? 'Mensaje Anónimo' : msg.profiles?.full_name}
              </p>
            </Motion.div>
          ))}
        </div>

        {/* DETALLE DEL MENSAJE */}
        <div className={`lg:col-span-8 backdrop-blur-xl rounded-[3rem] border p-10 min-h-[500px] flex flex-col transition-colors ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-gray-100 shadow-2xl'}`}>
          {selectedMessage ? (
            <AnimatePresence mode="wait">
              <Motion.div 
                key={selectedMessage.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-8 flex-1 flex flex-col"
              >
                <div className="flex justify-between items-start pb-8 border-b border-white/5">
                   <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-black ${isDarkMode ? 'bg-gradient-to-br from-vinotinto-800 to-black' : 'bg-vinotinto-50 border border-vinotinto-100'}`}>
                        {selectedMessage.is_anonymous ? <ShieldAlert className="text-amber-500" /> : <User className="text-vinotinto-700" />}
                      </div>
                      <div>
                        <h4 className={`text-2xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedMessage.subject}</h4>
                        <p className="text-xs text-vinotinto-500 font-black uppercase tracking-widest">
                          {selectedMessage.is_anonymous ? 'ENVIADO DE FORMA ANÓNIMA' : `POR: ${selectedMessage.profiles?.full_name}`}
                        </p>
                      </div>
                   </div>
                   <button onClick={() => setSelectedMessage(null)} className="text-gray-500 hover:text-red-500 transition-colors"><X /></button>
                </div>

                <div className={`p-10 rounded-[2.5rem] border flex-1 relative overflow-hidden transition-colors ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-gray-50 border-gray-100'}`}>
                   <div className="absolute top-0 right-0 p-8 opacity-5">
                      <MessageCircle size={100} />
                   </div>
                   <p className={`text-lg font-medium leading-relaxed italic relative z-10 ${isDarkMode ? 'text-gray-300' : 'text-slate-700'}`}>
                     "{selectedMessage.message}"
                   </p>
                </div>

                <div className="pt-8 flex gap-4">
                   <button 
                    disabled={actionLoading}
                    onClick={() => handleUpdateStatus(selectedMessage.id, 'read')}
                    className="flex-1 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all flex items-center justify-center gap-3"
                  >
                    {actionLoading ? <Loader2 className="animate-spin" /> : <CheckCircle2 size={16} />} Marcar como Leído
                   </button>
                   <button className="flex-1 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">
                    Archivar Mensaje
                   </button>
                   <button className="p-5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                    <Trash2 size={18} />
                   </button>
                </div>
              </Motion.div>
            </AnimatePresence>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 opacity-30">
               <HeartHandshake size={80} />
               <p className="text-xs font-black uppercase tracking-[0.3em]">Seleccione un reporte para visualizar los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CentroMensajes;
