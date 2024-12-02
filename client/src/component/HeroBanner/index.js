'use client'

import React, { useEffect, useState } from "react";
import  typeWriter  from './script.js';
import './style.css';

const HeroBanner = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const totalSlides = 6; // Increased number of slides for better demonstration

  useEffect(() => {
    typeWriter();

    const carouselInterval = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => {
      clearInterval(carouselInterval);
      const typingElement = document.getElementById('typing');
      if (typingElement) {
        typingElement.innerHTML = "";
      }
    };
  }, []);

  return (
    <div className="hero-container">
      <div className="content-wrapper">
        <p id="typing"></p>
        <div className="carousel-container">
          <div 
            className="carousel-wrapper"
            style={{ transform: `translateX(-${currentSlide * (100 / 3)}%)` }}
          >
            {[1, 2, 3, 4, 5, 6].map((index) => (
              <div key={index} className="carousel-slide">
                <div className="carousel-slide-content">
                  <h3>Portfolio {index}</h3>
                  <p>This is a sample portfolio item {index}.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;

