import Project from "../models/Project.js"; 
import mongoose from 'mongoose';
import Teams from "../models/teamModel.js";  

export const getAllProjects = async (req, res) => {
  try {
    const { sortBy, search } = req.query; // Added search parameter
    let sortCriteria = {};
    let searchCriteria = {}; // Initialize search criteria

    if (search) {
      searchCriteria = {
        $or: [
          { name: { $regex: search, $options: 'i' } }, // Assuming 'name' is a field in your Project model
          { description: { $regex: search, $options: 'i' } } // Add other fields as necessary
        ]
      };
    }

    if (sortBy == 'budget') {
      sortCriteria.budget = -1;
    } else if (sortBy == 'recent') {
      sortCriteria.start_time = -1;
    }

    const projects = await Project.find(searchCriteria) // Apply search criteria
      .sort(sortCriteria)
      .populate('client_id')
      .populate('feature')
      .populate('techStack')
      .populate('team_id');

    res.status(200).json(projects);
  } catch (error) {
    console.error(error);
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

export const getProjectsByClient = async (req, res) => {
  const { clientId } = req.params;
  try {
    const projects = await Project.find({ client_id: clientId });
    if (projects.length === 0) {
      return res.status(404).json({ message: 'No projects found for this client' });
    }
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Could not fetch projects', error: error.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.status(200).json(projects);
  } catch (error) {
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

export const getProjectByProjectId = async (req, res) => {
  const { id } = req.params; // Destructure the project ID from the request parameters
  try {
    const project = await Project.findById(id)
      .populate('client_id', 'name') // Populate related client details
      .populate('team_id','teamTitle')   // Populate team details
      .populate('feature', 'name')  // Populate features
      .populate('techStack', 'name'); // Populate tech stack

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server error. Could not fetch project.', error: error.message });
  }
};
