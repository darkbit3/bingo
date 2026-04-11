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

export const getStageLetter = (amount: number, room: number): string => {
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

  return stageMapping[`${amount}&room${room}`] || 'A';
}

export interface LatestGameError {
  error: string;
  details?: string;
  stage?: string;
}

// Get latest game data from stage server with improved error handling
export const getLatestGameData = async (serverUrl: string, amount: number, room: number, retryCount = 0): Promise<LatestGameResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const stage = getStageLetter(amount, room);

    console.log(`🌐 Attempting to fetch game data from ${serverUrl} (attempt ${retryCount + 1})`);

    const response = await fetch(`${serverUrl}/api/v1/game/latest-data?stage=${stage.toLowerCase()}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      // Add mode: 'cors' to handle CORS properly
      mode: 'cors',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      // Handle specific HTTP status codes
      if (response.status === 502) {
        errorMessage = 'Stage server is temporarily unavailable (502 Bad Gateway)';
      } else if (response.status === 503) {
        errorMessage = 'Stage server is under maintenance (503 Service Unavailable)';
      } else if (response.status === 504) {
        errorMessage = 'Stage server timeout (504 Gateway Timeout)';
      } else if (response.status >= 500) {
        errorMessage = `Stage server error (${response.status})`;
      }

      const errorData: LatestGameError = await response.json().catch(() => ({
        error: errorMessage
      }));

      throw new Error(errorData.error || errorMessage);
    }

    const result: LatestGameResponse = await response.json();

    if (!result.success) {
      // Handle case where DB Manager is unavailable - return fallback data
      if (result.source === 'db_manager_unavailable') {
        console.log(`⚠️ DB Manager unavailable for ${serverUrl}, using fallback data`);
        return {
          success: true,
          data: {
            gameId: 'FALLBACK-GAME',
            payout: 0,
            players: '',
            boards: '',
            totalPlayers: 0,
            stage: 'FALLBACK',
            timestamp: new Date().toISOString()
          },
          source: 'fallback',
          stage: 'fallback',
          timestamp: new Date().toISOString()
        };
      }
      throw new Error(result.data ? 'Invalid response format from stage server' : 'Stage server request failed');
    }

    console.log(`✅ Latest game data retrieved from ${serverUrl}:`, result.data);
    return result;

  } catch (error: any) {
    clearTimeout(timeoutId);

    // Enhanced error categorization
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - Stage server may be slow or unavailable');
    } else if (error.message?.includes('Failed to fetch') || error.message?.includes('NetworkError')) {
      throw new Error('Cannot connect to stage server - network connectivity issue');
    } else if (error.message?.includes('CORS') || error.message?.includes('Access-Control')) {
      throw new Error('CORS policy blocked the request - stage server configuration issue');
    } else if (error.message?.includes('502') || error.message?.includes('Bad Gateway')) {
      throw new Error('Stage server is experiencing issues (502 Bad Gateway)');
    } else if (error.message?.includes('503') || error.message?.includes('Service Unavailable')) {
      throw new Error('Stage server is under maintenance (503 Service Unavailable)');
    } else {
      throw error;
    }
  }
};

// Get latest game data with fallback handling and retry logic
export const getLatestGameDataWithFallback = async (
  amount: number,
  room: number,
  maxRetries = 2,
  retryDelay = 1000
): Promise<{
  data: LatestGameData;
  serverUrl: string;
  serverName: string;
  isFallback: boolean;
  warning?: string;
}> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // First get the server URL from BigServer
      const { getServerUrlWithFallback } = await import('./serverUrlService');
      const serverInfo = await getServerUrlWithFallback(amount, room);

      // Then get the latest game data from the stage server with retry
      const gameResponse = await getLatestGameData(serverInfo.serverUrl, amount, room, attempt);

      return {
        data: gameResponse.data,
        serverUrl: serverInfo.serverUrl,
        serverName: serverInfo.serverName,
        isFallback: false,
        warning: gameResponse.warning
      };

    } catch (error: any) {
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');

      console.warn(`❌ Attempt ${attempt + 1}/${maxRetries + 1} failed:`, lastError.message);

      // If this is not the last attempt, wait before retrying
      if (attempt < maxRetries) {
        const delay = retryDelay * Math.pow(2, attempt); // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // All retries failed, provide fallback data
  console.error('🚨 All attempts to fetch game data failed, using fallback data');

  // Create fallback data
  const fallbackData: LatestGameData = {
    gameId: 'FALLBACK-GAME',
    payout: 0,
    players: '',
    boards: '',
    totalPlayers: 0,
    stage: 'FALLBACK',
    timestamp: new Date().toISOString()
  };

  return {
    data: fallbackData,
    serverUrl: 'fallback',
    serverName: 'Fallback Server',
    isFallback: true,
    warning: `Server unavailable: ${lastError?.message || 'Unknown error'}. Using offline mode.`
  };
};

// Parse selected board for display
export const parseSelectedBoardForDisplay = (players: string | string[], boards: string | string[]): Array<{
  playerId: string;
  board: string;
}> => {
  if (!players || !boards) return [];
  
  const playerIds = Array.isArray(players) ? players : players.split(',');
  const boardNumbers = Array.isArray(boards) ? boards : boards.split(',');
  
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
