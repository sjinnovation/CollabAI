import React from 'react';
import '../../Pages/PortfolioManagement/PodInfo/PodInfo.scss'

export function TeamMemberCard({ member }) {
  return (
    <div className="project-card1">
      <div className="imageContainer">
        <img src={member.profilePicture || "https://picsum.photos/200"} alt={`${member.fname} ${member.lname}`} className="image" />
        <div className={`activeIndicator ${member.status === 'active' ? 'active' : ''}`} />
      </div>
      <div className="cardContent">
        <h2 className="name">{`${member.fname} ${member.lname}`}</h2>
        <h3 className="jobTitle">
          {member.roles_in_project && member.roles_in_project.length > 0
            ? member.roles_in_project.join(', ')
            : 'No assigned role'}
        </h3>
        <p className="description">{member.email}</p>
      </div>
    </div>
  )
}


