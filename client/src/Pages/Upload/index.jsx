import React,{useState} from 'react';
import './style.css';
import axios from 'axios';

const Upload = () => {
    const [file, setFile] = useState(null);
    const [uploadStatus, setUploadStatus] = useState('');

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) {
            setUploadStatus('Please select a file first.');
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        try {
            setUploadStatus('Uploading...');
            const response = await axios.post('/api/import', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setUploadStatus(response.data.message);
        } catch (error) {
            console.error('Error uploading file:', error);
            setUploadStatus('Error uploading file. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '500px', margin: 'auto', textAlign: 'center', }}>
            <h1>Upload Excel File</h1>
            <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                style={{ marginBottom: '20px' }}
            />
            <button onClick={handleUpload}>Upload</button>
            {uploadStatus && <p>{uploadStatus}</p>}
        </div>
    );
};

export default Upload;