# Connect 4

A classic Connect 4 game built with React.

## Features

- 6x7 game board (traditional Connect 4 dimensions)
- **Two game modes:**
  - **Player vs Player** - Play against a friend locally
  - **Player vs Computer** - Play against an AI opponent
- Drop pieces by clicking on columns
- Automatic win detection (horizontal, vertical, and diagonal)
- **Draw/tie detection** when board is full with no winner
- Winning pieces highlighted with animation
- Reset/New Game functionality
- Change game mode during play
- Beautiful gradient background and smooth animations
- Smart computer AI that tries to win and block opponent

## How to Play

1. **Select Game Mode** - Choose to play against another player or the computer
2. Players take turns dropping colored pieces into the columns (You are Red, opponent/computer is Yellow)
3. The piece falls to the lowest available position in that column
4. The first player to get 4 of their pieces in a row (horizontally, vertically, or diagonally) wins
5. If all 42 spaces are filled with no winner, the game is a draw
6. Click "New Game" to restart or "Change Mode" to switch between player vs player and player vs computer

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

The game will open in your browser at `http://localhost:5173`

### Building for Production

```bash
# Create an optimized production build
npm run build
```

## Game Rules

- Red player (human) always goes first
- Players alternate turns
- A column can hold a maximum of 6 pieces
- The game ends when:
  - A player connects 4 pieces in a row (wins), or
  - All 42 spaces are filled with no winner (draw/tie)
- Click on any column to drop your piece
- In computer mode, the AI will automatically make its move after you

## Technologies Used

- React 19
- Vite
- CSS3 (with animations)

## License

MIT
