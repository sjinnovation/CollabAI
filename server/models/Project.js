import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  start_time:{ type:Date,required: true},
  end_time:{ type:Date, required: true},
  budget: { type: Number,required: true },
  hr_taken: { type:Number},
  client_id:{type:mongoose.Schema.Types.ObjectId,ref:'Client',required: true},
  techStack: [{ type:mongoose.Schema.Types.ObjectId,ref:'TechStack'}],
  links:{
    links:{type:String},
    github:{type:String},
  },
  image_link:{type:String}
});

const Project = mongoose.model("Project", ProjectSchema);

export default Project; // Use `export default` to make it compatible with ES modules
