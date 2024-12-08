import React, { useState } from 'react'
import { FaSearch, FaFilter } from 'react-icons/fa'
import { TeamMemberCard } from './TeamMemberCard'
import { ProjectCard } from './ProjectCard'
import { sortTeamMembers } from '../../contexts/sortTeamMembers'

export const TeamModal = ({ pod, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [projectSearchTerm, setProjectSearchTerm] = useState('')
  const [currentMemberPage, setCurrentMemberPage] = useState(1)
  const [currentProjectPage, setCurrentProjectPage] = useState(1)
  const [activeView, setActiveView] = useState('members')
  const itemsPerPage = 3

  const filteredMembers = sortTeamMembers(pod.members.filter(member => 
    (member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     member.jobTitle.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (skillFilter === '' || Object.keys(member.skills).some(skill => 
      skill.toLowerCase().includes(skillFilter.toLowerCase())
    ))
  ))

  const memberPageCount = Math.ceil(filteredMembers.length / itemsPerPage)
  const currentMembers = filteredMembers.slice(
    (currentMemberPage - 1) * itemsPerPage,
    currentMemberPage * itemsPerPage
  )

  const filteredProjects = (pod.projects || []).filter(project =>
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

  return (
    <div className="modalOverlay">
      <div className="modal1">
        <div className="modalHeader">
          <h2>{pod.name}</h2>
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
                <div className="searchWrapper1">
          <FaSearch className="searchIcon1" />
          <input
            type="text"
            placeholder="Filter by skill"
            value={skillFilter}
            onChange={(e) => setSkillFilter(e.target.value)}
            className="searchInput1"
          />
        </div>
              </div>
              <div className="teamMembers">
                {currentMembers.map((member) => (
                  <TeamMemberCard key={member.id} member={member} />
                ))}
              </div>
              <div className="pagination">
                <button
                  onClick={() => setCurrentMemberPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentMemberPage === 1}
                >
                  Previous
                </button>
                <span>{currentMemberPage} of {memberPageCount}</span>
                <button
                  onClick={() => setCurrentMemberPage(prev => Math.min(prev + 1, memberPageCount))}
                  disabled={currentMemberPage === memberPageCount}
                >
                  Next
                </button>
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
              <div className="teamMembers">
                {currentProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="pagination">
                <button
                  onClick={() => setCurrentProjectPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentProjectPage === 1}
                >
                  Previous
                </button>
                <span>{currentProjectPage} of {projectPageCount}</span>
                <button
                  onClick={() => setCurrentProjectPage(prev => Math.min(prev + 1, projectPageCount))}
                  disabled={currentProjectPage === projectPageCount}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}