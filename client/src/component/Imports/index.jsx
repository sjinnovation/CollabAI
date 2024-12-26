import React, { useState, useEffect } from 'react';
import './styles.css';
import { useNavigate } from "react-router-dom";
const PopupAlert = ({ message, type }) => (
  <div className={`popupAlertss ${type === 'error' ? 'errorAlertss' : 'successAlertss'}`}>
    {message}
  </div>
);

export default function ImportForm() {
   const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessages, setSuccessMessages] = useState([]);
  const [importComplete, setImportComplete] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (successMessages.length > 0) {
      const timer = setTimeout(() => {
        setSuccessMessages([]);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessages]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setError(null);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to import');
      return;
    }

    setImporting(true);
    setError(null);
    setSuccessMessages([]);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:8011/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred during import');
      }

      setSuccessMessages(data.results);
      setImportComplete(true);
      
      // Navigate to success page after 5 seconds
      setTimeout(() => {
        navigate(`/platform-management-feature/portfolio`);
      }, 5000);
    } catch (err) {
      setError(err.message || 'An unknown error occurred');
      setImportComplete(false);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="containerss">
      <div className="cardsss">
        <h1 className="titless" style={{color:'black',fontWeight:'bold'}}>Import Projects</h1>
        <form onSubmit={handleSubmit} className="formss">
          <div className="dropzoness">
            <div className="uploadIconss">📁</div>
            <div>
              <label htmlFor="file-upload" className="upload-label">
                Click to upload
              </label>
              <span> or drag and drop your file here</span>
            </div>
            <input
              id="file-upload"
              type="file"
              className="fileInputss"
              onChange={handleFileChange}
              accept=".xlsx,.xls"
            />
            {file && (
              <div className="fileNamess">
                Selected: {file.name}
              </div>
            )}
          </div>

          {error && <PopupAlert message={error} type="error" />}

          {successMessages.map((message, index) => (
            <PopupAlert key={index} message={message} type="success" />
          ))}

          <div className="buttonContainerss">
            <button type="button" className="buttonss cancelButtonss">
              Cancel
            </button>
            <button
              type="submit"
              className={`buttonss submitButtonss ${
                importing || !file ? 'disabledButtonss' : ''
              }`}
              disabled={importing || !file}
            >
              {importing ? 'Importing...' : 'Upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

