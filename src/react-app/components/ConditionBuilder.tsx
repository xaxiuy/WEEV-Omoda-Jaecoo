import { Plus, X, ShoppingCart, Calendar, Package, Zap } from 'lucide-react';

export interface Condition {
  id: string;
  type: 'purchase' | 'event' | 'activation' | 'spending' | 'manual';
  operator: 'AND' | 'OR';
  params: {
    productId?: string;
    productCategory?: string;
    eventType?: string;
    minQuantity?: number;
    minAmount?: number;
    minEvents?: number;
  };
}

interface ConditionBuilderProps {
  conditions: Condition[];
  onChange: (conditions: Condition[]) => void;
}

const CONDITION_TYPES = [
  { value: 'purchase', label: 'Compra de Producto', icon: ShoppingCart },
  { value: 'event', label: 'Asistencia a Evento', icon: Calendar },
  { value: 'activation', label: 'Activación de Producto', icon: Package },
  { value: 'spending', label: 'Gasto Total', icon: Zap },
  { value: 'manual', label: 'Asignación Manual', icon: Zap },
];

export function ConditionBuilder({ conditions, onChange }: ConditionBuilderProps) {
  const addCondition = () => {
    const newCondition: Condition = {
      id: Date.now().toString(),
      type: 'purchase',
      operator: conditions.length === 0 ? 'AND' : 'OR',
      params: {},
    };
    onChange([...conditions, newCondition]);
  };

  const removeCondition = (id: string) => {
    onChange(conditions.filter(c => c.id !== id));
  };

  const updateCondition = (id: string, updates: Partial<Condition>) => {
    onChange(conditions.map(c => c.id === id ? { ...c, ...updates } : c));
  };

  const updateParams = (id: string, params: Partial<Condition['params']>) => {
    onChange(conditions.map(c => c.id === id ? { ...c, params: { ...c.params, ...params } } : c));
  };

  return (
    <div className="space-y-4">
      {conditions.map((condition, index) => {
        const ConditionIcon = CONDITION_TYPES.find(t => t.value === condition.type)?.icon || Zap;
        
        return (
          <div key={condition.id} className="space-y-3">
            {index > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-white/10" />
                <select
                  value={condition.operator}
                  onChange={(e) => updateCondition(condition.id, { operator: e.target.value as 'AND' | 'OR' })}
                  className="bg-purple-500/20 border border-purple-500/30 rounded-lg px-3 py-1 text-white text-sm font-semibold"
                >
                  <option value="AND">Y (todas las condiciones)</option>
                  <option value="OR">O (cualquier condición)</option>
                </select>
                <div className="flex-1 h-px bg-white/10" />
              </div>
            )}
            
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <div className="flex items-start gap-3">
                <div className="bg-purple-500/20 rounded-lg p-2">
                  <ConditionIcon className="w-5 h-5 text-purple-400" />
                </div>
                
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="block text-white/70 text-sm mb-2">Tipo de Condición</label>
                    <select
                      value={condition.type}
                      onChange={(e) => updateCondition(condition.id, { type: e.target.value as Condition['type'] })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                      {CONDITION_TYPES.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {condition.type === 'purchase' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Categoría de Producto</label>
                        <input
                          type="text"
                          value={condition.params.productCategory || ''}
                          onChange={(e) => updateParams(condition.id, { productCategory: e.target.value })}
                          placeholder="ej: Vehículos, Accesorios"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Cantidad Mínima</label>
                        <input
                          type="number"
                          value={condition.params.minQuantity || 1}
                          onChange={(e) => updateParams(condition.id, { minQuantity: parseInt(e.target.value) || 1 })}
                          min="1"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}

                  {condition.type === 'event' && (
                    <div className="grid md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Tipo de Evento</label>
                        <select
                          value={condition.params.eventType || ''}
                          onChange={(e) => updateParams(condition.id, { eventType: e.target.value })}
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        >
                          <option value="">Cualquier evento</option>
                          <option value="event">Evento General</option>
                          <option value="test_drive">Test Drive</option>
                          <option value="service_clinic">Service Clinic</option>
                          <option value="launch">Lanzamiento</option>
                          <option value="challenge">Desafío</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-white/70 text-sm mb-1">Eventos Mínimos</label>
                        <input
                          type="number"
                          value={condition.params.minEvents || 1}
                          onChange={(e) => updateParams(condition.id, { minEvents: parseInt(e.target.value) || 1 })}
                          min="1"
                          className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        />
                      </div>
                    </div>
                  )}

                  {condition.type === 'activation' && (
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Número de Activaciones</label>
                      <input
                        type="number"
                        value={condition.params.minQuantity || 1}
                        onChange={(e) => updateParams(condition.id, { minQuantity: parseInt(e.target.value) || 1 })}
                        min="1"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                      <p className="text-white/50 text-xs mt-1">Número de productos activados requeridos</p>
                    </div>
                  )}

                  {condition.type === 'spending' && (
                    <div>
                      <label className="block text-white/70 text-sm mb-1">Gasto Mínimo Total (USD)</label>
                      <input
                        type="number"
                        value={condition.params.minAmount || 0}
                        onChange={(e) => updateParams(condition.id, { minAmount: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.01"
                        className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>
                  )}

                  {condition.type === 'manual' && (
                    <div className="text-white/70 text-sm">
                      Esta tarjeta será asignada manualmente por los administradores de la marca.
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeCondition(condition.id)}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        );
      })}

      <button
        type="button"
        onClick={addCondition}
        className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white/70 hover:text-white transition-colors"
      >
        <Plus className="w-4 h-4" />
        Agregar Condición
      </button>

      {conditions.length === 0 && (
        <div className="text-center text-white/50 text-sm py-4">
          No hay condiciones definidas. Los usuarios no podrán obtener esta tarjeta automáticamente.
        </div>
      )}
    </div>
  );
}
