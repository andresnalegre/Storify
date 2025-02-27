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
  const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
  const [existingFileData, setExistingFileData] = useState(null);

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
      setError('File size exceeds 100MB limit');
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

  const handleUploadSuccess = (data) => {
    setProgress(100);
    setUploadComplete(true);
    setOpenSnackbar(true);

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

      const response = await fetch('http://localhost:8000/getFiles.php', {
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
    } finally {
      setUploading(false);
    }
  };

  const handleConfirmReplace = async () => {
    setOpenConfirmDialog(false);
    await handleUpload(true);
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
          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xlsx,.xls,.csv"
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
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
              Maximum file size: 100MB
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
          onClick={() => handleUpload(false)}
          disabled={!file || !urlPath || uploading}
          startIcon={<CloudUpload />}
          sx={{ mt: 3, px: 4, py: 1.5 }}
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