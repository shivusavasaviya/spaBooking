import React, { useState, useEffect } from 'react';
import useDebounce from '../../hooks/useDebounce';

const SearchBar = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    onSearch(debouncedQuery);
  }, [debouncedQuery, onSearch]);

  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="Search clients, therapists..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
};

export default SearchBar;