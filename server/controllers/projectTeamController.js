import ProjectTeam from '../models/projectTeamModel.js';
import Project from '../models/Project.js';

export const getProjectTeamMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const teamMembers = await ProjectTeam.find({ project_id: projectId }).populate('user_id', 'fname lname status');
    res.status(200).json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project team members", error });
  }
};

export const getProjectTeamMembersByTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const teamMembers = await ProjectTeam.find({ team_id: teamId }).populate('user_id', 'fname lname status');
    res.status(200).json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project team members by team", error });
  }
};

export const getProjectsByTeamId = async (req, res) => {
  try {
    const { teamId } = req.params;

    // Fetch project IDs associated with the given team ID
    const projectTeamEntries = await ProjectTeam.find({ team_id: teamId });
    const projectIds = projectTeamEntries.map(entry => entry.project_id);

    // Fetch project details based on the IDs
    const projects = await Project.find({ _id: { $in: projectIds } });

    res.status(200).json(projects);
  } catch (error) {
    console.error("Error fetching projects by team ID:", error);
    res.status(500).json({ message: "Error fetching projects by team ID", error });
  }
};

// New function to get all project teams
export const getAllProjectTeams = async (req, res) => {
  try {
    const allProjectTeams = await ProjectTeam.find()
    res.status(200).json(allProjectTeams);
  } catch (error) {
    console.error("Error fetching all project teams:", error);
    res.status(500).json({ message: "Error fetching all project teams", error });
  }
};
