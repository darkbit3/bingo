import React, { useState } from 'react';
import { User, Lock, Phone, Eye, EyeOff, AlertCircle, ArrowLeft, ExternalLink } from 'lucide-react';

interface SmartBetLoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
  initialMessage?: string;
}

export default function SmartBetLoginPage({ 
  onBack, 
  onLoginSuccess, 
  initialMessage = "Please login to your Smart Bet account to continue playing bingo"
}: SmartBetLoginPageProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    phone_number: '',
    password: '',
    username: '',
    referral_code: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showExternalLogin, setShowExternalLogin] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(''); // Clear error on input
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // This would connect to Smart Bet backend
      const endpoint = isLoginMode ? '/api/v1/auth/login' : '/api/v1/auth/register';
      const payload = isLoginMode 
        ? { phone_number: formData.phone_number, password: formData.password }
        : { 
            username: formData.username, 
            phone_number: formData.phone_number, 
            password: formData.password,
            referral_code: formData.referral_code 
          };

      // Simulate API call to Smart Bet
      const response = await fetch(`https://bingo-0gwl.onrender.com${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        // Trigger login success event
        const authEvent = {
          type: 'LOGIN_SUCCESS',
          data: {
            user: result.data.user
          }
        };

        localStorage.setItem('smartbet_auth_event', JSON.stringify(authEvent));
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'smartbet_auth_event',
          newValue: JSON.stringify(authEvent)
        }));

        onLoginSuccess();
      } else {
        setError(result.message || `${isLoginMode ? 'Login' : 'Registration'} failed`);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('Connection error. Please try again or use external login.');
      setShowExternalLogin(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExternalLogin = () => {
    // Store return URL for after login
    sessionStorage.setItem('bingo_return_url', window.location.href);
    
    // Open Smart Bet in new tab
    const smartBetUrl = 'https://bingo-0gwl.onrender.com/login';
    
    window.open(smartBetUrl, '_blank');
  };

  const handleExternalRegister = () => {
    sessionStorage.setItem('bingo_return_url', window.location.href);
    
    const smartBetUrl = 'https://bingo-0gwl.onrender.com/register';
    
    window.open(smartBetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full max-w-md rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 p-6 border-b border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={onBack}
              className="text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Smart Bet Account</h2>
                <p className="text-sm text-gray-400">
                  {isLoginMode ? 'Login to continue' : 'Create new account'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        <div className="p-4">
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-blue-200">{initialMessage}</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="p-6">
          {!showExternalLogin ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleInputChange}
                    placeholder="+251912345678"
                    className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Username (for registration) */}
              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      placeholder="Choose a username"
                      className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter your password"
                    className="w-full pl-10 pr-10 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Referral Code (for registration) */}
              {!isLoginMode && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Referral Code (Optional)
                  </label>
                  <input
                    type="text"
                    name="referral_code"
                    value={formData.referral_code}
                    onChange={handleInputChange}
                    placeholder="Enter referral code"
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 transition-colors"
                  />
                </div>
              )}

              {/* Error */}
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                    {isLoginMode ? 'Logging in...' : 'Creating account...'}
                  </span>
                ) : (
                  isLoginMode ? 'Login to Smart Bet' : 'Create Account'
                )}
              </button>
            </form>
          ) : (
            /* External Login Options */
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-gray-400 mb-6">
                  Use your Smart Bet account to continue. Open Smart Bet in a new tab to login or register.
                </p>
              </div>
              
              <button
                onClick={handleExternalLogin}
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <User className="w-4 h-4" />
                Login to Smart Bet
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={handleExternalRegister}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                Create New Account
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={() => setShowExternalLogin(false)}
                className="w-full text-gray-400 hover:text-white text-sm py-2"
              >
                ← Try direct login instead
              </button>
            </div>
          )}

          {/* Toggle Login/Register */}
          {!showExternalLogin && (
            <div className="mt-6 text-center">
              <p className="text-gray-400 text-sm">
                {isLoginMode ? "Don't have an account?" : "Already have an account?"}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsLoginMode(!isLoginMode);
                  setError('');
                  setFormData({
                    phone_number: '',
                    password: '',
                    username: '',
                    referral_code: ''
                  });
                }}
                className="text-amber-400 hover:text-amber-300 text-sm font-semibold mt-1"
              >
                {isLoginMode ? 'Create Account' : 'Login'}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 p-4 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-gray-400">Secure Smart Bet authentication</span>
          </div>
        </div>
      </div>
    </div>
  );
}
