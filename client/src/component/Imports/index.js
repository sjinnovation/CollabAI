import React,{useState} from 'react';
import { handleFileChange } from '../KnowledgeBase/FileHelpers';


const Imports=()=>
    
{
    const [file,setfile] = useState(null);
    const [uploadStatus,setUploadStatus] = useState('');

    const handleFileChange =(event)=>
    {
        setfile(event.target.files[0]);
    }

    const handleUpload =()=>
    {
        if(!file)
        {
            setUploadStatus('Please select a file first.');
            return;
        }
        

    }
    
    return (
        <div>
            
            <h1>Import </h1>
            <input type="file" accept=".xlsx" onChange={handleFileChange} style={{marginBottom:"20px"}}/>
            <button onClick={handleFileChange}>Upload</button>
            {/* {uploadStatus && <p>{uploadStatus} </p>} */}

        </div>
    )
}

export default Imports;