import { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  iconColor?: string;
}

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  action,
  iconColor = 'from-blue-500 to-purple-500'
}: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="max-w-md mx-auto">
        {/* Icon */}
        <div className="relative inline-block mb-6">
          {/* Background glow */}
          <div className={`absolute inset-0 bg-gradient-to-br ${iconColor} opacity-10 rounded-3xl blur-xl`} />
          
          {/* Icon container */}
          <div className={`relative w-20 h-20 bg-gradient-to-br ${iconColor} rounded-2xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-10 h-10 text-white" />
          </div>
        </div>

        {/* Text */}
        <h3 className="text-2xl font-bold text-gray-900 mb-3">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed mb-8">
          {description}
        </p>

        {/* Action Button */}
        {action && (
          <button
            onClick={action.onClick}
            className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
