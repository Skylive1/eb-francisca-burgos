import React from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  BookOpen, GraduationCap, Users, Clock, Star,
  ChevronDown, ChevronRight, Trophy, Palette, Globe,
  Cpu, Dumbbell, Music, FlaskConical, Brain,
  Calendar, CheckCircle2, Sparkles, Target, ArrowRight,
  Award, Shield, Lightbulb, Heart
} from 'lucide-react';


// ── Interfaces ──

interface LevelData {
  id: string;
  Icon: any;
  title: string;
  subtitle: string;
  grades: string[];
  ages: string;
  schedule: string;
  description: string;
  highlights: string[];
  color: string;
  subjects: string[];
}

interface ProgramData {
  Icon: any;
  title: string;
  desc: string;
  badge?: string;
}

// ── Data ──

const LEVELS: LevelData[] = [
  {
    id: 'inicial',
    Icon: Heart,
    title: 'Educación Inicial',
    subtitle: 'Preescolar',
    grades: ['Preescolar I (3 años)', 'Preescolar II (4 años)', 'Preescolar III (5 años)'],
    ages: '3 a 5 años',
    schedule: '7:00 AM – 12:00 PM',
    description: 'Desarrollamos las habilidades cognitivas, motoras y socioemocionales de los más pequeños a través del juego, la exploración y el descubrimiento guiado. Un ambiente cálido que fomenta la curiosidad natural del niño.',
    highlights: [
      'Aprendizaje basado en el juego y la experimentación',
      'Desarrollo de la psicomotricidad fina y gruesa',
      'Iniciación a la lectoescritura y lógica-matemática',
      'Formación en valores y convivencia',
      'Acompañamiento psicopedagógico personalizado'
    ],
    color: 'from-pink-500 to-rose-600',
    subjects: ['Lenguaje y Comunicación', 'Pensamiento Lógico-Matemático', 'Exploración del Entorno', 'Expresión Artística', 'Educación Física', 'Formación Personal y Social']
  },
  {
    id: 'primaria',
    Icon: BookOpen,
    title: 'Educación Primaria',
    subtitle: '1ero a 6to Grado',
    grades: ['1er Grado', '2do Grado', '3er Grado', '4to Grado', '5to Grado', '6to Grado'],
    ages: '6 a 11 años',
    schedule: '7:00 AM – 1:00 PM',
    description: 'Consolidamos las competencias fundamentales en lectura, escritura, matemáticas y ciencias. Formamos estudiantes autónomos con pensamiento crítico, capaces de enfrentar los retos del siguiente nivel educativo.',
    highlights: [
      'Currículo enriquecido más allá del MPPE',
      'Programa de inglés intensivo desde 1er grado',
      'Integración de tecnología en el aula',
      'Proyectos interdisciplinarios cada lapso',
      'Evaluación continua y formativa',
      'Atención a la diversidad de aprendizaje'
    ],
    color: 'from-blue-500 to-indigo-600',
    subjects: ['Lengua y Literatura', 'Matemáticas', 'Ciencias Naturales', 'Ciencias Sociales', 'Inglés', 'Educación Física', 'Educación Artística', 'Educación para el Trabajo', 'Informática']
  },
  {
    id: 'media',
    Icon: GraduationCap,
    title: 'Media General',
    subtitle: '1ero a 5to Año',
    grades: ['1er Año', '2do Año', '3er Año', '4to Año', '5to Año'],
    ages: '12 a 17 años',
    schedule: '7:00 AM – 2:00 PM',
    description: 'Preparamos jóvenes integrales para la educación superior y la vida profesional. Un enfoque riguroso en ciencias, humanidades y tecnología, con orientación vocacional y desarrollo del liderazgo.',
    highlights: [
      'Preparación para pruebas de ingreso universitario',
      'Laboratorios de Física, Química y Biología',
      'Programa avanzado de inglés (Cambridge)',
      'Orientación vocacional desde 3er año',
      'Participación en olimpíadas académicas',
      'Proyecto de investigación en 5to año'
    ],
    color: 'from-vinotinto to-vinotinto-dark',
    subjects: ['Castellano y Literatura', 'Matemáticas', 'Física', 'Química', 'Biología', 'Historia de Venezuela', 'Geografía', 'Inglés', 'Educación Física', 'Informática', 'Premilitar', 'Orientación y Convivencia']
  }
];

