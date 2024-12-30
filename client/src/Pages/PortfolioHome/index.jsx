import React from "react";
import { HeroBanner, ContentPage } from "../../component";
import "./style.css";

const PortfolioHome = () => {
  return (
    <div className="scroll-container">
      <section className="scroll-section">
        <HeroBanner />
      </section>
      <section className="scroll-section">
        <ContentPage />
      </section>
    </div>
  );
};

export default PortfolioHome;
