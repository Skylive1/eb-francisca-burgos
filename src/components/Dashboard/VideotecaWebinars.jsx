import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Play, 
  Search, 
  Filter, 
  Clock, 
  Calendar, 
  User, 
  ChevronRight, 
  Video,
  Info,
  ExternalLink,
  Tag,
  MonitorPlay
} from 'lucide-react';

const webinars = [
  {
    id: 1,
    titulo: "Becas Internacionales 2026: Todo lo que necesitas saber",
    desc: "Sesión informativa detallada sobre convenios con universidades en Europa y Latinoamérica, requisitos y plazos.",
    categoria: "Becas y Ayudas",
    poniente: "Dra. Martha Solís",
    fecha: "15 May 2026",
    duracion: "45 min",
    views: "342",
    thumbGradient: "from-blue-600 to-indigo-800",
    videoUrl: "#"
  },
  {
    id: 2,
    titulo: "Proceso de Inscripción: Guía paso a paso",
    desc: "Tutorial sobre cómo completar los formularios administrativos del portal y cargar documentación.",
    categoria: "Administración",
    poniente: "Lic. Roberto Gómez",
    fecha: "10 May 2026",
    duracion: "20 min",
    views: "1.1K",
    thumbGradient: "from-emerald-600 to-teal-800",
    videoUrl: "#"
  },
  {
    id: 3,
    titulo: "Q&A con la Directiva: Futuro de la F.E.B.D.",
    desc: "Sesión de preguntas y respuestas sobre las nuevas instalaciones y proyectos de innovación para el próximo año.",
    categoria: "Institucional",
    poniente: "Directorado",
    fecha: "05 May 2026",
    duracion: "60 min",
    views: "890",
    thumbGradient: "from-rose-600 to-pink-800",
    videoUrl: "#"
  },
  {
    id: 4,
    titulo: "Taller: Cómo redactar un ensayo académico",
    desc: "Claves pedagógicas para mejorar tus producciones escritas y citación normas APA.",
    categoria: "Académico",
    poniente: "Prof. Elena Burgos",
    fecha: "28 Abr 2026",
    duracion: "35 min",
    views: "1.5K",
    thumbGradient: "from-amber-600 to-orange-800",
    videoUrl: "#"
  }
];

const VideotecaWebinars = () => {
  const [busqueda, setBusqueda] = useState("");
  const [catFiltro, setCatFiltro] = useState("todas");

  const categorias = ["todas", "Becas y Ayudas", "Administración", "Institucional", "Académico"];

  const filtrados = webinars.filter(w => {
    const coincideBusqueda = w.titulo.toLowerCase().includes(busqueda.toLowerCase()) || 
                             w.desc.toLowerCase().includes(busqueda.toLowerCase());
    const coincideCategoria = catFiltro === "todas" || w.categoria === catFiltro;
    return coincideBusqueda && coincideCategoria;
  });

  return (
    <div className="space-y-8">
      
      {/* ═══ HEADER & SEARCH ═══ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100">
              <Video className="w-3.5 h-3.5 inline mr-1" /> Videoteca
            </span>
          </div>
          <h2 className="text-3xl font-black text-gray-900 tracking-tight italic">Webinars & Tutoriales</h2>
          <p className="text-sm text-gray-400 font-medium mt-1">Encuentra todas las sesiones informativas y guías grabadas.</p>
        </div>

        <div className="relative w-full lg:max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar sesiones, temas o ponentes..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full bg-white border border-gray-100 rounded-2xl py-4 pl-12 pr-6 outline-none text-sm font-medium text-gray-800 shadow-sm focus:border-vinotinto-300 focus:shadow-md transition-all"
          />
        </div>
      </div>

      {/* ═══ FILTROS ═══ */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <Filter className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
        {categorias.map(cat => (
          <button
            key={cat}
            onClick={() => setCatFiltro(cat)}
            className={`px-5 py-2.5 rounded-full text-xs font-bold whitespace-nowrap transition-all active:scale-95 ${
              catFiltro === cat ? 'bg-vinotinto-800 text-white shadow-lg' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
            }`}
          >
            {cat === "todas" ? "Todas las categorías" : cat}
          </button>
        ))}
      </div>

      {/* ═══ GRID DE VIDEOS ═══ */}
      {filtrados.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtrados.map((v, i) => (
            <Motion.article
              key={v.id}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all overflow-hidden flex flex-col sm:flex-row group"
            >
              {/* Thumbnail */}
              <div className={`w-full sm:w-48 aspect-video sm:aspect-square bg-gradient-to-br ${v.thumbGradient} relative shrink-0 overflow-hidden`}>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:scale-110 group-hover:bg-white/30 transition-all">
                    <Play className="w-5 h-5 text-white" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 px-2 py-1 bg-black/60 backdrop-blur-sm text-white rounded font-bold text-[9px]">
                  {v.duracion}
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 bg-gray-50 text-gray-500 rounded-lg text-[9px] font-black uppercase border border-gray-100 tracking-wider">
                      {v.categoria}
                    </span>
                    <span className="text-[9px] text-gray-300 font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {v.fecha}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-gray-900 leading-tight mb-2 line-clamp-2 group-hover:text-vinotinto-800 transition-colors">
                    {v.titulo}
                  </h3>
                  <p className="text-xs text-gray-400 font-medium leading-relaxed line-clamp-2 mb-4">
                    {v.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-gray-400" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-600">{v.poniente}</span>
                  </div>
                  <button className="text-[10px] font-black text-vinotinto-800 uppercase tracking-widest flex items-center gap-1 hover:gap-2 transition-all">
                    Ver ahora <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Motion.article>
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
            <MonitorPlay className="w-10 h-10 text-gray-200" />
          </div>
          <p className="text-lg font-black text-gray-300 italic">No se encontraron sesiones</p>
          <p className="text-sm text-gray-400 font-medium">Prueba con otra categoría o término de búsqueda.</p>
        </div>
      )}

      {/* ═══ INFO SECTION ═══ */}
      <div className="bg-blue-50/50 rounded-3xl p-8 border border-blue-100 flex flex-col md:flex-row items-center gap-6">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
          <Info className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="text-sm font-black text-blue-900 uppercase tracking-widest mb-1">¿No encuentras lo que buscas?</h4>
          <p className="text-xs text-blue-800/60 font-medium leading-relaxed">
            Todas las semanas subimos nuevo contenido. Si tienes alguna duda administrativa específica, puedes contactar con soporte técnico a través del Asistente IA.
          </p>
        </div>
        <button className="px-6 py-3 bg-white text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md transition-all whitespace-nowrap active:scale-95">
          Programar Asesoría
        </button>
      </div>

    </div>
  );
};

export default VideotecaWebinars;
