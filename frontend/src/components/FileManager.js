import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
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
import Notifications from './Notifications';
import '../styles/styles.css';

const FileManager = () => {
  const { files, setFiles } = useFiles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [loading, setLoading] = useState(true);

  const notificationsRef = useRef();

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/fileManager.php', {
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
      if (notificationsRef.current) {
        notificationsRef.current.showSnackbar('Error loading files. Please try again.', 'error');
      }
    } finally {
      setLoading(false);
    }
  }, [setFiles]);

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
      const response = await fetch('http://localhost:8000/fileManager.php', {
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
        if (notificationsRef.current) {
          notificationsRef.current.showSnackbar('File deleted successfully.', 'success');
        }
      } else {
        throw new Error(data.error || 'Failed to delete file');
      }
    } catch (error) {
      console.error('Delete error:', error);
      if (notificationsRef.current) {
        notificationsRef.current.showSnackbar('Error deleting file. Please try again.', 'error');
      }
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(`http://localhost:8000/fileManager.php?download=true&id=${selectedFile.id}`, {
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
      
      if (notificationsRef.current) {
        notificationsRef.current.showSnackbar('Download started successfully.', 'success');
      }
    } catch (error) {
      console.error('Download error:', error);
      if (notificationsRef.current) {
        notificationsRef.current.showSnackbar('Error downloading file. Please try again.', 'error');
      }
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
      <Container className="file-manager-loading-container">
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container className="file-manager-container">
      <Box className="file-manager-header-box">
        <Typography variant="h4" color="primary">
          My Files
        </Typography>
        <Link to="/upload" className="file-manager-no-decoration">
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Upload New File
          </Button>
        </Link>
      </Box>

      <Card className="file-manager-styled-card">
        <div className="file-manager-list-header">
          <div className="file-manager-list-header-content">
            <Typography variant="h6">Recent Files</Typography>
            <div className="file-manager-search-controls">
              <TextField
                className="file-manager-search-bar"
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
              <div className="file-manager-sort-buttons">
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
          <List className="file-manager-file-list">
            {filteredAndSortedFiles.map((file) => (
              <ListItem key={file.id} className="file-manager-list-item">
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
          <div className="file-manager-empty-state">
            <InsertDriveFile className="file-manager-empty-state-icon" />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No files found.' : "You haven't uploaded any files yet."}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try different search terms.' : 'Start uploading your first file!'}
            </Typography>
            {!searchTerm && (
              <Link to="/upload" className="file-manager-no-decoration">
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  className="file-manager-upload-button"
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
          <GetApp className="file-manager-menu-icon" /> Download
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete className="file-manager-menu-icon" /> Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{selectedFile?.name}"? This action is irreversible.
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

      <Notifications ref={notificationsRef} />
    </Container>
  );
};

export default FileManager;