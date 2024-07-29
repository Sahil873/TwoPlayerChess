const socket = io();
const chess = new Chess();
const boardElement = document.querySelector(".chessboard");
const tray = document.getElementById("tray");
const whiteTray = document.getElementById("whiteTray");
const blackTray = document.getElementById("blackTray");
const messageBox = document.getElementById("message-box");
const inputMessage = document.getElementById("message-input");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

// Prevent refresh and warn the user
window.addEventListener("beforeunload", (event) => {
  event.preventDefault();
  event.returnValue =
    "Your game progress will be lost if you leave this page. Are you sure you want to leave?";
  return "Your game progress will be lost if you leave this page. Are you sure you want to leave?";
});

// Prevent refresh through F5 and Ctrl+R
window.addEventListener("keydown", function (e) {
  if ((e.key === "r" && (e.ctrlKey || e.metaKey)) || e.key === "F5") {
    e.preventDefault();
  }
});

const sendMessage = () => {
  const message = inputMessage.value.trim();
  if (message) {
    socket.emit("message", { playerRole, message: inputMessage.value });
    inputMessage.value = "";
    inputMessage.focus();
  }
};

const renderBoard = () => {
  const board = chess.board();
  boardElement.innerHTML = "";

  board.forEach((row, rowIndex) => {
    row.forEach((col, colIndex) => {
      const square = document.createElement("div");
      square.classList.add(
        "square",
        (rowIndex + colIndex) % 2 === 0 ? "light" : "dark"
      );
      square.dataset.row = rowIndex;
      square.dataset.col = colIndex;

      if (col) {
        const piece = document.createElement("div");
        piece.classList.add("piece", col.color === "w" ? "white" : "black");
        piece.innerText = getPieceUnicode(col);
        piece.draggable = playerRole === col.color;

        piece.addEventListener("dragstart", (e) => {
          if (piece.draggable) {
            draggedPiece = piece;
            sourceSquare = { row: rowIndex, col: colIndex };
            e.dataTransfer.setData("text/plain", "");
          }
        });

        piece.addEventListener("dragend", () => {
          draggedPiece = null;
          sourceSquare = null;
        });

        square.appendChild(piece);
      }

      square.addEventListener("dragover", (e) => e.preventDefault());

      square.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(square.dataset.row),
            col: parseInt(square.dataset.col),
          };
          handleMove(sourceSquare, targetSquare);
        }
      });

      boardElement.appendChild(square);
    });
  });

  const isFlipped = playerRole === "b";
  boardElement.classList.toggle("flipped", isFlipped);
  tray.classList.toggle("trayflipped", isFlipped);
  whiteTray.classList.toggle("trayflipped", isFlipped);
  blackTray.classList.toggle("trayflipped", isFlipped);
};

const handleMove = (sourceSquare, targetSquare) => {
  const move = {
    from: `${String.fromCharCode(97 + sourceSquare.col)}${
      8 - sourceSquare.row
    }`,
    to: `${String.fromCharCode(97 + targetSquare.col)}${8 - targetSquare.row}`,
    promotion: "q",
  };

  socket.emit("move", move);
};

const getPieceUnicode = (piece) => {
  const code = {
    p: "♙",
    r: "♖",
    n: "♘",
    b: "♗",
    q: "♕",
    k: "♔",
    P: "♟",
    R: "♜",
    N: "♞",
    B: "♝",
    Q: "♛",
    K: "♚",
  };
  return code[piece.type] || "";
};

socket.on("playerRole", (role) => {
  playerRole = role;
  renderBoard();
});

socket.on("spectatorRole", renderBoard);

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("gameOver", (data) => {
  const winnerMessage = data.winner ? `Winner: ${data.winner}` : "No winner";
  alert(`${winnerMessage}, Reason: ${data.reason}`);
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

socket.on("capture", ({ color, captured }) => {
  const capturedPiece = getPieceUnicode({ type: captured });
  const span = document.createElement("span");
  span.classList.add("piece", "captured", color === "w" ? "black" : "white");
  span.innerText = capturedPiece;

  (color === "w" ? whiteTray : blackTray).appendChild(span);
});

socket.on("received-message", (data) => {
  let message = document.createElement("p");
  message.innerText = data.message.toUpperCase();
  message.classList.add(
    "chat",
    data.playerRole === "w" ? "text-white" : "text-black"
  );
  messageBox.append(message);
  messageBox.scrollTop = messageBox.scrollHeight;
});

renderBoard();
