import { Chess } from "chess.js";

class ChessGame {
  constructor() {
    this.game = new Chess();
    this.players = { white: null, black: null };
  }

  addPlayer(socketId) {
    if (!this.players.white) {
      this.players.white = socketId;
      return "white";
    }
    if (!this.players.black) {
      this.players.black = socketId;
      return "black";
    }

    return null;
  }

  makeMove(move, socketId) {
    const turn = this.game.turn();
    const requiredPlayer = turn === "w" ? "white" : "black";
    if (this.players[requiredPlayer] !== socketId) {
      return { error: "Not Your Turn" };
    }

    const result = this.game.move(move);
    if (!result) {
      return { error: "Invalid Move" };
    }

    return { fen: this.game.fen() };
  }

  getGameState() {
    return this.game.fen();
  }
}

export default ChessGame;
