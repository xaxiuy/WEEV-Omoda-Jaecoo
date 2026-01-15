import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CreditCard, Sparkles, Palette, Settings, Eye, Copy } from 'lucide-react';
import { ImageUpload } from '@/react-app/components/ImageUpload';
import { ConditionBuilder, type Condition } from '@/react-app/components/ConditionBuilder';

interface CardTemplate {
  id: string;
  name: string;
  tier: string;
  logo_url: string;
  background_gradient: string;
  text_color: string;
  benefits: string[];
  unlock_conditions: {
    conditions: Condition[];
    autoAssign: boolean;
  };
  is_active: boolean;
  design_config: {
    cardStyle?: 'modern' | 'classic' | 'minimal' | 'luxury';
    borderRadius?: number;
    showPattern?: boolean;
    patternOpacity?: number;
  };
}

const GRADIENT_PRESETS = [
  { name: 'Purple Haze', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { name: 'Sunset', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { name: 'Ocean', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { name: 'Mint', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  { name: 'Sunrise', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { name: 'Deep Sea', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { name: 'Cotton Candy', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' },
  { name: 'Rose', gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)' },
  { name: 'Peach', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' },
  { name: 'Arctic', gradient: 'linear-gradient(135deg, #ff6e7f 0%, #bfe9ff 100%)' },
  { name: 'Night Sky', gradient: 'linear-gradient(135deg, #0f2027 0%, #203a43 50%, #2c5364 100%)' },
  { name: 'Gold', gradient: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
];

const CARD_STYLES = [
  { value: 'modern', label: 'Moderno', description: 'Diseño limpio y contemporáneo' },
  { value: 'classic', label: 'Clásico', description: 'Estilo tradicional elegante' },
  { value: 'minimal', label: 'Minimalista', description: 'Simple y sofisticado' },
  { value: 'luxury', label: 'Lujo', description: 'Detalles premium y exclusivos' },
];

export default function BrandCardTemplatesPage() {
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CardTemplate | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'benefits' | 'conditions'>('design');
  const [formData, setFormData] = useState({
    name: '',
    tier: 'member',
    logoUrl: '',
    backgroundGradient: GRADIENT_PRESETS[0].gradient,
    textColor: '#ffffff',
    benefits: [] as string[],
    unlockConditions: {
      conditions: [] as Condition[],
      autoAssign: true,
    },
    designConfig: {
      cardStyle: 'modern' as const,
      borderRadius: 16,
      showPattern: false,
      patternOpacity: 10,
    },
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/brand/card-templates', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        // No tiene acceso de marca
        window.location.href = '/brand';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch templates', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const token = localStorage.getItem('accessToken');
    const payload = {
      name: formData.name,
      tier: formData.tier,
      logoUrl: formData.logoUrl || undefined,
      backgroundGradient: formData.backgroundGradient,
      textColor: formData.textColor,
      benefits: formData.benefits.filter(b => b.trim()),
      unlockConditions: formData.unlockConditions,
      designConfig: formData.designConfig,
    };

    try {
      const url = editingTemplate 
        ? `/api/brand/card-templates/${editingTemplate.id}`
        : '/api/brand/card-templates';
      
      const response = await fetch(url, {
        method: editingTemplate ? 'PATCH' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.status === 403) {
        alert('No tienes permisos para realizar esta acción');
        return;
      }

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchTemplates();
      } else {
        alert('Error al guardar la tarjeta');
      }
    } catch (error) {
      console.error('Failed to save template', error);
      alert('Error al guardar la tarjeta');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta tarjeta?')) return;

    const token = localStorage.getItem('accessToken');
    try {
      const response = await fetch(`/api/brand/card-templates/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchTemplates();
      }
    } catch (error) {
      console.error('Failed to delete template', error);
    }
  };

  const handleDuplicate = async (template: CardTemplate) => {
    setEditingTemplate(null);
    const conditions = template.unlock_conditions || { conditions: [], autoAssign: true };
    const designConfig = template.design_config || {
      cardStyle: 'modern',
      borderRadius: 16,
      showPattern: false,
      patternOpacity: 10,
    };
    
    setFormData({
      name: `${template.name} (Copia)`,
      tier: template.tier,
      logoUrl: template.logo_url || '',
      backgroundGradient: template.background_gradient || GRADIENT_PRESETS[0].gradient,
      textColor: template.text_color || '#ffffff',
      benefits: [...(template.benefits || [])],
      unlockConditions: {
        conditions: [...((conditions as any).conditions || [])],
        autoAssign: (conditions as any).autoAssign !== false,
      },
      designConfig: { ...designConfig } as any,
    });
    setShowModal(true);
  };

  const handleEdit = (template: CardTemplate) => {
    setEditingTemplate(template);
    const conditions = template.unlock_conditions || { conditions: [], autoAssign: true };
    const designConfig = template.design_config || {
      cardStyle: 'modern',
      borderRadius: 16,
      showPattern: false,
      patternOpacity: 10,
    };
    
    setFormData({
      name: template.name,
      tier: template.tier,
      logoUrl: template.logo_url || '',
      backgroundGradient: template.background_gradient || GRADIENT_PRESETS[0].gradient,
      textColor: template.text_color || '#ffffff',
      benefits: template.benefits || [],
      unlockConditions: {
        conditions: (conditions as any).conditions || [],
        autoAssign: (conditions as any).autoAssign !== false,
      },
      designConfig: designConfig as any,
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setEditingTemplate(null);
    setActiveTab('design');
    setFormData({
      name: '',
      tier: 'member',
      logoUrl: '',
      backgroundGradient: GRADIENT_PRESETS[0].gradient,
      textColor: '#ffffff',
      benefits: [],
      unlockConditions: {
        conditions: [],
        autoAssign: true,
      },
      designConfig: {
        cardStyle: 'modern',
        borderRadius: 16,
        showPattern: false,
        patternOpacity: 10,
      },
    });
  };

  const addBenefit = () => {
    const benefit = prompt('Beneficio:');
    if (benefit) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, benefit],
      }));
    }
  };

  const removeBenefit = (index: number) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index),
    }));
  };

  const getCardStyle = (config: any) => {
    const borderRadius = config?.borderRadius || 16;
    const showPattern = config?.showPattern || false;
    
    return {
      borderRadius: `${borderRadius}px`,
      backgroundImage: showPattern 
        ? `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='${(config?.patternOpacity || 10) / 100}'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        : undefined,
    };
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
            <h1 className="text-4xl font-bold text-white mb-2">Wallet Cards</h1>
            <p className="text-white/70">Diseña tarjetas personalizadas con condiciones de obtención únicas</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25"
          >
            <Plus className="w-5 h-5" />
            Nueva Tarjeta
          </button>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((template) => {
            const unlockConditions = template.unlock_conditions || { conditions: [], autoAssign: false };
            const conditionsCount = (unlockConditions as any).conditions?.length || 0;
            
            return (
              <div
                key={template.id}
                className="bg-white/10 backdrop-blur-lg rounded-2xl overflow-hidden border border-white/20 hover:border-white/40 transition-all hover:shadow-xl hover:shadow-purple-500/10"
              >
                <div className="p-6">
                  <div
                    className="rounded-xl p-6 mb-4 relative overflow-hidden shadow-lg"
                    style={{ 
                      background: template.background_gradient,
                      minHeight: '200px',
                      ...getCardStyle(template.design_config),
                    }}
                  >
                    <div className="relative z-10">
                      {template.logo_url && (
                        <img
                          src={template.logo_url}
                          alt="Logo"
                          className="h-8 mb-4 object-contain"
                        />
                      )}
                      <div 
                        className="text-2xl font-bold mb-2"
                        style={{ color: template.text_color }}
                      >
                        {template.name}
                      </div>
                      <div 
                        className="text-sm uppercase tracking-wider opacity-80"
                        style={{ color: template.text_color }}
                      >
                        {template.tier}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <CreditCard className="w-12 h-12 opacity-20" style={{ color: template.text_color }} />
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    {template.benefits && template.benefits.length > 0 && (
                      <div>
                        <div className="text-white/60 text-xs uppercase tracking-wider mb-2 flex items-center gap-2">
                          <Sparkles className="w-3 h-3" />
                          {template.benefits.length} Beneficios
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <div className="text-white/60 text-xs uppercase tracking-wider mb-1 flex items-center gap-2">
                        <Settings className="w-3 h-3" />
                        Obtención
                      </div>
                      <div className="text-white/90 text-sm">
                        {conditionsCount === 0 ? (
                          'Sin condiciones'
                        ) : (unlockConditions as any).autoAssign ? (
                          `${conditionsCount} condición${conditionsCount > 1 ? 'es' : ''} automática${conditionsCount > 1 ? 's' : ''}`
                        ) : (
                          'Asignación manual'
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(template)}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-300 px-3 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      <Edit className="w-4 h-4" />
                      Editar
                    </button>
                    <button
                      onClick={() => handleDuplicate(template)}
                      className="flex items-center justify-center gap-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 text-purple-300 px-3 py-2 rounded-lg transition-colors"
                      title="Duplicar"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(template.id)}
                      className="flex items-center justify-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {templates.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-12 text-center border border-white/20">
            <CreditCard className="w-16 h-16 text-white/40 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No hay tarjetas configuradas</h3>
            <p className="text-white/70 mb-6">Crea tu primera tarjeta de membresía personalizada</p>
            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all"
            >
              Crear Primera Tarjeta
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-slate-900 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden border border-white/20 my-8">
            <div className="sticky top-0 bg-slate-900 border-b border-white/10 p-6 z-10">
              <h2 className="text-2xl font-bold text-white mb-4">
                {editingTemplate ? 'Editar Tarjeta' : 'Nueva Tarjeta'}
              </h2>
              
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('design')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'design'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Palette className="w-4 h-4" />
                  Diseño
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('benefits')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'benefits'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  Beneficios
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('conditions')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === 'conditions'
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/5 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  Condiciones
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
              <div className="p-6 space-y-6">
                {/* Preview Card - Always visible */}
                <div>
                  <label className="block text-white/90 font-medium mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Vista Previa
                  </label>
                  <div
                    className="rounded-xl p-6 relative overflow-hidden shadow-2xl"
                    style={{ 
                      background: formData.backgroundGradient,
                      minHeight: '220px',
                      ...getCardStyle(formData.designConfig),
                    }}
                  >
                    <div className="relative z-10">
                      {formData.logoUrl && (
                        <img
                          src={formData.logoUrl}
                          alt="Logo"
                          className="h-8 mb-4 object-contain"
                        />
                      )}
                      <div 
                        className="text-2xl font-bold mb-2"
                        style={{ color: formData.textColor }}
                      >
                        {formData.name || 'Nombre de la Tarjeta'}
                      </div>
                      <div 
                        className="text-sm uppercase tracking-wider opacity-80"
                        style={{ color: formData.textColor }}
                      >
                        {formData.tier}
                      </div>
                    </div>
                    <div className="absolute bottom-4 right-4">
                      <CreditCard className="w-12 h-12 opacity-20" style={{ color: formData.textColor }} />
                    </div>
                  </div>
                </div>

                {/* Design Tab */}
                {activeTab === 'design' && (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white/90 font-medium mb-2">Nombre *</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                          required
                          placeholder="ej: Tarjeta Platinum"
                        />
                      </div>

                      <div>
                        <label className="block text-white/90 font-medium mb-2">Tier *</label>
                        <select
                          value={formData.tier}
                          onChange={(e) => setFormData({ ...formData, tier: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
                          required
                        >
                          <option value="member">Member</option>
                          <option value="silver">Silver</option>
                          <option value="gold">Gold</option>
                          <option value="platinum">Platinum</option>
                          <option value="black">Black</option>
                          <option value="diamond">Diamond</option>
                          <option value="vip">VIP</option>
                        </select>
                      </div>
                    </div>

                    <ImageUpload
                      value={formData.logoUrl}
                      onChange={(url) => setFormData({ ...formData, logoUrl: url })}
                      namespace="card-logos"
                      label="Logo de la Tarjeta"
                      aspectRatio="16/9"
                      className="[&_label]:text-white/90 [&_button]:border-white/20 [&_button]:hover:border-purple-400 [&_button]:hover:bg-purple-500/10"
                    />

                    <div>
                      <label className="block text-white/90 font-medium mb-2">Estilo de Tarjeta</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {CARD_STYLES.map((style) => (
                          <button
                            key={style.value}
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              designConfig: { ...formData.designConfig, cardStyle: style.value as any }
                            })}
                            className={`p-3 rounded-lg border-2 transition-all text-left ${
                              formData.designConfig.cardStyle === style.value
                                ? 'border-purple-400 bg-purple-500/20'
                                : 'border-white/20 bg-white/5 hover:border-white/40'
                            }`}
                          >
                            <div className="font-semibold text-white mb-1">{style.label}</div>
                            <div className="text-xs text-white/60">{style.description}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/90 font-medium mb-3">Gradiente de Fondo</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 mb-3">
                        {GRADIENT_PRESETS.map((preset) => (
                          <button
                            key={preset.name}
                            type="button"
                            onClick={() => setFormData({ ...formData, backgroundGradient: preset.gradient })}
                            className={`h-14 rounded-lg border-2 transition-all relative group ${
                              formData.backgroundGradient === preset.gradient
                                ? 'border-purple-400 scale-105 shadow-lg'
                                : 'border-white/20 hover:border-white/40 hover:scale-105'
                            }`}
                            style={{ background: preset.gradient }}
                            title={preset.name}
                          >
                            <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center text-white text-xs font-medium">
                              {preset.name}
                            </span>
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        value={formData.backgroundGradient}
                        onChange={(e) => setFormData({ ...formData, backgroundGradient: e.target.value })}
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 text-sm font-mono"
                        placeholder="linear-gradient(...)"
                      />
                    </div>

                    <div>
                      <label className="block text-white/90 font-medium mb-2">Color del Texto</label>
                      <div className="flex gap-3">
                        <input
                          type="color"
                          value={formData.textColor}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                          className="h-12 w-20 rounded-lg border border-white/20 cursor-pointer"
                        />
                        <input
                          type="text"
                          value={formData.textColor}
                          onChange={(e) => setFormData({ ...formData, textColor: e.target.value })}
                          className="flex-1 bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 font-mono"
                          placeholder="#ffffff"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-white/90 font-medium mb-3">Personalización Avanzada</label>
                      <div className="bg-white/5 rounded-lg p-4 space-y-4">
                        <div>
                          <label className="block text-white/70 text-sm mb-2">
                            Radio de Borde: {formData.designConfig.borderRadius}px
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="32"
                            value={formData.designConfig.borderRadius}
                            onChange={(e) => setFormData({
                              ...formData,
                              designConfig: { ...formData.designConfig, borderRadius: parseInt(e.target.value) }
                            })}
                            className="w-full"
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <label className="text-white/70 text-sm">Mostrar Patrón de Fondo</label>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              designConfig: { ...formData.designConfig, showPattern: !formData.designConfig.showPattern }
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              formData.designConfig.showPattern ? 'bg-purple-500' : 'bg-white/20'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              formData.designConfig.showPattern ? 'translate-x-6' : ''
                            }`} />
                          </button>
                        </div>

                        {formData.designConfig.showPattern && (
                          <div>
                            <label className="block text-white/70 text-sm mb-2">
                              Opacidad del Patrón: {formData.designConfig.patternOpacity}%
                            </label>
                            <input
                              type="range"
                              min="0"
                              max="50"
                              value={formData.designConfig.patternOpacity}
                              onChange={(e) => setFormData({
                                ...formData,
                                designConfig: { ...formData.designConfig, patternOpacity: parseInt(e.target.value) }
                              })}
                              className="w-full"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Benefits Tab */}
                {activeTab === 'benefits' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label className="block text-white/90 font-medium">Beneficios de la Tarjeta</label>
                      <button
                        type="button"
                        onClick={addBenefit}
                        className="flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-medium"
                      >
                        <Plus className="w-4 h-4" />
                        Agregar Beneficio
                      </button>
                    </div>
                    
                    {formData.benefits.length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-lg border border-white/10">
                        <Sparkles className="w-12 h-12 text-white/30 mx-auto mb-3" />
                        <p className="text-white/60 mb-4">No hay beneficios agregados</p>
                        <button
                          type="button"
                          onClick={addBenefit}
                          className="text-purple-400 hover:text-purple-300 font-medium"
                        >
                          Agregar el primer beneficio
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {formData.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-center gap-3 bg-white/5 rounded-lg p-4 border border-white/10 hover:border-white/20 transition-colors">
                            <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0" />
                            <span className="text-white flex-1">{benefit}</span>
                            <button
                              type="button"
                              onClick={() => removeBenefit(index)}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Conditions Tab */}
                {activeTab === 'conditions' && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-white/90 font-medium mb-3">Cómo se Obtiene esta Tarjeta</label>
                      <div className="bg-white/5 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white/90">Asignación Automática</span>
                          <button
                            type="button"
                            onClick={() => setFormData({
                              ...formData,
                              unlockConditions: {
                                ...formData.unlockConditions,
                                autoAssign: !formData.unlockConditions.autoAssign
                              }
                            })}
                            className={`relative w-12 h-6 rounded-full transition-colors ${
                              formData.unlockConditions.autoAssign ? 'bg-purple-500' : 'bg-white/20'
                            }`}
                          >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                              formData.unlockConditions.autoAssign ? 'translate-x-6' : ''
                            }`} />
                          </button>
                        </div>
                        <p className="text-white/60 text-sm">
                          {formData.unlockConditions.autoAssign
                            ? 'Los usuarios recibirán esta tarjeta automáticamente cuando cumplan las condiciones.'
                            : 'Esta tarjeta solo puede ser asignada manualmente por un administrador.'}
                        </p>
                      </div>
                    </div>

                    {formData.unlockConditions.autoAssign && (
                      <div>
                        <label className="block text-white/90 font-medium mb-3">
                          Condiciones de Obtención
                        </label>
                        <ConditionBuilder
                          conditions={formData.unlockConditions.conditions}
                          onChange={(conditions) => setFormData({
                            ...formData,
                            unlockConditions: { ...formData.unlockConditions, conditions }
                          })}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="sticky bottom-0 bg-slate-900 border-t border-white/10 p-6 flex gap-3">
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
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-3 rounded-xl font-semibold transition-all shadow-lg shadow-purple-500/25"
                >
                  {editingTemplate ? 'Guardar Cambios' : 'Crear Tarjeta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
