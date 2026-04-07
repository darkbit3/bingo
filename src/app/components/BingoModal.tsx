import { useState, useEffect } from 'react';

interface BingoModalProps {
  show: boolean;
  currentCall: number | null;
  calledNumbers: number[];
  onClose: () => void;
}

export default function BingoModal({ show, currentCall, calledNumbers, onClose }: BingoModalProps) {
  const [bingoStatus, setBingoStatus] = useState<'checking' | 'good'>('checking');

  useEffect(() => {
    if (!show) {
      return;
    }
    
    // Reset status when modal opens
    setBingoStatus('checking');
    
    // Start the bingo verification process
    const timer1 = setTimeout(() => {
      setBingoStatus('good');
    }, 3000);
    
    const timer2 = setTimeout(() => {
      if (bingoStatus === 'good') {
        onClose();
      }
    }, 5000);
    
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [show, onClose]);

  if (!show) return null;

  // Generate board numbers
  const generateBoardNumbers = () => {
    const board = [];
    for (let row = 0; row < 5; row++) {
      const rowNumbers = [];
      for (let col = 0; col < 5; col++) {
        if (row === 2 && col === 2) {
          rowNumbers.push('FREE');
        } else {
          let min, max;
          switch(col) {
            case 0: min = 1; max = 15; break;
            case 1: min = 16; max = 30; break;
            case 2: min = 31; max = 45; break;
            case 3: min = 46; max = 60; break;
            case 4: min = 61; max = 75; break;
            default: min = 1; max = 15;
          }
          const number = min + row;
          rowNumbers.push(number);
        }
      }
      board.push(rowNumbers);
    }
    return board;
  };

  const boardNumbers = generateBoardNumbers();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 max-w-md lg:max-w-lg w-full shadow-2xl border-2 border-green-500/50 relative max-h-[90vh] overflow-y-auto">
        
        {/* Last Call Number - Top Right Corner */}
        {currentCall && (
          <div className="absolute top-4 right-4 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-lg p-2 shadow-xl border-2 border-amber-400/50">
            <div className="text-white text-xs sm:text-sm font-semibold">Last Call</div>
            <div className="text-white text-lg sm:text-xl font-bold">{currentCall}</div>
          </div>
        )}
        
        {/* Player ID and Amount */}
        <div className="flex items-center justify-center gap-4 mb-6">
          <div className="text-gray-300 text-base">Player: P75958</div>
          <div className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">
            $184
          </div>
        </div>
        
        {/* 5x5 BINGO Board */}
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-4 shadow-xl">
            {/* BINGO Header */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2 mb-2">
              {['B', 'I', 'N', 'G', 'O'].map((letter, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-amber-400 font-bold text-sm sm:text-base drop-shadow-lg">{letter}</div>
                </div>
              ))}
            </div>
            
            {/* 5x5 Grid */}
            <div className="grid grid-cols-5 gap-1 sm:gap-2">
              {boardNumbers.map((row, rowIndex) => (
                row.map((cell, colIndex) => {
                  const isFree = cell === 'FREE';
                  const isCalled = !isFree && typeof cell === 'number' && calledNumbers.includes(cell);
                  
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14
                        rounded-lg flex items-center justify-center font-bold
                        transition-all duration-300 text-xs sm:text-sm
                        ${isFree 
                          ? 'bg-gradient-to-br from-amber-500 to-orange-500 text-black shadow-lg shadow-amber-500/30 border-2 border-amber-400/50'
                          : isCalled
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 border-2 border-green-400/50 scale-105'
                            : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200 border border-gray-500/30 hover:scale-105'
                        }
                      `}
                    >
                      {cell}
                    </div>
                  );
                })
              ))}
            </div>
          </div>
        </div>
        
        {/* Status Section */}
        <div className="text-center space-y-2">
          {/* Main Status Text */}
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 animate-pulse">
            {bingoStatus === 'checking' ? 'Checking BINGO...' : '🎉 GOOD BINGO! 🎉'}
          </div>
          
          {/* Status Details */}
          <div className="text-gray-300 text-sm sm:text-base">
            {bingoStatus === 'checking' ? (
              <span>Verifying your winning pattern...</span>
            ) : (
              <span>Winner! Great job!</span>
            )}
          </div>
          
          {/* Last Call Info */}
          {currentCall && bingoStatus === 'checking' && (
            <div className="text-gray-400 text-xs sm:text-sm">
              Last Call: <span className="text-red-400 font-bold">{currentCall}</span>
            </div>
          )}
          
          {/* Animation Icon */}
          <div className="text-4xl sm:text-5xl lg:text-6xl mt-2">
            {bingoStatus === 'checking' ? '🔍' : '🏆'}
          </div>
        </div>
        
        {/* Close button (optional) */}
        <button
          onClick={onClose}
          className="absolute top-2 left-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}