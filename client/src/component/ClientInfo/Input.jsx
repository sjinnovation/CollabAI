import React from 'react';

const Input = ({ className, ...props }) => (
  <input
    className={`input ${className}`}
    {...props}
  />
);

export default Input;

