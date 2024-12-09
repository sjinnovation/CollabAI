import React from 'react';

const Button = ({ children, className, ...props }) => (
  <button
    className={`buttons ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;

