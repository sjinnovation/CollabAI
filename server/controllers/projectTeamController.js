import ProjectTeam from '../models/projectTeamModel.js';

export const getProjectTeamMembers = async (req, res) => {
  try {
    const { projectId } = req.params;
    const teamMembers = await ProjectTeam.find({ project_id: projectId }).populate('user_id', 'fname lname');
    res.status(200).json(teamMembers);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project team members", error });
  }
};

