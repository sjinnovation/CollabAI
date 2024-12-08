export const getProjectStatus = (status) => {
    const statusMap = {
      'In Progress': 'bg-yellow-200 text-yellow-800',
      'Completed': 'bg-green-200 text-green-800',
      'Pending': 'bg-red-200 text-red-800',
    };
    return statusMap[status] || 'bg-gray-200 text-gray-800';
  };
  
  export const formatTechStack = (techStack) => {
    return techStack.join(', ');
  };
  
  