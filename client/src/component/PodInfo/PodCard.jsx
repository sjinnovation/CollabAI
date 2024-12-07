import React from 'react';
import { FaEllipsisH } from 'react-icons/fa';
import '../../Pages/PortfolioManagement/PodInfo/PodInfo.scss'
export function PodCard({ pod, onClick }) {
  return (
    <div className="podCard" onClick={onClick}>
      <div className="podHeader">
        <div className="podAvatar">
          {pod.name[0]}
        </div>
        <div className="podInfo">
          <h3 className="podName">{pod.name}</h3>
          <p className="podDescription">{pod.description}</p>
        </div>
        <button className="moreButton">
          <FaEllipsisH />
        </button>
      </div>
      <div className="podStats">
        <div className="memberCount">
          <span className="statNumber">{pod.active} Members Available</span>
          <span className="statDivider">•</span>
          <span className="statNumber">{pod.notactive} Unavailable</span>
        </div>
        <div className="memberAvatars">
          {pod.members.slice(0, 3).map((member, index) => (
            <div key={index} className="smallAvatar">
              {member.name[0]}
            </div>
          ))}
          {pod.members.length > 4 && (
            <div className="moreMembers">+{pod.members.length - 4}</div>
          )}
        </div>
      </div>
      <button className="viewDetails">View Details</button>
    </div>
  )
}