import React from "react";
import "./style.css";
import navigate from "react-router-dom"


const NewNavbar = () => {
  return <div className="new-navbar">
    <div className="logo">
    Portfolio
    </div>
    <div className="tabs">
        <div className="tab">Home</div>
        <div className="tab"><a href="/form">Tab 2</a></div>
        <div className="tab">Collab AI</div>
    
    </div>
  </div>;
};

export default NewNavbar;
