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
  Alert,
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
  const { addFile, replaceFile, maxFileSize } = useFiles();

  const [file, setFile] = useState(null);
  const [urlPath, setUrlPath] = useState('/');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState('');
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [existingFileData, setExistingFileData] = useState(null);

  const notificationsRef = useRef();

  const maxSizeInMb = (maxFileSize / (1024 * 1024)).toFixed(0);

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

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    if (selectedFile.size > maxFileSize) {
      setError(`File exceeds the ${maxSizeInMb}MB limit for this demo.`);
      return;
    }

    setFile(selectedFile);
    setError('');
    setUploadComplete(false);
  };

  const removeFile = () => {
    setFile(null);
    setUploadComplete(false);
    setError('');
    setProgress(0);
  };

  const validateForm = () => {
    if (!file) {
      setError('Please select a file to upload.');
      return false;
    }

    if (!urlPath.trim()) {
      setError('Please enter a path for the file.');
      return false;
    }

    if (!urlPath.startsWith('/')) {
      setError('Path must start with "/".');
      return false;
    }

    return true;
  };

  const startFakeProgress = () => {
    setProgress(15);

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 85) {
          clearInterval(interval);
          return prev;
        }
        return prev + 10;
      });
    }, 120);

    return interval;
  };

  const handleUploadSuccess = () => {
    setProgress(100);
    setUploadComplete(true);

    notificationsRef.current?.showSnackbar('File saved successfully.', 'success');

    setTimeout(() => {
      setFile(null);
      setUrlPath('/');
      setProgress(0);
      setUploadComplete(false);
      navigate('/files');
    }, 1200);
  };

  const handleUpload = async (replace = false) => {
    if (!validateForm()) return;

    setUploading(true);
    setError('');

    const progressInterval = startFakeProgress();

    try {
      const result = replace
        ? await replaceFile({ file, urlPath }, existingFileData?.id)
        : await addFile({ file, urlPath });

      clearInterval(progressInterval);

      if (result.success) {
        handleUploadSuccess(result.file);
      } else if (result.error === 'FILE_EXISTS') {
        setExistingFileData(result.existingFile);
        setOpenConfirmDialog(true);
        setProgress(0);
      } else {
        throw new Error(result.error || 'Upload failed.');
      }
    } catch (err) {
      clearInterval(progressInterval);
      console.error(err);
      setProgress(0);
      setError(err.message);
      notificationsRef.current?.showSnackbar(err.message, 'error');
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
          Drag and drop your file or click to select
        </Typography>

        <Box sx={{ mt: 2 }}>
          <Alert severity="info">
            Demo project — localStorage only.
          </Alert>
        </Box>

        <input
          type="file"
          id="file-input"
          hidden
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv"
        />

        <label htmlFor="file-input">
          <DropZone onDrop={handleDrop} onDragOver={handleDragOver}>
            <CloudUpload className="file-upload-dropzone-icon" />
            <Typography variant="h6" color="primary" gutterBottom>
              {file ? 'File selected' : 'Drop your file here'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse from your computer
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              className="file-upload-textfield-margin"
            >
              Demo limit: {maxSizeInMb}MB per file
            </Typography>
          </DropZone>
        </label>

        {file && (
          <Box className="file-upload-info-box">
            {uploadComplete && (
              <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
            )}
            <Typography color="text.secondary">
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)}MB)
            </Typography>
            <IconButton size="small" onClick={removeFile} sx={{ ml: 1 }}>
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
          {uploading ? 'Saving...' : 'Upload File'}
        </Button>
      </UploadCard>

      <Dialog open={openConfirmDialog} onClose={() => setOpenConfirmDialog(false)}>
        <DialogTitle>Replace existing file?</DialogTitle>
        <DialogContent>
          <Typography>
            A file named "{existingFileData?.name}" already exists at this path. Do you want to replace it?
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