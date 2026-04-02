import React from 'react';
import { Link } from 'react-router-dom';
import { CloudUpload, FolderOpen } from '@mui/icons-material';
import { Button, Typography, Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useFiles } from '../context/FileContext';
import '../styles/styles.css';

const Dashboard = () => {
  const { files } = useFiles();
  const theme = useTheme();

  const recentFiles = files.slice(0, 3);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(45deg, #f8f9fe 0%, #ffffff 100%)',
        textAlign: 'center',
        padding: theme.spacing(4),
      }}
    >
      <Box sx={{ maxWidth: 760 }}>
        <Typography variant="h1" sx={{ marginBottom: theme.spacing(2) }}>
          Welcome to Storify
        </Typography>

        <Typography variant="h2" sx={{ marginBottom: theme.spacing(2) }}>
          Upload, organize and download files — all in your browser.
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          {files.length === 0
            ? 'No files saved yet. Upload one to try the experience.'
            : `You have ${files.length} file${files.length !== 1 ? 's' : ''} saved in this demo.`}
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          <Link to="/upload" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary" startIcon={<CloudUpload />}>
              Start Uploading
            </Button>
          </Link>

          <Link to="/files" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" color="primary" startIcon={<FolderOpen />}>
              View My Files
            </Button>
          </Link>
        </Stack>

        {recentFiles.length > 0 && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" color="primary" sx={{ mb: 2 }}>
              Recent Files
            </Typography>

            {recentFiles.map((file) => (
              <Box
                key={file.id}
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 2,
                  padding: '12px 16px',
                  marginBottom: 1,
                  borderRadius: '12px',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
                  textAlign: 'left',
                }}
              >
                <span>{file.name}</span>
                <span style={{ color: '#718096' }}>{file.formattedSize}</span>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;