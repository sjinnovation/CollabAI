import React from 'react';

export const Avatar = ({ src, alt, fallback, className }) => (
  <div className={`avatar ${className}`}>
    {src ? (
      <img className="avatar-image" alt={alt} src={src} />
    ) : (
      <div className="avatar-fallback">
        {fallback}
      </div>
    )}
  </div>
);

export const Avatars = ({ src, alt, fallback, className }) => (
  <div className={`avatars ${className}`}>
    {src ? (
      <img className="avatar-image" alt={alt} src={src} />
    ) : (
      <div className="avatar-fallback">
        {fallback}
      </div>
    )}
  </div>
);
