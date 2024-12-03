'use client'

import React, { useEffect, useState, useCallback } from "react"
import  typeWriter  from './script.js'
import './style.css'

const TOTAL_SLIDES = 6
const VISIBLE_SLIDES = 3
const SLIDE_INTERVAL = 2000

export default function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = useCallback(() => {
    setCurrentSlide((prevSlide) => (prevSlide + 1) % TOTAL_SLIDES)
  }, [])

  useEffect(() => {
    const cleanup = typeWriter()
    const carouselInterval = setInterval(nextSlide, SLIDE_INTERVAL)

    return () => {
      clearInterval(carouselInterval)
      cleanup()
    }
  }, [nextSlide])

  const getSlideIndex = (index) => {
    return (index + TOTAL_SLIDES) % TOTAL_SLIDES
  }

  return (
    <div className="hero-container">
      <div className="content-wrapper">
        <div class="oval-background"></div>
        <div className="typing-container">
        

          <p id="typing" aria-live="polite"></p>
          <span className="cursor">|</span>
        </div>
        <div className="carousel-container" aria-roledescription="carousel">
          <div 
            className="carousel-wrapper"
            style={{ transform: `translateX(-${currentSlide * (100 / VISIBLE_SLIDES)}%)` }}
          >
            {Array.from({ length: TOTAL_SLIDES + VISIBLE_SLIDES }, (_, index) => (
              <div 
                key={index} 
                className="carousel-slide" 
                aria-roledescription="slide" 
                aria-label={`Slide ${getSlideIndex(index) + 1} of ${TOTAL_SLIDES}`}
              >
                <div className="carousel-slide-content">
                  <h3>Portfolio {getSlideIndex(index) + 1}</h3>
                  <p>This is a sample portfolio item {getSlideIndex(index) + 1}.</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

