import { Star, Lock, CheckCircle } from 'lucide-react';

interface CardTemplate {
  id: string;
  name: string;
  description: string;
  tier: string;
  gradient: string;
  style: string;
  textColor: string;
  borderRadius: number;
  pattern: string;
  patternOpacity: number;
  logoUrl: string | null;
  benefits: string[];
  unlocked: boolean;
  progress?: Array<{
    type: string;
    current: number;
    required: number;
    met: boolean;
    operator?: string;
    params?: any;
  }>;
}

interface WalletCardDisplayProps {
  template: CardTemplate;
  memberId: string;
  userName: string;
  isActive?: boolean;
  onClick?: () => void;
}

const gradientMap: Record<string, string> = {
  purple: 'from-purple-600 via-purple-700 to-indigo-800',
  sunset: 'from-orange-500 via-pink-500 to-purple-600',
  ocean: 'from-blue-500 via-cyan-500 to-teal-600',
  forest: 'from-green-600 via-emerald-600 to-teal-700',
  midnight: 'from-indigo-900 via-purple-900 to-pink-900',
  gold: 'from-yellow-600 via-amber-600 to-orange-700',
  silver: 'from-gray-400 via-gray-500 to-gray-600',
  rose: 'from-pink-500 via-rose-500 to-red-600',
  mint: 'from-emerald-400 via-teal-400 to-cyan-500',
  cosmic: 'from-violet-600 via-purple-600 to-fuchsia-700',
  fire: 'from-red-600 via-orange-600 to-yellow-500',
  ice: 'from-blue-400 via-cyan-300 to-sky-400',
};

const patternStyles: Record<string, any> = {
  none: {},
  dots: {
    backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)',
    backgroundSize: '24px 24px',
  },
  grid: {
    backgroundImage: 'linear-gradient(currentColor 1px, transparent 1px), linear-gradient(90deg, currentColor 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  },
  diagonal: {
    backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, currentColor 10px, currentColor 11px)',
  },
  waves: {
    backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'40\' height=\'40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M0 20 Q10 10 20 20 T40 20\' stroke=\'currentColor\' fill=\'none\'/%3E%3C/svg%3E")',
    backgroundSize: '40px 40px',
  },
};

export default function WalletCardDisplay({ 
  template, 
  memberId, 
  userName, 
  isActive = false,
  onClick 
}: WalletCardDisplayProps) {
  const gradient = gradientMap[template.gradient] || gradientMap.purple;
  const pattern = patternStyles[template.pattern] || {};
  
  const borderClass = template.style === 'classic' 
    ? 'border-4 border-white/20' 
    : template.style === 'minimal' 
    ? 'border border-white/10'
    : template.style === 'luxury'
    ? 'border-2 border-amber-400/50'
    : '';

  const cardContent = (
    <div className="relative aspect-[1.586/1] w-full overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
         style={{ borderRadius: `${template.borderRadius}px` }}>
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
        {/* Metallic shine effect */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent"></div>
        
        {/* Pattern overlay */}
        {template.pattern !== 'none' && (
          <div 
            className="absolute inset-0 text-white"
            style={{ 
              opacity: template.patternOpacity / 100,
              ...pattern,
            }}
          ></div>
        )}

        {/* Locked overlay */}
        {!template.unlocked && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
            <Lock className="w-16 h-16 text-white/50" />
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className={`relative h-full p-6 flex flex-col justify-between ${borderClass}`}>
        {/* Top Section */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 via-amber-400 to-amber-600 flex items-center justify-center shadow-lg ${!template.unlocked ? 'opacity-40' : ''}`}>
              <Star className="w-5 h-5 text-white fill-white" />
            </div>
            <div>
              <div className="text-xs font-medium tracking-wider uppercase"
                   style={{ color: template.textColor }}>
                {template.tier}
              </div>
            </div>
          </div>
          {template.logoUrl && (
            <img 
              src={template.logoUrl} 
              alt="Logo" 
              className={`h-10 object-contain ${!template.unlocked ? 'opacity-40' : 'opacity-90'}`}
            />
          )}
        </div>

        {/* Middle Section - Chip */}
        {template.unlocked && (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-10 rounded-md bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 shadow-lg relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent"></div>
              <div className="absolute inset-[2px] rounded-sm bg-gradient-to-br from-amber-300 to-amber-500"></div>
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div>
          {template.unlocked ? (
            <>
              <div className="mb-4">
                <div className="text-[10px] font-medium tracking-widest uppercase mb-1 opacity-60"
                     style={{ color: template.textColor }}>
                  Member Number
                </div>
                <div className="text-xl font-light tracking-[0.2em]"
                     style={{ color: template.textColor }}>
                  {memberId}
                </div>
              </div>

              <div className="flex items-end justify-between">
                <div>
                  <div className="text-[10px] font-medium tracking-widest uppercase mb-1 opacity-60"
                       style={{ color: template.textColor }}>
                    Cardholder
                  </div>
                  <div className="text-base font-light tracking-wider uppercase"
                       style={{ color: template.textColor }}>
                    {userName}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-medium tracking-widest uppercase mb-1 opacity-60"
                       style={{ color: template.textColor }}>
                    Since
                  </div>
                  <div className="text-sm font-light"
                       style={{ color: template.textColor }}>
                    {new Date().getFullYear()}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="text-base font-medium mb-1"
                   style={{ color: template.textColor }}>
                {template.name}
              </div>
              <div className="text-xs opacity-75"
                   style={{ color: template.textColor }}>
                Bloqueada
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active indicator */}
      {isActive && template.unlocked && (
        <div className="absolute top-4 right-4">
          <div className="bg-green-500 text-white text-xs font-medium px-2 py-1 rounded-full flex items-center space-x-1">
            <CheckCircle className="w-3 h-3" />
            <span>Activa</span>
          </div>
        </div>
      )}

      {/* Bottom edge accent */}
      {template.unlocked && (
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-white/50 to-transparent"></div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button onClick={onClick} className="w-full">
        {cardContent}
      </button>
    );
  }

  return cardContent;
}
