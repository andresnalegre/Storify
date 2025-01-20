import React from 'react';
import { styled } from '@mui/material/styles';
import { Typography, Button, Container, Box } from '@mui/material';
import { CloudUpload } from '@mui/icons-material';
import { Link } from 'react-router-dom';

const HeroContainer = styled('div')(({ theme }) => ({
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  background: `linear-gradient(45deg, ${theme.palette.background.default} 0%, #ffffff 100%)`,
}));

const Home = () => {
  return (
    <HeroContainer>
      <Container maxWidth="md" sx={{ textAlign: 'center', py: 4 }}>
        <Typography 
          variant="h2" 
          color="primary" 
          sx={{ 
            fontWeight: 700,
            mb: 2 
          }}
        >
          Welcome to Storify
        </Typography>
        
        <Typography 
          variant="h5" 
          color="text.secondary"
          sx={{ 
            mb: 4,
            maxWidth: 600,
            mx: 'auto' 
          }}
        >
          Your smart file storage solution. Upload, organize, and access your files from anywhere.
        </Typography>

        <Link to="/upload" style={{ textDecoration: 'none' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            startIcon={<CloudUpload sx={{ fontSize: '1.5rem' }} />}
            sx={{ 
              py: 2,
              px: 6,
              fontSize: '1.1rem'
            }}
          >
            Start Uploading
          </Button>
        </Link>
      </Container>
    </HeroContainer>
  );
};

export default Home;