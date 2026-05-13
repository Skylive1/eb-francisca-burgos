import React from 'react';

/**
 * COMPONENTE: TarjetaClase (CourseCard)
 * --------------------------------------------------------
 * Tarjeta de materia con sombras detalladas, banner de color,
 * efecto de profundidad en hover y etiqueta del profesor.
 */
const TarjetaClase = ({ title, instructor, imageColor, alHacerClic, esProfesor, alumnos }) => {
  return (
    <div 
      onClick={alHacerClic}
      className="
        bg-white/60 backdrop-blur-2xl rounded-2xl overflow-hidden cursor-pointer group
        border border-white/50
        shadow-[0_8px_32px_rgba(0,0,0,0.05)]
        hover:shadow-[0_20px_40px_rgba(96,0,16,0.15),0_8px_16px_rgba(0,0,0,0.08)]
        hover:border-gold/50
        transition-all duration-300
        transform hover:-translate-y-2
      "
    >
      
      {/* BANNER DE COLOR CON DETALLES */}
      <div className={`w-full h-36 ${imageColor} relative overflow-hidden`}>
        {/* Gradiente de brillo en la esquina superior */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-white/20 rounded-full -translate-x-8 -translate-y-8 blur-xl pointer-events-none"></div>
        {/* Gradiente oscuro en la parte inferior para dar profundidad */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/20 to-transparent pointer-events-none"></div>
        {/* Icono de libro sutil en la esquina */}
        <div className="absolute bottom-3 right-3 opacity-20 group-hover:opacity-40 transition-opacity">
          <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
          </svg>
        </div>
        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-300"></div>
      </div>
      
      {/* INFORMACIÓN DE LA MATERIA */}
      <div className="p-5">
        <h3 className="font-black text-gray-800 text-base mb-2 group-hover:text-vinotinto-700 transition-colors line-clamp-2 leading-snug tracking-tight">
          {title}
        </h3>

        {esProfesor ? (
          <div className="flex items-center gap-2 mt-3">
            <div className="bg-vinotinto-50 px-2 py-1 rounded-lg border border-vinotinto-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[9px] font-black text-vinotinto-600 uppercase">
                {alumnos} Alumnos
              </span>
            </div>
            <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Inscritos</p>
          </div>
        ) : (
          <div className="flex items-center gap-2 mt-3">
            <div className="w-6 h-6 rounded-full bg-vinotinto-50 border border-vinotinto-100 flex items-center justify-center flex-shrink-0">
              <span className="text-[8px] font-black text-vinotinto-600 uppercase">
                {instructor?.charAt(0)}
              </span>
            </div>
            <p className="text-gray-400 text-xs font-bold truncate">{instructor}</p>
          </div>
        )}

        {/* Barra inferior dorada al hacer hover */}
        <div className="mt-4 h-0.5 w-0 bg-gradient-to-r from-gold to-vinotinto-600 rounded-full group-hover:w-full transition-all duration-500"></div>
      </div>

    </div>
  );
};

export default TarjetaClase;
