import mongoose from "mongoose";

const CommandsCategorySchema = new mongoose.Schema(
  {
    commandsCategoryName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

const CommandsCategory = mongoose.model(
  "CommandsCategory",
  CommandsCategorySchema
);

export default CommandsCategory;
