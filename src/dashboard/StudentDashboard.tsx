import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Video, Coffee, Wallet, HeartPulse, MessageSquare, 
  Settings, LogOut, Bell, User, Menu, X, ChevronRight, Award, Sun, Moon
} from 'lucide-react';
import AulaVirtual from './AulaVirtual';
import EduStream from './EduStream';
import Cafeteria from './Cafeteria';
import Finanzas from './Finanzas';

const SidebarItem = ({ icon: Icon, label, isActive, onClick, isDarkMode }: any) => (
  <button 
    onClick={onClick}
    className={`w-[calc(100%-2rem)] mx-4 flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
      isActive 
        ? "bg-vinotinto text-white shadow-xl shadow-vinotinto/20" 
        : isDarkMode ? "text-slate-400 hover:bg-slate-800 hover:text-white" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    }`}
  >
    <div className={`p-2 rounded-xl transition-colors ${isActive ? "bg-white/20 text-gold" : isDarkMode ? "bg-slate-800 text-slate-500" : "bg-slate-100 text-slate-400 group-hover:bg-slate-200 group-hover:text-vinotinto"}`}>
      <Icon size={18} />
    </div>
    <span className="font-bold text-sm tracking-wide">{label}</span>
    {isActive && <ChevronRight size={16} className="ml-auto opacity-50" />}
  </button>
);

const StudentDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('student_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('student_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('student_theme', 'light');
    }
  }, [isDarkMode]);

  const getActiveTab = () => {
    const path = location.pathname.replace('/dashboard', '');
    if (path.includes('/stream')) return 'stream';
    if (path.includes('/store')) return 'store';
    if (path.includes('/finance')) return 'finance';
    return 'aula';
  };

  const currentTab = getActiveTab();

  const handleNav = (path: string) => {
    navigate(`/dashboard${path}`);
    setMobileMenuOpen(false);
  };

  const navItems = [
    { id: 'aula', icon: BookOpen, label: 'Aula Virtual', path: '' },
    { id: 'stream', icon: Video, label: 'Vlog Escolar', path: '/stream' },
    { id: 'store', icon: Coffee, label: 'Smart Cafetería', path: '/store' },
    { id: 'finance', icon: Wallet, label: 'Finanzas', path: '/finance' },
  ];

  return (
    <div className={`min-h-screen flex flex-col md:flex-row overflow-hidden font-sans transition-colors duration-500 ${isDarkMode ? 'dark bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
      {/* Mobile Header */}
      <div className={`md:hidden p-4 flex justify-between items-center z-50 border-b transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-vinotinto flex items-center justify-center text-gold shadow-lg shadow-vinotinto/20">
            <BookOpen size={14} />
          </div>
          <span className={`font-black text-xs uppercase tracking-widest ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>F.E.B.D.</span>
        </div>
        <div className="flex items-center gap-2">
           <button onClick={() => setIsDarkMode(!isDarkMode)} className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-800 text-gold' : 'bg-slate-50 text-slate-500'}`}>
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
           </button>
           <button onClick={() => setMobileMenuOpen(true)} className={`p-2 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white' : 'bg-slate-50 text-slate-800'}`}>
              <Menu size={20} />
           </button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "-100%" }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: "-100%" }}
            className="fixed inset-0 z-[100] flex"
          >
            <div className={`w-4/5 max-w-[300px] h-full shadow-2xl flex flex-col relative z-20 ${isDarkMode ? 'bg-slate-900' : 'bg-white'}`}>
              <div className={`p-8 border-b flex justify-between items-start ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div>
                  <h2 className={`text-2xl font-display font-black uppercase tracking-tight mb-1 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Alejandro M.</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">5to Año - B</p>
                </div>
                <button onClick={() => setMobileMenuOpen(false)} className={`p-2 rounded-full ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-50 text-slate-400'}`}>
                  <X size={20} />
                </button>
              </div>
              <div className="flex-1 py-6 overflow-y-auto space-y-1">
                {navItems.map(item => (
                  <SidebarItem key={item.id} icon={item.icon} label={item.label} isActive={currentTab === item.id} onClick={() => handleNav(item.path)} isDarkMode={isDarkMode} />
                ))}
              </div>
            </div>
            <div className="flex-1 bg-slate-950/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <div className={`hidden md:flex w-[300px] flex-col z-40 flex-shrink-0 border-r transition-all duration-500 ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-2xl shadow-black/50' : 'bg-white border-slate-100 shadow-xl'}`}>
        <div className={`p-10 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-vinotinto to-vinotinto-dark flex items-center justify-center mb-8 shadow-2xl shadow-vinotinto/30 border border-white/10 relative group">
            <User size={32} className="text-gold group-hover:scale-110 transition-transform" />
            <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-green-500 rounded-full border-4 border-white dark:border-slate-900 flex items-center justify-center shadow-lg">
              <span className="text-[8px] font-black w-full h-full animate-ping bg-green-400 rounded-full opacity-50 absolute"></span>
            </div>
          </div>
          <div>
            <h2 className={`text-2xl font-display font-black uppercase tracking-tighter mb-2 transition-colors ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>Alejandro M.</h2>
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-slate-800 text-gold' : 'bg-slate-100 text-slate-600'}`}>5to Año - B</span>
          </div>
        </div>

        <div className="flex-1 py-8 overflow-y-auto space-y-2">
          {navItems.map(item => (
            <SidebarItem key={item.id} icon={item.icon} label={item.label} isActive={currentTab === item.id} onClick={() => handleNav(item.path)} isDarkMode={isDarkMode} />
          ))}
        </div>

        <div className={`p-8 border-t flex flex-col gap-4 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? 'bg-slate-800 text-gold hover:bg-gold hover:text-slate-950' : 'bg-slate-50 text-slate-500 hover:bg-slate-200 hover:text-slate-900'}`}
          >
             {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
             {isDarkMode ? 'Modo Claro' : 'Modo Oscuro'}
          </button>
          <button 
            onClick={() => navigate('/')} 
            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${isDarkMode ? 'text-slate-400 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'}`}
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 max-h-screen overflow-y-auto relative transition-colors duration-500 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className={`absolute top-0 right-0 w-[600px] h-[600px] blur-[120px] rounded-full pointer-events-none -z-0 opacity-50 ${isDarkMode ? 'bg-vinotinto/20' : 'bg-vinotinto/5'}`}></div>
        <div className="relative z-10 min-h-full">
          <Routes>
            <Route index element={<AulaVirtual isDarkMode={isDarkMode} />} />
            <Route path="stream" element={<EduStream />} />
            <Route path="store" element={<Cafeteria />} />
            <Route path="finance" element={<Finanzas />} />
          </Routes>
        </div>
      </div>

    </div>
  );
};

export default StudentDashboard;
