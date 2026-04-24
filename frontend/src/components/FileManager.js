import React, { useState, useMemo, useRef } from 'react';
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
} from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { useFiles } from '../context/FileContext';
import Notifications from './Notifications';
import '../styles/styles.css';

const FileManager = () => {
  const { files, loading, deleteFile, downloadFile } = useFiles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const notificationsRef = useRef();

  const fileIcons = {
    image: <Image color="primary" />,
    pdf: <PictureAsPdf color="error" />,
    video: <VideoLibrary color="secondary" />,
    word: <Description color="primary" />,
    excel: <TableChart color="success" />,
    default: <InsertDriveFile color="primary" />,
  };

  const getFileIcon = (fileType = '') => {
    const type = fileType.toLowerCase();
    if (type.includes('image')) return fileIcons.image;
    if (type.includes('pdf')) return fileIcons.pdf;
    if (type.includes('video')) return fileIcons.video;
    if (type.includes('word') || type.includes('document')) return fileIcons.word;
    if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) return fileIcons.excel;
    return fileIcons.default;
  };

  const filteredFiles = useMemo(() => {
    return files.filter(
      (file) =>
        file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        file.path.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [files, searchTerm]);

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
    if (!selectedFile) return;
    const result = await deleteFile(selectedFile.id);
    if (result.success) {
      setOpenDeleteDialog(false);
      notificationsRef.current?.showSnackbar('File deleted successfully.', 'success');
    } else {
      notificationsRef.current?.showSnackbar(result.error, 'error');
    }
  };

  const handleDownload = async () => {
    if (!selectedFile) return;
    const result = await downloadFile(selectedFile);
    if (result.success) {
      notificationsRef.current?.showSnackbar('Download started.', 'success');
    } else {
      notificationsRef.current?.showSnackbar(result.error, 'error');
    }
    handleMenuClose();
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
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
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" color="primary">
          Files
        </Typography>
        <Link to="/upload" className="file-manager-no-decoration">
          <Button variant="contained" color="primary" startIcon={<AddIcon />}>
            Upload New File
          </Button>
        </Link>
      </Box>

      <Card className="file-manager-styled-card">
        <div className="file-manager-list-header">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6">Shared Files</Typography>
            <TextField
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
          </Box>
        </div>

        {filteredFiles.length > 0 ? (
          <List className="file-manager-file-list">
            {filteredFiles.map((file) => (
              <ListItem key={file.id} className="file-manager-list-item">
                <ListItemIcon>{getFileIcon(file.type)}</ListItemIcon>
                <ListItemText
                  primary={file.name}
                  secondary={
                    <>
                      {file.path}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {formatFileSize(file.size)} • Updated on {formatDate(file.uploadDate)}
                      </Typography>
                    </>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" onClick={(e) => handleMenuClick(e, file)}>
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
              {searchTerm ? 'No files found.' : 'Nobody has uploaded any files yet.'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try a different search term.' : 'Start by uploading your first file.'}
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

      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
        <MenuItem onClick={handleDownload}>
          <GetApp className="file-manager-menu-icon" /> Download
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete className="file-manager-menu-icon" /> Delete
        </MenuItem>
      </Menu>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete File</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{selectedFile?.name}"?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Notifications ref={notificationsRef} />
    </Container>
  );
};

export default FileManager;