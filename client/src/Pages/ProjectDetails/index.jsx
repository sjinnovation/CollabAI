import React from 'react';
import './styles.css'

import {DetailsContent,DetailsBanner} from '../../component';


const ProjectDetails=()=>{
return(
    <div className="scroll-container">
        <DetailsBanner></DetailsBanner>
        <div className="content">
        <DetailsContent></DetailsContent>
        </div>

 </div>
   
)
}

export default ProjectDetails;