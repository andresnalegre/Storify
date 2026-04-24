import React from 'react';
import { Link } from 'react-router-dom';
import { CloudUpload, FolderOpen } from '@mui/icons-material';
import { Button, Typography, Box, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import '../styles/styles.css';

const Dashboard = () => {
  const theme = useTheme();

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
          Built for sharing files.
        </Typography>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          justifyContent="center"
          sx={{ mb: 4 }}
        >
          <Link to="/upload" style={{ textDecoration: 'none' }}>
            <Button variant="contained" color="primary" startIcon={<CloudUpload />}>
              Upload File
            </Button>
          </Link>

          <Link to="/files" style={{ textDecoration: 'none' }}>
            <Button variant="outlined" color="primary" startIcon={<FolderOpen />}>
              View Files
            </Button>
          </Link>
        </Stack>
      </Box>
    </Box>
  );
};

export default Dashboard;