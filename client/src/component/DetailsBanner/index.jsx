import React from 'react';
import './styles.css';
import { useParams } from 'react-router-dom';
import {InitialsAvatar} from '../../component/InitialsAvatar/InitialsAvatar'
import { useEffect ,useState} from 'react';
import { fetchProjectById } from '../../api/projectApi';

const DetailsBanner=()=>
{
    const { id } = useParams();
    const [project, setProject] = useState(null);
    useEffect(()=>{
        const fetchData=async ()=>
            {
                try{
                    const response=await fetchProjectById(id);
                    setProject(response);
                }
                catch(error){
                    console.error('Error fetching project:', error);
                    setProject(null); // Handle potential issues gracefully
                }

            }
            fetchData();
        },[id]);
        if (!project) {
            return <div>Loading project details...</div>;
          }

    return(
        <>
        <div className="details-banner">
        <div className="project-image-wrappers">
           {project.image_link ? (
                      <img
                        src={project.image_link}
                        alt={project.name}
                        className="image-styles"
                      />
                    ) : (
                      <InitialsAvatar name={project.name} style={{height:"100%"}} className="image-placeholder" />
           )}
          <div className="project-image-overlay" />
        </div>

        </div>
        </>

    )
}

export default DetailsBanner;