import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout, Circle, Calendar, Flag, FileText } from 'lucide-react';
import {  DollarSign, Clock } from 'lucide-react';
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
  <span className={`badge ${className}`}>
    {children}
  </span>
);

const Progress = ({ value }) => (
  <div className="progress-bar">
    <div className="progress-bar-fill" style={{ width: `${value}%` }}></div>
  </div>
);

export default function ProjectDetails() {
  const { id } = useParams();
  const [project, setProject] = useState(null);

  useEffect(()=>{
    const fetchData= async()=>{
        try{
            console.log('Fetching project with ID:', id);
            const response=await fetchProjectById(id);
            console.log('new response',response);
            setProject(response);

        }
        catch(error){
            console.error('Error fetching project:', error);
            throw error;
        }
    }
    fetchData();
},[id]);

  if (!project) {
    return <div>Loading project details...</div>;
  }

  return (
    <>
    <div className='Project-Page'>
    <div className="project-title" style={{background:"#18181b"}}>
    <h1 >{project.name}</h1>
    </div>
   
    <div className="project-details">
      <div className="project-content">
      <p>{project.description}</p>

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
            value="86.5 hrs"
            subValue="120 hrs estimated"
          />
        </div>
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
            <span>{project.start_time || 'N/A'} → {project.end_time || 'N/A'}</span>
          </div>

      
          <div className="detail-item">
            <Flag className="icon" />
            <span className="label">Priority:</span>
            <Badge className="priority-badge">{project.priority || 'High'}</Badge>
          </div>

          <div className="detail-item summary">
            <FileText className="icon" />
            <span className="label">Summary:</span>
            <div className="summary-content">
              <p></p>
            </div>
          </div>
        </div>
      </div>
      <div className="feature-list">
        <div>
        <h2>Features</h2>
            <ul>
              {project.feature?.map((features, index) =>
                <li key={index}>{features.name}</li>
              )}
            </ul>
        </div>

      </div>
        
       
    </div>
    </div>

    </>
    
  );
}
