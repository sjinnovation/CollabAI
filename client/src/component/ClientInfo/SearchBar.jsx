import React from 'react';
import { FaSearch } from "react-icons/fa";

const SearchBar = ({ searchQuery, setSearchQuery, handleSearchSubmit }) => (
  <div className="search-section">
    <form onSubmit={handleSearchSubmit} className="search-form">
        <div className="searchWrapper1">
                        <FaSearch className="searchIcon1" />
                        <input
                          type="text"
                          placeholder="Search projects..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="searchInput1"
                        />
                      </div>
    </form>
  </div>
);

export default SearchBar;

