import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Circle, Calendar, Flag, FileText, DollarSign, Clock } from 'lucide-react';
import './styles.css';
import { fetchProjectById } from '../../api/projectApi';

const InfoBox = ({ icon: Icon, label, value, subValue }) => (
  <div className="info-box">
    <Icon className="icon" />
    <div className="info-content">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
      {subValue && <span className="info-sub-value">{subValue}</span>}
    </div>
  </div>
);

const Badge = ({ children, className }) => (
  <span className={`badge ${className}`}>{children}</span>
);

const Progress = ({ value }) => (
  <div className="progress-bar">
    <div className="progress-bar-fill" style={{ width: `${value}%` }}></div>
  </div>
);

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('Fetching project with ID:', id);
        const response = await fetchProjectById(id);
        console.log('Fetched project data:', response);
        setProject(response);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };
    fetchData();
  }, [id]);

  if (!project) {
    return <div>Loading project details...</div>;
  }

  return (
    <div className="project-page">
      <div className="project-title" style={{ background: "#18181b" }}>
        <h1>{project.name}</h1>
      </div>

      <div className="project-details">
        <div className="project-content">
          <p style={{ marginBottom: "2rem" }}>{project.description}</p>

          <div className="details-grid">
            <div className="detail-item">
              <Circle className="icon" />
              <span className="label">Status:</span>
              <Badge className="status-badge">{project.status || 'In progress'}</Badge>
            </div>

            <div className="detail-item">
              <span className="icon">👤</span>
              <span className="label">Owner:</span>
              <div className="owner-info">
                <div className="avatar-placeholder"></div>
                <span>{project.client_id?.name || 'Unknown'}</span>
              </div>
            </div>

            <div className="detail-item">
              <Calendar className="icon" />
              <span className="label">Dates:</span>
              <span>
                {project.start_time ? new Date(project.start_time).toLocaleDateString() : 'N/A'} → {project.end_time ? new Date(project.end_time).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="detail-item">
              <Flag className="icon" />
              <span className="label">TechStack:</span>
              <div>
                {project.techStack?.map((tech, index) => (
                  <Badge 
                    key={tech._id} 
                    className="priority-badge"
                    style={{ marginRight: '0.5rem' }}
                  >
                    {tech.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="detail-item summary">
              <FileText className="icon" />
              <span className="label">Summary:</span>
              <div className="summary-content">
                <p>{project.summary || 'No summary available'}</p>
              </div>
            </div>

            <div className="detail-item team">
              <FileText className="icon" />
              <span className="label">Team:</span>
              <div className="summary-content">
                <p style={{marginBottom:"0"}}>{project.team_id?.teamTitle || 'No team information available'}</p>
              </div>
            </div>
          </div>

          <div className="details-grids">
            <InfoBox
              icon={DollarSign}
              label="Budget"
              value="$12,000"
              subValue="$10,000 spent"
            />
            <InfoBox
              icon={Clock}
              label="Hours taken"
              value={project.hr_taken || 'N/A'}
              subValue="120 hrs estimated"
            />
            <InfoBox
              icon={Clock}
              label="Team Members"
              value="10"
              subValue="120 hrs estimated"
            />
          </div>
        </div>

        <div className="feature-list">
          <h2>Features</h2>
          <ul>
            {project.feature?.map((feature, index) => (
              <li key={index}>{feature.name}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
