import mongoose from "mongoose";

const TaskCommandsSchema = new mongoose.Schema(
  {
    commands: {
      label: {
        type: String,
        required: true,
      },
      icon: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
    },
    commandsCategoryName: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "CommandsCategory",
    },
  },
  { timestamps: true }
);

const TaskCommands = mongoose.model("TaskCommands", TaskCommandsSchema);

export default TaskCommands;
