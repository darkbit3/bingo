import { Moon, Sun, Volume2, VolumeX, RefreshCw, History } from 'lucide-react';

interface FooterProps {
  soundOn: boolean;
  onSoundToggle: () => void;
  onReset: () => void;
  onHistoryToggle: () => void;
  isLoading?: boolean;
}

export default function Footer({
  soundOn,
  onSoundToggle,
  onReset,
  onHistoryToggle,
  isLoading = false
}: FooterProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-gray-800 to-gray-900 border-t border-gray-700 px-2 py-1.5 sm:px-4 sm:py-2 md:px-6 md:py-2 lg:px-8 lg:py-3 shadow-lg flex justify-between items-center z-20 h-auto min-h-[40px] sm:min-h-[48px] xl:min-h-[10px]">
      <button
        onClick={onHistoryToggle}
        className="p-2 sm:p-2.5 md:p-3 lg:p-3 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground hover:scale-110 transition-transform shadow-lg active:scale-95 flex-shrink-0 min-w-[40px] min-h-[40px] sm:min-w-[48px] sm:min-h-[48px] xl:min-h-[8px] flex items-center justify-center"
      >
        <History className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-4 xl:h-4" />
      </button>
      <button
        onClick={() => {
          // Save current game state before reload
          const currentGamePhase = localStorage.getItem('gamePhase') || 'selection';
          const currentCalledNumbers = JSON.parse(localStorage.getItem('calledNumbers') || '[]');
          const currentCall = localStorage.getItem('currentCall');
          const currentPlayerBoards = JSON.parse(localStorage.getItem('playerBoards') || '[]');
          
          // Reload without triggering initial loading
          window.location.reload();
        }}
        className="p-2 sm:p-2.5 md:p-3 lg:p-3 rounded-lg bg-gradient-to-br from-primary to-secondary text-primary-foreground hover:scale-110 transition-transform shadow-lg active:scale-95 flex-shrink-0 min-w-[40px] min-h-[40px] sm:min-w-[48px] sm:min-h-[48px] xl:min-h-[8px] flex items-center justify-center"
      >
        <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-4 xl:h-4 ${isLoading ? 'animate-spin' : ''}`} />
      </button>
      <button
        onClick={onSoundToggle}
        className="p-2 sm:p-2.5 md:p-3 lg:p-3 rounded-lg bg-gradient-to-br from-muted to-gray-600 hover:scale-110 transition-transform shadow-lg active:scale-95 flex-shrink-0 min-w-[40px] min-h-[40px] sm:min-w-[48px] sm:min-h-[48px] xl:min-h-[8px] flex items-center justify-center"
      >
        {soundOn ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-4 xl:h-4" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 lg:w-6 lg:h-6 xl:w-4 xl:h-4" />}
      </button>
    </div>
  );
}
