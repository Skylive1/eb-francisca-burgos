import React from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Lock, CheckCircle2 } from 'lucide-react';
import escudoLogo from '../../escudo.png';

const LOGO_URL = "/Fondo-Nuevo.png";

interface FeatureProps {
  text: string;
}

const Feature = ({ text }: FeatureProps) => (
  <div className="flex items-center gap-3 text-[11px] font-black text-white/70 uppercase tracking-widest bg-white/5 border border-white/10 py-3 px-5 rounded-2xl shadow-sm hover:border-gold/20 transition-all cursor-default">
    <CheckCircle2 size={18} className="text-gold" /> {text}
  </div>
);

const Portal = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      // 1. Limpiar cualquier rastro de sesión previa antes de intentar una nueva
      await supabase.auth.signOut();
      localStorage.clear(); 
      
      let finalEmailToUse = email.trim();

      // Si no tiene arroba, asumimos que es una Cédula y buscamos su correo real
      if (!finalEmailToUse.includes('@')) {
        // Consultar la base de datos para buscar el correo asociado a esa cédula
        const { data: profileCed , error: cedError } = await supabase
          .from('profiles')
          .select('email')
          .ilike('id_card', finalEmailToUse)
          .single();
          
        if (profileCed && profileCed.email) {
          finalEmailToUse = profileCed.email; // Lo encontramos
        } else {
          // Si no lo encuentra, usamos el fallback ficticio y fallará naturalmente por credencial incorrecta
          finalEmailToUse = `${finalEmailToUse}@fldsmfr.edu.ve`;
        }
      }
      
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: finalEmailToUse.toLowerCase(),
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.user) {
        // Consultar el rol en la tabla profiles
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();

        console.log('DEBUG LOGIN:', { userId: data.user.id, profile, profileError });

        if (profileError || !profile) {
          // Diagnóstico: mostrar el error exacto
          console.error('Error de perfil:', profileError);
          alert(`DEBUG: No se encontró perfil. Error: ${profileError?.message || 'perfil nulo'}. UserID: ${data.user.id}`);
          navigate('/dashboard');
        } else {
          console.log('Rol encontrado:', profile.role);
          if (profile.role === 'admin') {
            navigate('/admin');
          } else if (profile.role === 'teacher') {
            navigate('/profesor');
          } else if (profile.role === 'cafetin') {
            navigate('/cafetin');
          } else {
            navigate('/dashboard');
          }
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-32 px-8 bg-[#1a060b] min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-vinotinto/20 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gold/10 blur-[150px] rounded-full"></div>
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-red-500/5 blur-[180px] rounded-full"></div>
      </div>

    <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-20 items-center relative z-10">
      <div className="space-y-10">
        <div className="space-y-4">
          <div className="inline-flex py-1 px-4 bg-gold/10 text-gold rounded-full text-xs font-black uppercase tracking-widest border border-gold/20">Acceso Digital</div>
          <h3 className="text-6xl font-display font-black text-white leading-[0.9] tracking-tighter">
            SISTEMA DE <br /> <span className="text-gold italic">CONTROL</span> <br /> DE NOTAS
          </h3>
          <p className="text-white/40 text-lg font-medium">Acceda a su terminal académica para consultar reportes, pagos y boletines digitales.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Feature text="Consulta de Reportes" />
          <Feature text="Pagos Administrativos" />
          <Feature text="Gestión de Horarios" />
          <Feature text="Boletines Digitales" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
        <div className="absolute -inset-4 bg-gradient-to-tr from-vinotinto/20 to-gold/20 blur-3xl rounded-[3rem] opacity-30"></div>
        <div className="relative bg-white/95 backdrop-blur-2xl p-10 md:p-14 rounded-[2.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] ring-1 ring-black/5">
          <div className="text-center mb-12">
            <div className="w-24 h-24 flex items-center justify-center mx-auto mb-8">
              <img src={LOGO_URL} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h4 className="text-xl font-display font-black text-slate-800 uppercase tracking-[0.2em]">Portal Estudiantil</h4>
            <p className="text-slate-400 text-sm mt-2 font-medium">Bienvenido a su terminal académica</p>
          </div>
          <form className="space-y-6" onSubmit={handleLogin}>
            
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-xs font-bold text-center">
                {error}
              </motion.div>
            )}

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cédula o Correo</label>
              <div className="relative group">
                <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-vinotinto transition-colors" size={20} />
                <input 
                  type="text" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="V-12345678 o email@ejemplo.com" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-vinotinto focus:bg-white outline-none transition-all font-bold placeholder:text-slate-300 ring-vinotinto/5 focus:ring-4" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contraseña</label>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-vinotinto transition-colors" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  className="w-full pl-14 pr-6 py-5 bg-slate-50/50 border border-slate-200 rounded-2xl focus:border-vinotinto focus:bg-white outline-none transition-all font-bold placeholder:text-slate-300 ring-vinotinto/5 focus:ring-4" 
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#800026] text-white py-5 rounded-2xl font-display font-black uppercase tracking-widest hover:bg-[#60001c] transition-all shadow-xl shadow-[#800026]/20 hover:shadow-[#800026]/40 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'AUTENTICANDO...' : 'INGRESAR AL SISTEMA'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

export default Portal;
