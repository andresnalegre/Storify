import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CloudUpload } from '@mui/icons-material';
import { Button, Typography, Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import '../styles/styles.css';

const Dashboard = () => {
  const [files] = useState([]);
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
      <Box>
        <Typography variant="h1" sx={{ marginBottom: theme.spacing(2) }}>
          Welcome to Storify
        </Typography>
        <Typography variant="h2" sx={{ marginBottom: theme.spacing(4) }}>
          {files.length === 0 
            ? "Upload, organize and access your files from anywhere." 
            : `You have ${files.length} file${files.length !== 1 ? 's' : ''} uploaded`}
        </Typography>
        <Link to="/upload" style={{ textDecoration: 'none' }}>
          <Button variant="contained" color="primary" startIcon={<CloudUpload />}>
            Start Uploading
          </Button>
        </Link>
        {files.length > 0 && (
          <Box sx={{ marginTop: theme.spacing(4) }}>
            {files.map(file => (
              <Box key={file.id} sx={{ display: 'flex', justifyContent: 'center', marginBottom: theme.spacing(1) }}>
                <span>{file.name}</span>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Dashboard;