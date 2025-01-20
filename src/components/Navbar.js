import React from 'react';
import { styled } from '@mui/material/styles';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  IconButton,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
} from '@mui/icons-material';
import { Link, useLocation } from 'react-router-dom';

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'white',
  boxShadow: theme.shadows[1],
}));

const LogoContainer = styled(Link)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  textDecoration: 'none',
  color: theme.palette.primary.main,
  '&:hover': {
    textDecoration: 'none',
  },
}));

const Logo = styled('img')(({ theme }) => ({
  width: 32,
  height: 'auto',
  marginRight: theme.spacing(1),
}));

const NavButton = styled(Button)(({ theme, active }) => ({
  marginLeft: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(1, 3),
  ...(active && {
    backgroundColor: theme.palette.primary.main,
    color: 'white',
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
}));

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    { path: '/upload', label: 'Upload File' },
    { path: '/files', label: 'My Files' },
  ];

  return (
    <StyledAppBar position="fixed">
      <Container maxWidth="lg">
        <Toolbar disableGutters>
        <LogoContainer to="/" sx={{ display: 'flex', alignItems: 'center', textDecoration: 'none', userSelect: 'none' }}>
          <Logo
            src="/logo512.png"
            alt="Storify Logo"
            sx={{
              width: 40,
              height: 'auto',
              marginRight: 1,
            }}
          />
          <Typography
            variant="h6"
            sx={{
              fontWeight: 500,
              fontFamily: '"Poppins", sans-serif',
              fontSize: { xs: '1.5rem', sm: '2rem' },
              letterSpacing: 2,
              color: 'primary.main',
              textTransform: 'uppercase',
              textShadow: '2px 2px 5px rgba(0, 0, 0, 0.3)',
            }}
          >
            Storify
          </Typography>
        </LogoContainer>

        <Box sx={{ flexGrow: 1 }} />
          {isMobile ? (
            <>
              <IconButton
                size="large"
                edge="end"
                color="primary"
                aria-label="menu"
                onClick={handleMenu}
              >
                <MenuIcon />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
              >
                {navigationItems.map((item) => (
                  <MenuItem
                    key={item.path}
                    component={Link}
                    to={item.path}
                    onClick={handleClose}
                    selected={isActive(item.path)}
                  >
                    {item.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {navigationItems.map((item) => (
                <NavButton
                  key={item.path}
                  component={Link}
                  to={item.path}
                  variant={isActive(item.path) ? "contained" : "text"}
                  color="primary"
                  active={isActive(item.path)}
                >
                  {item.label}
                </NavButton>
              ))}
            </Box>
          )}
        </Toolbar>
      </Container>
    </StyledAppBar>
  );
};

export default Navbar;