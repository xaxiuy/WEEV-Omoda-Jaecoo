import { useState, useEffect } from 'react';
import { Car, Plus, Edit, Trash2, Upload, FileSpreadsheet, Search } from 'lucide-react';
import { supabase } from '@/supabaseClient';
import { ImageUpload } from '@/react-app/components/ImageUpload';
import { useToast } from '@/react-app/hooks/useToast';
import LoadingSpinner from '@/react-app/components/LoadingSpinner';
import EmptyState from '@/react-app/components/EmptyState';

interface VehicleModel {
  id: string;
  name: string;
  year: number;
  category?: string;
  body_type?: string;
  engine?: string;
  transmission?: string;
  fuel_type?: string;
  horsepower?: number;
  torque?: number;
  seats?: number;
  doors?: number;
  drive_type?: string;
  image_url?: string;
  gallery_urls?: string[];
  specifications?: Record<string, any>;
  features?: string[];
  msrp?: number;
  currency?: string;
  status: string;
}

interface VehicleInventory {
  id: string;
  model_id: string;
  model_name: string;
  model_year: number;
  vin: string;
  license_plate?: string;
  color?: string;
  production_date?: string;
  delivery_date?: string;
  status: string;
  location?: string;
  mileage: number;
  condition?: string;
  price?: number;
  currency?: string;
  notes?: string;
}

