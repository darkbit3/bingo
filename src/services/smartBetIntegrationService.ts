/**
 * Smart Bet Integration Service
 * Handles communication between Bingo Front and Smart Bet system
 */

export interface SmartBetUser {
  id: number;
  username: string;
  phone_number: string;
  balance: number;
  withdrawable: number;
  non_withdrawable: number;
  bonus_balance: number;
  status: string;
}

export interface SmartBetAuthState {
  isAuthenticated: boolean;
  user: SmartBetUser | null;
  isLoading: boolean;
  error: string | null;
}

export interface SmartBetBalanceData {
  balance: number;
  withdrawable: number;
  non_withdrawable: number;
  bonus_balance: number;
  total: number;
  lastUpdated: string;
}

class SmartBetIntegrationService {
  private static instance: SmartBetIntegrationService;
  private listeners: Map<string, Function[]> = new Map();
  private authState: SmartBetAuthState = {
    isAuthenticated: false,
    user: null,
    isLoading: false,
    error: null
  };

  private readonly STORAGE_KEYS = {
    AUTH_STATE: 'smartbet_auth_state',
    USER_DATA: 'smartbet_user_data',
    BALANCE_DATA: 'smartbet_balance_data',
    AUTH_EVENT: 'smartbet_auth_event'
  };

  private constructor() {
    this.initializeEventListeners();
    this.loadStoredAuthState();
  }

  static getInstance(): SmartBetIntegrationService {
    if (!SmartBetIntegrationService.instance) {
      SmartBetIntegrationService.instance = new SmartBetIntegrationService();
    }
    return SmartBetIntegrationService.instance;
  }

  /**
   * Initialize cross-tab event listeners
   */
  private initializeEventListeners() {
    // Listen for storage events (cross-tab communication)
    window.addEventListener('storage', (event) => {
      if (event.key === this.STORAGE_KEYS.AUTH_EVENT) {
        this.handleAuthEvent(JSON.parse(event.newValue || '{}'));
      }
    });

    // Listen for custom events (same-tab communication)
    window.addEventListener('smartBetAuthUpdate', (event: any) => {
      this.handleAuthEvent(event.detail);
    });

    // Listen for balance updates
    window.addEventListener('smartBetBalanceUpdate', (event: any) => {
      this.handleBalanceUpdate(event.detail);
    });
  }

