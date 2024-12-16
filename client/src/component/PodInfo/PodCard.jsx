import React, { useState, useEffect } from "react";
import { FaEllipsisH } from "react-icons/fa";
import { getUsersByTeamId } from "../../api/projectApi.js";
import '../../Pages/PortfolioManagement/PodInfo/PodInfo.scss';

export const PodCard = ({ team, onClick }) => {
  const [activeMembers, setActiveMembers] = useState(0);
  const [inactiveMembers, setInactiveMembers] = useState(0);
  const [teamMembers, setTeamMembers] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const members = await getUsersByTeamId(team._id);
        console.log('Fetched team members:', members);

        if (!Array.isArray(members)) {
          throw new Error('Fetched data is not an array');
        }

        const active = members.filter(member => member.status === 'active').length;
        const inactive = members.length - active;

        console.log('Active members:', active);
        console.log('Inactive members:', inactive);

        setActiveMembers(active);
        setInactiveMembers(inactive);
        setTeamMembers(members);
        setError(null);
      } catch (error) {
        console.error('Error fetching team members:', error);
        setError(error.message);
      }
    };

    fetchTeamMembers();
  }, [team._id]);

  if (error) {
    return <div className="podCard error">Error: {error}</div>;
  }

  return (
    <div className="podCard" onClick={onClick}>
      <div className="podHeader">
        <div className="podAvatar">
          {team.teamTitle[0]}
        </div>
        <div className="podInfo">
          <h3 className="podName">{team.teamTitle}</h3>
          <p className="podDescription">{team.teamDescriptions}</p>
        </div>
        <button className="moreButton">
          <FaEllipsisH />
        </button>
      </div>
      <div className="podStats">
        <div className="memberCount">
          <span className="statNumber">{activeMembers} Active</span>
          <span className="statDivider">•</span>
          <span className="statNumber">{inactiveMembers} Inactive</span>
        </div>
        <div className="memberAvatars">
          {teamMembers.slice(0, 3).map((member, index) => (
            <div key={index} className="smallAvatar">
              {member.fname ? member.fname[0] : '?'}
            </div>
          ))}
          {teamMembers.length > 3 && (
            <div className="moreMembers">+{teamMembers.length - 3}</div>
          )}
        </div>
      </div>
      <button className="viewDetails">View Details</button>
    </div>
  );
};

