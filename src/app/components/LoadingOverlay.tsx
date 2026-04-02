interface LoadingOverlayProps {
  isLoading: boolean;
}

export default function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[100]">
      <div className="text-center">
        {/* SMART BET Text Animation */}
        <div className="mb-8">
          <div className="text-4xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 animate-pulse">
            🎯 SMART BET
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-white text-xl lg:text-2xl font-bold mb-4 animate-pulse">
          Loading Game...
        </div>

        {/* Progress Bar */}
        <div className="w-64 lg:w-80 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full animate-pulse" 
               style={{
                 animation: 'loadingProgress 1.5s ease-in-out infinite'
               }}>
          </div>
        </div>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((index) => (
            <div
              key={index}
              className="w-2 h-2 lg:w-3 lg:h-3 bg-amber-400 rounded-full animate-pulse"
              style={{
                animationDelay: `${index * 0.2}s`,
                animationDuration: '1s'
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes loadingProgress {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
}
