import { useState, useEffect } from 'react';
import { useAuth } from '@/react-app/hooks/useAuth';
import { TrendingUp, Calendar, Award, Target, CheckCircle2, Clock, MapPin, Car } from 'lucide-react';
import { Link } from 'react-router';

interface DashboardData {
  userStats: {
    activations: number;
    eventsAttended: number;
    currentTier: string;
    memberSince: string;
  };
  cardProgress: {
    currentCard: any;
    nextCards: any[];
  };
  recentActivity: any[];
  upcomingEvents: any[];
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/user/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { 
      year: 'numeric',
      month: 'long',
      day: 'numeric' 
    });
  };

  const getProgressPercentage = (conditions: any[]) => {
    if (!conditions || conditions.length === 0) return 0;
    const met = conditions.filter(c => c.met).length;
    return Math.round((met / conditions.length) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Hola, {user?.name || 'Miembro'} 👋
          </h1>
          <p className="text-white/70 text-lg">Aquí está tu actividad y progreso</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-blue-500/20 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-blue-300" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {data?.userStats.activations || 0}
                </div>
                <div className="text-white/70 text-sm">Activaciones</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-green-500/20 rounded-xl">
                <Calendar className="w-6 h-6 text-green-300" />
              </div>
              <div>
                <div className="text-3xl font-bold text-white">
                  {data?.userStats.eventsAttended || 0}
                </div>
                <div className="text-white/70 text-sm">Eventos</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-purple-500/20 rounded-xl">
                <Award className="w-6 h-6 text-purple-300" />
              </div>
              <div>
                <div className="text-xl font-bold text-white capitalize">
                  {data?.userStats.currentTier || 'Member'}
                </div>
                <div className="text-white/70 text-sm">Nivel Actual</div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-3 bg-amber-500/20 rounded-xl">
                <Clock className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <div className="text-sm font-semibold text-white">
                  Miembro desde
                </div>
                <div className="text-white/70 text-xs mt-1">
                  {data?.userStats.memberSince ? formatDate(data.userStats.memberSince) : 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Progress */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Card */}
            {data?.cardProgress?.currentCard && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-purple-400" />
                  Tu Tarjeta Actual
                </h2>
                <div className="bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="text-sm opacity-80">Nivel</div>
                      <div className="text-2xl font-bold capitalize">
                        {data.cardProgress.currentCard.tier}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm opacity-80">ID Miembro</div>
                      <div className="font-mono text-sm">
                        {data.cardProgress.currentCard.memberId?.slice(0, 8)}
                      </div>
                    </div>
                  </div>
                  <div className="text-lg font-semibold">{user?.name}</div>
                  <div className="text-sm opacity-80">{user?.email}</div>
                </div>
              </div>
            )}

            {/* Next Cards Progress */}
            {data?.cardProgress?.nextCards && data.cardProgress.nextCards.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <Target className="w-6 h-6 text-green-400" />
                  Próximos Niveles
                </h2>
                <div className="space-y-4">
                  {data.cardProgress.nextCards.slice(0, 3).map((card: any) => {
                    const progress = getProgressPercentage(card.progress);
                    return (
                      <div key={card.id} className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="text-white font-semibold text-lg">{card.name}</div>
                            <div className="text-white/60 text-sm capitalize">{card.tier}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-white">{progress}%</div>
                            <div className="text-white/60 text-xs">Completado</div>
                          </div>
                        </div>
                        
                        <div className="w-full bg-white/10 rounded-full h-2 mb-3">
                          <div
                            className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>

                        {card.progress && card.progress.length > 0 && (
                          <div className="space-y-2">
                            {card.progress.map((condition: any, idx: number) => (
                              <div
                                key={idx}
                                className="flex items-center justify-between text-sm"
                              >
                                <div className="flex items-center gap-2">
                                  {condition.met ? (
                                    <CheckCircle2 className="w-4 h-4 text-green-400" />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30" />
                                  )}
                                  <span className={condition.met ? 'text-white' : 'text-white/60'}>
                                    {condition.type === 'activation' && 'Activaciones'}
                                    {condition.type === 'event' && 'Eventos'}
                                    {condition.type === 'purchase' && 'Compras'}
                                  </span>
                                </div>
                                <span className={condition.met ? 'text-green-400' : 'text-white/60'}>
                                  {condition.current} / {condition.required}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent Activity */}
            {data?.recentActivity && data.recentActivity.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-400" />
                  Actividad Reciente
                </h2>
                <div className="space-y-3">
                  {data.recentActivity.map((activity: any) => (
                    <div
                      key={activity.id}
                      className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        {activity.type === 'activation' && <Car className="w-5 h-5 text-purple-300" />}
                        {activity.type === 'event' && <Calendar className="w-5 h-5 text-green-300" />}
                        {activity.type === 'card_upgrade' && <Award className="w-5 h-5 text-amber-300" />}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">{activity.title}</div>
                        <div className="text-white/60 text-sm">{activity.description}</div>
                        <div className="text-white/40 text-xs mt-1">
                          {formatDate(activity.createdAt)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Upcoming Events */}
          <div className="space-y-6">
            {data?.upcomingEvents && data.upcomingEvents.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-green-400" />
                  Próximos Eventos
                </h2>
                <div className="space-y-3">
                  {data.upcomingEvents.map((event: any) => (
                    <Link
                      key={event.id}
                      to={`/events`}
                      className="block p-4 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors"
                    >
                      {event.imageUrl && (
                        <img
                          src={event.imageUrl}
                          alt={event.title}
                          className="w-full h-32 object-cover rounded-lg mb-3"
                        />
                      )}
                      <div className="text-white font-semibold mb-1">{event.title}</div>
                      <div className="flex items-center gap-2 text-white/60 text-sm mb-2">
                        <Clock className="w-4 h-4" />
                        {new Date(event.startAt).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                      {event.city && (
                        <div className="flex items-center gap-2 text-white/60 text-sm">
                          <MapPin className="w-4 h-4" />
                          {event.city}
                        </div>
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
              <div className="space-y-2">
                <Link
                  to="/activate"
                  className="block p-3 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-white transition-colors"
                >
                  <div className="font-semibold">Activar Vehículo</div>
                  <div className="text-sm text-white/70">Registra tu nuevo vehículo</div>
                </Link>
                <Link
                  to="/events"
                  className="block p-3 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-lg text-white transition-colors"
                >
                  <div className="font-semibold">Ver Eventos</div>
                  <div className="text-sm text-white/70">Descubre próximos eventos</div>
                </Link>
                <Link
                  to="/wallet"
                  className="block p-3 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 rounded-lg text-white transition-colors"
                >
                  <div className="font-semibold">Mi Wallet</div>
                  <div className="text-sm text-white/70">Ver tu tarjeta de miembro</div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
