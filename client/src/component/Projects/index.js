import React from 'react';
import ProjectCard from '../ProjectCard';
import './style.css';

const Projects = ({ viewType, filter, tags, projects }) => {
  const filteredProjects = projects.filter(project => {
    const projectName = project.name ? project.name.toLowerCase() : '';
    const matchesFilter = projectName.includes(filter.toLowerCase());
    const matchesTags = tags.length === 0 || tags.some(tag => project.tags && project.tags.includes(tag));
    return matchesFilter && matchesTags;
  });

  return (
    <div className={`projects-area ${viewType}`}>
      {filteredProjects.map((project) => (
        <ProjectCard key={project.id} project={project} />
      ))}
    </div>
  );
};

export default Projects;