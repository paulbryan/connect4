import React, { useState } from 'react';
import './App.css';

const ROWS = 6;
const COLS = 7;
const EMPTY = null;
const PLAYER1 = 'red';
const PLAYER2 = 'yellow';

function App() {
  const [board, setBoard] = useState(createEmptyBoard());
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER1);
  const [winner, setWinner] = useState(null);
  const [winningCells, setWinningCells] = useState([]);

  function createEmptyBoard() {
    return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
  }

  function dropPiece(col) {
    if (winner) return;

    // Find the lowest empty row in the column
    let row = -1;
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === EMPTY) {
        row = r;
        break;
      }
    }

    if (row === -1) return; // Column is full

    // Create new board with the piece dropped
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    // Check for winner
    const result = checkWinner(newBoard, row, col, currentPlayer);
    if (result) {
      setWinner(currentPlayer);
      setWinningCells(result);
    } else {
      // Switch player
      setCurrentPlayer(currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1);
    }
  }

  function checkWinner(board, row, col, player) {
    // Check all four directions: horizontal, vertical, diagonal down-right, diagonal down-left
    const directions = [
      [[0, 1], [0, -1]],   // horizontal
      [[1, 0], [-1, 0]],   // vertical
      [[1, 1], [-1, -1]],  // diagonal down-right
      [[1, -1], [-1, 1]]   // diagonal down-left
    ];

    for (const direction of directions) {
      const cells = [[row, col]];
      
      // Check both directions
      for (const [dr, dc] of direction) {
        let r = row + dr;
        let c = col + dc;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player) {
          cells.push([r, c]);
          r += dr;
          c += dc;
        }
      }

      if (cells.length >= 4) {
        return cells;
      }
    }

    return null;
  }

  function resetGame() {
    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER1);
    setWinner(null);
    setWinningCells([]);
  }

  function isCellWinning(row, col) {
    return winningCells.some(([r, c]) => r === row && c === col);
  }

  return (
    <div className="App">
      <h1>Connect 4</h1>
      <div className="game-info">
        {winner ? (
          <h2>Winner: {winner === PLAYER1 ? 'Red' : 'Yellow'}!</h2>
        ) : (
          <h2>Current Player: {currentPlayer === PLAYER1 ? 'Red' : 'Yellow'}</h2>
        )}
      </div>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="board-row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className={`cell ${cell || ''} ${isCellWinning(rowIndex, colIndex) ? 'winning' : ''}`}
                onClick={() => dropPiece(colIndex)}
              >
                {cell && <div className={`piece ${cell}`}></div>}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button className="reset-button" onClick={resetGame}>New Game</button>
    </div>
  );
}

export default App;
