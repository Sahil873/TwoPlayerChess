const express = require("express");
const ejs = require("ejs");
const socket = require("socket.io");
const http = require("http");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();

const server = http.createServer(app); // socket requires a http server so we link the express server with http
const io = socket(server); // everything that socket can do now io can do

const chess = new Chess(); // everything possible in chess rules etc
const players = {};
let currentPlayer = "w";

app.set("view engine", ejs);
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.render("index.ejs", { title: "Chess Game" });
});

io.on("connection", (uniqueSocket) => {
  //   console.log("socket connected");
  //   uniqueSocket.on("churan", () => {
  //     console.log("churan received");
  //     io.emit("churanPapdi"); // to all
  //   });
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

      const result = chess.move(move); // move the unit if move is valid else throw an err
      if (result) {
        currentPlayer = chess.turn(); // get whose turn it is
        const checkmated = chess.isCheckmate(chess.fen());
        if (checkmated) {
          io.emit("checkmate", currentPlayer);
        }
        io.emit("move", move); // emitted the valid move back to frontend
        io.emit("boardState", chess.fen()); // fen return the state of the board what is present where
      } else {
        console.error("Invalid move : ", result);
        uniqueSocket.emit("invalidMove", move); // sirf jisne move kiya usko bhenjo
      }
    } catch (err) {
      console.error(err);
      uniqueSocket.emit("invalidMoveCatch", move);
    }
  });
});

server.listen(3000, () => {
  console.log("Listening on port 3000");
});
