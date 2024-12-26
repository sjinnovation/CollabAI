import React, { useState } from 'react';
import { Button, Card, CardContent, Typography, TextField, Alert, AlertTitle } from '@mui/material';
import { Upload, InsertDriveFile } from '@mui/icons-material';

export default function Imports() {
const [file, setFile] = useState(null);
const [importing, setImporting] = useState(false);
const [results, setResults] = useState([]);
const [error, setError] = useState(null);

const handleFileChange = (event) => {
if (event.target.files && event.target.files[0]) {
setFile(event.target.files[0]);
setError(null);
}
};

const handleSubmit = async (event) => {
event.preventDefault();
if (!file) {
setError('Please select a file to import');
return;
}


setImporting(true);
setError(null);
setResults([]);

const formData = new FormData();
formData.append('file', file);


try {
  const response = await fetch('http://localhost:4000/api/import', {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'An error occurred during import');
  }

  setResults(data.results);
} catch (err) {
  setError(err.message || 'An unknown error occurred');
} finally {
  setImporting(false);
}
};

return (
<Card sx={{ maxWidth: 600, margin: 'auto', mt: 4 }}>
<CardContent>
<Typography variant="h5" component="div" gutterBottom>
Import Excel Data
</Typography>
<form onSubmit={handleSubmit}>
<TextField
type="file"
inputProps={{ accept: '.xlsx, .xls' }}
onChange={handleFileChange}
fullWidth
margin="normal"
/>
<Button
type="submit"
variant="contained"
color="primary"
disabled={importing || !file}
startIcon={importing ? <Upload /> : <InsertDriveFile />}
>
{importing ? 'Importing...' : 'Import'}
</Button>


      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}

      {results.length > 0 && (
        <Alert severity="success" sx={{ mt: 2 }}>
          <AlertTitle>Import Results</AlertTitle>
          <ul>
            {results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ul>
        </Alert>
      )}
    </form>
  </CardContent>
</Card>
);
}

