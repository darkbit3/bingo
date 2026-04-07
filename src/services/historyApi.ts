import axios from 'axios';
import ServerDiscovery from './serverDiscovery';

// Dynamic API URLs - will be discovered at runtime
let BIGSERVER_BASE_URL = 'http://localhost:3000/api/v1'; // Fallback

// Initialize server discovery
const serverDiscovery = ServerDiscovery.getInstance();

/**
 * Initialize API endpoints with discovered servers
 */
export async function initializeApiEndpoints(): Promise<void> {
  try {
    const servers = await serverDiscovery.discoverServers();
    
    // Update BigServer URL with discovered server
    if (servers.bigServer) {
      BIGSERVER_BASE_URL = `${servers.bigServer.url}/api/v1`;
      console.log(`🖥️ Using Big Server: ${BIGSERVER_BASE_URL}`);
    }
    
  } catch (error) {
    console.warn('⚠️ Server discovery failed, using fallback URLs:', error);
  }
}

// Types for API responses
export interface GameHistoryItem {
  id: string;
  gameId: string;
  playerId: string;
  boardNumber: number;
  amount: number;
  result: 'won' | 'lost' | 'pending';
  winnings?: number;
  timestamp: string;
  callNumber?: number;
  totalPlayers?: number;
  payout?: number;
  room?: string;
}

export interface PlayerStatus {
  playerId: string;
  totalGames: number;
  totalBets: number;
  totalWinnings: number;
  winRate: number;
  biggestWin: number;
  biggestLoss: number;
  currentBalance: number;
  lastUpdated: string;
}

export interface GameHistoryResponse {
  success: boolean;
  data: GameHistoryItem[];
  total: number;
  message?: string;
}

export interface PlayerStatusResponse {
  success: boolean;
  data: PlayerStatus;
  message?: string;
}

// BigServer API - Main source of truth
export const bigServerApi = {
  /**
   * Get game history from BigServer
   * GET /api/v1/game/history/:playerId
   */
  async getGameHistory(playerId: string, filters?: {
    amount?: number;
    room?: string;
    limit?: number;
  }): Promise<GameHistoryResponse> {
    try {
      let url = `${BIGSERVER_BASE_URL}/game/history/${playerId}`;
      const params = new URLSearchParams();
      
      if (filters?.amount) params.append('amount', filters.amount.toString());
      if (filters?.room) params.append('room', filters.room);
      if (filters?.limit) params.append('limit', filters.limit.toString());
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      console.log('🌐 BigServer API Call:', url);
      console.log('📋 Filters being sent:', filters);
      
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching game history from BigServer:', error);
      return {
        success: false,
        data: [],
        total: 0,
        message: 'Failed to fetch game history from BigServer'
      };
    }
  },

  /**
   * Get player status from BigServer
   * GET /api/v1/player/status/:playerId
   */
  async getPlayerStatus(playerId: string): Promise<PlayerStatusResponse> {
    try {
      const response = await axios.get(`${BIGSERVER_BASE_URL}/player/status/${playerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player status from BigServer:', error);
      return {
        success: false,
        data: {
          playerId,
          totalGames: 0,
          totalBets: 0,
          totalWinnings: 0,
          winRate: 0,
          biggestWin: 0,
          biggestLoss: 0,
          currentBalance: 0,
          lastUpdated: new Date().toISOString()
        },
        message: 'Failed to fetch player status from BigServer'
      };
    }
  },

  /**
   * Get available rooms
   * GET /api/v1/rooms
   */
  async getAvailableRooms(): Promise<{success: boolean; rooms: string[]; message?: string}> {
    try {
      const response = await axios.get(`${BIGSERVER_BASE_URL}/rooms`);
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
      return {
        success: false,
        rooms: ['room1', 'room2'], // Fallback rooms
        message: 'Failed to fetch rooms'
      };
    }
  },

  /**
   * Get game history by amount filter
   * GET /api/v1/game/history/:playerId?amount=X
   */
  async getHistoryByAmount(playerId: string, amount: number): Promise<GameHistoryResponse> {
    return this.getGameHistory(playerId, { amount });
  },

  /**
   * Get game history by room filter
   * GET /api/v1/game/history/:playerId?room=X
   */
  async getHistoryByRoom(playerId: string, room: string): Promise<GameHistoryResponse> {
    return this.getGameHistory(playerId, { room });
  }
};

// Legacy exports for backward compatibility
export const gameHistoryApi = bigServerApi;
export const playerStatusApi = bigServerApi;

// Expected JSON Formats (for reference)

/*
GET /api/v1/game/history/P12345

Expected Response:
{
  "success": true,
  "data": [
    {
      "id": "hist_001",
      "gameId": "12345",
      "playerId": "P12345",
      "boardNumber": 25,
      "amount": 50,
      "result": "won",
      "winnings": 100,
      "timestamp": "2026-04-04T15:30:00.000Z",
      "callNumber": 42,
      "totalPlayers": 8,
      "payout": 100
    },
    {
      "id": "hist_002",
      "gameId": "12344",
      "playerId": "P12345",
      "boardNumber": 88,
      "amount": 25,
      "result": "lost",
      "winnings": 0,
      "timestamp": "2026-04-04T15:25:00.000Z",
      "callNumber": 18,
      "totalPlayers": 6,
      "payout": 0
    }
  ],
  "total": 2
}
*/

/*
GET /api/v1/player/status/P12345

Expected Response:
{
  "success": true,
  "data": {
    "playerId": "P12345",
    "totalGames": 25,
    "totalBets": 1250,
    "totalWinnings": 1800,
    "winRate": 64.5,
    "biggestWin": 200,
    "biggestLoss": 50,
    "currentBalance": 1950,
    "lastUpdated": "2026-04-04T15:35:00.000Z"
  }
}
*/

/*
GET /api/v1/game/details/12345

Expected Response:
{
  "success": true,
  "data": {
    "gameId": "12345",
    "status": "completed",
    "callNumber": 42,
    "winnerBoard": 25,
    "totalPlayers": 8,
    "totalBets": 400,
    "payout": 800,
    "timestamp": "2026-04-04T15:30:00.000Z",
    "players": [
      {
        "playerId": "P12345",
        "boardNumber": 25,
        "amount": 50,
        "result": "won",
        "winnings": 100
      }
    ]
  }
}
*/
