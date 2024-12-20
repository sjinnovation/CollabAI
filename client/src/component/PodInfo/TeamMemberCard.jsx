import React from 'react';
import '../../Pages/PortfolioManagement/PodInfo/PodInfo.scss'
import {InitialsAvatar} from '../../component/InitialsAvatar/InitialsAvatar'
export function TeamMemberCard({ member }) {
  return (
    <div className="card-container">
      <div className="imageContainer">
        <div className={`activeIndicator ${member.status === 'active' ? 'active' : ''}`} />
         {
            <InitialsAvatar name={`${member.fname} ${member.lname}`} className="image-placeholder" />
          }
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


