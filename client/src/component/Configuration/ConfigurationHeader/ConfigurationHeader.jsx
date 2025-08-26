import React from "react";
import './configurationHeader.css'

const ConfigurationHeader = ({title, subHeading}) => {
  return (
    <div className="config-header-section">
      <h2 className="config-component-title">{title}</h2>
      <p className="config-component-subtitle">
        {subHeading}
      </p>
    </div>
  );
};

export default ConfigurationHeader;