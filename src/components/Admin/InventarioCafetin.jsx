import React, { useState, useEffect } from 'react';
import { motion as Motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingCart, 
  Plus, 
  Trash2, 
  Edit2, 
  Package, 
  DollarSign, 
  Archive,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Upload,
  Image as ImageIcon,
  Inbox
} from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import BandejaPedidos from '../Dashboard/BandejaPedidos';

const InventarioCafetin = ({ isDarkMode = true }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState('inventario');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price_usd: '',
    stock: 0,
    category: 'comida',
    is_available: true,
    image_url: ''
  });

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('cafeteria_inventory')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImage(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('materiales')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('materiales')
        .getPublicUrl(filePath);

      setFormData({ ...formData, image_url: publicUrl });
      setImagePreview(URL.createObjectURL(file));
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir imagen: ' + error.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let error;
      if (editingProduct) {
        ({ error } = await supabase.from('cafeteria_inventory').update(formData).eq('id', editingProduct.id));
      } else {
        ({ error } = await supabase.from('cafeteria_inventory').insert([formData]));
      }

      if (error) throw error;
      setShowModal(false);
      setEditingProduct(null);
      setImagePreview(null);
      setFormData({ name: '', description: '', price_usd: '', stock: 0, category: 'comida', is_available: true, image_url: '' });
      fetchInventory();
    } catch (error) {
      console.error('Error saving product:', error);
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este producto?')) return;
    try {
      const { error } = await supabase.from('cafeteria_inventory').delete().eq('id', id);
      if (error) throw error;
      fetchInventory();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  return (
    <div className="space-y-8">
      {/* TABS DE GESTIÓN */}
      <div className="flex gap-4 p-1.5 bg-slate-100 dark:bg-white/5 rounded-3xl w-fit mb-8">
        {[
          { id: 'inventario', label: 'Inventario de Productos', icon: <Package size={16} /> },
          { id: 'pedidos', label: 'Bandeja de Pedidos', icon: <Inbox size={16} /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-3 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? 'bg-vinotinto-800 text-white shadow-lg' 
                : 'text-gray-500 hover:bg-white/50 dark:hover:bg-white/5'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'pedidos' ? (
        <BandejaPedidos isDarkMode={isDarkMode} />
      ) : (
        <>
          <div className="flex justify-between items-center">
            <h3 className={`text-2xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Inventario de Cafetín</h3>
            <button 
              onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', price_usd: '', stock: 0, category: 'comida', is_available: true, image_url: '' }); setImagePreview(null); setShowModal(true); }}
              className="px-8 py-4 bg-amber-500 text-vinotinto-950 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-vinotinto-800 hover:text-white transition-all shadow-xl flex items-center gap-3"
            >
              <Plus size={18} /> Nuevo Producto
            </button>
          </div>

          {/* GRID DE PRODUCTOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="w-10 h-10 animate-spin text-amber-500 mx-auto" /></div>
        ) : products.map(product => (
          <Motion.div 
            key={product.id}
            layout
            className={`${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'} backdrop-blur-xl rounded-[2.5rem] border overflow-hidden flex flex-col`}
          >
            <div className="h-40 bg-slate-800 relative">
              {product.image_url ? (
                <img src={product.image_url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/5"><Package size={40} /></div>
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                 <button onClick={() => { setEditingProduct(product); setFormData(product); setShowModal(true); }} className="p-3 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-amber-500 transition-all"><Edit2 size={12} /></button>
                 <button onClick={() => handleDelete(product.id)} className="p-3 bg-black/40 backdrop-blur-md rounded-xl text-white hover:bg-red-500 transition-all"><Trash2 size={12} /></button>
              </div>
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h4 className={`text-sm font-black uppercase ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.name}</h4>
                <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-full ${product.stock > 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {product.stock > 0 ? 'En Stock' : 'Agotado'}
                </span>
              </div>
              <p className="text-[10px] text-gray-500 line-clamp-2 mb-4 font-medium">{product.description}</p>
              
              <div className={`mt-auto pt-4 border-t flex justify-between items-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                 <div>
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Precio</p>
                    <p className="text-lg font-black text-amber-500 italic">${product.price_usd}</p>
                 </div>
                 <div className="text-right">
                    <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Existencia</p>
                    <p className={`text-sm font-black ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{product.stock} un.</p>
                 </div>
              </div>
            </div>
          </Motion.div>
        ))}
          </div>
        </>
      )}

      {/* MODAL */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <Motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <Motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`relative w-full max-w-2xl rounded-[3rem] border p-10 md:p-12 ${isDarkMode ? 'bg-[#1a1d23] border-white/10' : 'bg-white border-slate-100 shadow-2xl'}`}>
               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-3xl font-black italic uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{editingProduct ? 'Editar' : 'Nuevo'} Producto</h3>
                    <button type="button" onClick={() => setShowModal(false)} className="p-3 bg-red-50 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all"><X /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Nombre del Producto</label>
                        <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold transition-all outline-none focus:border-amber-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} placeholder="Ej: Empanada de Pollo" />
                      </div>
                      
                      <div>
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Descripción Corta</label>
                        <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold transition-all outline-none focus:border-amber-500 resize-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} placeholder="Describe el producto..." />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Precio (USD)</label>
                          <input type="number" step="0.01" required value={formData.price_usd} onChange={(e) => setFormData({...formData, price_usd: e.target.value})} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold transition-all outline-none focus:border-amber-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} />
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Stock</label>
                          <input type="number" required value={formData.stock} onChange={(e) => setFormData({...formData, stock: parseInt(e.target.value)})} className={`w-full border rounded-2xl px-6 py-4 text-sm font-bold transition-all outline-none focus:border-amber-500 ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-100 text-slate-900'}`} />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-2 block">Imagen del Producto</label>
                      <div className={`relative aspect-square rounded-[2.5rem] border-4 border-dashed flex flex-col items-center justify-center overflow-hidden group transition-all ${imagePreview || formData.image_url ? 'border-amber-500/50' : isDarkMode ? 'border-white/10 bg-white/5' : 'border-slate-200 bg-slate-50'}`}>
                        {imagePreview || formData.image_url ? (
                          <>
                            <img src={imagePreview || formData.image_url} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <button type="button" onClick={() => { setImagePreview(null); setFormData({...formData, image_url: ''}); }} className="p-4 bg-red-500 text-white rounded-full shadow-xl hover:scale-110 transition-transform">
                                <Trash2 size={24} />
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="text-center p-8">
                            <div className="w-16 h-16 bg-amber-500/10 rounded-3xl flex items-center justify-center text-amber-500 mx-auto mb-4">
                              <ImageIcon size={32} />
                            </div>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">No hay imagen</p>
                          </div>
                        )}
                        
                        <label className="absolute inset-0 cursor-pointer">
                          <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>

                        {uploadingImage && (
                          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                            <Loader2 className="animate-spin mb-4" size={32} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">Subiendo Imagen...</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-[10px] text-gray-400 font-medium italic text-center uppercase tracking-widest">Recomendado: 500x500px (JPG/PNG)</p>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="submit" disabled={loading || uploadingImage} className="w-full py-6 bg-amber-500 text-vinotinto-950 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl hover:bg-vinotinto-800 hover:text-white transition-all flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50">
                      {loading ? <Loader2 className="animate-spin" /> : editingProduct ? <CheckCircle2 size={20} /> : <Plus size={20} />}
                      {editingProduct ? 'Guardar Cambios del Producto' : 'Registrar Producto en Inventario'}
                    </button>
                  </div>
               </form>
            </Motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InventarioCafetin;
