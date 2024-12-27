import React, { useState, useEffect } from 'react'
import { FaSearch } from 'react-icons/fa'
import { TeamMemberCard } from './TeamMemberCard'
import ProjectCard from '../../component/ProjectCard'
import { getUsersByTeamId, getProjectsByTeam, getTeamById } from '../../api/projectApi'

export const TeamModal = ({ teamId, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [currentMemberPage, setCurrentMemberPage] = useState(1)
  const [currentProjectPage, setCurrentProjectPage] = useState(1)
  const [activeView, setActiveView] = useState('members')
  const [teamMembers, setTeamMembers] = useState([])
  const [projects, setProjects] = useState([]);
  const [teamName, setTeamName] = useState('')
  const [error, setError] = useState(null)
  const itemsPerPage = 3

  useEffect(() => {
    const fetchTeamData = async () => {
      if (!teamId) {
        setError('Team ID is undefined');
        return;
      }
  
      try {
        const [membersData, projectsData, teamData] = await Promise.all([
          getUsersByTeamId(teamId),
          getProjectsByTeam(teamId),
          getTeamById(teamId)
        ]);
  
        setTeamMembers(membersData);
  
        // Deduplicate projects
        const uniqueProjects = Array.from(new Set(projectsData.map(p => p._id)))
          .map(id => projectsData.find(p => p._id === id));
        setProjects(uniqueProjects);
  
        setTeamName(teamData.teamTitle);
      } catch (error) {
        console.error('Error fetching team data:', error);
        setError('Failed to load team data. Please try again later.');
      }
    };
  
    fetchTeamData();
  }, [teamId]);
  const filteredMembers = teamMembers
  .map((member) => ({
    ...member,
    roles_in_project: member.roles_in_project
      ? [...new Set(member.roles_in_project)] // Deduplicate roles
      : [],
  }))
  .filter(member =>
    member.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.roles_in_project && member.roles_in_project.some(role =>
      role.toLowerCase().includes(searchTerm.toLowerCase()))) ||
    (member.username && member.username.toLowerCase().includes(searchTerm.toLowerCase()))
  );


  const memberPageCount = Math.ceil(filteredMembers.length / itemsPerPage)
  const currentMembers = filteredMembers.slice(
    (currentMemberPage - 1) * itemsPerPage,
    currentMemberPage * itemsPerPage
  )

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(projectSearchTerm.toLowerCase())
  )
  const projectPageCount = Math.ceil(filteredProjects.length / itemsPerPage)
  const currentProjects = filteredProjects.slice(
    (currentProjectPage - 1) * itemsPerPage,
    currentProjectPage * itemsPerPage
  )

  const resetPagination = () => {
    setCurrentMemberPage(1)
    setCurrentProjectPage(1)
    setProjectSearchTerm('')
  }

  if (error) {
    return (
      <div className="modalOverlay">
        <div className="modal1">
          <div className="modalHeader">
            <h2>Error</h2>
            <button onClick={onClose} className="closeButton">&times;</button>
          </div>
          <div className="modalContent">
            <p>{error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="modalOverlay">
      <div className="modal1">
        <div className="modalHeader">
          <h2>{teamName}</h2>
          <button onClick={onClose} className="closeButton">&times;</button>
        </div>
        <div className="modalContent">
          <div className="viewToggleContainer">
            <button 
              className={`viewToggleButton ${activeView === 'members' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('members')
                resetPagination()
              }}
            >
              Team
            </button>
            <button 
              className={`viewToggleButton ${activeView === 'projects' ? 'active' : ''}`}
              onClick={() => {
                setActiveView('projects')
                resetPagination()
              }}
            >
              Projects
            </button>
          </div>

          {activeView === 'members' ? (
            <>
              <div className="searchContainer1">
                <div className="searchWrapper1">
                  <FaSearch className="searchIcon1" />
                  <input
                    type="text"
                    placeholder="Search by name or job title"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="searchInput1"
                  />
                </div>
              </div>
              <div className="teamMembers">
                {currentMembers.map((member) => (
                  <TeamMemberCard key={member._id || member.username} member={member} />
                ))}
              </div>
              <div className="pagination1">
                <button-container
                  onClick={() => setCurrentMemberPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentMemberPage === 1}
                >
                  Previous
                </button-container>
                <span>{currentMemberPage} of {memberPageCount}</span>
                <button-container
                  onClick={() => setCurrentMemberPage(prev => Math.min(prev + 1, memberPageCount))}
                  disabled={currentMemberPage === memberPageCount}
                >
                  Next
                </button-container>
              </div>
            </>
          ) : (
            <>
              <div className="searchContainer1">
                <div className="searchWrapper1">
                  <FaSearch className="searchIcon1"/>
                  <input
                    type="text"
                    placeholder="Search by project title"
                    value={projectSearchTerm}
                    onChange={(e) => setProjectSearchTerm(e.target.value)}
                    className="searchInput1"
                  />
                </div>
              </div>
              <div className="projectsGrid">
              {currentProjects.map((project, index) => (
  <ProjectCard key={project._id || project.name + index} project={project} />
))}
              </div>
              <div className="pagination1">
                <button-container
                  onClick={() => setCurrentProjectPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentProjectPage === 1}
                >
                  Previous
                </button-container>
                <span>{currentProjectPage} of {projectPageCount}</span>
                <button-container
                  onClick={() => setCurrentProjectPage(prev => Math.min(prev + 1, projectPageCount))}
                  disabled={currentProjectPage === projectPageCount}
                >
                  Next
                </button-container>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

