import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactDOM from 'react-dom/client';

// --- Component Definitions ---

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ children, className, ...props }) => {
  return (
    <button
      className={`font-bold py-2 px-4 rounded-lg text-white transition-all duration-300 ease-in-out transform hover:scale-105 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

interface FloatingTextProps {
  x: number;
  y: number;
  value: string | number;
  onDisappear: () => void;
}

const FloatingText: React.FC<FloatingTextProps> = ({ x, y, value, onDisappear }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDisappear();
    }, 1000); // Corresponds to animation duration

    return () => clearTimeout(timer);
  }, [onDisappear]);

  return (
    <div
      className="absolute text-green-400 font-bold text-2xl pointer-events-none animate-float-up"
      style={{ left: `${x}px`, top: `${y}px`, transform: 'translateX(-50%)' }}
    >
      {value}
    </div>
  );
};


// --- Keyboard Component ---

const KEYBOARD_LAYOUT = [
    [
        { key: '`', zh: '`' }, { key: '1', zh: 'ㄅ' }, { key: '2', zh: 'ㄉ' }, { key: '3', zh: 'ˇ' },
        { key: '4', zh: 'ˋ' }, { key: '5', zh: 'ㄓ' }, { key: '6', zh: 'ˊ' }, { key: '7', zh: '˙' },
        { key: '8', zh: 'ㄚ' }, { key: '9', zh: 'ㄞ' }, { key: '0', zh: 'ㄢ' }, { key: '-', zh: 'ㄦ' }, { key: '=', zh: '=' }
    ],
    [
        { key: 'Q', zh: 'ㄆ' }, { key: 'W', zh: 'ㄊ' }, { key: 'E', zh: 'ㄍ' }, { key: 'R', zh: 'ㄐ' },
        { key: 'T', zh: 'ㄔ' }, { key: 'Y', zh: 'ㄗ' }, { key: 'U', zh: 'ㄧ' }, { key: 'I', zh: 'ㄛ' },
        { key: 'O', zh: 'ㄟ' }, { key: 'P', zh: 'ㄣ' }, { key: '[', zh: '[' }, { key: ']', zh: ']' }
    ],
    [
        { key: 'A', zh: 'ㄇ' }, { key: 'S', zh: 'ㄋ' }, { key: 'D', zh: 'ㄎ' }, { key: 'F', zh: 'ㄑ' },
        { key: 'G', zh: 'ㄕ' }, { key: 'H', zh: 'ㄘ' }, { key: 'J', zh: 'ㄨ' }, { key: 'K', zh: 'ㄜ' },
        { key: 'L', zh: 'ㄠ' }, { key: ';', zh: 'ㄤ' }, { key: "'", zh: "'" }
    ],
    [
        { key: 'Z', zh: 'ㄈ' }, { key: 'X', zh: 'ㄌ' }, { key: 'C', zh: 'ㄏ' }, { key: 'V', zh: 'ㄒ' },
        { key: 'B', zh: 'ㄖ' }, { key: 'N', zh: 'ㄙ' }, { key: 'M', zh: 'ㄩ' }, { key: ',', zh: 'ㄝ' },
        { key: '.', zh: 'ㄡ' }, { key: '/', zh: 'ㄥ' }
    ]
];


interface KeyboardProps {
    activeKeys: Set<string>;
    mode: 'en' | 'zh';
}

const Keyboard: React.FC<KeyboardProps> = ({ activeKeys, mode }) => {
    return (
        <div className="keyboard">
            {KEYBOARD_LAYOUT.map((row, rowIndex) => (
                <div key={rowIndex} className="keyboard-row">
                    {row.map(({ key, zh }) => {
                        const isActive = mode === 'en'
                            ? activeKeys.has(key.toUpperCase())
                            : activeKeys.has(zh);

                        return (
                            <div key={key} className={`keyboard-key ${isActive ? 'highlight' : ''}`}>
                                {mode === 'zh' && <span className="zh-char">{zh}</span>}
                                <span className="en-char">{key}</span>
                            </div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};


// --- Game Constants ---

const CHAR_SETS = {
  en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890",
  zh: "ㄅㄆㄇㄈㄉㄊㄋㄌㄍㄎㄏㄐㄑㄒㄓㄔㄕㄖㄗㄘㄙㄧㄨㄩㄚㄛㄜㄝㄞㄟㄠㄡㄢㄣㄤㄥㄦ"
};

const ZHUYIN_KEY_MAP: { [key: string]: string } = {
  'ㄅ': '1', 'ㄆ': 'Q', 'ㄇ': 'A', 'ㄈ': 'Z', 'ㄉ': '2',
  'ㄊ': 'W', 'ㄋ': 'S', 'ㄌ': 'X', 'ㄍ': 'E', 'ㄎ': 'D',
  'ㄏ': 'C', 'ㄐ': 'R', 'ㄑ': 'F', 'ㄒ': 'V', 'ㄓ': '5',
  'ㄔ': 'T', 'ㄕ': 'G', 'ㄖ': 'B', 'ㄗ': 'Y', 'ㄘ': 'H',
  'ㄙ': 'N', 'ㄧ': 'U', 'ㄨ': 'J', 'ㄩ': 'M', 'ㄚ': '8',
  'ㄛ': 'I', 'ㄜ': 'K', 'ㄝ': ',', 'ㄞ': '9', 'ㄟ': 'O',
  'ㄠ': 'L', 'ㄡ': '.', 'ㄢ': '0', 'ㄣ': 'P', 'ㄤ': ';',
  'ㄥ': '/', 'ㄦ': '-',
  'ˇ': '3', 'ˋ': '4', 'ˊ': '6', '˙': '7'
};

const difficulties = [
  { name: "Very Easy", speed: 2200, count: 1 },
  { name: "Easy", speed: 1800, count: 1 },
  { name: "Normal", speed: 1500, count: 2 },
  { name: "Hard", speed: 1200, count: 2 },
  { name: "Very Hard", speed: 1000, count: 3 },
];

type LeaderboardEntry = { name: string, score: number, date: string };

// --- Main App Component ---

const App = () => {
  const [mode, setMode] = useState<'en' | 'zh' | null>(null);
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(10);
  const [gameOver, setGameOver] = useState(false);
  const [bombs, setBombs] = useState<{ id: number; char: string; x: number; y: number; }[]>([]);
  const [step, setStep] = useState("select-mode");
  const [username, setUsername] = useState("");
  const [bombsCleared, setBombsCleared] = useState(0);
  const [leaderboards, setLeaderboards] = useState<{ [key: string]: LeaderboardEntry[] }>({ en: [], zh: [] });
  const [viewingLeaderboard, setViewingLeaderboard] = useState<'en' | 'zh' | null>(null);
  const [floatingTexts, setFloatingTexts] = useState<{id: number, x: number, y: number, value: string}[]>([]);

  const bombIdRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});
  const floatingTextIdRef = useRef(0);

  const currentDifficulty = difficulties[difficultyIndex];
  const bombsToNextLevel = 50;

  const loadSounds = useCallback(() => {
    const sounds = {
      hit: "https://actions.google.com/sounds/v1/impacts/kick.ogg",
      fail: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
      gameover: "https://actions.google.com/sounds/v1/emergency/beeper_emergency.ogg"
    };
    for (const type in sounds) {
      if (Object.hasOwnProperty.call(sounds, type)) {
        if (!audioRefs.current[type]) {
          audioRefs.current[type] = new Audio(sounds[type]);
          audioRefs.current[type].load();
        }
      }
    }
  }, []);
  
  const playSound = useCallback((type: string) => {
    const audio = audioRefs.current[type];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => console.error(`Error playing sound ${type}:`, e));
    } else {
      console.warn(`Sound ${type} not loaded or found.`);
    }
  }, []);

  useEffect(() => {
    loadSounds();
    try {
        const enBoard = JSON.parse(localStorage.getItem("leaderboard_en") || "[]");
        const zhBoard = JSON.parse(localStorage.getItem("leaderboard_zh") || "[]");
        setLeaderboards({ en: enBoard, zh: zhBoard });
    } catch (e) {
        console.error("Failed to parse leaderboards from localStorage", e);
        localStorage.removeItem("leaderboard_en");
        localStorage.removeItem("leaderboard_zh");
    }
  }, [loadSounds]);

  const createBomb = useCallback(() => {
    const canvasWidth = 400;
    const bombRadius = 20;

    setBombs((prev) => {
      let newBombsBatch: { id: number; char: string; x: number; y: number; }[] = [];
      if (!mode) return prev;
      const currentChars = CHAR_SETS[mode];

      if (!currentChars || currentChars.length === 0) {
          return prev;
      }

      for (let i = 0; i < currentDifficulty.count; i++) {
        let newX;
        let overlapped;
        let attempts = 0;
        const maxAttempts = 50;
        do {
          overlapped = false;
          newX = Math.random() * (canvasWidth - bombRadius * 2) + bombRadius;
          const allBombs = [...prev, ...newBombsBatch];
          for (const existingBomb of allBombs) {
            const dx = newX - existingBomb.x;
            const dy = 0 - existingBomb.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < bombRadius * 2.5) {
              overlapped = true;
              break;
            }
          }
          attempts++;
        } while (overlapped && attempts < maxAttempts);
        if (!overlapped) {
          newBombsBatch.push({
            id: bombIdRef.current++,
            char: currentChars[Math.floor(Math.random() * currentChars.length)],
            x: newX,
            y: 0
          });
        }
      }
      return [...prev, ...newBombsBatch];
    });
  }, [mode, currentDifficulty.count]);

  useEffect(() => {
    if (step === "game" && !gameOver) {
      const dropInterval = setInterval(() => {
        setBombs((prev) => prev.map((b) => ({ ...b, y: b.y + 10 })));
      }, currentDifficulty.speed / 10);
      
      const createInterval = setInterval(createBomb, currentDifficulty.speed);
      
      return () => {
        clearInterval(dropInterval);
        clearInterval(createInterval);
      };
    }
  }, [step, gameOver, currentDifficulty.speed, createBomb]);
  
  const handleDisappear = useCallback((idToRemove: number) => {
    setFloatingTexts((prevTexts) => prevTexts.filter((text) => text.id !== idToRemove));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (step !== "game" || gameOver || !mode) return;
      const inputKey = e.key.toUpperCase();
      setBombs((prev) => {
        let hitOccurred = false;
        const updatedBombs = prev.filter((b) => {
          let charOnBomb = b.char;
          let match = false;
          if (mode === 'zh') {
            const expectedKey = ZHUYIN_KEY_MAP[charOnBomb as keyof typeof ZHUYIN_KEY_MAP];
            if (expectedKey && inputKey === expectedKey.toUpperCase()) {
              match = true;
            }
          } else {
            if (charOnBomb.toUpperCase() === inputKey) {
              match = true;
            }
          }
          if (match && !hitOccurred) {
            setScore((s) => s + 1);
            setBombsCleared((n) => n + 1);
            playSound("hit");
            setFloatingTexts((prevTexts) => [
              ...prevTexts,
              { id: floatingTextIdRef.current++, x: b.x, y: b.y, value: "+1" }
            ]);
            hitOccurred = true;
            return false;
          }
          return true;
        });
        return updatedBombs;
      });
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [step, gameOver, mode, playSound, handleDisappear]);

  useEffect(() => {
    const checkInterval = setInterval(() => {
      if(step !== "game" || gameOver) return;
      setBombs((prev) => {
        const stillActive: { id: number; char: string; x: number; y: number; }[] = [];
        let livesLost = 0;
        prev.forEach((b) => {
          if (b.y >= 500 - 20) {
            livesLost++;
          } else {
            stillActive.push(b);
          }
        });
        if (livesLost > 0) {
            setLives((l) => Math.max(0, l - livesLost));
            playSound("fail");
        }
        return stillActive;
      });
    }, 100);
    return () => clearInterval(checkInterval);
  }, [step, gameOver, playSound]);

  useEffect(() => {
    if (lives <= 0 && step === "game") {
      setGameOver(true);
      setStep("enter-name");
      playSound("gameover");
    }
  }, [lives, step, playSound]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    bombs.forEach((b) => {
      ctx.fillStyle = "black";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "gray";
      ctx.fillRect(b.x - 2, b.y - 25, 4, 10);
      ctx.fillStyle = "red";
      ctx.beginPath();
      ctx.arc(b.x, b.y - 25, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "white";
      ctx.font = "bold 24px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(b.char, b.x, b.y);
    });
  }, [bombs]);

  useEffect(() => {
    if (bombsCleared > 0 && bombsCleared % bombsToNextLevel === 0) {
        if (difficultyIndex < difficulties.length - 1) {
            setDifficultyIndex((i) => i + 1);
            alert("LEVEL COMPLETED! Next level starting.");
        }
    }
  }, [bombsCleared, difficultyIndex]);
  
  const activeKeys = new Set<string>();
  if (step === 'game' && mode) {
      bombs.forEach(bomb => {
          if (mode === 'en') {
              activeKeys.add(bomb.char.toUpperCase());
          } else if (mode === 'zh') {
              activeKeys.add(bomb.char);
          }
      });
  }

  const startGame = (selectedMode: 'en' | 'zh', difficultyIdx: number) => {
    setMode(selectedMode);
    setDifficultyIndex(difficultyIdx);
    setScore(0);
    setLives(10);
    setBombs([]);
    setBombsCleared(0);
    setGameOver(false);
    setFloatingTexts([]);
    setStep("game");
  };

  const submitScore = () => {
    if (!mode) return;
    const newEntry = { name: username || "Anonymous", score, date: new Date().toLocaleString() };
    const currentBoard = leaderboards[mode] || [];
    const newBoard = [...currentBoard, newEntry].sort((a, b) => b.score - a.score).slice(0, 10);
    
    setLeaderboards(prev => ({ ...prev, [mode]: newBoard }));
    localStorage.setItem(`leaderboard_${mode}`, JSON.stringify(newBoard));
    
    setViewingLeaderboard(mode);
    setStep("leaderboard");
  };
  
  const resetGame = () => {
    setMode(null);
    setStep("select-mode");
    setDifficultyIndex(0);
  }

  const currentBoard = viewingLeaderboard ? leaderboards[viewingLeaderboard] : [];

  return (
    <div className="p-4 relative min-h-screen flex flex-col items-center justify-start bg-gray-50 font-sans">
      {step === "select-mode" && (
        <div className="p-4 text-center min-h-screen flex flex-col justify-center items-center">
          <h1 className="text-4xl font-extrabold text-blue-700 mb-6 animate-pulse">Welcome to Typing Bomb Squad!</h1>
          <p className="text-xl mb-6 text-gray-700">Select your practice mode:</p>
          <div className="space-x-6 mb-10">
            <Button className="px-10 py-4 text-2xl bg-green-500 hover:bg-green-600 shadow-lg" onClick={() => setMode("en")}>English Mode</Button>
            <Button className="px-10 py-4 text-2xl bg-purple-500 hover:bg-purple-600 shadow-lg" onClick={() => setMode("zh")}>Zhuyin Mode</Button>
          </div>
          {mode && (
            <div className="mt-8 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-800">Select Difficulty:</h2>
              <div className="flex justify-center space-x-4 flex-wrap gap-y-4">
                {difficulties.map((level, i) => (
                  <Button
                    key={level.name}
                    className={`px-8 py-3 text-xl ${difficultyIndex === i ? 'bg-yellow-500 text-black' : 'bg-gray-700 hover:bg-gray-800'}`}
                    onClick={() => startGame(mode, i)}
                  >
                    {level.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {step === "enter-name" && (
        <div className="p-4 text-center min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-red-200 to-red-400 text-white">
          <h1 className="text-5xl font-extrabold text-red-800 mb-6 animate-bounce">GAME OVER!</h1>
          <p className="text-2xl mb-6 font-semibold">Your Score: <span className="font-extrabold text-green-800 text-3xl">{score}</span></p>
          <input
            className="border border-gray-400 p-4 rounded-lg mb-6 text-xl w-80 text-center text-gray-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your name (optional)"
            maxLength={15}
          />
          <br />
          <Button className="px-10 py-4 text-xl bg-blue-700 hover:bg-blue-800 shadow-xl" onClick={submitScore}>Submit Score</Button>
        </div>
      )}

      {step === "leaderboard" && (
        <div className="p-4 text-center min-h-screen flex flex-col justify-center items-center">
          <h1 className="text-4xl font-extrabold text-yellow-700 mb-6">🏆 Leaderboard 🏆</h1>
          
          <div className="mb-4 flex space-x-4">
            <Button 
                className={viewingLeaderboard === 'en' ? 'bg-green-600' : 'bg-gray-500'}
                onClick={() => setViewingLeaderboard('en')}>
                English
            </Button>
            <Button 
                className={viewingLeaderboard === 'zh' ? 'bg-purple-600' : 'bg-gray-500'}
                onClick={() => setViewingLeaderboard('zh')}>
                Zhuyin
            </Button>
          </div>

          {currentBoard.length === 0 ? (
            <p className="text-xl text-gray-600 mt-4">No scores yet. Be the first!</p>
          ) : (
            <ol className="mb-8 list-decimal list-inside text-xl font-medium max-w-lg mx-auto bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              {currentBoard.map((entry, i) => (
                <li key={i} className="mb-3 flex justify-between items-center border-b pb-2 last:border-b-0 last:pb-0">
                  <span className="text-gray-800">{i + 1}. <span className="font-semibold">{entry.name}</span></span>
                  <span className="font-extrabold text-blue-700 text-2xl">
                    {entry.score} pts <span className="text-sm text-gray-500 ml-2">({entry.date.split(',')[0]})</span>
                  </span>
                </li>
              ))}
            </ol>
          )}
          <Button className="px-10 py-4 text-xl bg-blue-600 hover:bg-blue-700 shadow-lg" onClick={resetGame}>Play Again</Button>
        </div>
      )}

      {step === "game" && (
        <>
          <div className="w-full max-w-xl flex justify-between items-center px-6 py-4 bg-white shadow-md rounded-lg mb-6">
            <div className="flex items-center text-red-600 font-extrabold text-4xl select-none">
              <span role="img" aria-label="heart" className="mr-2 text-5xl animate-pulse">❤️</span> {lives}
            </div>
            <div className="flex flex-col items-center text-blue-600 font-extrabold text-4xl select-none">
              <span role="img" aria-label="trophy" className="mb-1 text-5xl">🏆</span> {score}
            </div>
            <div className="flex flex-col items-center text-green-700 font-extrabold text-3xl select-none">
              <span className="text-sm">Next Level</span>
              <span className="text-4xl">{bombsToNextLevel - (bombsCleared % bombsToNextLevel)}</span>
            </div>
          </div>
          <div className="relative w-[400px] h-[500px] mx-auto block">
            <canvas ref={canvasRef} width={400} height={500} className="bg-gray-900 border-4 border-gray-700 rounded-lg shadow-2xl" />
            {floatingTexts.map((text) => (
              <FloatingText key={text.id} x={text.x} y={text.y} value={text.value} onDisappear={() => handleDisappear(text.id)} />
            ))}
          </div>
          <div className="mt-8 text-center text-gray-800 text-xl font-medium">
            <p>Difficulty: <span className="font-bold capitalize text-green-700">{currentDifficulty.name}</span></p>
          </div>
          <div className="mt-6">
              {mode && <Keyboard activeKeys={activeKeys} mode={mode} />}
          </div>
        </>
      )}
    </div>
  );
};

// --- Render App ---
const container = document.getElementById('root');
if (container) {
  const root = ReactDOM.createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
    console.error("Root container missing. The application cannot be mounted.");
}
