import React, { useState, useEffect } from 'react';
import "./styles.css"
import Projects from '../Projects';
import projectsData from '../data/projects.json';  
import Pagination from 'react-bootstrap/Pagination'; // Import Pagination

export default function ContentPage()
{
    const [isListView, setIsListView] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [activePage, setActivePage] = useState(1); 
    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const toggleTag = (tag) => {
        setSelectedTags(prevTags => 
            prevTags.includes(tag) 
                ? prevTags.filter(t => t !== tag) 
                : [...prevTags, tag]
        );
    };

    // Extract unique tags from existing projects
    const allTags = [...new Set(projectsData.projects.flatMap(project => project.tags || []))];

    // Calculate total pages based on projects data

    const [items, setItems] = useState([]); // State to hold pagination items
    const [projectsPerPage, setProjectsPerPage] = useState(6); // State to hold projects per page
    const [totalPages, setTotalPages] = useState(0); // State to hold total pages

    useEffect(() => {
        const handleResize = () => {
            const newProjectsPerPage = window.innerWidth < 1017 ? 6 : 6;
            setProjectsPerPage(newProjectsPerPage);
        };

        window.addEventListener('resize', handleResize);

        // Calculate total pages based on initial screen size
        const initialTotalPages = Math.ceil(projectsData.projects.length / projectsPerPage);
        setTotalPages(initialTotalPages);

        // Generate pagination items
        const generateItems = () => {
            const newItems = [];
            for (let number = 1; number <= initialTotalPages; number++) {
                newItems.push(
                    <Pagination.Item key={number} active={number === activePage} onClick={() => setActivePage(number)}>
                        {number}
                    </Pagination.Item>,
                );
            }
            setItems(newItems);
        };

        generateItems();

        return () => window.removeEventListener('resize', handleResize);
    }, [activePage, projectsPerPage]);

    // Calculate the projects to display for the current page
    const startIndex = (activePage - 1) * projectsPerPage;
    const currentProjects = projectsData.projects.slice(startIndex, startIndex + projectsPerPage);

    return (
        <div className="container">
           
            <div className='panel'>
                <div className='title'>
                    <h1>Portfolio</h1>
                </div>

                <div className='filterbar'>
                {/* Search Input */}
                <input 
                type="text" 
                placeholder="Search projects..." 
                style={{ borderRadius: "16px",height:"3rem",width:"300px" }} 
                value={searchTerm} 
                onChange={handleSearchChange}
                 />
                 <a style={{color:'white'}}><u>Sort</u></a>
                <a style={{color:'white'}} onClick={() => setIsModalOpen(true)}><u>Filter</u></a>
                <label className="switch">
                    <input 
                        type="checkbox" 
                        checked={isListView}
                        onChange={(e) => setIsListView(e.target.checked)}
                    />
                    <span className="slider round"></span>
                </label>
                </div>
            </div>

            {/* Filter Modal */}
            {isModalOpen && (
                <div className="modal">
                    <div className="modal-content">
                        <span className="close" onClick={() => setIsModalOpen(false)}>&times;</span>
                        <h2>Filter Projects</h2>
                        <div>
                            <h5>Select Tags:</h5>
                            {allTags.map(tag => (
                                <label key={tag}>
                                    <input 
                                        type="checkbox" 
                                        checked={selectedTags.includes(tag)} 
                                        onChange={() => toggleTag(tag)} 
                                    />
                                    {tag}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <Projects 
                viewType={isListView ? 'list' : 'card'} 
                filter={searchTerm} 
                tags={selectedTags} 
                projects={currentProjects}
            />

            <Pagination>{items}</Pagination> {/* Render pagination here */}
        </div>
    );
}