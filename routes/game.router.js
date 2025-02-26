import express from "express";
import gameModel from "../models/game.model.js";
const router = express.Router();

router.post("/create-game", async function (req, res) {
  try {
    let { name } = req.body;
    if (!name) return res.status(400).json({ message: "Name is required" });

    let game = await gameModel.create({
      name,
      players: 1,
    });
    return res.status(201).json(game);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Error creating game",
    });
  }
});

router.get("/running-games", async function (req, res) {
  try {
    let games = await gameModel.find({ players: 1 });
    if (Array.isArray(games) && games.length === 0)
      return res.status(404).json({ message: "No Games" });
    return res.status(200).json(games);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Error fetching games",
    });
  }
});

router.put("/join-game/:gameId", async function (req, res) {
  try {
    let { gameId } = req.params;
    let game = await gameModel.findOne({ _id: gameId });
    if (!game)
      return res.status(404).json({ message: "Game with this id not found" });
    game.players = 2;
    await game.save();
    return res.status(200).json({ message: "Joined in Game Successfully" });
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : "Error Joining Game",
    });
  }
});

export default router;
