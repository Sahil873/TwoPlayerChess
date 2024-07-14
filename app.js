const express = require("express");
const ejs = require("ejs");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config();
const PORT = process.env.PORT || 3000;

const app = express();

const server = http.createServer(app);
const io = socket(server);

const chess = new Chess();
const players = {};
let currentPlayer = "w";

app.set("view engine", ejs);
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index.ejs", { title: "Chess Game" });
});

io.on("connection", (uniqueSocket) => {
  console.log("connected");

  if (!players.white) {
    players.white = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = uniqueSocket.id;
    uniqueSocket.emit("playerRole", "b");
  } else {
    uniqueSocket.emit("spectatorRole");
  }

  uniqueSocket.on("disconnect", () => {
    if (uniqueSocket.id === players.white) {
      delete players.white;
    } else if (uniqueSocket.id === players.black) {
      delete players.black;
    }
  });

  uniqueSocket.on("move", (move) => {
    try {
      if (chess.turn() === "w" && uniqueSocket.id !== players.white) return;
      if (chess.turn() === "b" && uniqueSocket.id !== players.black) return;

      const result = chess.move(move);
      if (result) {
        currentPlayer = chess.turn();
        const checkmated = chess.isCheckmate(chess.fen());
        if (checkmated) {
          io.emit("checkmate", currentPlayer);
        }
        io.emit("move", move);
        io.emit("boardState", chess.fen());
      } else {
        console.error("Invalid move : ", result);
        uniqueSocket.emit("invalidMove", move);
      }
    } catch (err) {
      console.error(err);
      uniqueSocket.emit("invalidMoveCatch", move);
    }
  });
});

server.listen(PORT);
