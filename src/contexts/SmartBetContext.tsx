import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  smartBetIntegration, 
  SmartBetAuthState, 
  SmartBetBalanceData, 
  SmartBetUser 
} from '../services/smartBetIntegrationService';

interface SmartBetContextType {
  authState: SmartBetAuthState;
  user: SmartBetUser | null;
  balance: SmartBetBalanceData | null;
  isAuthenticated: boolean;
  playerId: string | null;
  displayName: string;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  redirectToLogin: () => void;
  redirectToRegister: () => void;
  canPlaceBet: (amount: number) => boolean;
  getBettingLimits: (amount: number) => {
    canBet: boolean;
    reason?: string;
    availableBalance: number;
    requiredBalance: number;
  };
  refreshBalance: () => void;
}

const SmartBetContext = createContext<SmartBetContextType | undefined>(undefined);

interface SmartBetProviderProps {
  children: ReactNode;
}

export function SmartBetProvider({ children }: SmartBetProviderProps) {
  const [authState, setAuthState] = useState<SmartBetAuthState>(smartBetIntegration.getAuthState());
  const [balance, setBalance] = useState<SmartBetBalanceData | null>(smartBetIntegration.getCurrentBalance());

  // Initialize state from integration service
  useEffect(() => {
    setAuthState(smartBetIntegration.getAuthState());
    setBalance(smartBetIntegration.getCurrentBalance());
  }, []);

  // Subscribe to auth state changes
  useEffect(() => {
    const unsubscribeAuth = smartBetIntegration.subscribe('authStateChange', (newAuthState: SmartBetAuthState) => {
      setAuthState(newAuthState);
      console.log('🎯 SmartBet Context - Auth state updated:', {
        isAuthenticated: newAuthState.isAuthenticated,
        user: newAuthState.user?.username,
        phone: newAuthState.user?.phone_number
      });
    });

    const unsubscribeBalance = smartBetIntegration.subscribe('balanceUpdate', (newBalance: SmartBetBalanceData) => {
      setBalance(newBalance);
      console.log('💰 SmartBet Context - Balance updated:', newBalance);
    });

    return () => {
      unsubscribeAuth();
      unsubscribeBalance();
    };
  }, []);

  // Check for return from Smart Bet login
  useEffect(() => {
    const returnUrl = sessionStorage.getItem('bingo_return_url');
    if (returnUrl && window.location.href === returnUrl) {
      sessionStorage.removeItem('bingo_return_url');
      console.log('🔄 SmartBet Context - Returned from login, refreshing auth state');
      
      // Refresh auth state after returning from login
      setTimeout(() => {
        setAuthState(smartBetIntegration.getAuthState());
        setBalance(smartBetIntegration.getCurrentBalance());
      }, 1000);
    }
  }, []);

  const redirectToLogin = () => {
    smartBetIntegration.redirectToLogin();
  };

  const redirectToRegister = () => {
    smartBetIntegration.redirectToRegister();
  };

  const canPlaceBet = (amount: number): boolean => {
    return smartBetIntegration.canPlaceBet(amount);
  };

  const getBettingLimits = (amount: number) => {
    return smartBetIntegration.getBettingLimits(amount);
  };

  const refreshBalance = () => {
    const currentBalance = smartBetIntegration.getCurrentBalance();
    if (currentBalance) {
      setBalance(currentBalance);
    }
  };

  const value: SmartBetContextType = {
    authState,
    user: authState.user,
    balance,
    isAuthenticated: authState.isAuthenticated,
    playerId: authState.user?.phone_number || null,
    displayName: authState.user?.username || authState.user?.phone_number || 'Guest',
    isLoading: authState.isLoading,
    error: authState.error,
    
    // Actions
    redirectToLogin,
    redirectToRegister,
    canPlaceBet,
    getBettingLimits,
    refreshBalance,
  };

  return (
    <SmartBetContext.Provider value={value}>
      {children}
    </SmartBetContext.Provider>
  );
}

export const useSmartBet = (): SmartBetContextType => {
  const context = useContext(SmartBetContext);
  if (context === undefined) {
    throw new Error('useSmartBet must be used within a SmartBetProvider');
  }
  return context;
};

// Hook for easier access to common values
export const useSmartBetAuth = () => {
  const { isAuthenticated, user, playerId, displayName, isLoading, error } = useSmartBet();
  return {
    isAuthenticated,
    user,
    playerId,
    displayName,
    isLoading,
    error
  };
};

// Hook for balance operations
export const useSmartBetBalance = () => {
  const { balance, canPlaceBet, getBettingLimits, refreshBalance } = useSmartBet();
  return {
    balance,
    canPlaceBet,
    getBettingLimits,
    refreshBalance,
    totalBalance: balance?.total || 0,
    withdrawable: balance?.withdrawable || 0,
    mainBalance: balance?.balance || 0,
    bonusBalance: balance?.bonus_balance || 0
  };
};
