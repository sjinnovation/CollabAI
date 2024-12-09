import React from 'react';

const Badge = ({ children, className }) => (
  <span className={`badge ${className}`}>
    {children}
  </span>
);

export default Badge;