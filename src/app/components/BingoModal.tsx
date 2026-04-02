import { useState } from 'react';

interface BingoModalProps {
  show: boolean;
  currentCall: number | null;
  calledNumbers: number[];
  onClose: () => void;
}

export default function BingoModal({ show, currentCall, calledNumbers, onClose }: BingoModalProps) {
  const [bingoStatus, setBingoStatus] = useState<'checking' | 'good'>('checking');

  if (!show) return null;

  // Start the bingo verification process
  setTimeout(() => {
    setBingoStatus('good');
    setTimeout(() => {
      onClose();
    }, 2000);
  }, 3000);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 lg:p-8 max-w-sm lg:max-w-md w-full shadow-2xl border-2 border-green-500/50 relative">
        {/* Last Call Number - Top Right Corner */}
        {currentCall && (
          <div className="absolute top-4 right-4 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-lg p-2 shadow-xl border-2 border-amber-400/50">
            <div className="text-white text-xs sm:text-sm font-semibold">Last Call</div>
            <div className="text-white text-lg sm:text-xl font-bold">{currentCall}</div>
          </div>
        )}
        
        {/* Player ID and Amount - Side by Side */}
        <div className="text-center mb-4">
          <div className="text-gray-400 text-sm">Player: P7410</div>
          <div className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-2">$192</div>
        </div>
        
        {/* Status Message */}
        <div className="text-center mb-4">
          <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-2 animate-pulse">
            {bingoStatus === 'checking' ? 'Checking BINGO...' : 'GOOD BINGO!'}
          </div>
          <div className="text-gray-400">
            {bingoStatus === 'checking' ? 'Verifying your winning pattern...' : 'Last Call:'} 
            <span className="font-bold text-red-400 ml-1">{currentCall || ''}</span>
          </div>
          <div className="text-5xl lg:text-6xl font-bold text-blue-400 mt-2">
            {bingoStatus === 'checking' ? '🔍' : '🎉'}
          </div>
        </div>
        
        {/* 5x5 Board Display in Modal */}
        <div className="flex justify-center mb-4">
          <div className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl p-3">
            {/* BINGO Header */}
            <div className="flex gap-1 sm:gap-2 mb-2">
              <div className="text-center flex-1">
                <div className="text-amber-400 font-bold text-[10px] sm:text-[12px] drop-shadow-lg">B</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-amber-400 font-bold text-[10px] sm:text-[12px] drop-shadow-lg">I</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-amber-400 font-bold text-[10px] sm:text-[12px] drop-shadow-lg">N</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-amber-400 font-bold text-[10px] sm:text-[12px] drop-shadow-lg">G</div>
              </div>
              <div className="text-center flex-1">
                <div className="text-amber-400 font-bold text-[10px] sm:text-[12px] drop-shadow-lg">O</div>
              </div>
            </div>
            
            {/* 5x5 Grid */}
            <div className="grid gap-1 w-[200px] h-[200px]" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}>
              {Array.from({ length: 25 }).map((_, index) => {
                const col = index % 5;
                const row = Math.floor(index / 5);
                
                let cellNumber = null;
                const ranges = {
                  0: [1, 15],      // B
                  1: [16, 30],     // I
                  2: [31, 45],     // N
                  3: [46, 60],     // G
                  4: [61, 75]      // O
                };
                
                const [min] = ranges[col as keyof typeof ranges];
                cellNumber = min + row;
                
                if (col === 2 && row === 2) {
                  return (
                    <div
                      key={index}
                      className="rounded w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 text-black flex items-center justify-center font-bold text-[10px] sm:text-[12px] shadow-lg shadow-amber-500/30 border border-amber-400/50"
                    >
                      FREE
                    </div>
                  );
                }
                
                const isCalled = cellNumber && calledNumbers.includes(cellNumber);
                
                return (
                  <div
                    key={index}
                    className={`rounded w-full h-full flex items-center justify-center font-bold transition-all duration-300 ${
                      isCalled
                        ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 border-2 border-green-400/50'
                        : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200 border border-gray-500/30'
                    } text-[10px] sm:text-[12px]`}
                  >
                    {cellNumber}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Good Bingo Message */}
        {bingoStatus === 'good' && (
          <div className="text-center">
            <div className="text-green-400 text-lg sm:text-xl font-bold mb-2">
              🎉 Congratulations! Your bingo has been verified! 🎉
            </div>
            <div className="text-white text-sm sm:text-base">
              Winner! Great job!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
