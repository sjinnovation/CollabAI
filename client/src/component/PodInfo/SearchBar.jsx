import React from 'react';

export const SearchBar = ({ searchTerm, onSearchChange }) => {
  return (
    <div className="searchBarContainer">
      <input
        type="text"
        placeholder="Search pods..."
        value={searchTerm}
        onChange={onSearchChange}
        className="searchInput"
      />
    </div>
  );
};

