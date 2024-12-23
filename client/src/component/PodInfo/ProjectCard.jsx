import React, { useState, useEffect } from 'react';
import { FaCircle, FaCalendarAlt } from 'react-icons/fa';
import { Cardss, CardContent, CardFooter } from '../../component/ClientInfo/Cards';
import Badge from '../../component/ClientInfo/Badge';
import { getTechStackById } from '../../api/projectApi';
import {InitialsAvatar} from '../../component/InitialsAvatar/InitialsAvatar'
import { useNavigate } from 'react-router-dom';


export const ProjectCard = ({ project }) => {
  const navigate = useNavigate();
  const [techStack, setTechStack] = useState([]);
const handleProjectClick = (id) => {
  console.log('Navigating to project:', id);
  navigate(`/projectdetails/${id}`);
};
  useEffect(() => {
    const fetchTechStackDetails = async () => {
      try {
        const techStackPromises = project.techStack.map((id) => getTechStackById(id));
        const techStackDetails = await Promise.all(techStackPromises);

        setTechStack(techStackDetails.map((detail) => detail.name));
      } catch (error) {
        console.error('Error fetching tech stack details:', error);
      }
    };

    if (project.techStack && project.techStack.length > 0) {
      fetchTechStackDetails();
    }
  }, [project.techStack]);

  return (
    <div className="card-container " onClick={()=>handleProjectClick(project._id)} style={{ background: "#18181b" }}>
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
        <div className="project-detailss">
          <h4 className="project-titles">{project.name}</h4>
          <div className="project-stat">{project.description.length > 20 ? (
          <>
            <p>{project.description.substring(0, 50)}......</p>
            
          </>
        ) : (
          <p>{project.description}</p>
        )}</div>
          <div className="project-stat">
          <Badge className="status-badge">{project.status || 'In progress'}</Badge>
          </div>
          <div className="project-stat">
            <div className="project-start">
              <FaCalendarAlt style={{ color: 'white', marginRight: '8px' }} />
              <span style={{ color: 'white' }}>
                {new Date(project.start_time).toLocaleDateString()}
              </span>

              →
              
              <span style={{ color: 'white' }}>
                {new Date(project.end_time).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="technologies">
            {techStack.map((tech, index) => (
              <span key={index} className="technology-label">
                {tech}
              </span>
            ))}
          </div>
          <div className="project-links">
            {project.links?.github && (
              <a
                href={project.links.github}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            )}
            {project.links?.links && (
              <a
                href={project.links.links}
                target="_blank"
                rel="noopener noreferrer"
              >
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
