import React, { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Copy, CheckCircle, AlertTriangle, RefreshCw, Shield } from 'lucide-react';

interface TokenSectionProps {
  token?: string;
  onTokenRefresh?: () => void;
  onTokenCopy?: () => void;
  showCopyButton?: boolean;
  showRefreshButton?: boolean;
  showExpiry?: boolean;
  className?: string;
  tokenType?: 'access' | 'refresh' | 'session' | 'api';
}

export default function TokenSection({
  token,
  onTokenRefresh,
  onTokenCopy,
  showCopyButton = true,
  showRefreshButton = true,
  showExpiry = true,
  className = '',
  tokenType = 'access'
}: TokenSectionProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [copied, setCopied] = useState(false);
  const [expiryTime, setExpiryTime] = useState<Date | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    if (token) {
      try {
        // Parse JWT token (if it's a JWT)
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setTokenInfo(payload);
          
          // Check expiry
          if (payload.exp) {
            const expiry = new Date(payload.exp * 1000);
            setExpiryTime(expiry);
            setIsExpired(expiry < new Date());
          }
        }
      } catch (error) {
        console.log('Token is not a valid JWT or parsing failed');
      }
    }
  }, [token]);

  const formatToken = (token: string) => {
    if (!token) return 'No Token';
    
    if (isVisible) {
      return token;
    }
    
    // Show first 8 and last 4 characters
    if (token.length > 12) {
      return `${token.substring(0, 8)}...${token.substring(token.length - 4)}`;
    }
    
    return token;
  };

  const handleCopy = async () => {
    if (token) {
      try {
        await navigator.clipboard.writeText(token);
        setCopied(true);
        onTokenCopy?.();
        
        setTimeout(() => setCopied(false), 2000);
      } catch (error) {
        console.error('Failed to copy token:', error);
      }
    }
  };

  const handleRefresh = () => {
    onTokenRefresh?.();
    setCopied(false);
  };

  const getTokenTypeColor = () => {
    switch (tokenType) {
      case 'access': return 'text-blue-400';
      case 'refresh': return 'text-green-400';
      case 'session': return 'text-purple-400';
      case 'api': return 'text-orange-400';
      default: return 'text-gray-400';
    }
  };

  const getTokenTypeIcon = () => {
    switch (tokenType) {
      case 'access': return <Key className="w-4 h-4" />;
      case 'refresh': return <RefreshCw className="w-4 h-4" />;
      case 'session': return <Shield className="w-4 h-4" />;
      case 'api': return <Key className="w-4 h-4" />;
      default: return <Key className="w-4 h-4" />;
    }
  };

  const getTokenStatusColor = () => {
    if (!token) return 'text-gray-500';
    if (isExpired) return 'text-red-400';
    return getTokenTypeColor();
  };

  const getBorderColor = () => {
    if (!token) return 'border-gray-700';
    if (isExpired) return 'border-red-500/50';
    return 'border-green-500/30';
  };

  const getTimeUntilExpiry = () => {
    if (!expiryTime || isExpired) return null;
    
    const now = new Date();
    const diff = expiryTime.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    
    return `${minutes}m`;
  };

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 border ${getBorderColor()} ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-1 rounded ${isExpired ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
            {getTokenTypeIcon()}
          </div>
          <div>
            <span className={`text-sm font-medium capitalize ${getTokenStatusColor()}`}>
              {tokenType} Token
            </span>
            {tokenInfo?.sub && (
              <span className="text-xs text-gray-400 ml-2">
                User: {tokenInfo.sub}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {showExpiry && expiryTime && (
            <span className={`text-xs ${isExpired ? 'text-red-400' : 'text-gray-400'}`}>
              {getTimeUntilExpiry()}
            </span>
          )}
          
          {showRefreshButton && onTokenRefresh && (
            <button
              onClick={handleRefresh}
              className="p-1 rounded hover:bg-gray-700/50 transition-colors"
              title="Refresh Token"
            >
              <RefreshCw className="w-3 h-3 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>

      {/* Token Display */}
      <div className="flex items-center gap-2 mb-3">
        <div className="flex-1 bg-gray-900/50 rounded px-3 py-2 font-mono text-sm">
          <span className={getTokenStatusColor()}>
            {formatToken(token || 'No Token Available')}
          </span>
        </div>
        
        {/* Visibility Toggle */}
        {token && (
          <button
            onClick={() => setIsVisible(!isVisible)}
            className="p-1 rounded hover:bg-gray-700/50 transition-colors"
            title={isVisible ? 'Hide Token' : 'Show Token'}
          >
            {isVisible ? (
              <EyeOff className="w-4 h-4 text-gray-400 hover:text-white" />
            ) : (
              <Eye className="w-4 h-4 text-gray-400 hover:text-white" />
            )}
          </button>
        )}
        
        {/* Copy Button */}
        {showCopyButton && token && (
          <button
            onClick={handleCopy}
            className="p-1 rounded hover:bg-gray-700/50 transition-colors"
            title="Copy Token"
          >
            {copied ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
            )}
          </button>
        )}
      </div>

      {/* Token Info */}
      {tokenInfo && !isExpired && (
        <div className="space-y-1 text-xs text-gray-400">
          <div className="flex justify-between">
            <span>Issued:</span>
            <span>{tokenInfo.iat ? new Date(tokenInfo.iat * 1000).toLocaleString() : 'Unknown'}</span>
          </div>
          <div className="flex justify-between">
            <span>Expires:</span>
            <span>{expiryTime?.toLocaleString()}</span>
          </div>
          {tokenInfo.scope && (
            <div className="flex justify-between">
              <span>Scope:</span>
              <span>{tokenInfo.scope}</span>
            </div>
          )}
        </div>
      )}

      {/* Status Messages */}
      {!token && (
        <div className="flex items-center gap-2 text-gray-500 text-xs mt-2">
          <AlertTriangle className="w-3 h-3" />
          <span>No token available</span>
        </div>
      )}
      
      {isExpired && (
        <div className="flex items-center gap-2 text-red-400 text-xs mt-2">
          <AlertTriangle className="w-3 h-3" />
          <span>Token has expired</span>
        </div>
      )}
      
      {copied && (
        <div className="flex items-center gap-2 text-green-400 text-xs mt-2">
          <CheckCircle className="w-3 h-3" />
          <span>Token copied to clipboard</span>
        </div>
      )}
    </div>
  );
}

// Hook for token management
export const useToken = (tokenType: 'access' | 'refresh' | 'session' | 'api' = 'access') => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshToken = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // This would make an API call to refresh the token
      // const response = await fetch('/api/auth/refresh', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      // });
      // const data = await response.json();
      // setToken(data.token);
      
      console.log('Token refresh would happen here');
    } catch (err) {
      setError('Failed to refresh token');
    } finally {
      setIsLoading(false);
    }
  };

  const validateToken = (tokenToValidate: string) => {
    try {
      const parts = tokenToValidate.split('.');
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const expiry = new Date(payload.exp * 1000);
        return expiry > new Date();
      }
      return false;
    } catch {
      return false;
    }
  };

  return {
    token,
    setToken,
    isLoading,
    error,
    refreshToken,
    validateToken
  };
};
