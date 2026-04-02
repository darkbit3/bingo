import { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import PlayingPage from './components/PlayingPage';
import BoardSelection from './components/BoardSelection';
import PopupModal from './components/PopupModal';
import WinnerDisplay from './components/WinnerDisplay';
import Footer from './components/Footer';
import LoadingOverlay from './components/LoadingOverlay';

type GamePhase = 'selection' | 'playing' | 'winner';

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [soundOn, setSoundOn] = useState(true);
  const [amount, setAmount] = useState(10);
  const [room, setRoom] = useState(1);
  const [balance, setBalance] = useState(1000);
  const [playerId] = useState('P' + Math.floor(Math.random() * 100000));
  const [gamePhase, setGamePhase] = useState<GamePhase>('selection');
  const [calledNumbers, setCalledNumbers] = useState<number[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('calledNumbers') || '[]');
    } catch {
      return [];
    }
  });
  const [currentCall, setCurrentCall] = useState<number | null>(() => {
    const saved = localStorage.getItem('currentCall');
    return saved ? parseInt(saved) : null;
  });
  const [playerBoards, setPlayerBoards] = useState<number[][][]>(() => {
    try {
      return JSON.parse(localStorage.getItem('playerBoards') || '[]');
    } catch {
      return [];
    }
  });
  const [boardRange, setBoardRange] = useState<'1-100' | '101-200' | '201-300' | '301-400'>('1-100');
  const [showBetPopup, setShowBetPopup] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [betNumbers, setBetNumbers] = useState<number[]>([]);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [betAccepted, setBetAccepted] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [gameCountdown, setGameCountdown] = useState(3);
  const [players] = useState(Math.floor(Math.random() * 50) + 10);
  const [payout] = useState(amount * players * 0.8);
  const [boardType, setBoardType] = useState<1 | 2>(2);
  const [gameId] = useState('G' + Math.floor(Math.random() * 100000));
  const [showHistory, setShowHistory] = useState(false);
  const [showWinPopup, setShowWinPopup] = useState(false);
  const [winCountdown, setWinCountdown] = useState(3);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Save gamePhase to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('gamePhase', gamePhase);
  }, [gamePhase]);

  // Load saved state from localStorage on initial load
  useEffect(() => {
    // Initial loading effect
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000); // 1 second initial loading

    return () => clearTimeout(timer);
  }, []);

  // Save other game state to localStorage
  useEffect(() => {
    localStorage.setItem('calledNumbers', JSON.stringify(calledNumbers));
  }, [calledNumbers]);

  useEffect(() => {
    if (currentCall !== null) {
      localStorage.setItem('currentCall', currentCall.toString());
    }
  }, [currentCall]);

  useEffect(() => {
    localStorage.setItem('playerBoards', JSON.stringify(playerBoards));
  }, [playerBoards]);

  // Handle countdown and blinking effect
  useEffect(() => {
    if (gamePhase === 'selection' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (gamePhase === 'selection' && countdown === 0) {
      setGamePhase('playing');
      setGameCountdown(3);
    }
  }, [countdown, gamePhase]);

  // Check if we should blink (last 5 seconds)
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
    const isAlreadyBet = betNumbers.includes(num);
    
    if (isAlreadyBet) {
      // If already bet, show the board
      const boards = Array.from({ length: boardType }, () => generateBingoBoard());
      setPlayerBoards(boards);
    }
    
    setShowBetPopup(true);
    setBetAccepted(false);
  };

  const handleBingo = (boardIndex: number) => {
    setShowWinPopup(true);
    setWinCountdown(3);
    setGamePhase('winner');
  };

  const handleReset = () => {
    setIsLoading(true);
    // Simulate loading effect
    setTimeout(() => {
      setGamePhase('selection');
      setCountdown(60);
      setCalledNumbers([]);
      setCurrentCall(null);
      setBetNumbers([]);
      setSelectedNumber(null);
      setShowBetPopup(false);
      setShowWinPopup(false);
      setWinCountdown(3);
      setPlayerBoards([]);
      setIsLoading(false);
    }, 1500); // 1.5 second loading effect
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

  const handlePlaceBet = () => {
    if (balance >= amount && selectedNumber && !betNumbers.includes(selectedNumber)) {
      setIsPlacingBet(true);
      
      // Simulate betting process
      setTimeout(() => {
        setBalance(balance - amount);
        setBetNumbers([...betNumbers, selectedNumber]);
        setIsPlacingBet(false);
        setBetAccepted(true);
        
        // Close modal after showing acceptance
        setTimeout(() => {
          setShowBetPopup(false);
          setSelectedNumber(null);
          setBetAccepted(false);
        }, 2000);
      }, 1500);
    }
  };

  const handleBoardRangeChange = (range: '1-100' | '101-200' | '201-300' | '301-400') => {
    setBoardRange(range);
  };

  const handleCancelBet = () => {
    if (selectedNumber && betNumbers.includes(selectedNumber)) {
      // Return balance and remove bet
      setBalance(balance + amount);
      setBetNumbers(betNumbers.filter(num => num !== selectedNumber));
    }
    
    setShowBetPopup(false);
    setSelectedNumber(null);
    setBetAccepted(false);
    setIsPlacingBet(false);
  };

  return (
    <>
      <LoadingOverlay isLoading={isLoading} />

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
          playerBoards={playerBoards}
          onBingo={handleBingo}
          onDarkModeToggle={() => setDarkMode(!darkMode)}
          onSoundToggle={() => setSoundOn(!soundOn)}
          onAmountChange={setAmount}
          onRoomChange={setRoom}
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
        isPlacingBet={isPlacingBet}
        betAccepted={betAccepted}
        isAlreadyBet={selectedNumber ? betNumbers.includes(selectedNumber) : false}
      />

      <WinnerDisplay
        showWinPopup={showWinPopup}
        playerId={playerId}
        payout={payout}
        currentCall={currentCall}
        winCountdown={winCountdown}
      />
    </>
  );
}
