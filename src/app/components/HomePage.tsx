import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Header from './Header';
import MiniHeader from './MiniHeader';
import Footer from './Footer';
import PlayingPage from './PlayingPage';

interface HomePageProps {
  darkMode: boolean;
  soundOn: boolean;
  amount: number;
  room: number;
  balance: number;
  playerId: string;
  boardType: 1 | 2;
  players: number;
  payout: number;
  gameId: string;
  countdown: number;
  gamePhase: 'selection' | 'playing' | 'winner';
  showBetPopup: boolean;
  betNumbers: number[];
  boardRange: '1-100' | '101-200' | '201-300' | '301-400';
  onDarkModeToggle: () => void;
  onSoundToggle: () => void;
  onAmountChange: (value: number) => void;
  onRoomChange: (value: number) => void;
  onBoardTypeChange: (value: 1 | 2) => void;
  onReset: () => void;
  onHistoryToggle: () => void;
  onNumberSelect: (num: number) => void;
  getBoardNumbers: () => number[];
  onBoardRangeChange: (range: '1-100' | '101-200' | '201-300' | '301-400') => void;
  shouldBlink: boolean;
  calledNumbers: number[];
  currentCall: number | null;
  playerBoards: number[][][];
  onBingo: (boardIndex: number) => void;
}

export default function HomePage({
  darkMode,
  soundOn,
  amount,
  room,
  balance,
  playerId,
  boardType,
  players,
  payout,
  gameId,
  countdown,
  gamePhase,
  showBetPopup,
  betNumbers,
  boardRange,
  playerBoards,
  onBingo,
  onDarkModeToggle,
  onSoundToggle,
  onAmountChange,
  onRoomChange,
  onBoardTypeChange,
  onReset,
  onHistoryToggle,
  onNumberSelect,
  getBoardNumbers,
  onBoardRangeChange,
  shouldBlink,
  calledNumbers,
  currentCall
}: HomePageProps) {
  return (
    <div className="h-screen bg-background text-foreground flex flex-col overflow-hidden">
      <div className="w-full flex flex-col h-full">
        {/* Header Component */}
        <Header
          amount={amount}
          room={room}
          balance={balance}
          playerId={playerId}
          onAmountChange={onAmountChange}
          onRoomChange={onRoomChange}
        />

        {/* Mini Header Component */}
        <MiniHeader
          players={players}
          payout={payout}
          gameId={gameId}
          countdown={countdown}
          shouldBlink={shouldBlink}
          gamePhase={gamePhase}
        />

        {/* Main Content Area - Different content based on game phase */}
        {gamePhase === 'selection' ? (
          <div className="flex-1 pb-0 overflow-hidden flex flex-col bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-2 py-1 sm:px-4 sm:py-2 md:px-6 md:py-2 lg:px-8 lg:py-3 shadow-lg">
            {/* 10x10 Box Grid for numbers 100 at a time */}
            <div className="grid grid-cols-10 grid-rows-10 gap-1 sm:gap-1.5 md:gap-2 lg:gap-2.5 w-full flex-1 min-h-0 p-2 sm:p-3 md:p-4 lg:p-5">
              {getBoardNumbers().map((num, i) => (
                <div
                  key={i}
                  className={`relative group flex items-center justify-center font-bold transition-all duration-300 cursor-pointer overflow-hidden rounded-xl ${
                    betNumbers.includes(num)
                      ? 'bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105 hover:scale-110 hover:shadow-emerald-500/50'
                      : 'bg-gradient-to-br from-slate-700 via-gray-700 to-slate-800 text-gray-100 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 hover:text-white hover:shadow-lg hover:shadow-purple-500/30 hover:scale-105'
                  }`}
                  onClick={() => onNumberSelect(num)}
                >
                  {/* Hover effect overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Button content */}
                  <span className="relative z-10 text-xs sm:text-sm md:text-base lg:text-lg xl:text-xl font-bold tracking-tight">
                    {num}
                  </span>
                  
                  {/* Inner glow effect */}
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-transparent to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>

            {/* Navigation with Range Text and Next/Previous Buttons */}
            <div className="flex justify-center items-center py-2 sm:py-3 md:py-4 mt-2 mb-[50px] z-30 relative bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-2 border-amber-500/50 px-4 sm:px-6 md:px-8 lg:px-12 shadow-2xl rounded-2xl gap-6 sm:gap-8 md:gap-10 lg:gap-12 backdrop-blur-sm">
              {/* Previous Button */}
              <button 
                className="group relative p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-700/30 border border-amber-500/50 text-amber-400 hover:from-amber-600/30 hover:to-amber-700/40 hover:border-amber-400 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
                onClick={() => {
                  const ranges: Array<'1-100' | '101-200' | '201-300' | '301-400'> = ['1-100', '101-200', '201-300', '301-400'];
                  const currentIndex = ranges.indexOf(boardRange);
                  if (currentIndex > 0) {
                    onBoardRangeChange(ranges[currentIndex - 1]);
                  }
                }}
                disabled={boardRange === '1-100'}
              >
                <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 relative z-10" />
              </button>

              {/* Range Display */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative text-center text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-bold text-white bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 px-4 sm:px-6 md:px-8 lg:px-10 py-2 sm:py-2.5 md:py-3 lg:py-3.5 rounded-2xl shadow-xl border border-blue-500/30 backdrop-blur-sm flex-shrink-0 min-w-[80px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[140px]">
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">{boardRange.split('-')[0]}</span>
                    <span className="text-gray-300">-</span>
                    <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">{boardRange.split('-')[1]}</span>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <button 
                className="group relative p-2 sm:p-2.5 md:p-3 lg:p-4 rounded-2xl bg-gradient-to-br from-amber-600/20 to-amber-700/30 border border-amber-500/50 text-amber-400 hover:from-amber-600/30 hover:to-amber-700/40 hover:border-amber-400 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex-shrink-0"
                onClick={() => {
                  const ranges: Array<'1-100' | '101-200' | '201-300' | '301-400'> = ['1-100', '101-200', '201-300', '301-400'];
                  const currentIndex = ranges.indexOf(boardRange);
                  if (currentIndex < ranges.length - 1) {
                    onBoardRangeChange(ranges[currentIndex + 1]);
                  }
                }}
                disabled={boardRange === '301-400'}
              >
                <div className="absolute inset-0 bg-amber-500/10 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 lg:w-7 lg:h-7 relative z-10" />
              </button>
            </div>
          </div>
        ) : (
          <PlayingPage
            gamePhase={gamePhase}
            calledNumbers={calledNumbers}
            currentCall={currentCall}
            playerBoards={playerBoards}
            onBingo={onBingo}
          />
        )}
      </div>

      <Footer
        soundOn={soundOn}
        onSoundToggle={onSoundToggle}
        onReset={onReset}
        onHistoryToggle={onHistoryToggle}
      />
    </div>
  );
}
