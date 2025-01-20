import React, { useState } from 'react';
import { styled } from '@mui/material/styles';
import {
  Container,
  Typography,
  Button,
  TextField,
  Box,
  LinearProgress,
  Card,
  IconButton,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  CloudUpload,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFiles } from '../context/FileContext';

const UploadCard = styled(Card)(({ theme }) => ({
  maxWidth: 600,
  margin: '0 auto',
  padding: theme.spacing(4),
  textAlign: 'center',
  boxShadow: '0 4px 20px rgba(108, 99, 255, 0.1)',
}));

const DropZone = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(6),
  textAlign: 'center',
  backgroundColor: 'rgba(108, 99, 255, 0.02)',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  marginTop: theme.spacing(3),
  '&:hover': {
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
    borderColor: theme.palette.primary.dark,
  },
}));

const FileUpload = () => {
  const navigate = useNavigate();
  const { addFile } = useFiles();
  
  const [file, setFile] = useState(null);
  const [urlPath, setUrlPath] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [error, setError] = useState(null);

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    setFile(droppedFile);
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setError(null);
  };

  const removeFile = () => {
    setFile(null);
    setUploadComplete(false);
    setError(null);
  };

  const validateForm = () => {
    if (!file) {
      setError('Please select a file');
      return false;
    }
    if (!urlPath) {
      setError('Please enter a URL path');
      return false;
    }
    if (!urlPath.startsWith('/')) {
      setError('URL path must start with /');
      return false;
    }
    return true;
  };

  const handleUpload = async () => {
    if (!validateForm()) return;

    setUploading(true);
    setError(null);
    
    try {
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 200));
        setProgress(i);
      }

      addFile({ 
        file, 
        urlPath,
        uploadDate: new Date().toISOString()
      });
      
      setUploadComplete(true);
      setOpenSnackbar(true);

      setTimeout(() => {
        setFile(null);
        setUrlPath('');
        setProgress(0);
        setUploadComplete(false);
        navigate('/files');
      }, 1500);

    } catch (err) {
      setError('Upload failed. Please try again.');
      setUploading(false);
    }
  };

  return (
    <Container sx={{ mt: 10, p: 3 }}>
      <UploadCard>
        <Typography variant="h4" gutterBottom color="primary">
          Upload File
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Drag and drop your file or click to browse
        </Typography>

        <input
          type="file"
          id="file-input"
          hidden
          onChange={handleFileSelect}
        />
        <label htmlFor="file-input">
          <DropZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <CloudUpload sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
            <Typography variant="h6" color="primary" gutterBottom>
              {file ? 'File Selected' : 'Drop your file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse from your computer
            </Typography>
          </DropZone>
        </label>

        {file && (
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mt: 2,
            p: 2,
            bgcolor: 'rgba(108, 99, 255, 0.05)',
            borderRadius: 1
          }}>
            {uploadComplete && <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />}
            <Typography color="text.secondary">
              {file.name}
            </Typography>
            <IconButton
              size="small"
              onClick={removeFile}
              sx={{ ml: 1 }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        )}

        <TextField
          fullWidth
          variant="outlined"
          label="URL Path"
          value={urlPath}
          onChange={(e) => setUrlPath(e.target.value)}
          placeholder="/documents/example.pdf"
          error={Boolean(error && !urlPath)}
          helperText={error && !urlPath ? error : ''}
          sx={{ mt: 3, mb: 2 }}
        />

        {uploading && (
          <LinearProgress 
            variant="determinate" 
            value={progress}
            sx={{ mt: 3, borderRadius: 1 }}
          />
        )}

        {error && (
          <Typography color="error" sx={{ mt: 2 }}>
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || !urlPath || uploading}
          startIcon={<CloudUpload />}
          sx={{ mt: 3, px: 4, py: 1.5 }}
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </UploadCard>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={3000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity="success" 
          variant="filled"
          sx={{ width: '100%' }}
        >
          File uploaded successfully!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FileUpload;