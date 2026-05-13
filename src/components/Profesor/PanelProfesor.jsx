import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

// Importamos piezas institucionales
import PieDePagina from '../Dashboard/PieDePagina';
import SidebarDashboard from '../Dashboard/SidebarDashboard';
import Cabecera from '../Dashboard/Cabecera';
import { Menu } from 'lucide-react';

// Componentes propios del profesor
import GestorMateriales from './GestorMateriales';
import GestorTareas from './GestorTareas';
import GestorEstudiantes from './GestorEstudiantes';
import ResumenProfesor from './ResumenProfesor';
import AIAssistantBubble from '../Dashboard/AIAssistantBubble';
import BoletinDigital from '../Dashboard/BoletinDigital';
import CalendarioEscolar from '../Dashboard/CalendarioEscolar';
import GestionPerfil from '../Dashboard/GestionPerfil';
import EduStream from '../../dashboard/EduStream';
import CafetinEstudiante from '../Dashboard/CafetinEstudiante';

/**
 * COMPONENTE: PanelProfesor (Modernizado - Versión Estable)
 * --------------------------------------------------------
 * Vista principal del profesor ajustada al diseño institucional.
 */
const PanelProfesor = ({ onLogout, rol }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [seccionActiva, setSeccionActiva] = useState('inicio');
  const [claseSeleccionada, setClaseSeleccionada] = useState(null);
  
  const [misClases, setMisClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [perfil, setPerfil] = useState(null);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('teacher_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('teacher_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('teacher_theme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        const isDemo = localStorage.getItem('demo_session');
        if (!user && !isDemo) {
          onLogout();
          return;
        }

        // Fetch Profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setPerfil(profile);

        // Fetch Classes with Student Counts
        const { data: classes } = await supabase
          .from('classes')
          .select('*, subject_enrollments(count)')
          .eq('instructor_id', user.id)
          .order('title');
        
        setMisClases((classes || []).map(c => ({
          ...c,
          titulo: c.title,
          alumnos: c.subject_enrollments?.[0]?.count || 0,
          icono: '📚'
        })));

      } catch (error) {
        console.error("Error cargando panel profesor:", error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  const infoUsuario = { 
    nombre: perfil?.full_name || 'Profesor', 
    cargo: `Docente • ${perfil?.role || 'F.E.B.D.'}`, 
    img: '/Fondo-Nuevo.png' 
  };

  const haciaSeccion = (id) => {
    if (['inicio', 'materiales', 'tareas', 'retos', 'perfil', 'boletin', 'estudiantes', 'vlog', 'cafetin'].includes(id)) {
      setSeccionActiva(id);
      setClaseSeleccionada(null);
    } else {
      const elemento = document.getElementById(id);
      if (elemento) elemento.scrollIntoView({ behavior: 'smooth' });
    }
    cerrarMenu();
  };

  const cerrarMenu = () => setMenuAbierto(false);

  const irAClaseSeccion = (clase, seccion) => {
    setClaseSeleccionada(clase);
    setSeccionActiva(seccion);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`flex h-screen overflow-hidden font-sans relative z-0 theme-transition ${isDarkMode ? 'dark bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* FONDO PROFESOR - DINÁMICO */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        {isDarkMode ? (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-vinotinto/30 blur-[150px] rounded-full mix-blend-screen opacity-40"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-slate-800/20 blur-[150px] rounded-full mix-blend-screen opacity-70"></div>
            <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-blue-900/20 blur-[100px] rounded-full mix-blend-screen opacity-40"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)]"></div>
          </>
        ) : (
          <>
            <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-vinotinto/10 blur-[120px] rounded-full mix-blend-multiply opacity-50"></div>
            <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gold/20 blur-[130px] rounded-full mix-blend-multiply opacity-70"></div>
            <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-blue-200/30 blur-[100px] rounded-full mix-blend-multiply opacity-50"></div>
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.7)_100%)]"></div>
          </>
        )}
      </div>

      <SidebarDashboard 
        isOpen={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        activa={seccionActiva === 'inicio' ? 'aula' : seccionActiva} 
        alCambiar={(id) => {
          setSeccionActiva(id === 'aula' ? 'inicio' : id);
          setClaseSeleccionada(null);
        }} 
        onLogout={onLogout}
        rol={rol}
        infoUsuario={infoUsuario}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Cabecera 
          toggleSidebar={() => setMenuAbierto(true)} 
          onLogout={onLogout} 
          rol={rol} 
          isDarkMode={isDarkMode}
        />
        
        <main className={`flex-1 overflow-y-auto relative custom-scrollbar backdrop-blur-3xl transition-colors ${isDarkMode ? 'bg-slate-900/40 shadow-[inset_0_0_100px_rgba(0,0,0,0.5)]' : 'bg-white/40 shadow-[inset_0_0_100px_rgba(255,255,255,0.5)]'}`}>
          {/* El grid punteado se elimina para dar paso al nuevo diseño limpio y moderno */}

          <div className="max-w-[1400px] mx-auto min-h-screen relative z-10 p-8">
            
            {/* VISTA CONTENIDO */}
            <Motion.div
              key={seccionActiva + (claseSeleccionada?.id || '')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
                <>
                  <div className={`flex justify-between items-end mb-8 pb-4 border-b-2 transition-colors ${isDarkMode ? 'border-slate-800' : 'border-vinotinto-800/20'}`}>
                    <div className="group relative">
                      <h2 className={`text-4xl font-black tracking-tighter uppercase italic font-display transition-colors ${isDarkMode ? 'text-slate-100' : 'text-gray-900'}`}>
                        {claseSeleccionada ? claseSeleccionada.titulo : 
                         seccionActiva === 'materiales' ? 'Gestión de Contenidos' : 
                         seccionActiva === 'vlog' ? 'Vlog Escolar' :
                         'Aula Virtual'}
                      </h2>
                      <div className="w-20 h-1.5 bg-vinotinto-800 mt-2 rounded-full"></div>
                    </div>
                    
                    {claseSeleccionada ? (
                      <div className="flex gap-2 bg-white/50 backdrop-blur-sm p-1 rounded-xl border border-gray-100 shadow-sm">
                        {[
                          { id: 'materiales', label: 'Contenidos y Actividades' },
                          { id: 'estudiantes', label: 'Estudiantes' }
                        ].map(tab => (
                          <button
                            key={tab.id}
                            onClick={() => setSeccionActiva(tab.id)}
                            className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${
                              seccionActiva === tab.id
                                ? 'bg-vinotinto-800 text-white shadow-lg shadow-vinotinto-200'
                                : 'text-gray-400 hover:text-vinotinto-600'
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                        <button 
                          onClick={() => { setClaseSeleccionada(null); setSeccionActiva('inicio'); }}
                          className="ml-2 px-4 py-2 border border-gray-100 text-[10px] font-black uppercase text-gray-400 hover:text-red-600 hover:bg-white rounded-xl transition-all active:scale-95"
                        >
                          Salir de la Clase
                        </button>
                      </div>
                    ) : null}
                  </div>

                  {seccionActiva === 'inicio' && !claseSeleccionada && (
                    <ResumenProfesor 
                      misClases={misClases} 
                      onIrAClase={irAClaseSeccion} 
                      nombreProfesor={infoUsuario.nombre}
                      isDarkMode={isDarkMode}
                    />
                  )}

                  {seccionActiva === 'boletin' && (
                    <BoletinDigital />
                  )}
                  
                  {seccionActiva === 'perfil' && (
                    <GestionPerfil 
                      infoUsuario={infoUsuario} 
                      rol={rol} 
                      alActualizar={(nuevos) => setPerfil(prev => ({ ...prev, full_name: `${nuevos.nombre} ${nuevos.apellido}`, avatar_url: nuevos.img }))}
                    />
                  )}
                  
                  {seccionActiva === 'materiales' && (
                    <GestorMateriales clase={claseSeleccionada} isDarkMode={isDarkMode} />
                  )}
                  
                  {seccionActiva === 'tareas' && (
                    <GestorTareas clase={claseSeleccionada} isDarkMode={isDarkMode} />
                  )}

                  {seccionActiva === 'estudiantes' && (
                    <GestorEstudiantes clase={claseSeleccionada} isDarkMode={isDarkMode} />
                  )}

                  {seccionActiva === 'vlog' && (
                    <EduStream />
                  )}

                  {seccionActiva === 'cafetin' && (
                    <CafetinEstudiante />
                  )}
                </>
            </Motion.div>
          </div>
          <PieDePagina />
        </main>
      </div>

    </div>
  );
};

export default PanelProfesor;
