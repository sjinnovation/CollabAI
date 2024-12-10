import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';
import './searchbar.scss';

export function SearchBar({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  return (
    <div className="searchContainer">
      <input
        type="text"
        placeholder="Search by client name, project, title, or skills..."
        value={searchTerm}
        onChange={handleSearch}
        className="searchInput"
      />
      <FaSearch className="searchIcon" />
    </div>
  );
}
