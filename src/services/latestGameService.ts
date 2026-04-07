// Service for getting latest game data from stage servers

export interface LatestGameData {
  gameId: string;
  payout: number;
  players: string;
  boards: string;
  totalPlayers: number;
  stage: string;
  timestamp: string;
}

export interface LatestGameResponse {
  success: boolean;
  data: LatestGameData;
  source: string;
  stage: string;
  warning?: string;
  timestamp: string;
}

export interface LatestGameError {
  error: string;
  details?: string;
  stage?: string;
}

// Get latest game data from stage server
export const getLatestGameData = async (serverUrl: string, amount: number, room: number): Promise<LatestGameResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    // Determine stage based on amount and room mapping
    const stageMapping: { [key: string]: string } = {
      '10&room1': 'A',
      '10&room2': 'B',
      '20&room1': 'C',
      '20&room2': 'D',
      '30&room1': 'E',
      '30&room2': 'F',
      '50&room1': 'G',
      '50&room2': 'H',
      '100&room1': 'I',
      '100&room2': 'J',
      '200&room1': 'K',
      '200&room2': 'L'
    };

    const roomKey = `${amount}&room${room}`;
    const stage = stageMapping[roomKey] || 'A';

    const response = await fetch(`${serverUrl}/api/v1/game/latest-data?stage=${stage.toLowerCase()}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: LatestGameError = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.error || `Failed to get latest game data: ${response.statusText}`);
    }

    const result: LatestGameResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.data ? 'Invalid response format' : 'Stage server request failed');
    }

    console.log(`Latest game data retrieved from ${serverUrl}:`, result.data);
    return result;

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Stage server may not be available');
    } else if (error.message?.includes('Failed to fetch')) {
      throw new Error('Cannot connect to stage server - service may not be available');
    } else {
      throw error;
    }
  }
};

// Get latest game data with fallback handling
export const getLatestGameDataWithFallback = async (amount: number, room: number): Promise<{
  data: LatestGameData;
  serverUrl: string;
  serverName: string;
  isFallback: boolean;
  warning?: string;
}> => {
  try {
    // First get the server URL from BigServer
    const { getServerUrlWithFallback } = await import('./serverUrlService');
    const serverInfo = await getServerUrlWithFallback(amount, room);
    
    // Then get the latest game data from the stage server
    const gameResponse = await getLatestGameData(serverInfo.serverUrl, amount, room);
    
    return {
      data: gameResponse.data,
      serverUrl: serverInfo.serverUrl,
      serverName: serverInfo.serverName,
      isFallback: false,
      warning: gameResponse.warning
    };
    
  } catch (error) {
    console.warn('Failed to get latest game data, using fallback:', error);
    
    // Fallback data
    const fallbackData: LatestGameData = {
      gameId: 'G00000',
      payout: 0,
      players: '',
      boards: '',
      totalPlayers: 0,
      stage: 'A',
      timestamp: new Date().toISOString()
    };

    return {
      data: fallbackData,
      serverUrl: 'http://localhost:3001',
      serverName: 'Stage 1',
      isFallback: true,
      warning: `Using fallback data: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Parse selected board for display
export const parseSelectedBoardForDisplay = (players: string, boards: string): Array<{
  playerId: string;
  board: string;
}> => {
  if (!players || !boards) return [];
  
  const playerIds = players.split(',');
  const boardNumbers = boards.split(',');
  
  return playerIds.map((playerId, index) => ({
    playerId: playerId.trim(),
    board: boardNumbers[index]?.trim() || ''
  })).filter(item => item.playerId && item.board);
};

// Check if stage server is available
export const checkStageServerAvailability = async (serverUrl: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    const response = await fetch(`${serverUrl}/health`, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};
