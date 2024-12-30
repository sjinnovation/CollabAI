import React, { useCallback, useEffect, useState } from 'react';
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ searchQuery, setSearchQuery, projects, setFilteredProjects }) => {
  const handleSearchChange = useCallback(
    (e) => {
      const query = e.target.value.trim().toLowerCase();
      setSearchQuery(query);

      if (query) {
        const filtered = projects.filter((project) => {
          const techStackIncludes = project.techStack.some((tech) =>
            tech.name.toLowerCase().includes(query)
          );
          return (
            project.name.toLowerCase().includes(query) ||
            project.description.toLowerCase().includes(query) ||
            project.status.toLowerCase().includes(query) ||
            techStackIncludes
          );
        });
        setFilteredProjects(filtered);
      } else {
        setFilteredProjects(projects);
      }
    },
    [setSearchQuery, setFilteredProjects, projects]
  );

  return (
    <div className="search-section">
      <form className="search-form">
        <div className="searchWrapper1">
          <FaSearch className="searchIcon1" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="searchInput1"
          />
        </div>
      </form>
    </div>
  );
};

export default SearchBar;
