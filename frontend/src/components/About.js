import React from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Link,
} from '@mui/material';
import {
  Code,
  Update,
  GitHub,
  Storage,
  Language,
} from '@mui/icons-material';
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
            Storify is a file manager demo focused on UI/UX, allowing users to
            upload, organize, download and delete files directly in the browser.
          </Typography>

          <List>
            <ListItem>
              <ListItemIcon>
                <Code color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Stack"
                secondary="React + Material UI + React Router"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Storage color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Storage"
                secondary="localStorage (demo mode, no backend)"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Language color="primary" />
              </ListItemIcon>
              <ListItemText
                primary="Deploy"
                secondary="Hosted as a static site"
              />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <Update color="primary" />
              </ListItemIcon>
              <ListItemText primary="Version" secondary="2.0.0-demo" />
            </ListItem>

            <ListItem>
              <ListItemIcon>
                <GitHub color="primary" />
              </ListItemIcon>
              <ListItemText
                primary={
                  <span>
                    Developed by{' '}
                    <Link
                      href="https://github.com/andresnalegre"
                      target="_blank"
                      rel="noopener noreferrer"
                      color="primary"
                    >
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