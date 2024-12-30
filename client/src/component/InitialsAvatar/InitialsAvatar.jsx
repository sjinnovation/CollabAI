import React from 'react';

export const InitialsAvatar = ({ name, className = '', style = {} }) => {
  const getInitials = (name) => {
    if (!name) return '';
    const words = name.split(' ');
    return words.length === 1
      ? words[0][0].toUpperCase()
      : `${words[0][0]}${words[1][0]}`.toUpperCase();
  };

  return (
    <div
      className={`initials-avatar ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ccc',
        color: '#333',
        borderRadius: '0%',
        width: '100%',
        height: '100%',
        fontWeight: 'bold',
        fontSize: '84px',
        ...style,
      }}
    >
      {getInitials(name)}
    </div>
  );
};

export default InitialsAvatar;
