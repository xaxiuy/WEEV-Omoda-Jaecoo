import { useState } from 'react';
import { useNavigate } from 'react-router';
import { Car, Check, Smartphone, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/supabaseClient';

const BRAND_ID = '00000000-0000-0000-0000-000000000001'; // Omoda Jaecoo

export default function ActivatePage() {
  const navigate = useNavigate();
  const [method, setMethod] = useState<'vin' | 'plate' | 'qr' | 'manual' | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    vin: '',
    licensePlate: '',
    model: '',
    year: new Date().getFullYear(),
  });

  const handleActivate = async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;
      const response = await fetch('/api/activations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          brandId: BRAND_ID,
          vin: formData.vin || undefined,
          licensePlate: formData.licensePlate || undefined,
          model: formData.model || undefined,
          year: formData.year || undefined,
          verificationMethod: method,
        }),
      });

      if (response.ok) {
        navigate('/wallet');
      } else {
        const error = await response.json();
        alert(error.error || 'Activation failed');
      }
    } catch (error) {
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!method) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-4xl mx-auto pt-16">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Activate Your Vehicle</h1>
            <p className="text-xl text-white/70">Choose how you'd like to verify your vehicle</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <button
              onClick={() => setMethod('vin')}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all text-left group"
            >
              <div className="w-16 h-16 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Car className="w-8 h-8 text-purple-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">VIN Number</h3>
              <p className="text-white/70">Enter your vehicle's VIN for instant verification</p>
            </button>

            <button
              onClick={() => setMethod('plate')}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all text-left group"
            >
              <div className="w-16 h-16 bg-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <FileText className="w-8 h-8 text-pink-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">License Plate</h3>
              <p className="text-white/70">Verify using your vehicle's license plate</p>
            </button>

            <button
              onClick={() => setMethod('qr')}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all text-left group"
            >
              <div className="w-16 h-16 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Smartphone className="w-8 h-8 text-blue-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">QR Code</h3>
              <p className="text-white/70">Scan the QR code from your vehicle documentation</p>
            </button>

            <button
              onClick={() => setMethod('manual')}
              className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all text-left group"
            >
              <div className="w-16 h-16 bg-green-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Check className="w-8 h-8 text-green-300" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Manual Entry</h3>
              <p className="text-white/70">Enter your vehicle details manually</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-2xl mx-auto pt-16">
        <button
          onClick={() => setMethod(null)}
          className="text-white/70 hover:text-white mb-8 transition-colors"
        >
          ← Back
        </button>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
          <h2 className="text-3xl font-bold text-white mb-6">
            {method === 'vin' && 'Enter VIN Number'}
            {method === 'plate' && 'Enter License Plate'}
            {method === 'qr' && 'Scan QR Code'}
            {method === 'manual' && 'Vehicle Details'}
          </h2>

          <div className="space-y-6">
            {(method === 'vin' || method === 'manual') && (
              <div>
                <label className="block text-white/90 mb-2 font-medium">VIN Number</label>
                <input
                  type="text"
                  value={formData.vin}
                  onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                  placeholder="Enter 17-character VIN"
                  maxLength={17}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {(method === 'plate' || method === 'manual') && (
              <div>
                <label className="block text-white/90 mb-2 font-medium">License Plate</label>
                <input
                  type="text"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                  placeholder="Enter license plate"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            )}

            {method === 'manual' && (
              <>
                <div>
                  <label className="block text-white/90 mb-2 font-medium">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g., Omoda 5"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-white/90 mb-2 font-medium">Year</label>
                  <input
                    type="number"
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                    min="2020"
                    max={new Date().getFullYear() + 1}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </>
            )}

            {method === 'qr' && (
              <div className="text-center py-12">
                <div className="w-64 h-64 bg-white/10 rounded-xl mx-auto mb-4 flex items-center justify-center">
                  <Smartphone className="w-16 h-16 text-white/50" />
                </div>
                <p className="text-white/70">QR scanner functionality coming soon</p>
              </div>
            )}

            <button
              onClick={handleActivate}
              disabled={loading || method === 'qr'}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold px-8 py-4 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Activating...</span>
                </>
              ) : (
                <span>Activate Vehicle</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
