import { useEffect, useState } from 'react';
import BingoModal from './BingoModal';

interface PlayingPageProps {
  gamePhase: 'selection' | 'playing' | 'winner';
  calledNumbers: number[];
  currentCall: number | null;
  playerBoards: number[][][];
  onBingo: (boardIndex: number) => void;
}

export default function PlayingPage({
  gamePhase,
  calledNumbers,
  currentCall,
  playerBoards,
  onBingo
}: PlayingPageProps) {
  const [showWaitingCircles, setShowWaitingCircles] = useState(false);
  const [boardDisplayMode, setBoardDisplayMode] = useState<'1' | '2'>('1');
  const [showBingoModal, setShowBingoModal] = useState(false);

  const handleBingo = (boardIndex: number) => {
    setShowBingoModal(true);
    setTimeout(() => {
      onBingo(boardIndex);
    }, 5000);
  };

  useEffect(() => {
    if (gamePhase !== 'playing' || currentCall !== null) {
      setShowWaitingCircles(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      setShowWaitingCircles(true);
    }, 5000);

    return () => clearTimeout(timeoutId);
  }, [gamePhase, currentCall]);
  
  if (gamePhase !== 'playing') return null;

  const mirroredPlayerBoards = playerBoards.length > 0 ? [playerBoards[0], playerBoards[0]] : [];

  return (
    <div className="flex-1 pb-0 overflow-hidden flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-b border-gray-700 px-4 py-2 sm:px-6 sm:py-3 md:px-8 md:py-4 lg:px-12 lg:py-6 xl:pl-5 xl:pr-5 xl:py-8 shadow-2xl gap-3 sm:gap-4">
      {/* Main Content Area */}
      <div className="flex flex-col xl:flex-row gap-0 sm:gap-6 lg:gap-8 flex-1">
        {/* Enhanced BINGO Tracking Display */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 shadow-2xl border border-amber-500/30 flex-shrink-0 xl:w-[576px] xl:h-auto xl:max-h-96 overflow-y-auto">
          <div className="space-y-1 sm:space-y-2 lg:space-y-3">
            {['B', 'I', 'N', 'G', 'O'].map((letter, index) => {
              const ranges = {
                'B': [1, 15],
                'I': [16, 30],
                'N': [31, 45],
                'G': [46, 60],
                'O': [61, 75]
              };
              const [min, max] = ranges[letter as keyof typeof ranges];
              const columnNumbers = Array.from({ length: max - min + 1 }, (_, i) => min + i);
              const calledInColumn = columnNumbers.filter(num => calledNumbers.includes(num));

              return (
                <div key={letter} className="flex items-center gap-0 sm:gap-0 lg:gap-0 flex-shrink-0">
                  <div className="w-4 sm:w-6 md:w-8 lg:w-10 xl:w-12 text-center flex-shrink-0">
                    <span className="text-amber-400 font-bold text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl drop-shadow-lg">{letter}</span>
                  </div>
                  <div className="flex-1 bg-gradient-to-r from-gray-700 to-gray-800 rounded-lg h-6 sm:h-8 md:h-10 lg:h-12 xl:h-14 flex items-center justify-center px-1 min-w-0 border border-gray-600/50">
                    <div className="grid w-full gap-0.5 lg:gap-1 xl:gap-1.5" style={{ gridTemplateColumns: 'repeat(15, minmax(0, 1fr))' }}>
                      {columnNumbers.map((num) => (
                        <div
                          key={num}
                          className={`aspect-square rounded-full flex items-center justify-center font-bold transition-all duration-300 hover:scale-110 ${
                            calledInColumn.includes(num)
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 border-2 border-green-400/50'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-300 hover:from-gray-500 hover:to-gray-600 border border-gray-500/30'
                          } text-xs sm:text-xs md:text-sm lg:text-sm xl:text-base`}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waiting Circles - Between BINGO and Board on Small Screens Only */}
        <div className="xl:hidden">
          <div className="text-center flex-shrink-0">
            <div className="w-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-1 sm:p-2 md:p-3 lg:p-6 xl:p-8 shadow-2xl border border-gray-600/50 h-[30px] xl:h-[20px] flex items-center justify-center">
              {showWaitingCircles ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl animate-pulse" />
                  <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg" />
                  <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg" />
                </div>
              ) : (
                <div className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl text-white font-medium">
                  Waiting for next number...
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Enhanced Single Board Display Mode - Side by side on big screens */}
        {boardDisplayMode === '1' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 shadow-2xl border border-amber-500/30 flex-shrink-0 xl:flex-1 xl:w-auto xl:h-auto">
            <div className="flex flex-col items-center gap-4">
              {/* BINGO Column Headers - Now on Top */}
              <div className="flex gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                <div className="text-center">
                  <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">B</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">I</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">N</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">G</div>
                </div>
                <div className="text-center">
                  <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">O</div>
                </div>
              </div>

              {/* Enhanced 5x5 Card Numbers and BINGO button side by side */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
                <div className="grid gap-0.5 sm:gap-1 lg:gap-1.5 xl:gap-2 w-[280px] h-[280px] sm:w-[200px] sm:h-[200px] xl:w-[320px] xl:h-[320px]" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}>
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
                          className="rounded-xl w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 text-black flex items-center justify-center font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] shadow-lg shadow-amber-500/30 border-2 border-amber-400/50"
                        >
                          FREE
                        </div>
                      );
                    }
                    
                    const isCalled = cellNumber && calledNumbers.includes(cellNumber);
                    
                    return (
                      <div
                        key={index}
                        className={`rounded-xl w-full h-full flex items-center justify-center font-bold transition-all duration-300 hover:scale-105 ${
                          isCalled
                            ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 border-2 border-green-400/50'
                            : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200 hover:from-gray-500 hover:to-gray-600 border border-gray-500/30'
                        } text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px]`}
                      >
                        {cellNumber}
                      </div>
                    );
                  })}
                </div>
                
                <button
                  className="w-[80px] h-[20px] xl:h-[40px] bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transform hover:scale-105 active:scale-95 border border-red-400/30 flex-shrink-0"
                  onClick={() => onBingo(0)}
                >
                  BINGO!
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Two Board Display Mode - Side by side */}
        {boardDisplayMode === '2' && (
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 shadow-2xl border border-amber-500/30 flex-shrink-0 xl:flex-1 xl:w-auto xl:h-auto xl:max-w-[800px]">
            <div className="flex flex-col xl:flex-row items-center justify-center gap-4 xl:gap-8">
              {/* First Board */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 shadow-2xl border border-amber-500/30">
                <div className="flex flex-col items-center gap-4">
                  {/* BINGO Column Headers */}
                  <div className="flex gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">B</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">I</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">N</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">G</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">O</div>
                    </div>
                  </div>

                  {/* 5x5 Card Grid and BINGO button side by side */}
                  <div className="flex flex-col sm:flex-row xl:flex-col items-center justify-center gap-4 sm:gap-6">
                    <div className="grid gap-0.5 sm:gap-1 lg:gap-1.5 xl:gap-2 w-[200px] h-[190px]" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}>
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
                              className="rounded-xl w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 text-black flex items-center justify-center font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] shadow-lg shadow-amber-500/30 border-2 border-amber-400/50"
                            >
                              FREE
                            </div>
                          );
                        }
                        
                        const isCalled = cellNumber && calledNumbers.includes(cellNumber);
                        
                        return (
                          <div
                            key={index}
                            className={`rounded-xl w-full h-full flex items-center justify-center font-bold transition-all duration-300 hover:scale-105 ${
                              isCalled
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 border-2 border-green-400/50'
                                : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200 hover:from-gray-500 hover:to-gray-600 border border-gray-500/30'
                            } text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px]`}
                          >
                            {cellNumber}
                          </div>
                        );
                      })}
                    </div>
                    
                    <button
                      className="w-[80px] h-[20px] xl:h-[40px] bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transform hover:scale-105 active:scale-95 border border-red-400/30 flex-shrink-0"
                      onClick={() => onBingo(0)}
                    >
                      BINGO!
                    </button>
                  </div>
                </div>
              </div>

              {/* Second Board */}
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 shadow-2xl border border-amber-500/30">
                <div className="flex flex-col items-center gap-4">
                  {/* BINGO Column Headers */}
                  <div className="flex gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">B</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">I</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">N</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">G</div>
                    </div>
                    <div className="text-center">
                      <div className="text-amber-400 font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] drop-shadow-lg">O</div>
                    </div>
                  </div>

                  {/* 5x5 Card Grid and BINGO button side by side */}
                  <div className="flex flex-col sm:flex-row xl:flex-col items-center justify-center gap-4 sm:gap-6">
                    <div className="grid gap-0.5 sm:gap-1 lg:gap-1.5 xl:gap-2 w-[200px] h-[190px]" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}>
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
                              key={`second-${index}`}
                              className="rounded-xl w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 text-black flex items-center justify-center font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] shadow-lg shadow-amber-500/30 border-2 border-amber-400/50"
                            >
                              FREE
                            </div>
                          );
                        }
                        
                        const isCalled = cellNumber && calledNumbers.includes(cellNumber);
                        
                        return (
                          <div
                            key={`second-${index}`}
                            className={`rounded-xl w-full h-full flex items-center justify-center font-bold transition-all duration-300 hover:scale-105 ${
                              isCalled
                                ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 border-2 border-green-400/50'
                                : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200 hover:from-gray-500 hover:to-gray-600 border border-gray-500/30'
                            } text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px]`}
                          >
                            {cellNumber}
                          </div>
                        );
                      })}
                    </div>
                    
                    <button
                      className="w-[80px] h-[20px] xl:h-[40px] bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transform hover:scale-105 active:scale-95 border border-red-400/30"
                      onClick={() => onBingo(1)}
                    >
                      BINGO!
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Current Call Display */}
      <div className="text-center flex-shrink-0">
        {currentCall ? (
          <div className="w-full bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 shadow-2xl border-2 border-amber-400/50 backdrop-blur-sm">
            <div className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl text-white mb-2 sm:mb-3 lg:mb-4 font-semibold">Current Number</div>
            <div className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl xl:text-9xl font-bold text-white drop-shadow-2xl animate-pulse">
              {currentCall}
            </div>
          </div>
        ) : (
          <div className="xl:block hidden">
            <div className="w-full bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-1 sm:p-2 md:p-3 lg:p-6 xl:p-8 shadow-2xl border border-gray-600/50 h-[30px] xl:h-[20px] flex items-center justify-center">
              {showWaitingCircles ? (
                <div className="flex items-center justify-center gap-2 sm:gap-3 lg:gap-4 xl:gap-6">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 lg:w-12 lg:h-12 xl:w-16 xl:h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 shadow-2xl animate-pulse" />
                  <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg" />
                  <div className="w-4 h-4 sm:w-6 sm:h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full bg-gradient-to-br from-gray-500 to-gray-600 shadow-lg" />
                </div>
              ) : (
                <div className="text-sm sm:text-base md:text-lg lg:text-2xl xl:text-3xl text-white font-medium">
                  Waiting for next number...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {boardDisplayMode === '2' && playerBoards.length >= 1 && (
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 xl:p-12 shadow-2xl border border-amber-500/30 flex-shrink-0 flex gap-4 sm:gap-6 lg:gap-8 justify-center">
          <div className="flex flex-wrap gap-4">
            {mirroredPlayerBoards.map((board, boardIndex) => (
              <div key={boardIndex} className="bg-gradient-to-br from-gray-700 to-gray-800 rounded-2xl p-4 sm:p-6 md:p-8 lg:p-10 border border-gray-600/50 shadow-xl flex flex-col sm:flex-row gap-2 sm:gap-4">
                <div className="text-center mb-4 sm:mb-6 lg:mb-8">
                  <span className="text-amber-400 font-bold text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl">Board {boardIndex + 1}</span>
                </div>

                <div className="flex justify-center items-center gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6 lg:mb-8">
                  {/* BINGO Column Headers */}
                  <div className="flex flex-col gap-1 sm:gap-2 lg:gap-3">
                    <div className="text-center mb-1">
                      <div className="text-amber-400 font-bold text-[12px] drop-shadow-lg">B</div>
                    </div>
                    <div className="text-center mb-1">
                      <div className="text-amber-400 font-bold text-[12px] drop-shadow-lg">I</div>
                    </div>
                    <div className="text-center mb-1">
                      <div className="text-amber-400 font-bold text-[12px] drop-shadow-lg">N</div>
                    </div>
                    <div className="text-center mb-1">
                      <div className="text-amber-400 font-bold text-[12px] drop-shadow-lg">G</div>
                    </div>
                    <div className="text-center mb-1">
                      <div className="text-amber-400 font-bold text-[12px] drop-shadow-lg">O</div>
                    </div>
                  </div>

                  {/* Enhanced 5x5 Card Grid (small 200x200 layout) */}
                  <div className="grid gap-0.5 sm:gap-1 lg:gap-1.5 xl:gap-2 w-[200px] h-[200px]" style={{ gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gridTemplateRows: 'repeat(5, minmax(0, 1fr))' }}>
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
                            className="rounded-xl w-full h-full bg-gradient-to-br from-amber-500 to-orange-500 text-black flex items-center justify-center font-bold text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px] shadow-lg shadow-amber-500/30 border border-amber-400/50"
                          >
                            FREE
                          </div>
                        );
                      }

                      const isCalled = cellNumber && calledNumbers.includes(cellNumber);

                      return (
                        <div
                          key={index}
                          className={`rounded-xl w-full h-full flex items-center justify-center font-bold transition-all duration-300 hover:scale-105 ${
                            isCalled
                              ? 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 border-2 border-green-400/50'
                              : 'bg-gradient-to-br from-gray-600 to-gray-700 text-gray-200 hover:from-gray-500 hover:to-gray-600 border border-gray-500/30'
                          } text-[8px] sm:text-[9px] md:text-[10px] lg:text-[11px] xl:text-[12px]`}
                        >
                          {cellNumber}
                        </div>
                      );
                    })}
                  </div>

                  {/* BINGO Button - On the side for mobile, below for desktop */}
                <div className="xl:hidden flex justify-center">
                  <button
                    className="w-[60px] h-[20px] bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transform hover:scale-105 active:scale-95 border border-red-400/30"
                    onClick={() => onBingo(boardIndex)}
                  >
                    BINGO!
                  </button>
                </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop BINGO buttons - hidden on mobile */}
          <div className="hidden xl:flex justify-center gap-4">
            {mirroredPlayerBoards.map((_, boardIndex) => (
              <button
                key={boardIndex}
                className="w-[80px] h-[20px] xl:h-[40px] bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:via-red-800 hover:to-red-900 text-white font-bold rounded-xl transition-all duration-300 shadow-2xl hover:shadow-3xl text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl transform hover:scale-105 active:scale-95 border border-red-400/30"
                onClick={() => onBingo(boardIndex)}
              >
                BINGO!
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Board Display Toggle Buttons - End of Page */}
      <div className="flex gap-1 sm:gap-2 flex-shrink-0">
        <button
          onClick={() => setBoardDisplayMode('1')}
          className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-md font-bold text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm transition-all duration-200 shadow hover:shadow-md hover:scale-105 flex items-center justify-center ${
            boardDisplayMode === '1'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-amber-500/30 border border-amber-400/50'
              : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-200 hover:from-gray-500 hover:to-gray-600 border border-gray-500/30'
          }`}
        >
          1
        </button>
        <button
          onClick={() => setBoardDisplayMode('2')}
          className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 lg:w-9 lg:h-9 xl:w-10 xl:h-10 rounded-md font-bold text-xs sm:text-xs md:text-xs lg:text-sm xl:text-sm transition-all duration-200 shadow hover:shadow-md hover:scale-105 flex items-center justify-center ${
            boardDisplayMode === '2'
              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-amber-500/30 border border-amber-400/50'
              : 'bg-gradient-to-r from-gray-600 to-gray-700 text-gray-200 hover:from-gray-500 hover:to-gray-600 border border-gray-500/30'
          }`}
        >
          2
        </button>
      </div>

      {/* Bingo Modal Component */}
      <BingoModal 
        show={showBingoModal}
        currentCall={currentCall}
        calledNumbers={calledNumbers}
        onClose={() => setShowBingoModal(false)}
      />
    </div>
  );
}