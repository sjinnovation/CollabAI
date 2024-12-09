// client/src/component/HeroBanner/index.js
'use client'

import React, { useEffect, useState, useCallback } from "react"
import typeWriter from './script.js'
import './style.css'

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [searchTerm, setSearchTerm] = useState(''); // State for search term

  useEffect(() => {
    const cleanup = typeWriter();
    return () => cleanup();
  }, []);

  return (
    <div className="hero-container">
      <div className="content-wrapper">
        <div className="oval-background"></div>
        <div className="typing-container">
          <p id="typing" aria-live="polite"></p>
          <span className="cursor">|</span>
        </div>
        
        {/* Search Bar */}
        <div className="search-bar" style={{ position: 'relative', zIndex: 100 }}>
          <input 
            type="text" 
            className="search"
            placeholder="Search..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            style={{ borderRadius: "8px", height: "56px", width: "700px", fontSize: "1.5rem",paddingInline:"30px",background:"transparent",border:"1px #86858b solid" }} // Increased size
          />
        </div>

        {/* Carousel Code (commented out) */}
        {/* 
        <div className="carousel-container" aria-roledescription="carousel">
          <div 
            className="carousel-wrapper"
            style={{ transform: `translateX(-${currentSlide * (100 / TOTAL_SLIDES)}%)` }}
          >
            {Array.from({ length: TOTAL_SLIDES }, (_, index) => (
              <div 
                key={index} 
                className="carousel-slide" 
                aria-roledescription="slide" 
                aria-label={`Slide ${getSlideIndex(index) + 1} of ${TOTAL_SLIDES}`}
              >
                <div className="carousel-slide-content">
                  <h3>Portfolio {getSlideIndex(index) + 1}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
        */}
      </div>
    </div>
  )
}