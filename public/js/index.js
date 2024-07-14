const socket = io();
// socket.emit("churan");

// socket.on("churanPapdi", () => {
//   console.log("churan papdi received");
// });

const chess = new Chess();
const boardElement = document.querySelector(".chessboard");

let draggedPiece = null;
let sourceSquare = null;
let playerRole = null;

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
        piece.innerText = getPieceUnicode(col); // from unicode
        piece.draggable = playerRole === col.color;

        piece.addEventListener("dragstart", (e) => {
          if (piece.draggable) {
            draggedPiece = piece;
            sourceSquare = { row: rowIndex, col: colIndex };
            e.dataTransfer.setData("text/plain", ""); // necessity to not face any issue while dragging
          }
        });

        piece.addEventListener("dragend", (e) => {
          draggedPiece = null;
          sourceSquare = null;
        });

        square.appendChild(piece);
      }

      square.addEventListener("dragover", (e) => {
        e.preventDefault();
      });

      square.addEventListener("drop", (e) => {
        e.preventDefault();
        if (draggedPiece) {
          const targetSquare = {
            row: parseInt(square.dataset.row),
            col: parseInt(square.dataset.col),
          };
          const isMoveValid = handleMove(sourceSquare, targetSquare);
        }
      });
      boardElement.appendChild(square);
    });
  });

  if (playerRole === "b") {
    boardElement.classList.add("flipped");
  } else {
    boardElement.classList.remove("flipped");
  }
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

socket.on("spectatorRole", () => {
  renderBoard();
});

socket.on("boardState", (fen) => {
  chess.load(fen);
  renderBoard();
});

socket.on("move", (move) => {
  chess.move(move);
  renderBoard();
});

socket.on("checkmate", (player) => {
  alert(player + " is Checkmate");
});

renderBoard();
