import React from 'react';

interface SyncIndicatorProps {
  isSyncing: boolean;
  room: number;
  amount: number;
}

export default function SyncIndicator({ isSyncing, room, amount }: SyncIndicatorProps) {
  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-black/80 text-white px-3 py-2 rounded-lg text-sm">
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`}></div>
        <span>Room {room} - ${amount}</span>
        {isSyncing && <span className="text-green-400 text-xs">Syncing...</span>}
      </div>
    </div>
  );
}
