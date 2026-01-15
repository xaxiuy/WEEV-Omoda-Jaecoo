import { useState, useEffect } from 'react';
import { CreditCard, Search, Filter, ChevronDown, ChevronUp, Award, Zap, Sparkles, Users } from 'lucide-react';
import WalletCardDisplay from '@/react-app/components/WalletCardDisplay';
import CardProgress from '@/react-app/components/CardProgress';

interface MemberCard {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  member_id: string;
  tier: string;
  template_id: string;
  template_name: string;
  design_config: any;
  activations_count: number;
  events_count: number;
  created_at: string;
}

interface CardTemplate {
  id: string;
  name: string;
  tier: string;
  description: string;
  gradient: string;
  style: string;
  textColor: string;
  borderRadius: number;
  pattern: string;
  patternOpacity: number;
  logoUrl: string | null;
  benefits: string[];
  unlocked?: boolean;
  progress?: any[];
}

export default function BrandWalletPage() {
  const [members, setMembers] = useState<MemberCard[]>([]);
  const [templates, setTemplates] = useState<CardTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [expandedMember, setExpandedMember] = useState<string | null>(null);
  const [memberProgress, setMemberProgress] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch('/api/brand/wallet/members', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 403) {
        // No tiene acceso de marca - redirigir al dashboard
        window.location.href = '/brand';
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setMembers(data.cards || []);
        setTemplates(data.templates || []);
      }
    } catch (error) {
      console.error('Failed to fetch wallet data', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMemberProgress = async (userId: string) => {
    setLoadingProgress(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/brand/wallet/members/${userId}/progress`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setMemberProgress(data);
      }
    } catch (error) {
      console.error('Failed to fetch member progress', error);
    } finally {
      setLoadingProgress(false);
    }
  };

  const assignCard = async (userId: string, templateId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`/api/brand/wallet/members/${userId}/assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ templateId }),
      });

      if (response.ok) {
        await fetchWalletData();
        if (expandedMember === userId) {
          await fetchMemberProgress(userId);
        }
      }
    } catch (error) {
      console.error('Failed to assign card', error);
    }
  };

  const toggleMemberExpand = async (userId: string) => {
    if (expandedMember === userId) {
      setExpandedMember(null);
      setMemberProgress(null);
    } else {
      setExpandedMember(userId);
      await fetchMemberProgress(userId);
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.member_id.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTier = filterTier === 'all' || member.tier === filterTier;
    
    return matchesSearch && matchesTier;
  });

  const tierCounts = members.reduce((acc, member) => {
    acc[member.tier] = (acc[member.tier] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-24">
      <div className="max-w-7xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Wallet Management</h1>
          <p className="text-white/70">Gestiona las tarjetas de tus miembros</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
            <div className="flex items-center space-x-3 mb-2">
              <Users className="w-6 h-6 text-blue-300" />
              <span className="text-white/70 text-sm">Total Miembros</span>
            </div>
            <div className="text-3xl font-bold text-white">{members.length}</div>
          </div>

          {Object.entries(tierCounts).map(([tier, count]) => (
            <div key={tier} className="bg-white/10 backdrop-blur-lg rounded-xl p-5 border border-white/20">
              <div className="flex items-center space-x-3 mb-2">
                <Award className="w-6 h-6 text-amber-300" />
                <span className="text-white/70 text-sm capitalize">{tier}</span>
              </div>
              <div className="text-3xl font-bold text-white">{count}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <input
                type="text"
                placeholder="Buscar por nombre, email o ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-white/50 focus:outline-none focus:border-white/40"
              />
            </div>
            
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <select
                value={filterTier}
                onChange={(e) => setFilterTier(e.target.value)}
                className="bg-white/5 border border-white/20 rounded-lg pl-10 pr-8 py-2.5 text-white appearance-none focus:outline-none focus:border-white/40 min-w-[200px]"
              >
                <option value="all">Todos los niveles</option>
                {templates.map(template => (
                  <option key={template.tier} value={template.tier}>
                    {template.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Members List */}
        <div className="space-y-4">
          {filteredMembers.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-12 border border-white/20 text-center">
              <CreditCard className="w-12 h-12 text-white/30 mx-auto mb-4" />
              <p className="text-white/70">No se encontraron miembros</p>
            </div>
          ) : (
            filteredMembers.map((member) => {
              const template = templates.find(t => t.id === member.template_id);
              const isExpanded = expandedMember === member.user_id;

              return (
                <div
                  key={member.id}
                  className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 overflow-hidden"
                >
                  {/* Member Header */}
                  <button
                    onClick={() => toggleMemberExpand(member.user_id)}
                    className="w-full p-6 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {member.user_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="text-left">
                          <div className="text-white font-semibold">{member.user_name}</div>
                          <div className="text-white/60 text-sm">{member.user_email}</div>
                          <div className="text-white/50 text-xs mt-1">ID: {member.member_id}</div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <div className="text-white/60 text-xs mb-1">Tarjeta Actual</div>
                          <div className="text-white font-semibold capitalize">{member.template_name}</div>
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-center">
                            <div className="flex items-center space-x-1 mb-1">
                              <Zap className="w-4 h-4 text-blue-400" />
                              <span className="text-white font-semibold">{member.activations_count}</span>
                            </div>
                            <div className="text-white/50 text-xs">Activaciones</div>
                          </div>

                          <div className="text-center">
                            <div className="flex items-center space-x-1 mb-1">
                              <Sparkles className="w-4 h-4 text-purple-400" />
                              <span className="text-white font-semibold">{member.events_count}</span>
                            </div>
                            <div className="text-white/50 text-xs">Eventos</div>
                          </div>
                        </div>

                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-white/50" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-white/50" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-white/10 p-6 bg-white/5">
                      {loadingProgress ? (
                        <div className="text-center py-8">
                          <div className="text-white/70">Cargando progreso...</div>
                        </div>
                      ) : memberProgress ? (
                        <div className="space-y-6">
                          {/* Current Card */}
                          <div>
                            <h3 className="text-white font-semibold mb-4">Tarjeta Actual</h3>
                            {template && (
                              <div className="max-w-md">
                                <WalletCardDisplay
                                  template={{
                                    ...template,
                                    gradient: member.design_config?.gradient || template.gradient,
                                    style: member.design_config?.style || template.style,
                                    textColor: member.design_config?.textColor || template.textColor,
                                    borderRadius: member.design_config?.borderRadius || template.borderRadius,
                                    pattern: member.design_config?.pattern || template.pattern,
                                    patternOpacity: member.design_config?.patternOpacity || template.patternOpacity,
                                    unlocked: true,
                                  }}
                                  memberId={member.member_id}
                                  userName={member.user_name}
                                  isActive={true}
                                />
                              </div>
                            )}
                          </div>

                          {/* Available Cards to Assign */}
                          <div>
                            <h3 className="text-white font-semibold mb-4">Asignar Nueva Tarjeta</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                              {memberProgress.templates.map((progTemplate: any) => (
                                <div
                                  key={progTemplate.id}
                                  className={`bg-white/5 rounded-lg p-4 border ${
                                    progTemplate.id === member.template_id
                                      ? 'border-green-500/50 bg-green-500/10'
                                      : 'border-white/10'
                                  }`}
                                >
                                  <div className="flex items-start justify-between mb-3">
                                    <div>
                                      <div className="text-white font-medium">{progTemplate.name}</div>
                                      <div className="text-white/60 text-sm">{progTemplate.description}</div>
                                    </div>
                                    {progTemplate.id === member.template_id && (
                                      <div className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                        Actual
                                      </div>
                                    )}
                                  </div>

                                  {progTemplate.unlocked ? (
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2 text-green-400 text-sm">
                                        <Award className="w-4 h-4" />
                                        <span>Desbloqueada</span>
                                      </div>
                                      {progTemplate.id !== member.template_id && (
                                        <button
                                          onClick={() => assignCard(member.user_id, progTemplate.id)}
                                          className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                                        >
                                          Asignar Tarjeta
                                        </button>
                                      )}
                                    </div>
                                  ) : (
                                    <div className="space-y-3">
                                      <div className="text-white/70 text-xs">Progreso de desbloqueo:</div>
                                      <div className="bg-black/20 rounded-lg p-3">
                                        <CardProgress 
                                          conditions={progTemplate.progress || []} 
                                          unlocked={false}
                                        />
                                      </div>
                                      <button
                                        onClick={() => assignCard(member.user_id, progTemplate.id)}
                                        className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-2 px-4 rounded-lg transition-colors border border-white/20"
                                      >
                                        Asignar Manualmente
                                      </button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