export default function VehicleManagementPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'models' | 'inventory'>('models');
  
  // Models state
  const [models, setModels] = useState<VehicleModel[]>([]);
  const [showModelModal, setShowModelModal] = useState(false);
  const [editingModel, setEditingModel] = useState<VehicleModel | null>(null);
  
  // Inventory state
  const [inventory, setInventory] = useState<VehicleInventory[]>([]);
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<VehicleInventory | null>(null);
  const [selectedModelFilter, setSelectedModelFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Model form state
  const [modelForm, setModelForm] = useState({
    name: '',
    year: new Date().getFullYear(),
    category: '',
    bodyType: '',
    engine: '',
    transmission: '',
    fuelType: '',
    horsepower: '',
    torque: '',
    seats: '',
    doors: '',
    driveType: '',
    imageUrl: '',
    galleryUrls: [] as string[],
    specifications: {} as Record<string, string>,
    features: [] as string[],
    msrp: '',
    currency: 'USD',
    status: 'active',
  });

  // Inventory form state
  const [inventoryForm, setInventoryForm] = useState({
    modelId: '',
    vin: '',
    licensePlate: '',
    color: '',
    productionDate: '',
    deliveryDate: '',
    status: 'available',
    location: '',
    mileage: '',
    condition: '',
    price: '',
    currency: 'USD',
    notes: '',
  });

  // Bulk upload state
  const [bulkData, setBulkData] = useState({
    modelId: '',
    csvData: '',
  });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (activeTab === 'models') {
        const response = await fetch('/api/vehicles/models', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = await response.json();
          setModels(data.models);
        }
      } else {
        const response = await fetch('/api/vehicles/inventory', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = await response.json();
          setInventory(data.inventory);
        }
      }
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleModelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const payload = {
      name: modelForm.name,
      year: modelForm.year,
      category: modelForm.category || undefined,
      bodyType: modelForm.bodyType || undefined,
      engine: modelForm.engine || undefined,
      transmission: modelForm.transmission || undefined,
      fuelType: modelForm.fuelType || undefined,
      horsepower: modelForm.horsepower ? parseInt(modelForm.horsepower) : undefined,
      torque: modelForm.torque ? parseInt(modelForm.torque) : undefined,
      seats: modelForm.seats ? parseInt(modelForm.seats) : undefined,
      doors: modelForm.doors ? parseInt(modelForm.doors) : undefined,
      driveType: modelForm.driveType || undefined,
      imageUrl: modelForm.imageUrl || undefined,
      galleryUrls: modelForm.galleryUrls.filter(url => url.trim()),
      specifications: modelForm.specifications,
      features: modelForm.features.filter(f => f.trim()),
      msrp: modelForm.msrp ? parseFloat(modelForm.msrp) : undefined,
      currency: modelForm.currency,
      status: modelForm.status,
    };

    try {
      const url = editingModel 
        ? `/api/vehicles/models/${editingModel.id}`
        : '/api/vehicles/models';
      
      const response = await fetch(url, {
        method: editingModel ? 'PATCH' : 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowModelModal(false);
        resetModelForm();
        fetchData();
        toast.success(editingModel ? 'Modelo actualizado' : 'Modelo creado exitosamente');
      } else {
        toast.error('Error al guardar el modelo');
      }
    } catch (error) {
      console.error('Failed to save model', error);
      toast.error('Error al guardar el modelo');
    }
  };

  const handleInventorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    const payload = {
      modelId: inventoryForm.modelId,
      vin: inventoryForm.vin,
      licensePlate: inventoryForm.licensePlate || undefined,
      color: inventoryForm.color || undefined,
      productionDate: inventoryForm.productionDate || undefined,
      deliveryDate: inventoryForm.deliveryDate || undefined,
      status: inventoryForm.status,
      location: inventoryForm.location || undefined,
      mileage: inventoryForm.mileage ? parseInt(inventoryForm.mileage) : undefined,
      condition: inventoryForm.condition || undefined,
      price: inventoryForm.price ? parseFloat(inventoryForm.price) : undefined,
      currency: inventoryForm.currency,
      notes: inventoryForm.notes || undefined,
    };

    try {
      const url = editingVehicle 
        ? `/api/vehicles/inventory/${editingVehicle.id}`
        : '/api/vehicles/inventory';
      
      const response = await fetch(url, {
        method: editingVehicle ? 'PATCH' : 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowInventoryModal(false);
        resetInventoryForm();
        fetchData();
        toast.success(editingVehicle ? 'Vehículo actualizado' : 'Vehículo agregado exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al guardar el vehículo');
      }
    } catch (error) {
      console.error('Failed to save vehicle', error);
      toast.error('Error al guardar el vehículo');
    }
  };

  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkData.modelId || !bulkData.csvData) {
      toast.warning('Selecciona un modelo y carga los datos CSV');
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    
    // Parse CSV data
    const lines = bulkData.csvData.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    const vehicles = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const vehicle: any = {};
      
      headers.forEach((header, index) => {
        const value = values[index];
        if (!value) return;
        
        switch (header) {
          case 'vin':
            vehicle.vin = value;
            break;
          case 'license_plate':
          case 'licensePlate':
            vehicle.licensePlate = value;
            break;
          case 'color':
            vehicle.color = value;
            break;
          case 'production_date':
          case 'productionDate':
            vehicle.productionDate = value;
            break;
          case 'delivery_date':
          case 'deliveryDate':
            vehicle.deliveryDate = value;
            break;
          case 'status':
            vehicle.status = value;
            break;
          case 'location':
            vehicle.location = value;
            break;
          case 'mileage':
            vehicle.mileage = parseInt(value);
            break;
          case 'condition':
            vehicle.condition = value;
            break;
          case 'price':
            vehicle.price = parseFloat(value);
            break;
          case 'currency':
            vehicle.currency = value;
            break;
          case 'notes':
            vehicle.notes = value;
            break;
        }
      });
      
      return vehicle;
    }).filter(v => v.vin);

    try {
      const response = await fetch('/api/vehicles/inventory/bulk', {
        method: 'POST',
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          modelId: bulkData.modelId,
          vehicles,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setShowBulkUploadModal(false);
        setBulkData({ modelId: '', csvData: '' });
        fetchData();
        
        if (result.failed > 0) {
          toast.warning(`${result.success} vehículos agregados, ${result.failed} fallaron`);
        } else {
          toast.success(`${result.success} vehículos agregados exitosamente`);
        }
      } else {
        toast.error('Error al cargar los vehículos');
      }
    } catch (error) {
      console.error('Failed to bulk upload', error);
      toast.error('Error al cargar los vehículos');
    }
  };

  const handleDeleteModel = async (id: string) => {
    if (!confirm('¿Eliminar este modelo? Los vehículos asociados deben ser eliminados primero.')) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    try {
      const response = await fetch(`/api/vehicles/models/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        fetchData();
        toast.success('Modelo eliminado');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al eliminar el modelo');
      }
    } catch (error) {
      console.error('Failed to delete model', error);
      toast.error('Error al eliminar el modelo');
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('¿Eliminar este vehículo del inventario?')) return;

    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;
    try {
      const response = await fetch(`/api/vehicles/inventory/${id}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (response.ok) {
        fetchData();
        toast.success('Vehículo eliminado');
      } else {
        toast.error('Error al eliminar el vehículo');
      }
    } catch (error) {
      console.error('Failed to delete vehicle', error);
      toast.error('Error al eliminar el vehículo');
    }
  };

  const resetModelForm = () => {
    setEditingModel(null);
    setModelForm({
      name: '',
      year: new Date().getFullYear(),
      category: '',
      bodyType: '',
      engine: '',
      transmission: '',
      fuelType: '',
      horsepower: '',
      torque: '',
      seats: '',
      doors: '',
      driveType: '',
      imageUrl: '',
      galleryUrls: [],
      specifications: {},
      features: [],
      msrp: '',
      currency: 'USD',
      status: 'active',
    });
  };

  const resetInventoryForm = () => {
    setEditingVehicle(null);
    setInventoryForm({
      modelId: '',
      vin: '',
      licensePlate: '',
      color: '',
      productionDate: '',
      deliveryDate: '',
      status: 'available',
      location: '',
      mileage: '',
      condition: '',
      price: '',
      currency: 'USD',
      notes: '',
    });
  };

  const handleEditModel = (model: VehicleModel) => {
    setEditingModel(model);
    setModelForm({
      name: model.name,
      year: model.year,
      category: model.category || '',
      bodyType: model.body_type || '',
      engine: model.engine || '',
      transmission: model.transmission || '',
      fuelType: model.fuel_type || '',
      horsepower: model.horsepower?.toString() || '',
      torque: model.torque?.toString() || '',
      seats: model.seats?.toString() || '',
      doors: model.doors?.toString() || '',
      driveType: model.drive_type || '',
      imageUrl: model.image_url || '',
      galleryUrls: model.gallery_urls || [],
      specifications: model.specifications || {},
      features: model.features || [],
      msrp: model.msrp?.toString() || '',
      currency: model.currency || 'USD',
      status: model.status,
    });
    setShowModelModal(true);
  };

  const handleEditVehicle = (vehicle: VehicleInventory) => {
    setEditingVehicle(vehicle);
    setInventoryForm({
      modelId: vehicle.model_id,
      vin: vehicle.vin,
      licensePlate: vehicle.license_plate || '',
      color: vehicle.color || '',
      productionDate: vehicle.production_date || '',
      deliveryDate: vehicle.delivery_date || '',
      status: vehicle.status,
      location: vehicle.location || '',
      mileage: vehicle.mileage?.toString() || '',
      condition: vehicle.condition || '',
      price: vehicle.price?.toString() || '',
      currency: vehicle.currency || 'USD',
      notes: vehicle.notes || '',
    });
    setShowInventoryModal(true);
  };

  const addSpecification = () => {
    const key = prompt('Nombre de la especificación:');
    if (!key) return;
    const value = prompt('Valor:');
    if (!value) return;
    setModelForm(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value },
    }));
  };

  const removeSpecification = (key: string) => {
    setModelForm(prev => {
      const specs = { ...prev.specifications };
      delete specs[key];
      return { ...prev, specifications: specs };
    });
  };

  const addFeature = () => {
    const feature = prompt('Característica:');
    if (feature) {
      setModelForm(prev => ({
        ...prev,
        features: [...prev.features, feature],
      }));
    }
  };

  const removeFeature = (index: number) => {
    setModelForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const filteredInventory = inventory.filter(vehicle => {
    const matchesModel = !selectedModelFilter || vehicle.model_id === selectedModelFilter;
    const matchesSearch = !searchQuery || 
      vehicle.vin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.license_plate?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      vehicle.model_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesModel && matchesSearch;
  });

  if (loading) {
    return <LoadingSpinner message="Cargando gestión de vehículos..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50 p-4 pb-20">
      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Gestión de Vehículos</h1>
          <p className="text-gray-600">Administra modelos de autos e inventario VIN</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white rounded-xl p-1 shadow-sm border border-gray-200">
          <button
            onClick={() => setActiveTab('models')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'models'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Car className="w-5 h-5 inline-block mr-2" />
            Modelos
          </button>
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
              activeTab === 'inventory'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <FileSpreadsheet className="w-5 h-5 inline-block mr-2" />
            Inventario VIN
          </button>
        </div>

        {/* Models Tab */}
        {activeTab === 'models' && (
          <>
            <div className="flex justify-end mb-6">
              <button
                onClick={() => {
                  resetModelForm();
                  setShowModelModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                Nuevo Modelo
              </button>
            </div>

            {models.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200">
                <EmptyState
                  icon={Car}
                  title="No hay modelos"
                  description="Comienza creando el primer modelo de vehículo para tu marca"
                  iconColor="from-blue-500 to-blue-600"
                  action={{
                    label: 'Crear Modelo',
                    onClick: () => {
                      resetModelForm();
                      setShowModelModal(true);
                    },
                  }}
                />
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {models.map((model) => (
                  <div
                    key={model.id}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all"
                  >
                    {model.image_url && (
                      <div className="aspect-video bg-gradient-to-br from-blue-100 to-blue-50 relative overflow-hidden">
                        <img
                          src={model.image_url}
                          alt={model.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">{model.name}</h3>
                          <p className="text-gray-600 text-sm">Año {model.year}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          model.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {model.status}
                        </span>
                      </div>

                      {model.engine && (
                        <p className="text-gray-700 text-sm mb-2">
                          <strong>Motor:</strong> {model.engine}
                        </p>
                      )}

                      {model.msrp && (
                        <div className="text-2xl font-bold text-blue-600 mb-4">
                          {new Intl.NumberFormat('es-AR', {
                            style: 'currency',
                            currency: model.currency || 'USD',
                          }).format(model.msrp)}
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditModel(model)}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteModel(model.id)}
                          className="flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Inventory Tab */}
        {activeTab === 'inventory' && (
          <>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por VIN, patente o modelo..."
                  className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-gray-900 focus:outline-none focus:border-blue-400 shadow-sm"
                />
              </div>
              
              <select
                value={selectedModelFilter}
                onChange={(e) => setSelectedModelFilter(e.target.value)}
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-400 shadow-sm"
              >
                <option value="">Todos los modelos</option>
                {models.map((model) => (
                  <option key={model.id} value={model.id}>
                    {model.name} ({model.year})
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  resetInventoryForm();
                  setShowInventoryModal(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span className="hidden md:inline">Agregar VIN</span>
              </button>

              <button
                onClick={() => setShowBulkUploadModal(true)}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold shadow-lg transition-all active:scale-95"
              >
                <Upload className="w-5 h-5" />
                <span className="hidden md:inline">Carga Masiva</span>
              </button>
            </div>

            {filteredInventory.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200">
                <EmptyState
                  icon={FileSpreadsheet}
                  title="No hay vehículos en inventario"
                  description="Agrega VINs individualmente o usa la carga masiva CSV"
                  iconColor="from-green-500 to-green-600"
                  action={{
                    label: 'Agregar Vehículo',
                    onClick: () => {
                      resetInventoryForm();
                      setShowInventoryModal(true);
                    },
                  }}
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">VIN</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Modelo</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Color</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Patente</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Estado</th>
                        <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ubicación</th>
                        <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredInventory.map((vehicle) => (
                        <tr key={vehicle.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 text-sm font-mono text-gray-900">{vehicle.vin}</td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            {vehicle.model_name} ({vehicle.model_year})
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{vehicle.color || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-700">{vehicle.license_plate || '-'}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              vehicle.status === 'available' 
                                ? 'bg-green-100 text-green-700'
                                : vehicle.status === 'sold'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}>
                              {vehicle.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700">{vehicle.location || '-'}</td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => handleEditVehicle(vehicle)}
                                className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar"
                              >
                                <Edit className="w-4 h-4 text-blue-600" />
                              </button>
                              <button
                                onClick={() => handleDeleteVehicle(vehicle.id)}
                                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
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
          </>
        )}
      </div>

      {/* Model Modal */}
      {showModelModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full my-8 border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingModel ? 'Editar Modelo' : 'Nuevo Modelo'}
              </h2>
            </div>

            <form onSubmit={handleModelSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Nombre del Modelo *</label>
                  <input
                    type="text"
                    value={modelForm.name}
                    onChange={(e) => setModelForm({ ...modelForm, name: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Año *</label>
                  <input
                    type="number"
                    value={modelForm.year}
                    onChange={(e) => setModelForm({ ...modelForm, year: parseInt(e.target.value) })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Categoría</label>
                  <input
                    type="text"
                    value={modelForm.category}
                    onChange={(e) => setModelForm({ ...modelForm, category: e.target.value })}
                    placeholder="SUV, Sedan, Deportivo, etc."
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Tipo de Carrocería</label>
                  <input
                    type="text"
                    value={modelForm.bodyType}
                    onChange={(e) => setModelForm({ ...modelForm, bodyType: e.target.value })}
                    placeholder="4-door sedan, 2-door coupe, etc."
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Motor</label>
                  <input
                    type="text"
                    value={modelForm.engine}
                    onChange={(e) => setModelForm({ ...modelForm, engine: e.target.value })}
                    placeholder="2.0L Turbo, V6, etc."
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Transmisión</label>
                  <input
                    type="text"
                    value={modelForm.transmission}
                    onChange={(e) => setModelForm({ ...modelForm, transmission: e.target.value })}
                    placeholder="Automática, Manual, CVT, etc."
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Combustible</label>
                  <input
                    type="text"
                    value={modelForm.fuelType}
                    onChange={(e) => setModelForm({ ...modelForm, fuelType: e.target.value })}
                    placeholder="Nafta, Diesel, Híbrido, etc."
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Potencia (HP)</label>
                  <input
                    type="number"
                    value={modelForm.horsepower}
                    onChange={(e) => setModelForm({ ...modelForm, horsepower: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Torque</label>
                  <input
                    type="number"
                    value={modelForm.torque}
                    onChange={(e) => setModelForm({ ...modelForm, torque: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Asientos</label>
                  <input
                    type="number"
                    value={modelForm.seats}
                    onChange={(e) => setModelForm({ ...modelForm, seats: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Puertas</label>
                  <input
                    type="number"
                    value={modelForm.doors}
                    onChange={(e) => setModelForm({ ...modelForm, doors: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Tracción</label>
                  <input
                    type="text"
                    value={modelForm.driveType}
                    onChange={(e) => setModelForm({ ...modelForm, driveType: e.target.value })}
                    placeholder="FWD, RWD, AWD, 4WD"
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Precio Base</label>
                  <input
                    type="number"
                    step="0.01"
                    value={modelForm.msrp}
                    onChange={(e) => setModelForm({ ...modelForm, msrp: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Moneda</label>
                  <select
                    value={modelForm.currency}
                    onChange={(e) => setModelForm({ ...modelForm, currency: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="USD">USD</option>
                    <option value="ARS">ARS</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
              </div>

              <ImageUpload
                value={modelForm.imageUrl}
                onChange={(url) => setModelForm({ ...modelForm, imageUrl: url })}
                namespace="vehicles"
                label="Imagen Principal"
                aspectRatio="16/9"
              />

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-900 font-medium">Especificaciones</label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {Object.entries(modelForm.specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-700 font-medium flex-1">{key}:</span>
                      <span className="text-gray-900">{value}</span>
                      <button
                        type="button"
                        onClick={() => removeSpecification(key)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-gray-900 font-medium">Características</label>
                  <button
                    type="button"
                    onClick={addFeature}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                  >
                    + Agregar
                  </button>
                </div>
                <div className="space-y-2">
                  {modelForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 bg-gray-50 rounded-lg p-3">
                      <span className="text-gray-900 flex-1">{feature}</span>
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-4 sticky bottom-0 bg-white border-t border-gray-200 -mx-6 px-6 -mb-6 pb-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowModelModal(false);
                    resetModelForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  {editingModel ? 'Guardar Cambios' : 'Crear Modelo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inventory Modal */}
      {showInventoryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingVehicle ? 'Editar Vehículo' : 'Agregar Vehículo'}
              </h2>
            </div>

            <form onSubmit={handleInventorySubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-gray-900 font-medium mb-2">Modelo *</label>
                <select
                  value={inventoryForm.modelId}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, modelId: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  required
                  disabled={!!editingVehicle}
                >
                  <option value="">Seleccionar modelo...</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.year})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">VIN *</label>
                  <input
                    type="text"
                    value={inventoryForm.vin}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, vin: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-mono focus:outline-none focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Patente</label>
                  <input
                    type="text"
                    value={inventoryForm.licensePlate}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, licensePlate: e.target.value.toUpperCase() })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Color</label>
                  <input
                    type="text"
                    value={inventoryForm.color}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, color: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Ubicación</label>
                  <input
                    type="text"
                    value={inventoryForm.location}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, location: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-900 font-medium mb-2">Estado</label>
                  <select
                    value={inventoryForm.status}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, status: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  >
                    <option value="available">Disponible</option>
                    <option value="sold">Vendido</option>
                    <option value="reserved">Reservado</option>
                    <option value="in_transit">En tránsito</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-900 font-medium mb-2">Kilometraje</label>
                  <input
                    type="number"
                    value={inventoryForm.mileage}
                    onChange={(e) => setInventoryForm({ ...inventoryForm, mileage: e.target.value })}
                    className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-900 font-medium mb-2">Notas</label>
                <textarea
                  value={inventoryForm.notes}
                  onChange={(e) => setInventoryForm({ ...inventoryForm, notes: e.target.value })}
                  rows={3}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowInventoryModal(false);
                    resetInventoryForm();
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  {editingVehicle ? 'Guardar Cambios' : 'Agregar Vehículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkUploadModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Carga Masiva de VINs</h2>
              <p className="text-gray-600 mt-1">Importa múltiples vehículos desde CSV</p>
            </div>

            <form onSubmit={handleBulkUpload} className="p-6 space-y-6">
              <div>
                <label className="block text-gray-900 font-medium mb-2">Modelo *</label>
                <select
                  value={bulkData.modelId}
                  onChange={(e) => setBulkData({ ...bulkData, modelId: e.target.value })}
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 focus:outline-none focus:border-blue-500"
                  required
                >
                  <option value="">Seleccionar modelo...</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} ({model.year})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-900 font-medium mb-2">Datos CSV *</label>
                <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-900 font-medium mb-1">Formato esperado:</p>
                  <code className="text-xs text-blue-800 block">
                    vin,color,licensePlate,location,status,mileage<br/>
                    ABC123XYZ,Rojo,AA123BB,Buenos Aires,available,0
                  </code>
                </div>
                <textarea
                  value={bulkData.csvData}
                  onChange={(e) => setBulkData({ ...bulkData, csvData: e.target.value })}
                  rows={10}
                  placeholder="Pega aquí los datos CSV..."
                  className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 font-mono text-sm focus:outline-none focus:border-blue-500"
                  required
                />
                <p className="text-sm text-gray-600 mt-2">
                  La primera línea debe contener los nombres de las columnas. Campos opcionales: licensePlate, color, productionDate, deliveryDate, location, mileage, condition, price, currency, notes
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkUploadModal(false);
                    setBulkData({ modelId: '', csvData: '' });
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
                >
                  Cargar Vehículos
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
