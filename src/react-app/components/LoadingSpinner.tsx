import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function LoadingSpinner({ 
  message = 'Cargando...', 
  fullScreen = true,
  size = 'md' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const content = (
    <div className="flex flex-col items-center justify-center space-y-4">
      <div className="relative">
        {/* Animated background circle */}
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 rounded-full animate-pulse" />
        
        {/* Spinner */}
        <Loader2 className={`${sizeClasses[size]} text-blue-600 animate-spin relative z-10`} />
      </div>
      
      {message && (
        <p className="text-gray-600 font-medium text-sm animate-pulse">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 flex items-center justify-center pb-20">
        {content}
      </div>
    );
  }

  return content;
}
