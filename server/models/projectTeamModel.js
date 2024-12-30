import mongoose from "mongoose";

const ProjectTeamSchema = new mongoose.Schema(
  {
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    role_in_project: { type: String, required: true }, 
    team_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Team' }, 
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  }
);

const ProjectTeam = mongoose.model("ProjectTeam", ProjectTeamSchema);

export default ProjectTeam;
