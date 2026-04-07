// API endpoint to receive player data from BigServer
import { receivePlayerData } from '../services/playerDataReceiver';

// Handle POST requests to /api/player-data
export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Received player data from BigServer:', body);
    
    // Store the player data
    receivePlayerData(body);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Player data received successfully',
        received: body
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error receiving player data:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to process player data'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Handle GET requests to /api/player-data (for testing)
export async function GET(request) {
  try {
    const { getCurrentPlayerData } = await import('../services/playerDataReceiver');
    const currentData = getCurrentPlayerData();
    
    return new Response(
      JSON.stringify({
        success: true,
        data: currentData
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error getting current player data:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Failed to get player data'
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
