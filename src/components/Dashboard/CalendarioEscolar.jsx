import React, { useState } from 'react';
import { motion as Motion } from 'framer-motion';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal 
} from 'lucide-react';

const CalendarioEscolar = () => {
  const [fechaActual, setFechaActual] = useState(new Date());

  const meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  
  const obtenerDiasDelMes = (fecha) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1).getDay();
    const ultimoDia = new Date(año, mes + 1, 0).getDate();
    return { primerDia, ultimoDia };
  };

  const { primerDia, ultimoDia } = obtenerDiasDelMes(fechaActual);
  const dias = Array.from({ length: ultimoDia }, (_, i) => i + 1);

  const cambiarMes = (offset) => {
    const nuevaFecha = new Date(fechaActual.getFullYear(), fechaActual.getMonth() + offset, 1);
    setFechaActual(nuevaFecha);
  };

  const irAHoy = () => {
    setFechaActual(new Date());
  };

  const hoy = new Date();
  const esHoy = (dia) => {
    return hoy.getDate() === dia && 
           hoy.getMonth() === fechaActual.getMonth() && 
           hoy.getFullYear() === fechaActual.getFullYear();
  };

  return (
    <Motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full"
    >
      <div className="space-y-6">
        <div className="flex justify-between items-center bg-gray-50/50 p-3 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-vinotinto-800 rounded-lg flex items-center justify-center text-white shadow-md">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-gray-900 uppercase italic tracking-tighter leading-none">
                {meses[fechaActual.getMonth()]} {fechaActual.getFullYear()}
              </h2>
              <p className="text-[8px] font-bold text-vinotinto-600 uppercase tracking-widest mt-0.5">
                Agenda
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-1">
            <button 
              onClick={() => cambiarMes(-1)}
              className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-vinotinto-800 transition-all active:scale-90"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <button 
              onClick={irAHoy}
              title="Ir a hoy"
              className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-vinotinto-800 transition-all active:scale-90 flex items-center justify-center"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            <button 
              onClick={() => cambiarMes(1)}
              className="p-1.5 hover:bg-white rounded-lg text-gray-400 hover:text-vinotinto-800 transition-all active:scale-90"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {diasSemana.map(dia => (
            <div key={dia} className="py-1 text-center text-[8px] font-black text-gray-400 uppercase tracking-widest">
              {dia}
            </div>
          ))}
          
          {/* Espacios vacíos para el offset */}
          {Array.from({ length: primerDia }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square rounded-lg bg-gray-50/30"></div>
          ))}

          {dias.map(dia => (
            <div 
              key={dia} 
              className={`aspect-square flex items-center justify-center rounded-lg text-[10px] font-bold transition-all relative group cursor-pointer
                ${esHoy(dia) 
                  ? 'bg-vinotinto-800 text-white shadow-md shadow-vinotinto-200' 
                  : 'hover:bg-vinotinto-50 text-gray-600 hover:text-vinotinto-800'}
              `}
            >
              {dia}
            </div>
          ))}
        </div>
      </div>
    </Motion.div>
  );
};

export default CalendarioEscolar;
