import React, { useState } from 'react';
import "./styles.css"
import Projects from '../Projects';
 
export default function ContentPage()
{
    return (
     
            <div className="container">
                 <h1 style={{marginTop:"100px"}}>Portfolio</h1>
            <div className='panel'>
           
            <p>This is your portfolio page.</p>
            <input type="search" style={{ borderRadius: "5%" }} />
            <label class="switch">
            <input type="checkbox"/>
            <span class="slider round"></span>
            </label>
            </div>
           
            <Projects />
            </div>
      
    );
}