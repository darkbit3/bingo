interface WinnerDisplayProps {
  showWinPopup: boolean;
  playerId: string;
  payout: number;
  currentCall: number | null;
  winCountdown: number;
}

export default function WinnerDisplay({
  showWinPopup,
  playerId,
  payout,
  currentCall,
  winCountdown
}: WinnerDisplayProps) {
  if (!showWinPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gradient-to-br from-card to-muted rounded-2xl p-6 lg:p-8 max-w-sm lg:max-w-md w-full shadow-2xl border-2 border-success/50">
        <div className="text-center mb-4">
          <div className="opacity-60 text-sm">Player: {playerId}</div>
          <div className="text-3xl lg:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-success to-green-600 mb-2">
            ${payout.toFixed(0)}
          </div>
        </div>

        <div className="text-center mb-4">
          <div className="text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-success to-green-600 mb-2 animate-pulse">
            GOOD BINGO!
          </div>
          <div className="opacity-60">Last Call: <span className="font-bold text-destructive">{currentCall}</span></div>
          <div className="text-5xl lg:text-6xl font-bold text-primary mt-2">{winCountdown}</div>
        </div>
      </div>
    </div>
  );
}
