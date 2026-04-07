import React from 'react';

interface PopupModalProps {
  showBetPopup: boolean;
  selectedNumber: number | null;
  amount: number;
  balance: number;
  onPlaceBet: () => void;
  onCancel: () => void;
  isPlacingBet: boolean;
  betAccepted: boolean;
  isAlreadyBet: boolean;
  isDatabaseBoard: boolean;
  playerId: string;
}

const PopupModal: React.FC<PopupModalProps> = ({
  showBetPopup,
  selectedNumber,
  amount,
  balance,
  onPlaceBet,
  onCancel,
  isPlacingBet,
  betAccepted,
  isAlreadyBet,
  isDatabaseBoard,
  playerId
}) => {
  if (!showBetPopup || !selectedNumber) return null;

  const canBet = balance >= amount && !isAlreadyBet && !isDatabaseBoard;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-blue-500/30 rounded-2xl p-8 max-w-md mx-4 shadow-2xl transform transition-all duration-300 scale-100">
        <div className="text-center">
          {/* Header */}
          <div className="mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5" />
              </svg>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              {betAccepted ? 'Bet Accepted!' : 'Place Your Bet'}
            </h2>
            
            <p className="text-gray-300 text-sm">
              {betAccepted ? 'Your bet has been successfully placed' : 'Confirm your bet selection'}
            </p>
          </div>

          {/* Step 1: Display Board Number */}
          <div className="mb-6 p-4 bg-blue-500/10 rounded-xl border border-blue-500/30">
            <div className="text-center">
              <div className="text-sm text-blue-400 mb-1">Selected Board</div>
              <div className="text-3xl font-bold text-blue-400">
                #{selectedNumber}
              </div>
            </div>
          </div>

          {/* Step 1: Display Player ID */}
          <div className="mb-6 p-4 bg-purple-500/10 rounded-xl border border-purple-500/30">
            <div className="text-center">
              <div className="text-sm text-purple-400 mb-1">Player ID</div>
              <div className="text-xl font-bold text-purple-400">
                {playerId}
              </div>
            </div>
          </div>

          {/* Step 1: Display Bet Amount */}
          <div className="mb-6 p-4 bg-green-500/10 rounded-xl border border-green-500/30">
            <div className="text-center">
              <div className="text-sm text-green-400 mb-1">Bet Amount</div>
              <div className="text-2xl font-bold text-green-400">
                {amount} Coins
              </div>
            </div>
          </div>

          {/* Status Messages */}
          <div className="mb-6 text-center">
            {!canBet && !betAccepted && (
              <div className="text-red-400 text-sm">
                {isAlreadyBet && '⚠️ You already bet on this board'}
                {isDatabaseBoard && '⚠️ This board is already taken'}
                {balance < amount && '⚠️ Insufficient balance'}
              </div>
            )}
            
            {betAccepted && (
              <div className="text-green-400 text-sm animate-pulse">
                ✅ Bet successfully placed and saved to database!
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!betAccepted && (
            <div className="flex gap-3">
              <button
                onClick={onPlaceBet}
                disabled={!canBet || isPlacingBet}
                className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                  canBet && !isPlacingBet
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-blue-500/25'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isPlacingBet ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 0112 20c5.523 0 9.962-4.47 9.962-9.957V12H4c0 4.418 3.582 8 8 8s8-3.582 8-8v4h4z"></path>
                    </svg>
                    Placing Bet...
                  </span>
                ) : (
                  'Place Bet'
                )}
              </button>
              
              <button
                onClick={onCancel}
                disabled={isPlacingBet}
                className="flex-1 bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          )}

          {betAccepted && (
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-3">
                This popup will close automatically in 2 seconds
              </div>
              <div className="text-xs text-gray-500">
                Your balance has been updated and the board is now marked in the game
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PopupModal;
