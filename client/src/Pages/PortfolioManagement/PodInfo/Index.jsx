import { getAllTeams } from '../../../api/projectApi.js';
import React, { useState, useEffect } from "react";
import { FaSearch } from "react-icons/fa";
import { TeamModal } from '../../../component/PodInfo/TeamModal.jsx';
import { PodCard } from '../../../component/PodInfo/PodCard.jsx';
import './PodInfo.scss'

const PodInfo = () => {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const fetchedTeams = await getAllTeams();
      console.log('Fetched teams:', fetchedTeams);
      setTeams(fetchedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const handleTeamClick = (teamId) => {
    console.log('Team clicked:', teamId);
    setSelectedTeamId(teamId);
    setIsModalOpen(true);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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
          {filteredTeams.map((team) => (
            <PodCard key={team._id} team={team} onClick={() => handleTeamClick(team._id)} />
          ))}
        </div>
      </div>

      {isModalOpen && selectedTeamId && (
        <TeamModal
          teamId={selectedTeamId}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTeamId(null);
          }}
        />
      )}
    </div>
  );
};

export default PodInfo;
