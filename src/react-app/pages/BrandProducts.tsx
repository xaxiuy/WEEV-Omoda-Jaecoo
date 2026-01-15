import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Car, Package } from 'lucide-react';
import { ImageUpload } from '@/react-app/components/ImageUpload';

interface Product {
  id: string;
  name: string;
  model: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  year: number;
  image_url: string;
  status: string;
  specifications: Record<string, any>;
  features: string[];
  stock_quantity: number;
}

export default function BrandProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    category: 'vehicle',
    name: '',
    model: '',
    description: '',
    price: '',
    currency: 'USD',
    year: new Date().getFullYear(),
    imageUrl: '',
    status: 'active',
    stockQuantity: '',
    specifications: {} as Record<string, string>,
    features: [] as string[],
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/brand/products', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('accessToken');
    const payload = {
      category: formData.category,
      name: formData.name,
      model: formData.model,
      description: formData.description,
      price: formData.price ? parseFloat(formData.price) : undefined,
      currency: formData.currency,
      year: formData.year,
      imageUrl: formData.imageUrl || undefined,
      status: formData.status,
      stockQuantity: formData.stockQuantity ? parseInt(formData.stockQuantity) : undefined,
      specifications: formData.specifications,
      features: formData.features.filter(f => f.trim()),
    };

    try {
      const url = editingProduct 
        ? `/api/brand/products/${editingProduct.id}`
        : '/api/brand/products';
      
      const response = await fetch(url, {
        method: editingProduct ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/brand/products/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      console.error('Failed to delete product', error);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      category: product.category,
      name: product.name,
      model: product.model || '',
      description: product.description || '',
      price: product.price?.toString() || '',
      currency: product.currency || 'USD',
      year: product.year || new Date().getFullYear(),
      imageUrl: product.image_url || '',
      status: product.status || 'active',
      stockQuantity: product.stock_quantity?.toString() || '',
      specifications: product.specifications || {},
      features: product.features || [],
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      category: 'vehicle',
      name: '',
      model: '',
      description: '',
      price: '',
      currency: 'USD',
      year: new Date().getFullYear(),
      imageUrl: '',
      status: 'active',
      stockQuantity: '',
      specifications: {},
      features: [],
    });
  };

  const addSpecification = () => {
    const key = prompt('Nombre de la especificación (ej: Motor, Transmisión):');
    if (!key) return;
    const value = prompt('Valor:');
    if (!value) return;
    setFormData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value },
    }));
  };

  const removeSpecification = (key: string) => {
    setFormData(prev => {
      const specs = { ...prev.specifications };
      delete specs[key];
      return { ...prev, specifications: specs };
    });
  };

  const addFeature = () => {
    const feature = prompt('Característica:');
    if (feature) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, feature],
      }));
    }
  };

  const removeFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      <div className="max-w-7xl mx-auto pt-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Productos</h1>
            <p className="text-white/70">Gestiona el catálogo de productos de tu marca</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Producto
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all"
            >
              {product.image_url && (
                <div className="aspect-video bg-gradient-to-br from-purple-500/20 to-pink-500/20 relative overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <Car className="w-4 h-4 text-purple-300" />
                      <span className="text-white/60 text-sm uppercase tracking-wider">
                        {product.category}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-white">{product.name}</h3>
                    {product.model && (
                      <p className="text-white/70 text-sm">{product.model}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === 'active' 
                      ? 'bg-green-500/20 text-green-300' 
                      : 'bg-gray-500/20 text-gray-300'
                  }`}>
                    {product.status}
                  </span>
                </div>

                {product.description && (
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>
                )}

                {product.price && (
                  <div className="text-2xl font-bold text-white mb-4">
                    {new Intl.NumberFormat('es-AR', {
                      style: 'currency',
                      currency: product.currency,
                    }).format(product.price)}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(product)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
            <Package className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay productos</h3>
            <p className="text-white/70 mb-6">Comienza agregando tu primer producto</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Crear Producto
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-white/20">
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6">
              <h2 className="text-2xl font-bold text-white">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-white/90 font-medium mb-2">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  required
                >
                  <option value="vehicle">Vehículo</option>
                  <option value="accessory">Accesorio</option>
                  <option value="part">Repuesto</option>
                  <option value="service">Servicio</option>
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Nombre *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/90 font-medium mb-2">Modelo</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-white/90 font-medium mb-2">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Precio</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-white/90 font-medium mb-2">Moneda</label>
                  <select
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 font-medium mb-2">Año</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/90 font-medium mb-2">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="active">Activo</option>
                    <option value="inactive">Inactivo</option>
                    <option value="discontinued">Discontinuado</option>
                  </select>
                </div>

                <div>
                  <label className="block text-white/90 font-medium mb-2">Stock</label>
                  <input
                    type="number"
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <ImageUpload
                value={formData.imageUrl}
                onChange={(url) => setFormData({ ...formData, imageUrl: url })}
                namespace="products"
                label="Imagen del Producto"
                aspectRatio="4/3"
                className="[&_label]:text-white/90 [&_button]:border-white/20 [&_button]:hover:border-purple-400 [&_button]:hover:bg-purple-500/10"
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-white/90 font-medium">Especificaciones</label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(formData.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                      <span className="text-white/70 font-medium flex-1">{key}:</span>
                      <span className="text-white">{value}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-white/90 font-medium">Características</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-purple-400 hover:text-purple-300 text-sm font-medium"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-white/5 rounded-lg p-3">
                      <span className="text-white flex-1">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
