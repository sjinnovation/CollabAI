import React from 'react';
import './styles.css'

import {DetailsContent,DetailsBanner,NewNavbar} from '../../component';


const ProjectDetails=()=>{
return(
    <>
        <NewNavbar ></NewNavbar>
        <div>
        <DetailsBanner></DetailsBanner>
        <DetailsContent></DetailsContent>
        </div>

    </>
   
)
}

export default ProjectDetails;