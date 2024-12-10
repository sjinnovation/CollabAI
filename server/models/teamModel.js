import mongoose from "mongoose";



const teamSchema = mongoose.Schema(
  {
    teamTitle: {
      type: String,
      required: true,
  },
    hasAssistantCreationAccess:{
      type:Boolean,
      default:false
    },
    isDeleted: { 
      type: Boolean, 
      default: false 
    }
  },
  {
    teamDescriptions:{
      type: String,
      required: true
    }
  },
  
  { timestamps: true }
);

const Teams = mongoose.model("Teams", teamSchema);

export default Teams;
