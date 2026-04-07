interface GameState {
  room: number;
  amount: number;
  countdown: number;
  gamePhase: 'selection' | 'playing' | 'winner';
  calledNumbers: number[];
  currentCall: number | null;
  playerBoards: number[][][];
  timestamp: number;
}

interface SyncMessage {
  type: 'GAME_STATE_UPDATE' | 'COUNTDOWN_TICK' | 'GAME_PHASE_CHANGE';
  payload: any;
  room: number;
  amount: number;
  timestamp: number;
}

class RealTimeSync {
  private listeners: Map<string, Function[]> = new Map();
  private currentRoom: number = 1;
  private currentAmount: number = 10;
  private storageKey: string = 'bingo_game_state';
  private syncChannel: string = 'bingo_sync_channel';
  private countdownInterval: NodeJS.Timeout | null = null;
  private lastSyncTime: number = 0;
  private broadcastChannel: BroadcastChannel | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.setupStorageListener();
    this.setupBroadcastChannel();
  }

  private setupStorageListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === this.storageKey && e.newValue) {
          try {
            const gameState = JSON.parse(e.newValue);
            this.handleGameStateUpdate(gameState);
          } catch (error) {
            console.error('Error parsing storage event:', error);
          }
        }
      });
    }
  }

  private setupBroadcastChannel() {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window && !this.broadcastChannel) {
      this.broadcastChannel = new BroadcastChannel(this.syncChannel);
      this.broadcastChannel.onmessage = (event) => {
        const message: SyncMessage = event.data;
        if (this.shouldAcceptMessage(message)) {
          this.handleSyncMessage(message);
        }
      };
    }
  }

  private shouldAcceptMessage(message: SyncMessage): boolean {
    return message.room === this.currentRoom && 
           message.amount === this.currentAmount &&
           message.timestamp > this.lastSyncTime;
  }

  private handleSyncMessage(message: SyncMessage) {
    this.lastSyncTime = message.timestamp;
    
    switch (message.type) {
      case 'GAME_STATE_UPDATE':
        this.emit('gameStateUpdate', message.payload);
        break;
      case 'COUNTDOWN_TICK':
        this.emit('countdownTick', message.payload);
        break;
      case 'GAME_PHASE_CHANGE':
        this.emit('gamePhaseChange', message.payload);
        break;
    }
  }

  private handleGameStateUpdate(gameState: GameState) {
    if (gameState.room === this.currentRoom && gameState.amount === this.currentAmount) {
      this.emit('gameStateUpdate', gameState);
    }
  }

  private broadcast(message: SyncMessage) {
    // Save to localStorage for cross-tab sync
    const storageData = {
      ...message.payload,
      room: message.room,
      amount: message.amount,
      timestamp: message.timestamp
    };
    localStorage.setItem(this.storageKey, JSON.stringify(storageData));

    // Broadcast to other windows/tabs using existing channel
    if (this.broadcastChannel) {
      this.broadcastChannel.postMessage(message);
    }
  }

  public setRoomAndAmount(room: number, amount: number) {
    const wasInitialized = this.isInitialized;
    this.currentRoom = room;
    this.currentAmount = amount;
    this.isInitialized = true;
    
    if (!wasInitialized) {
      this.loadPersistedState();
    }
  }

  private loadPersistedState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const gameState = JSON.parse(saved);
        if (gameState.room === this.currentRoom && gameState.amount === this.currentAmount) {
          // Only emit if we have valid data
          setTimeout(() => {
            this.emit('gameStateUpdate', gameState);
          }, 100);
        }
      } catch (error) {
        console.error('Error loading persisted state:', error);
      }
    }
  }

  public updateGameState(state: Partial<GameState>) {
    const message: SyncMessage = {
      type: 'GAME_STATE_UPDATE',
      payload: {
        ...state,
        room: this.currentRoom,
        amount: this.currentAmount,
        timestamp: Date.now()
      },
      room: this.currentRoom,
      amount: this.currentAmount,
      timestamp: Date.now()
    };
    
    this.broadcast(message);
  }

  public startCountdown(initialCountdown: number) {
    this.stopCountdown();
    
    let countdown = initialCountdown;
    
    // Remove countdown recovery - each device should have its own countdown
    // const saved = localStorage.getItem(this.storageKey);
    // if (saved) {
    //   try {
    //     const gameState = JSON.parse(saved);
    //     if (gameState.room === this.currentRoom && 
    //         gameState.amount === this.currentAmount && 
    //         gameState.timestamp && 
    //         gameState.countdown !== undefined) {
    //       
    //       const elapsed = Math.floor((Date.now() - gameState.timestamp) / 1000);
    //       countdown = Math.max(0, gameState.countdown - elapsed);
    //       
    //       console.log(`Countdown recovery: initial=${initialCountdown}, saved=${gameState.countdown}, elapsed=${elapsed}, adjusted=${countdown}`);
    //     }
    //   } catch (error) {
    //     console.error('Error calculating elapsed time:', error);
    //   }
    // }

    this.countdownInterval = setInterval(() => {
      countdown--;
      
      // Don't update localStorage for countdown - each device manages its own
      // const storageData = {
      //   countdown,
      //   room: this.currentRoom,
      //   amount: this.currentAmount,
      //   timestamp: Date.now()
      // };
      // localStorage.setItem(this.storageKey, JSON.stringify(storageData));
      
      const message: SyncMessage = {
        type: 'COUNTDOWN_TICK',
        payload: {
          countdown,
          room: this.currentRoom,
          amount: this.currentAmount
        },
        room: this.currentRoom,
        amount: this.currentAmount,
        timestamp: Date.now()
      };
      
      this.broadcast(message);
      
      if (countdown <= 0) {
        this.stopCountdown();
        this.changeGamePhase('playing');
      }
    }, 1000);

    // Initial broadcast
    const initialMessage: SyncMessage = {
      type: 'COUNTDOWN_TICK',
      payload: {
        countdown,
        room: this.currentRoom,
        amount: this.currentAmount
      },
      room: this.currentRoom,
      amount: this.currentAmount,
      timestamp: Date.now()
    };
    this.broadcast(initialMessage);
  }

  public stopCountdown() {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  public changeGamePhase(phase: 'selection' | 'playing' | 'winner') {
    const message: SyncMessage = {
      type: 'GAME_PHASE_CHANGE',
      payload: {
        gamePhase: phase,
        room: this.currentRoom,
        amount: this.currentAmount
      },
      room: this.currentRoom,
      amount: this.currentAmount,
      timestamp: Date.now()
    };
    
    this.broadcast(message);
  }

  public on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback: Function) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  public getCurrentRoom(): number {
    return this.currentRoom;
  }

  public getCurrentAmount(): number {
    return this.currentAmount;
  }

  public async getServerUrl(amount: number, room: number): Promise<string | null> {
    try {
      // Get stage server URL from BigServer
      const response = await fetch(`http://localhost:3000/server-url/${amount}/${room}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data && result.data.serverUrl) {
        return result.data.serverUrl;
      } else {
        console.error('Invalid response from BigServer:', result);
        return null;
      }
    } catch (error) {
      console.error('Error getting server URL from BigServer:', error);
      return null;
    }
  }

  public cleanup() {
    this.stopCountdown();
    this.listeners.clear();
    
    // Close broadcast channel
    if (this.broadcastChannel) {
      this.broadcastChannel.close();
      this.broadcastChannel = null;
    }
    
    this.isInitialized = false;
  }
}

export const realTimeSync = new RealTimeSync();
export default RealTimeSync;
