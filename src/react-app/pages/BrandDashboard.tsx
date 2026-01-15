import { useState, useEffect } from 'react';
import { Users, Calendar, TrendingUp, Car, CreditCard, Package, BarChart3 } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { supabase } from '@/supabaseClient';

interface DashboardStats {
  totalActivations: number;
  totalModels: number;
  totalInventory: number;
  totalEvents: number;
  upcomingEvents: number;
  totalCardTemplates: number;
  totalMembers: number;
}

export default function BrandDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      const [statsRes, analyticsRes] = await Promise.all([
        fetch('/api/brand/dashboard', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
        fetch('/api/brand/analytics?days=30', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (analyticsRes.ok) {
        const data = await analyticsRes.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      <div className="max-w-7xl mx-auto pt-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Panel de Control</h1>
          <p className="text-white/70">Gestiona tu marca y comunidad</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-blue-300" />
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats?.totalActivations || 0}</div>
            <div className="text-white/70">Activaciones Totales</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Car className="w-8 h-8 text-purple-300" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats?.totalModels || 0}</div>
            <div className="text-white/70">Modelos de Vehículos</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Package className="w-8 h-8 text-amber-300" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats?.totalInventory || 0}</div>
            <div className="text-white/70">VINs en Inventario</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Calendar className="w-8 h-8 text-green-300" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats?.upcomingEvents || 0}</div>
            <div className="text-white/70">Eventos Próximos</div>
            <div className="text-white/50 text-sm mt-1">de {stats?.totalEvents || 0} totales</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <CreditCard className="w-8 h-8 text-pink-300" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats?.totalCardTemplates || 0}</div>
            <div className="text-white/70">Diseños de Tarjetas</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <Users className="w-8 h-8 text-cyan-300" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">{stats?.totalMembers || 0}</div>
            <div className="text-white/70">Miembros Activos</div>
          </div>

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:border-white/30 transition-all">
            <div className="flex items-center justify-between mb-4">
              <BarChart3 className="w-8 h-8 text-yellow-300" />
            </div>
            <div className="text-3xl font-bold text-white mb-1">
              {analytics?.totalEvents || 0}
            </div>
            <div className="text-white/70">Eventos Analytics (30d)</div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Gestión de Marca</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/brand/vehicles"
              className="bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-xl p-6 text-white transition-all hover:scale-105 group"
            >
              <Car className="w-8 h-8 mb-3 text-purple-300 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-lg mb-1">Vehículos</div>
              <div className="text-sm text-white/70">Modelos e Inventario VIN</div>
            </a>
            
            <a
              href="/brand/cards"
              className="bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/30 rounded-xl p-6 text-white transition-all hover:scale-105 group"
            >
              <CreditCard className="w-8 h-8 mb-3 text-pink-300 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-lg mb-1">Wallet Cards</div>
              <div className="text-sm text-white/70">Diseños de tarjetas</div>
            </a>
            
            <a
              href="/brand/wallet"
              className="bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-xl p-6 text-white transition-all hover:scale-105 group"
            >
              <Users className="w-8 h-8 mb-3 text-cyan-300 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-lg mb-1">Miembros</div>
              <div className="text-sm text-white/70">Gestión de wallet</div>
            </a>
            
            <a
              href="/events"
              className="bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 rounded-xl p-6 text-white transition-all hover:scale-105 group"
            >
              <Calendar className="w-8 h-8 mb-3 text-green-300 group-hover:scale-110 transition-transform" />
              <div className="font-semibold text-lg mb-1">Eventos</div>
              <div className="text-sm text-white/70">Crear y gestionar</div>
            </a>
          </div>
        </div>

        {/* Analytics Charts */}
        {analytics && (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Activity Timeline */}
            {analytics.eventsByDay && Object.keys(analytics.eventsByDay).length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Actividad Diaria (30 días)</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={Object.entries(analytics.eventsByDay)
                      .map(([date, count]) => ({
                        date: new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
                        eventos: count,
                      }))
                      .slice(-30)}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.5)"
                      style={{ fontSize: '12px' }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: 'white',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="eventos"
                      stroke="#a78bfa"
                      strokeWidth={3}
                      dot={{ fill: '#a78bfa', r: 4 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Event Types Distribution */}
            {analytics.eventsByType && Object.keys(analytics.eventsByType).length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <h2 className="text-2xl font-bold text-white mb-6">Distribución de Eventos</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analytics.eventsByType)
                        .sort(([, a]: any, [, b]: any) => b - a)
                        .slice(0, 6)
                        .map(([type, count], index) => ({
                          name: type.replace(/_/g, ' '),
                          value: count,
                          color: ['#a78bfa', '#ec4899', '#22d3ee', '#34d399', '#fbbf24', '#fb923c'][index],
                        }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {Object.entries(analytics.eventsByType)
                        .slice(0, 6)
                        .map((_, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={['#a78bfa', '#ec4899', '#22d3ee', '#34d399', '#fbbf24', '#fb923c'][index]}
                          />
                        ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgba(30, 41, 59, 0.95)',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '12px',
                        color: 'white',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* Top Events List */}
        {analytics && analytics.eventsByType && Object.keys(analytics.eventsByType).length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <h2 className="text-2xl font-bold text-white mb-6">Top Actividades (30 días)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(analytics.eventsByType || {})
                .sort(([, a]: any, [, b]: any) => b - a)
                .slice(0, 8)
                .map(([type, count]: any, index: number) => (
                  <div key={type} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10 hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="text-white font-semibold capitalize">{type.replace(/_/g, ' ')}</div>
                        <div className="text-white/60 text-sm">
                          {count} {count === 1 ? 'evento' : 'eventos'}
                        </div>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-white">{count}</div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
