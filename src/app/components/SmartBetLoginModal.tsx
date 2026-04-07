import React from 'react';
import { X, User, Lock, Phone, AlertCircle, ExternalLink, CheckCircle } from 'lucide-react';

interface SmartBetLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: () => void;
  onRegister: () => void;
  message?: string;
}

export default function SmartBetLoginModal({ 
  isOpen, 
  onClose, 
  onLogin, 
  onRegister, 
  message = "Please login to your Smart Bet account to continue playing bingo" 
}: SmartBetLoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 w-full max-w-md rounded-2xl border border-amber-500/30 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600/20 to-yellow-600/20 p-6 border-b border-amber-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                <User className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Smart Bet Login Required</h2>
                <p className="text-sm text-gray-400">Connect your account to play</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Message */}
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-blue-200">{message}</p>
              </div>
            </div>
          </div>

          {/* Benefits */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-300 mb-3">Why connect to Smart Bet?</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">Use your existing balance for bingo games</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">Seamless betting across all games</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">Track all your gaming activity in one place</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-sm text-gray-300">Access exclusive bonuses and promotions</span>
              </div>
            </div>
          </div>

          {/* Account Info Preview */}
          <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                <Phone className="w-4 h-4 text-gray-900" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Your Smart Bet Account</p>
                <p className="text-sm font-semibold text-white">Phone Number + Balance</p>
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Your phone number will be used as your Player ID in bingo games
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onLogin}
              className="w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
            >
              <User className="w-4 h-4" />
              Login to Smart Bet
              <ExternalLink className="w-4 h-4" />
            </button>

            <button
              onClick={onRegister}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 border border-gray-600"
            >
              <Lock className="w-4 h-4" />
              Create New Account
              <ExternalLink className="w-4 h-4" />
            </button>
          </div>

          {/* Help Text */}
          <div className="text-center">
            <p className="text-xs text-gray-500">
              A new tab will open for Smart Bet authentication. 
              After login, return here to continue playing.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 p-4 border-t border-gray-700">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
            <span className="text-xs text-gray-400">Secure connection to Smart Bet system</span>
          </div>
        </div>
      </div>
    </div>
  );
}
