import React from 'react';
import { FaSearch } from "react-icons/fa";
import Button from './Button';
import Input from './Input';

const SearchBar = ({ searchQuery, setSearchQuery, handleSearchSubmit }) => (
  <div className="search-section">
    <form onSubmit={handleSearchSubmit} className="search-form">
      <Input
        type="text"
        placeholder="Search projects..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="search-input"
      />
      <Button type="submit" className="search-button">
        <FaSearch className="search-icon" />
      </Button>
    </form>
  </div>
);

export default SearchBar;

