import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { CreditCard, Bell, ChevronRight, Sparkles, Star, Lock, Zap, Gift, TrendingUp } from 'lucide-react';
import { useAuth } from '@/react-app/hooks/useAuth';
import WalletCardDisplay from '@/react-app/components/WalletCardDisplay';
import CardProgress from '@/react-app/components/CardProgress';

interface WalletCard {
  id: string;
  memberId: string;
  tier: string;
  brand: {
    name: string;
    logoUrl: string | null;
  };
}

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
  progress?: any[];
}

interface WalletUpdate {
  id: string;
  type: string;
  title: string;
  description: string | null;
  actionUrl: string | null;
  isRead: boolean;
  createdAt: string;
}

export default function WalletPage() {
  const { user } = useAuth();
  const [card, setCard] = useState<WalletCard | null>(null);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [userProgress, setUserProgress] = useState<any>(null);
  const [updates, setUpdates] = useState<WalletUpdate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<CardTemplate | null>(null);

  useEffect(() => {
    fetchWallet();
  }, []);

  const fetchWallet = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      
      const [cardRes, templatesRes, updatesRes] = await Promise.all([
        fetch('/api/wallet/card', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/wallet/templates', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('/api/wallet/updates', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (cardRes.ok) {
        const data = await cardRes.json();
        setCard(data.card);
      }

      if (templatesRes.ok) {
        const data = await templatesRes.json();
        setTemplates(data.templates);
        setUserProgress(data.userProgress);
      }

      if (updatesRes.ok) {
        const data = await updatesRes.json();
        setUpdates(data.updates);
      }
    } catch (error) {
      console.error('Failed to fetch wallet', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (updateId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      await fetch(`/api/wallet/updates/${updateId}/read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdates(updates.map(u => u.id === updateId ? { ...u, isRead: true } : u));
    } catch (error) {
      console.error('Failed to mark as read', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-gray-600 text-xl">Cargando...</div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] p-4">
        <div className="max-w-md mx-auto pt-20 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-lg">
            <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-300 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <CreditCard className="w-10 h-10 text-gray-500" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Sin Tarjeta de Miembro</h2>
            <p className="text-gray-500 mb-8">Activá tu vehículo para obtener tu tarjeta digital</p>
            <Link
              to="/activate"
              className="inline-block bg-black text-white font-medium px-8 py-3 rounded-full hover:bg-gray-800 transition-all"
            >
              Activar Vehículo
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const activeTemplate = templates.find(t => t.tier === card.tier);
  const unlockedTemplates = templates.filter(t => t.unlocked);
  const lockedTemplates = templates.filter(t => !t.unlocked);

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Wallet</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4">
        {/* Active Card */}
        {activeTemplate && (
          <div className="py-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Tu Tarjeta</h2>
              <div className="flex items-center space-x-2 text-green-600 text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Activa</span>
              </div>
            </div>
            <WalletCardDisplay
              template={activeTemplate}
              memberId={card.memberId}
              userName={user?.name || 'Member'}
              isActive={true}
            />
            
            {/* Benefits */}
            {activeTemplate.benefits && activeTemplate.benefits.length > 0 && (
              <div className="mt-6 bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center space-x-2 mb-4">
                  <Gift className="w-5 h-5 text-purple-600" />
                  <h3 className="font-semibold text-gray-900">Beneficios</h3>
                </div>
                <div className="space-y-2">
                  {activeTemplate.benefits.map((benefit, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Progress Overview */}
        {userProgress && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
              Tu Progreso
            </h2>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Zap className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{userProgress.activations}</div>
                  <div className="text-xs text-gray-500 mt-1">Activaciones</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{userProgress.events}</div>
                  <div className="text-xs text-gray-500 mt-1">Eventos</div>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{userProgress.purchases}</div>
                  <div className="text-xs text-gray-500 mt-1">Compras</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Available Cards */}
        {unlockedTemplates.length > 1 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3">
              Tarjetas Disponibles
            </h2>
            <div className="space-y-4">
              {unlockedTemplates.filter(t => t.tier !== card.tier).map(template => (
                <div key={template.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <WalletCardDisplay
                    template={template}
                    memberId={card.memberId}
                    userName={user?.name || 'Member'}
                    onClick={() => setSelectedTemplate(template)}
                  />
                  {selectedTemplate?.id === template.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-900 mb-3">Beneficios</h4>
                      <div className="space-y-2">
                        {template.benefits.map((benefit, index) => (
                          <div key={index} className="flex items-start space-x-2">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Locked Cards */}
        {lockedTemplates.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 mb-3 flex items-center space-x-2">
              <Lock className="w-4 h-4" />
              <span>Desbloquea Nuevas Tarjetas</span>
            </h2>
            <div className="space-y-4">
              {lockedTemplates.map(template => (
                <div key={template.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <WalletCardDisplay
                    template={template}
                    memberId={card.memberId}
                    userName={user?.name || 'Member'}
                    onClick={() => setSelectedTemplate(selectedTemplate?.id === template.id ? null : template)}
                  />
                  
                  {selectedTemplate?.id === template.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-2">Descripción</h4>
                        <p className="text-sm text-gray-600">{template.description}</p>
                      </div>

                      {template.benefits.length > 0 && (
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-2">Beneficios</h4>
                          <div className="space-y-2">
                            {template.benefits.map((benefit, index) => (
                              <div key={index} className="flex items-start space-x-2">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500 flex-shrink-0 mt-0.5" />
                                <span className="text-sm text-gray-700">{benefit}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Requisitos para Desbloquear</h4>
                        <CardProgress conditions={template.progress || []} unlocked={false} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Access & Updates Section */}
        <div className="space-y-3 mb-8">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
            Acceso Rápido
          </h2>
          
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <Link
              to="/events?type=service_clinic"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <div className="text-gray-900 font-medium text-sm">Agendar Service</div>
                  <div className="text-gray-500 text-xs">Próximos eventos disponibles</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              to="/events"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <div className="text-gray-900 font-medium text-sm">Eventos Exclusivos</div>
                  <div className="text-gray-500 text-xs">Test drives y más</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>

            <Link
              to="/chat"
              className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <Bell className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-gray-900 font-medium text-sm">Asistencia</div>
                  <div className="text-gray-500 text-xs">Chat con soporte</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" />
            </Link>
          </div>
        </div>

        {/* Notifications */}
        {updates.length > 0 && (
          <div className="space-y-3 mb-8">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-4">
              Notificaciones
            </h2>
            
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden divide-y divide-gray-100">
              {updates.slice(0, 5).map((update) => (
                <button
                  key={update.id}
                  onClick={() => !update.isRead && markAsRead(update.id)}
                  className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                    !update.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      !update.isRead ? 'bg-blue-500' : 'bg-gray-300'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-gray-900 font-medium text-sm mb-1">{update.title}</div>
                      {update.description && (
                        <p className="text-gray-500 text-xs line-clamp-2">{update.description}</p>
                      )}
                      <p className="text-gray-400 text-xs mt-1">
                        {new Date(update.createdAt).toLocaleDateString('es-UY', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                    {update.actionUrl && (
                      <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-1" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
