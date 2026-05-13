import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { User, Camera, Mail, Phone, CreditCard, Save, ShieldCheck } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

const GestionPerfil = ({ infoUsuario, rol, alActualizar }) => {
  const [datos, setDatos] = useState({
    nombre: infoUsuario.nombre || '',
    apellido: infoUsuario.apellido || '',
    cedula: infoUsuario.cedula || '',
    telefono: infoUsuario.telefono || '',
    email: infoUsuario.email || '',
    img: infoUsuario.img || '/Fondo-Nuevo.png'
  });

  const [editando, setEditando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [datosOriginales, setDatosOriginales] = useState(null);

  const cargarPerfil = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        const partesNombre = (data.full_name || '').split(' ');
        const nuevosDatos = {
          nombre: partesNombre[0] || '',
          apellido: partesNombre.slice(1).join(' ') || '',
          cedula: data.id_card || '',
          telefono: data.phone || '',
          email: data.email || '',
          img: data.avatar_url || '/Fondo-Nuevo.png'
        };
        setDatos(nuevosDatos);
        setDatosOriginales(nuevosDatos);
      }
    }
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const iniciarEdicion = () => {
    setDatosOriginales({ ...datos });
    setEditando(true);
  };

  const cancelarEdicion = () => {
    if (datosOriginales) {
      setDatos(datosOriginales);
    }
    setEditando(false);
  };

  const manejarCambio = (e) => {
    const { name, value } = e.target;
    setDatos(prev => ({ ...prev, [name]: value }));
  };

  const guardarCambios = async () => {
    setSubiendo(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const full_name = `${datos.nombre} ${datos.apellido}`.trim();
      const { error } = await supabase.from('profiles').update({
        full_name: full_name,
        id_card: datos.cedula,
        phone: datos.telefono,
        email: datos.email,
        avatar_url: datos.img
      }).eq('id', user.id);

      if (!error) {
        setDatosOriginales({ ...datos });
        if (alActualizar) alActualizar(datos);
        alert('¡Perfil actualizado con éxito!');
      } else {
        alert('Hubo un error al actualizar: ' + error.message);
      }
    }
    
    setEditando(false);
    setSubiendo(false);
  };

  const [showSolicitudModal, setShowSolicitudModal] = useState(false);
  const [solicitudData, setSolicitudData] = useState({ campo: 'email', valor: '' });
  const [enviandoSolicitud, setEnviandoSolicitud] = useState(false);

  const manejarSolicitud = async () => {
    if (!solicitudData.valor) return alert("Ingresa el nuevo valor");
    setEnviandoSolicitud(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('profile_requests').insert({
        user_id: user.id,
        field_name: solicitudData.campo,
        new_value: solicitudData.valor,
        status: 'pending'
      });
      if (error) throw error;
      alert("Solicitud enviada al administrador con éxito.");
      setShowSolicitudModal(false);
    } catch (err) {
      alert("Error al enviar solicitud: " + err.message);
    } finally {
      setEnviandoSolicitud(false);
    }
  };

  const dispararInputFile = () => {
    document.getElementById('input-foto').click();
  };

  const manejarFoto = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1000000) {
        alert('La imagen es muy pesada. Máximo 1MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setDatos(prev => ({ ...prev, img: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <Motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto"
    >
      {/* HEADER DE PERFIL */}
      <div className="flex flex-col md:flex-row justify-end items-end mb-10 pb-6 border-b border-gray-200 gap-4">
        <div className="flex gap-3">
          {editando && !subiendo && (
            <button 
              onClick={cancelarEdicion}
              className="px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest bg-gray-100 text-gray-500 hover:bg-gray-200 transition-all shadow-sm"
            >
              Cancelar
            </button>
          )}
          <button 
            onClick={() => editando ? guardarCambios() : iniciarEdicion()}
            disabled={subiendo}
            className={`px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg ${editando ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-vinotinto-800 text-white hover:bg-vinotinto-900'}`}
          >
            {subiendo ? (
               <>
                 <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                 Sincronizando...
               </>
            ) : editando ? (
               <><Save className="w-4 h-4" /> Guardar Cambios</>
            ) : (
               <><ShieldCheck className="w-4 h-4" /> Editar Información</>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* COLUMNA IZQUIERDA: FOTO */}
        <div className="flex flex-col items-center gap-6">
          <div className="relative group">
            <div className={`w-64 h-64 rounded-[3rem] overflow-hidden border-8 ${editando ? 'border-gold animate-pulse' : 'border-white'} shadow-2xl transition-all`}>
              <img src={datos.img} alt="Foto de Perfil" className="w-full h-full object-cover" />
              {editando && (rol === 'admin' || rol === 'teacher' || rol === 'profesor' || rol === 'cafetin') && (
                <div 
                  onClick={dispararInputFile}
                  className="absolute inset-0 bg-black/40 backdrop-blur-sm flex flex-col items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-all text-white"
                >
                  <Camera className="w-10 h-10 mb-2" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Cambiar Foto</span>
                </div>
              )}
            </div>
            <input 
              id="input-foto"
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={manejarFoto}
            />
          </div>
          <div className="text-center">
            <p className="text-xl font-black text-gray-900 uppercase italic tracking-tighter">{datos.nombre} {datos.apellido}</p>
            <p className="text-[10px] font-bold text-vinotinto-600 uppercase tracking-[0.3em] mt-2 bg-vinotinto-50 px-4 py-1.5 rounded-full inline-block">
              {infoUsuario.cargo}
            </p>
          </div>
        </div>

        {/* COLUMNA DERECHA: FORMULARIO */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-xl space-y-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* NOMBRE (EDITABLE PARA PROFESOR/ADMIN/CAFETIN) */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Nombre(s) {(rol !== 'admin' && rol !== 'teacher' && rol !== 'profesor' && rol !== 'cafetin') && <span className="text-vinotinto-400 lowercase font-bold">(Solo lectura)</span>}
                  </label>
                  <div className="relative">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${(rol === 'admin' || rol === 'teacher' || rol === 'profesor' || rol === 'cafetin') ? 'text-vinotinto-800' : 'text-gray-400'}`} />
                    <input 
                      type="text"
                      name="nombre"
                      disabled={!editando || (rol !== 'admin' && rol !== 'teacher' && rol !== 'profesor' && rol !== 'cafetin')}
                      value={datos.nombre}
                      onChange={manejarCambio}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl font-bold transition-all ${(!editando || (rol !== 'admin' && rol !== 'teacher' && rol !== 'profesor' && rol !== 'cafetin')) ? 'bg-gray-100 text-gray-400 cursor-not-allowed italic border-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-vinotinto-500 outline-none border'}`}
                    />
                  </div>
                </div>

                {/* APELLIDO (EDITABLE PARA PROFESOR/ADMIN/CAFETIN) */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                    Apellido(s) {(rol !== 'admin' && rol !== 'teacher' && rol !== 'profesor' && rol !== 'cafetin') && <span className="text-vinotinto-400 lowercase font-bold">(Solo lectura)</span>}
                  </label>
                  <div className="relative">
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${(rol === 'admin' || rol === 'teacher' || rol === 'profesor' || rol === 'cafetin') ? 'text-vinotinto-800' : 'text-gray-400'}`} />
                    <input 
                      type="text"
                      name="apellido"
                      disabled={!editando || (rol !== 'admin' && rol !== 'teacher' && rol !== 'profesor' && rol !== 'cafetin')}
                      value={datos.apellido}
                      onChange={manejarCambio}
                      className={`w-full pl-12 pr-4 py-4 rounded-2xl font-bold transition-all text-base ${(!editando || (rol !== 'admin' && rol !== 'teacher' && rol !== 'profesor' && rol !== 'cafetin')) ? 'bg-gray-100 text-gray-400 cursor-not-allowed italic border-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-vinotinto-500 outline-none border'}`}
                    />
                  </div>
                </div>

               {/* CÉDULA (BLOQUEADO SIEMPRE SALVO ADMIN) */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Cédula de Identidad {rol !== 'admin' && <span className="text-vinotinto-400 lowercase font-bold">(Protegido)</span>}</label>
                 <div className="relative">
                   <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                   <input 
                     type="text"
                     name="cedula"
                     disabled={!editando || rol !== 'admin'}
                     value={datos.cedula}
                     onChange={manejarCambio}
                     className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-800 font-bold disabled:text-gray-400 disabled:cursor-not-allowed italic text-base"
                   />
                 </div>
               </div>

               {/* TELÉFONO (EDITABLE PARA CAFETIN/ADMIN) */}
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Número de Teléfono {(rol !== 'admin' && rol !== 'cafetin') && <span className="text-vinotinto-400 lowercase font-bold">(Protegido)</span>}</label>
                 <div className="relative">
                   <Phone className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 ${(rol === 'admin' || rol === 'cafetin') ? 'text-vinotinto-800' : 'text-gray-400'}`} />
                   <input 
                     type="text"
                     name="telefono"
                     disabled={!editando || (rol !== 'admin' && rol !== 'cafetin')}
                     value={datos.telefono}
                     onChange={manejarCambio}
                     className={`w-full pl-12 pr-4 py-4 rounded-2xl font-bold transition-all ${(!editando || (rol !== 'admin' && rol !== 'cafetin')) ? 'bg-gray-100 text-gray-400 cursor-not-allowed italic border-gray-200' : 'bg-gray-50 border-gray-100 text-gray-800 focus:bg-white focus:border-vinotinto-500 outline-none border'}`}
                     placeholder="Ej: +58 412 1234567"
                   />
                 </div>
               </div>
            </div>

            {/* EMAIL (BLOQUEADO SIEMPRE SALVO ADMIN) */}
            <div className="space-y-2">
              <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Correo Electrónico Institucional {rol !== 'admin' && <span className="text-vinotinto-400 lowercase font-bold">(Protegido)</span>}</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="email"
                  name="email"
                  disabled={!editando || rol !== 'admin'}
                  value={datos.email}
                  onChange={manejarCambio}
                  className="w-full pl-12 pr-4 py-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-800 italic font-bold disabled:text-gray-400 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* BOTÓN SOLICITUD CAMBIO (Para Profesor/Estudiante/Cafetin) */}
            {(rol !== 'admin') && editando && (
              <button 
                type="button"
                onClick={() => setShowSolicitudModal(true)}
                className="w-full py-3 bg-vinotinto-50 text-vinotinto-800 rounded-2xl text-[9px] font-black uppercase tracking-widest border border-vinotinto-100 hover:bg-vinotinto-100 transition-all"
              >
                Solicitar cambio de datos sensibles al Administrador
              </button>
            )}

            {/* MODAL DE SOLICITUD */}
            <AnimatePresence>
               {showSolicitudModal && (
                 <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <Motion.div 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onClick={() => setShowSolicitudModal(false)}
                      className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />
                    <Motion.div 
                      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                      className="relative bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl"
                    >
                       <h3 className="text-2xl font-black italic uppercase tracking-tighter mb-6">Solicitud de <span className="text-vinotinto-800">Cambio</span></h3>
                       <div className="space-y-6">
                          <div>
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">¿Qué dato quieres cambiar?</label>
                             <select 
                               value={solicitudData.campo}
                               onChange={(e) => setSolicitudData({...solicitudData, campo: e.target.value})}
                               className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black outline-none"
                             >
                                <option value="email">Correo Electrónico</option>
                                <option value="phone">Número de Teléfono</option>
                             </select>
                          </div>
                          <div>
                             <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 block ml-1">Nuevo valor deseado</label>
                             <input 
                               type="text"
                               placeholder={solicitudData.campo === 'email' ? 'ejemplo@correo.com' : '+58 412...'}
                               value={solicitudData.valor}
                               onChange={(e) => setSolicitudData({...solicitudData, valor: e.target.value})}
                               className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-6 py-4 text-sm font-black outline-none"
                             />
                          </div>
                          <div className="flex gap-4 pt-4">
                             <button onClick={() => setShowSolicitudModal(false)} className="flex-1 py-4 bg-gray-100 text-gray-500 rounded-2xl text-[10px] font-black uppercase tracking-widest">Cancelar</button>
                             <button 
                               onClick={manejarSolicitud}
                               disabled={enviandoSolicitud}
                               className="flex-[2] py-4 bg-vinotinto-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg"
                             >
                                {enviandoSolicitud ? 'Enviando...' : 'Enviar Solicitud'}
                             </button>
                          </div>
                       </div>
                    </Motion.div>
                 </div>
               )}
            </AnimatePresence>

            <div className="pt-4 flex items-start gap-4 p-6 bg-red-50 rounded-[2rem] border border-red-100">
               <div className="w-8 h-8 rounded-full bg-red-600/20 flex items-center justify-center text-red-600 animate-pulse mt-1 shrink-0">
                  <ShieldCheck className="w-5 h-5" />
               </div>
               <p className="text-[11px] text-red-900 font-bold leading-relaxed italic">
                 {rol === 'admin' 
                   ? 'Estás editando en Modo Administrador. Los cambios hechos aquí afectarán la cuenta a nivel global del sistema.' 
                   : rol === 'cafetin'
                   ? 'Como Personal de Cafetín, puedes actualizar tu Nombre, Apellido y Teléfono. Tu correo y foto de perfil están protegidos por seguridad institucional. Si necesitas cambiarlos, solicita el cambio al Administrador.'
                   : rol === 'teacher' || rol === 'profesor'
                   ? 'Como Docente, puedes actualizar tu Foto, Nombre y Apellido. Tu correo, teléfono y cédula están protegidos por seguridad institucional. Si necesitas cambiarlos, usa el botón de solicitud.'
                   : 'Por razones de seguridad institucional, tus datos de identidad (Cédula, Teléfono y Correo) están protegidos. Para solicitar un cambio, usa el botón de solicitud arriba.'}
               </p>
            </div>

          </div>
        </div>
      </div>
    </Motion.div>
  );
};

export default GestionPerfil;
