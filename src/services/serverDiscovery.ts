import axios from 'axios';

// Server discovery and management
export interface ServerInfo {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'unknown';
  responseTime?: number;
}

export interface DiscoveredServers {
  stageServer: ServerInfo | null;
  bigServer: ServerInfo | null;
  dbManager: ServerInfo | null;
}

class ServerDiscovery {
  private static instance: ServerDiscovery;
  private discoveredServers: DiscoveredServers = {
    stageServer: null,
    bigServer: null,
    dbManager: null
  };
  private lastCheck: number = 0;
  private checkInterval: number = 30000; // 30 seconds

  static getInstance(): ServerDiscovery {
    if (!ServerDiscovery.instance) {
      ServerDiscovery.instance = new ServerDiscovery();
    }
    return ServerDiscovery.instance;
  }

  /**
   * Discover all available servers in the bingo ecosystem
   */
  async discoverServers(): Promise<DiscoveredServers> {
    const now = Date.now();
    
    // Cache results for 30 seconds
    if (now - this.lastCheck < this.checkInterval && this.hasValidServers()) {
      return this.discoveredServers;
    }

    console.log('🔍 Discovering servers...');

    // Check all possible server configurations
    const serverChecks = [
      { name: 'Stage1', port: 3001, type: 'stage' },
      { name: 'Stage2', port: 3002, type: 'stage' },
      { name: 'Stage3', port: 3003, type: 'stage' },
      { name: 'StageA', port: 3004, type: 'stage' },
      { name: 'BigServer', port: 3000, type: 'bigserver' },
      { name: 'DB Manager', port: 5000, type: 'dbmanager' },
      { name: 'DB Manager', port: 5001, type: 'dbmanager' },
      { name: 'DB Manager', port: 5002, type: 'dbmanager' }
    ];

    const results = await Promise.allSettled(
      serverChecks.map(server => this.checkServer(server.name, server.port, server.type))
    );

    // Process results
    this.discoveredServers = {
      stageServer: null,
      bigServer: null,
      dbManager: null
    };

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value) {
        const server = serverChecks[index];
        
        switch (server.type) {
          case 'stage':
            if (!this.discoveredServers.stageServer || result.value.responseTime! < this.discoveredServers.stageServer.responseTime!) {
              this.discoveredServers.stageServer = result.value;
            }
            break;
          case 'bigserver':
            this.discoveredServers.bigServer = result.value;
            break;
          case 'dbmanager':
            if (!this.discoveredServers.dbManager || result.value.responseTime! < this.discoveredServers.dbManager.responseTime!) {
              this.discoveredServers.dbManager = result.value;
            }
            break;
        }
      }
    });

    this.lastCheck = now;
    this.logDiscoveredServers();

    return this.discoveredServers;
  }

  /**
   * Check if a specific server is online
   */
  private async checkServer(name: string, port: number, type: string): Promise<ServerInfo | null> {
    const url = `http://localhost:${port}`;
    const startTime = Date.now();

    try {
      // Try different endpoints based on server type
      let endpoint = '/health';
      
      switch (type) {
        case 'stage':
          endpoint = '/health';
          break;
        case 'bigserver':
          endpoint = '/api/v1/health';
          break;
        case 'dbmanager':
          endpoint = '/health';
          break;
      }

      const response = await axios.get(`${url}${endpoint}`, {
        timeout: 3000,
        validateStatus: (status) => status < 500 // Accept any response under 500
      });

      const responseTime = Date.now() - startTime;

      return {
        name,
        url,
        status: 'online',
        responseTime
      };

    } catch (error) {
      console.log(`❌ ${name} (port ${port}): Offline`);
      return null;
    }
  }

  /**
   * Get the best available stage server
   */
  async getStageServer(): Promise<ServerInfo | null> {
    await this.discoverServers();
    return this.discoveredServers.stageServer;
  }

  /**
   * Get the big server
   */
  async getBigServer(): Promise<ServerInfo | null> {
    await this.discoverServers();
    return this.discoveredServers.bigServer;
  }

  /**
   * Get the db manager
   */
  async getDBManager(): Promise<ServerInfo | null> {
    await this.discoverServers();
    return this.discoveredServers.dbManager;
  }

  /**
   * Check if we have valid servers cached
   */
  private hasValidServers(): boolean {
    return !!(this.discoveredServers.stageServer || 
             this.discoveredServers.bigServer || 
             this.discoveredServers.dbManager);
  }

  /**
   * Log discovered servers for debugging
   */
  private logDiscoveredServers(): void {
    console.log('🌐 Server Discovery Results:');
    
    if (this.discoveredServers.stageServer) {
      console.log(`✅ Stage Server: ${this.discoveredServers.stageServer.name} (${this.discoveredServers.stageServer.url}) - ${this.discoveredServers.stageServer.responseTime}ms`);
    } else {
      console.log('❌ No Stage Server found');
    }

    if (this.discoveredServers.bigServer) {
      console.log(`✅ Big Server: ${this.discoveredServers.bigServer.name} (${this.discoveredServers.bigServer.url}) - ${this.discoveredServers.bigServer.responseTime}ms`);
    } else {
      console.log('❌ No Big Server found');
    }

    if (this.discoveredServers.dbManager) {
      console.log(`✅ DB Manager: ${this.discoveredServers.dbManager.name} (${this.discoveredServers.dbManager.url}) - ${this.discoveredServers.dbManager.responseTime}ms`);
    } else {
      console.log('❌ No DB Manager found');
    }
  }

  /**
   * Force refresh server discovery
   */
  async refresh(): Promise<DiscoveredServers> {
    this.lastCheck = 0;
    return this.discoverServers();
  }

  /**
   * Get current server status
   */
  getCurrentServers(): DiscoveredServers {
    return this.discoveredServers;
  }
}

export default ServerDiscovery;
