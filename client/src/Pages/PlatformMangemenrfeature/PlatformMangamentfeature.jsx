import React from 'react';
import NewNavbar from '../../component/NewNavbar';

const PlatformManagementfeature = ({ children }) => {
  return (
    <>
      <NewNavbar />
      <div className="my-feature-content" style={{backgroundColor:' black'}}>
        {children}
      </div>
    </>
  );
};

export default PlatformManagementfeature;
