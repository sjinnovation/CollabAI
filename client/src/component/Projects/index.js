import React from 'react';
import ProjectCard from '../ProjectCard';
import projectsData from '../data/projects.json';  // This path should now work
import './style.css';

const Projects = () => {
  return (
    <div className="projects-container">
      {projectsData.projects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default Projects;