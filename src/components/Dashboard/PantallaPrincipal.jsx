import React, { useState, useEffect } from 'react';
import { motion as Motion } from 'framer-motion';
import { supabase } from '../../lib/supabaseClient';

// Importamos todas nuestras piezas de Lego en español
import MenuLateral from './MenuLateral';
import VistaInteriorClase from './VistaInteriorClase';
import MenuTareasDropdown from './MenuTareasDropdown';
import CalendarioWidget from './CalendarioWidget';
import VlogEscolar from './VlogEscolar';
import SidebarDashboard from './SidebarDashboard';
import TarjetaClase from './TarjetaClase';
import PieDePagina from './PieDePagina';
import SettingsPanel from './SettingsPanel';
import AIAssistantBubble from './AIAssistantBubble';
import FinanzasEstudiante from './FinanzasEstudiante';
import CafetinEstudiante from './CafetinEstudiante';
import BuzonBienestar from './BuzonBienestar';
import BoletinDigital from './BoletinDigital';
import CalendarioEscolar from './CalendarioEscolar';
import { Menu } from 'lucide-react';
import Cabecera from './Cabecera';
import GestionPerfil from './GestionPerfil';
import AjustesPerfil from '../Shared/AjustesPerfil';
import InventarioCafetin from '../Admin/InventarioCafetin';
import BandejaPedidos from './BandejaPedidos';
import RegistroVentas from './RegistroVentas';
import SolicitudesAdmin from './SolicitudesAdmin';
import Inscripciones from './Inscripciones';

// Variantes de animación reutilizables
const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' }
  })
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } }
};

/**
 * COMPONENTE: PantallaPrincipal (DashboardLayout)
 */
