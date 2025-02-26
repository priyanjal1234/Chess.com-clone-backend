import mongoose from "mongoose";

const gameSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
    },
    players: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const gameModel = mongoose.model("game", gameSchema);

export default gameModel;
