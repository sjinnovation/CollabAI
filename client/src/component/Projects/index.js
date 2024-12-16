import React from 'react';
import ProjectCard from '../ProjectCard';
import './style.css';

const Projects = ({ viewType, projects }) => {
  return (
    <div className={`projects-area ${viewType}`}>
      {projects.length > 0 ? (
        projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))
      ) : (
        <p style={{color:"white"}}>No projects available.</p>
      )}
    </div>
  );
};

export default Projects;