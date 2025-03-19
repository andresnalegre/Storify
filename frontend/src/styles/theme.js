import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  typography: {
    fontFamily: 'Poppins, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 'bold',
      color: '#6C63FF',
    },
    h2: {
      fontSize: '1.1rem',
      color: '#718096',
    },
  },
  palette: {
    primary: {
      main: '#6C63FF',
    },
    secondary: {
      main: '#718096',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          margin: '8px',
          borderRadius: '8px',
          padding: '1rem 3rem',
          fontSize: '1.1rem',
        },
      },
    },
  },
});

export default theme;