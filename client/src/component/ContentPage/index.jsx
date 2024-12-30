import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import "./styles.css";
import Projects from '../Projects';
import Pagination from 'react-bootstrap/Pagination';
import { getAllProjects } from '../../api/projectApi';

export default function ContentPage() {
    const [isListView, setIsListView] = useState(false);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [activePage, setActivePage] = useState(1);
    const [isSortModalOpen, setIsSortModalOpen] = useState(false);
    const [sortBy, setSortBy] = useState('');
    const [fetchedProjects, setFetchedProjects] = useState([]);
    const [allTags, setAllTags] = useState({});
    const [projectsPerPage, setProjectsPerPage] = useState(6);
    const [items, setItems] = useState([]);
    const [totalPages, setTotalPages] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearchChange = (e) => {
        setSearch(e.target.value);
    };

    const toggleTag = (tag) => {
        setSelectedTags((prevTags) => {
            const newTags = prevTags.includes(tag)
                ? prevTags.filter((t) => t !== tag)
                : [...prevTags, tag];
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
            setIsLoading(true);
            try {
                const response = await getAllProjects(sortBy);

                // Create a helper function to get unique values
                const getUniqueValues = (arr) => [...new Set(arr.map(JSON.stringify))].map(JSON.parse);

                // Process tags more effectively
                const techStackTags = getUniqueValues(response.flatMap((project) => project.techStack || []).filter(Boolean));
                const clientTags = getUniqueValues(response.map((project) => project.client_id).filter(Boolean));
                const teamsTags = getUniqueValues(response.map((project) => project.team_id).filter(Boolean));
                const featuresTags = getUniqueValues(response.flatMap((project) => project.feature || []).filter(Boolean));

                setAllTags({
                    techStack: techStackTags,
                    client: clientTags,
                    teams: teamsTags,
                    features: featuresTags,
                });

                setFetchedProjects(response);

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
                console.error("Error fetching projects:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [sortBy]);

    const filteredProjects = useMemo(() => {
        return fetchedProjects.filter((project) => {
            const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
            if (!matchesSearch) return false;

            if (selectedTags.length === 0) return true;
            return selectedTags.some(tag =>
                (project.techStack && project.techStack.some(tech => tech._id === tag || tech.name === tag)) ||
                (project.feature && project.feature.some(feature => feature._id === tag || feature === tag)) ||
                (project.team_id && (project.team_id._id === tag || project.team_id.teamTitle === tag)) ||
                (project.client_id && (project.client_id._id === tag || project.client_id.name === tag))
            );
        });
    }, [fetchedProjects, selectedTags, search]);

    useEffect(() => {
        const filteredTotalPages = Math.ceil(filteredProjects.length / projectsPerPage);
        setTotalPages(filteredTotalPages);

        const generateItems = () => {
            const newItems = [];
            for (let number = 1; number <= filteredTotalPages; number++) {
                newItems.push(
                    <Pagination.Item key={number} active={number === activePage} onClick={() => setActivePage(number)}>
                        {number}
                    </Pagination.Item>
                );
            }
            setItems(newItems);
        };

        generateItems();
        setActivePage(1); // Reset to first page when filters or search changes
    }, [filteredProjects, projectsPerPage, search]);

    const startIndex = (activePage - 1) * projectsPerPage;
    const currentProjects = filteredProjects.slice(startIndex, startIndex + projectsPerPage);

    return (
        <div className="container">
            <div className="panel">
                <div className="title">
                    <h1>Portfolio</h1>
                </div>
    
                <div className="filterbar">
                    <div>
                        <input
                            type="text"
                            placeholder="Search projects..."
                            style={{ borderRadius: "8px", height: "3rem", width: "300px" }}
                            value={search}
                            onChange={handleSearchChange}
                        />
                    </div>
    
                    <div style={{ position: 'relative', display: 'inline-block' }}>
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
                                                setSortBy(option);
                                                setIsSortModalOpen(false);
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
    
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2 className="modal-title" style={{ color: "black" }}>Filter Projects</h2>
                            <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        </div>
                        <div className="modal-body">
                            {Object.entries(allTags).map(([category, tags]) => (
                                <div key={category} className="tag-section">
                                    <h3 className="tag-title">{category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                                    <div className="tag-list">
                                        {tags.map((tag) => {
                                            const tagId = tag._id || tag.id || tag;
                                            const tagName = tag.name || tag.teamTitle || tag;
                                            return (
                                                <label key={tagId} className="tag-item">
                                                    <input
                                                        type="checkbox"
                                                        className="tag-checkbox"
                                                        checked={selectedTags.includes(tagId)}
                                                        onChange={() => toggleTag(tagId)}
                                                    />
                                                    <span className="tag-label">{tagName}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="modal-footer">
                            <button className="secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                            <button onClick={() => setIsModalOpen(false)}>Apply Filters</button>
                        </div>
                    </div>
                </div>
            )}
    
            {!isLoading && (
                <Projects
                    viewType={isListView ? 'list' : 'card'}
                    filter={search}
                    tags={selectedTags}
                    projects={currentProjects}
                />
            )}
    
            <div className="pagination1">
                <button-container
                    onClick={() => setActivePage(prev => Math.max(prev - 1, 1))}
                    disabled={activePage === 1}
                >
                    Previous
                </button-container>
                <span>{activePage} of {totalPages}</span>
                <button-container
                    onClick={() => setActivePage(prev => Math.min(prev + 1, totalPages))}
                    disabled={activePage === totalPages}
                >
                    Next
                </button-container>
            </div>
        </div>
    );
}    