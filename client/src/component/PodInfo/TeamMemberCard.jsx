import React from 'react';
import '../../Pages/PortfolioManagement/PodInfo/PodInfo.scss'

export function TeamMemberCard({ member }) {
  return (
    <div className="project-card1">
      <div className="imageContainer">
        <img src={member.imageUrl} alt={member.name} className="image" />
        <div className={`activeIndicator ${member.isActive ? 'active' : ''}`} />
      </div>
      <div className="cardContent">
        <h2 className="name">{member.name}</h2>
        <h3 className="jobTitle">{member.jobTitle} • {member.experience} years</h3>
        <p className="description">{member.description}</p>
        <div className="skills">
          {Object.entries(member.skills).map(([skill, count], index) => (
            <span key={index} className="tech-tag">{skill}: {count}</span>
          ))}
        </div>
      </div>
    </div>
  )
}

