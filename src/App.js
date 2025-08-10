import React, { useState, useEffect, useRef } from "react";

const easyPuzzle = [
  [5,3,0,0,7,0,0,0,0],
  [6,0,0,1,9,5,0,0,0],
  [0,9,8,0,0,0,0,6,0],
  [8,0,0,0,6,0,0,0,3],
  [4,0,0,8,0,3,0,0,1],
  [7,0,0,0,2,0,0,0,6],
  [0,6,0,0,0,0,2,8,0],
  [0,0,0,4,1,9,0,0,5],
  [0,0,0,0,8,0,0,7,9]
];

const mediumPuzzle = [
  [0,0,0,0,6,0,7,0,0],
  [0,0,0,1,0,9,0,0,0],
  [3,0,9,0,0,0,0,6,0],
  [0,5,0,0,0,0,0,0,8],
  [0,0,6,0,0,0,5,0,0],
  [7,0,0,0,0,0,0,4,0],
  [0,2,0,0,0,0,6,0,3],
  [0,0,0,4,0,3,0,0,0],
  [0,0,8,0,7,0,0,0,0]
];

const hardPuzzle = [
  [0,0,0,6,0,0,4,0,0],
  [7,0,0,0,0,3,6,0,0],
  [0,0,0,0,9,1,0,8,0],
  [0,0,0,0,0,0,0,0,0],
  [0,5,0,1,8,0,0,0,3],
  [0,0,0,3,0,6,0,4,5],
  [0,4,0,2,0,0,0,6,0],
  [9,0,3,0,0,0,0,0,0],
  [0,2,0,0,0,0,1,0,0]
];

function cloneGrid(grid) {
  return grid.map(row => row.slice());
}

// Check if placing num at grid[row][col] is valid
function isValid(grid, row, col, num) {
  for (let x = 0; x < 9; x++) {
    if (grid[row][x] === num) return false; // row
    if (grid[x][col] === num) return false; // col
  }
  // 3x3 box
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (grid[r][c] === num) return false;
    }
  }
  return true;
}

// Backtracking solve sudoku, returns true if solvable
function solveSudoku(grid) {
  for (let row = 0; row < 9; row++) {
    for (let col = 0; col < 9; col++) {
      if (grid[row][col] === 0) {
        for (let num = 1; num <= 9; num++) {
          if (isValid(grid, row, col, num)) {
            grid[row][col] = num;
            if (solveSudoku(grid)) return true;
            grid[row][col] = 0;
          }
        }
        return false;
      }
    }
  }
  return true;
}

