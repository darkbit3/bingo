import { useState } from 'react';
import { X } from 'lucide-react';

interface HeaderProps {
  amount: number;
  room: number;
  balance: number;
  playerId: string;
  onAmountChange: (value: number) => void;
  onRoomChange: (value: number) => void;
}

export default function Header({
  amount,
  room,
  balance,
  playerId,
  onAmountChange,
  onRoomChange
}: HeaderProps) {
  const slideInAnimation = `
    @keyframes slideIn {
      from {
        opacity: 0;
        transform: translateY(-10px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
  `;

  return (
    <>
      <style>{slideInAnimation}</style>
      {/* Header - Professional Gaming Style */}
      <div className="w-full bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border-b-2 border-amber-500 px-1 sm:px-2 md:px-4 lg:px-6 shadow-xl relative overflow-visible h-10">
        {/* Subtle gaming background effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/10 to-transparent opacity-50 pointer-events-none"></div>
        
        <div className="relative z-10 flex items-center justify-between h-full py-1 flex-nowrap">
          {/* Amount & Room Group */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            {/* Amount Selector - Professional Gaming */}
            <div className="group relative flex-shrink-0 whitespace-nowrap">
              <div className="absolute inset-0 bg-amber-600/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative border border-amber-500/50 rounded-2xl px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-0.5 lg:px-3 lg:py-0.5 min-w-[35px] sm:min-w-[40px] md:min-w-[50px] lg:min-w-[60px] bg-gray-900/50 backdrop-blur-sm">
                {/* Amount Label */}
                <div className="absolute -top-1 left-0 text-amber-400 text-[7px] sm:text-[8px] px-0.5 py-0 z-10 font-semibold">
                  $
                </div>
                <select
                  value={amount}
                  onChange={(e) => onAmountChange(Number(e.target.value))}
                  className="bg-transparent text-amber-400 text-[8px] sm:text-xs md:text-sm lg:text-base font-bold focus:outline-none cursor-pointer appearance-none w-full text-center mt-1"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23f59e0b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {[10, 20, 30, 50, 100, 200].map((amt, index) => (
                    <option 
                      key={amt} 
                      value={amt} 
                      className="bg-gray-900 text-amber-400 font-bold text-lg py-3 px-4 hover:bg-amber-600/20 transition-all duration-300 border-b border-amber-500/30"
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                        transformOrigin: 'top center',
                        color: '#f59e0b !important',
                        backgroundColor: '#111827 !important'
                      }}
                    >
                      {amt} Birr
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-amber-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Room Selector - Professional Gaming */}
            <div className="group relative flex-shrink-0 whitespace-nowrap">
              <div className="absolute inset-0 bg-blue-600/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative border border-blue-500/50 rounded-2xl px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-0.5 lg:px-3 lg:py-0.5 min-w-[30px] sm:min-w-[35px] md:min-w-[45px] lg:min-w-[55px] bg-gray-900/50 backdrop-blur-sm">
                {/* Room Label */}
                <div className="absolute -top-1 left-0 text-blue-400 text-[7px] sm:text-[8px] px-0.5 py-0 z-10 font-semibold">
                  R
                </div>
                <select
                  value={room}
                  onChange={(e) => onRoomChange(Number(e.target.value))}
                  className="bg-transparent text-blue-400 text-[8px] sm:text-xs md:text-sm lg:text-base font-bold focus:outline-none cursor-pointer appearance-none w-full text-center mt-1"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%233b82f6' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: 'right 0.5rem center',
                    backgroundRepeat: 'no-repeat',
                    backgroundSize: '1.5em 1.5em',
                    paddingRight: '2.5rem'
                  }}
                >
                  {[1, 2, 3, 4, 5].map((r, index) => (
                    <option 
                      key={r} 
                      value={r} 
                      className="bg-gray-900 text-blue-400 font-bold text-lg py-3 px-4 hover:bg-blue-600/20 transition-all duration-300 border-b border-blue-500/30"
                      style={{
                        animation: `slideIn 0.3s ease-out ${index * 0.05}s both`,
                        transformOrigin: 'top center',
                        color: '#3b82f6 !important',
                        backgroundColor: '#111827 !important'
                      }}
                    >
                      ROOM {r}
                    </option>
                  ))}
                </select>
                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 lg:w-5 lg:h-5 text-blue-400 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Balance & Player ID Group - Right Side */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4 flex-shrink-0">
            {/* Balance Display - Professional Gaming */}
            <div className="group relative flex-shrink-0 whitespace-nowrap">
              <div className="absolute inset-0 bg-green-600/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative border border-green-500/50 rounded-2xl px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-0.5 lg:px-3 lg:py-0.5 min-w-[35px] sm:min-w-[40px] md:min-w-[50px] lg:min-w-[60px] bg-gray-900/50 backdrop-blur-sm">
                {/* Balance Label */}
                <div className="absolute -top-1 left-0 text-green-400 text-[7px] sm:text-[8px] px-0.5 py-0 z-10 font-semibold">
                  $
                </div>
                <div className="flex items-center justify-center gap-0.5 mt-1">
                  <span className="text-green-400 text-[8px] sm:text-xs md:text-sm lg:text-base font-bold">{balance}</span>
                </div>
              </div>
            </div>

            {/* Player ID Display - Professional Gaming */}
            <div className="group relative flex-shrink-0 whitespace-nowrap">
              <div className="absolute inset-0 bg-purple-600/20 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
              <div className="relative border border-purple-500/50 rounded-2xl px-1 py-0.5 sm:px-1.5 sm:py-0.5 md:px-2 md:py-0.5 lg:px-3 lg:py-0.5 min-w-[30px] sm:min-w-[35px] md:min-w-[45px] lg:min-w-[55px] bg-gray-900/50 backdrop-blur-sm">
                {/* Player Label */}
                <div className="absolute -top-1 left-0 text-purple-400 text-[7px] sm:text-[8px] px-0.5 py-0 z-10 font-semibold">
                  ID
                </div>
                <div className="text-purple-400 text-[8px] sm:text-xs md:text-sm lg:text-base font-bold text-center mt-1 truncate">
                  {playerId.substring(0, 4)}
                </div>
              </div>
            </div>

            {/* X Icon with Gap */}
            <button className="text-red-400 hover:text-red-300 transition-colors duration-200 flex-shrink-0 p-0.5">
              <X className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 lg:w-5 lg:h-5 font-bold" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
