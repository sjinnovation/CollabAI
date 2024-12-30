import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ProjectForm.css'; // Import the CSS file

const ProjectForm = () => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        status: '',
        start_time: '',
        end_time: '',
        budget: '',
        hr_taken: '',
        client_id: '',
        techStack: [],
        links: {
            links: '',
            github: '',
        },
        image_link: '',
        team_id: '',
        feature: [],
    });

    const [features, setFeatures] = useState([]); // State for features
    const [clients, setClients] = useState([]); // State for clients
    const [selectedClients, setSelectedClients] = useState([]); // State for selected clients
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);

    const featuresRef = useRef(); // Ref for features dropdown
    const techStackRef = useRef(); // Ref for tech stack dropdown

    const handleClickOutside = (event) => {
        if (featuresRef.current && !featuresRef.current.contains(event.target)) {
            setIsFeaturesDropdownVisible(false);
        }
        if (techStackRef.current && !techStackRef.current.contains(event.target)) {
            setIsTechStackDropdownVisible(false);
        }
        if (isDropdownVisible && !event.target.closest('.dropdown-check-list')) {
            setIsDropdownVisible(false);
        }
    };

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const [isFeaturesDropdownVisible, setIsFeaturesDropdownVisible] = useState(false);
    const [isTechStackDropdownVisible, setIsTechStackDropdownVisible] = useState(false);

    const toggleFeaturesDropdown = () => {
        setIsFeaturesDropdownVisible(!isFeaturesDropdownVisible);
    };

    const toggleTechStackDropdown = () => {
        setIsTechStackDropdownVisible(!isTechStackDropdownVisible);
    };

    const handleFeatureSelect = (featureId) => {
        setFormData((prevData) => ({
            ...prevData,
            feature: prevData.feature.includes(featureId)
                ? prevData.feature.filter(id => id !== featureId)
                : [...prevData.feature, featureId],
        }));
    };

    const handleTechStackSelect = (techId) => {
        setFormData((prevData) => ({
            ...prevData,
            techStack: prevData.techStack.includes(techId)
                ? prevData.techStack.filter(id => id !== techId)
                : [...prevData.techStack, techId],
        }));
    };

    const handleClientSelect = (clientId) => {
        setSelectedClients((prevSelected) => {
            if (prevSelected.includes(clientId)) {
                return prevSelected.filter(id => id !== clientId); // Remove if already selected
            } else {
                return [...prevSelected, clientId]; // Add if not selected
            }
        });
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const featuresResponse = await axios.get('http://localhost:4000/api/features');
                console.log(featuresResponse.data);
                const clientsResponse = await axios.get('http://localhost:4000/api/clients');
                console.log(clientsResponse);
                const techStackResponse = await axios.get('http://localhost:4000/api/techStacks');
                console.log(techStackResponse);
                const teamsResponse= await axios.get('http://localhost:4000/api/teams');

                setFeatures(featuresResponse.data || []); 
                setClients(clientsResponse.data || []);
                setFormData((prevData) => ({
                    ...prevData,
                    techStack: techStackResponse.data || [],
                }));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('/api/projects', formData);
            console.log('Project created:', response.data);
        } catch (error) {
            console.error('Error creating project:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="project-form">
            <h2 className="project-form-title">Create Project</h2>
            <div className="form-group">
                <label className="form-label">Name:</label>
                <input 
                    type="text" 
                    name="name" 
                    value={formData.name} 
                    onChange={handleChange} 
                    className="form-input" 
                    required 
                />
            </div>
            <div className="form-group">
                <label className="form-label">Description:</label>
                <textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    className="form-textarea" 
                    required 
                />
            </div>
            <div className="form-group">
                <label className="form-label">Status:</label>
                <input 
                    type="text" 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange} 
                    className="form-input" 
                    required 
                />
            </div>
            <div className="form-group">
                <label className="form-label">Start Time:</label>
                <input 
                    type="date" 
                    name="start_time" 
                    value={formData.start_time} 
                    onChange={handleChange} 
                    className="form-input form-date" 
                    required 
                />
            </div>
            <div className="form-group">
                <label className="form-label">End Time:</label>
                <input 
                    type="date" 
                    name="end_time" 
                    value={formData.end_time} 
                    onChange={handleChange} 
                    className="form-input form-date" 
                    required 
                />
            </div>
            <div className="form-group">
                <label className="form-label">Budget:</label>
                <input 
                    type="number" 
                    name="budget" 
                    value={formData.budget} 
                    onChange={handleChange} 
                    className="form-input form-number" 
                    required 
                />
            </div>
            <div className="form-group">
                <label className="form-label">Client:</label>
                <div className="dropdown-check-list client-dropdown">
                    <span 
                        className="dropdown-anchor" 
                        onClick={() => setIsDropdownVisible(!isDropdownVisible)}
                    >
                        {selectedClients.length > 0 ? 'Selected Clients' : 'Select Clients'}
                    </span>
                    {isDropdownVisible && (
                        <ul className="dropdown-items">
                            {clients.map(client => (
                                <li key={client._id} className="dropdown-item">
                                    <input
                                        type="checkbox"
                                        className="dropdown-checkbox"
                                        checked={selectedClients.includes(client._id)}
                                        onChange={() => handleClientSelect(client._id)}
                                    />
                                    {client.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Feature:</label>
                <div className="dropdown-check-list features-dropdown" ref={featuresRef}>
                    <span 
                        className="dropdown-anchor" 
                        onClick={toggleFeaturesDropdown}
                    >
                        {formData.feature.length > 0 ? 'Selected Features' : 'Select Features'}
                    </span>
                    {isFeaturesDropdownVisible && (
                        <ul className="dropdown-items">
                            {features.map(feature => (
                                <li key={feature._id} className="dropdown-item">
                                    <input
                                        type="checkbox"
                                        className="dropdown-checkbox"
                                        checked={formData.feature.includes(feature._id)}
                                        onChange={() => handleFeatureSelect(feature._id)}
                                    />
                                    {feature.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <div className="form-group">
                <label className="form-label">Tech Stack:</label>
                <div className="dropdown-check-list tech-stack-dropdown" ref={techStackRef}>
                    <span 
                        className="dropdown-anchor" 
                        onClick={toggleTechStackDropdown}
                    >
                        {formData.techStack.length > 0 ? 'Selected Tech Stack' : 'Select Tech Stack'}
                    </span>
                    {isTechStackDropdownVisible && (
                        <ul className="dropdown-items">
                            {formData.techStack.map(tech => (
                                <li key={tech._id} className="dropdown-item">
                                    <input
                                        type="checkbox"
                                        className="dropdown-checkbox"
                                        checked={formData.techStack.includes(tech._id)}
                                        onChange={() => handleTechStackSelect(tech._id)}
                                    />
                                    {tech.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
            <button type="submit" className="form-submit-btn">Create Project</button>
        </form>
    );
};

export default ProjectForm;
