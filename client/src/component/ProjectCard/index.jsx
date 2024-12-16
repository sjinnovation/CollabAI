import React from 'react';
import './style.css';

const ProjectCard = ({ project, viewType = 'card' }) => {
  return (
    <div className={`card-container ${viewType}-view`}>
      <img src={project.image_link} alt={project.name} className="image-style" />
      <div className="content-area">
        <h3>{project.name}</h3>
        <p>{project.client_id.name}</p>
        <p>{project.description}</p>
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