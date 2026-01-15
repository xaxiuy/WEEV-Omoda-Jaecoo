import { Link } from 'react-router';
import { useAuth } from '@/react-app/hooks/useAuth';
import { ArrowRight, MessageCircle, Calendar, CreditCard } from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  if (user) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] pb-20">
        {/* Hero Section - Optimized for mobile */}
        <div className="bg-gradient-to-b from-white to-[#F5F5F7] border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 pt-12 md:pt-20 pb-8 md:pb-16 text-center">
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6 shadow-lg">
              <span>Hola, {user.name?.split(' ')[0] || 'Member'}</span>
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-3 md:mb-4 tracking-tight">
              Tu comunidad
            </h1>
            <p className="text-base md:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Conectá con tus marcas favoritas y disfrutá de beneficios exclusivos
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
          {/* Quick Actions Grid - Mobile optimized */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-12">
            <Link
              to="/chat"
              className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm active:scale-[0.98] md:hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
            >
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 group-active:scale-150 md:group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 shadow-lg group-active:scale-110 md:group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">Chat</h3>
                <p className="text-gray-600 text-sm mb-3 md:mb-4">Asistencia instantánea</p>
                <div className="flex items-center text-blue-600 text-sm font-medium">
                  <span>Iniciar</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-active:translate-x-1 md:group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              to="/events"
              className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm active:scale-[0.98] md:hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
            >
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 group-active:scale-150 md:group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 shadow-lg group-active:scale-110 md:group-hover:scale-110 transition-transform">
                  <Calendar className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">Eventos</h3>
                <p className="text-gray-600 text-sm mb-3 md:mb-4">Experiencias exclusivas</p>
                <div className="flex items-center text-purple-600 text-sm font-medium">
                  <span>Ver calendario</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-active:translate-x-1 md:group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>

            <Link
              to="/wallet"
              className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm active:scale-[0.98] md:hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100"
            >
              <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-amber-500/10 to-transparent rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 group-active:scale-150 md:group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative">
                <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 shadow-lg group-active:scale-110 md:group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1 md:mb-2">Wallet</h3>
                <p className="text-gray-600 text-sm mb-3 md:mb-4">Tu tarjeta digital</p>
                <div className="flex items-center text-amber-600 text-sm font-medium">
                  <span>Abrir</span>
                  <ArrowRight className="w-4 h-4 ml-1 group-active:translate-x-1 md:group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </div>

          {/* CTA Section - Mobile optimized */}
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl md:rounded-3xl p-8 md:p-12 text-center relative overflow-hidden shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0" style={{
                backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
                backgroundSize: '32px 32px'
              }}></div>
            </div>
            
            <div className="relative">
              <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 md:mb-4">
                Conectá con tu pasión
              </h2>
              <p className="text-gray-300 text-sm md:text-lg max-w-2xl mx-auto mb-6 md:mb-8 px-4">
                Unite a una comunidad de apasionados y compartí experiencias únicas
              </p>
              <Link
                to="/feed"
                className="inline-flex items-center space-x-2 bg-white text-gray-900 font-semibold px-6 py-3 md:px-8 md:py-4 rounded-full active:scale-95 md:hover:bg-gray-100 transition-all shadow-lg"
              >
                <span>Explorar Feed</span>
                <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Landing page for non-authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#F5F5F7] to-white">
      {/* Hero Section - Mobile optimized */}
      <div className="max-w-6xl mx-auto px-4 pt-16 md:pt-24 pb-12 md:pb-20 text-center">
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-amber-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium mb-6 md:mb-8 shadow-lg">
          <span>Bienvenido a WEEV</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-4 md:mb-6 tracking-tight px-4">
          Tu comunidad
          <br />
          <span className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 bg-clip-text text-transparent">
            comienza acá
          </span>
        </h1>
        
        <p className="text-base md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto mb-8 md:mb-12 px-6">
          Conectá directamente con tus marcas favoritas. Eventos exclusivos, asistencia personalizada y beneficios únicos.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center px-4">
          <Link
            to="/signup"
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 bg-black text-white font-semibold px-8 py-4 rounded-full active:scale-95 md:hover:bg-gray-800 transition-all shadow-lg"
          >
            <span>Comenzar</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          
          <Link
            to="/login"
            className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-full active:scale-95 md:hover:bg-gray-50 transition-all shadow-md border border-gray-200"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>

      {/* Features Grid - Mobile optimized */}
      <div className="max-w-6xl mx-auto px-4 py-12 md:py-20">
        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          <div className="text-center px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
              <MessageCircle className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3">Chat Directo</h3>
            <p className="text-sm md:text-base text-gray-600">
              Asistencia personalizada con respuestas instantáneas
            </p>
          </div>

          <div className="text-center px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
              <Calendar className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3">Eventos Exclusivos</h3>
            <p className="text-sm md:text-base text-gray-600">
              Test drives y experiencias únicas para la comunidad
            </p>
          </div>

          <div className="text-center px-4">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 md:mb-6 shadow-lg">
              <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-semibold text-gray-900 mb-2 md:mb-3">Wallet Digital</h3>
            <p className="text-sm md:text-base text-gray-600">
              Tu tarjeta de miembro con beneficios especiales
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section - Mobile optimized */}
      <div className="max-w-4xl mx-auto px-4 pb-16 md:pb-24">
        <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-2xl md:rounded-3xl p-8 md:p-12 lg:p-16 text-center relative overflow-hidden shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent"></div>
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)',
              backgroundSize: '32px 32px'
            }}></div>
          </div>
          
          <div className="relative">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6">
              Unite a la comunidad
            </h2>
            <p className="text-gray-300 text-base md:text-xl mb-6 md:mb-8 max-w-2xl mx-auto px-4">
              Más que una marca. Una experiencia completa diseñada para vos.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center space-x-2 bg-white text-gray-900 font-semibold px-8 py-4 md:px-10 md:py-5 rounded-full active:scale-95 md:hover:bg-gray-100 transition-all shadow-lg"
            >
              <span>Crear cuenta gratis</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
