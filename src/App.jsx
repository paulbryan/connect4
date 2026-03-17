import React, { useState, useRef } from 'react';
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
  const [isDraw, setIsDraw] = useState(false);
  const [gameMode, setGameMode] = useState(null); // null = mode selection, 'player' = vs player, 'computer' = vs computer
  const [isComputerThinking, setIsComputerThinking] = useState(false);
  const computerTimeoutRef = useRef(null);

  function createEmptyBoard() {
    return Array(ROWS).fill(null).map(() => Array(COLS).fill(EMPTY));
  }

  function dropPiece(col) {
    if (winner || isDraw) return;

    // In computer mode, only allow human player to make moves
    if (gameMode === 'computer' && currentPlayer === PLAYER2) return;

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
      setIsComputerThinking(false);
    } else if (isBoardFull(newBoard)) {
      // Check for draw
      setIsDraw(true);
      setIsComputerThinking(false);
    } else {
      // Switch player
      const nextPlayer = currentPlayer === PLAYER1 ? PLAYER2 : PLAYER1;
      setCurrentPlayer(nextPlayer);

      // If playing against computer and it's computer's turn
      if (gameMode === 'computer' && nextPlayer === PLAYER2) {
        setIsComputerThinking(true);
        computerTimeoutRef.current = setTimeout(() => {
          makeComputerMove(newBoard);
        }, 500); // Slight delay to make it feel more natural
      }
    }
  }

  function isBoardFull(board) {
    return board[0].every(cell => cell !== EMPTY);
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

  function getAvailableColumns(board) {
    const available = [];
    for (let col = 0; col < COLS; col++) {
      if (board[0][col] === EMPTY) {
        available.push(col);
      }
    }
    return available;
  }

  function findLowestRow(board, col) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (board[r][col] === EMPTY) {
        return r;
      }
    }
    return -1;
  }

  function countSequence(board, row, col, player, dr, dc, length) {
    // Count consecutive pieces in a direction
    let count = 0;
    let r = row;
    let c = col;
    while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === player && count < length) {
      count++;
      r += dr;
      c += dc;
    }
    return count;
  }

  function evaluatePosition(board, row, col, player) {
    // Evaluate how good a position is for creating threats
    let score = 0;
    const directions = [
      [0, 1],   // horizontal
      [1, 0],   // vertical
      [1, 1],   // diagonal down-right
      [1, -1]   // diagonal down-left
    ];

    for (const [dr, dc] of directions) {
      // Count pieces in both directions
      const forward = countSequence(board, row + dr, col + dc, player, dr, dc, 3);
      const backward = countSequence(board, row - dr, col - dc, player, -dr, -dc, 3);
      const total = forward + backward;

      // Score based on how many in a row (including this position)
      // total is the count of adjacent pieces, +1 for this position
      if (total >= 2) score += 100; // Creates 3+ in a row with this move
      else if (total === 1) score += 10; // Creates 2 in a row with this move
      else if (total === 0) score += 1; // Single piece
    }

    return score;
  }

  function scoreMove(board, col, player, opponent) {
    const row = findLowestRow(board, col);
    if (row === -1) return -10000; // Invalid move

    const testBoard = board.map(r => [...r]);
    testBoard[row][col] = player;

    let score = 0;

    // 1. Winning move - highest priority
    if (checkWinner(testBoard, row, col, player)) {
      return 100000;
    }

    // 2. Check if opponent can win next turn (after this move)
    const opponentBoard = testBoard.map(r => [...r]);
    for (let c = 0; c < COLS; c++) {
      const opponentRow = findLowestRow(opponentBoard, c);
      if (opponentRow !== -1) {
        const testOppBoard = opponentBoard.map(r => [...r]);
        testOppBoard[opponentRow][c] = opponent;
        if (checkWinner(testOppBoard, opponentRow, c, opponent)) {
          // This move allows opponent to win next turn - very bad
          score -= 50000;
        }
      }
    }

    // 3. Block opponent's immediate winning move
    const blockBoard = board.map(r => [...r]);
    blockBoard[row][col] = opponent;
    if (checkWinner(blockBoard, row, col, opponent)) {
      score += 50000; // Must block
    }

    // 4. Evaluate offensive potential (creating threats)
    score += evaluatePosition(testBoard, row, col, player) * 100;

    // 5. Evaluate defensive consideration (blocking opponent threats)
    // Use testBoard to see how this move affects opponent's potential
    score += evaluatePosition(testBoard, row, col, opponent) * 50;

    // 6. Position value - prefer center columns
    const distanceFromCenter = Math.abs(col - Math.floor(COLS / 2));
    score += (4 - distanceFromCenter) * 10;

    // 7. Prefer lower rows (building foundation)
    score += (ROWS - row) * 2;

    // 8. Avoid edges early in game
    const piecesOnBoard = board.flat().filter(cell => cell !== EMPTY).length;
    if (piecesOnBoard < 8 && (col === 0 || col === COLS - 1)) {
      score -= 20;
    }

    return score;
  }

  function makeComputerMove(board) {
    const availableCols = getAvailableColumns(board);
    if (availableCols.length === 0) {
      setIsComputerThinking(false);
      return;
    }

    // Score all available moves
    let bestScore = -Infinity;
    let bestCols = [];

    for (const col of availableCols) {
      const score = scoreMove(board, col, PLAYER2, PLAYER1);

      if (score > bestScore) {
        bestScore = score;
        bestCols = [col];
      } else if (score === bestScore) {
        bestCols.push(col);
      }
    }

    // If multiple moves have the same best score, pick randomly among them
    const bestCol = bestCols[Math.floor(Math.random() * bestCols.length)];

    // Make the move
    const row = findLowestRow(board, bestCol);
    if (row !== -1) {
      const newBoard = board.map(r => [...r]);
      newBoard[row][bestCol] = PLAYER2;
      setBoard(newBoard);

      const result = checkWinner(newBoard, row, bestCol, PLAYER2);
      if (result) {
        setWinner(PLAYER2);
        setWinningCells(result);
        setIsComputerThinking(false);
      } else if (isBoardFull(newBoard)) {
        setIsDraw(true);
        setIsComputerThinking(false);
      } else {
        setCurrentPlayer(PLAYER1);
        setIsComputerThinking(false);
      }
    } else {
      setIsComputerThinking(false);
    }
  }

  function resetGame() {
    // Clear any pending computer move
    if (computerTimeoutRef.current) {
      clearTimeout(computerTimeoutRef.current);
      computerTimeoutRef.current = null;
    }

    setBoard(createEmptyBoard());
    setCurrentPlayer(PLAYER1);
    setWinner(null);
    setWinningCells([]);
    setIsDraw(false);
    setIsComputerThinking(false);
  }

  function selectGameMode(mode) {
    setGameMode(mode);
    resetGame();
  }

  function backToMenu() {
    // Clear any pending computer move
    if (computerTimeoutRef.current) {
      clearTimeout(computerTimeoutRef.current);
      computerTimeoutRef.current = null;
    }

    setGameMode(null);
    resetGame();
  }

  function isCellWinning(row, col) {
    return winningCells.some(([r, c]) => r === row && c === col);
  }

  if (gameMode === null) {
    return (
      <div className="App">
        <h1>Connect 4</h1>
        <div className="menu">
          <h2>Select Game Mode</h2>
          <button className="mode-button" onClick={() => selectGameMode('player')}>
            Play vs Player
          </button>
          <button className="mode-button" onClick={() => selectGameMode('computer')}>
            Play vs Computer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>Connect 4</h1>
      <div className="game-info">
        {winner ? (
          <h2>Winner: {winner === PLAYER1 ? 'Red' : 'Yellow'}!</h2>
        ) : isDraw ? (
          <h2>It's a Draw!</h2>
        ) : isComputerThinking ? (
          <h2>Computer is thinking...</h2>
        ) : (
          <h2>Current Player: {currentPlayer === PLAYER1 ? 'Red' : 'Yellow'}</h2>
        )}
        <p className="game-mode-label">
          {gameMode === 'computer' ? 'Playing vs Computer' : 'Playing vs Player'}
        </p>
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
      <div className="button-group">
        <button className="reset-button" onClick={resetGame}>New Game</button>
        <button className="menu-button" onClick={backToMenu}>Change Mode</button>
      </div>
    </div>
  );
}

export default App;