  /**
   * Load stored authentication state from localStorage
   */
  private loadStoredAuthState() {
    try {
      const storedAuth = localStorage.getItem(this.STORAGE_KEYS.AUTH_STATE);
      const storedUser = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);

      if (storedAuth && storedUser) {
        const authState = JSON.parse(storedAuth);
        const userData = JSON.parse(storedUser);

        this.authState = {
          ...authState,
          user: userData
        };

        this.notifyListeners('authStateChange', this.authState);
      }
    } catch (error) {
      console.warn('SmartBet Integration - Failed to load stored auth state:', error);
    }
  }

  /**
   * Handle authentication events from Smart Bet
   */
  private handleAuthEvent(eventData: any) {
    const { type, data } = eventData;

    switch (type) {
      case 'LOGIN_SUCCESS':
        this.authState = {
          isAuthenticated: true,
          user: data.user,
          isLoading: false,
          error: null
        };
        this.storeAuthState();
        this.notifyListeners('authStateChange', this.authState);
        console.log('✅ SmartBet Integration - User logged in:', data.user?.username);
        break;

      case 'LOGOUT':
        this.authState = {
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: null
        };
        this.clearStoredAuthState();
        this.notifyListeners('authStateChange', this.authState);
        console.log('✅ SmartBet Integration - User logged out');
        break;

      case 'LOGIN_START':
        this.authState.isLoading = true;
        this.authState.error = null;
        this.notifyListeners('authStateChange', this.authState);
        break;

      case 'LOGIN_FAILURE':
        this.authState = {
          isAuthenticated: false,
          user: null,
          isLoading: false,
          error: data.error || 'Login failed'
        };
        this.notifyListeners('authStateChange', this.authState);
        break;

      case 'BALANCE_UPDATE':
        if (this.authState.user && data.balance) {
          this.authState.user.balance = data.balance;
          this.authState.user.withdrawable = data.withdrawable || this.authState.user.withdrawable;
          this.authState.user.non_withdrawable = data.non_withdrawable || this.authState.user.non_withdrawable;
          this.authState.user.bonus_balance = data.bonus_balance || this.authState.user.bonus_balance;
          this.storeAuthState();
          this.notifyListeners('balanceUpdate', data);
        }
        break;
    }
  }

  /**
   * Handle balance updates
   */
  private handleBalanceUpdate(balanceData: SmartBetBalanceData) {
    if (this.authState.user) {
      this.authState.user.balance = balanceData.balance;
      this.authState.user.withdrawable = balanceData.withdrawable;
      this.authState.user.non_withdrawable = balanceData.non_withdrawable;
      this.authState.user.bonus_balance = balanceData.bonus_balance;
      this.storeAuthState();
      this.notifyListeners('balanceUpdate', balanceData);
    }
  }

  /**
   * Store authentication state in localStorage
   */
  private storeAuthState() {
    try {
      localStorage.setItem(this.STORAGE_KEYS.AUTH_STATE, JSON.stringify({
        isAuthenticated: this.authState.isAuthenticated,
        isLoading: this.authState.isLoading,
        error: this.authState.error
      }));

      if (this.authState.user) {
        localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(this.authState.user));
      }
    } catch (error) {
      console.warn('SmartBet Integration - Failed to store auth state:', error);
    }
  }

  /**
   * Clear stored authentication state
   */
  private clearStoredAuthState() {
    try {
      localStorage.removeItem(this.STORAGE_KEYS.AUTH_STATE);
      localStorage.removeItem(this.STORAGE_KEYS.USER_DATA);
      localStorage.removeItem(this.STORAGE_KEYS.BALANCE_DATA);
    } catch (error) {
      console.warn('SmartBet Integration - Failed to clear auth state:', error);
    }
  }

  /**
   * Notify all listeners of an event
   */
  private notifyListeners(event: string, data: any) {
    const listeners = this.listeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (error) {
        console.error('SmartBet Integration - Error in listener:', error);
      }
    });
  }

  /**
   * Subscribe to authentication state changes
   */
  public subscribe(event: 'authStateChange' | 'balanceUpdate', callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(event);
      if (listeners) {
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }

  /**
   * Get current authentication state
   */
  public getAuthState(): SmartBetAuthState {
    return { ...this.authState };
  }

  /**
   * Get current user data
   */
  public getCurrentUser(): SmartBetUser | null {
    return this.authState.user ? { ...this.authState.user } : null;
  }

  /**
   * Get current balance
   */
  public getCurrentBalance(): SmartBetBalanceData | null {
    if (!this.authState.user) return null;

    return {
      balance: this.authState.user.balance,
      withdrawable: this.authState.user.withdrawable,
      non_withdrawable: this.authState.user.non_withdrawable,
      bonus_balance: this.authState.user.bonus_balance,
      total: this.authState.user.balance + this.authState.user.withdrawable + this.authState.user.bonus_balance,
      lastUpdated: new Date().toISOString()
    };
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return this.authState.isAuthenticated && !!this.authState.user;
  }

  /**
   * Get player ID (phone number)
   */
  public getPlayerId(): string | null {
    return this.authState.user?.phone_number || null;
  }

  /**
   * Get display name (username or phone number)
   */
  public getDisplayName(): string {
    if (!this.authState.user) return 'Guest';
    return this.authState.user.username || this.authState.user.phone_number || 'Guest';
  }

  /**
   * Trigger login redirect to Smart Bet
   */
  public redirectToLogin(): void {
    // Store current bingo page for redirect back
    sessionStorage.setItem('bingo_return_url', window.location.href);
    
    // Open Smart Bet in new tab or redirect
    const smartBetUrl = window.location.origin.includes('localhost') 
      ? 'http://localhost:5173/login' 
      : '/smart-bet/login';
    
    window.open(smartBetUrl, '_blank');
  }

  /**
   * Trigger registration redirect to Smart Bet
   */
  public redirectToRegister(): void {
    // Store current bingo page for redirect back
    sessionStorage.setItem('bingo_return_url', window.location.href);
    
    // Open Smart Bet in new tab or redirect
    const smartBetUrl = window.location.origin.includes('localhost') 
      ? 'http://localhost:5173/register' 
      : '/smart-bet/register';
    
    window.open(smartBetUrl, '_blank');
  }

  /**
   * Check if user can place bets
   */
  public canPlaceBet(amount: number): boolean {
    if (!this.isAuthenticated()) return false;
    if (!this.authState.user) return false;
    
    const totalBalance = this.authState.user.balance + this.authState.user.withdrawable;
    return totalBalance >= amount;
  }

  /**
   * Get betting limits and warnings
   */
  public getBettingLimits(amount: number): {
    canBet: boolean;
    reason?: string;
    availableBalance: number;
    requiredBalance: number;
  } {
    if (!this.isAuthenticated()) {
      return {
        canBet: false,
        reason: 'Please login to place bets',
        availableBalance: 0,
        requiredBalance: amount
      };
    }

    const availableBalance = (this.authState.user?.balance || 0) + (this.authState.user?.withdrawable || 0);
    
    if (availableBalance < amount) {
      return {
        canBet: false,
        reason: `Insufficient balance. Available: $${availableBalance.toFixed(2)}, Required: $${amount.toFixed(2)}`,
        availableBalance,
        requiredBalance: amount
      };
    }

    return {
      canBet: true,
      availableBalance,
      requiredBalance: amount
    };
  }

  /**
   * Simulate balance update (for testing)
   */
  public simulateBalanceUpdate(newBalance: number): void {
    if (this.authState.user) {
      this.authState.user.balance = newBalance;
      this.storeAuthState();
      this.notifyListeners('balanceUpdate', this.getCurrentBalance());
    }
  }
}

// Export singleton instance
export const smartBetIntegration = SmartBetIntegrationService.getInstance();

// Export types for React components
export type { SmartBetUser, SmartBetAuthState, SmartBetBalanceData };
