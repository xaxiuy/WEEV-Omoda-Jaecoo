import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '@/supabaseClient';
import { LoadingSpinner } from '@/react-app/components/LoadingSpinner';
import { User, LogOut, Mail, Phone, MapPin, Shield, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', city: '' });
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        setUser(authUser.user_metadata || {});
        setFormData({
          name: authUser.user_metadata?.name || '',
          phone: authUser.user_metadata?.phone || '',
          city: authUser.user_metadata?.city || '',
        });
      }
    } catch (err) {
      console.error('Error fetching user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSaving(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          name: formData.name,
          phone: formData.phone,
          city: formData.city,
        },
      });

      if (updateError) throw updateError;
      
      setUser(formData);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (isLoading) return <LoadingSpinner />;
  if (!user) return <div className="min-h-screen flex items-center justify-center">No user data</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 pt-20">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header Card */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-slate-200 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                  {user.name || 'Usuario'}
                </h1>
                <div className="flex items-center space-x-2 text-slate-600 mt-1">
                  <Mail className="w-4 h-4" />
                  <p className="text-sm md:text-base truncate">{user.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-all active:scale-95 border border-red-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-2xl p-6 md:p-8 shadow-md border border-slate-200">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="+598 99 123 456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-900 mb-2">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Montevideo"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user.name || '',
                      phone: user.phone || '',
                      city: user.city || '',
                    });
                  }}
                  className="flex-1 bg-slate-100 text-slate-700 font-semibold py-3 rounded-lg hover:bg-slate-200 transition-all active:scale-95"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                  </div>
                  <p className="text-slate-900 font-semibold text-sm truncate">{user.email}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-500 uppercase">Phone</p>
                  </div>
                  <p className="text-slate-900 font-semibold">{user.phone || 'Not configured'}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-500 uppercase">City</p>
                  </div>
                  <p className="text-slate-900 font-semibold">{user.city || 'Not configured'}</p>
                </div>

                <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-500 uppercase">Role</p>
                  </div>
                  <p className="text-slate-900 font-semibold capitalize">{user.role || 'User'}</p>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition-all active:scale-95 shadow-md"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
