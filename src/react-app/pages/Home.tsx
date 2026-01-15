import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { supabase } from '@/supabaseClient';
import { ArrowRight, MessageCircle, Calendar, CreditCard } from 'lucide-react';

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) {
        navigate('/login');
        return;
      }
      setUser(authUser.user_metadata || {});
    } catch (err) {
      console.error('Error fetching user:', err);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 pb-20 pt-20">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-4 pt-12 md:pt-20 pb-8 md:pb-16 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-3 py-1.5 rounded-full text-xs md:text-sm font-medium mb-4 md:mb-6 shadow-lg">
            <span>Welcome, {user.name?.split(' ')[0] || 'Member'}</span>
          </div>
          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-slate-900 mb-3 md:mb-4 tracking-tight">
            Your Community
          </h1>
          <p className="text-base md:text-xl text-slate-600 max-w-2xl mx-auto px-4">
            Connect with your favorite brands and enjoy exclusive benefits
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6 md:py-12">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-12">
          <Link
            to="/chat"
            className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm active:scale-[0.98] md:hover:shadow-xl transition-all duration-200 overflow-hidden border border-slate-200"
          >
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 group-active:scale-150 md:group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 shadow-lg group-active:scale-110 md:group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-1 md:mb-2">Chat</h3>
              <p className="text-slate-600 text-sm mb-3 md:mb-4">Instant support</p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <span>Start</span>
                <ArrowRight className="w-4 h-4 ml-1 group-active:translate-x-1 md:group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            to="/events"
            className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm active:scale-[0.98] md:hover:shadow-xl transition-all duration-200 overflow-hidden border border-slate-200"
          >
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 group-active:scale-150 md:group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 shadow-lg group-active:scale-110 md:group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-1 md:mb-2">Events</h3>
              <p className="text-slate-600 text-sm mb-3 md:mb-4">Exclusive experiences</p>
              <div className="flex items-center text-purple-600 text-sm font-medium">
                <span>View calendar</span>
                <ArrowRight className="w-4 h-4 ml-1 group-active:translate-x-1 md:group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link
            to="/wallet"
            className="group relative bg-white rounded-2xl md:rounded-3xl p-6 md:p-8 shadow-sm active:scale-[0.98] md:hover:shadow-xl transition-all duration-200 overflow-hidden border border-slate-200"
          >
            <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full -mr-12 md:-mr-16 -mt-12 md:-mt-16 group-active:scale-150 md:group-hover:scale-150 transition-transform duration-500"></div>
            <div className="relative">
              <div className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl md:rounded-2xl flex items-center justify-center mb-3 md:mb-5 shadow-lg group-active:scale-110 md:group-hover:scale-110 transition-transform">
                <CreditCard className="w-6 h-6 md:w-7 md:h-7 text-white" />
              </div>
              <h3 className="text-xl md:text-2xl font-semibold text-slate-900 mb-1 md:mb-2">Wallet</h3>
              <p className="text-slate-600 text-sm mb-3 md:mb-4">Digital card</p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <span>Open</span>
                <ArrowRight className="w-4 h-4 ml-1 group-active:translate-x-1 md:group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
