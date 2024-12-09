import React from 'react';
import './style.css';

const ProjectCard = ({ project, viewType = 'card' }) => {
  return (
    <div className={`card-container ${viewType}-view`}>
      <img src={project.image} alt={project.title} className="image-style" />
      <div className="content-area">
        <h3>{project.title}</h3>
        <p>{project.description}</p>
        <div className="technologies">
          {project.technologies.map((tech, index) => (
            <span key={index} className="technology-label">{tech}</span>
          ))}
        </div>
        <div className="links-section">
          <a href={project.github} target="_blank" rel="noopener noreferrer">GitHub</a>
          <a href={project.live} target="_blank" rel="noopener noreferrer">Live Demo</a>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;