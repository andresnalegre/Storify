import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Container,
  Card,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Alert,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  CircularProgress,
} from '@mui/material';
import {
  InsertDriveFile,
  Image,
  PictureAsPdf,
  VideoLibrary,
  Description,
  TableChart,
  GetApp,
  Delete,
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Sort as SortIcon,
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import '../styles/theme.css';

const FileList = () => {
  const { files, setFiles } = useFiles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);

  const showSnackbar = useCallback((message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
  }, []);

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/getFiles.php', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        const uniqueFiles = Array.from(
          new Map(data.files.map(file => [`${file.name}-${file.path}`, file])).values()
        );
        
        setFiles(uniqueFiles.map(file => ({
          ...file,
          size: parseInt(file.size, 10)
        })));
      } else {
        throw new Error(data.error || 'Failed to load files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      showSnackbar('Error loading files: ' + error.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [setFiles, showSnackbar]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const fileIcons = {
    image: <Image color="primary" />,
    pdf: <PictureAsPdf color="error" />,
    video: <VideoLibrary color="secondary" />,
    word: <Description color="primary" />,
    excel: <TableChart color="success" />,
    default: <InsertDriveFile color="primary" />,
  };

  const getFileIcon = (fileType) => {
    if (!fileType) return fileIcons.default;
    
    const type = fileType.toLowerCase();
    if (type.includes('image')) return fileIcons.image;
    if (type.includes('pdf')) return fileIcons.pdf;
    if (type.includes('video')) return fileIcons.video;
    if (type.includes('word') || type.includes('document')) return fileIcons.word;
    if (type.includes('sheet') || type.includes('excel')) return fileIcons.excel;
    return fileIcons.default;
  };

  const filteredAndSortedFiles = useMemo(() => {
    return files
      .filter(file => 
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.path.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const direction = sortDirection === 'asc' ? 1 : -1;
        switch (sortBy) {
          case 'name':
            return direction * a.name.localeCompare(b.name);
          case 'size':
            return direction * (parseInt(a.size) - parseInt(b.size));
          default:
            return direction * (new Date(b.uploadDate) - new Date(a.uploadDate));
        }
      });
  }, [files, searchTerm, sortBy, sortDirection]);

  const handleSort = (newSortBy) => {
    if (sortBy === newSortBy) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortDirection('asc');
    }
  };

  const handleMenuClick = (event, file) => {
    setAnchorEl(event.currentTarget);
    setSelectedFile(file);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDelete = () => {
    setOpenDeleteDialog(true);
    handleMenuClose();
  };

  const confirmDelete = async () => {
    try {
      const response = await fetch('http://localhost:8000/getFiles.php', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: selectedFile.id })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setFiles(prevFiles => prevFiles.filter(file => file.id !== selectedFile.id));
        setOpenDeleteDialog(false);
        showSnackbar('File deleted successfully', 'success');
      } else {
        throw new Error(data.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      showSnackbar('Error deleting file: ' + error.message, 'error');
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:8000/getFiles.php?download=true&id=${selectedFile.id}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = selectedFile.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      showSnackbar('Download started successfully', 'success');
    } catch (error) {
      console.error('Download error:', error);
      showSnackbar('Error downloading file: ' + error.message, 'error');
    }
    handleMenuClose();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className="file-list-container">
      <Box className="header-box">
        <Typography variant="h4" color="primary">
          My Files
        </Typography>
        <Link to="/upload" className="no-decoration">
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Upload New File
          </Button>
        </Link>
      </Box>

      <Card className="styled-card">
        <div className="list-header">
          <div className="list-header-content">
            <Typography variant="h6">Recent Files</Typography>
            <div className="search-controls">
              <TextField
                className="search-bar"
                size="small"
                variant="outlined"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              <div className="sort-buttons">
                <Button
                  size="small"
                  onClick={() => handleSort('name')}
                  startIcon={<SortIcon />}
                >
                  Name {sortBy === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
                <Button
                  size="small"
                  onClick={() => handleSort('date')}
                  startIcon={<SortIcon />}
                >
                  Date {sortBy === 'date' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
                <Button
                  size="small"
                  onClick={() => handleSort('size')}
                  startIcon={<SortIcon />}
                >
                  Size {sortBy === 'size' && (sortDirection === 'asc' ? '↑' : '↓')}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {filteredAndSortedFiles.length > 0 ? (
          <List className="file-list">
            {filteredAndSortedFiles.map((file) => (
              <ListItem key={file.id} className="list-item">
                <ListItemIcon>
                  {getFileIcon(file.type)}
                </ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <>
                      {file.path}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.size)} • Updated {formatDate(file.uploadDate)}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuClick(e, file)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        ) : (
          <div className="empty-state">
            <InsertDriveFile className="empty-state-icon" />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No files found' : 'No files uploaded yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try different search terms' : 'Start by uploading your first file'}
            </Typography>
            {!searchTerm && (
              <Link to="/upload" className="no-decoration">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  className="upload-button"
                >
                  Upload File
                </Button>
              </Link>
            )}
          </div>
        )}
      </Card>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDownload}>
          <GetApp className="menu-icon" /> Download
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete className="menu-icon" /> Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{selectedFile?.name}"?
          This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDeleteDialog(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={openSnackbar}
        autoHideDuration={4000}
        onClose={() => setOpenSnackbar(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setOpenSnackbar(false)} 
          severity={snackbarSeverity}
          variant="filled"
          className="alert"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FileList;