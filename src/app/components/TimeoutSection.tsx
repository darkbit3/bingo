import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, RefreshCw } from 'lucide-react';

interface TimeoutSectionProps {
  onTimeout?: () => void;
  onRefresh?: () => void;
  warningTime?: number; // seconds before timeout to show warning
  timeoutDuration?: number; // total timeout duration in seconds
  showWarning?: boolean;
  className?: string;
}

export default function TimeoutSection({
  onTimeout,
  onRefresh,
  warningTime = 60, // 1 minute warning
  timeoutDuration = 300, // 5 minutes total
  showWarning = true,
  className = ''
}: TimeoutSectionProps) {
  const [timeRemaining, setTimeRemaining] = useState(timeoutDuration);
  const [isWarning, setIsWarning] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        const newTime = prev - 1;
        
        if (newTime <= 0) {
          setIsExpired(true);
          setIsWarning(false);
          onTimeout?.();
          return 0;
        }
        
        if (showWarning && newTime <= warningTime && !isWarning) {
          setIsWarning(true);
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, warningTime, onTimeout, showWarning, isWarning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRefresh = () => {
    setTimeRemaining(timeoutDuration);
    setIsWarning(false);
    setIsExpired(false);
    onRefresh?.();
  };

  const getProgressColor = () => {
    if (isExpired) return 'bg-red-500';
    if (isWarning) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getTextColor = () => {
    if (isExpired) return 'text-red-400';
    if (isWarning) return 'text-yellow-400';
    return 'text-green-400';
  };

  const progressPercentage = ((timeoutDuration - timeRemaining) / timeoutDuration) * 100;

  if (!isActive) {
    return null;
  }

  return (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-lg p-3 border ${className} ${
      isExpired ? 'border-red-500/50' : isWarning ? 'border-yellow-500/50' : 'border-green-500/50'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Clock className={`w-4 h-4 ${getTextColor()}`} />
          <span className={`text-sm font-medium ${getTextColor()}`}>
            {isExpired ? 'Session Expired' : isWarning ? 'Session Warning' : 'Session Active'}
          </span>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`text-sm font-mono font-bold ${getTextColor()}`}>
            {formatTime(timeRemaining)}
          </span>
          
          {(isWarning || isExpired) && onRefresh && (
            <button
              onClick={handleRefresh}
              className="p-1 rounded hover:bg-gray-700/50 transition-colors"
              title="Refresh Session"
            >
              <RefreshCw className="w-3 h-3 text-gray-400 hover:text-white" />
            </button>
          )}
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="mt-2">
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${getProgressColor()}`}
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>
      
      {/* Warning Message */}
      {isWarning && !isExpired && (
        <div className="mt-2 flex items-center gap-2 text-yellow-400 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>Your session will expire in {Math.floor(timeRemaining / 60)} minute{timeRemaining / 60 > 1 ? 's' : ''}</span>
        </div>
      )}
      
      {/* Expired Message */}
      {isExpired && (
        <div className="mt-2 flex items-center gap-2 text-red-400 text-xs">
          <AlertTriangle className="w-3 h-3" />
          <span>Your session has expired. Please refresh to continue.</span>
        </div>
      )}
    </div>
  );
}

// Hook for timeout management
export const useTimeout = (duration: number, onTimeout: () => void) => {
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, duration, onTimeout]);

  const reset = () => {
    setTimeRemaining(duration);
    setIsActive(true);
  };

  const pause = () => setIsActive(false);
  const resume = () => setIsActive(true);

  return { timeRemaining, reset, pause, resume, isActive };
};
