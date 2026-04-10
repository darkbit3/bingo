// Player data receiver service for BigServer integration

export interface PlayerData {
  playerId: string;
  balance: number;
  timestamp?: string;
  receivedAt?: string;
}

let currentPlayerData: PlayerData | null = null;
let pollingInterval: NodeJS.Timeout | null = null;

// Store player data received from BigServer
export const receivePlayerData = (playerData: PlayerData): void => {
  if (!playerData || !playerData.playerId) {
    console.error('Invalid player data received:', playerData);
    return;
  }
  
  currentPlayerData = {
    ...playerData,
    receivedAt: new Date().toISOString()
  };
  
  console.log('Player data received:', currentPlayerData);
  
  // Trigger a custom event for React components to listen to
  try {
    window.dispatchEvent(new CustomEvent('playerDataUpdate', {
      detail: currentPlayerData
    }));
  } catch (error) {
    console.error('Failed to dispatch playerDataUpdate event:', error);
  }
};

// Get current player data
export const getCurrentPlayerData = (): PlayerData | null => {
  return currentPlayerData;
};

// Initialize listener for player data updates from BigServer
export const initializePlayerDataListener = (): (() => void) => {
  // Clear any existing polling interval
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
  }
  
  // Poll for player data
  const pollPlayerData = async (): Promise<void> => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/player-info/current-player`, {
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        // Validate the received data
        if (result.data.playerId && typeof result.data.balance === 'number') {
          currentPlayerData = {
            playerId: result.data.playerId,
            balance: result.data.balance,
            timestamp: result.data.timestamp || new Date().toISOString(),
            receivedAt: new Date().toISOString()
          };
          
          // Trigger update event
          window.dispatchEvent(new CustomEvent('playerDataUpdate', {
            detail: currentPlayerData
          }));
          
          console.log('Player data updated from BigServer:', currentPlayerData);
        } else {
          console.warn('Invalid player data structure received:', result.data);
        }
      }
    } catch (error: any) {
      // Don't log as error if it's just a timeout or abort (normal when server is not running)
      if (error.name === 'AbortError') {
        console.debug('Player data fetch timeout (BigServer might not be running)');
      } else if (error.message?.includes('Failed to fetch')) {
        console.debug('Cannot connect to BigServer - service may not be available');
      } else {
        console.warn('Error fetching player data from BigServer:', error.message);
      }
    }
  };
  
  // Initial fetch
  pollPlayerData();
  
  // Set up polling interval (every 3 seconds instead of 2 to reduce load)
  pollingInterval = setInterval(pollPlayerData, 3000);
  
  // Return cleanup function
  return () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };
};

// Stop polling
export const stopPlayerDataListener = (): void => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
    pollingInterval = null;
    console.log('Player data polling stopped');
  }
};

// Manually update player data (useful for testing)
export const setMockPlayerData = (playerId: string, balance: number): void => {
  receivePlayerData({
    playerId,
    balance,
    receivedAt: new Date().toISOString()
  });
};

// Check if BigServer is available
export const checkBigServerAvailability = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch('http://localhost:3000/api/v1/player-info/current-player', {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};