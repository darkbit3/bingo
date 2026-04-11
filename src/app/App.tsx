import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import PlayingPage from './components/PlayingPage';
import BoardSelection from './components/BoardSelection';
import PopupModal from './components/PopupModal';
import Header from './components/Header';
import Footer from './components/Footer';
import LoadingOverlay from './components/LoadingOverlay';
import WinnerDisplay from './components/WinnerDisplay';
import History from './components/History';
import { realTimeSync } from '../services/RealTimeSync';
import { receivePlayerData, initializePlayerDataListener } from '../services/playerDataReceiver';
import { getLatestGameDataWithFallback, getStageLetter } from '../services/latestGameService';
import { SmartBetProvider } from '../contexts/SmartBetContext';

type GamePhase = 'selection' | 'playing' | 'winner';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [amount, setAmount] = useState(10);
  const [room, setRoom] = useState(1);
  const [balance, setBalance] = useState(1000);
  const [playerId] = useState('P' + Math.floor(Math.random() * 100000));
  const [gamePhase, setGamePhase] = useState<GamePhase>('selection');
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [currentCall, setCurrentCall] = useState<number | null>(null);
  const [playerBoards, setPlayerBoards] = useState<number[][][]>([]);
  const [boardRange, setBoardRange] = useState<'1-100' | '101-200' | '201-300' | '301-400'>('1-100');
  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [betNumbers, setBetNumbers] = useState<number[]>([]);
  const [userBets, setUserBets] = useState<number[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betAccepted, setBetAccepted] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [gameCountdown, setGameCountdown] = useState(3);
  
  // History modal state
  const [showHistory, setShowHistory] = useState(false);
  const [gameHistory, setGameHistory] = useState<any[]>([]);
  
  const [players, setPlayers] = useState(0);
  const [payout, setPayout] = useState(0);
  const [gameId, setGameId] = useState('G00000');
  const [gameDataLoading, setGameDataLoading] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [playerIds, setPlayerIds] = useState<string>('');
  const [selectedBoards, setSelectedBoards] = useState<string>('');
  
  const [boardType, setBoardType] = useState<1 | 2>(2);
  
  // History toggle handler
  const handleHistoryToggle = () => {
    setShowHistory(!showHistory);
  };
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [winCountdown, setWinCountdown] = useState(3);
  const [winnerBoardIndex, setWinnerBoardIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    realTimeSync.setRoomAndAmount(room, amount);
  }, [room, amount]);

  useEffect(() => {
    const fetchGameData = async () => {
      try {
        setGameDataLoading(true);
        setConnectionError(null);
        
        console.log(`Fetching game data for amount=${amount}, room=${room}...`);
      const [result] = await Promise.all([
        getLatestGameDataWithFallback(amount, room),
        new Promise(resolve => setTimeout(resolve, 1000))
      ]);
      
      console.log('🔍 Full result data:', JSON.stringify(result.data, null, 2));

      // Handle fallback data
      if (result.isFallback) {
        console.warn('⚠️ Using fallback data:', result.warning);
        setConnectionError(result.warning || 'Using offline mode - servers temporarily unavailable');

        // Set minimal fallback data
        setGameId('OFFLINE-MODE');
        setPayout(0);
        setPlayers(0);
        setPlayerIds('');
        setSelectedBoards('');
        setBetNumbers([]);
        setUserBets([]);
        return;
      }

      if (!result.data || result.data.gameId === 'G00000' || !result.data.boards) {
        throw new Error('Stage server returned no valid game data');
      }

      // Clear any previous connection errors on successful fetch
      setConnectionError(null);

      // Update state with real data
      setGameId(result.data.gameId);
      setPayout(result.data.payout);
      setPlayers(result.data.totalPlayers);
      setPlayerIds(result.data.players);
      setSelectedBoards(result.data.boards);

      // Parse boards from boards field (API only returns boards, not selectedBoard)
      const boardEntries = result.data.boards.split(',');
      const boardNumbers: number[] = [];
      
      boardEntries.forEach((entry: string) => {
        if (entry) {
          const entryTrimmed = entry.trim();
          const boardNumInt = parseInt(entryTrimmed);
          
          // Filter boards to only 1-400 range and numeric
          if (!isNaN(boardNumInt) && boardNumInt > 0 && boardNumInt <= 400) {
            boardNumbers.push(boardNumInt);
            console.log(`📋 Board ${boardNumInt} found`);
          } else {
            console.log(`⚠️ Entry "${entryTrimmed}" is not a valid board number (1-400), skipping`);
          }
        }
      });
      
      console.log('📊 Total valid boards found:', boardNumbers.length);
      console.log('📊 Valid boards:', boardNumbers);
      
      setBetNumbers(boardNumbers);
      console.log('✅ All marked boards:', boardNumbers);
      
      console.log('Game data updated:', result.data);
      } catch (error) {
        console.error('Failed to fetch game data:', error);

        // Provide user-friendly error messages
        let errorMessage = 'Unable to load live game data';
        if (error instanceof Error) {
          if (error.message.includes('CORS')) {
            errorMessage = 'Server configuration issue - please try again later';
          } else if (error.message.includes('502') || error.message.includes('Bad Gateway')) {
            errorMessage = 'Game servers are temporarily unavailable - using offline mode';
          } else if (error.message.includes('timeout')) {
            errorMessage = 'Connection timeout - servers may be busy';
          } else if (error.message.includes('Cannot connect')) {
            errorMessage = 'Network connectivity issue - check your connection';
          } else {
            errorMessage = error.message;
          }
        }

        setConnectionError(errorMessage);

        setGameId('OFFLINE-MODE');
        setPayout(0);
        setPlayers(0);
        setPlayerIds('');
        setSelectedBoards('');
        setBetNumbers([]);
        setUserBets([]);
      } finally {
        setGameDataLoading(false);
      }
    };

    fetchGameData();
  }, [amount, room]);

  // Real-time board updates - refresh every 5 seconds
  useEffect(() => {
    if (gamePhase === 'selection') {
      const interval = setInterval(async () => {
        try {
          console.log('🔄 Auto-refreshing board markings...');
          const result = await getLatestGameDataWithFallback(amount, room);

          console.log('🔍 Full result data:', JSON.stringify(result.data, null, 2));

          // Handle fallback data during auto-refresh
          if (result.isFallback) {
            console.warn('⚠️ Auto-refresh using fallback data:', result.warning);
            // Don't update UI data when using fallback, just log the warning
            return;
          }

        // Parse boards from boards field (API only returns boards, not selectedBoard)
        if (result.data.boards) {
          console.log('📊 Auto-refreshing boards field:', result.data.boards);

          const boardEntries = result.data.boards.split(',');
          const boardNumbers: number[] = [];

          boardEntries.forEach((entry: string) => {
            if (entry) {
              const entryTrimmed = entry.trim();
              const boardNumInt = parseInt(entryTrimmed);

              // Filter boards to only 1-400 range and numeric
              if (!isNaN(boardNumInt) && boardNumInt > 0 && boardNumInt <= 400) {
                boardNumbers.push(boardNumInt);
              }
            }
          });

          // Update state with new board data
          setBetNumbers(boardNumbers);

          // Update other game data
          setGameId(result.data.gameId);
          setPayout(result.data.payout);
          setPlayers(result.data.totalPlayers);
          setPlayerIds(result.data.players);
          setSelectedBoards(result.data.boards);

          // Clear connection error on successful refresh
          setConnectionError(null);

          console.log('✅ Board markings updated in real-time:', boardNumbers);
        }
        } catch (error) {
          console.error('❌ Auto-refresh failed:', error);

          // Don't show error messages for auto-refresh failures to avoid spam
          // Just log them and continue with existing data
          // The initial load error handling will show user-facing messages
        }
      }, 5000); // Refresh every 5 seconds

      return () => clearInterval(interval);
    }
  }, [gamePhase, amount, room]);

  useEffect(() => {
    const handleGameStateUpdate = (state: any) => {
      setIsSyncing(true);
      if (state.gamePhase !== undefined) setGamePhase(state.gamePhase);
      if (state.calledNumbers !== undefined) setCalledNumbers(state.calledNumbers);
      if (state.currentCall !== undefined) setCurrentCall(state.currentCall);
      if (state.playerBoards !== undefined) setPlayerBoards(state.playerBoards);
      setTimeout(() => setIsSyncing(false), 100);
    };

    const handleCountdownTick = (data: any) => {
      // Ignore countdown ticks from other devices
    };

    const handleGamePhaseChange = (data: any) => {
      setIsSyncing(true);
      setGamePhase(data.gamePhase);
      if (data.gamePhase === 'playing') {
        setGameCountdown(3);
      }
      setTimeout(() => setIsSyncing(false), 100);
    };

    realTimeSync.on('gameStateUpdate', handleGameStateUpdate);
    realTimeSync.on('countdownTick', handleCountdownTick);
    realTimeSync.on('gamePhaseChange', handleGamePhaseChange);

    return () => {
      realTimeSync.off('gameStateUpdate', handleGameStateUpdate);
      realTimeSync.off('countdownTick', handleCountdownTick);
      realTimeSync.off('gamePhaseChange', handleGamePhaseChange);
    };
  }, []);

  useEffect(() => {
    if (!isSyncing) {
      realTimeSync.updateGameState({
        gamePhase,
        calledNumbers,
        currentCall,
        playerBoards
      });
    }
  }, [gamePhase, calledNumbers, currentCall, playerBoards, isSyncing]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (gamePhase === 'selection' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown(prev => {
          const newCountdown = prev - 1;
          if (newCountdown <= 0) {
            setGamePhase('playing');
            setGameCountdown(3);
            return 0;
          }
          return newCountdown;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [gamePhase]);

  useEffect(() => {
    return () => {
      realTimeSync.cleanup();
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Real-time balance updates from BigServer
  useEffect(() => {
    const handlePlayerDataUpdate = (event: CustomEvent) => {
      const playerData = event.detail;
      if (playerData && typeof playerData.balance === 'number') {
        console.log('💰 Real-time balance update:', playerData.balance);
        setBalance(playerData.balance);
        
        // Also update player ID if it changed
        if (playerData.playerId && playerData.playerId !== playerId) {
          console.log('👤 Real-time player ID update:', playerData.playerId);
          // Note: playerId is read-only from initial data, so we don't update it here
        }
      }
    };

    // Listen for player data updates
    window.addEventListener('playerDataUpdate', handlePlayerDataUpdate as EventListener);
    
    // Initialize the player data listener (starts polling BigServer)
    const cleanup = initializePlayerDataListener();
    
    console.log('🔄 Real-time balance monitoring started');
    
    return () => {
      window.removeEventListener('playerDataUpdate', handlePlayerDataUpdate as EventListener);
      cleanup();
      console.log('🔄 Real-time balance monitoring stopped');
    };
  }, [playerId]);

  const shouldBlink = countdown <= 5 && countdown > 0 && gamePhase === 'selection';

  const generateBingoBoard = () => {
    const board: number[][] = [];
    const ranges = {
      '1-100': [1, 100],
      '101-200': [101, 200],
      '201-300': [201, 300],
      '301-400': [301, 400]
    };
    const [min, max] = ranges[boardRange];
    
    ['B', 'I', 'N', 'G', 'O'].forEach(() => {
      const column: number[] = [];
      const available = Array.from({ length: max - min + 1 }, (_, i) => i + min);
      for (let i = 0; i < 5; i++) {
        const randomIndex = Math.floor(Math.random() * available.length);
        column.push(available[randomIndex]);
        available.splice(randomIndex, 1);
      }
      board.push(column);
    });

    board[2][2] = -1;
    return board;
  };

  const handleNumberSelect = (num: number) => {
    setSelectedNumber(num);
    const isDatabaseBoard = betNumbers.includes(num);
    const isUserBet = userBets.includes(num);
    
    if (isDatabaseBoard) {
      const boards = Array.from({ length: boardType }, () => generateBingoBoard());
      setPlayerBoards(boards);
    }
    
    setShowBetPopup(true);
    setBetAccepted(false);
  };

  const getPlayerIdForBoard = (boardNum: number): string => {
    if (!selectedBoards || !playerIds) return '';
    
    if (typeof selectedBoards !== 'string' || typeof playerIds !== 'string') {
      console.warn('selectedBoards or playerIds is not a string:', { selectedBoards, playerIds });
      return '';
    }
    
    const boards = selectedBoards.split(',');
    const players = playerIds.split(',');
    
    const boardIndex = boards.findIndex(board => parseInt(board.trim()) === boardNum);
    if (boardIndex !== -1 && players[boardIndex]) {
      return players[boardIndex].trim();
    }
    
    return '';
  };

  const handleBingo = (boardIndex: number) => {
    setWinnerBoardIndex(boardIndex);
    setShowWinPopup(true);
    setWinCountdown(3);
    setGamePhase('winner');
  };

  const handleReturnHome = () => {
    setIsLoading(true);
    setTimeout(() => {
      setGamePhase('selection');
      setCountdown(60);
      setCalledNumbers([]);
      setCurrentCall(null);
      setBetNumbers([]);
      setUserBets([]);
      setSelectedNumber(null);
      setShowBetPopup(false);
      setShowWinPopup(false);
      setWinCountdown(3);
      setPlayerBoards([]);
      setIsLoading(false);
    }, 1500);
  };

  const handleReset = () => {
    setIsLoading(true);
    setTimeout(() => {
      setGamePhase('selection');
      setCountdown(60);
      setCalledNumbers([]);
      setCurrentCall(null);
      setBetNumbers([]);
      setUserBets([]);
      setSelectedNumber(null);
      setShowBetPopup(false);
      setShowWinPopup(false);
      setWinCountdown(3);
      setPlayerBoards([]);
      setIsLoading(false);
    }, 1500);
  };

  const isNumberCalled = (num: number) => {
    return calledNumbers.includes(num);
  };

  const getBoardNumbers = () => {
    const ranges = {
      '1-100': [1, 100],
      '101-200': [101, 200],
      '201-300': [201, 300],
      '301-400': [301, 400]
    };
    const [min, max] = ranges[boardRange];
    return Array.from({ length: max - min + 1 }, (_, i) => i + min);
  };

  const handlePlaceBet = async () => {
    if (balance >= amount && selectedNumber && !userBets.includes(selectedNumber) && !betNumbers.includes(selectedNumber)) {
      setIsPlacingBet(true);
      
      try {
        const stageServerUrl = await realTimeSync.getServerUrl(amount, room);
        if (!stageServerUrl) {
          throw new Error('Could not connect to stage server');
        }

        const betResponse = await fetch(`${stageServerUrl}/api/v1/game/place-bet`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            boardNumber: selectedNumber,
            playerId: playerId,
            amount: amount,
            stage: getStageLetter(amount, room)
          })
        });

        const betData = await betResponse.json();

        if (betData.success) {
          console.log('🎉 Step 3: Processing successful bet response...');
          
          const newBalance = betData.data.newBalance || balance - amount;
          const updatedGame = betData.data.updatedGame;
          
          console.log('💰 New Balance:', newBalance);
          console.log('📊 Updated Game:', updatedGame);
          
          setBalance(newBalance);
          setUserBets([...userBets, selectedNumber]);
          setIsPlacingBet(false);
          setBetAccepted(true);
          
          if (updatedGame) {
            console.log('🗄️ Step 3a: Updating game data from response...');
            
            setGameId(updatedGame.gameId);
            setPayout(updatedGame.payout);
            setPlayers(updatedGame.totalPlayers);
            setPlayerIds(updatedGame.playerId ? updatedGame.playerId : '');
            setSelectedBoards(updatedGame.boards ? updatedGame.boards : '');
            
            // Parse boards from updatedGame.selectedBoard for real-time update
            if (updatedGame.selectedBoard) {
              console.log('🔄 Real-time board update from bet response...');
              const playerBoardEntries = updatedGame.selectedBoard.split(',');
              const boardNumbers: number[] = [];
              const playerBoardMapping: { [key: string]: number } = {};
              
              playerBoardEntries.forEach((entry: string) => {
                if (entry && entry.includes(':')) {
                  const parts = entry.split(':');
                  if (parts.length >= 2) {
                    const playerIdKey = parts[0].trim();
                    const boardNum = parts[parts.length - 1].trim();
                    const boardNumInt = parseInt(boardNum);
                    
                    // Filter boards to only 1-400 range
                    if (!isNaN(boardNumInt) && boardNumInt > 0 && boardNumInt <= 400) {
                      boardNumbers.push(boardNumInt);
                      playerBoardMapping[playerIdKey] = boardNumInt;
                    }
                  }
                }
              });
              
              // Update boards immediately for real-time effect
              setBetNumbers(boardNumbers);
              const newPlayerBoardsArray: number[][][] = [];
              Object.entries(playerBoardMapping).forEach(([, boardNum]) => {
                newPlayerBoardsArray.push([[boardNum]]);
              });
              setPlayerBoards(newPlayerBoardsArray);
              
              console.log('✅ Real-time board update complete:', boardNumbers);
            }
            
            const newPlayerBoardsArray: number[][][] = [...playerBoards];
            
            if (updatedGame.playerId && updatedGame.selectedBoard) {
              const playerIdsList: string[] = updatedGame.playerId.split(',');
              const boardMappings = updatedGame.selectedBoard.split(',');
              
              playerIdsList.forEach((pId: string, index: number) => {
                if (pId && boardMappings[index]) {
                  const boardNum = boardMappings[index].split(':').pop();
                  if (boardNum) {
                    const boardNumInt = parseInt(boardNum);
                    if (!isNaN(boardNumInt)) {
                      newPlayerBoardsArray.push([[boardNumInt]]);
                    }
                  }
                }
              });
            }
            
            setPlayerBoards(newPlayerBoardsArray);
            console.log('✅ Game data updated from server response');
          }
          
          console.log('✅ Step 3b: Showing success feedback...');
          
          setTimeout(() => {
            setShowBetPopup(false);
            setSelectedNumber(null);
            setBetAccepted(false);
          }, 2000);
          
          console.log('🎯 Step 3: COMPLETE - Response handled and UI updated');
          
        } else {
          throw new Error(betData.error || 'Bet placement failed');
        }
      } catch (error) {
        console.error('Error placing bet:', error);
        setIsPlacingBet(false);
        
        // Handle 2-board limit error specifically
        const errorObj = error as any;
        if (errorObj.type === 'board_limit_error') {
          alert(`🚫 ${errorObj.error}\n\nYou currently have ${errorObj.currentBoards} board(s) and the maximum is ${errorObj.maxBoards} boards per game.\n\nPlease choose a different board or wait for the next game.`);
        } else {
          alert(`Bet failed: ${errorObj.message || (error as Error).message}`);
        }
      }
    }
  };

  const handleBoardRangeChange = (range: '1-100' | '101-200' | '201-300' | '301-400') => {
    setBoardRange(range);
  };

  const handleRoomChange = (newRoom: number) => {
    setRoom(newRoom);
    realTimeSync.setRoomAndAmount(newRoom, amount);
    setCountdown(60);
  };

  const handleAmountChange = (newAmount: number) => {
    setAmount(newAmount);
    realTimeSync.setRoomAndAmount(room, newAmount);
    setCountdown(60);
  };

  const handleCancelBet = () => {
    if (selectedNumber && userBets.includes(selectedNumber)) {
      setBalance(balance + amount);
      setUserBets(userBets.filter(num => num !== selectedNumber));
    }
    
    setShowBetPopup(false);
    setSelectedNumber(null);
    setBetAccepted(false);
    setIsPlacingBet(false);
  };

  const handleBetAttempt = (betAmount: number) => {
    console.log('Bet attempt:', betAmount);
    // This will be handled by the BettingGuard component
  };

  return (
    <SmartBetProvider>
      <LoadingOverlay isLoading={isLoading || gameDataLoading} />
      <Header 
        amount={amount}
        room={room}
        onAmountChange={handleAmountChange}
        onRoomChange={handleRoomChange}
        onBetAttempt={handleBetAttempt}
        gamePhase={gamePhase}
      />

      {gamePhase === 'selection' && (
        <HomePage
          darkMode={darkMode}
          soundOn={soundOn}
          amount={amount}
          room={room}
          balance={balance}
          playerId={playerId}
          boardType={boardType}
          players={players}
          payout={payout}
          gameId={gameId}
          countdown={countdown}
          gamePhase={gamePhase}
          showBetPopup={showBetPopup}
          betNumbers={betNumbers}
          boardRange={boardRange}
          playerIds={playerIds}
          selectedBoards={selectedBoards}
          playerBoards={playerBoards}
          onBingo={handleBingo}
          onDarkModeToggle={() => setDarkMode(!darkMode)}
          onSoundToggle={() => setSoundOn(!soundOn)}
          onAmountChange={handleAmountChange}
          onRoomChange={handleRoomChange}
          onBoardTypeChange={setBoardType}
          onReset={handleReset}
          onHistoryToggle={() => setShowHistory(!showHistory)}
          onNumberSelect={handleNumberSelect}
          getBoardNumbers={getBoardNumbers}
          onBoardRangeChange={handleBoardRangeChange}
          shouldBlink={shouldBlink}
          calledNumbers={calledNumbers}
          currentCall={currentCall}
        />
      )}

      {gamePhase === 'playing' && (
        <PlayingPage
          gamePhase={gamePhase}
          calledNumbers={calledNumbers}
          currentCall={currentCall}
          playerBoards={playerBoards}
          onBingo={handleBingo}
          amount={amount}
          room={room}
          balance={balance}
          playerId={playerId}
          onAmountChange={handleAmountChange}
          onRoomChange={handleRoomChange}
          players={players}
          payout={payout}
          gameId={gameId}
          countdown={countdown}
          shouldBlink={shouldBlink}
        />
      )}

      <Footer
        soundOn={soundOn}
        onSoundToggle={() => setSoundOn(!soundOn)}
        onReset={handleReset}
        onHistoryToggle={() => setShowHistory(!showHistory)}
        isLoading={isLoading}
      />

      <PopupModal
        showBetPopup={showBetPopup}
        selectedNumber={selectedNumber}
        amount={amount}
        balance={balance}
        onPlaceBet={handlePlaceBet}
        onCancel={handleCancelBet}
        onLoginRequired={() => {
          // Trigger login page from Header
          const loginEvent = new CustomEvent('showLoginPage', { 
            detail: { 
              message: `Please login to your Smart Bet account to place a ${amount} Birr bet on board ${selectedNumber}.` 
            } 
          });
          window.dispatchEvent(loginEvent);
        }}
        isPlacingBet={isPlacingBet}
        betAccepted={betAccepted}
        isAlreadyBet={selectedNumber ? userBets.includes(selectedNumber) : false}
        isDatabaseBoard={selectedNumber ? betNumbers.includes(selectedNumber) : false}
        playerId={selectedNumber ? getPlayerIdForBoard(selectedNumber) : ''}
      />

      <WinnerDisplay
        showWinPopup={showWinPopup}
        playerId={playerId}
        payout={payout}
        currentCall={currentCall}
        winCountdown={winCountdown}
        calledNumbers={calledNumbers}
        playerBoards={playerBoards}
        winnerBoardIndex={winnerBoardIndex}
        onReturnHome={handleReturnHome}
      />

      {connectionError && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-red-500 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 18.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-red-400 mb-2">Connection Problem</h2>
              <p className="text-gray-300 mb-6">{connectionError}</p>
              <div className="space-y-3">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => setConnectionError(null)}
                  className="w-full bg-gray-700 text-gray-300 px-6 py-3 rounded-xl font-semibold hover:bg-gray-600 transition-all duration-200"
                >
                  Continue Anyway
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                The app cannot display game data until the stage server returns valid live data.
              </p>
            </div>
          </div>
        </div>
      )}

      <History
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={gameHistory}
      />
    </SmartBetProvider>
  );
}