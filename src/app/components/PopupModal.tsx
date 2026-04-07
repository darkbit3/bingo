import { useSmartBet, useSmartBetBalance } from '../../contexts/SmartBetContext';

interface PopupModalProps {
  showBetPopup: boolean;
  selectedNumber: number | null;
  amount: number;
  balance: number;
  onPlaceBet: () => void;
  onCancel: () => void;
  onLoginRequired?: () => void;
  isPlacingBet?: boolean;
  betAccepted?: boolean;
  isAlreadyBet?: boolean;
  isDatabaseBoard?: boolean;
  playerId?: string;
}

export default function PopupModal({
  showBetPopup,
  selectedNumber,
  amount,
  balance,
  onPlaceBet,
  onCancel,
  onLoginRequired,
  isPlacingBet = false,
  betAccepted = false,
  isAlreadyBet = false,
  isDatabaseBoard = false,
  playerId = ''
}: PopupModalProps) {
  // Smart Bet integration
  const { isAuthenticated, redirectToLogin } = useSmartBet();
  const { canPlaceBet, getBettingLimits } = useSmartBetBalance();
  
  if (!showBetPopup || !selectedNumber) return null;

  const handlePlaceBet = () => {
    if (!isAuthenticated) {
      onLoginRequired?.();
      return;
    }
    
    if (!canPlaceBet(amount)) {
      const limits = getBettingLimits(amount);
      alert(limits.reason || 'Insufficient balance');
      return;
    }
    
    onPlaceBet();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  // Check if user can place bet
  const bettingLimits = getBettingLimits(amount);
  const canUserBet = isAuthenticated && canPlaceBet(amount);
  
  // Generate 5x5 grid with X in the center
  const generateGrid = () => {
    const grid = [];
    const centerIndex = 12; // Center position in 5x5 grid (0-24)
    
    for (let i = 0; i < 25; i++) {
      if (i === centerIndex) {
        grid.push('X'); // Place X in center
      } else {
        // Generate random numbers around the selected number
        const offset = Math.floor(Math.random() * 21) - 10; // -10 to +10
        let randomNum: number = selectedNumber + offset;
        
        // Ensure the number is within reasonable range (1-400)
        if (randomNum < 1) randomNum = 400 + randomNum;
        if (randomNum > 400) randomNum = randomNum - 400;
        if (randomNum === selectedNumber) randomNum = selectedNumber + 1;
        
        grid.push(randomNum);
      }
    }
    return grid;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50" onClick={handleBackdropClick}>
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 max-w-sm sm:max-w-md w-full shadow-2xl border-2 border-amber-500/30 backdrop-blur-xl">
        
        {/* Player ID Display for Database Boards */}
        {isDatabaseBoard && playerId && (
          <div className="text-center mb-4 p-3 bg-gradient-to-r from-purple-900/50 to-blue-900/50 border border-purple-500/50 rounded-xl">
            <div className="text-xs text-purple-300 mb-1 font-medium">Board Owner</div>
            <div className="text-sm sm:text-base text-blue-300 font-bold font-mono">
              {playerId}
            </div>
          </div>
        )}

        {/* Selected Number Display */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="text-xs sm:text-sm md:text-base text-gray-400 mb-2 font-medium">
            {isPlacingBet ? 'Placing Bet...' : betAccepted ? 'Bet Accepted!' : isDatabaseBoard || isAlreadyBet ? 'Already Bet' : 'Selected Number'}
          </div>
          <div className={`text-2xl sm:text-3xl md:text-4xl font-bold transition-all duration-300 ${
            betAccepted ? 'text-green-400' : isDatabaseBoard || isAlreadyBet ? 'text-yellow-400' : 'text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500 animate-pulse'
          }`}>
            {selectedNumber}
          </div>
          {betAccepted && (
            <div className="text-green-400 text-sm mt-2 animate-bounce">✓ Successfully Placed</div>
          )}
          {isDatabaseBoard && (
            <div className="text-yellow-400 text-sm mt-2">⚠ Database Board</div>
          )}
        </div>
        
        {/* 5x5 Grid Display */}
        <div className="mb-8">
          <div className="grid grid-cols-5 gap-1 sm:gap-1.5 md:gap-2 p-3 sm:p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50">
            {generateGrid().map((num, index) => (
              <div
                key={index}
                className={`aspect-square flex items-center justify-center rounded-lg text-xs sm:text-sm md:text-base font-bold transition-all duration-300 ${
                  num === 'X'
                    ? 'bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/30 scale-110 z-10 text-lg sm:text-xl md:text-2xl'
                    : 'bg-gradient-to-br from-gray-700 to-gray-800 text-gray-300 hover:from-blue-600 hover:to-purple-600 hover:text-white hover:scale-105'
                }`}
              >
                {num}
              </div>
            ))}
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-3 sm:gap-4">
          <button
            onClick={handlePlaceBet}
            disabled={!canUserBet || isPlacingBet || betAccepted || isAlreadyBet || isDatabaseBoard}
            className="flex-1 group relative bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 sm:py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-sm sm:text-base overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-emerald-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <span className="relative z-10 flex items-center justify-center gap-2">
              {isPlacingBet ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Placing Bet...</span>
                </>
              ) : betAccepted ? (
                <>
                  <span className="text-green-200">✓</span>
                  <span>Bet Accepted</span>
                </>
              ) : isAlreadyBet || isDatabaseBoard ? (
                <>
                  <span className="text-yellow-200">!</span>
                  <span>Already Bet</span>
                </>
              ) : (
                <>
                  <span>Place Bet</span>
                  <span className="text-green-200 font-bold">{amount} Birr</span>
                  <span className="text-green-200">→</span>
                </>
              )}
            </span>
          </button>
          
          <button
            onClick={onCancel}
            className="flex-1 group relative bg-gradient-to-r from-gray-700 to-gray-800 text-gray-300 py-3 sm:py-4 rounded-2xl font-bold hover:scale-105 active:scale-95 transition-all duration-300 shadow-lg hover:shadow-gray-500/20 hover:from-red-600 hover:to-red-700 hover:text-white text-sm sm:text-base overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-gray-600 to-gray-700 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
            <span className="relative z-10">
              {isAlreadyBet || isDatabaseBoard ? 'View Board' : 'Cancel'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
