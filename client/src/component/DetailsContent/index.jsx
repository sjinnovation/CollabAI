import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Circle, Calendar, Flag, FileText, DollarSign, Clock } from 'lucide-react';
import './styles.css';
import { fetchProjectById ,getProjectTeamMembers} from '../../api/projectApi';
import { useNavigate } from 'react-router-dom';


const InfoBox = ({ icon: Icon, label, value, subValue }) => (
  <div className="info-box">
    
    <div className="info-content">
      <div style={{display:"flex",gap:"5px"}}>
      <Icon className="icon" />
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
    console.log('Navigating to client:', id);
    navigate(`/Client/${id}`);
  };
  const handleTeamClick = (id) => {
    console.log('Navigating to Pod:', id);
    navigate(`/Pod/${id}`);
  };
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

  useEffect(()=>{
    const fetchData=async()=>
    {
      try{
        const response=await getProjectTeamMembers(id);
        
        setTeammember(response);
        console.log('Fetched project team members:', teammember);
      
      }
      catch(error){
        console.error('Error fetching project team members:', error);
      }
    };
  
    fetchData();
  },[id]);

  if (!project) {
    return <div>Loading project details...</div>;
  }

  return (
    <div className="project-page">
      <div className="project-title" style={{  }}>
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
              <div className="owner-info" onClick={()=>handleProjectClick(project.client_id?._id)} >
                <div className="avatar-placeholder" ></div>
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
              <span className="label">Team:</span>
              <div className="summary-content">
                {teammember?.map((member, index) => (
                    <p key={member._id}>
                        {member.user_id?.fname} {member.user_id?.lname} - {member.role_in_project}
                    </p>
                ))}
                {/*{teammember?.map(()=>{
                  }} <p>{project.summary || 'No summary available'}</p> */}
              </div>
            </div>

            <div className="detail-item team">
              <FileText className="icon" />
              <span className="label">Team:</span>
              <div className="summary-content" onClick={()=>handleTeamClick(project.team_id?._id)}>
                <p style={{marginBottom:"0"}}>{project.team_id?.teamTitle || 'No team information available'}</p>
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
              label="Hours taken"
              value={project.hr_taken || 'N/A'}
              
            />
            <InfoBox
              icon={Clock}
              label="Team Members"
              value="10"
              
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
