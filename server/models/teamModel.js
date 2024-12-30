import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
  {
    teamTitle: {
      type: String,
      required: true,
    },
    teamDescriptions: {
      type: String,
      required: true,
    },
    hasAssistantCreationAccess: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true } // Correctly specifying schema options
);

const Teams = mongoose.model("Teams", teamSchema);

export default Teams;
