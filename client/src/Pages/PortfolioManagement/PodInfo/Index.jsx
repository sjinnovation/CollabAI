import { getAllTeams } from '../../../api/projectApi.js';
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { useParams, useNavigate } from 'react-router-dom';
import { TeamModal } from '../../../component/PodInfo/TeamModal.jsx';
import { PodCard } from '../../../component/PodInfo/PodCard.jsx';
import './PodInfo.scss'

const PodInfo = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { id } = useParams(); // Get the id from URL parameters
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeams();
    // If there's an id in the URL, open the modal for that team
    if (id) {
      setSelectedTeamId(id);
      setIsModalOpen(true);
    }
  }, [id]);

  const fetchTeams = async () => {
    try {
      const fetchedTeams = await getAllTeams();
      setTeams(fetchedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleTeamClick = (teamId) => {
    setSelectedTeamId(teamId);
    setIsModalOpen(true);
    // Update the URL when a team is clicked
    navigate(`/platform-management-feature/Pod/${teamId}`);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };
 
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTeamId(null);
    // Remove the team ID from the URL when closing the modal
    navigate('/platform-management-feature/PodInfo');
  };

  const filteredTeams = teams.filter(team =>
    team.teamTitle.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
  
    <div className="teamPage">
      <div className="container1">
        <h1 className="title">
          Team Pods Overview
        </h1>
        <p className="subtitle">
          Cross-functional teams working together to achieve our goals
        </p>
        <div className="searchContainer1">
          <div className="searchWrapper1">
            <FaSearch className="searchIcon1" />
            <input
              type="text"
              placeholder="Search pods..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="searchInput1"
            />
          </div>
        </div>
        <div className="podGrid">
        {filteredTeams.length > 0 ? (
          filteredTeams.map((team) => (
            <PodCard
              key={team._id}
              team={team}
              onClick={() => handleTeamClick(team._id)}
            />
          ))
        ) : (
          <div className="noTeamsMessage">No pod team found</div>
        )}
        </div>
      </div>

      {isModalOpen && selectedTeamId && (
        <TeamModal
          teamId={selectedTeamId}
          onClose={handleCloseModal}
        />
      )}
    </div>
    
  );
};

export default PodInfo;

