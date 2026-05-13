import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Search, Shield, UserCircle, Loader2, Trash2, Edit2, 
  Plus, Mail, Lock, Save, X, Smartphone, Camera, GraduationCap,
  Briefcase, Hash, Phone, Key
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import SolicitudesAdmin from '../Dashboard/SolicitudesAdmin';

const GestionUsuarios = ({ isDarkMode }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [roleFilter, setRoleFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showSolicitudes, setShowSolicitudes] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  
  const [newUser, setNewUser] = useState({
    email: '', 
    cedula: '', 
    password: '', 
    full_name: '', 
    role: 'student', 
    avatar_url: '', 
    grade: '',
    phone: ''
  });

  useEffect(() => { 
    fetchUsers(); 
    fetchPendingCount();
  }, []);

  const fetchPendingCount = async () => {
    const { count } = await supabase
      .from('profile_requests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');
    setPendingRequestsCount(count || 0);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('profiles').select('*').order('full_name');
      if (error) throw error;
      setUsers(data || []);
    } catch (error) { 
      console.error(error); 
    } finally { 
      setLoading(false); 
    }
  };

  const resetForm = () => {
    setNewUser({
      email: '', cedula: '', password: '', full_name: '', role: 'student', avatar_url: '', grade: '', phone: ''
    });
    setEditingUserId(null);
    setIsEditing(false);
  };

  const handleEditClick = (user) => {
    setNewUser({
      full_name: user.full_name || '', 
      email: user.email || '', 
      cedula: user.id_card || '',
      role: user.role || 'student', 
      password: '', // No mostramos la contraseña actual por seguridad
      avatar_url: user.avatar_url || '', 
      grade: user.grade || '',
      phone: user.phone || ''
    });
    setEditingUserId(user.id);
    setIsEditing(true);
    setShowCreateModal(true);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Crear usuario en Auth
      const { data, error: authError } = await supabase.auth.signUp({
        email: newUser.email, 
        password: newUser.password,
        options: { 
          data: { 
            full_name: newUser.full_name, 
            role: newUser.role 
          } 
        }
      });
      if (authError) throw authError;

      if (data.user) {
        // 2. Crear perfil en la tabla 'profiles'
        const { error: profileError } = await supabase.from('profiles').upsert({
          id: data.user.id, 
          full_name: newUser.full_name, 
          role: newUser.role,
          id_card: newUser.cedula, 
          email: newUser.email, 
          phone: newUser.phone,
          grade: newUser.role === 'student' ? newUser.grade : null,
          avatar_url: newUser.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.full_name)}&background=random`
        });
        if (profileError) throw profileError;
      }
      
      setShowCreateModal(false);
      resetForm();
      fetchUsers();
      alert('Usuario creado exitosamente');
    } catch (error) { 
      alert('Error: ' + error.message); 
    } finally { 
      setUpdating(false); 
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUpdating(true);
    try {
      // 1. Actualizar perfil en la tabla 'profiles'
      const { error: profileError } = await supabase.from('profiles').update({
        full_name: newUser.full_name, 
        email: newUser.email, 
        id_card: newUser.cedula,
        role: newUser.role, 
        phone: newUser.phone,
        grade: newUser.role === 'student' ? newUser.grade : null
      }).eq('id', editingUserId);

      if (profileError) throw profileError;

      // 2. Intentar actualizar contraseña si se proporcionó una nueva
      if (newUser.password && newUser.password.trim() !== '') {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        let authError = null;

        if (currentUser && currentUser.id === editingUserId) {
          // Si el admin se está editando a sí mismo, puede cambiar su propia contraseña sin service_role
          const { error } = await supabase.auth.updateUser({ password: newUser.password });
          authError = error;
        } else {
          // Para otros usuarios, usamos la Edge Function
          console.log("Invocando función de cambio de contraseña para:", editingUserId);
          
          try {
            const { data, error } = await supabase.functions.invoke('clever-action', {
              body: { 
                userId: editingUserId, 
                newPassword: newUser.password 
              }
            });
            
            if (error) {
              // Error de red o de la plataforma Supabase (ej: 404 si no está desplegada)
              console.error("Error de invocación:", error);
              authError = new Error(`Error de conexión con la función: ${error.message || 'La función no responde o no existe'}`);
            } else if (data && data.success === false) {
              // Error devuelto por la lógica de nuestra función (ej: no es admin, contraseña corta)
              authError = new Error(data.error || 'Error desconocido en el servidor');
            } else if (!data || (data && !data.success && !data.message)) {
              // Caso borde donde no hay ni éxito ni error claro
              if (data && data.error) authError = new Error(data.error);
              else authError = new Error('Respuesta inesperada del servidor');
            }
          } catch (invokeError) {
            authError = invokeError;
          }
        }
        
        if (authError) {
          console.error("No se pudo actualizar la contraseña:", authError);
          alert(`⚠️ Perfil guardado, pero la CONTRASEÑA NO se pudo cambiar.\n\nERROR: ${authError.message}\n\nPosibles causas:\n1. La Edge Function no ha sido desplegada.\n2. No tienes permisos de administrador en la tabla 'profiles'.\n3. Falta configurar la Service Role Key en Supabase.`);
        } else {
          alert('✅ Usuario y contraseña actualizados correctamente');
        }
      } else {
        alert('✅ Usuario actualizado correctamente');
      }

      setShowCreateModal(false);
      resetForm();
      fetchUsers();
    } catch (error) { 
      console.error("Error general:", error);
      alert('Error: ' + error.message); 
    } finally { 
      setUpdating(false); 
    }
  };

  const handleDeleteUser = async (user) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${user.full_name}? Esta acción eliminará su perfil y todos sus datos vinculados permanentemente.`)) {
      return;
    }

    setUpdating(true);
    try {
      console.log("Iniciando eliminación para:", user.id);
      
      // 1. Intentar usar la Edge Function (Borra Auth + Perfil + Datos por Cascada)
      const { data, error: invokeError } = await supabase.functions.invoke('clever-action', {
        body: { userId: user.id, action: 'deleteUser' }
      });

      if (!invokeError && data?.success) {
        alert('✅ Usuario y cuenta de acceso eliminados exitosamente.');
        fetchUsers();
        return;
      }

      // 2. Fallback: Borrar el perfil (La base de datos limpiará el resto por el CASCADE)
      console.warn("Edge Function no disponible, usando borrado por cascada de base de datos...");
      
      // Usamos .select() para verificar si realmente se borró algo
      const { data: deletedData, error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id)
        .select();
      
      if (profileError) {
        throw new Error(`Error de Base de Datos: ${profileError.message}`);
      }

      if (!deletedData || deletedData.length === 0) {
        alert('⚠️ ATENCIÓN: El comando se ejecutó pero NO se borró ninguna fila en la base de datos.\n\nEsto suele pasar por:\n1. No tienes permisos de administrador en las políticas RLS de Supabase.\n2. El usuario ya no existe.\n\nVerifica las políticas RLS de la tabla "profiles".');
      } else {
        alert('✅ Perfil y datos vinculados eliminados exitosamente (vía Cascada).');
      }
      
      fetchUsers();

    } catch (error) {
      console.error("Error al eliminar:", error);
      alert('❌ Error: ' + error.message);
    } finally {
      setUpdating(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.id_card?.includes(searchTerm) || 
     u.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (roleFilter === 'all' || u.role === roleFilter)
  );

  const getRoleBadge = (role) => {
    switch(role) {
      case 'admin': return 'bg-vinotinto-600 text-white border-vinotinto-400';
      case 'teacher': return 'bg-blue-600 text-white border-blue-400';
      case 'student': return 'bg-emerald-600 text-white border-emerald-400';
      case 'cafetin': return 'bg-amber-600 text-white border-amber-400';
      default: return 'bg-slate-600 text-white';
    }
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col md:flex-row justify-end items-center gap-6 mb-10">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <select 
            value={roleFilter} 
            onChange={e => setRoleFilter(e.target.value)}
            className={`px-4 py-4 rounded-2xl border-2 text-sm font-bold outline-none transition-all ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
          >
            <option value="all">Todos los Roles</option>
            <option value="student">Estudiantes</option>
            <option value="teacher">Profesores</option>
            <option value="admin">Administradores</option>
            <option value="cafetin">Personal de Cafetín</option>
          </select>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" placeholder="Buscar por nombre, cédula o email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className={`w-full border-2 rounded-2xl pl-12 pr-6 py-4 text-sm outline-none transition-all focus:border-gold ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-100 text-slate-900'}`}
            />
          </div>
          
          {/* BOTÓN DE AVISOS / SOLICITUDES */}
          <button 
            onClick={() => setShowSolicitudes(!showSolicitudes)}
            className={`relative p-4 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95 ${showSolicitudes ? 'bg-vinotinto-800 border-vinotinto-600 text-white' : isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-400' : 'bg-white border-slate-100 text-slate-500'}`}
            title="Solicitudes de cambio de perfil"
          >
            <Shield size={24} />
            {pendingRequestsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900 animate-bounce">
                {pendingRequestsCount}
              </span>
            )}
          </button>

          <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="px-8 py-5 bg-gold text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-xl shadow-gold/10 hover:scale-105 transition-all flex items-center gap-3">
            <Plus size={20} /> Nuevo Usuario
          </button>
        </div>
      </div>

      {/* CONTENIDO DINÁMICO: TABLA O SOLICITUDES */}
      {showSolicitudes ? (
        <Motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`p-10 rounded-[3.5rem] border ${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-2xl'}`}
        >
          <div className="flex justify-between items-center mb-8">
             <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Avisos Pendientes</h3>
             <button onClick={() => setShowSolicitudes(false)} className="text-xs font-black uppercase text-vinotinto-500 hover:underline">Volver a Usuarios</button>
          </div>
          <SolicitudesAdmin isDarkMode={isDarkMode} />
        </Motion.div>
      ) : (
        <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-100 shadow-2xl shadow-slate-200/50'} backdrop-blur-xl rounded-[3.5rem] border overflow-hidden`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className={`border-b ${isDarkMode ? 'border-slate-800 bg-slate-900/50' : 'border-slate-100 bg-slate-50/50'}`}>
                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Identidad / Contacto</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Documento</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Rol / Nivel</th>
                <th className="px-10 py-8 text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">Acciones</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-100'}`}>
              {loading ? (
                <tr><td colSpan="4" className="px-10 py-32 text-center"><Loader2 className="w-12 h-12 animate-spin text-gold mx-auto" /></td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="4" className="px-10 py-20 text-center text-slate-500 font-bold italic">No se encontraron usuarios</td></tr>
              ) : filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-gold/5 transition-colors group">
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-5">
                      <img 
                        src={user.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.full_name)}&background=random`} 
                        alt="" 
                        className="w-14 h-14 rounded-2xl border-2 border-white shadow-sm object-cover group-hover:scale-110 transition-transform"
                      />
                      <div>
                        <p className={`text-base font-black transition-colors ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{user.full_name}</p>
                        <p className="text-[10px] text-slate-500 font-bold lowercase tracking-normal">{user.email}</p>
                        {user.phone && <p className="text-[9px] text-gold-600 font-black uppercase mt-1">{user.phone}</p>}
                      </div>
                    </div>
                  </td>
                  <td className={`px-10 py-7 text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                    <span className="flex items-center gap-2"><Hash size={14} className="text-slate-400" /> {user.id_card || 'S/N'}</span>
                  </td>
                  <td className="px-10 py-7">
                    <div className="space-y-2">
                      <span className={`px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.15em] border shadow-sm ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                      {user.role === 'student' && <p className="text-[10px] text-vinotinto-500 font-black uppercase tracking-widest">{user.grade || 'Grado S/N'}</p>}
                    </div>
                  </td>
                  <td className="px-10 py-7">
                    <div className="flex items-center gap-3">
                      <button onClick={() => handleEditClick(user)} className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white' : 'bg-slate-100 text-slate-500 hover:bg-blue-600 hover:text-white'}`}><Edit2 size={16} /></button>
                      <button 
                        onClick={() => handleDeleteUser(user)} 
                        disabled={updating}
                        className={`p-3 rounded-2xl transition-all ${isDarkMode ? 'bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white' : 'bg-red-50 text-red-500 hover:bg-red-500 hover:text-white'} ${updating ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      )}

      {/* MODAL EDITAR/CREAR USUARIO COMPLETO */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCreateModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl" />
            <Motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }} 
              className={`relative w-full max-w-xl rounded-[3rem] border p-8 md:p-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100'}`}
            >
              {/* Header Fijo */}
              <div className="flex justify-between items-center mb-8 shrink-0">
                 <div className="flex items-center gap-4">
                   <div className="w-10 h-10 bg-gold/20 rounded-xl flex items-center justify-center text-gold">
                     {isEditing ? <Edit2 size={20} /> : <Plus size={20} />}
                   </div>
                   <div>
                     <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-slate-100' : 'text-slate-900'}`}>{isEditing ? 'Editar Usuario' : 'Nuevo Registro'}</h3>
                     <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Base de Datos Institucional</p>
                   </div>
                 </div>
                 <button type="button" onClick={() => setShowCreateModal(false)} className="text-slate-500 hover:text-red-500 transition-colors"><X size={24} /></button>
              </div>

              {/* Contenido con Scrollbar Compacto */}
              <div className="overflow-y-auto pr-2 custom-scrollbar flex-1">
                <form onSubmit={isEditing ? handleUpdateUser : handleCreateUser} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Nombre Completo */}
                    <div className="md:col-span-2">
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-2 mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Nombre Completo</label>
                      <div className="relative">
                        <UserCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input required value={newUser.full_name} onChange={e => setNewUser({...newUser, full_name: e.target.value})} className={`w-full border-2 rounded-xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all focus:border-gold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`} placeholder="Ej: Juan Pérez" />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-2 mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Correo Institucional</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className={`w-full border-2 rounded-xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all focus:border-gold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`} placeholder="usuario@Francisca Elena.edu.ve" />
                      </div>
                    </div>

                    {/* Teléfono */}
                    <div>
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-2 mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Número de Teléfono</label>
                      <div className="relative">
                        <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input value={newUser.phone} onChange={e => setNewUser({...newUser, phone: e.target.value})} className={`w-full border-2 rounded-xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all focus:border-gold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`} placeholder="+58 414..." />
                      </div>
                    </div>

                    {/* Cédula */}
                    <div>
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-2 mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Cédula / ID</label>
                      <div className="relative">
                        <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input required value={newUser.cedula} onChange={e => setNewUser({...newUser, cedula: e.target.value})} className={`w-full border-2 rounded-xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all focus:border-gold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`} placeholder="V-12.345.678" />
                      </div>
                    </div>

                    {/* Rol */}
                    <div>
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-2 mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Rol</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className={`w-full border-2 rounded-xl pl-12 pr-6 py-4 text-sm font-bold outline-none appearance-none transition-all focus:border-gold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`}>
                          <option value="student">Estudiante</option>
                          <option value="teacher">Profesor</option>
                          <option value="admin">Administrador</option>
                          <option value="cafetin">Personal de Cafetín</option>
                        </select>
                      </div>
                    </div>

                    {/* Contraseña (Nueva en edición o obligatoria en creación) */}
                    <div className="md:col-span-2">
                      <label className={`text-[9px] font-black uppercase tracking-widest ml-2 mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                        {isEditing ? 'Cambiar Contraseña (Dejar en blanco para mantener actual)' : 'Contraseña de Acceso'}
                      </label>
                      <div className="relative">
                        <Key className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input 
                          type="password" 
                          required={!isEditing} 
                          value={newUser.password} 
                          onChange={e => setNewUser({...newUser, password: e.target.value})} 
                          className={`w-full border-2 rounded-xl pl-12 pr-6 py-4 text-sm font-bold outline-none transition-all focus:border-gold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`} 
                          placeholder={isEditing ? "Nueva contraseña..." : "••••••••"} 
                        />
                      </div>
                    </div>

                    {/* Año Escolar */}
                    {newUser.role === 'student' && (
                      <div className="md:col-span-2">
                        <label className={`text-[9px] font-black uppercase tracking-widest ml-2 mb-2 block ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Año Escolar</label>
                        <div className="relative">
                          <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                          <select value={newUser.grade} onChange={e => setNewUser({...newUser, grade: e.target.value})} className={`w-full border-2 rounded-xl pl-12 pr-6 py-4 text-sm font-bold outline-none appearance-none transition-all focus:border-gold ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-transparent text-slate-900'}`}>
                            <option value="">Seleccione el grado...</option>
                            <option value="1er Año">1er Año</option>
                            <option value="2do Año">2do Año</option>
                            <option value="3er Año">3er Año</option>
                            <option value="4to Año">4to Año</option>
                            <option value="5to Año">5to Año</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer con Botones */}
                  <div className="flex gap-4 pt-4 pb-2">
                    <button type="button" onClick={() => setShowCreateModal(false)} className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${isDarkMode ? 'bg-slate-800 text-slate-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                      Cancelar
                    </button>
                    <button type="submit" disabled={updating} className="flex-[2] py-4 bg-gold text-slate-950 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4">
                      {updating ? <Loader2 className="animate-spin w-4 h-4" /> : <Save size={16} />}
                      {isEditing ? 'Guardar Cambios' : 'Registrar'}
                    </button>
                  </div>
                </form>
              </div>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GestionUsuarios;

