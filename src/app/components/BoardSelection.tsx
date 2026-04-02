interface BoardSelectionProps {
  boardRange: '1-100' | '101-200' | '201-300' | '301-400';
  betNumbers: number[];
  onNumberSelect: (num: number) => void;
  getBoardNumbers: () => number[];
}

export default function BoardSelection({
  boardRange,
  betNumbers,
  onNumberSelect,
  getBoardNumbers
}: BoardSelectionProps) {
  return (
    <div className="bg-gradient-to-t from-card to-muted p-1 sm:p-2 lg:p-3 shadow-xl">
      <div className="w-full">
        <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 lg:grid-cols-16 xl:grid-cols-20 gap-0.5 sm:gap-1 lg:gap-2 max-h-20 sm:max-h-24 md:max-h-28 lg:max-h-32 xl:max-h-36 overflow-auto">
          {getBoardNumbers().map(num => (
            <button
              key={num}
              onClick={() => onNumberSelect(num)}
              className={`aspect-square rounded-md sm:rounded-lg flex items-center justify-center text-xs sm:text-xs md:text-sm lg:text-sm font-bold transition-all hover:scale-110 shadow-md ${
                betNumbers.includes(num)
                  ? 'bg-gradient-to-br from-success to-green-700 text-success-foreground shadow-xl ring-2 ring-green-300 scale-105'
                  : 'bg-gradient-to-br from-primary to-secondary text-primary-foreground hover:opacity-90'
              }`}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
