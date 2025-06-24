import React, { useState, useEffect } from 'react';
import './App.css';

const SudokuSolver = () => {
  const easyPuzzle = [
    ['5','3','','','7','','','',''],
    ['6','','','1','9','5','','',''],
    ['','9','8','','','','','6',''],
    ['8','','','','6','','','','3'],
    ['4','','','8','','3','','','1'],
    ['7','','','','2','','','','6'],
    ['','6','','','','','2','8',''],
    ['','','','4','1','9','','','5'],
    ['','','','','8','','','7','9']
  ];

  const mediumPuzzle = [
    ['','','3','','2','6','','',''],
    ['9','','','3','','5','','','1'],
    ['','','1','8','','6','4','',''],
    ['','','8','1','','2','9','',''],
    ['7','','','','','','','','8'],
    ['','','6','7','','8','2','',''],
    ['','2','','6','','9','5','',''],
    ['8','','','2','','3','','','9'],
    ['','','5','','1','','3','','']
  ];

  const hardPuzzle = [
    ['','','5','3','','','','',''],
    ['8','','','','','','','2',''],
    ['','7','','','','','9','',''],
    ['','5','','','','7','','',''],
    ['','','','','','','','',''],
    ['','','','','9','','','','8'],
    ['','','','','','5','','7',''],
    ['','','','','','','','',''],
    ['','','','','','1','','','']
  ];

  const [grid, setGrid] = useState(easyPuzzle);
  const [originalGrid, setOriginalGrid] = useState(easyPuzzle);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isOriginalCell = (row, col) => originalGrid[row][col] !== '';

  const handleCellChange = (row, col, value) => {
    if (value === '' || (value >= '1' && value <= '9')) {
      const newGrid = grid.map((r, rIndex) =>
        r.map((c, cIndex) => (rIndex === row && cIndex === col ? value : c))
      );
      setGrid(newGrid);
    }
  };

  const isValidMove = (grid, row, col, num) => {
    for (let x = 0; x < 9; x++) if (grid[row][x] === num || grid[x][col] === num) return false;
    const startRow = row - (row % 3), startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) if (grid[i + startRow][j + startCol] === num) return false;
    return true;
  };

  const solveSudoku = (grid) => {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        if (grid[row][col] === '') {
          for (let num = 1; num <= 9; num++) {
            const numStr = num.toString();
            if (isValidMove(grid, row, col, numStr)) {
              grid[row][col] = numStr;
              if (solveSudoku(grid)) return true;
              grid[row][col] = '';
            }
          }
          return false;
        }
      }
    }
    return true;
  };

  const solvePuzzle = async () => {
    const gridCopy = grid.map(row => [...row]);
    await new Promise(resolve => setTimeout(resolve, 300));
    if (solveSudoku(gridCopy)) {
      setGrid(gridCopy);
    }
  };

  const resetPuzzle = () => {
    setGrid(originalGrid.map(row => [...row]));
    setSecondsElapsed(0);
  };

  const changeBoard = (type) => {
    if (type === 'easy') {
      setGrid(easyPuzzle);
      setOriginalGrid(easyPuzzle);
    } else if (type === 'medium') {
      setGrid(mediumPuzzle);
      setOriginalGrid(mediumPuzzle);
    } else {
      setGrid(hardPuzzle);
      setOriginalGrid(hardPuzzle);
    }
    setSecondsElapsed(0);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-2">
      <div className="w-full max-w-md py-6">
        <div className="text-center mb-4">
          <h1 className="text-2xl font-bold text-violet-500 mb-1">Sudoku Solver</h1>
          <p className="text-sm">Place numbers 1-9 in the empty boxes</p>
          <p className="text-xs mt-1">⏱ {formatTime(secondsElapsed)}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button onClick={() => changeBoard('easy')} className="px-2 py-1 text-sm rounded bg-green-500 text-white">Easy</button>
          <button onClick={() => changeBoard('medium')} className="px-2 py-1 text-sm rounded bg-yellow-500 text-white">Medium</button>
          <button onClick={() => changeBoard('hard')} className="px-2 py-1 text-sm rounded bg-red-500 text-white">Hard</button>
          <button onClick={solvePuzzle} className="px-2 py-1 text-sm rounded bg-blue-600 text-white">Solve</button>
          <button onClick={resetPuzzle} className="px-2 py-1 text-sm rounded bg-gray-600 text-white">Reset</button>
        </div>

        <div className="flex justify-center">
          <table className="sudoku-table">
            <tbody>
              {grid.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, colIndex) => (
                    <td key={colIndex} className={`sudoku-cell ${isOriginalCell(rowIndex, colIndex) ? 'fixed-cell' : ''}`}>
                      <input
                        type="text"
                        maxLength="1"
                        value={cell}
                        onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        disabled={isOriginalCell(rowIndex, colIndex)}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SudokuSolver;
