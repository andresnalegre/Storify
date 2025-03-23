import React from 'react';
import { Container, Typography, Paper, Box, List, ListItem, ListItemIcon, ListItemText, Link } from '@mui/material';
import { Code, Update, GitHub } from '@mui/icons-material';
import '../styles/styles.css';

const About = () => {
  return (
    <Box className="aboutContainer">
      <Container maxWidth="sm" className="aboutContentContainer">
        <Paper elevation={3} className="aboutPaper">
          <Box className="aboutTitleBox">
            <Typography variant="h4" component="h1" color="primary">
              About Storify
            </Typography>
          </Box>

          <Typography variant="body1" paragraph className="aboutSubtitle">
            Storify is a platform that allows you to upload, download, and access your files easily.
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Code color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="IT Career Switch Project" 
                secondary="Final Project"
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

            <ListItem>
              <ListItemIcon>
                <GitHub color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary={
                  <span>
                    Developed by{' '}
                    <Link href="https://github.com/andresnalegre" target="_blank" rel="noopener noreferrer" color="primary">
                      Andres Nicolas
                    </Link>
                  </span>
                }
              />
            </ListItem>
          </List>
        </Paper>
      </Container>
    </Box>
  );
};

export default About;