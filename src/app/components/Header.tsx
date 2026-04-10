import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { getServerUrlWithFallback, checkBigServerAvailability } from '../../services/serverUrlService';
import { useSmartBet } from '../../contexts/SmartBetContext';
import SmartBetLoginPage from './SmartBetLoginPage';

interface PlayerData {
  playerId: string;
  balance: number;
  timestamp?: string;
  receivedAt?: string;
}

interface HeaderProps {
  amount: number;
  room: number;
  onAmountChange: (value: number) => void;
  onRoomChange: (value: number) => void;
  onClose?: () => void;
  onServerUrlChange?: (serverUrl: string, serverName: string, connected: boolean) => void;
  onBetAttempt?: (amount: number) => void;
  gamePhase?: 'selection' | 'playing' | 'winner';
}

export default function Header({
  amount,
  room,
  onAmountChange,
  onRoomChange,
  onClose,
  onServerUrlChange,
  onBetAttempt,
  gamePhase = 'selection'
}: HeaderProps) {
  // Smart Bet integration
  const { isAuthenticated, user, balance, redirectToLogin, redirectToRegister } = useSmartBet();
  
  // Original BigServer state
  const [connectionStatus, setConnectionStatus] = useState<'loading' | 'connected' | 'error'>('loading');
  const [serverInfo, setServerInfo] = useState<{
    url: string;
    name: string;
    connected: boolean;
    isFallback: boolean;
  } | null>(null);
  
  // UI State
  const [showLoginPage, setShowLoginPage] = useState(false);
  const [loginMessage, setLoginMessage] = useState('');
  const [showPlayerData, setShowPlayerData] = useState(false);

  // Get server URL from BigServer when amount or room changes
  useEffect(() => {
    const fetchServerUrl = async () => {
      try {
        setConnectionStatus('loading');
        const result = await getServerUrlWithFallback(amount, room);
        // FIX: Map the result properties to match the state type
        setServerInfo({
          url: result.serverUrl,    // Changed from serverUrl to url
          name: result.serverName,  // Changed from serverName to name
          connected: result.connected,
          isFallback: result.isFallback
        });
        
        // Notify parent component of the server URL change
        if (onServerUrlChange) {
          onServerUrlChange(result.serverUrl, result.serverName, result.connected);
        }
        
        console.log(`Server URL for ${amount}&room${room}:`, result);
        
        // Check if BigServer is available and update connection status
        const bigServerAvailable = await checkBigServerAvailability();
        setConnectionStatus(bigServerAvailable ? 'connected' : 'error');
        
      } catch (error) {
        console.error('Failed to get server URL:', error);
        setConnectionStatus('error');
        setServerInfo(null);
      }
    };

    fetchServerUrl();
  }, [amount, room, onServerUrlChange]);

  // Check for Smart Bet integration flags
  useEffect(() => {
    const fromCashier = sessionStorage.getItem('fromCashier');
    const showPlayerDataFlag = sessionStorage.getItem('showPlayerData');
    
    console.log('🎯 Bingo Front - Integration flags:', { fromCashier, showPlayerDataFlag });
    
    // Only show player data if coming from cashier with confirmation
    const shouldShowPlayerData = fromCashier === 'true' && showPlayerDataFlag === 'true';
    
    setShowPlayerData(shouldShowPlayerData);
    
    if (shouldShowPlayerData) {
      // Listen for Smart Bet authentication events
      const handleSmartBetAuth = (event: any) => {
        console.log('🎯 Bingo Front - Received Smart Bet auth event:', event.detail);
        // Handle Smart Bet authentication data
      };
      
      window.addEventListener('smartbet-auth', handleSmartBetAuth);
      
      // Check for existing Smart Bet session
      const checkSmartBetSession = () => {
        // Smart Bet session is handled by the context
        console.log('🎯 Bingo Front - Smart Bet session checked');
      };
      
      checkSmartBetSession();
      
      return () => {
        window.removeEventListener('smartbet-auth', handleSmartBetAuth);
      };
    }
  }, []);

  // BigServer data integration (simplified - only for server connectivity)
  useEffect(() => {
    // Check BigServer connection for game server functionality
    const checkConnection = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/v1/player-info/current-player');
        if (response.ok) {
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('error');
        }
      } catch (error: any) {
        console.log('BigServer not available:', error?.message || 'Unknown error');
        setConnectionStatus('error');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 5000); // Check every 5 seconds

    return () => {
      clearInterval(interval);
    };
  }, []);

  // Listen for login page requests from PopupModal
  useEffect(() => {
    const handleShowLoginPage = (event: any) => {
      setLoginMessage(event.detail?.message || 'Please login to your Smart Bet account to continue.');
      setShowLoginPage(true);
    };

    window.addEventListener('showLoginPage', handleShowLoginPage);
    return () => {
      window.removeEventListener('showLoginPage', handleShowLoginPage);
    };
  }, []);

  const slideInAnimation = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;

  const handleClose = () => {
    if (onClose) {
      onClose();
    }
  };

  // Smart Bet integration functions
  const handleLogin = () => {
    setShowLoginPage(false);
    redirectToLogin();
  };

  const handleRegister = () => {
    setShowLoginPage(false);
    redirectToRegister();
  };

  const handleBetAttempt = () => {
    if (!isAuthenticated) {
      setLoginMessage(`You need to login to your Smart Bet account to place a ${amount} Birr bet. Your Smart Bet account will be used for all gaming activities.`);
      setShowLoginPage(true);
      return;
    }
    onBetAttempt?.(amount);
  };

  // Use Smart Bet data if authenticated, otherwise show guest state (not displayed)
  // const displayBalance = isAuthenticated ? totalBalance : 0;
  // const displayPlayerId = isAuthenticated ? playerId : 'Guest';
  // const displayNameShort = isAuthenticated ? (displayName.length > 12 ? displayName.substring(0, 12) + '...' : displayName) : 'Guest';

  return (
    <>
      <style>{slideInAnimation}</style>
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-amber-500 px-1 sm:px-2 md:px-4 lg:px-6 shadow-xl relative overflow-visible h-auto min-h-[60px]">
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between h-full py-2 flex-wrap sm:flex-nowrap gap-2">
          {/* Amount & Room Group */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            {/* Amount Selector */}
            <div className="group relative flex-shrink-0">
              <div className="absolute inset-0 bg-amber-600/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative border border-amber-500/50 rounded-2xl px-2 py-1 bg-gray-900/50 backdrop-blur-sm">
                <div className="absolute -top-2 left-2 bg-gray-900 px-1 text-amber-400 text-[10px] font-semibold">
                  Amount
                </div>
                <select
                  value={amount}
                  onChange={(e) => onAmountChange(Number(e.target.value))}
                  className={`bg-transparent text-amber-400 text-sm sm:text-base font-bold focus:outline-none w-full min-w-[80px] pt-1 pb-0.5 ${
                    gamePhase === 'playing' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                  disabled={connectionStatus === 'loading' || gamePhase === 'playing'}
                >
                  {[10, 20, 30, 50, 100, 200].map((amt) => (
                    <option key={amt} value={amt} className="bg-gray-900 text-amber-400">
                      {amt} Birr
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Room Selector */}
            <div className="group relative flex-shrink-0">
              <div className="absolute inset-0 bg-blue-600/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative border border-blue-500/50 rounded-2xl px-2 py-1 bg-gray-900/50 backdrop-blur-sm">
                <div className="absolute -top-2 left-2 bg-gray-900 px-1 text-blue-400 text-[10px] font-semibold">
                  Room
                </div>
                <select
                  value={room}
                  onChange={(e) => onRoomChange(Number(e.target.value))}
                  className={`bg-transparent text-blue-400 text-sm sm:text-base font-bold focus:outline-none w-full min-w-[80px] pt-1 pb-0.5 ${
                    gamePhase === 'playing' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
                  }`}
                  disabled={connectionStatus === 'loading' || gamePhase === 'playing'}
                >
                  <option value={1} className="bg-gray-900 text-blue-400">
                    Room 1
                  </option>
                  <option value={2} className="bg-gray-900 text-blue-400">
                    Room 2
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Game Title */}
          <div className="flex-shrink-0">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
              BINGO GAME
            </h1>
          </div>

          {/* Smart Bet Player Info & Balance Group - CONDITIONAL DISPLAY */}
          {showPlayerData && (
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
              {isAuthenticated && (
                <>
                  {/* Player ID */}
                  <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1.5 rounded-lg border border-[#2A2A2A]">
                    <span className="text-xs text-gray-400">ID:</span>
                    <span className="text-sm text-white font-medium">{user?.phone_number || 'N/A'}</span>
                  </div>
                  
                  {/* Balance Display */}
                  <div className="flex items-center gap-2 bg-[#1A1A1A] px-3 py-1.5 rounded-lg border border-[#2A2A2A]">
                    <span className="text-xs text-gray-400">Balance:</span>
                    <span className="text-sm text-white font-medium">
                      ${balance?.balance?.toLocaleString() || '0'}
                    </span>
                    {balance?.bonus_balance && balance.bonus_balance > 0 && (
                      <span className="text-xs text-[#FFD700]">+${balance.bonus_balance.toLocaleString()}</span>
                    )}
                  </div>
                </>
              )}
              
              {!isAuthenticated && (
                <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1.5 rounded-lg border border-yellow-500/50">
                  <span className="text-xs text-yellow-400">Smart Bet Required</span>
                </div>
              )}
            </div>
          )}
          
          {!showPlayerData && (
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap sm:flex-nowrap">
              {/* Empty space - no player info displayed */}
            </div>
          )}

          {/* Server Info Display */}
          {serverInfo && (
            <div className={`bg-gradient-to-r backdrop-blur-sm rounded-lg px-3 py-1 border shadow-lg ${
              serverInfo.isFallback 
                ? 'from-orange-500/30 to-red-400/30 border-orange-400/50 shadow-orange-500/20'
                : 'from-green-500/30 to-emerald-400/30 border-green-400/50 shadow-green-500/20'
            }`}>
              <span className="text-[10px] opacity-90">
                {serverInfo.isFallback ? 'Server (Fallback)' : 'Server'}
              </span>
              <div className="text-sm font-bold drop-shadow-lg">
                {serverInfo.name}
                {serverInfo.connected && (
                  <span className="ml-1 text-xs">✓</span>
                )}
              </div>
            </div>
          )}

          {/* Connection Status Indicator */}
          <div className="relative">
            <div className={`w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-pulse' :
              connectionStatus === 'loading' ? 'bg-yellow-400 animate-spin' :
              'bg-red-400'
            }`} />
            <div className={`absolute inset-0 w-2 h-2 rounded-full ${
              connectionStatus === 'connected' ? 'bg-green-400 animate-ping' :
              connectionStatus === 'loading' ? 'bg-yellow-400' :
              'bg-red-400'
            } opacity-75`} />
          </div>

          {/* Close Button */}
          {onClose && (
            <button 
              onClick={handleClose}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all duration-200 flex-shrink-0 p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6 font-bold" strokeWidth={2.5} />
            </button>
          )}
        </div>
      </div>

      {/* Smart Bet Login Page */}
      {showLoginPage && (
        <SmartBetLoginPage
          onBack={() => setShowLoginPage(false)}
          onLoginSuccess={() => {
            setShowLoginPage(false);
            onBetAttempt?.(amount);
          }}
          initialMessage={loginMessage}
        />
      )}
    </>
  );
}