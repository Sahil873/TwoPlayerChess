# Chess Game Web Application

Welcome to the Chess Game Web Application! This project is a feature-rich, interactive chess game that you can play directly in your web browser. The application includes features such as real-time move validation, capturing of pieces, role assignment (White, Black, Spectator), and handling of game over conditions including checkmate, stalemate, draw, and more. The game also prevents accidental page refreshes to ensure a smooth gaming experience.

## Features

- **Real-time Chess Moves**: Make moves on the chessboard and see the updates in real-time.
- **Piece Capture Display**: Captured pieces are displayed in their respective trays.
- **Role Assignment**: Automatically assigns roles to players (White, Black, Spectator).
- **Game Over Conditions**: Handles checkmate, stalemate, draw, threefold repetition, and insufficient material.
- **Prevent Accidental Refresh**: Alerts users when they attempt to leave or refresh the page, preventing loss of game progress.

## Technologies Used

- **Frontend**
  - HTML5 (EJS)
  - CSS3 (Tailwind CSS)
  - Javascript (Chess.js for game logic)
- **Backend**
  - Node.js
  - Express.js
  - Socket.io for realtime communication

## Installation

    1. Clone the repository
    ```cmd
        git clone https://github.com/Sahil873/TwoPlayerChess.git
        cd TwoPlayerChess
    ```
    2. Install Dependencies
    ```cmd
    npm install
    ```
    3. Run the application
    ```cmd
    npm run dev
    ```

## Usage

- **Join as a Player** : The first two users to connect will be assigned the roles of White and Black respectively.
- **Spectate the Game**: Additional users will be assigned the role of Spectator and can watch the game.
- ** Make Moves** : Drag and drop pieces to make moves. Valid moves will be broadcasted to all users.
- ** Chat** : Use the chat box to communicate with other players and spectators.
- ** Game Over** : Alerts will be shown for game over conditions.
