import { ShoppingCart, Calendar, Package, DollarSign, CheckCircle, X } from 'lucide-react';

interface ProgressCondition {
  type: string;
  current: number;
  required: number;
  met: boolean;
  operator?: string;
  params?: any;
}

interface CardProgressProps {
  conditions: ProgressCondition[];
  unlocked: boolean;
}

const conditionIcons: Record<string, any> = {
  purchase: ShoppingCart,
  event: Calendar,
  activation: Package,
  spending: DollarSign,
  manual: CheckCircle,
};

const conditionLabels: Record<string, string> = {
  purchase: 'Compras',
  event: 'Eventos',
  activation: 'Activaciones',
  spending: 'Gasto Total',
  manual: 'Asignación Manual',
};

export default function CardProgress({ conditions, unlocked }: CardProgressProps) {
  if (unlocked) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center space-x-2 text-green-700">
          <CheckCircle className="w-5 h-5" />
          <span className="font-medium">Tarjeta Desbloqueada</span>
        </div>
      </div>
    );
  }

  if (!conditions || conditions.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
        <div className="text-gray-600 text-sm text-center">
          Asignación manual requerida
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {conditions.map((condition, index) => {
        const Icon = conditionIcons[condition.type] || Package;
        const label = conditionLabels[condition.type] || condition.type;
        const percentage = Math.min((condition.current / condition.required) * 100, 100);
        
        let description = '';
        if (condition.type === 'purchase' && condition.params?.productCategory) {
          description = `Categoría: ${condition.params.productCategory}`;
        } else if (condition.type === 'event' && condition.params?.eventType) {
          description = `Tipo: ${condition.params.eventType}`;
        } else if (condition.type === 'spending' && condition.params?.minAmount) {
          description = `Mínimo: $${condition.params.minAmount}`;
        }

        return (
          <div key={index}>
            {/* Operator badge (for 2nd+ conditions) */}
            {index > 0 && condition.operator && (
              <div className="flex justify-center -mb-1 relative z-10">
                <div className="bg-white border border-gray-300 rounded-full px-3 py-1 text-xs font-medium text-gray-600 shadow-sm">
                  {condition.operator}
                </div>
              </div>
            )}
            
            <div className={`border rounded-xl p-4 ${
              condition.met 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200'
            }`}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    condition.met ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      condition.met ? 'text-green-600' : 'text-gray-500'
                    }`} />
                  </div>
                  <div>
                    <div className={`font-medium text-sm ${
                      condition.met ? 'text-green-900' : 'text-gray-900'
                    }`}>
                      {label}
                    </div>
                    {description && (
                      <div className="text-xs text-gray-500 mt-0.5">
                        {description}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {condition.met ? (
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  ) : (
                    <X className="w-5 h-5 text-gray-400" />
                  )}
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className={condition.met ? 'text-green-700' : 'text-gray-600'}>
                    Progreso
                  </span>
                  <span className={`font-medium ${
                    condition.met ? 'text-green-700' : 'text-gray-900'
                  }`}>
                    {condition.current} / {condition.required}
                  </span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all duration-500 ${
                      condition.met 
                        ? 'bg-gradient-to-r from-green-500 to-green-600' 
                        : 'bg-gradient-to-r from-blue-500 to-blue-600'
                    }`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
