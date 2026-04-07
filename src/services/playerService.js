// Service to handle player data communication with bigserver

// Store current player data in memory
let currentPlayerData = null;

// Receive player data from bigserver
export const receivePlayerData = (playerData) => {
  currentPlayerData = {
    ...playerData,
    receivedAt: new Date().toISOString()
  };
  console.log('Player data received:', currentPlayerData);
  return currentPlayerData;
};

// Get current player data
export const getCurrentPlayerData = () => {
  return currentPlayerData;
};

// Create API endpoint handler for Vite development server
export const createPlayerDataHandler = () => {
  return (req, res) => {
    if (req.method === 'POST' && req.url === '/api/player-data') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      
      req.on('end', () => {
        try {
          const playerData = JSON.parse(body);
          const result = receivePlayerData(playerData);
          
          res.writeHead(200, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end(JSON.stringify({
            success: true,
            message: 'Player data received successfully',
            data: result
          }));
        } catch (error) {
          console.error('Error processing player data:', error);
          res.writeHead(400, {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          });
          res.end(JSON.stringify({
            success: false,
            message: 'Invalid JSON data'
          }));
        }
      });
    } else if (req.method === 'OPTIONS') {
      // Handle CORS preflight requests
      res.writeHead(200, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      });
      res.end();
    }
  };
};