export default function App() {
  const [board, setBoard] = useState(cloneGrid(easyPuzzle));
  const [original, setOriginal] = useState(cloneGrid(easyPuzzle));
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [difficulty, setDifficulty] = useState("easy");
  const [message, setMessage] = useState("");
  // initialize each row separately to avoid shared references
  const [customBoard, setCustomBoard] = useState(
    Array.from({ length: 9 }, () => Array(9).fill(""))
  );
  const timerRef = useRef(null);

  // Start timer when board changes
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimer((t) => t + 1);
      }, 2000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isRunning]);

  // Format time as mm:ss
  function formatTime(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  // Load puzzle on difficulty change
  function loadPuzzle(level) {
    let puzzle;
    if (level === "easy") puzzle = cloneGrid(easyPuzzle);
    else if (level === "medium") puzzle = cloneGrid(mediumPuzzle);
    else puzzle = cloneGrid(hardPuzzle);

    setBoard(puzzle);
    setOriginal(puzzle);
    setDifficulty(level);
    setTimer(0);
    setMessage("");
    setIsRunning(true);
  }

  // Handle cell input only if not original fixed number
  function handleChange(r, c, e) {
    const val = e.target.value;
    if (val === "" || (/^[1-9]$/.test(val))) {
      setBoard((old) => {
        const newBoard = cloneGrid(old);
        newBoard[r][c] = val === "" ? 0 : parseInt(val);
        return newBoard;
      });
    }
  }


  // Solve current board
  function handleSolve() {
    const copy = cloneGrid(board);
    if (solveSudoku(copy)) {
      setBoard(copy);
      setMessage("Solved!");
      setIsRunning(false);
    } else {
      setMessage("No solution exists for this board.");
    }
  }

  // Validate custom board input
  function handleCustomChange(r, c, e) {
    const val = e.target.value;
    if (val === "" || (/^[1-9]$/.test(val))) {
      setCustomBoard((old) => {
        // copy rows so we don't mutate state directly
        const newBoard = old.map(row => row.slice());
        newBoard[r][c] = val;
        return newBoard;
      });
    }
  }

  // Check if custom board is valid sudoku 
  function isCustomBoardValid(grid) {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = grid[r][c];
        if (val !== 0) { // only check filled cells (numbers 1..9)
          const num = val; // already a number

          grid[r][c] = 0;
          if (!isValid(grid, r, c, num)) {
            grid[r][c] = num; 
            return false;
          }
          grid[r][c] = num; 
        }
      }
    }
    return true;
  }

  // Handle custom board solve check
  function handleCustomSolve() {
    // Convert customBoard strings to int grid (empty -> 0)
    const intGrid = customBoard.map(row => row.map(val => (val === "" ? 0 : parseInt(val))));

    // Validate given numbers (no duplicates/conflicts)
    if (!isCustomBoardValid(intGrid)) {
      setMessage("Invalid board: conflicts found in your input.");
      return;
    }

    // Try to solve
    const copy = cloneGrid(intGrid);
    if (solveSudoku(copy)) {
      setMessage("Valid board! Solution exists.");
      // populate the custom board inputs with solution (as strings)
      setCustomBoard(copy.map(row => row.map(num => num === 0 ? "" : String(num))));
    } else {
      setMessage("No solution exists for this board.");
    }
  }

  // Toggle dark/light mode
  function toggleDarkMode() {
    setDarkMode(!darkMode);
  }

  // Restart current puzzle
  function restartPuzzle() {
    setBoard(cloneGrid(original));
    setTimer(0);
    setMessage("");
    setIsRunning(true);
  }

  return (
    <div className={darkMode ? "app dark" : "app"}>
      <header>
        <h1>Sudoku Solver</h1>
        {/* simple button instead of slider */}
        <button onClick={toggleDarkMode}>
          {darkMode ? "Light Mode" : "Dark Mode"}
        </button>
      </header>

      <section className="controls">
        <select value={difficulty} onChange={(e) => loadPuzzle(e.target.value)}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <button onClick={restartPuzzle}>Restart</button>
        <button onClick={handleSolve}>Solve</button>
        <div className="timer">Timer: {formatTime(timer)}</div>
      </section>

      <section className="board-section">
        <table className="sudoku-board">
          <tbody>
            {board.map((row, r) => (
              <tr key={r}>
                {row.map((val, c) => (
                  <td key={c} className={
                    ( (r === 2 || r === 5) ? "border-bottom " : "" ) +
                    ( (c === 2 || c === 5) ? "border-right " : "" )
                  }>
                    {original[r][c] !== 0 ? (
                      <input type="text" value={val} readOnly className="fixed-cell" />
                    ) : (
                      <input
                        type="text"
                        value={val === 0 ? "" : val}
                        onChange={(e) => handleChange(r, c, e)}
                        maxLength={1}
                        className="input-cell"
                      />
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="custom-section">
        <h2>Create Your Own Sudoku</h2>
        <p>Fill cells and check if a valid solution exists.</p>
        <table className="sudoku-board custom-board">
          <tbody>
            {customBoard.map((row, r) => (
              <tr key={r}>
                {row.map((val, c) => (
                  <td key={c} className={
                    ( (r === 2 || r === 5) ? "border-bottom " : "" ) +
                    ( (c === 2 || c === 5) ? "border-right " : "" )
                  }>
                    <input
                      type="text"
                      value={val}
                      onChange={(e) => handleCustomChange(r, c, e)}
                      maxLength={1}
                      className="input-cell"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleCustomSolve}>Check Validity & Solve</button>
      </section>

      {message && <div className="message">{message}</div>}

    
      <style>{`
         {
          box-sizing: border-box;
        }
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: ${darkMode ? "#222" : "#f7f7f7"};
          color: ${darkMode ? "#eee" : "#222"};
        }
        .app {
          max-width: 600px;
          margin: auto;
          padding: 1rem;
        }
        header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        h1 {
          margin: 0;
        }
        .controls {
          display: flex;
          gap: 10px;
          align-items: center;
          margin-bottom: 1rem;
          flex-wrap: wrap;
        }
        select, button {
          padding: 0.5rem 1rem;
          font-size: 1rem;
          cursor: pointer;
        }
        .timer {
          font-weight: bold;
          margin-left: auto;
          font-size: 1.1rem;
        }
        .sudoku-board {
          border-collapse: collapse;
          margin: auto;
          user-select: none;
          width: 100%;
          max-width: 500px; /* fits well on laptops */
        }
        .sudoku-board td {
          border: 1px solid #999;
          aspect-ratio: 1 / 1; /* keeps cells square */
          text-align: center;
          vertical-align: middle;
          padding: 0;
          position: relative;
          background: ${darkMode ? "#333" : "white"};
        }
        .sudoku-board td.border-right {
          border-right: 3px solid ${darkMode ? "#aaa" : "#222"};
        }
        .sudoku-board td.border-bottom {
          border-bottom: 3px solid ${darkMode ? "#aaa" : "#222"};
        }
        input.input-cell {
          width: 100%;
          height: 100%;
          border: none;
          text-align: center;
          font-size: 1.2rem;
          background: transparent;
          color: ${darkMode ? "white" : "black"};
        }
        input.input-cell:focus {
          outline: 2px solid #4caf50;
        }
        input.fixed-cell {
          background: ${darkMode ? "#555" : "#ddd"};
          font-weight: bold;
          cursor: default;
          user-select: none;
        }
        .custom-section {
          margin-top: 2rem;
          text-align: center;
        }
        button {
          border: none;
          border-radius: 4px;
          background-color: #4caf50;
          color: white;
          transition: background-color 0.3s ease;
        }
        button:hover {
          background-color: #45a049;
        }
        .message {
          margin-top: 1rem;
          font-weight: bold;
          text-align: center;
          font-size: 1.1rem;
          color: ${message.includes("Invalid") || message.includes("No solution") ? "red" : "green"};
        }
          
          
      `}
      
      </style>
    </div>
  );
}

