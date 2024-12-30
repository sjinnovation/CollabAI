import { axiosSecureInstance } from "./axios";

export const getAllProjects = async (sortBy='',search='') => {
  try {
    const response = await axiosSecureInstance.get('/api/projects',{params:{sortBy,search}});
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Fetch project by ID
export const getProjectById = async (id) => {
  try {
    const response = await axiosSecureInstance.get(`/api/projects/client/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project:', error);
    throw error;
  }
};
// Create a new project
export const createProject = async (projectData) => {
  try {
    const response = await axiosSecureInstance.post('/api/projects', projectData);
    return response.data;
  } catch (error) {
    console.error('Error creating project:', error);
    throw error;
  }
};
// Update an existing project
export const updateProject = async (id, projectData) => {
  try {
    const response = await axiosSecureInstance.put(`/api/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    console.error('Error updating project:', error);
    throw error;
  }
};
// Delete a project
export const deleteProject = async (id) => {
  try {
    const response = await axiosSecureInstance.delete(`/api/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting project:', error);
    throw error;
  }
};
// Fetch client information
export const getClientInfo = async (clientId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/clients/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client info:', error);
    handleApiError(error);
    throw error;
  }
};
// Fetch all projects for a specific client
export const getClientProjects = async (clientId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/projects/client/${clientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching client projects:', error);
    throw error;
  }
};
// Fetch total revenue and benefits for a client
export const getAllRevenueData = async () => {
  try {
    const response = await axiosSecureInstance.get('/api/revenue');
    return response.data.revenues;
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    throw error;
  }
};
export const getTechStackById = async (id) => {
  try {
    if (typeof id === 'object' && id !== null) {
      id = id._id || id.id; // Use _id or id property if available
    }
    const response = await axiosSecureInstance.get(`/api/techStacks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tech stack by ID:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};
// Handle API error details
export const getTeamById = async (id) => {
  try {
    const response = await axiosSecureInstance.get(`/api/teams/${id}`);
    return response.data.team;
  } catch (error) {
    console.error('Error fetching team:', error);
    throw error;
  }
};
export const getProjectTeamMembers = async (projectId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/project-team/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project team members:', error);
    throw error;
  }
};
export const getAllTeams = async () => {
  try {
    const response = await axiosSecureInstance.get('/api/teams');
    return response.data.teams;
  } catch (error) {
    console.error('Error fetching teams:', error);
    throw error;
  }
};
export const getTeamMembers = async (teamId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/teams/${teamId}/members`);
    return response.data.members;
  } catch (error) {
    console.error('Error fetching team members:', error);
    throw error;
  }
}
export const getProjectTeamMembersByTeam = async (teamId) => {
  try {
    const timestamp = new Date().getTime();
    const response = await axiosSecureInstance.get(`/api/project-team/team/${teamId}?_=${timestamp}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project team members:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};
export const getAllUsers = async () => {
  try {
    const response = await axiosSecureInstance.get('/api/user/get-all-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching all users:', error);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};
export const getUsersByTeamId = async (teamId) => {
  try {
    const [usersResponse, projectTeamsResponse] = await Promise.all([
      getAllUsers(),
      getAllProjectTeams()
    ]);
    const allUsers = usersResponse.user;
    const allProjectTeams = projectTeamsResponse;
    if (!Array.isArray(allUsers)) {
      throw new TypeError('Expected allUsers to be an array');
    }
    const teamUsers = allUsers.filter(user => user.teamId === teamId);
    const usersWithRoles = teamUsers.map(user => {
      const userProjects = allProjectTeams.filter(pt => pt.user_id === user._id && pt.team_id === teamId);
      const roles = userProjects.map(up => up.role_in_project);
      return { ...user, roles_in_project: roles };
    })
    return usersWithRoles;
  } catch (error) {
    console.error('Error fetching users by team ID:', error);
    throw error;
  }
};
export const fetchProjectById = async (projectId) => {
  try {
    const response = await axiosSecureInstance.get(`/api/projects/project/${projectId}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null; // Return null to handle potential issues gracefully
  }
};
export const getAllProjectTeams = async () => {
  try {
    const response = await axiosSecureInstance.get('/api/project-team/all');
    return response.data;
  } catch (error) {
    console.error('Error fetching all project teams:', error);
    throw error;
  }
};
export const getProjectsByTeam = async (teamId) => {
  try {
    const allProjectTeams = await getAllProjectTeams();
    const teamProjects = allProjectTeams.filter(pt => pt.team_id === teamId);
    if (teamProjects.length === 0) {
      return [];
    }
    const projectIds = teamProjects.map(tp => tp.project_id);

    const projectPromises = projectIds.map(id => fetchProjectById(id));
    const projects = await Promise.all(projectPromises);
    const validProjects = projects.filter(project => project !== null);
    // Remove duplicates by project id
  //  const uniqueProjects = Array.from(
     // new Map(validProjects.map(project => [project.id, project])).values()
   // );
   //console.log('Unique projects:', uniqueProjects);
    return validProjects;
  } catch (error) {
    console.error('Error fetching projects by team ID:', error);
    throw error;
  }
};
const handleApiError = (error) => {
  if (error.response) {
    // The request was made and the server responded with a status code that falls out of the range of 2xx
    console.error('Response data:', error.response.data);
    console.error('Response status:', error.response.status);
    console.error('Response headers:', error.response.headers);
  } else if (error.request) {
    // The request was made but no response was received
    console.error('No response received:', error.request);
  } else {
    // Something happened in setting up the request that triggered an Error
    console.error('Error setting up request:', error.message);
  }
};


export const searchByAllFields = async (searchTerm='') => {
  try {
    const response = await axiosSecureInstance.get('/api/projects/search', {
      params: { searchTerm }
    });
    // const response = await axiosSecureInstance.get('/api/projects/search');
    return response.data;
  } catch (error) {
    console.error('Frontend: Error searching by all fields:', error);
    throw error;
  }
}