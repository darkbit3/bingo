import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Loader2, Server, Database, Gamepad2 } from 'lucide-react';
import ServerDiscovery, { ServerInfo, DiscoveredServers } from '../../services/serverDiscovery';

interface ServerStatusProps {
  showDetails?: boolean;
}

export default function ServerStatus({ showDetails = false }: ServerStatusProps) {
  const [servers, setServers] = useState<DiscoveredServers>({
    stageServer: null,
    bigServer: null,
    dbManager: null
  });
  const [isChecking, setIsChecking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const serverDiscovery = ServerDiscovery.getInstance();

  useEffect(() => {
    checkServers();
    // Check servers every 30 seconds
    const interval = setInterval(checkServers, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkServers = async () => {
    setIsChecking(true);
    try {
      const discovered = await serverDiscovery.discoverServers();
      setServers(discovered);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error checking servers:', error);
    } finally {
      setIsChecking(false);
    }
  };

  const getStatusIcon = (server: ServerInfo | null) => {
    if (!server) return <XCircle className="w-4 h-4 text-red-400" />;
    if (server.status === 'online') return <CheckCircle className="w-4 h-4 text-green-400" />;
    if (server.status === 'offline') return <XCircle className="w-4 h-4 text-red-400" />;
    return <AlertCircle className="w-4 h-4 text-yellow-400" />;
  };

  const getStatusColor = (server: ServerInfo | null) => {
    if (!server) return 'text-red-400';
    if (server.status === 'online') return 'text-green-400';
    if (server.status === 'offline') return 'text-red-400';
    return 'text-yellow-400';
  };

  const getServerIcon = (type: 'stage' | 'bigserver' | 'dbmanager') => {
    switch (type) {
      case 'stage': return <Gamepad2 className="w-4 h-4" />;
      case 'bigserver': return <Server className="w-4 h-4" />;
      case 'dbmanager': return <Database className="w-4 h-4" />;
    }
  };

  if (!showDetails) {
    // Compact view - just show overall status
    const allOnline = servers.stageServer?.status === 'online' && 
                     servers.bigServer?.status === 'online' && 
                     servers.dbManager?.status === 'online';
    
    return (
      <div className="flex items-center gap-2 text-xs">
        {isChecking ? (
          <>
            <Loader2 className="w-3 h-3 animate-spin text-blue-400" />
            <span className="text-gray-400">Checking servers...</span>
          </>
        ) : (
          <>
            {getStatusIcon(servers.stageServer)}
            <span className={getStatusColor(servers.stageServer)}>
              {servers.stageServer?.name || 'No Stage Server'}
            </span>
          </>
        )}
      </div>
    );
  }

  // Detailed view
  return (
    <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Server className="w-4 h-4 text-blue-400" />
          Server Status
        </h3>
        <button
          onClick={checkServers}
          disabled={isChecking}
          className="text-xs px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 rounded transition-colors disabled:opacity-50"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin inline mr-1" />
              Checking...
            </>
          ) : (
            'Refresh'
          )}
        </button>
      </div>

      <div className="space-y-2">
        {/* Stage Server */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getServerIcon('stage')}
            <span className="text-sm text-gray-300">Stage Server</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(servers.stageServer)}
            <span className={`text-xs ${getStatusColor(servers.stageServer)}`}>
              {servers.stageServer?.name || 'Offline'}
            </span>
            {servers.stageServer?.responseTime && (
              <span className="text-xs text-gray-500">
                ({servers.stageServer.responseTime}ms)
              </span>
            )}
          </div>
        </div>

        {/* Big Server */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getServerIcon('bigserver')}
            <span className="text-sm text-gray-300">Big Server</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(servers.bigServer)}
            <span className={`text-xs ${getStatusColor(servers.bigServer)}`}>
              {servers.bigServer?.name || 'Offline'}
            </span>
            {servers.bigServer?.responseTime && (
              <span className="text-xs text-gray-500">
                ({servers.bigServer.responseTime}ms)
              </span>
            )}
          </div>
        </div>

        {/* DB Manager */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getServerIcon('dbmanager')}
            <span className="text-sm text-gray-300">DB Manager</span>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(servers.dbManager)}
            <span className={`text-xs ${getStatusColor(servers.dbManager)}`}>
              {servers.dbManager?.name || 'Offline'}
            </span>
            {servers.dbManager?.responseTime && (
              <span className="text-xs text-gray-500">
                ({servers.dbManager.responseTime}ms)
              </span>
            )}
          </div>
        </div>
      </div>

      {lastUpdate && (
        <div className="mt-3 pt-2 border-t border-gray-700">
          <p className="text-xs text-gray-500">
            Last checked: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
      )}
    </div>
  );
}
