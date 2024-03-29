import React, { useState, useCallback } from 'react';
import { Input } from 'antd';
import debounce from 'lodash/debounce';

const { Search } = Input;

const DebouncedSearchInput = ({ data }) => {
  const { search, setSearch, loading ,placeholder  } = data;

  const handleSearch = useCallback(
    debounce(value => {
      setSearch(value);
    }, 500),
    []
  );

  return (
    <Search
      placeholder={placeholder}
      allowClear
      onChange={e => handleSearch(e.target.value)}
      onSearch={value => setSearch(value)}
      style={{
        width: 304,
      }}
      loading={loading}
    />
  );
};

export default DebouncedSearchInput;