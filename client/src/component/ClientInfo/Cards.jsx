import React from 'react';

export const Cardss = ({ children, className }) => (
  <div className={`cardss ${className}`}>
    {children}
  </div>
);

export const Cards = ({ children, className }) => (
  <div className={`cards ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ children, className }) => (
  <div className={`card-content ${className}`}>{children}</div>
);

export const CardFooter = ({ children, className }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);

