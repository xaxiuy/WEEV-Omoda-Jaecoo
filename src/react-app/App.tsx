import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router";
import { supabase } from "@/supabaseClient";
import { ToastProvider } from "@/react-app/hooks/useToast";
import { NotificationsProvider } from "@/react-app/hooks/useNotifications";
import Navigation from "@/react-app/components/Navigation";
import Navbar from "@/react-app/components/Navbar";
import HomePage from "@/react-app/pages/Home";
import LoginPage from "@/react-app/pages/Login";
import SignupPage from "@/react-app/pages/Signup";
import ProfilePage from "@/react-app/pages/Profile";
import ActivatePage from "@/react-app/pages/Activate";
import WalletPage from "@/react-app/pages/Wallet";
import FeedPage from "@/react-app/pages/Feed";
import EventsPage from "@/react-app/pages/Events";
import BrandDashboardPage from "@/react-app/pages/BrandDashboard";
import BrandProductsPage from "@/react-app/pages/BrandProducts";
import BrandCardTemplatesPage from "@/react-app/pages/BrandCardTemplates";
import BrandWalletPage from "@/react-app/pages/BrandWallet";
import VehicleManagementPage from "@/react-app/pages/VehicleManagement";
import AdminPanelPage from "@/react-app/pages/AdminPanel";
import ChatPage from "@/react-app/pages/Chat";
import DashboardPage from "@/react-app/pages/Dashboard";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, []);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }
  ToastProvider>
      <NotificationsProvider>
        <Router>
        <Navbar />
        <div className="pt-16">
          <Navigation />
        </div>
port default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <NotificationsProvider>
          <Router>
          <Navbar />
          <div className="pt-16">
            <Navigation />
          </div>
          <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/activate"
            element={
              <ProtectedRoute>
                <ActivatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <WalletPage />
              </ProtectedRoute>
            }
          />
          <Route path="/feed" element={<FeedPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route
            path="/chat"
            element={
              <ProtectedRoute>
                <ChatPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand"
            element={
              <ProtectedRoute>
                <BrandDashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/products"
            element={
              <ProtectedRoute>
                <BrandProductsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/cards"
            element={
              <ProtectedRoute>
                <BrandCardTemplatesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/wallet"
            element={
              <ProtectedRoute>
                <BrandWalletPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/brand/vehicles"
            element={
              <ProtectedRoute>
                <VehicleManagementPage />
              </ProtectedRoute>
            }
        </Routes>
        </div>
        <Navigation />
      </Router>
    </NotificationsProvider>
  </Toast    <ProtectedRoute>
                <AdminPanelPage />
              </ProtectedRoute>
            }
          />
          </Routes>
        </Router>
        </NotificationsProvider>
      </ToastProvider>
    </AuthProvider>
  );
}
