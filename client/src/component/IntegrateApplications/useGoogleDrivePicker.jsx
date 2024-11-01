import { useContext } from 'react';
import useDrivePicker from 'react-google-drive-picker';
import { FileContext } from '../../contexts/FileContext';

const useGoogleDrivePicker = (handlePicked) => {
  const {token,setToken} = useContext(FileContext);
  const [openPicker] = useDrivePicker();
const mimeTypes = [
          'application/pdf', // PDF
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
          'text/plain', // TXT
          'text/csv', // CSV
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
      ]
  const handleOpenPicker = (apiKey) => {
    openPicker({
      clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
      developerKey: apiKey,
      customScopes: [
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/drive.readonly',
        'https://www.googleapis.com/auth/drive.metadata.readonly',
        'profile', 
        'email', 
        'https://www.googleapis.com/auth/drive', 
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email',
      ],

      viewId: 'DOCS',
      token: token,
      showUploadView: false,
      multiselect: true,
      // Specify allowed mime types
      viewMimeTypes : 'application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.google-apps.spreadsheet,application/vnd.google-apps.presentation,application/vnd.google-apps.document,application/vnd.openxmlformats-officedocument.presentationml.presentation',

      supportDrives: true,
      multiselect: true,
      onAuthenticate: () => console.log('Authentication successful'),
      onError: (error) => console.log('Error loading picker:', error),
      callbackFunction: (data) => {
        if (data.action === 'cancel') {
          console.log('User clicked cancel/close button');
        }
        handlePicked(data);
      },
    });
  };

  return handleOpenPicker;
};

export default useGoogleDrivePicker;
