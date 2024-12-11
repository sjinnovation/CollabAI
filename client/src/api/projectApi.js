import { axiosSecureInstance } from "./axios";

// Fetch all projects
export const getAllProjects = async () => {
  try {
    const response = await axiosSecureInstance.get('/api/projects');
    return response.data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
};

// Fetch project by ID
export const getProjectById = async (id) => {
  try {
    const response = await axiosSecureInstance.get(`/api/projects/${id}`);
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
    const response = await axiosSecureInstance.get(`/api/techStacks/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching tech stack by ID:', error);
    handleApiError(error);
    throw error;
  }
};
// Handle API error details
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