const SPECIAL_PROGRAMS: ProgramData[] = [
  { Icon: Globe, title: 'Inglés Intensivo', desc: 'Programa de inmersión en inglés desde preescolar con certificación internacional.', badge: 'Cambridge' },
  { Icon: Globe, title: 'Francés', desc: 'Formación en lengua francesa como segundo idioma extranjero, ampliando horizontes culturales y oportunidades internacionales.', badge: 'Idiomas' },
];

const EVALUATION_SYSTEM = [
  { label: 'Evaluaciones continuas', value: '40%', desc: 'Talleres, actividades en clase y participación diaria' },
  { label: 'Trabajos y proyectos', value: '30%', desc: 'Investigaciones, exposiciones y proyectos interdisciplinarios' },
  { label: 'Evaluaciones sumativas', value: '30%', desc: 'Pruebas escritas y exámenes de lapso' },
];

// ── Sub-Components ──

const LevelCard = ({ level, index, isExpanded, onToggle }: { level: LevelData; index: number; isExpanded: boolean; onToggle: () => void }) => {
  const ref = React.useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.15 }}
      className="group"
    >
      <div
        onClick={onToggle}
        className={`relative bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-500 cursor-pointer ${
          isExpanded
            ? 'border-vinotinto/20 shadow-2xl shadow-vinotinto/5'
            : 'border-slate-100 shadow-[0_15px_40px_-15px_rgba(0,0,0,0.08)] hover:shadow-xl hover:border-slate-200'
        }`}
      >
        {/* Header */}
        <div className="p-8 md:p-10 flex items-start gap-6">
          <div className={`w-16 h-16 bg-gradient-to-br ${level.color} rounded-2xl flex items-center justify-center shadow-lg shrink-0 group-hover:scale-110 transition-transform duration-500`}>
            <div className="text-white">
              <level.Icon size={30} />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-black text-gold uppercase tracking-[0.3em] bg-gold/10 px-3 py-1 rounded-full">
                {level.subtitle}
              </span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Clock size={10} /> {level.schedule}
              </span>
            </div>
            <h4 className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tighter mb-2">
              {level.title}
            </h4>
            <p className="text-slate-500 text-sm font-medium leading-relaxed line-clamp-2">
              {level.description}
            </p>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.3 }}
            className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-vinotinto/5 transition-colors"
          >
            <ChevronDown size={20} className="text-slate-400" />
          </motion.div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="overflow-hidden"
            >
              <div className="px-8 md:px-10 pb-10 pt-2 border-t border-slate-50">
                <div className="grid md:grid-cols-2 gap-10 mt-8">
                  {/* Left: Details */}
                  <div className="space-y-8">
                    <div>
                      <h5 className="text-[10px] font-black text-vinotinto uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Target size={14} /> Aspectos Destacados
                      </h5>
                      <div className="space-y-3">
                        {level.highlights.map((h, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className="flex items-start gap-3"
                          >
                            <CheckCircle2 size={16} className="text-gold shrink-0 mt-0.5" />
                            <span className="text-sm text-slate-600 font-medium">{h}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h5 className="text-[10px] font-black text-vinotinto uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <Users size={14} /> Grados Disponibles
                      </h5>
                      <div className="flex flex-wrap gap-2">
                        {level.grades.map((g, i) => (
                          <span
                            key={i}
                            className="bg-slate-50 border border-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold hover:border-vinotinto/20 hover:bg-vinotinto/5 transition-all cursor-default"
                          >
                            {g}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gold/5 to-gold/10 border border-gold/15 rounded-2xl p-5 flex items-center gap-4">
                      <Calendar size={20} className="text-gold shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-gold uppercase tracking-widest">Edad de Ingreso</p>
                        <p className="text-slate-700 font-bold text-sm">{level.ages}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right: Subjects */}
                  <div>
                    <h5 className="text-[10px] font-black text-vinotinto uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                      <BookOpen size={14} /> Áreas de Formación
                    </h5>
                    <div className="bg-slate-50/80 rounded-2xl border border-slate-100 p-6">
                      <div className="grid grid-cols-1 gap-3">
                        {level.subjects.map((s, i) => (
                          <motion.div
                            key={i}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="flex items-center gap-3 group/sub"
                          >
                            <div className="w-2 h-2 rounded-full bg-vinotinto/20 group-hover/sub:bg-gold transition-colors shrink-0"></div>
                            <span className="text-sm text-slate-600 font-medium group-hover/sub:text-slate-800 transition-colors">{s}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="mt-6 bg-vinotinto/5 rounded-2xl p-5 flex items-center gap-4">
                      <Clock size={20} className="text-vinotinto shrink-0" />
                      <div>
                        <p className="text-[10px] font-black text-vinotinto uppercase tracking-widest">Horario</p>
                        <p className="text-slate-700 font-bold text-sm">{level.schedule}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

const ProgramCard = ({ program, delay }: { program: ProgramData; delay: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 25 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    whileHover={{ y: -8 }}
    className="relative group h-full"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-vinotinto/5 to-gold/5 rounded-[2rem] transform group-hover:scale-105 transition-transform duration-500 -z-10 blur-xl opacity-0 group-hover:opacity-100"></div>
    <div className="bg-white/80 backdrop-blur-xl border border-white/40 p-8 rounded-[2rem] h-full shadow-[0_15px_35px_-12px_rgba(0,0,0,0.06)] hover:shadow-xl transition-all duration-500 flex flex-col">
      <div className="flex items-start justify-between mb-6">
        <div className="w-14 h-14 bg-gradient-to-br from-vinotinto to-vinotinto-dark rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
          <div className="text-gold">
            <program.Icon size={24} />
          </div>
        </div>
        {program.badge && (
          <span className="text-[9px] font-black text-vinotinto uppercase tracking-widest bg-vinotinto/5 px-3 py-1.5 rounded-full border border-vinotinto/10">
            {program.badge}
          </span>
        )}
      </div>
      <h4 className="text-lg font-display font-black text-slate-800 tracking-tight mb-3">{program.title}</h4>
      <p className="text-slate-500 text-sm font-medium leading-relaxed flex-1">{program.desc}</p>
      <div className="mt-6 pt-5 border-t border-slate-50 flex items-center gap-2 text-vinotinto opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <span className="text-[10px] font-black uppercase tracking-widest">Más Info</span>
        <ArrowRight size={12} />
      </div>
    </div>
  </motion.div>
);


// ── Main Page ──

const Academia = () => {
  const [expandedLevel, setExpandedLevel] = React.useState<string | null>(null);

  const toggleLevel = (id: string) => {
    setExpandedLevel(prev => prev === id ? null : id);
  };

  return (
    <>
      {/* ═══════ Hero ═══════ */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-vinotinto-dark pt-[16vh] pb-16">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-vinotinto-dark via-vinotinto to-vinotinto-dark opacity-95"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,rgba(184,134,11,0.12),transparent_60%)]"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,rgba(184,134,11,0.08),transparent_50%)]"></div>
          {/* Decorative shapes */}
          <div className="absolute top-16 right-20 w-72 h-72 border border-gold/8 rounded-full opacity-20"></div>
          <div className="absolute bottom-16 left-16 w-48 h-48 border border-white/5 rounded-full"></div>
          <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] bg-gold/3 blur-[180px] rounded-full"></div>
          {/* Floating icons */}
          <div className="absolute top-[15%] right-[10%] text-white/5"><BookOpen size={120} /></div>
          <div className="absolute bottom-[20%] left-[8%] text-white/5"><GraduationCap size={90} /></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md text-gold border border-white/10 px-6 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.3em] mb-8 shadow-xl"
              >
                <span className="w-2 h-2 rounded-full bg-gold animate-pulse shadow-[0_0_10px_#b8860b]"></span>
                Excelencia Académica
              </motion.span>

              <h2 className="text-5xl lg:text-7xl font-display font-black mb-6 leading-[0.95] tracking-tighter text-white drop-shadow-2xl">
                Nuestra <br />
                <span className="text-gold italic">Oferta</span>{' '}
                Académica
              </h2>

              <p className="text-xl text-white/60 mb-10 max-w-xl font-medium leading-relaxed">
                Tres niveles educativos diseñados para desarrollar el potencial integral de cada estudiante, desde preescolar hasta la educación media general.
              </p>

              <div className="flex flex-wrap gap-5">
                {LEVELS.map((level, i) => (
                  <motion.button
                    key={level.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    onClick={() => {
                      setExpandedLevel(level.id);
                      document.getElementById('niveles')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white/10 backdrop-blur-md text-white border border-white/15 px-6 py-3 rounded-xl text-sm font-bold hover:bg-white/20 hover:border-white/30 transition-all flex items-center gap-2 group"
                  >
                    <level.Icon size={16} className="text-gold" />
                    {level.title}
                    <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform opacity-60" />
                  </motion.button>
                ))}
              </div>
            </motion.div>

            {/* Right side: visual element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1.2, delay: 0.4 }}
              className="hidden lg:flex justify-center items-center relative"
            >
              <div className="absolute inset-0 bg-gold/5 blur-[100px] rounded-full scale-150"></div>
              <div className="relative">
                {/* Stat cards floating */}
                <div className="relative w-80 h-80">
                  <motion.div
                    animate={{ y: [-8, 8, -8] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                    className="absolute top-0 left-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center">
                        <Heart size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-black text-lg leading-none">Preescolar</p>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">3 a 5 años</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [6, -6, 6] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                    className="absolute top-24 right-0 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                        <BookOpen size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-black text-lg leading-none">Primaria</p>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">1ero – 6to grado</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    animate={{ y: [-5, 10, -5] }}
                    transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                    className="absolute bottom-0 left-8 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-5 shadow-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-vinotinto to-vinotinto-dark rounded-xl flex items-center justify-center">
                        <GraduationCap size={18} className="text-gold" />
                      </div>
                      <div>
                        <p className="text-white font-black text-lg leading-none">Media General</p>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">1ero – 5to año</p>
                      </div>
                    </div>
                  </motion.div>


                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══════ Quick Stats ═══════ */}
      <section className="py-12 px-8 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <BookOpen size={22} />, stat: '3', label: 'Niveles Educativos' },
              { icon: <Users size={22} />, stat: '14', label: 'Grados Disponibles' },
              { icon: <Star size={22} />, stat: '2', label: 'Programas Especiales' },
              { icon: <Award size={22} />, stat: '99.7%', label: 'Éxito Académico' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-colors group cursor-default"
              >
                <div className="w-12 h-12 bg-vinotinto/5 rounded-xl flex items-center justify-center text-vinotinto group-hover:bg-vinotinto group-hover:text-gold transition-all duration-500 shrink-0">
                  {item.icon}
                </div>
                <div>
                  <p className="text-2xl font-display font-black text-slate-900 tracking-tighter leading-none">{item.stat}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{item.label}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Niveles Educativos (Accordion) ═══════ */}
      <section id="niveles" className="py-32 px-8 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-vinotinto/3 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-gold/3 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block"
            >
              Nuestra Propuesta
            </motion.span>
            <h3 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-none tracking-tighter italic">
              Niveles <span className="text-vinotinto underline decoration-gold/30 underline-offset-8">Educativos</span>
            </h3>
            <p className="text-slate-500 mt-6 text-lg font-medium max-w-2xl mx-auto">
              Selecciona un nivel para descubrir todo lo que ofrecemos en cada etapa formativa.
            </p>
            <div className="h-1.5 bg-gold mx-auto mt-8 rounded-full w-[100px]"></div>
          </div>

          <div className="space-y-6">
            {LEVELS.map((level, i) => (
              <LevelCard
                key={level.id}
                level={level}
                index={i}
                isExpanded={expandedLevel === level.id}
                onToggle={() => toggleLevel(level.id)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Programas Especiales ═══════ */}
      <section className="py-32 px-8 bg-white relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_20%,#7a002605,transparent)]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block"
            >
              Valor Diferencial
            </motion.span>
            <h3 className="text-5xl md:text-7xl font-display font-black text-slate-900 leading-none tracking-tighter italic">
              Programas <span className="text-vinotinto">Especiales</span>
            </h3>
            <p className="text-slate-500 mt-6 text-lg font-medium max-w-2xl mx-auto">
              Complementamos la formación académica con programas que desarrollan habilidades clave para el siglo XXI.
            </p>
            <div className="h-1.5 bg-gold mx-auto mt-8 rounded-full w-[100px]"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {SPECIAL_PROGRAMS.map((program, i) => (
              <ProgramCard key={i} program={program} delay={i * 0.08} />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ Sistema de Evaluación ═══════ */}
      <section className="py-32 px-8 bg-vinotinto-dark relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(184,134,11,0.1),transparent_60%)]"></div>
          <div className="absolute top-10 right-10 text-white/5"><Target size={120} /></div>
          <div className="absolute bottom-20 left-20 text-white/5"><Sparkles size={80} /></div>
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            {/* Left: Heading */}
            <div>
              <motion.span
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm mb-4 block"
              >
                Metodología
              </motion.span>
              <h3 className="text-5xl md:text-6xl font-display font-black text-white leading-tight tracking-tighter italic mb-8">
                Sistema de <span className="text-gold">Evaluación</span>
              </h3>
              <p className="text-white/50 text-lg font-medium leading-relaxed mb-10 max-w-lg">
                Nuestro sistema de evaluación es integral, continuo y formativo. Valoramos no solo el conocimiento, sino también las competencias, actitudes y el crecimiento personal de cada estudiante.
              </p>

              <div className="space-y-5">
                {[
                  'Evaluación diagnóstica al inicio de cada lapso',
                  'Reportes de progreso personalizados',
                  'Boletines digitales disponibles en el portal',
                  'Reuniones trimestrales con representantes',
                ].map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -15 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <CheckCircle2 size={18} className="text-gold shrink-0" />
                    <span className="text-white/70 text-sm font-medium">{item}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Right: Evaluation Distribution */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              {EVALUATION_SYSTEM.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 group hover:bg-white/10 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="text-white font-display font-black text-lg tracking-tight">{item.label}</h5>
                    <span className="text-gold font-display font-black text-3xl tracking-tighter">{item.value}</span>
                  </div>
                  <p className="text-white/40 text-sm font-medium">{item.desc}</p>
                  {/* Progress bar */}
                  <div className="mt-4 h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: item.value }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + i * 0.15, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-gold to-gold-light rounded-full"
                    ></motion.div>
                  </div>
                </motion.div>
              ))}

              <div className="bg-gold/10 border border-gold/20 rounded-2xl p-5 flex items-start gap-4 mt-8">
                <Sparkles size={20} className="text-gold shrink-0 mt-0.5" />
                <p className="text-white/60 text-sm font-medium leading-relaxed">
                  El sistema de evaluación se rige por las disposiciones del Ministerio del Poder Popular para la Educación, complementado con nuestros criterios institucionales de calidad.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>


      {/* ═══════ CTA Final ═══════ */}
      <section className="py-24 px-8 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,#7a002605,transparent)]"></div>
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <span className="text-gold font-display font-black uppercase tracking-[0.4em] text-sm block">¿Listo para empezar?</span>
            <h3 className="text-4xl md:text-6xl font-display font-black text-slate-900 leading-tight tracking-tighter italic">
              Forma parte de nuestra <span className="text-vinotinto">comunidad académica</span>
            </h3>
            <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
              Inicia hoy el proceso de admisión y bríndale a tu hijo la educación de excelencia que merece.
            </p>
            <div className="flex flex-wrap justify-center gap-6 pt-4">
              <motion.a
                href="/admisiones"
                whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -10px rgba(184, 134, 11, 0.4)" }}
                whileTap={{ scale: 0.98 }}
                className="bg-gradient-to-br from-gold to-[#966b07] text-vinotinto-dark px-10 py-5 font-display font-black rounded-xl transition-all shadow-2xl flex items-center gap-3 group relative overflow-hidden uppercase tracking-[0.2em] text-sm"
              >
                <span className="relative z-10">Proceso de Admisión</span>
                <ArrowRight size={18} className="relative z-10 group-hover:translate-x-2 transition-transform" />
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              </motion.a>
              <motion.a
                href="/admisiones#formulario"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="bg-vinotinto text-white px-10 py-5 font-display font-black rounded-xl transition-all shadow-xl hover:bg-vinotinto-dark uppercase tracking-widest text-sm flex items-center gap-3"
              >
                <Trophy size={18} /> Solicitar Información
              </motion.a>
            </div>
          </motion.div>
        </div>
      </section>
    </>
  );
};

export default Academia;
