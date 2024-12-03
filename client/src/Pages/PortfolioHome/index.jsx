import React from "react";
import {HeroBanner,NewNavbar,ContentPage} from "../../component";
import "./style.css"
const PortfolioHome = () => {
  return (
    <div>
      <NewNavbar/>
      <div className="scroll-container">
        <section className="scroll-section"><HeroBanner/></section>
        <section className="scroll-section"><ContentPage/></section>
      </div>
    </div>
  );
};

export default PortfolioHome;
