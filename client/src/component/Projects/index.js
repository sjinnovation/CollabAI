import React from 'react';
import ProjectCard from '../ProjectCard';
// import ProjectCard from '../ClientInfo/ProjectCard.jsx'
import { useNavigate } from 'react-router-dom';
import './style.css';

const Projects = ({ viewType, projects }) => {
  const navigate = useNavigate();

  // Function to handle project click
  const handleProjectClick = (id) => {
    console.log('Navigating to project:', id);
    navigate(`/platform-management-feature/projectdetails/${id}`);
  };

  return (
    <div className={`projects-area ${viewType}`}>
      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectCard
            key={project.id || project._id} // Fallback to _id if id is not present
            project={project}
            onClick={() => handleProjectClick(project.id || project._id)} // Fallback to _id
          />
        ))
      ) : (
        <p className="no-projects-message" >No projects available.</p>
      )}
    </div>
  );
};

export default Projects;
