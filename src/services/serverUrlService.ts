// Service for getting room-based server URLs from BigServer

export interface ServerUrlResponse {
  success: boolean;
  data: {
    amount: number;
    room: number;
    roomKey: string;
    serviceName: string;
    serverUrl: string;
    serverName: string;
    connected: boolean;
    timestamp: string;
  };
}

export interface ServerUrlError {
  error: string;
  amount?: number;
  room?: number;
  roomKey?: string;
  serviceName?: string;
}

// Get server URL for specific amount and room combination
export const getServerUrl = async (amount: number, room: number): Promise<ServerUrlResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/server-url/${amount}/${room}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: ServerUrlError = await response.json().catch(() => ({ 
        error: `HTTP ${response.status}: ${response.statusText}` 
      }));
      throw new Error(errorData.error || `Failed to get server URL: ${response.statusText}`);
    }

    const result: ServerUrlResponse = await response.json();
    
    if (!result.success) {
      throw new Error(result.data ? 'Invalid response format' : 'Server request failed');
    }

    console.log(`Server URL retrieved for ${amount}&room${room}:`, result.data);
    return result;

  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - BigServer may not be available');
    } else if (error.message?.includes('Failed to fetch')) {
      throw new Error('Cannot connect to BigServer - service may not be available');
    } else {
      throw error;
    }
  }
};

// Check if BigServer is available
export const checkBigServerAvailability = async (): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/health`, {
      method: 'HEAD',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Get server URL with fallback handling
export const getServerUrlWithFallback = async (amount: number, room: number): Promise<{
  serverUrl: string;
  serverName: string;
  connected: boolean;
  isFallback: boolean;
}> => {
  try {
    const response = await getServerUrl(amount, room);
    return {
      serverUrl: response.data.serverUrl,
      serverName: response.data.serverName,
      connected: response.data.connected,
      isFallback: false
    };
  } catch (error) {
    console.warn('Failed to get server URL from BigServer, using fallback:', error);
    
    // Fallback mapping based on the same constants as BigServer
    const fallbackMapping: { [key: string]: { url: string; name: string } } = {
      '10&room1': { url: 'https://stage1-vh67.onrender.com', name: 'Stage 1' },
      '10&room2': { url: 'https://stage2-vh67.onrender.com', name: 'Stage 2' },
      '20&room1': { url: 'https://stage3-vh67.onrender.com', name: 'Stage 3' },
      '20&room2': { url: 'https://stage4-vh67.onrender.com', name: 'Stage 4' },
      '30&room1': { url: 'https://stage5-vh67.onrender.com', name: 'Stage 5' },
      '30&room2': { url: 'https://stage6-vh67.onrender.com', name: 'Stage 6' },
      '50&room1': { url: 'https://stage1-vh67.onrender.com', name: 'Stage 1' },
      '50&room2': { url: 'https://stage2-vh67.onrender.com', name: 'Stage 2' },
      '100&room1': { url: 'https://stage3-vh67.onrender.com', name: 'Stage 3' },
      '100&room2': { url: 'https://stage4-vh67.onrender.com', name: 'Stage 4' },
      '200&room1': { url: 'https://stage5-vh67.onrender.com', name: 'Stage 5' },
      '200&room2': { url: 'https://stage6-vh67.onrender.com', name: 'Stage 6' }
    };

    const roomKey = `${amount}&room${room}`;
    const fallback = fallbackMapping[roomKey];

    if (!fallback) {
      throw new Error(`No server configuration found for ${roomKey}`);
    }

    return {
      serverUrl: fallback.url,
      serverName: fallback.name,
      connected: false, // We can't know the connection status in fallback mode
      isFallback: true
    };
  }
};
