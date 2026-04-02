interface MiniHeaderProps {
  players: number;
  payout: number;
  gameId: string;
  countdown: number;
  shouldBlink?: boolean;
  gamePhase?: 'selection' | 'playing' | 'winner';
}

export default function MiniHeader({
  players,
  payout,
  gameId,
  countdown,
  shouldBlink = false,
  gamePhase = 'selection'
}: MiniHeaderProps) {
  return (
    <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 px-1 sm:px-2 md:px-4 lg:px-6 shadow-lg h-10">
      <div className="flex items-center justify-between h-full py-1 flex-nowrap whitespace-nowrap">
        {gamePhase === 'selection' ? (
          <>
            {/* Left Side - Players and Payout */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
              <div className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-gray-400">Players:</span>
                <span className="font-bold text-amber-400">{players}</span>
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-gray-400">Payout:</span>
                <span className="font-bold text-green-400">{payout.toFixed(0)}B</span>
              </div>
            </div>
            
            {/* Right Side - Game ID and Countdown */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
              <div className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-gray-400">Game ID:</span>
                <span className="font-bold text-blue-400">{gameId}</span>
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-gray-400">Time:</span>
                <span className={`font-bold text-red-400 ${shouldBlink ? 'animate-pulse' : ''}`}>{countdown}s</span>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Left Side - Call and Players */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
              <div className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-gray-400">Call:</span>
                <span className="font-bold text-purple-400">Active</span>
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-gray-400">Players:</span>
                <span className="font-bold text-amber-400">{players}</span>
              </div>
            </div>
            
            {/* Right Side - Game ID and Payout */}
            <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
              <div className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-gray-400">Game ID:</span>
                <span className="font-bold text-blue-400">{gameId}</span>
              </div>
              <div className="text-xs sm:text-sm md:text-base lg:text-lg flex items-center gap-1 sm:gap-2 flex-shrink-0">
                <span className="text-gray-400">Payout:</span>
                <span className="font-bold text-green-400">{payout.toFixed(0)}B</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
