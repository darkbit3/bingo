// Bingo Frontend Message Listener
// This script handles communication with the parent Smart Bet application

interface PlayerData {
  playerId: number;
  balance: number;
  withdrawable: number;
  non_withdrawable: number;
  bonus_balance: number;
  timestamp: string;
}

interface ParentMessage {
  type: 'player_data' | 'balance_update' | 'game_config';
  data?: any;
}

class BingoMessageHandler {
  private playerData: PlayerData | null = null;
  private parentOrigin: string = 'http://localhost:5174'; // Smart bet frontend

  constructor() {
    this.initialize();
  }

  private initialize() {
    console.log('🎮 Bingo Message Handler: Initializing...');
    
    // Listen for messages from parent Smart Bet application
    window.addEventListener('message', this.handleParentMessage.bind(this));
    
    // Notify parent that bingo is ready
    this.sendToParent({
      type: 'bingo_ready',
      data: {
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });

    // Request initial player data
    this.sendToParent({
      type: 'balance_update_request',
      data: {
        timestamp: new Date().toISOString()
      }
    });

    console.log('✅ Bingo Message Handler: Ready to receive messages');
  }

  private handleParentMessage(event: MessageEvent) {
    // Verify origin for security
    if (event.origin !== this.parentOrigin) {
      console.warn('⚠️ Bingo: Received message from unauthorized origin:', event.origin);
      return;
    }

    const message: ParentMessage = event.data;
    console.log('📨 Bingo: Received message from parent:', message);

    switch (message.type) {
      case 'player_data':
        this.handlePlayerData(message.data);
        break;
      
      case 'balance_update':
        this.handleBalanceUpdate(message.data);
        break;
      
      case 'game_config':
        this.handleGameConfig(message.data);
        break;
      
      default:
        console.warn('⚠️ Bingo: Unknown message type:', message.type);
    }
  }

  private handlePlayerData(data: PlayerData) {
    console.log('👤 Bingo: Player data received:', data);
    this.playerData = data;

    // Store player data in localStorage for bingo game use
    localStorage.setItem('bingo_player_data', JSON.stringify(data));
    
    // Trigger custom event for bingo game components
    window.dispatchEvent(new CustomEvent('playerDataReceived', {
      detail: data
    }));

    // Update UI if needed
    this.updatePlayerUI(data);
  }

  private handleBalanceUpdate(data: PlayerData) {
    console.log('💰 Bingo: Balance update received:', data);
    this.playerData = data;

    // Update stored player data
    localStorage.setItem('bingo_player_data', JSON.stringify(data));
    
    // Trigger custom event for bingo game components
    window.dispatchEvent(new CustomEvent('balanceUpdateReceived', {
      detail: data
    }));

    // Update UI
    this.updatePlayerUI(data);
  }

  private handleGameConfig(config: any) {
    console.log('⚙️ Bingo: Game config received:', config);
    
    // Store game config
    localStorage.setItem('bingo_game_config', JSON.stringify(config));
    
    // Trigger custom event
    window.dispatchEvent(new CustomEvent('gameConfigReceived', {
      detail: config
    }));
  }

  private updatePlayerUI(playerData: PlayerData) {
    // Update player info display if elements exist
    const playerInfoElement = document.getElementById('player-info');
    const balanceElement = document.getElementById('player-balance');
    const withdrawableElement = document.getElementById('withdrawable-balance');
    const nonWithdrawableElement = document.getElementById('non-withdrawable-balance');

    if (playerInfoElement) {
      playerInfoElement.textContent = `Player ID: ${playerData.playerId}`;
    }

    if (balanceElement) {
      balanceElement.textContent = playerData.balance.toString();
    }

    if (withdrawableElement) {
      withdrawableElement.textContent = playerData.withdrawable.toString();
    }

    if (nonWithdrawableElement) {
      nonWithdrawableElement.textContent = playerData.non_withdrawable.toString();
    }
  }

  private sendToParent(message: ParentMessage) {
    try {
      window.parent.postMessage(message, this.parentOrigin);
      console.log('📤 Bingo: Sent message to parent:', message);
    } catch (error) {
      console.error('❌ Bingo: Failed to send message to parent:', error);
    }
  }

  // Public methods for bingo game to use
  public getPlayerData(): PlayerData | null {
    return this.playerData;
  }

  public requestBalanceUpdate() {
    this.sendToParent({
      type: 'balance_update_request',
      data: {
        timestamp: new Date().toISOString()
      }
    });
  }

  public sendError(message: string) {
    this.sendToParent({
      type: 'error',
      data: {
        message: message,
        timestamp: new Date().toISOString()
      }
    });
  }

  public sendGameEvent(eventType: string, eventData: any) {
    this.sendToParent({
      type: 'game_event',
      data: {
        eventType: eventType,
        eventData: eventData,
        timestamp: new Date().toISOString()
      }
    });
  }
}

// Initialize the message handler when the page loads
let bingoMessageHandler: BingoMessageHandler;

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    bingoMessageHandler = new BingoMessageHandler();
  });
} else {
  bingoMessageHandler = new BingoMessageHandler();
}

// Make it globally available for the bingo game
(window as any).bingoMessageHandler = bingoMessageHandler;

// Export for TypeScript usage
export { BingoMessageHandler, PlayerData, ParentMessage };
