import { Link, useLocation } from 'react-router';
import { Home, Calendar, CreditCard, User, Building2, Shield, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';

export default function Navigation() {
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;
  const isBrandUser = user?.role === 'brand_admin' || user?.role === 'brand_member';
  const isSuperAdmin = user?.role === 'superadmin';

  if (!user) return null;

  const NavItem = ({ 
    to, 
    icon: Icon, 
    label, 
    badge 
  }: { 
    to: string; 
    icon: React.ElementType; 
    label: string; 
    badge?: number;
  }) => {
    const active = isActive(to);
    
    return (
      <Link
        to={to}
        className={`relative flex flex-col items-center space-y-1 px-3 py-2 rounded-xl transition-all duration-200 active:scale-95 ${
          active 
            ? 'text-[#1877F2]' 
            : 'text-gray-500 active:text-gray-700'
        }`}
      >
        {/* Active indicator */}
        {active && (
          <div className="absolute -top-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-[#1877F2] rounded-full"></div>
        )}
        
        {/* Icon with badge */}
        <div className="relative">
          <Icon className={`w-6 h-6 transition-transform ${active ? 'scale-110' : ''}`} />
          {badge && badge > 0 && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-[9px] font-bold text-white">{badge > 9 ? '9+' : badge}</span>
            </div>
          )}
        </div>
        
        <span className={`text-[10px] md:text-xs font-medium transition-all ${
          active ? 'font-semibold' : ''
        }`}>
          {label}
        </span>
      </Link>
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-gray-200 z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)] safe-area-inset-bottom">
      <div className="max-w-7xl mx-auto px-2 md:px-4">
        <div className="flex items-center justify-around h-16 md:h-18">
          <NavItem to="/" icon={Home} label="Home" />
          <NavItem to="/dashboard" icon={LayoutDashboard} label="Dashboard" />
          <NavItem to="/events" icon={Calendar} label="Eventos" />
          <NavItem to="/wallet" icon={CreditCard} label="Wallet" />
          
          {isBrandUser && (
            <NavItem to="/brand" icon={Building2} label="Brand" />
          )}
          
          {isSuperAdmin && (
            <NavItem to="/admin" icon={Shield} label="Admin" />
          )}
          
          <NavItem to="/profile" icon={User} label="Perfil" />
        </div>
      </div>
    </nav>
  );
}
