import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { theme } from './theme/theme';
import { FileProvider } from './context/FileContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <FileProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<FileUpload />} />
            <Route path="/files" element={<FileList />} />
          </Routes>
        </Router>
      </FileProvider>
    </ThemeProvider>
  );
}

export default App;