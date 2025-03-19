import React from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { Info, Code, Update } from '@mui/icons-material';
import '../styles/styles.css';

const About = () => {
  return (
    <Box className="container">
      <Container maxWidth="md">
        <Paper elevation={3} className="paper">
          <Box className="header">
            <Info className="infoIcon" />
            <Typography variant="h4" component="h1" color="primary">
              About Storify
            </Typography>
          </Box>

          <Typography variant="body1" paragraph className="typography">
            Storify is a platform that allows you to upload, download, and access your files easily.
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Code color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="IT Switch Career Final Project" 
                secondary="This project showcases the skills and knowledge using React for the frontend, PHP for the backend, and MariaDB as the database."
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Update color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Version" 
                secondary="1.0.0"
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default About;