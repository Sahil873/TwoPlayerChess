const express = require("express");
const ejs = require("ejs");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
const players = {};
let currentPlayer = "w";

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index", { title: "Chess Game" });
});

io.on("connection", (uniqueSocket) => {
  if (!players.white) {
    players.white = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "b");
  } else {
    uniqueSocket.emit("spectatorRole");
  }

  uniqueSocket.on("message", (data) => {
    io.emit("received-message", { ...data });
  });

  uniqueSocket.on("disconnect", () => {
    if (uniqueSocket.id === players.white) delete players.white;
    else if (uniqueSocket.id === players.black) delete players.black;
  });

  uniqueSocket.on("move", (move) => {
    try {
      if (chess.turn() === "w" && uniqueSocket.id !== players.white) return;
      if (chess.turn() === "b" && uniqueSocket.id !== players.black) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        if (result.captured)
          io.emit("capture", {
            color: result.color,
            captured: result.captured,
          });

        io.emit("move", move);
        io.emit("boardState", chess.fen());

        // Check for checkmate, stalemate, and draw conditions
        if (chess.isCheckmate()) {
          io.emit("gameOver", {
            winner: result.color === "w" ? "White" : "Black",
            reason: "Checkmate",
          });
        } else if (chess.isStalemate()) {
          io.emit("gameOver", { winner: null, reason: "Stalemate" });
        } else if (chess.isDraw()) {
          io.emit("gameOver", { winner: null, reason: "Draw" });
        } else if (chess.isThreefoldRepetition()) {
          io.emit("gameOver", { winner: null, reason: "Threefold Repetition" });
        } else if (chess.isInsufficientMaterial()) {
          io.emit("gameOver", {
            winner: null,
            reason: "Insufficient Material",
          });
        }
      } else {
        uniqueSocket.emit("invalidMove", move);
      }
    } catch (err) {
      uniqueSocket.emit("invalidMoveCatch", move);
    }
  });
});

server.listen(3000);
