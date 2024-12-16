import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Import axios
import "./styles.css";
import Projects from '../Projects';
import Pagination from 'react-bootstrap/Pagination'; // Import Pagination
import { getAllProjects } from '../../api/projectApi';

export default function ContentPage() {
    const [isListView, setIsListView] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('');
    const [fetchedProjects, setFetchedProjects] = useState([]);
    const [allTags, setAllTags] = useState([]);
    const [projectsPerPage, setProjectsPerPage] = useState(6);
    const [items, setItems] = useState([]);
    const [totalPages, setTotalPages] = useState(0);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const toggleTag = (tag) => {
        setSelectedTags((prevTags) => {
            const newTags = prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag];
            console.log("Selected tags:", newTags);
            return newTags;
        });
    };

    useEffect(() => {
        const handleResize = () => {
            const newProjectsPerPage = window.innerWidth < 1017 ? 6 : 6;
            setProjectsPerPage(newProjectsPerPage);
        };

        window.addEventListener('resize', handleResize);

        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAllProjects(sortBy);
                console.log('response', response);
                setFetchedProjects(response);

                const uniqueTechStackTags = [...new Set(response.flatMap((project) => project.techStack || []))];
                const uniqueClientTags = [...new Set(response.flatMap((project) => project.client_id || []))];
                const uniqueTeamsTags = [...new Set(response.flatMap((project) => project.team_id || []))];
                console.log("teams", uniqueTeamsTags);
                const uniqueFeaturesTags = [...new Set(response.flatMap((project) => project.feature || []))];
                setAllTags({
                    techStack: uniqueTechStackTags,
                    client: uniqueClientTags,
                    teams: uniqueTeamsTags,
                    features: uniqueFeaturesTags
                });

                const initialTotalPages = Math.ceil(response.length / projectsPerPage);
                setTotalPages(initialTotalPages);

                const generateItems = () => {
                    const newItems = [];
                    for (let number = 1; number <= initialTotalPages; number++) {
                        newItems.push(
                            <Pagination.Item key={number} active={number === activePage} onClick={() => setActivePage(number)}>
                                {number}
                            </Pagination.Item>
                        );
                    }
                    setItems(newItems);
                };

                generateItems();
            } catch (error) {
                console.error('Error fetching projects:', error);
            }
        };

        fetchData();
    }, [activePage, projectsPerPage, sortBy]);

    // Filter projects
    const filteredProjects = fetchedProjects.filter((project) => {
        const matches =
            selectedTags.length === 0 ||
            project.techStack.some((tag) => selectedTags.includes(tag)) ||
            project.feature.some((res) => selectedTags.includes(res)) ||
            selectedTags.includes(project.team_id) ||
            selectedTags.includes(project.client_id);

        return matches;
    });

    // Pagination logic
    const startIndex = (activePage - 1) * projectsPerPage;
    const currentProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage);
    console.log("Current - ", currentProjects);

    return (
        <div className="container">
            <div className="panel">
                <div className="title">
                    <h1>Portfolio</h1>
                </div>

                <div className="filterbar">
                    {/* Search Input */}
                    <div>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            style={{ borderRadius: "16px", height: "3rem", width: "300px" }}
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>

                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        {/* Sort Button */}
                        <button
                            style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '5px',
                            }}
                            onClick={() => setIsSortModalOpen((prevState) => !prevState)}
                            aria-haspopup="true"
                            aria-expanded={isSortModalOpen}
                        >
                            <u style={{ fontSize: '19.2px' }}>Sort By</u>
                        </button>

                        {/* Dropdown Menu */}
                        {isSortModalOpen && (
                            <div
                                className="dropdown"
                                style={{
                                    position: 'absolute',
                                    zIndex: 1,
                                    color: 'white',
                                    padding: '10px',
                                    backgroundColor: '#333',
                                    borderRadius: '5px',
                                    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                                }}
                            >
                                <ul style={{ listStyleType: 'none', margin: 0, padding: 0 }}>
                                    {['default', 'budget', 'recent'].map((option) => (
                                        <li
                                            key={option}
                                            style={{
                                                padding: '5px 0',
                                                cursor: 'pointer',
                                                fontWeight: sortBy === option ? 'bold' : 'normal',
                                                transition: 'background-color 0.2s ease',
                                            }}
                                            onClick={() => {
                                                setSortBy(option); // Update sorting criteria
                                                setIsSortModalOpen(false); // Close modal
                                            }}
                                            onMouseEnter={(e) => (e.target.style.backgroundColor = '#444')}
                                            onMouseLeave={(e) => (e.target.style.backgroundColor = 'transparent')}
                                        >
                                            {option.charAt(0).toUpperCase() + option.slice(1)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    <a style={{ color: 'white' }} onClick={() => setIsModalOpen(true)}>
                        <u>Filter</u>
                    </a>
                </div>
            </div>

            {/* Filter Modal */}
            {isModalOpen && (
                <div className="modal" style={{ zIndex: 100, overflowY: 'auto' }}>
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h2>Filter Projects</h2>
                        <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
                            <h5>Select Tags:</h5>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                {Object.entries(allTags).map(([category, tags]) => (
                                    <div key={category} style={{ flex: 1, marginRight: '10px' }}>
                                        <h5>{category.charAt(0).toUpperCase() + category.slice(1)}</h5>
                                        {tags.map((tag) => (
                                            <label key={tag._id} style={{ display: 'block', marginBottom: '5px' }}>
                                                <input
                                                    type="checkbox"
                                                    checked={selectedTags.includes(tag)}
                                                    onChange={() => toggleTag(tag)}
                                                />
                                                {tag.name || tag.teamTitle}
                                            </label>
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Projects
                viewType={isListView ? 'list' : 'card'}
                filter={searchTerm}
                tags={selectedTags}
                projects={currentProjects} // Pass the filtered and paginated projects
            />

            <Pagination>{items}</Pagination> {/* Render pagination here */}
        </div>
    );
}
