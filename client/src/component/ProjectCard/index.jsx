import React from 'react';
import './style.css';
import { FaCircle, FaCalendarAlt } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import {InitialsAvatar} from '../../component/InitialsAvatar/InitialsAvatar';
import Badge from '../ClientInfo/Badge';

const ProjectCard = ({ project, viewType = 'card' }) => {
  const navigate = useNavigate();

  // Function to handle project click
  const handleProjectClick = (id) => {
    console.log('Navigating to project:', id);
    navigate(`/platform-management-feature/projectdetails/${id}`);
  };

  return (
    <div className={`card-container ${viewType}-view`} onClick={()=>handleProjectClick(project._id)}>
              <div className="project-image-wrapper">
           {project.image_link ? ( 
                      <img
                        src={project.image_link}
                        alt={project.name}
                        className="image-style"
                      />
                    ) : (
                      <InitialsAvatar name={project.name} style={{height:'200px'}} className="image-placeholder" />
           )}
          <div className="project-image-overlay" />
        </div>
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
        <div style={{marginBottom:"16px"}}>
          <Badge className="status-badge">{project.status || 'In progress'}</Badge>
        </div>

            <div className="project-start" style={{marginBottom:"16px"}}>
              <FaCalendarAlt style={{ color: "white", marginRight: '8px' }} />
              <span style={{color: "white"}}>{new Date(project.start_time).toLocaleDateString()}</span><span style={{color:"white"}}> → </span><span style={{color: "white"}}>{new Date(project.end_time).toLocaleDateString()}</span>
            </div>
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