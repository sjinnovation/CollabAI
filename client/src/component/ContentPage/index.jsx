import React, { useState } from 'react';
import "./styles.css"
import Projects from '../Projects';
 
export default function ContentPage()
{
    return (
     
            <div className="container">
            <h1 style={{margin:"50px 0"}}>Portfolio</h1>
            <p>This is your portfolio page.</p>
            <Projects />
            </div>
      
    );
}