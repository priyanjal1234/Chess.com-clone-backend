import dotenv from "dotenv";
dotenv.config();

import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import db from "./db/index.js";

import gameModel from './models/game.model.js'

const app = express();

const server = http.createServer(app);

// Route Imports
import gameRouter from "./routes/game.router.js";
import ChessGame from "./utils/chess.game.js";

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    origin: "https://chess-com-clone-frontend.vercel.app",
    credentials: true,
  })
);

db();

const io = new Server(server, {
  cors: {
    origin: "https://chess-com-clone-frontend.vercel.app",
    credentials: true,
  },
});

app.use("/api/games", gameRouter);

let gameInstances = {};

io.on("connection", function (socket) {
  console.log(`Connected ${socket.id}`);

  socket.on("join-game", function ({ gameId }) {
    socket.join(gameId);

    if (!gameInstances[gameId]) {
      gameInstances[gameId] = new ChessGame();
    }

    const gameInstance = gameInstances[gameId];
    const assignedColor = gameInstance.addPlayer(socket.id);

    if (!assignedColor) {
      socket.emit("game-full", { message: "Game already has two players." });
      return;
    }

    socket.emit("color-assignment", { color: assignedColor });
    io.to(gameId).emit("game-state", gameInstance.getGameState());
  });

  socket.on("move", function ({ gameId, move }) {
    const gameInstance = gameInstances[gameId];
    if (gameInstance) {
      const result = gameInstance.makeMove(move, socket.id);

      if (result.error) {
        socket.emit("invalid-move", result.error);
      } else {
        io.to(gameId).emit("game-state", result.fen);
      }
    }
  });

  socket.on("disconnect", async function () {
    console.log(`Disconnected ${socket.id}`);
    // Check if the socket was in a game
    const gameId = socket.gameId;
    if (gameId) {
      try {
        
        await gameModel.findByIdAndDelete(gameId);
        console.log(`Game ${gameId} deleted from database.`);
      } catch (error) {
        console.error(`Error deleting game ${gameId} from database:`, error);
      }
     
      delete gameInstances[gameId];
     
      io.to(gameId).emit("game-ended", {
        message: "Game ended due to player disconnection.",
      });
    }
  });
});

const port = process.env.PORT || 4000;
server.listen(port, function () {
  console.log(`Server is running on port ${port}`);
});
