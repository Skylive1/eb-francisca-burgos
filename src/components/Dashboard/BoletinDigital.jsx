import React, { useRef, useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { Download, FileText, Award, TrendingUp, ChevronRight, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { supabase } from '../../lib/supabaseClient';

const BoletinDigital = () => {
  const [descargando, setDescargando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calificaciones, setCalificaciones] = useState([]);
  const [perfil, setPerfil] = useState(null);
  const boletinRef = useRef(null);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Obtener Perfil
          const { data: prof } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          setPerfil(prof);

          // 2. Obtener Calificaciones
          const { data: grades, error } = await supabase
            .from('grades')
            .select('*')
            .eq('student_id', user.id);
          
          if (error) throw error;

          // Agrupar calificaciones por materia (ya que en la DB son registros individuales)
          const agrupadas = grades.reduce((acc, current) => {
            const index = acc.findIndex(item => item.materia === current.subject);
            if (index > -1) {
              if (current.term === '1er Lapso') acc[index].lapso1 = current.score;
              if (current.term === '2do Lapso') acc[index].lapso2 = current.score;
              if (current.term === '3er Lapso') acc[index].lapso3 = current.score;
            } else {
              acc.push({
                materia: current.subject,
                lapso1: current.term === '1er Lapso' ? current.score : '-',
                lapso2: current.term === '2do Lapso' ? current.score : '-',
                lapso3: current.term === '3er Lapso' ? current.score : '-',
              });
            }
            return acc;
          }, []);

          // Calcular promedios
          const conPromedio = agrupadas.map(a => {
            const notas = [a.lapso1, a.lapso2, a.lapso3].filter(n => typeof n === 'number');
            const promedio = notas.length > 0 ? (notas.reduce((a, b) => a + b, 0) / notas.length).toFixed(1) : '-';
            return { ...a, promedio };
          });

          setCalificaciones(conPromedio);
        }
      } catch (error) {
        console.error("Error fetching grades:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const promedioGeneral = calificaciones.length > 0 
    ? (calificaciones.filter(c => c.promedio !== '-').reduce((acc, curr) => acc + parseFloat(curr.promedio), 0) / calificaciones.filter(c => c.promedio !== '-').length).toFixed(1)
    : '0.0';


  const descargarPDF = async () => {
    if (!boletinRef.current) return;
    setDescargando(true);

    try {
      // Guardamos la posición original del scroll
      const scrollY = window.scrollY;
      window.scrollTo(0, 0);

      const element = boletinRef.current;
      
      // Optimizaciones para html2canvas
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc) => {
          // Aseguramos que el elemento sea visible y tenga estilos correctos en el clon
          const clonedElement = clonedDoc.getElementById('boletin-content');
          if (clonedElement) {
            clonedElement.style.padding = '40px';
          }
        }
      });
      
      const imgWidth = 595.28; // A4 width in pts
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      const pdf = new jsPDF('p', 'pt', 'a4');
      const imgData = canvas.toDataURL('image/png', 1.0);

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save('Boletin_Oficial_2026.pdf');

      // Restauramos el scroll
      window.scrollTo(0, scrollY);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Hubo un error al generar el PDF. Por favor intente de nuevo.');
    } finally {
      setDescargando(false);
    }
  };

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* CABECERA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] border border-white shadow-xl">
        <div>
          <h2 className="text-4xl font-black text-gray-900 tracking-tighter uppercase italic font-display">Calificaciones</h2>
          <p className="text-gray-500 font-medium mt-1">Año Escolar 2025 - 2026 • 4to Año Sección "A"</p>
        </div>
        <button 
          onClick={descargarPDF}
          disabled={descargando}
          className="flex items-center gap-3 px-8 py-4 bg-vinotinto-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-vinotinto-950 transition-all shadow-lg shadow-vinotinto-200 active:scale-95 group disabled:opacity-70 disabled:cursor-wait"
        >
          {descargando ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Download className="w-5 h-5 group-hover:bounce" />
          )}
          {descargando ? 'Generando...' : 'Descargar PDF'}
        </button>
      </div>

      <div ref={boletinRef} id="boletin-content" className="space-y-8 p-4 bg-transparent rounded-[2.5rem]">

        {/* TABLA DE CALIFICACIONES (ESTILO BOLETÍN OFICIAL) */}
        <div className="bg-white rounded-[1rem] border-2 border-gray-200 shadow-sm overflow-hidden p-10 space-y-10">
          
          {/* ENCABEZADO OFICIAL VENEZOLANO */}
          <div className="text-center space-y-1 border-b-2 border-vinotinto-800 pb-6">
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">República Bolivariana de Venezuela</p>
            <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Ministerio del Poder Popular para la Educación</p>
            <p className="text-[12px] font-black text-vinotinto-800 uppercase tracking-[0.2em] mt-2">U.E.P. "Francisca Elena Burgos Delmoral"</p>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Dabajuro - Estado Falcón • Código Plantel: PD00341105</p>
          </div>

          {/* TÍTULO DEL DOCUMENTO */}
          <div className="text-center">
            <h3 className="text-2xl font-black text-gray-900 uppercase tracking-[0.3em] italic border-b border-gray-100 pb-2 inline-block">CERTIFICACIÓN DE CALIFICACIONES</h3>
            <p className="text-[10px] font-bold text-gray-500 uppercase mt-2">Año Escolar: 2025 - 2026</p>
          </div>

          {/* DATOS DEL ESTUDIANTE (GRID FORMAL) */}
          <div className="grid grid-cols-2 gap-y-4 text-[11px] bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
            <div className="flex gap-2">
              <span className="font-black text-vinotinto-800 uppercase">Apellidos y Nombres:</span>
              <span className="font-medium text-gray-700 uppercase underline decoration-dotted underline-offset-4">{perfil?.full_name || 'Cargando...'}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-black text-vinotinto-800 uppercase">Cédula de Identidad:</span>
              <span className="font-medium text-gray-700 uppercase underline decoration-dotted underline-offset-4">{perfil?.id_card || 'V-XXXXXXXX'}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-black text-vinotinto-800 uppercase">Grado / Año:</span>
              <span className="font-medium text-gray-700 uppercase underline decoration-dotted underline-offset-4">{perfil?.grade_level || 'Cargando...'}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-black text-vinotinto-800 uppercase">Sección:</span>
              <span className="font-medium text-gray-700 uppercase underline decoration-dotted underline-offset-4">"A"</span>
            </div>
          </div>

          {/* TABLA DE CALIFICACIONES CON BORDES FORMALES */}
          <div className="border-2 border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-vinotinto-800 text-white">
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest border-r border-white/20">Asignaturas</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center border-r border-white/20">1er Lapso</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center border-r border-white/20">2do Lapso</th>
                  <th className="px-4 py-4 text-[10px] font-black uppercase tracking-widest text-center border-r border-white/20">3er Lapso</th>
                  <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-center">Calif. Final</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-gray-200">
                {loading ? (
                   <tr>
                     <td colSpan={5} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                           <Loader2 className="w-8 h-8 animate-spin text-vinotinto-800" />
                           <p className="text-[10px] font-black uppercase text-gray-400">Cargando Calificaciones Oficiales...</p>
                        </div>
                     </td>
                   </tr>
                ) : calificaciones.length === 0 ? (
                  <tr>
                     <td colSpan={5} className="py-20 text-center">
                        <p className="text-[10px] font-black uppercase text-gray-400">No se han cargado calificaciones para este periodo.</p>
                     </td>
                   </tr>
                ) : calificaciones.map((nota, index) => (
                  <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}>
                    <td className="px-6 py-4 border-r-2 border-gray-200">
                      <span className="font-black text-gray-800 text-[11px] uppercase tracking-tight">{nota.materia}</span>
                    </td>
                    <td className="px-4 py-4 text-center border-r-2 border-gray-200 font-bold text-gray-600 text-xs">{nota.lapso1}</td>
                    <td className="px-4 py-4 text-center border-r-2 border-gray-200 font-bold text-gray-600 text-xs">{nota.lapso2}</td>
                    <td className="px-4 py-4 text-center border-r-2 border-gray-200 font-bold text-gray-600 text-xs">{nota.lapso3}</td>
                    <td className="px-6 py-4 text-center font-black text-gray-900 text-sm bg-vinotinto-50/50">
                      {nota.promedio}
                    </td>
                  </tr>
                ))}
                <tr className="bg-vinotinto-900 text-white">
                  <td className="px-6 py-4 font-black uppercase text-[10px] tracking-widest text-right" colSpan={4}>Promedio General de Rendimiento:</td>
                  <td className="px-6 py-4 text-center font-black text-lg">{promedioGeneral}</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          {/* ÁREA DE FIRMAS Y SELLOS (LO MÁS IMPORTANTE PARA EL REALISMO) */}
          <div className="grid grid-cols-3 gap-10 pt-16 pb-10">
            <div className="flex flex-col items-center">
              <div className="w-full h-px bg-gray-400 mb-2"></div>
              <p className="text-[8px] font-black text-gray-500 uppercase">Firma del Docente Guía</p>
            </div>
            <div className="flex flex-col items-center relative">
              {/* Sello Digital Simulado */}
              <div className="absolute -top-12 w-24 h-24 border-4 border-vinotinto-800/20 rounded-full flex items-center justify-center rotate-12 pointer-events-none">
                <p className="text-[8px] font-black text-vinotinto-800/20 uppercase text-center leading-none">SELLO<br/>INSTITUCIONAL<br/>F.E.B.D</p>
              </div>
              <div className="w-full h-px bg-gray-400 mb-2"></div>
              <p className="text-[8px] font-black text-gray-500 uppercase">Firma del Director(a)</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-full h-px bg-gray-400 mb-2"></div>
              <p className="text-[8px] font-black text-gray-500 uppercase">Sello de la Institución</p>
            </div>
          </div>

          {/* PIE DE PÁGINA OFICIAL */}
          <div className="flex justify-between items-end border-t border-gray-100 pt-6">
            <div className="text-[8px] font-bold text-gray-400 uppercase space-y-1">
              <p>Fecha de Emisión: 24 de Abril de 2026</p>
              <p>Validez: Documento generado digitalmente a través del Sistema Francisca Elena</p>
            </div>
            <div className="flex items-center gap-3 grayscale opacity-40">
              <img src="/Fondo-Nuevo.png" alt="Watermark" className="h-10 w-auto" />
            </div>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

export default BoletinDigital;
