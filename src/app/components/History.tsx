import { useState, useEffect } from 'react';
import { X, Clock, Trophy, Users, DollarSign, Gamepad2, User, Calendar, TrendingUp, TrendingDown, Loader2, Filter } from 'lucide-react';
import { bigServerApi, GameHistoryItem, PlayerStatus, initializeApiEndpoints } from '../../services/historyApi';
import ServerStatus from './ServerStatus';

interface HistoryItem {
  id: string;
  gameId: string;
  timestamp: string;
  amount: number;
  boardNumber: number;
  result: 'won' | 'lost' | 'pending';
  winnings?: number;
  callNumber?: number;
}

interface PlayerStats {
  totalGames: number;
  totalBets: number;
  totalWinnings: number;
  winRate: number;
  biggestWin: number;
  biggestLoss: number;
}

interface HistoryProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
}

export default function History({ isOpen, onClose, history }: HistoryProps) {
  const [activeTab, setActiveTab] = useState<'game' | 'player'>('game');
  const [gameHistoryData, setGameHistoryData] = useState<GameHistoryItem[]>([]);
  const [playerStatusData, setPlayerStatusData] = useState<PlayerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Filter states - Now independent (can select both)
  const [selectedAmount, setSelectedAmount] = useState<number>(10);
  const [selectedRoom, setSelectedRoom] = useState<string>('room1');
  const [availableRooms, setAvailableRooms] = useState<string[]>(['room1', 'room2']);

  // Amount options
  const amountOptions = [10, 20, 30, 50, 100, 200];

  // Handle click outside to close
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Fetch real data when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchRealData();
    }
  }, [isOpen]); // Only fetch on modal open

  // Auto-refetch when filters change
  useEffect(() => {
    if (isOpen) {
      fetchRealData();
    }
  }, [selectedAmount, selectedRoom]); // Refetch when filters change

  const fetchRealData = async () => {
    setIsLoading(true);
    setError(null);
    
    console.log('🔄 Fetching game history with filters:', {
      amount: selectedAmount,
      room: selectedRoom
    });
    
    try {
      // First, discover and initialize API endpoints
      await initializeApiEndpoints();
      
      // For demo, use a fixed player ID. In real app, this would come from auth/context
      const playerId = 'P12345';
      
      // Fetch available rooms
      const roomsResponse = await bigServerApi.getAvailableRooms();
      if (roomsResponse.success) {
        setAvailableRooms(roomsResponse.rooms);
      }
      
      // Fetch player status
      const statusResponse = await bigServerApi.getPlayerStatus(playerId);
      if (statusResponse.success) {
        setPlayerStatusData(statusResponse.data);
      }
      
      // Fetch game history with both amount and room filters
      const historyResponse = await bigServerApi.getGameHistory(playerId, {
        amount: selectedAmount,
        room: selectedRoom
      });
      
      console.log('📊 Game history response:', historyResponse);
      
      if (historyResponse.success) {
        setGameHistoryData(historyResponse.data);
      }
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data. Using demo data.');
    } finally {
      setIsLoading(false);
    }
  };

  // Use real data from API (no client-side filtering needed)
  const displayHistory = gameHistoryData.length > 0 ? gameHistoryData : history;
  
  // Calculate player stats from history data (fallback)
  const calculatePlayerStats = (): PlayerStatus => {
    const completedGames = displayHistory.filter(h => h.result !== 'pending');
    const wonGames = displayHistory.filter(h => h.result === 'won');
    const totalBets = displayHistory.reduce((sum, h) => sum + h.amount, 0);
    const totalWinnings = displayHistory.reduce((sum, h) => sum + (h.winnings || 0), 0);
    const biggestWin = Math.max(...wonGames.map(h => h.winnings || 0), 0);
    const biggestLoss = Math.max(...displayHistory.filter(h => h.result === 'lost').map(h => h.amount), 0);

    return {
      playerId: 'P12345',
      totalGames: displayHistory.length,
      totalBets,
      totalWinnings,
      winRate: completedGames.length > 0 ? (wonGames.length / completedGames.length) * 100 : 0,
      biggestWin,
      biggestLoss,
      currentBalance: 2000,
      lastUpdated: new Date().toISOString()
    };
  };

  const displayPlayerStats = playerStatusData || calculatePlayerStats();

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-md flex items-center justify-center z-50 p-2 sm:p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-4 sm:p-6 border-b border-gray-700 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                <h2 className="text-xl sm:text-2xl font-bold text-white">Game History</h2>
              </div>
              <ServerStatus showDetails={false} />
            </div>
          </div>
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 backdrop-blur-sm"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
          </button>
        </div>

        {/* Compact Filters - Top Placement */}
        <div className="bg-gray-800/50 border-b border-gray-700 p-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Amount Filter - Compact */}
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-400" />
              <select
                value={selectedAmount}
                onChange={(e) => setSelectedAmount(Number(e.target.value))}
                className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm border border-gray-600 focus:border-green-500 focus:ring-1 focus:ring-green-500/20 cursor-pointer"
              >
                {amountOptions.map((amount) => (
                  <option key={amount} value={amount}>
                    ${amount}
                  </option>
                ))}
              </select>
            </div>

            {/* Room Filter - Compact */}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-400" />
              <select
                value={selectedRoom}
                onChange={(e) => setSelectedRoom(e.target.value)}
                className="bg-gray-700 text-white px-3 py-1 rounded-md text-sm border border-gray-600 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 cursor-pointer"
              >
                {availableRooms.map((room) => (
                  <option key={room} value={room}>
                    {room.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Active Filters Display */}
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-xs text-gray-400">Filters:</span>
              <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-full text-xs">
                ${selectedAmount}
              </span>
              <span className="px-2 py-1 bg-purple-500/20 text-purple-400 rounded-full text-xs">
                {selectedRoom.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800/50 border-b border-gray-700">
          <div className="flex">
            <button
              onClick={() => setActiveTab('game')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'game'
                  ? 'bg-blue-600 text-white border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
              <span className="hidden sm:inline">Game History</span>
              <span className="sm:hidden">Games</span>
            </button>
            <button
              onClick={() => setActiveTab('player')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-all duration-200 ${
                activeTab === 'player'
                  ? 'bg-purple-600 text-white border-b-2 border-purple-400'
                  : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
              }`}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Player Stats</span>
              <span className="sm:hidden">Stats</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] sm:max-h-[65vh]">
          {/* Loading State */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="relative">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
                <div className="absolute inset-0 w-8 h-8 bg-blue-400/20 rounded-full animate-ping"></div>
              </div>
              <p className="text-gray-400 text-lg font-medium mb-2">Loading game data...</p>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Fetching from BigServer</span>
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              </div>
              
              {/* Loading Progress Indicator */}
              <div className="mt-4 w-48 h-2 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4 mb-4">
              <p className="text-yellow-400 text-sm">{error}</p>
            </div>
          )}

          {/* Content - Only show when not loading */}
          {!isLoading && (
            <>
              {activeTab === 'game' ? (
                /* Game History Tab */
                <div className="space-y-4 sm:space-y-6">
                  {/* Game History Table */}
                  <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-blue-400" />
                        Game History
                        <span className="ml-auto text-sm text-gray-400">
                          {displayHistory.length} games found
                        </span>
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                              Game ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                              Call Number
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                              Winner Board
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                              Payout
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                              Result
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider hidden xl:table-cell">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {displayHistory.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                  <Clock className="w-8 h-8 text-gray-500 mx-auto" />
                                  <span>No game history available</span>
                                  <span className="text-sm">Try changing your filters</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            displayHistory.map((item, index) => (
                              <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="text-sm sm:text-base font-medium text-blue-400">
                                    #{item.gameId}
                                  </span>
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="text-sm sm:text-base font-semibold text-green-400">
                                    ${item.amount}
                                  </span>
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="text-sm sm:text-base text-yellow-400 font-semibold">
                                    {item.callNumber || Math.floor(Math.random() * 100) + 1}
                                  </span>
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap hidden sm:table-cell">
                                  {item.result === 'won' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                      <Trophy className="w-3 h-3" />
                                      {item.boardNumber}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                                  <span className="font-semibold text-green-400">
                                    ${item.winnings || (item.result === 'won' ? item.amount * 2 : 0)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                    item.result === 'won'
                                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                      : item.result === 'lost'
                                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                      : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                  }`}>
                                    {item.result === 'won' && <Trophy className="w-3 h-3" />}
                                    {item.result === 'lost' && <X className="w-3 h-3" />}
                                    {item.result === 'pending' && <Clock className="w-3 h-3" />}
                                    {item.result.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap text-xs text-gray-400 hidden xl:table-cell">
                                  {new Date(item.timestamp).toLocaleDateString()}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Game Summary Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <Gamepad2 className="w-5 h-5 text-blue-400" />
                        <span className="text-xl sm:text-2xl font-bold text-blue-400">{displayPlayerStats.totalGames}</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm">Total Games</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="text-xl sm:text-2xl font-bold text-yellow-400">
                          {displayHistory.filter(h => h.result === 'won').length}
                        </span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm">Games Won</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-green-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="text-xl sm:text-2xl font-bold text-green-400">${displayPlayerStats.totalWinnings}</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm">Total Winnings</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <span className="text-xl sm:text-2xl font-bold text-purple-400">{displayPlayerStats.winRate.toFixed(1)}%</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm">Win Rate</p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Player Stats Tab */
                <div className="space-y-4 sm:space-y-6">
                  {/* Game Details Table */}
                  <div className="bg-gray-800/50 rounded-xl border border-gray-700 overflow-hidden">
                    <div className="px-4 py-3 bg-gradient-to-r from-gray-700/50 to-gray-800/50 border-b border-gray-700">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Gamepad2 className="w-5 h-5 text-blue-400" />
                        Game Details
                      </h3>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-700/50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                              Game ID
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                              Board Number
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider">
                              Amount
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider hidden sm:table-cell">
                              Total Player
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider hidden md:table-cell">
                              Payout
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider hidden lg:table-cell">
                              Winner Board
                            </th>
                            <th className="px-4 py-3 text-left text-xs sm:text-sm font-medium text-gray-300 uppercase tracking-wider hidden xl:table-cell">
                              Call Number
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-700">
                          {displayHistory.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                                <div className="flex flex-col items-center gap-2">
                                  <Clock className="w-8 h-8 text-gray-500 mx-auto" />
                                  <span>No game data available</span>
                                  <span className="text-sm">Your game details will appear here</span>
                                </div>
                              </td>
                            </tr>
                          ) : (
                            displayHistory.map((item, index) => (
                              <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="text-sm sm:text-base font-medium text-blue-400">
                                    #{item.gameId}
                                  </span>
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="text-sm sm:text-base text-gray-300">
                                    {item.boardNumber}
                                  </span>
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap">
                                  <span className="text-sm sm:text-base font-semibold text-green-400">
                                    ${item.amount}
                                  </span>
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-300 hidden sm:table-cell">
                                  {index + 1 + Math.floor(Math.random() * 10)}
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-300 hidden md:table-cell">
                                  <span className="font-semibold text-green-400">
                                    ${item.winnings || (item.result === 'won' ? item.amount * 2 : 0)}
                                  </span>
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap hidden lg:table-cell">
                                  {item.result === 'won' ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30">
                                      <Trophy className="w-3 h-3" />
                                      {item.boardNumber}
                                    </span>
                                  ) : (
                                    <span className="text-gray-500">-</span>
                                  )}
                                </td>
                                <td className="px-4 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-400 hidden xl:table-cell">
                                  {Math.floor(Math.random() * 100) + 1}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Summary Statistics */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-blue-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <Gamepad2 className="w-5 h-5 text-blue-400" />
                        <span className="text-xl sm:text-2xl font-bold text-blue-400">{displayPlayerStats.totalGames}</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm">Total Games</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-green-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <DollarSign className="w-5 h-5 text-green-400" />
                        <span className="text-xl sm:text-2xl font-bold text-green-400">${displayPlayerStats.totalBets}</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm">Total Bets</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <Trophy className="w-5 h-5 text-yellow-400" />
                        <span className="text-xl sm:text-2xl font-bold text-yellow-400">${displayPlayerStats.totalWinnings}</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm">Total Winnings</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-3 sm:p-4 border border-gray-700 hover:border-purple-500/50 transition-all duration-300">
                      <div className="flex items-center justify-between mb-2">
                        <TrendingUp className="w-5 h-5 text-purple-400" />
                        <span className="text-xl sm:text-2xl font-bold text-purple-400">{displayPlayerStats.winRate.toFixed(1)}%</span>
                      </div>
                      <p className="text-gray-300 text-xs sm:text-sm">Win Rate</p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-800/50 border-t border-gray-700 p-4">
          <div className="flex justify-center items-center text-sm text-gray-400">
            <span>Total Games: {displayHistory.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
}