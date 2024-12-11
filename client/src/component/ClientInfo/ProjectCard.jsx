import React, { useState, useEffect } from 'react';
import { FaUsers, FaCircle,FaCalendarAlt } from 'react-icons/fa';
import { Cardss, CardContent, CardFooter } from './Cards';  // Ensure 'Cardss' is correct; if not, use 'Cards'
import Badge from './Badge';
import { getTechStackById } from '../../api/projectApi.js';

const getStatusColor = (status) => {
  switch (status) {
    case 'stage':
      return 'yellow';
    case 'dev':
      return 'blue';
    case 'live':
      return 'green';
    default:
      return 'red';
  }
};

const ProjectCard = ({ project, techStackIds }) => {
  const [techStack, setTechStack] = useState([]);

  useEffect(() => {
    const fetchTechStackDetails = async () => {
      try {
        const uniqueIds = Array.from(new Set(techStackIds)); // Remove duplicates
        console.log("Tech Stack IDs: ", uniqueIds);  // Log techStackIds
        const techStackPromises = uniqueIds.map((id) => getTechStackById(id));
        const techStackDetails = await Promise.all(techStackPromises);
        
        console.log("Fetched Tech Stack Details: ", techStackDetails);  // Log API response
        
        setTechStack(techStackDetails); // Save tech stack details in state
      } catch (error) {
        console.error("Error fetching tech stack details:", error);
      }
    };

    if (techStackIds && techStackIds.length > 0) {
      fetchTechStackDetails();
    }
  }, [techStackIds]); // Runs when techStackIds changes

  return (
    <Cardss className="project-card1">
      <CardContent className="project-image-container">
        <div className="project-image-wrapper">
          <img
            src="https://picsum.photos/600/400?random=1"
            alt={project.name}
            className="project-image"
          />
          <div className="project-image-overlay" />
        </div>
      </CardContent>
      <CardFooter className="project-info">
        <div className="project-details">
          <h4 className="project-title">{project.name}</h4>
          <div className="project-stat">
          
            {project.description}
          </div>
          <div className="project-status">
            <FaCircle style={{ color: getStatusColor(project.status), fontSize: '14px', margin: '5px' }} />
            <span style={{ color: "white" }}>{project.status}</span>
          </div>
          <div className="project-dates">
            <div className="project-start">
              <FaCalendarAlt style={{ color: "white", marginRight: '8px' }} />
              <span style={{color: "white"}}>{new Date(project.start_time).toLocaleDateString()}</span>-  <span style={{color: "white"}}>{new Date(project.end_time).toLocaleDateString()}</span>
            </div>
           
          </div>
          <div className="project-tech-stack">
            {techStack && techStack.length > 0 && techStack.map((tech, index) => (
              <Badge key={index} className="tech-badge">{tech.name}</Badge>
            ))}
          </div>
       
          <div className="project-links">
            {project.links && project.links.github && (
              <a href={project.links.github} target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            )}
            {project.links && project.links.links && (
              <a href={project.links.links} target="_blank" rel="noopener noreferrer">
                Live Demo
              </a>
            )}
          </div>
        </div>
      </CardFooter>
    </Cardss>
  );
};

export default ProjectCard;
