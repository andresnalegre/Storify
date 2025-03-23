import React, { useState, useRef } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  CloudUpload,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import Notifications from './Notifications';
import '../styles/styles.css';

const UploadCard = styled(Card)(({ theme }) => ({
  maxWidth: 500,
  width: '100%',
  padding: theme.spacing(4),
  borderRadius: 12,
  boxShadow: '0 4px 20px rgba(108, 99, 255, 0.1)',
  backgroundColor: '#fff',
  textAlign: 'center',
}));

const DropZone = styled('div')(({ theme }) => ({
  border: `2px dashed ${theme.palette.primary.main}`,
  borderRadius: 8,
  padding: theme.spacing(5),
  backgroundColor: 'rgba(108, 99, 255, 0.02)',
  cursor: 'pointer',
  transition: 'background-color 0.3s ease, border-color 0.3s ease',
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
  const [error, setError] = useState(null);
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [existingFileData, setExistingFileData] = useState(null);

  const notificationsRef = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (file) => {
    if (!file) return;

    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('The file is too large. Please select a file smaller than 100MB.');
      return;
    }

    setFile(file);
    setError(null);
  };

  const removeFile = () => {
    setFile(null);
    setUploadComplete(false);
    setError(null);
  };

  const validateForm = () => {
    if (!file) {
      setError('Please choose a file to upload.');
      return false;
    }
    if (!urlPath) {
      setError('Please provide a URL path for the file.');
      return false;
    }
    if (!urlPath.startsWith('/')) {
      setError('The URL path should start with a "/" character.');
      return false;
    }
    return true;
  };

  const handleUploadSuccess = (data) => {
    setProgress(100);
    setUploadComplete(true);
    notificationsRef.current.showSnackbar('Your file has been uploaded successfully!', 'success');

    addFile(data.file);

    setTimeout(() => {
      setFile(null);
      setUrlPath('');
      setProgress(0);
      setUploadComplete(false);
      navigate('/files');
    }, 1500);
  };

  const handleUpload = async (replace = false) => {
    if (!validateForm()) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('path', urlPath);
      if (replace) {
        formData.append('replace', 'true');
      }

      const simulateProgress = () => {
        setProgress((prevProgress) => {
          if (prevProgress >= 90) {
            return prevProgress;
          }
          return prevProgress + 10;
        });
      };

      const progressInterval = setInterval(simulateProgress, 200);

      const response = await fetch('http://localhost:8000/fileUpload.php', {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        throw new Error(`Upload failed: HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        handleUploadSuccess(data);
      } else if (data.error === 'FILE_EXISTS') {
        setExistingFileData(data.existingFile);
        setOpenConfirmDialog(true);
      } else {
        throw new Error(data.error || 'Upload failed');
      }

    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message);
      notificationsRef.current.showSnackbar(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmReplace = async () => {
    setOpenConfirmDialog(false);
    await handleUpload(true);
  };

  return (
    <Container className="file-upload-container">
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
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv"
        />
        <label htmlFor="file-input">
          <DropZone
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            <CloudUpload className="file-upload-dropzone-icon" />
            <Typography variant="h6" color="primary" gutterBottom>
              {file ? 'File Selected' : 'Drop your file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse from your computer
            </Typography>
            <Typography variant="caption" color="text.secondary" className="file-upload-textfield-margin">
              Maximum file size: 100MB
            </Typography>
          </DropZone>
        </label>

        {file && (
          <Box className="file-upload-info-box">
            {uploadComplete && <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />}
            <Typography color="text.secondary">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
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
          className="file-upload-textfield-margin"
        />

        {uploading && (
          <LinearProgress 
            variant="determinate" 
            value={progress}
            className="file-upload-linear-progress"
          />
        )}

        {error && (
          <Typography color="error" className="file-upload-error-text">
            {error}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          onClick={() => handleUpload(false)}
          disabled={!file || !urlPath || uploading}
          startIcon={<CloudUpload />}
          className="file-upload-button"
        >
          {uploading ? 'Uploading...' : 'Upload File'}
        </Button>
      </UploadCard>

      <Dialog
        open={openConfirmDialog}
        onClose={() => setOpenConfirmDialog(false)}
      >
        <DialogTitle>Replace Existing File?</DialogTitle>
        <DialogContent>
          <Typography>
            A file with the name "{existingFileData?.name}" already exists in this location.
            Do you want to replace it?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenConfirmDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleConfirmReplace} color="primary" variant="contained">
            Replace
          </Button>
        </DialogActions>
      </Dialog>

      <Notifications ref={notificationsRef} />
    </Container>
  );
};

export default FileUpload;