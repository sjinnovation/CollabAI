import React, { useEffect, useState, useCallback } from "react"
import { useNavigate } from 'react-router-dom'
import typeWriter from './script.js'
import './style.css'
import { searchByAllFields } from "../../api/projectApi.js"
import debounce from 'lodash.debounce'

export default function HeroBanner() {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  const handleSearchChange = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  useEffect(() => {
    const cleanup = typeWriter();
    return () => cleanup();
  }, []);

  useEffect(() => {
    let isMounted = true;
    setError(null);

    const searchProjects = async () => {
      setIsLoading(true);
      try {
        const results = await searchByAllFields(searchTerm);
        if (isMounted) {
          console.log('Search results:', results.data);
          setSearchResults(results.data || []);
          setShowDropdown(results.data && results.data.length > 0);
        }
      } catch (error) {
        if (isMounted) {
          setError(error.message);
          console.error('Search error:', error);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (searchTerm) {
      searchProjects();
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }

    return () => {
      isMounted = false;
    };
  }, [searchTerm]);

  const filteredResults = {
    projects: [],
    clients: [],
    teams: []
  };

  const clientSet = new Set();

  searchResults.forEach(item => {
    if (item.name && item.name.toLowerCase().startsWith(searchTerm.toLowerCase())) {
      filteredResults.projects.push({ id: item._id, name: item.name, type: 'project' });
    }
    if (item.client_id && item.client_id.name && item.client_id.name.toLowerCase().startsWith(searchTerm.toLowerCase())) {
      if (!clientSet.has(item.client_id._id)) {
        filteredResults.clients.push({ id: item.client_id._id, name: item.client_id.name, type: 'client' });
        clientSet.add(item.client_id._id);
      }
    }
    if (item.team_id && item.team_id.teamTitle && item.team_id.teamTitle.toLowerCase().startsWith(searchTerm.toLowerCase())) {
      filteredResults.teams.push({ id: item.team_id._id, name: item.team_id.teamTitle, type: 'team' });
    }
  });

  const allResults = [...filteredResults.projects, ...filteredResults.clients, ...filteredResults.teams];
  const hasResults = allResults.length > 0;

  const handleItemClick = (item) => {
    switch (item.type) {
      case 'project':
        navigate(`/platform-management-feature/projectdetails/${item.id}`);
        break;
      case 'client':
        navigate(`/platform-management-feature/Client/${item.id}`);
        break;
      case 'team':
        navigate(`/platform-management-feature/Pod/${item.id}`);
        break;
      default:
        console.error('Unknown item type:', item.type);
    }
    setShowDropdown(false);
  };

  console.log('Render state:', { searchTerm, showDropdown, filteredResults });

  return (
    <div className="hero-container">
      <div className="content-wrapper">
        <div className="oval-background"></div>
        <div className="typing-container">
          <p id="typing" aria-live="polite"></p>
          <span className="cursor">|</span>
        </div>
        
        <div className="search-bar" style={{ position: 'relative', zIndex: 100 }}>
          <input 
            type="text" 
            className="search"
            placeholder="Search..." 
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{ 
              borderRadius: "8px", 
              height: "56px", 
              fontSize: "1.5rem", 
              paddingInline: "30px", 
              background: "transparent", 
              border: "1px #86858b solid", 
              color: "white" 
            }}
          />
          {showDropdown && hasResults && (
            <div className="dropdown" style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '0 0 8px 8px',
              maxHeight: '300px',
              overflowY: 'auto',
              zIndex: 1000
            }}>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {allResults.map((item, index) => (
                  <li 
                    key={`${item.type}-${index}`} 
                    onClick={() => handleItemClick(item)}
                    style={{
                      padding: '10px',
                      borderBottom: '1px solid #eee',
                      cursor: 'pointer',
                      color: 'black'
                    }}
                  >
                    {item.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

