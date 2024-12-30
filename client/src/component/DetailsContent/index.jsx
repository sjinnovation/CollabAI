import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Circle, Calendar, Flag, FileText, DollarSign, Clock, Users } from 'lucide-react';
import './styles.css';
import { fetchProjectById, getProjectTeamMembers } from '../../api/projectApi';

const InfoBox = ({ icon: Icon, label, value }) => (
  <div className="info-box">
    <div className="info-content">
      <div className="info-header">
        <Icon className="icon" size={20} />
        <span className="info-label">{label}</span>
      </div>
      <span className="info-value">{value}</span>
    </div>
  </div>
);

const Badge = ({ children, className }) => (
  <span className={`badge ${className}`}>{children}</span>
);

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [teammember, setTeammember] = useState([]);
  
  const handleProjectClick = (id) => {
    navigate(`/platform-management-feature/Client/${id}`);
  };

  const handleTeamClick = (id) => {
    navigate(`/platform-management-feature/Pod/${id}`);
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetchProjectById(id);
        setProject(response);
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getProjectTeamMembers(id);
        setTeammember(response);
      } catch (error) {
        console.error('Error fetching project team members:', error);
      }
    };
    fetchData();
  }, [id]);

  if (!project) {
    return (
      <div className="project-page">
        <div className="project-details">
          <div>Loading project details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="project-page">
      <div className="project-title">
        <h1>{project.name}</h1>
      </div>

      <div className="project-details">
        <div className="project-content">
          <p className="project-contents">{project.description}</p>

          <div className="details-grid">
            <div className="detail-item">
              <Circle size={20} />
              <span className="label">Status</span>
              <Badge className="status-badge">{project.status || 'In Progress'}</Badge>
            </div>

            <div className="detail-item">
              <span className="label">Client</span>
              <div 
                className="owner-info" 
                onClick={() => handleProjectClick(project.client_id?._id)}
              >
                <div className="avatar-placeholder" />
                <span>{project.client_id?.name || 'Unknown'}</span>
              </div>
            </div>

            <div className="detail-item">
              <Calendar size={20} />
              <span className="label">Timeline</span>
              <span>
                {project.start_time ? new Date(project.start_time).toLocaleDateString() : 'N/A'} 
                {' → '} 
                {project.end_time ? new Date(project.end_time).toLocaleDateString() : 'N/A'}
              </span>
            </div>

            <div className="detail-item">
              <Flag size={20} />
              <span className="label">Tech Stack</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {project.techStack?.map((tech) => (
                  <Badge 
                    key={tech._id} 
                    className="priority-badge"
                  >
                    {tech.name}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="detail-item">
              <Users size={20} />
              <span className="label">Team</span>
              <div 
                className="owner-info"
                onClick={() => handleTeamClick(project.team_id?._id)}
              >
                <span>{project.team_id?.teamTitle || 'No team assigned'}</span>
              </div>
            </div>

            <div className="detail-item">
              <FileText size={20} />
              <span className="label">Members</span>
              <div style={{ flex: 1 }}>
                {teammember?.map((member) => (
                  <div key={member._id} style={{ marginBottom: '4px' }}>
                    {member.user_id?.fname} {member.user_id?.lname} 
                    <span style={{ color: '#a1a1aa' }}> - {member.role_in_project}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="details-grids">
            <InfoBox
              icon={DollarSign}
              label="Budget"
              value="$12,000"
            />
            <InfoBox
              icon={Clock}
              label="Hours Spent"
              value={project.hr_taken || 'N/A'}
            />
            <InfoBox
              icon={Users}
              label="Team Size"
              value={teammember.length || 0}
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