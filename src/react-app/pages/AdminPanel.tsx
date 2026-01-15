import { useState, useEffect } from 'react';
import { Users, Building2, Car, FileText, Calendar, Shield } from 'lucide-react';
import { supabase } from '@/supabaseClient';

interface SystemStats {
  totalUsers: number;
  totalBrands: number;
  totalActivations: number;
  totalPosts: number;
  totalEvents: number;
}

export default function AdminPanelPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'brands'>('overview');

  useEffect(() => {
    fetchAdmin();
  }, [activeTab]);

  const fetchAdmin = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      
      if (activeTab === 'overview') {
        const response = await fetch('/api/admin/stats', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data.stats);
        }
      } else if (activeTab === 'users') {
        const response = await fetch('/api/admin/users', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = await response.json();
          setUsers(data.users);
        }
      } else if (activeTab === 'brands') {
        const response = await fetch('/api/admin/brands', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (response.ok) {
          const data = await response.json();
          setBrands(data.brands);
        }
      }
    } catch (error) {
      console.error('Failed to fetch admin data', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 pb-20">
      <div className="max-w-7xl mx-auto pt-8">
        <div className="flex items-center space-x-3 mb-8">
          <Shield className="w-10 h-10 text-yellow-400" />
          <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 bg-white/10 rounded-lg p-1 mb-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'overview' 
                ? 'bg-white/20 text-white' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'users' 
                ? 'bg-white/20 text-white' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('brands')}
            className={`flex-1 px-4 py-2 rounded-md transition-colors ${
              activeTab === 'brands' 
                ? 'bg-white/20 text-white' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            Brands
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Users className="w-8 h-8 text-purple-300 mb-4" />
              <div className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</div>
              <div className="text-white/70">Total Users</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Building2 className="w-8 h-8 text-pink-300 mb-4" />
              <div className="text-3xl font-bold text-white mb-1">{stats.totalBrands}</div>
              <div className="text-white/70">Total Brands</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Car className="w-8 h-8 text-blue-300 mb-4" />
              <div className="text-3xl font-bold text-white mb-1">{stats.totalActivations}</div>
              <div className="text-white/70">Total Activations</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <FileText className="w-8 h-8 text-green-300 mb-4" />
              <div className="text-3xl font-bold text-white mb-1">{stats.totalPosts}</div>
              <div className="text-white/70">Total Posts</div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
              <Calendar className="w-8 h-8 text-yellow-300 mb-4" />
              <div className="text-3xl font-bold text-white mb-1">{stats.totalEvents}</div>
              <div className="text-white/70">Total Events</div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Users</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Name</th>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Email</th>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Role</th>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Status</th>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-white">{user.name}</td>
                      <td className="px-6 py-4 text-white/80">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-sm">
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded text-sm ${
                          user.status === 'active' 
                            ? 'bg-green-500/20 text-green-300' 
                            : 'bg-red-500/20 text-red-300'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Brands Tab */}
        {activeTab === 'brands' && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/10">
              <h2 className="text-2xl font-bold text-white">Brands</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Name</th>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Slug</th>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Industry</th>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Status</th>
                    <th className="px-6 py-3 text-left text-white/70 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {brands.map((brand) => (
                    <tr key={brand.id} className="hover:bg-white/5">
                      <td className="px-6 py-4 text-white font-medium">{brand.name}</td>
                      <td className="px-6 py-4 text-white/80">{brand.slug}</td>
                      <td className="px-6 py-4 text-white/80 capitalize">{brand.industry || '-'}</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 rounded text-sm">
                          {brand.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/60 text-sm">
                        {new Date(brand.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
