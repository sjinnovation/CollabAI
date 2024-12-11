import Project from "../models/Project.js"; 
import tech_stack from "../models/tech_stack.js"

import mongoose from 'mongoose'; 

export const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

export const getProjectById = async (req, res) => {
  const { clientId } = req.params;
  try {
    const projects = await Project.find({ client_id: clientId })
      .populate('client_id', 'name')
      .populate('team_id', 'name')
      .populate('feature', 'name')
      .populate('techStack', 'name');

    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects found for this client' });
    }
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Could not fetch projects', error: error.message });
  }
};

export const createProject = async (req, res) => {
  try {
    const newProject = new Project(req.body);
    const savedProject = await newProject.save();
    res.status(201).json(savedProject);
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};

export const updateProject = async (req, res) => {
  try {
    const updatedProject = await Project.findOneAndUpdate(
      { _id: req.params.id },
      req.body,
      { new: true }
    );
    if (!updatedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const deletedProject = await Project.findOneAndDelete({ _id: req.params.id });
    if (!deletedProject) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.status(200).json({ message: "Project deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
};

export const getProjectsByTeam = async (req, res) => {
  const { teamId } = req.params;

  try {
    const projects = await Project.find({ team_id: mongoose.Types.ObjectId(teamId) })
    .populate('team_id', 'name');  

    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects found for this team.' });
    }

    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Could not fetch projects.' });
  }
};

export const getProjectsByClient = async (req,res)=>
{
  const {clientId}=req.params;
  try{
    const projects=await Project.find({client_id:clientId});
    if(projects.length===0)
    {
      return res.status(404).json({message:'No projects found for this team'});
    }
    res.status(200).json(projects);
  }
  catch(error)
  {
    res.status(500).json({message:'Server error. Could not fetch projects'});
  }
};

