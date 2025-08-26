import React, { useState, useCallback } from 'react';
import { Input } from 'antd';
import debounce from 'lodash/debounce';

const { Search } = Input;

const DebouncedSearchInput = ({ data }) => {
  const { search, setSearch, loading ,placeholder, customStyle ,size="default"  } = data;

  const handleSearch = useCallback(
    debounce(value => {
      setSearch(value);
    }, 1500),
    []
  );

  return (
    <Search
      placeholder={placeholder}
      size = {size}
      allowClear
      onChange={e => handleSearch(e.target.value)}
      onSearch={value => setSearch(value)}
      style={{
        maxWidth : customStyle?.width || 300,
        maxHeight : customStyle?.maxHeight |40,
        height : customStyle?.height | 40,
      }}
      loading={loading}
      enterButton      
    />
  );
};

export default DebouncedSearchInput;