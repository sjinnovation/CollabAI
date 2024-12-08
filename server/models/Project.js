import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  techStack: { type: [String], required: true },
  imageUrl: { type: String, required: true },
  podName: { type: String, required: true },
  github: { type: String, required: true },
  live: { type: String, required: true },
});

const Project = mongoose.model("Project", ProjectSchema);

export default Project; // Use `export default` to make it compatible with ES modules
