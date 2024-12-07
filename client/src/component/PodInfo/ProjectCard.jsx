import React from 'react';
import '../../Pages/PortfolioManagement/PodInfo/PodInfo.scss';

export const ProjectCard = ({ project }) => {
  // Guard clause: Return null if project is not defined
  if (!project) {
    return null;
  }

  return (
    
      <div className={`project-card1`}>
        <img 
          src={project.imageUrl} 
          alt={project.name || "Project"} 
          className="project-image" 
        />
        <div className="project-content1">
          <h3><a
      href={`http://localhost:4000/portfolio-management/${project.id}`}
      target="_self"
      rel="noopener noreferrer"
      className="projectCardLink"
    >{project.name}</a></h3>
          <p>{project.description}</p>
          <div className="technologies">
            {project.techStack && project.techStack.map((tech, index) => (
              <span key={index} className="tech-tag">{tech}</span>
            ))}
          </div>
          <div className="project-links">
            {project.github && (
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
            {project.live && (
              <a href={project.live} target="_blank" rel="noopener noreferrer">
                Live Demo
              </a>
            )}
          </div>
        </div>
      </div>
    
  );
};
