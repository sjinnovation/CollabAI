import React from 'react';
import './style.css';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, viewType = 'card' }) => {
  const navigate = useNavigate();

  // Function to handle project click
  const handleProjectClick = (id) => {
    console.log('Navigating to project:', id);
    navigate(`/projectdetails/${id}`);
  };

  return (
    <div className={`card-container ${viewType}-view`} onClick={()=>handleProjectClick(project._id)}>
      <img src={project.image_link} alt={project.name} className="image-style" />
      <div className="content-area">
        <h3>{project.name}</h3>
        <p>{project.client_id.name}</p>
        {project.description.length > 20 ? (
          <>
            <p>{project.description.substring(0, 50)}......</p>
            
          </>
        ) : (
          <p>{project.description}</p>
        )}
        <div className="technologies">
          {project.techStack.map((tech, index) => (
            <span key={index} className="technology-label">{tech.name}</span>
          ))}
        </div>
        <div className="links-section">
          <a href={project.links.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={project.links.links} target="_blank" rel="noopener noreferrer">Live Demo</a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;