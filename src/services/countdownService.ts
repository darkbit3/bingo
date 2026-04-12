// Service for fetching countdown from stage servers

export interface CountdownData {
  room: number;
  countdown: number;
  active: boolean;
}

export interface CountdownResponse {
  success: boolean;
  data: CountdownData;
  timestamp: string;
}

export interface CountdownError {
  error: string;
  details?: string;
}

// Get stage URL based on amount
const getStageUrl = (amount: number): string => {
  const stageUrls: { [key: number]: string } = {
    10: import.meta.env.VITE_STAGE1_URL || 'https://stage1-server.onrender.com',
    20: import.meta.env.VITE_STAGE2_URL || 'https://stage2-server.onrender.com',
    30: import.meta.env.VITE_STAGE3_URL || 'https://stage3-server.onrender.com',
    50: import.meta.env.VITE_STAGE4_URL || 'https://stage4-server.onrender.com',
    100: import.meta.env.VITE_STAGE5_URL || 'https://stage5-server.onrender.com',
    200: import.meta.env.VITE_STAGE6_URL || 'https://stage6-server.onrender.com'
  };

  return stageUrls[amount] || stageUrls[10]; // Default to Stage1
};

// Fetch countdown from stage server for specific amount and room
export const getRoomCountdown = async (amount: number, room: number): Promise<CountdownResponse> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

  try {
    const stageUrl = getStageUrl(amount);

    const response = await fetch(`${stageUrl}/api/v1/room-countdown?room=${room}`, {
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData: CountdownError = await response.json().catch(() => ({
        error: `HTTP ${response.status}: ${response.statusText}`
      }));
      throw new Error(errorData.error || `Failed to get countdown: ${response.statusText}`);
    }

    const result: CountdownResponse = await response.json();

    if (!result.success) {
      throw new Error('Invalid countdown response format');
    }

    console.log(`Countdown retrieved for amount ${amount}, room ${room}:`, result.data);
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

// Get countdown with fallback to local countdown if stage server is unavailable
export const getRoomCountdownWithFallback = async (amount: number, room: number, localCountdown: number): Promise<{
  countdown: number;
  active: boolean;
  isFallback: boolean;
  error?: string;
}> => {
  // Only fetch from stage server for amounts that have per-room countdown (10, 20, 30, 50, 100, 200)
  const supportedAmounts = [10, 20, 30, 50, 100, 200];
  if (!supportedAmounts.includes(amount)) {
    return {
      countdown: localCountdown,
      active: true,
      isFallback: true,
      error: 'Amount not supported for per-room countdown'
    };
  }

  try {
    const response = await getRoomCountdown(amount, room);
    return {
      countdown: response.data.countdown,
      active: response.data.active,
      isFallback: false
    };
  } catch (error) {
    console.warn(`Failed to fetch countdown from stage server for amount ${amount}, room ${room}:`, error.message);
    return {
      countdown: localCountdown,
      active: true,
      isFallback: true,
      error: error.message
    };
  }
};