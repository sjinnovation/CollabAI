import React from 'react';
import { FaUsers } from "react-icons/fa";
import { Cardss, CardContent, CardFooter } from './Cards';
import Badge from './Badge';

const ProjectCard = ({ project }) => (
  <Cardss className="project-card">
    <CardContent className="project-image-container">
      <div className="project-image-wrapper">
        <img
          src={project.image}
          alt={project.title}
          className="project-image"
        />
        <div className="project-image-overlay" />
      </div>
    </CardContent>
    <CardFooter className="project-info">
      <div className="project-details">
        <h4 className="project-title">{project.title}</h4>
        <div className="project-stat">
          <FaUsers className="stat-icon" />
          {project.Team}
        </div>
        <div className="project-tech-stack">
          {project.techStack.map((tech, index) => (
            <Badge key={index} className="tech-badge">{tech}</Badge>
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
    </CardFooter>
  </Cardss>
);

export default ProjectCard;