const PantallaPrincipal = ({ onLogout, rol }) => {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [subSeccionActiva, setSubSeccionActiva] = useState(rol === 'cafetin' ? 'cafetin' : 'aula-virtual');
  const [ajustesAbiertos, setAjustesAbiertos] = useState(false);
  const [infoUsuario, setInfoUsuario] = useState({
    nombre: '',
    cargo: '',
    img: '',
    email: ''
  });

  const alternarMenu = () => setMenuAbierto(!menuAbierto);
  const cerrarMenu = () => setMenuAbierto(false);

  // 1. CARGA INICIAL DE SESIÓN Y PERFIL
  useEffect(() => {
    const inicializarDashboard = async () => {
      // Usamos getSession para rapidez inicial, luego getUser para seguridad si es necesario
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      
      if (!user) {
        onLogout();
        return;
      }

      // Cargar Perfil
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) {
        setInfoUsuario({
          nombre: profile.full_name,
          cargo: profile.role === 'cafetin' ? 'Personal de Cafetín' : `Estudiante • ${profile.grade || 'Grado no asignado'}`,
          img: profile.avatar_url || '/gotica_perfil.png',
          email: user.email,
          cedula: profile.id_card,
          telefono: profile.phone,
          id: user.id
        });

        // Una vez que tenemos el perfil y usuario, cargamos las clases y suscripciones
        fetchClases(user.id);
        configurarRealtime(user.id, profile.role);
      }
    };

    inicializarDashboard();
  }, [onLogout, rol]);

  // 2. FUNCIÓN PARA CARGAR CLASES
  const fetchClases = async (userId) => {
    setLoadingClases(true);
    try {
      const { data: enrollments } = await supabase
        .from('subject_enrollments')
        .select('class_id')
        .eq('student_id', userId);
      
      const classIds = enrollments?.map(e => e.class_id) || [];

      if (classIds.length > 0) {
        const { data, error } = await supabase
          .from('classes')
          .select('*, profiles(full_name)')
          .in('id', classIds)
          .order('title');
        
        if (error) throw error;
        
        const transformed = (data || []).map(c => ({
          id: c.id,
          titulo: c.title,
          instructor: c.profiles?.full_name || 'Sin docente',
          colorFondo: c.color_bg || 'bg-blue-200',
          professor_id: c.professor_id
        }));
        setCursosEjemplo(transformed);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
    } finally {
      setLoadingClases(false);
    }
  };

  // 3. SISTEMA DE NOTIFICACIONES REALTIME
  const configurarRealtime = (userId, userRole) => {
    if (userRole === 'cafetin') {
      const orderChannel = supabase.channel('new-orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'cafeteria_orders' }, payload => {
          // Actualización manejada por componentes internos
        })
        .subscribe();
      return () => supabase.removeChannel(orderChannel);
    }

    const notificationChannel = supabase.channel('user-notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      }, payload => {
        // Actualización manejada por Cabecera
      })
      .subscribe();
    
    return () => supabase.removeChannel(notificationChannel);
  };

  const [cursosEjemplo, setCursosEjemplo] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);

  // El fetch de clases ahora se maneja en inicializarDashboard para evitar peticiones getUser adicionales

  // Función para manejar el clic en una tarea (Calendario o Dropdown)
  const manejarIrATarea = (tarea) => {
    // Buscamos el curso que coincida con la materia de la tarea
    const curso = cursosEjemplo.find(c => c.titulo.toUpperCase().includes(tarea.materia.toUpperCase()) || tarea.materia.toUpperCase().includes(c.titulo.toUpperCase().split(' ')[0]));
    if (curso) {
      setCursoSeleccionado(curso);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-gray-800 relative z-0">
      
      {/* Nuevo Fondo Moderno - Optimizado para Rendimiento */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-vinotinto/5 blur-[60px] rounded-full mix-blend-multiply"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[600px] h-[600px] bg-gold/10 blur-[80px] rounded-full mix-blend-multiply opacity-60"></div>
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-blue-100/20 blur-[50px] rounded-full mix-blend-multiply opacity-40"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(255,255,255,0.8)_100%)]"></div>
      </div>
      
      <SidebarDashboard 
        isOpen={menuAbierto}
        onClose={() => setMenuAbierto(false)}
        activa={subSeccionActiva} 
        alCambiar={(seccion) => {
          setSubSeccionActiva(seccion);
          setCursoSeleccionado(null);
        }} 
        onLogout={onLogout}
        rol={rol}
        infoUsuario={infoUsuario}
        onOpenSettings={() => setAjustesAbiertos(true)}
      />

      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Cabecera 
          toggleSidebar={() => setMenuAbierto(true)} 
          onLogout={onLogout} 
          rol={rol} 
          usuario={infoUsuario}
          onNavigate={(seccion) => {
            setSubSeccionActiva(seccion);
            setCursoSeleccionado(null);
          }}
        />
        
        <main className="flex-1 overflow-y-auto relative custom-scrollbar bg-white/60 backdrop-blur-xl shadow-[inset_0_0_100px_rgba(255,255,255,0.3)]">
          {/* El grid punteado se elimina para dar paso al nuevo diseño limpio y moderno */}

          <div className="max-w-[1400px] mx-auto min-h-screen relative z-10">
            
            {!cursoSeleccionado ? (
              <Motion.div
                key={subSeccionActiva}
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="p-8"
              >
                {subSeccionActiva === 'vlog' ? (
                  <VlogEscolar rol={rol} />
                ) : (subSeccionActiva === 'finanzas' && rol !== 'profesor') ? (
                  <FinanzasEstudiante />
                ) : (subSeccionActiva === 'cafetin') ? (
                  (rol === 'cafetin' || rol === 'admin') ? <InventarioCafetin isDarkMode={false} /> : <CafetinEstudiante />
                ) : (subSeccionActiva === 'pedidos' && rol === 'cafetin') ? (
                  <BandejaPedidos isDarkMode={false} />
                ) : (subSeccionActiva === 'ventas' && rol === 'cafetin') ? (
                  <RegistroVentas />
                ) : (subSeccionActiva === 'solicitudes' && rol === 'admin') ? (
                  <SolicitudesAdmin />
                ) : (subSeccionActiva === 'bienestar' && rol !== 'profesor') ? (
                  <BuzonBienestar />
                ) : subSeccionActiva === 'boletin' ? (
                  <BoletinDigital />
                ) : subSeccionActiva === 'inscripciones' ? (
                  <Inscripciones />
                ) : subSeccionActiva === 'perfil' ? (
                  <GestionPerfil 
                    infoUsuario={infoUsuario} 
                    rol={rol}
                    alActualizar={(nuevosDatos) => setInfoUsuario(prev => ({ ...prev, ...nuevosDatos }))} 
                  />
                ) : subSeccionActiva === 'aula-virtual' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* COLUMNA IZQUIERDA: CLASES (9/12) - MÁS ESPACIO */}
                    <div className="lg:col-span-9 space-y-8">
                      <div id="seccion-clases" className="scroll-mt-24">
                        <Motion.div variants={fadeUp} custom={1} className="flex justify-between items-end mb-8 pb-4 border-b-2 border-vinotinto-800/20">
                          <div>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic font-display">Mis Clases</h2>
                            <div className="w-20 h-1.5 bg-vinotinto-800 mt-2 rounded-full"></div>
                          </div>
                          <span className="text-xs font-black text-gray-400 uppercase tracking-widest">{cursosEjemplo.length} materias inscritas</span>
                        </Motion.div>

                        <Motion.div
                          layout
                          variants={staggerContainer}
                          initial="hidden"
                          animate="visible"
                          className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                        >
                          {loadingClases ? (
                             <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">Cargando aulas virtuales...</div>
                          ) : cursosEjemplo.length === 0 ? (
                             <div className="col-span-full py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">No tienes clases asignadas todavía</div>
                          ) : cursosEjemplo.map((curso, indice) => (
                            <Motion.div key={curso.id} layout variants={fadeUp} custom={indice + 2}>
                              <TarjetaClase 
                                title={curso.titulo}
                                instructor={curso.instructor}
                                imageColor={curso.colorFondo}
                                alHacerClic={() => setCursoSeleccionado(curso)}
                              />
                            </Motion.div>
                          ))}
                        </Motion.div>
                      </div>
                    </div>

                    {/* COLUMNA DERECHA: SIDEBAR DE HERRAMIENTAS (3/12) */}
                    <div className="lg:col-span-3 space-y-2 sticky top-28 bg-white/30 backdrop-blur-md p-4 rounded-[2.5rem] border border-white shadow-xl">
                      <Motion.div variants={fadeUp} custom={cursosEjemplo.length + 2}>
                        <MenuTareasDropdown onSelectTarea={manejarIrATarea} usuario={infoUsuario} />
                      </Motion.div>
                      <Motion.div variants={fadeUp} custom={cursosEjemplo.length + 3}>
                        <CalendarioWidget onSelectTarea={manejarIrATarea} usuario={infoUsuario} />
                      </Motion.div>
                    </div>
                  </div>
                ) : (
                  <div className="p-20 text-center text-gray-300 font-black uppercase tracking-widest italic">Sección en mantenimiento o sin contenido asignado</div>
                )}
              </Motion.div>

            ) : (
              <div className="p-8">
                <VistaInteriorClase 
                  curso={cursoSeleccionado} 
                  volver={() => setCursoSeleccionado(null)} 
                />
              </div>
            )}

         <SettingsPanel 
           isOpen={ajustesAbiertos} 
           onClose={() => setAjustesAbiertos(false)} 
         />
          </div>
          <PieDePagina />
        </main>
        <AIAssistantBubble rol={rol} />
      </div>
    </div>
  );
};

export default PantallaPrincipal;
