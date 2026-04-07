import React from 'react';
import { useSmartBet, useSmartBetBalance } from '../../contexts/SmartBetContext';

interface BettingGuardProps {
  children: React.ReactNode;
  amount: number;
  onAuthenticated?: () => void;
  onInsufficientBalance?: (available: number, required: number) => void;
  fallback?: React.ReactNode;
}

export default function BettingGuard({ 
  children, 
  amount, 
  onAuthenticated, 
  onInsufficientBalance,
  fallback 
}: BettingGuardProps) {
  const { isAuthenticated, redirectToLogin } = useSmartBet();
  const { canPlaceBet, getBettingLimits } = useSmartBetBalance();

  // Check if user can place bet
  const bettingLimits = getBettingLimits(amount);

  if (!isAuthenticated) {
    return fallback || (
      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
        <p className="text-red-300 text-sm mb-2">
          <span className="font-semibold">Login Required</span>
        </p>
        <p className="text-red-400 text-xs mb-3">
          Please login to your Smart Bet account to place bets
        </p>
        <button
          onClick={redirectToLogin}
          className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
        >
          Login to Smart Bet
        </button>
      </div>
    );
  }

  if (!bettingLimits.canBet) {
    return fallback || (
      <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 text-center">
        <p className="text-orange-300 text-sm mb-2">
          <span className="font-semibold">Insufficient Balance</span>
        </p>
        <p className="text-orange-400 text-xs">
          {bettingLimits.reason}
        </p>
        <div className="mt-3 text-xs text-gray-400">
          <p>Available: ${bettingLimits.availableBalance.toFixed(2)}</p>
          <p>Required: ${bettingLimits.requiredBalance.toFixed(2)}</p>
        </div>
      </div>
    );
  }

  // User can place bet, render children
  return <>{children}</>;
}

// Hook for easier usage in components
export const useBettingGuard = () => {
  const { isAuthenticated } = useSmartBet();
  const { canPlaceBet, getBettingLimits } = useSmartBetBalance();

  const checkBettingPermission = (amount: number) => {
    if (!isAuthenticated) {
      return {
        canBet: false,
        reason: 'Please login to your Smart Bet account',
        requiresLogin: true
      };
    }

    const limits = getBettingLimits(amount);
    return {
      canBet: limits.canBet,
      reason: limits.reason,
      requiresLogin: false,
      availableBalance: limits.availableBalance,
      requiredBalance: limits.requiredBalance
    };
  };

  return {
    checkBettingPermission,
    canPlaceBet,
    getBettingLimits
  };
};
