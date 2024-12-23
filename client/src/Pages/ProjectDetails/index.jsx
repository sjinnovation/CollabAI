import React from 'react';
import './styles.css'

import {DetailsContent,DetailsBanner,NewNavbar} from '../../component';


const ProjectDetails=()=>{
return(
    <>
        <NewNavbar ></NewNavbar>
      
        <DetailsBanner></DetailsBanner>
        <div className="content">
        <DetailsContent></DetailsContent>
        </div>

    </>
   
)
}

export default ProjectDetails;