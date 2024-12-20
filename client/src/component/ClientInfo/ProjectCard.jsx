import React, { useState, useEffect } from 'react';
import { FaCircle, FaCalendarAlt } from 'react-icons/fa';
import { Cardss, CardContent, CardFooter } from './Cards';
import Badge from './Badge';
import { getTechStackById } from '../../api/projectApi.js';
import {InitialsAvatar} from '../../component/InitialsAvatar/InitialsAvatar'
const getStatusStyle = (status) => {
  switch (status) {
    case 'stage':
      return {
        borderColor: 'yellow',
        backgroundColor: 'yellow',
        color: 'black',
      };
    case 'dev':
      return {
        borderColor: 'blue',
        backgroundColor: 'blue',
        color: 'white',
      };
    case 'live':
      return {
        borderColor: 'green',
        backgroundColor: 'green',
        color: 'white',
      };
    default:
      return {
        borderColor: 'red',
        backgroundColor: 'red',
        color: 'white',
      };
  }
};

const StatusButton = ({ status }) => {
  const styles = getStatusStyle(status);

  return (
    <button
      type="button"
      className="status-btn"
      style={{
        ...styles,
        borderWidth: '2px',
        borderStyle: 'solid',
        borderRadius: '20px',
        padding: '5px 15px',
        fontSize: '14px',
        fontWeight: 'bold',
        textTransform: 'capitalize',
        cursor: 'pointer',
      }}
    >
      {status}
    </button>
  );
};

const ProjectCard = ({ project }) => {
  const [techStack, setTechStack] = useState([]);

  useEffect(() => {
    const fetchTechStackDetails = async () => {
      try {
        const techStackPromises = project.techStack.map((id) => getTechStackById(id));
        const techStackDetails = await Promise.all(techStackPromises);
        
        console.log("Fetched Tech Stack Details: ", techStackDetails);
        
        setTechStack(techStackDetails.map(detail => detail.name)); // Save tech stack names in state
      } catch (error) {
        console.error("Error fetching tech stack details:", error);
      }
    };

    if (project.techStack && project.techStack.length > 0) {
      fetchTechStackDetails();
    }
  }, [project.techStack]);

  return (
    <div className="card-container">
      <CardContent className="project-image-container">
        <div className="project-image-wrapper">
           {project.image_link ? (
                      <img
                        src={project.image_link}
                        alt={project.name}
                        className="image-style"
                      />
                    ) : (
                      <InitialsAvatar name={project.name} className="image-placeholder" />
           )}
          <div className="project-image-overlay" />
        </div>
      </CardContent>
      <CardFooter className="project-info">
        <div className="project-details">
          <h4 className="project-title">{project.name}</h4>
          <p className="project-stat">{project.client_id.name}</p>
          <div className="project-stat">
            {project.description}
          </div>
          <div className="project-stat">
  
          <div>
      <StatusButton status={project.status} />
    </div>
          </div>
          <div className="project-stat">
            <div className="project-start">
              <FaCalendarAlt style={{ color: "white", marginRight: '8px' }} />
              <span style={{color: "white"}}>{new Date(project.start_time).toLocaleDateString()}</span>-  <span style={{color: "white"}}>{new Date(project.end_time).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="technologies">
            {techStack.map((tech, index) => (
              <span key={index} className="technology-label">{tech}</span>
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
    </div>
  );
};

export default ProjectCard;

