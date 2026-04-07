import React, { useState, useEffect } from 'react';

interface WinnerDisplayProps {
  showWinPopup: boolean;
  playerId: string;
  payout: number;
  currentCall: number | null;
  winCountdown: number;
  calledNumbers: number[];
  playerBoards: number[][][];
  winnerBoardIndex: number | null;
  onReturnHome?: () => void;
}

export default function WinnerDisplay({
  showWinPopup,
  playerId,
  payout,
  currentCall,
  winCountdown,
  calledNumbers,
  playerBoards,
  winnerBoardIndex,
  onReturnHome
}: WinnerDisplayProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (showWinPopup) {
      setIsChecking(true);
      setCountdown(3);
      
      // Countdown timer
      const countdownTimer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownTimer);
            if (onReturnHome) {
              onReturnHome();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => {
        clearInterval(countdownTimer);
      };
    }
  }, [showWinPopup, onReturnHome]);

  if (!showWinPopup) return null;

  // Generate default board numbers if no player board data
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

  // Always generate a display board - use player board if available, otherwise default
  let displayBoard: (number | string)[][] = [];
  
  if (winnerBoardIndex !== null && playerBoards[winnerBoardIndex] && playerBoards[winnerBoardIndex].length === 5) {
    // Convert player board from column-major to row-major
    for (let row = 0; row < 5; row++) {
      const rowData: (number | string)[] = [];
      for (let col = 0; col < 5; col++) {
        const cellValue = playerBoards[winnerBoardIndex][col][row];
        rowData.push(cellValue === -1 ? 'FREE' : cellValue);
      }
      displayBoard.push(rowData);
    }
  } else {
    // Use generated default board
    displayBoard = generateBoardNumbers();
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-card to-muted rounded-2xl p-6 lg:p-8 max-w-lg lg:max-w-xl w-full shadow-2xl border-2 border-success/50 relative">
        
        <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
          <div className="opacity-60 text-sm">Player: {playerId}</div>
          <div className="text-xl lg:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-success to-green-600">
            ${payout.toFixed(0)}
          </div>
          <div className="text-black text-sm sm:text-base font-bold">Last Call: {currentCall || '0'}</div>
        </div>

        {/* 5x5 Winning Board */}
        <div className="flex justify-center mb-4">
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
              {displayBoard.map((row, rowIndex) =>
                row.map((cellNumber, colIndex) => {
                  const index = rowIndex * 5 + colIndex;
                  const isFree = cellNumber === -1 || cellNumber === 'FREE';
                  const isCalled = !isFree && typeof cellNumber === 'number' && calledNumbers.includes(cellNumber);
                  
                  return (
                    <div
                      key={index}
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
                      {isFree ? 'FREE' : cellNumber}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div className="text-center">
          <div className="space-y-4">
            <div className="text-2xl lg:text-3xl font-bold text-yellow-400 animate-pulse">
              Checking...
            </div>
            <div className="flex justify-center space-x-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-yellow-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <div className="text-sm text-gray-400 mt-2">
              Returning to homepage in {countdown} {countdown === 1 ? 'second' : 'seconds'}...
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
