import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import '../styles/styles.css';

const Footer = () => {
  return (
    <Box className="footer-container">
      <Container maxWidth="lg" className="footer-content">
        <Typography variant="body2" className="footer-text">
          © 2025 Storify. All rights reserved.
        </Typography>
      </Container>
    </Box>
  );
};

export default Footer;