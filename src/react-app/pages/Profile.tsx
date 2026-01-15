import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '@/react-app/hooks/useAuth';
import { User, LogOut, Mail, Phone, MapPin, Shield, Edit2 } from 'lucide-react';

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await updateProfile(formData);
      setEditing(false);
    } catch (err: any) {
      setError(err.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-20">
      <div className="max-w-2xl mx-auto px-4 pt-6 md:pt-12">
        {/* Header Card */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-[#1877F2] to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                <User className="w-8 h-8 md:w-10 md:h-10 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {user.name || 'Usuario'}
                </h1>
                <div className="flex items-center space-x-2 text-gray-600 mt-1">
                  <Mail className="w-4 h-4" />
                  <p className="text-sm md:text-base">{user.email}</p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl transition-all active:scale-95 border border-red-100"
            >
              <LogOut className="w-4 h-4" />
              <span className="font-medium">Salir</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        {/* Profile Content */}
        <div className="bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all"
                  placeholder="Tu nombre"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all"
                  placeholder="+54 9 11 1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ciudad
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1877F2] focus:border-transparent transition-all"
                  placeholder="Buenos Aires"
                />
              </div>

              <div className="flex flex-col md:flex-row gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-[#1877F2] text-white font-semibold py-3 rounded-xl hover:bg-blue-600 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  {loading ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false);
                    setFormData({
                      name: user?.name || '',
                      phone: user?.phone || '',
                      city: user?.city || '',
                    });
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Shield className="w-4 h-4 text-gray-500" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Rol
                    </p>
                  </div>
                  <p className="text-gray-900 font-semibold capitalize text-lg">
                    {user.role === 'user' ? 'Usuario' : user.role === 'brand_admin' ? 'Admin de Marca' : user.role}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Mail className="w-4 h-4 text-gray-500" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Email verificado
                    </p>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">
                    {user.emailVerified ? 'Sí' : 'No'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Teléfono
                    </p>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">
                    {user.phone || 'No configurado'}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                  <div className="flex items-center space-x-2 mb-2">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Ciudad
                    </p>
                  </div>
                  <p className="text-gray-900 font-semibold text-lg">
                    {user.city || 'No configurado'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="w-full flex items-center justify-center space-x-2 bg-[#1877F2] text-white font-semibold py-3.5 rounded-xl hover:bg-blue-600 transition-all active:scale-95 shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                <span>Editar perfil</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
