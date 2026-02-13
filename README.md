# Connect 4

A classic Connect 4 game built with React.

## Features

- 6x7 game board (traditional Connect 4 dimensions)
- Two-player gameplay (Red vs Yellow)
- Drop pieces by clicking on columns
- Automatic win detection (horizontal, vertical, and diagonal)
- Winning pieces highlighted with animation
- Reset/New Game functionality
- Beautiful gradient background and smooth animations

## How to Play

1. Players take turns dropping colored pieces into the columns
2. The piece falls to the lowest available position in that column
3. The first player to get 4 of their pieces in a row (horizontally, vertically, or diagonally) wins
4. Click "New Game" to start over

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start
```

The game will open in your browser at `http://localhost:3000`

### Building for Production

```bash
# Create an optimized production build
npm run build
```

## Game Rules

- Red player goes first
- Players alternate turns
- A column can hold a maximum of 6 pieces
- The game ends when a player connects 4 pieces in a row
- Click on any column to drop your piece

## Technologies Used

- React 19
- CSS3 (with animations)
- Create React App

## License

MIT
