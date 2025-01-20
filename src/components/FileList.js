import React, { useState, useMemo } from 'react';
import { styled } from '@mui/material/styles';
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
  Chip,
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

const StyledCard = styled(Card)(({ theme }) => ({
  boxShadow: '0 4px 20px rgba(108, 99, 255, 0.1)',
}));

const ListHeader = styled('div')(({ theme }) => ({
  padding: theme.spacing(3),
  borderBottom: `1px solid ${theme.palette.divider}`,
  backgroundColor: 'rgba(108, 99, 255, 0.02)',
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  marginBottom: theme.spacing(1),
  '&:hover': {
    backgroundColor: 'rgba(108, 99, 255, 0.05)',
  },
}));

const SearchBar = styled(TextField)(({ theme }) => ({
  marginBottom: theme.spacing(2),
}));

const FileList = () => {
  const { files, deleteFile, downloadFile } = useFiles();
  const [selectedFile, setSelectedFile] = useState(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');

  const getFileIcon = (fileType) => {
    switch (fileType) {
      case 'image':
        return <Image color="primary" />;
      case 'pdf':
        return <PictureAsPdf color="error" />;
      case 'video':
        return <VideoLibrary color="secondary" />;
      case 'word':
        return <Description color="primary" />;
      case 'excel':
        return <TableChart color="success" />;
      default:
        return <InsertDriveFile color="primary" />;
    }
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
          default: // date
            return direction * (new Date(b.uploadDate) - new Date(a.uploadDate));
        }
      });
  }, [files, searchTerm, sortBy, sortDirection]);

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

  const confirmDelete = () => {
    try {
      deleteFile(selectedFile.id);
      setOpenDeleteDialog(false);
      showSnackbar('File deleted successfully', 'success');
    } catch (error) {
      showSnackbar('Error deleting file', 'error');
    }
  };

  const handleDownload = async () => {
    const success = await downloadFile(selectedFile);
    if (success) {
      showSnackbar('Download started successfully', 'success');
    } else {
      showSnackbar('Error downloading file', 'error');
    }
    handleMenuClose();
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setOpenSnackbar(true);
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

  return (
    <Container sx={{ mt: 10, p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3 
      }}>
        <Typography variant="h4" color="primary">
          My Files
        </Typography>
        <Link to="/upload" style={{ textDecoration: 'none' }}>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
          >
            Upload New File
          </Button>
        </Link>
      </Box>

      <StyledCard>
        <ListHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">Recent Files</Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <SearchBar
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
              <Button
                startIcon={<SortIcon />}
                onClick={() => {
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                }}
              >
                Sort
              </Button>
            </Box>
          </Box>
        </ListHeader>

        {filteredAndSortedFiles.length > 0 ? (
          <List sx={{ p: 2 }}>
            {filteredAndSortedFiles.map((file) => (
              <StyledListItem key={file.id}>
                <ListItemIcon>
                  {getFileIcon(file.icon)}
                </ListItemIcon>

                <ListItemText
                  primary={file.name}
                  secondary={
                    <>
                      {file.path}
                      <br />
                      <Typography variant="caption" color="text.secondary">
                        {file.size} • Updated {formatDate(file.uploadDate)}
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
              </StyledListItem>
            ))}
          </List>
        ) : (
          <Box sx={{ 
            textAlign: 'center', 
            p: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2
          }}>
            <InsertDriveFile 
              sx={{ 
                fontSize: 48, 
                color: 'text.secondary',
                opacity: 0.5
              }} 
            />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              {searchTerm ? 'No files found' : 'No files uploaded yet'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try different search terms' : 'Start by uploading your first file'}
            </Typography>
            {!searchTerm && (
              <Link to="/upload" style={{ textDecoration: 'none' }}>
                <Button
                  variant="outlined"
                  color="primary"
                  startIcon={<AddIcon />}
                  sx={{ mt: 2 }}
                >
                  Upload File
                </Button>
              </Link>
            )}
          </Box>
        )}
      </StyledCard>

      {/* Menu Actions */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleDownload}>
          <GetApp sx={{ mr: 1 }} /> Download
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <Delete sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Dialog Confirmation */}
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

      {/* Feedback Alert */}
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
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default FileList;